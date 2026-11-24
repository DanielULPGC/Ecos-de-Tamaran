import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Hash,
  Lightbulb,
  Puzzle,
  RotateCcw,
  Shuffle,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  CharacterReactionId,
  CycleId,
  ExplorerProfile,
  RoomId,
} from '../types/game';
import { ROOMS_DATA } from '../data/roomsData';
import { CHARACTER_REACTION_META } from '../data/characterReactions';
import { ExplorerReactionAvatar } from './ExplorerReactionAvatar';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';

interface PicturePuzzleModalProps {
  initialRoomId: RoomId;
  cycle: CycleId;
  explorer: ExplorerProfile;
  solvedRooms: RoomId[];
  muted: boolean;
  onReaction?: (reaction: CharacterReactionId, line?: string) => void;
  onSolvedRoom: (roomId: RoomId) => void;
  onClose: () => void;
}

type PuzzleMode = 'swap' | 'slide';
type GridPresetId = '3x2' | '3x3' | '4x3';

interface GridPreset {
  id: GridPresetId;
  label: string;
  cols: number;
  rows: number;
}

const GRID_PRESETS: GridPreset[] = [
  { id: '3x2', label: 'Fácil · 6 piezas', cols: 3, rows: 2 },
  { id: '3x3', label: 'Medio · 9 piezas', cols: 3, rows: 3 },
  { id: '4x3', label: 'Desafío · 12 piezas', cols: 4, rows: 3 },
];

const MURAL_CURIOSITIES: Record<RoomId, string> = {
  aborigenes:
    'En la Cueva Pintada de Gáldar, los antiguos canarii decoraron los muros con frisos geométricos de barro rojo, blanco y negro que aún se conservan hoy.',
  conquista:
    'El Real de Las Palmas nació en 1478 junto a la desembocadura del barranco de Guiniguada, origen del actual barrio histórico de Vegueta.',
  pirateria:
    'El Castillo de San Cristóbal y el Castillo de la Luz protegieron la costa de Gran Canaria durante siglos frente a ataques corsarios en el Atlántico.',
  sigloXX:
    'El Puerto de La Luz convirtió a Gran Canaria en un gran puente entre Europa, África y América, y desde sus muelles partieron muchas familias hacia Cuba y Venezuela.',
};

function isBoardSolved(tiles: number[]): boolean {
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] !== i) return false;
  }
  return true;
}

function getAdjacentIndices(index: number, cols: number, rows: number): number[] {
  const r = Math.floor(index / cols);
  const c = index % cols;
  const neighbors: number[] = [];
  if (r > 0) neighbors.push((r - 1) * cols + c);
  if (r < rows - 1) neighbors.push((r + 1) * cols + c);
  if (c > 0) neighbors.push(r * cols + (c - 1));
  if (c < cols - 1) neighbors.push(r * cols + (c + 1));
  return neighbors;
}

function generateShuffledBoard(
  cols: number,
  rows: number,
  mode: PuzzleMode
): number[] {
  const total = cols * rows;
  const solved = Array.from({ length: total }, (_, i) => i);

  if (mode === 'swap') {
    const arr = [...solved];
    for (let attempt = 0; attempt < 6; attempt++) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      // Ensure at least half the pieces are out of place so it's fun to solve
      const misplaced = arr.filter((val, idx) => val !== idx).length;
      if (misplaced >= Math.max(3, Math.floor(total * 0.6))) {
        return arr;
      }
    }
    // Guarantee non-solved fallback
    if (isBoardSolved(arr)) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    return arr;
  }

  // Sliding puzzle: perform valid random moves from solved state -> 100% guaranteed solvable!
  const arr = [...solved];
  const emptyValue = total - 1;
  let emptyIdx = total - 1;
  let prevEmptyIdx = -1;
  const steps = total * 7;

  for (let s = 0; s < steps; s++) {
    const neighbors = getAdjacentIndices(emptyIdx, cols, rows).filter(
      (n) => n !== prevEmptyIdx
    );
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    arr[emptyIdx] = arr[pick];
    arr[pick] = emptyValue;
    prevEmptyIdx = emptyIdx;
    emptyIdx = pick;
  }

  if (isBoardSolved(arr)) {
    const neighbors = getAdjacentIndices(emptyIdx, cols, rows);
    const pick = neighbors[0];
    arr[emptyIdx] = arr[pick];
    arr[pick] = emptyValue;
  }

  return arr;
}

