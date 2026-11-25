import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  KeyRound,
  Lock,
  LockOpen,
  Search,
  Shapes,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  CharacterReactionId,
  CycleId,
  ExplorerProfile,
  RoomData,
  RoomProgress,
} from '../types/game';
import { ROOM_EXIT_LOCKS } from '../data/escapeLocks';
import { getDifficultyProfile } from '../data/difficultyConfig';
import { SHADOW_CHALLENGES } from '../data/shadowMatchData';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface RoomExitLockModalProps {
  room: RoomData;
  totalRooms: number;
  cycle: CycleId;
  explorer: ExplorerProfile;
  progress: RoomProgress;
  muted: boolean;
  onJumpToChallenge: (target: 'puzzle1' | 'puzzle2' | 'empathy' | 'clue' | 'shadow') => void;
  onReaction: (reaction: CharacterReactionId, line?: string) => void;
  onDoorUnlocked: () => void;
  onEscapeRoom: () => void;
  onClose: () => void;
}

export const RoomExitLockModal: React.FC<RoomExitLockModalProps> = ({
  room,
  totalRooms,
  cycle,
  explorer,
  progress,
  muted,
  onJumpToChallenge,
  onReaction,
  onDoorUnlocked,
  onEscapeRoom,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocusTrap(dialogRef, true);

  const lockDef = ROOM_EXIT_LOCKS[room.id];
  const difficulty = getDifficultyProfile(cycle);
  const dials = lockDef.dials[cycle];
  const shadowChallenge = SHADOW_CHALLENGES[room.id];
  const speechAvailable = isSpeechSupported();

  const sealsUnlockedCount =
    Number(progress.puzzle1Solved) +
    Number(progress.puzzle2Solved) +
    Number(progress.empathySolved);
  const allSealsReady = sealsUnlockedCount === 3;

  // Start each dial offset from the answer unless the door is already unlocked
  const initialSelection = useMemo<[number, number, number]>(() => {
    if (progress.doorUnlocked) {
      return [dials[0].correctIndex, dials[1].correctIndex, dials[2].correctIndex];
    }
    return [
      (dials[0].correctIndex + 1) % dials[0].options.length,
      (dials[1].correctIndex + 2) % dials[1].options.length,
      (dials[2].correctIndex + 1) % dials[2].options.length,
    ];
  }, [dials, progress.doorUnlocked]);

  const [selectedIndices, setSelectedIndices] =
    useState<[number, number, number]>(initialSelection);
  const [checkedFeedback, setCheckedFeedback] = useState<{
    matches: [boolean, boolean, boolean];
    message: string;
    isError: boolean;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const isUnlocked = progress.doorUnlocked || justUnlocked;

  const rotateDial = (dialIdx: 0 | 1 | 2, delta: -1 | 1) => {
    if (!allSealsReady || isUnlocked) return;
    soundEngine.playLockTick();
    setCheckedFeedback(null);
    setSelectedIndices((prev) => {
      const next: [number, number, number] = [...prev];
      const len = dials[dialIdx].options.length;
      next[dialIdx] = (prev[dialIdx] + delta + len) % len;
      return next;
    });
  };

  const handleCheckCombination = () => {
    if (!allSealsReady || isUnlocked) return;
    const matches: [boolean, boolean, boolean] = [
      selectedIndices[0] === dials[0].correctIndex,
      selectedIndices[1] === dials[1].correctIndex,
      selectedIndices[2] === dials[2].correctIndex,
    ];
    const correctCount = matches.filter(Boolean).length;

    if (correctCount === 3) {
      soundEngine.playLockOpen();
      setJustUnlocked(true);
      setCheckedFeedback({
        matches,
        message: lockDef.unlockedMessage,
        isError: false,
      });
      onReaction('orgullo', `¡Cerrojo abierto! ¡Hemos escapado de ${room.title}!`);
      onDoorUnlocked();
    } else {
      soundEngine.playGentleError();
      setCheckedFeedback({
        matches,
        message:
          correctCount === 0
            ? 'El cerrojo aún no gira. Revisa las pistas de la sala y vuelve a probar.'
            : `¡Casi! Tienes ${correctCount} de 3 diales en su posición correcta. Ajusta los marcados en ámbar.`,
        isError: true,
      });
      onReaction(
        'animo',
        '¡No pasa nada! Revisa las pistas de la sala o pide una pista mía.'
      );
    }
  };

  const boltSlots = [
    {
      key: 'puzzle1' as const,
      title: room.puzzle1.sealTitle,
      unlocked: progress.puzzle1Solved,
      shortTarget: 'Reto 1',
    },
    {
      key: 'puzzle2' as const,
      title: room.puzzle2.sealTitle,
      unlocked: progress.puzzle2Solved,
      shortTarget: 'Reto 2',
    },
    {
      key: 'empathy' as const,
      title: room.empathy.sealTitle,
      unlocked: progress.empathySolved,
      shortTarget: 'Dilema',
    },
  ];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-lock-title"
      data-dialog-theme="dark"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C1016]/86 p-3 sm:p-5"
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E6A94F]/35 bg-[#171B21] text-[#F5F3EE] shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-[#F5F3EE]/12 bg-[#1E242E] px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3 min-w-0">
            <span
              className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-transform duration-200 ${
                isUnlocked
                  ? 'badge-medal-pop border-[#74C69D] bg-[#2A6F4E] text-white'
                  : allSealsReady
                  ? 'border-[#E6A94F] bg-[#C67D1E] text-[#14181F]'
                  : 'border-[#F5F3EE]/20 bg-[#14181F] text-[#9AA3B0]'
              }`}
            >
              {isUnlocked ? (
                <LockOpen className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Lock className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <div className="font-mono text-xs font-semibold text-[#E6A94F] tabular-nums">
                Sala {room.number}/{totalRooms} · {lockDef.lockName} ·{' '}
                {difficulty.levelName}
              </div>
              <h2
                id="exit-lock-title"
                className="mt-0.5 font-display text-xl font-bold text-[#F5F3EE] sm:text-2xl"
              >
                {lockDef.doorTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {speechAvailable && (
              <button
                type="button"
                onClick={() =>
                  speakText(
                    `${lockDef.doorTitle}. ${lockDef.storyPrompt[cycle]}`,
                    muted
                  )
                }
                aria-label="Escuchar instrucciones del cerrojo"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#F5F3EE]/18 bg-[#171B21] text-[#E6A94F] hover:border-[#E6A94F] cursor-pointer"
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              aria-label="Cerrar cerrojo"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#F5F3EE]/18 bg-[#171B21] text-[#F5F3EE] hover:border-[#E6A94F] cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-5">
          <p className="text-sm leading-relaxed text-[#E2DDD2]">
            {lockDef.storyPrompt[cycle]}
          </p>

          {/* Step 1: 3 Seal Bolts */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-[#E6A94F]">
                1. Pasadores de sello ({sealsUnlockedCount}/3)
              </span>
              <span className="text-[#B9B3A7]">
                {allSealsReady
                  ? 'Todos los pasadores liberados'
                  : 'Resuelve los retos pendientes para activar los diales'}
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              {boltSlots.map((slot) => (
                <div
                  key={slot.key}
                  className={`flex flex-col justify-between gap-2 rounded-xl border p-3 transition-colors ${
                    slot.unlocked
                      ? 'border-[#52B788]/55 bg-[#192D24]'
                      : 'border-[#F5F3EE]/14 bg-[#202630]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#F5F3EE] leading-snug">
                      {slot.title}
                    </span>
                    {slot.unlocked ? (
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-[#74C69D]"
                        aria-hidden="true"
                      />
                    ) : (
                      <Lock
                        className="h-4 w-4 shrink-0 text-[#9AA3B0]"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  {slot.unlocked ? (
                    <span className="text-[11px] font-semibold text-[#9FE2BF]">
                      Pasador abierto ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        stopSpeaking();
                        onJumpToChallenge(slot.key);
                      }}
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#1D4E89] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#2660A6] cursor-pointer"
                    >
                      <span>Ir a {slot.shortTarget}</span>
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Step 2: 3-Dial Mechanical Combination Lock */}
          <section
            className={`rounded-2xl border p-4 sm:p-5 space-y-4 transition-colors ${
              isUnlocked
                ? 'border-[#52B788]/65 bg-[#172C23]'
                : allSealsReady
                ? 'border-[#E6A94F]/55 bg-[#20252E]'
                : 'border-[#F5F3EE]/12 bg-[#1B2028]/70 opacity-75'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <KeyRound
                  className={`h-4 w-4 ${
                    isUnlocked
                      ? 'text-[#74C69D]'
                      : allSealsReady
                      ? 'text-[#E6A94F]'
                      : 'text-[#8F97A3]'
                  }`}
                  aria-hidden="true"
                />
                <span className="text-xs font-bold text-[#F5F3EE]">
                  2. Combinación de escape (3 cilindros ·{' '}
                  {difficulty.exitLockOptionsPerDial} opciones cada uno)
                </span>
              </div>

              {allSealsReady && !isUnlocked && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setShowHint((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E6A94F]/45 bg-[#171B21] px-2.5 py-1 text-[11px] font-semibold text-[#F3C876] hover:border-[#E6A94F] cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {showHint
                      ? 'Ocultar pista'
                      : `Pista de ${explorer.name}`}
                  </span>
                </button>
              )}
            </div>

            {showHint && allSealsReady && !isUnlocked && (
              <div className="rounded-xl border border-[#E6A94F]/45 bg-[#2A2217] px-3.5 py-2.5 text-xs leading-relaxed text-[#FAF4E8]">
                <strong className="text-[#E6A94F]">{explorer.name}:</strong>{' '}
                {lockDef.escapeHint[cycle]}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              {dials.map((dial, idx) => {
                const dialIndex = idx as 0 | 1 | 2;
                const currentOption = dial.options[selectedIndices[dialIndex]];
                const matchState = checkedFeedback
                  ? checkedFeedback.matches[dialIndex]
                  : null;

                return (
                  <div
                    key={dial.id}
                    className={`flex flex-col items-center rounded-xl border p-3 text-center transition-colors ${
                      isUnlocked || matchState === true
                        ? 'border-[#52B788] bg-[#162920]'
                        : matchState === false
                        ? 'border-[#E6A94F] bg-[#2D2316]'
                        : 'border-[#F5F3EE]/16 bg-[#14181F]'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-semibold text-[#9AA3B0] tabular-nums">
                      Cilindro {idx + 1} · {dial.clueSource}
                    </span>
                    <span className="mt-0.5 text-xs font-bold text-[#E6C58D]">
                      {dial.label}
                    </span>

                    <button
                      type="button"
                      disabled={!allSealsReady || isUnlocked}
                      onClick={() => rotateDial(dialIndex, -1)}
                      aria-label={`Subir opción en ${dial.label}`}
                      className="mt-2 inline-flex h-8 w-full items-center justify-center rounded-lg border border-[#F5F3EE]/14 bg-[#222833] text-[#E9E5DC] transition-colors hover:border-[#E6A94F] hover:bg-[#2C3442] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      disabled={!allSealsReady || isUnlocked}
                      onClick={() => rotateDial(dialIndex, 1)}
                      className="my-1.5 flex min-h-[52px] w-full items-center justify-center rounded-lg border-2 border-[#E6A94F]/45 bg-[#1C222B] px-2.5 py-2 text-sm font-bold text-[#F5F3EE] shadow-inner transition-transform active:scale-[0.98] disabled:border-[#F5F3EE]/15 disabled:text-[#8F97A3] disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span>{allSealsReady ? currentOption : '• • •'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={!allSealsReady || isUnlocked}
                      onClick={() => rotateDial(dialIndex, 1)}
                      aria-label={`Bajar opción en ${dial.label}`}
                      className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-[#F5F3EE]/14 bg-[#222833] text-[#E9E5DC] transition-colors hover:border-[#E6A94F] hover:bg-[#2C3442] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </button>

                    {matchState !== null && (
                      <span
                        className={`mt-1.5 text-[11px] font-bold ${
                          matchState ? 'text-[#74C69D]' : 'text-[#F3C876]'
                        }`}
                      >
                        {matchState ? 'Encaja ✓' : 'Ajusta este'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {checkedFeedback && (
              <div
                role="status"
                className={`rounded-xl border px-4 py-3 text-xs sm:text-sm font-semibold ${
                  checkedFeedback.isError
                    ? 'border-[#E6A94F]/55 bg-[#2D2316] text-[#FAF4E8]'
                    : 'border-[#52B788]/65 bg-[#1A3528] text-[#D8F3DC]'
                }`}
              >
                {checkedFeedback.message}
              </div>
            )}
          </section>

          {/* Collected Evidence Box (Connects clues directly to the Exit Lock) */}
          <section className="rounded-xl border border-[#F5F3EE]/12 bg-[#1D232C] p-4 space-y-2.5">
            <div className="text-xs font-bold text-[#90CAF9]">
              Pistas recogidas en esta sala
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-[#F5F3EE]/12 bg-[#151920] p-3 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#F5F3EE]">
                    <Search className="h-3.5 w-3.5 text-[#90CAF9]" aria-hidden="true" />
                    <span>{room.clue.itemLabel}</span>
                  </span>
                  <span
                    className={
                      progress.clueFound
                        ? 'font-semibold text-[#74C69D]'
                        : 'text-[#9AA3B0]'
                    }
                  >
                    {progress.clueFound ? 'Encontrada ✓' : 'Sin recoger'}
                  </span>
                </div>
                {progress.clueFound ? (
                  <p className="text-[#C7C1B5] leading-snug">
                    {room.clue.text[cycle]}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      onJumpToChallenge('clue');
                    }}
                    className="text-[11px] font-semibold text-[#90CAF9] underline underline-offset-2 hover:text-white cursor-pointer"
                  >
                    Buscar la lupa en la sala
                  </button>
                )}
              </div>

              <div className="rounded-lg border border-[#F5F3EE]/12 bg-[#151920] p-3 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#F5F3EE]">
                    <Shapes className="h-3.5 w-3.5 text-[#F3C876]" aria-hidden="true" />
                    <span>Pista extra · Sombras</span>
                  </span>
                  <span
                    className={
                      progress.shadowSolved
                        ? 'font-semibold text-[#74C69D]'
                        : 'text-[#9AA3B0]'
                    }
                  >
                    {progress.shadowSolved ? 'Desbloqueada ✓' : 'Opcional'}
                  </span>
                </div>
                {progress.shadowSolved ? (
                  <p className="text-[#C7C1B5] leading-snug">
                    {shadowChallenge.unlockedClueText[cycle]}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      onJumpToChallenge('shadow');
                    }}
                    className="text-[11px] font-semibold text-[#F3C876] underline underline-offset-2 hover:text-white cursor-pointer"
                  >
                    Jugar a Sombras para pista extra
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer CTA */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F5F3EE]/12 bg-[#1E242E] px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="rounded-xl border border-[#F5F3EE]/20 bg-transparent px-4 py-2.5 text-xs font-semibold text-[#E2DDD2] hover:bg-[#2A313D] cursor-pointer"
          >
            Volver a la sala
          </button>

          {isUnlocked ? (
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onEscapeRoom();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2A6F4E] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:bg-[#34845E] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-[#F6EAD7]" aria-hidden="true" />
              <span>
                {room.number < totalRooms
                  ? '¡Cruzar puerta a la siguiente época!'
                  : '¡Abrir salida y ver diploma final!'}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!allSealsReady}
              onClick={handleCheckCombination}
              className="inline-flex items-center gap-2 rounded-xl bg-[#C67D1E] px-5 py-2.5 text-sm font-bold text-[#14181F] shadow-lg transition-transform hover:bg-[#D98E2B] active:scale-[0.98] disabled:bg-[#3A424F] disabled:text-[#9AA3B0] disabled:cursor-not-allowed cursor-pointer"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              <span>
                {allSealsReady
                  ? 'Probar combinación y abrir puerta'
                  : `Faltan ${3 - sealsUnlockedCount} ${
                      3 - sealsUnlockedCount === 1 ? 'sello' : 'sellos'
                    }`}
              </span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