export const PicturePuzzleModal: React.FC<PicturePuzzleModalProps> = ({
  initialRoomId,
  cycle,
  explorer,
  solvedRooms,
  muted,
  onReaction,
  onSolvedRoom,
  onClose,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<RoomId>(initialRoomId);
  const [mode, setMode] = useState<PuzzleMode>('swap');
  const [presetId, setPresetId] = useState<GridPresetId>(() =>
    cycle === 'ciclo2' ? '3x2' : '3x3'
  );
  const [showGuide, setShowGuide] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [dragFromSlot, setDragFromSlot] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [justSolved, setJustSolved] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [avatarReaction, setAvatarReaction] = useState<CharacterReactionId>(
    'concentrado'
  );
  const [reactionPulse, setReactionPulse] = useState<number>(0);

  const triggerReaction = useCallback(
    (next: CharacterReactionId) => {
      setAvatarReaction(next);
      setReactionPulse((k) => k + 1);
      onReaction?.(next);
    },
    [onReaction]
  );

  const preset = useMemo(
    () => GRID_PRESETS.find((p) => p.id === presetId) ?? GRID_PRESETS[0],
    [presetId]
  );

  const activeRoom = useMemo(
    () => ROOMS_DATA.find((r) => r.id === selectedRoomId) ?? ROOMS_DATA[0],
    [selectedRoomId]
  );

  const [board, setBoard] = useState<number[]>(() =>
    generateShuffledBoard(
      cycle === 'ciclo2' ? 3 : 3,
      cycle === 'ciclo2' ? 2 : 3,
      'swap'
    )
  );

  const speechAvailable = isSpeechSupported();
  const totalTiles = preset.cols * preset.rows;
  const emptyValue = totalTiles - 1;

  const resetPuzzle = useCallback(
    (nextCols: number, nextRows: number, nextMode: PuzzleMode) => {
      setBoard(generateShuffledBoard(nextCols, nextRows, nextMode));
      setSelectedSlot(null);
      setDragFromSlot(null);
      setMoves(0);
      setJustSolved(false);
    },
    []
  );

  const handleSelectRoom = (roomId: RoomId) => {
    if (roomId === selectedRoomId) return;
    soundEngine.playClick();
    setSelectedRoomId(roomId);
    setImgFailed(false);
    resetPuzzle(preset.cols, preset.rows, mode);
  };

  const handleSelectMode = (nextMode: PuzzleMode) => {
    if (nextMode === mode) return;
    soundEngine.playClick();
    setMode(nextMode);
    resetPuzzle(preset.cols, preset.rows, nextMode);
  };

  const handleSelectPreset = (nextPreset: GridPreset) => {
    if (nextPreset.id === presetId) return;
    soundEngine.playClick();
    setPresetId(nextPreset.id);
    resetPuzzle(nextPreset.cols, nextPreset.rows, mode);
  };

  const finishMove = useCallback(
    (nextBoard: number[], placedCorrectly: boolean) => {
      setBoard(nextBoard);
      setMoves((m) => m + 1);
      if (isBoardSolved(nextBoard)) {
        setJustSolved(true);
        setSelectedSlot(null);
        soundEngine.playSuccess();
        triggerReaction('alegria');
        onSolvedRoom(selectedRoomId);
      } else if (placedCorrectly) {
        soundEngine.playDiscover();
        triggerReaction('sorpresa');
      } else {
        soundEngine.playStep();
        setAvatarReaction('concentrado');
      }
    },
    [onSolvedRoom, selectedRoomId, triggerReaction]
  );

  const handleSlotActivate = useCallback(
    (slotIndex: number) => {
      if (justSolved) return;

      if (mode === 'swap') {
        if (selectedSlot === null) {
          soundEngine.playClick();
          setSelectedSlot(slotIndex);
          return;
        }
        if (selectedSlot === slotIndex) {
          setSelectedSlot(null);
          return;
        }

        const next = [...board];
        [next[selectedSlot], next[slotIndex]] = [
          next[slotIndex],
          next[selectedSlot],
        ];
        const placedCorrectly =
          next[slotIndex] === slotIndex || next[selectedSlot] === selectedSlot;
        setSelectedSlot(null);
        finishMove(next, placedCorrectly);
      } else {
        // Sliding puzzle
        const emptySlot = board.indexOf(emptyValue);
        if (slotIndex === emptySlot) return;
        const neighbors = getAdjacentIndices(
          emptySlot,
          preset.cols,
          preset.rows
        );
        if (!neighbors.includes(slotIndex)) {
          soundEngine.playGentleError();
          triggerReaction('animo');
          return;
        }
        const next = [...board];
        next[emptySlot] = next[slotIndex];
        next[slotIndex] = emptyValue;
        const placedCorrectly = next[emptySlot] === emptySlot;
        finishMove(next, placedCorrectly);
      }
    },
    [
      board,
      emptyValue,
      finishMove,
      justSolved,
      mode,
      preset.cols,
      preset.rows,
      selectedSlot,
      triggerReaction,
    ]
  );

  // Keyboard arrow support for sliding puzzle mode
  useEffect(() => {
    if (mode !== 'slide' || justSolved) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const emptyIdx = board.indexOf(emptyValue);
      const r = Math.floor(emptyIdx / preset.cols);
      const c = emptyIdx % preset.cols;
      let targetIdx: number | null = null;

      if (e.key === 'ArrowUp' && r < preset.rows - 1) {
        targetIdx = (r + 1) * preset.cols + c;
      } else if (e.key === 'ArrowDown' && r > 0) {
        targetIdx = (r - 1) * preset.cols + c;
      } else if (e.key === 'ArrowLeft' && c < preset.cols - 1) {
        targetIdx = r * preset.cols + (c + 1);
      } else if (e.key === 'ArrowRight' && c > 0) {
        targetIdx = r * preset.cols + (c - 1);
      }

      if (targetIdx !== null) {
        e.preventDefault();
        handleSlotActivate(targetIdx);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [board, emptyValue, handleSlotActivate, justSolved, mode, preset.cols, preset.rows]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const handlePlaceOnePieceHint = () => {
    if (justSolved) return;

    if (mode === 'swap') {
      const wrongSlot = board.findIndex((val, idx) => val !== idx);
      if (wrongSlot === -1) return;
      const correctTileCurrentSlot = board.indexOf(wrongSlot);
      const next = [...board];
      [next[wrongSlot], next[correctTileCurrentSlot]] = [
        next[correctTileCurrentSlot],
        next[wrongSlot],
      ];
      soundEngine.playPowerUp();
      setSelectedSlot(null);
      finishMove(next, true);
    } else {
      // In sliding mode, briefly flash the guide & numbers to help orient visually
      soundEngine.playPowerUp();
      setShowGuide(true);
      setShowNumbers(true);
    }
  };

  const handleDropOnSlot = (targetSlot: number) => {
    if (mode !== 'swap' || justSolved || dragFromSlot === null) return;
    if (dragFromSlot === targetSlot) {
      setDragFromSlot(null);
      return;
    }
    const next = [...board];
    [next[dragFromSlot], next[targetSlot]] = [
      next[targetSlot],
      next[dragFromSlot],
    ];
    const placedCorrectly =
      next[targetSlot] === targetSlot || next[dragFromSlot] === dragFromSlot;
    setDragFromSlot(null);
    setSelectedSlot(null);
    finishMove(next, placedCorrectly);
  };

  const correctCount = board.filter((val, idx) => val === idx).length;
  const isCurrentRoomPreviouslySolved = solvedRooms.includes(selectedRoomId);
  const nextUnsolvedRoom = ROOMS_DATA.find(
    (r) => r.id !== selectedRoomId && !solvedRooms.includes(r.id)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="picture-puzzle-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/88 p-3 sm:p-5"
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <ExplorerReactionAvatar
              explorerId={explorer.id}
              explorerName={explorer.name}
              reaction={avatarReaction}
              pulseKey={reactionPulse}
              size="sm"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-[#526071]">
                <span className="inline-flex items-center gap-1.5 font-bold text-[#8A5410]">
                  <Puzzle className="h-3.5 w-3.5 text-[#C67D1E]" aria-hidden="true" />
                  <span>Taller de Restauración Visual</span>
                </span>
                <span aria-hidden="true">·</span>
                <span
                  className={`font-bold ${CHARACTER_REACTION_META[avatarReaction].lightTextClass}`}
                >
                  {explorer.name}: {CHARACTER_REACTION_META[avatarReaction].label}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#1D4E89] tabular-nums">
                  {solvedRooms.length}/{ROOMS_DATA.length} murales
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  Movimientos: {moves}
                </span>
              </div>
              <h2
                id="picture-puzzle-title"
                className="mt-0.5 font-display text-xl font-bold text-[#171B21] sm:text-2xl truncate"
              >
                Puzle Histórico · {activeRoom.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {speechAvailable && (
              <button
                type="button"
                onClick={() =>
                  speakText(
                    mode === 'swap'
                      ? `Puzle de ${activeRoom.title}. Toca dos piezas o arrástralas para intercambiarlas hasta reconstruir el mural completo.`
                      : `Puzle deslizante de ${activeRoom.title}. Toca cualquier pieza junto al hueco libre para deslizarla hasta completar el mural.`,
                    muted
                  )
                }
                title="Escuchar instrucciones"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#232A34]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#1D4E89] hover:border-[#1D4E89] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Escuchar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar Taller de Puzles"
              className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] shrink-0 cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mural Selector + Mode & Difficulty Bar */}
        <div className="border-b border-[#232A34]/12 bg-[#EFECE4] px-5 py-3 sm:px-6 space-y-2.5">
          {/* 4 Historical Murals */}
          <div className="flex flex-wrap items-center gap-1.5">
            {ROOMS_DATA.map((room) => {
              const active = room.id === selectedRoomId;
              const restored = solvedRooms.includes(room.id);
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleSelectRoom(room.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#1D4E89] text-white'
                      : 'border border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#1D4E89]'
                  }`}
                >
                  <span className="font-mono tabular-nums">
                    Sala {room.number}
                  </span>
                  <span className="hidden md:inline">· {room.epoch}</span>
                  {restored && (
                    <CheckCircle2
                      className={`h-3.5 w-3.5 ${
                        active ? 'text-[#D8F3DC]' : 'text-[#2A6F4E]'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mode + Difficulty + Helpers */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <div
                role="tablist"
                aria-label="Modo de puzle"
                className="flex items-center gap-1 rounded-lg border border-[#232A34]/14 bg-[#E4E0D6] p-0.5"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'swap'}
                  onClick={() => handleSelectMode('swap')}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    mode === 'swap'
                      ? 'bg-white text-[#171B21] shadow-xs'
                      : 'text-[#4A5564] hover:text-[#171B21]'
                  }`}
                >
                  Intercambiar
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'slide'}
                  onClick={() => handleSelectMode('slide')}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    mode === 'slide'
                      ? 'bg-white text-[#171B21] shadow-xs'
                      : 'text-[#4A5564] hover:text-[#171B21]'
                  }`}
                >
                  Deslizante
                </button>
              </div>

              <div className="flex items-center gap-1">
                {GRID_PRESETS.map((p) => {
                  const active = p.id === presetId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#232A34] text-[#F5F3EE]'
                          : 'border border-[#232A34]/15 bg-white text-[#4A5564] hover:border-[#232A34]'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowGuide((prev) => !prev);
                }}
                aria-pressed={showGuide}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showGuide
                    ? 'border-[#1D4E89] bg-[#E8F0FA] text-[#1D4E89]'
                    : 'border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#1D4E89]'
                }`}
              >
                {showGuide ? (
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>Guía</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowNumbers((prev) => !prev);
                }}
                aria-pressed={showNumbers}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  showNumbers
                    ? 'border-[#1D4E89] bg-[#E8F0FA] text-[#1D4E89]'
                    : 'border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#1D4E89]'
                }`}
              >
                <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Números</span>
              </button>

              {!justSolved && (
                <button
                  type="button"
                  onClick={handlePlaceOnePieceHint}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#C67D1E]/55 bg-[#FAF4E8] px-2.5 py-1 text-xs font-bold text-[#8A5410] hover:bg-[#F5E8CC] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{mode === 'swap' ? 'Colocar 1 pieza' : 'Ayuda visual'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  resetPuzzle(preset.cols, preset.rows, mode);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-[#232A34]/15 bg-white px-2.5 py-1 text-xs font-bold text-[#333D4B] hover:border-[#232A34] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Mezclar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Workspace: Aspect-Locked Puzzle Board + Live Guidance */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 space-y-4">
          {/* Hidden preload img to detect image errors cleanly */}
          <img
            src={activeRoom.imagePath}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#4A5564]">
            <span>
              {justSolved
                ? '¡Mural restaurado por completo!'
                : mode === 'swap'
                ? selectedSlot !== null
                  ? 'Ahora toca otra pieza para intercambiar sus posiciones.'
                  : 'Toca dos piezas (o arrástralas) para intercambiarlas y reconstruir la escena.'
                : 'Toca cualquier pieza junto al espacio vacío (o usa las flechas del teclado) para deslizarla.'}
            </span>
            <span className="font-mono font-bold text-[#1D4E89] tabular-nums">
              {correctCount}/{totalTiles} piezas en su sitio
            </span>
          </div>

          {/* 16:9 Interactive Jigsaw Board */}
          <div className="mx-auto w-full max-w-3xl">
            <div
              className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-[#232A34]/20 bg-[#171B21] shadow-lg select-none"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${preset.cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${preset.rows}, minmax(0, 1fr))`,
                gap: justSolved ? '0px' : '3px',
                padding: justSolved ? '0px' : '3px',
              }}
            >
              {/* Optional translucent reference guide overlay */}
              {showGuide && !justSolved && !imgFailed && (
                <img
                  src={activeRoom.imagePath}
                  alt={`Guía de ${activeRoom.title}`}
                  referrerPolicy="no-referrer"
                  className="pointer-events-none absolute inset-0 z-20 h-full w-full object-cover opacity-35"
                />
              )}

              {board.map((tileValue, slotIdx) => {
                const isBlank = mode === 'slide' && !justSolved && tileValue === emptyValue;
                const isCorrect = tileValue === slotIdx;
                const isSelected = mode === 'swap' && selectedSlot === slotIdx;

                const origCol = tileValue % preset.cols;
                const origRow = Math.floor(tileValue / preset.cols);
                const bgPosX =
                  preset.cols > 1 ? (origCol / (preset.cols - 1)) * 100 : 0;
                const bgPosY =
                  preset.rows > 1 ? (origRow / (preset.rows - 1)) * 100 : 0;

                if (isBlank) {
                  return (
                    <div
                      key={`blank-${slotIdx}`}
                      aria-label="Hueco vacío"
                      className="flex items-center justify-center rounded-md border border-dashed border-[#F5F3EE]/25 bg-[#101318] text-[11px] font-mono text-[#7C8594]"
                    >
                      Hueco
                    </div>
                  );
                }

                return (
                  <button
                    key={`slot-${slotIdx}`}
                    type="button"
                    draggable={mode === 'swap' && !justSolved}
                    onDragStart={() => setDragFromSlot(slotIdx)}
                    onDragOver={(e) => {
                      if (mode === 'swap') e.preventDefault();
                    }}
                    onDrop={() => handleDropOnSlot(slotIdx)}
                    onDragEnd={() => setDragFromSlot(null)}
                    onClick={() => handleSlotActivate(slotIdx)}
                    aria-label={`Pieza ${tileValue + 1} en posición ${slotIdx + 1}${
                      isCorrect ? ', colocada correctamente' : ''
                    }`}
                    style={{
                      backgroundImage: imgFailed
                        ? activeRoom.fallbackGradient
                        : `url("${activeRoom.imagePath}")`,
                      backgroundSize: imgFailed
                        ? 'cover'
                        : `${preset.cols * 100}% ${preset.rows * 100}%`,
                      backgroundPosition: imgFailed
                        ? 'center'
                        : `${bgPosX}% ${bgPosY}%`,
                    }}
                    className={`relative overflow-hidden transition-transform duration-150 focus-visible:z-30 cursor-pointer ${
                      justSolved ? 'rounded-none' : 'rounded-md'
                    } ${
                      isSelected
                        ? 'z-20 ring-3 ring-[#E6A94F] scale-[0.97]'
                        : !justSolved && isCorrect
                        ? 'ring-2 ring-[#52B788]/85'
                        : !justSolved
                        ? 'hover:brightness-110'
                        : ''
                    }`}
                  >
                    {/* Subtle number label for DUA support or fallback mode */}
                    {!justSolved && (showNumbers || imgFailed) && (
                      <span className="absolute left-1.5 top-1.5 rounded bg-[#171B21]/82 px-1.5 py-0.5 font-mono text-xs font-bold text-[#F5F3EE] tabular-nums">
                        {tileValue + 1}
                      </span>
                    )}

                    {/* Quiet corner checkmark when piece sits in its exact slot */}
                    {!justSolved && isCorrect && (
                      <span
                        aria-hidden="true"
                        className="absolute right-1.5 bottom-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2A6F4E]/92 text-white shadow"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Victory / Historical Discovery Card */}
          {justSolved && (
            <div className="mx-auto max-w-3xl rounded-xl border border-[#2A6F4E]/50 bg-[#E8F3EC] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1D543A]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>
                    ¡Mural restaurado en {moves}{' '}
                    {moves === 1 ? 'movimiento' : 'movimientos'}!
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#232A34]">
                  {MURAL_CURIOSITIES[selectedRoomId]}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    resetPuzzle(preset.cols, preset.rows, mode);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A6F4E]/45 bg-white px-3 py-2 text-xs font-bold text-[#1D543A] hover:bg-[#DDF0E4] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Jugar otra vez</span>
                </button>
                {nextUnsolvedRoom && (
                  <button
                    type="button"
                    onClick={() => handleSelectRoom(nextUnsolvedRoom.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#2A6F4E] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#21593E] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Siguiente mural</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {!justSolved && isCurrentRoomPreviouslySolved && (
            <p className="mx-auto max-w-3xl text-center text-xs text-[#2A6F4E] font-medium">
              Ya restauraste este mural antes. Puedes volver a montarlo con más
              piezas o probar el modo Deslizante.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#232A34]/12 bg-[#EFECE4] px-5 py-3 sm:px-6">
          <span className="text-xs text-[#526071]">
            {activeRoom.epoch} · {activeRoom.location}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#232A34] px-5 py-2 text-sm font-semibold text-[#F5F3EE] hover:bg-[#171B21] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Volver a la expedición
          </button>
        </div>
      </div>
    </div>
  );
};
