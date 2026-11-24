import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Compass,
  Droplets,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  CharacterReactionId,
  CompassCodePayload,
  CycleId,
  ExplorerProfile,
  FactVsBiasPayload,
  PairMatchPayload,
  PatternGridPayload,
  PuzzleDefinition,
  SequenceOrderPayload,
  SuitcaseSelectPayload,
  WaterFlowPayload,
} from '../types/game';
import { CHARACTER_REACTION_META } from '../data/characterReactions';
import { getDifficultyProfile } from '../data/difficultyConfig';
import { ExplorerReactionAvatar } from './ExplorerReactionAvatar';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface PuzzleModalProps {
  puzzle: PuzzleDefinition;
  cycle: CycleId;
  explorer: ExplorerProfile;
  muted: boolean;
  voiceAuto: boolean;
  pictograms: boolean;
  alreadySolved: boolean;
  initialHintLevel: number;
  onHintUsed: (newLevel: number) => void;
  onReaction?: (reaction: CharacterReactionId, line?: string) => void;
  onSolved: () => void;
  onClose: () => void;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  puzzle,
  cycle,
  explorer,
  muted,
  voiceAuto,
  pictograms,
  alreadySolved,
  initialHintLevel,
  onHintUsed,
  onReaction,
  onSolved,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocusTrap(dialogRef, true);

  const payload = puzzle.payload[cycle];
  const hints = puzzle.hints[cycle];
  const difficulty = getDifficultyProfile(cycle);
  const maxHints = difficulty.maxPuzzleHints;
  const speechAvailable = isSpeechSupported();

  // Nayra's Lupa Arqueológica starts with level 1 hint unlocked automatically!
  const [hintLevel, setHintLevel] = useState<number>(() =>
    Math.min(
      maxHints,
      explorer.id === 'nayra' ? Math.max(1, initialHintLevel) : initialHintLevel
    )
  );
  const [powerUsed, setPowerUsed] = useState<boolean>(
    explorer.id === 'nayra'
  );
  const [yerayCheckActive, setYerayCheckActive] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(
    alreadySolved
      ? { type: 'success', text: puzzle.successMessage }
      : null
  );
  const [solved, setSolved] = useState<boolean>(alreadySolved);
  const [avatarReaction, setAvatarReaction] = useState<CharacterReactionId>(
    alreadySolved ? 'alegria' : 'concentrado'
  );
  const [reactionPulse, setReactionPulse] = useState<number>(0);

  const triggerReaction = (next: CharacterReactionId, line?: string) => {
    setAvatarReaction(next);
    setReactionPulse((k) => k + 1);
    onReaction?.(next, line);
  };

  useEffect(() => {
    if (voiceAuto && !alreadySolved) {
      speakText(`${puzzle.title}. ${puzzle.intro[cycle]}`, muted);
    }
    return () => stopSpeaking();
  }, [puzzle, cycle, muted, voiceAuto, alreadySolved]);

  // State for pattern-grid
  const [selectedCells, setSelectedCells] = useState<number[]>(() =>
    alreadySolved && payload.kind === 'pattern-grid' ? payload.targetPattern : []
  );

  // State for pair-match
  const shuffledRight = useMemo(() => {
    if (payload.kind !== 'pair-match') return [];
    const copy = [...payload.pairs];
    if (copy.length >= 3) {
      const first = copy.shift()!;
      copy.push(first);
    }
    return copy;
  }, [payload]);

  const [activeLeftId, setActiveLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>(() =>
    alreadySolved && payload.kind === 'pair-match'
      ? payload.pairs.map((p) => p.id)
      : []
  );

  // State for sequence-order
  const [orderedItems, setOrderedItems] = useState(() => {
    if (payload.kind !== 'sequence-order') return [];
    if (alreadySolved) {
      return [...payload.items].sort((a, b) => a.order - b.order);
    }
    return [...payload.items];
  });

  // State for fact-vs-bias
  const [classifications, setClassifications] = useState<
    Record<string, 'hecho' | 'opinion'>
  >(() => {
    if (alreadySolved && payload.kind === 'fact-vs-bias') {
      const map: Record<string, 'hecho' | 'opinion'> = {};
      payload.statements.forEach((s) => {
        map[s.id] = s.category;
      });
      return map;
    }
    return {};
  });

  // State for compass-code
  const [compassDir, setCompassDir] = useState<string>(() =>
    alreadySolved && payload.kind === 'compass-code'
      ? payload.correctDirection
      : payload.kind === 'compass-code'
      ? payload.directions[0]
      : ''
  );
  const [signalId, setSignalId] = useState<string>(() =>
    alreadySolved && payload.kind === 'compass-code'
      ? payload.correctSignalId
      : ''
  );
  const [watchtower, setWatchtower] = useState<string>(() =>
    alreadySolved && payload.kind === 'compass-code'
      ? payload.correctWatchtower
      : ''
  );

  // State for suitcase-select
  const [pickedItems, setPickedItems] = useState<string[]>(() =>
    alreadySolved && payload.kind === 'suitcase-select'
      ? payload.items.filter((i) => i.isHistorical).map((i) => i.id)
      : []
  );

  // State for water-flow
  const [waterSequence, setWaterSequence] = useState<string[]>(() =>
    alreadySolved && payload.kind === 'water-flow'
      ? [...payload.nodes]
          .sort((a, b) => a.correctStep - b.correctStep)
          .map((n) => n.id)
      : []
  );

  // Live visual progress indicator (0..100%)
  const progressPercent = useMemo(() => {
    if (solved) return 100;
    switch (payload.kind) {
      case 'pattern-grid':
        return Math.min(
          95,
          Math.round((selectedCells.length / payload.targetPattern.length) * 100)
        );
      case 'pair-match':
        return Math.round((matchedIds.length / payload.pairs.length) * 100);
      case 'sequence-order': {
        const rightCount = orderedItems.filter(
          (item, idx) => item.order === idx
        ).length;
        return Math.round((rightCount / payload.items.length) * 90);
      }
      case 'fact-vs-bias':
        return Math.round(
          (Object.keys(classifications).length / payload.statements.length) * 90
        );
      case 'compass-code': {
        const filled =
          Number(Boolean(compassDir)) +
          Number(Boolean(signalId)) +
          Number(Boolean(watchtower));
        return Math.round((filled / 3) * 90);
      }
      case 'suitcase-select':
        return Math.min(
          95,
          Math.round((pickedItems.length / payload.requiredCount) * 100)
        );
      case 'water-flow':
        return Math.round((waterSequence.length / payload.nodes.length) * 90);
    }
  }, [
    solved,
    payload,
    selectedCells.length,
    matchedIds.length,
    orderedItems,
    classifications,
    compassDir,
    signalId,
    watchtower,
    pickedItems.length,
    waterSequence.length,
  ]);

  const revealNextHint = () => {
    if (hintLevel < maxHints) {
      const next = hintLevel + 1;
      setHintLevel(next);
      onHintUsed(next);
      soundEngine.playClick();
      triggerReaction('sorpresa');
    }
  };

  const markSolved = () => {
    setSolved(true);
    setFeedback({ type: 'success', text: puzzle.successMessage });
    soundEngine.playSuccess();
    triggerReaction('alegria');
    onSolved();
  };

  // Explorer Special Power Handler!
  const handleUseExplorerPower = () => {
    if (solved || powerUsed) return;
    soundEngine.playPowerUp();
    triggerReaction('sorpresa');

    if (explorer.id === 'nayra' || explorer.id === 'aday') {
      const nextHint = Math.min(maxHints, Math.max(1, hintLevel + 1));
      setHintLevel(nextHint);
      onHintUsed(nextHint);
      setPowerUsed(true);
      setFeedback({
        type: 'info',
        text: `${explorer.name} usó ${explorer.powerName}: ¡nueva pista abierta abajo!`,
      });
      return;
    }

    if (explorer.id === 'yeray') {
      setYerayCheckActive(true);
      setPowerUsed(true);
      setFeedback({
        type: 'info',
        text: '¡Chispa Creativa de Yeray activada! Las piezas en verde ya están bien colocadas.',
      });
      return;
    }

    // Sofía: Sextante Veloz — auto-solves 1 piece in any minigame!
    if (explorer.id === 'sofia') {
      setPowerUsed(true);
      if (payload.kind === 'pattern-grid') {
        const missing = payload.targetPattern.find(
          (cell) => !selectedCells.includes(cell)
        );
        if (missing !== undefined) {
          setSelectedCells((prev) => [...prev, missing]);
          setFeedback({
            type: 'info',
            text: '¡Sextante de Sofía! Una marca correcta de la pintadera ha quedado colocada.',
          });
        }
      } else if (payload.kind === 'pair-match') {
        const nextPair = payload.pairs.find((p) => !matchedIds.includes(p.id));
        if (nextPair) {
          const updated = [...matchedIds, nextPair.id];
          setMatchedIds(updated);
          setActiveLeftId(null);
          setFeedback({
            type: 'info',
            text: `¡Sextante de Sofía! Pareja conectada: ${nextPair.left}.`,
          });
          if (updated.length === payload.pairs.length) {
            markSolved();
          }
        }
      } else if (payload.kind === 'sequence-order') {
        const firstMisplacedIdx = orderedItems.findIndex(
          (item, idx) => item.order !== idx
        );
        if (firstMisplacedIdx !== -1) {
          const correctItemIdx = orderedItems.findIndex(
            (item) => item.order === firstMisplacedIdx
          );
          if (correctItemIdx !== -1) {
            const next = [...orderedItems];
            const [item] = next.splice(correctItemIdx, 1);
            next.splice(firstMisplacedIdx, 0, item);
            setOrderedItems(next);
            setFeedback({
              type: 'info',
              text: `¡Sextante de Sofía! Colocado en el puesto ${firstMisplacedIdx + 1}: ${item.label}.`,
            });
          }
        }
      } else if (payload.kind === 'fact-vs-bias') {
        const nextSt = payload.statements.find(
          (s) => classifications[s.id] !== s.category
        );
        if (nextSt) {
          setClassifications((prev) => ({
            ...prev,
            [nextSt.id]: nextSt.category,
          }));
          setFeedback({
            type: 'info',
            text: `¡Sextante de Sofía! Clasificada una frase correctamente.`,
          });
        }
      } else if (payload.kind === 'compass-code') {
        setCompassDir(payload.correctDirection);
        setSignalId(payload.correctSignalId);
        setFeedback({
          type: 'info',
          text: `¡Sextante de Sofía! Rumbo (${payload.correctDirection}) y señal ajustados; ahora elige la fortaleza.`,
        });
      } else if (payload.kind === 'suitcase-select') {
        const nextHist = payload.items.find(
          (i) => i.isHistorical && !pickedItems.includes(i.id)
        );
        if (nextHist) {
          setPickedItems((prev) => [...prev, nextHist.id]);
          setFeedback({
            type: 'info',
            text: `¡Sextante de Sofía! Añadido objeto real de 1952: ${nextHist.title}.`,
          });
        }
      } else if (payload.kind === 'water-flow') {
        const nextStepNum = waterSequence.length + 1;
        const targetNode = payload.nodes.find(
          (n) => n.correctStep === nextStepNum
        );
        if (targetNode && !waterSequence.includes(targetNode.id)) {
          setWaterSequence((prev) => [...prev, targetNode.id]);
          setFeedback({
            type: 'info',
            text: `¡Sextante de Sofía! Activado el paso ${nextStepNum}: ${targetNode.title}.`,
          });
        }
      }
    }
  };

  const handleCheckPattern = (p: PatternGridPayload) => {
    const a = [...selectedCells].sort((x, y) => x - y);
    const b = [...p.targetPattern].sort((x, y) => x - y);
    if (a.length === b.length && a.every((v, i) => v === b[i])) {
      markSolved();
    } else {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setFeedback({
        type: 'error',
        text: `Tienes ${selectedCells.length} marcas y el dibujo lleva ${p.targetPattern.length}. ¡Revisa las 3 pistas o usa tu poder!`,
      });
    }
  };

  const handlePairRightClick = (rightPairId: string, p: PairMatchPayload) => {
    if (!activeLeftId || matchedIds.includes(rightPairId) || solved) return;
    if (activeLeftId === rightPairId) {
      const updated = [...matchedIds, rightPairId];
      setMatchedIds(updated);
      setActiveLeftId(null);
      soundEngine.playDiscover();
      setFeedback({
        type: 'info',
        text: `¡Bien conectado! (${updated.length}/${p.pairs.length})`,
      });
      if (updated.length === p.pairs.length) {
        markSolved();
      } else {
        triggerReaction('sorpresa');
      }
    } else {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setFeedback({
        type: 'error',
        text: 'Casi… esa pareja aún no coincide. ¡Prueba otra!',
      });
    }
  };

  const moveSequenceItem = (index: number, delta: -1 | 1) => {
    if (solved) return;
    const target = index + delta;
    if (target < 0 || target >= orderedItems.length) return;
    const next = [...orderedItems];
    const [removed] = next.splice(index, 1);
    next.splice(target, 0, removed);
    setOrderedItems(next);
    soundEngine.playStep();
  };

  const handleCheckSequence = (p: SequenceOrderPayload) => {
    const isCorrect = orderedItems.every((item, idx) => item.order === idx);
    if (isCorrect) {
      markSolved();
    } else {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setFeedback({
        type: 'error',
        text: `Hay alguna fecha fuera de sitio. Ordena las ${p.items.length} tarjetas de más antigua a más reciente.`,
      });
    }
  };

  const handleCheckFactBias = (p: FactVsBiasPayload) => {
    if (Object.keys(classifications).length < p.statements.length) {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setFeedback({
        type: 'error',
        text: 'Marca todas las tarjetas antes de comprobar.',
      });
      return;
    }
    const wrong = p.statements.filter(
      (st) => classifications[st.id] !== st.category
    );
    if (wrong.length === 0) {
      markSolved();
    } else {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setFeedback({
        type: 'error',
        text: `Solo te faltan ${wrong.length} por ajustar. Recuerda: los hechos tienen fechas o pruebas.`,
      });
    }
  };

  const handleCheckCompass = (p: CompassCodePayload) => {
    if (!signalId || !watchtower) {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setFeedback({
        type: 'error',
        text: 'Elige los 3 pasos: rumbo, señal de fuego y castillo.',
      });
      return;
    }
    if (
      compassDir === p.correctDirection &&
      signalId === p.correctSignalId &&
      watchtower === p.correctWatchtower
    ) {
      markSolved();
    } else {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setFeedback({
        type: 'error',
        text: 'El código aún no encaja con el brasero del vigía. ¡Revisa o abre una pista!',
      });
    }
  };

  const handleToggleSuitcaseItem = (id: string) => {
    if (solved) return;
    soundEngine.playStep();
    if (avatarReaction !== 'concentrado') {
      setAvatarReaction('concentrado');
    }
    setPickedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCheckSuitcase = (p: SuitcaseSelectPayload) => {
    if (pickedItems.length !== p.requiredCount) {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setFeedback({
        type: 'error',
        text: `Elige exactamente ${p.requiredCount} recuerdos de 1952 (llevas ${pickedItems.length}).`,
      });
      return;
    }
    const pickedObjs = p.items.filter((i) => pickedItems.includes(i.id));
    const anachronisms = pickedObjs.filter((i) => !i.isHistorical);
    if (anachronisms.length === 0) {
      markSolved();
    } else {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setFeedback({
        type: 'error',
        text: `¡Ojo! "${anachronisms[0].title}" no existía en 1952. ${anachronisms[0].reason}`,
      });
    }
  };

  const handleToggleWaterNode = (id: string, p: WaterFlowPayload) => {
    if (solved) return;
    soundEngine.playStep();
    if (avatarReaction !== 'concentrado') {
      setAvatarReaction('concentrado');
    }
    if (waterSequence.includes(id)) {
      setWaterSequence((prev) => prev.filter((x) => x !== id));
      return;
    }
    if (waterSequence.length < p.nodes.length) {
      setWaterSequence((prev) => [...prev, id]);
    }
  };

  const handleCheckWater = (p: WaterFlowPayload) => {
    if (waterSequence.length < p.nodes.length) {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setFeedback({
        type: 'error',
        text: 'Toca los 4 pasos en orden (1 → 4) para abrir el agua.',
      });
      return;
    }
    const isCorrect = waterSequence.every((id, idx) => {
      const node = p.nodes.find((n) => n.id === id);
      return node?.correctStep === idx + 1;
    });
    if (isCorrect) {
      markSolved();
    } else {
      soundEngine.playGentleError();
      triggerReaction('animo');
      setFeedback({
        type: 'error',
        text: 'El agua se frenó. Empieza arriba (cumbre) y baja hasta los campos.',
      });
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="puzzle-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/82 p-3 sm:p-5"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-[#526071]">
              <span className="font-mono text-[#1D4E89] font-semibold">
                {puzzle.sealTitle}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {difficulty.levelName} · {difficulty.cycleLabel}
              </span>
              {solved && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#2A6F4E]">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ¡Conseguido!
                  </span>
                </>
              )}
            </div>
            <h2
              id="puzzle-modal-title"
              className="mt-1 font-display text-xl font-bold text-[#171B21] sm:text-2xl"
            >
              {puzzle.title}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {speechAvailable && (
              <button
                type="button"
                onClick={() =>
                  speakText(`${puzzle.title}. ${puzzle.intro[cycle]}`, muted)
                }
                aria-label="Escuchar instrucciones del reto"
                className="inline-flex items-center gap-1 rounded-lg border border-[#1D4E89]/30 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1D4E89] hover:bg-[#E8F0FA] cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Escuchar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar enigma"
              className="rounded-lg p-2 text-[#526071] transition-colors hover:bg-[#232A34]/10 hover:text-[#171B21] cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Live Progress Strip */}
        <div className="h-1.5 w-full bg-[#DFDACF]">
          <div
            className="h-full bg-[#2A6F4E] transition-transform duration-200 origin-left"
            style={{ transform: `scaleX(${progressPercent / 100})` }}
          />
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {pictograms && (
            <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-[#1D4E89]/25 bg-[#E8F0FA] px-4 py-2 text-xs font-bold text-[#1D4E89]">
              <span>👀 Mira las pistas</span>
              <span aria-hidden="true">→</span>
              <span>👆 Toca las piezas</span>
              <span aria-hidden="true">→</span>
              <span>✅ Pulsa Comprobar</span>
            </div>
          )}

          {/* Compact Instruction + Live Explorer Reaction + Power Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#232A34]/12 bg-white px-4 py-3">
            <div className="flex items-center gap-3 flex-1 min-w-[220px]">
              <ExplorerReactionAvatar
                explorerId={explorer.id}
                explorerName={explorer.name}
                reaction={avatarReaction}
                pulseKey={reactionPulse}
                size="sm"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] font-bold">
                  <span className="text-[#171B21]">{explorer.name}</span>
                  <span aria-hidden="true" className="text-[#9AA3B0]">
                    ·
                  </span>
                  <span
                    className={
                      CHARACTER_REACTION_META[avatarReaction].lightTextClass
                    }
                  >
                    {CHARACTER_REACTION_META[avatarReaction].label}
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-medium text-[#171B21]">
                  {puzzle.intro[cycle]}
                </p>
              </div>
            </div>
            {!solved && (
              <button
                type="button"
                disabled={powerUsed}
                onClick={handleUseExplorerPower}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-transform duration-150 active:scale-[0.98] whitespace-nowrap shrink-0 ${
                  powerUsed
                    ? 'border border-[#2A6F4E]/30 bg-[#E1EFE8] text-[#1D543A]'
                    : 'bg-[#C67D1E] text-[#14181F] hover:bg-[#D98E2B] cursor-pointer'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {powerUsed
                    ? `${explorer.powerName} activo`
                    : `Usar ${explorer.powerName}`}
                </span>
              </button>
            )}
          </div>

          {/* MECHANIC 1: PATTERN GRID */}
          {payload.kind === 'pattern-grid' && (
            <div className="grid gap-5 md:grid-cols-[1fr_auto] items-start">
              <div className="space-y-3">
                <div className="rounded-xl border border-[#232A34]/12 bg-[#EAE6DC]/60 p-4">
                  <h3 className="text-sm font-bold text-[#171B21]">
                    Pistas del dibujo
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-[#232A34]">
                    {payload.rowClues.map((clueLine, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-mono text-xs font-bold text-[#C67D1E] mt-0.5 tabular-nums">
                          {idx + 1}.
                        </span>
                        <span>{clueLine}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    disabled={solved}
                    onClick={() => handleCheckPattern(payload)}
                    className="rounded-lg bg-[#1D4E89] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#153A68] disabled:opacity-50 cursor-pointer"
                  >
                    ¡Comprobar pintadera!
                  </button>
                  {!solved && selectedCells.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCells([]);
                        soundEngine.playClick();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#232A34]/20 px-3.5 py-2.5 text-sm font-medium text-[#3E4856] hover:bg-[#EAE6DC] cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      <span>Limpiar</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center rounded-xl border border-[#232A34]/15 bg-[#EFECE4] p-4">
                <div
                  className="grid gap-2.5"
                  style={{
                    gridTemplateColumns: `repeat(${payload.gridSize}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({
                    length: payload.gridSize * payload.gridSize,
                  }).map((_, idx) => {
                    const active = selectedCells.includes(idx);
                    const isCorrectCell =
                      yerayCheckActive &&
                      active &&
                      payload.targetPattern.includes(idx);
                    const row = Math.floor(idx / payload.gridSize) + 1;
                    const col = (idx % payload.gridSize) + 1;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={solved}
                        aria-pressed={active}
                        aria-label={`Fila ${row}, Columna ${col}${active ? ', marcada' : ', vacía'}`}
                        onClick={() => {
                          soundEngine.playStep();
                          setSelectedCells((prev) =>
                            prev.includes(idx)
                              ? prev.filter((c) => c !== idx)
                              : [...prev, idx]
                          );
                        }}
                        className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-lg border-2 transition-transform duration-150 active:scale-95 cursor-pointer ${
                          isCorrectCell
                            ? 'border-[#2A6F4E] bg-[#2A6F4E] text-white'
                            : active
                            ? 'border-[#8A3B1E] bg-[#B44F2A] text-[#F5F3EE]'
                            : 'border-[#232A34]/20 bg-[#FAF8F4] text-[#8B857A] hover:border-[#C67D1E]'
                        }`}
                      >
                        <svg
                          viewBox="0 0 32 32"
                          className="h-8 w-8"
                          aria-hidden="true"
                        >
                          {active ? (
                            <polygon
                              points="16,4 28,26 4,26"
                              fill="currentColor"
                            />
                          ) : (
                            <polygon
                              points="16,6 26,25 6,25"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              opacity="0.45"
                            />
                          )}
                        </svg>
                      </button>
                    );
                  })}
                </div>
                <span className="mt-2.5 font-mono text-xs font-semibold text-[#526071] tabular-nums">
                  Marcas: {selectedCells.length} / {payload.targetPattern.length}
                </span>
              </div>
            </div>
          )}

          {/* MECHANIC 2: PAIR MATCH */}
          {payload.kind === 'pair-match' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#526071]">
                  1. Toca aquí ({payload.leftHeading})
                </div>
                {payload.pairs.map((pair) => {
                  const isMatched = matchedIds.includes(pair.id);
                  const isSelected = activeLeftId === pair.id;
                  return (
                    <button
                      key={pair.id}
                      type="button"
                      disabled={isMatched || solved}
                      onClick={() => {
                        setActiveLeftId(pair.id);
                        soundEngine.playClick();
                      }}
                      className={`w-full rounded-xl border p-3.5 text-left text-sm font-bold transition-transform duration-150 active:scale-[0.99] cursor-pointer ${
                        isMatched
                          ? 'border-[#2A6F4E]/45 bg-[#E1EFE8] text-[#1D543A]'
                          : isSelected
                          ? 'border-[#1D4E89] bg-[#1D4E89] text-white'
                          : 'border-[#232A34]/15 bg-white text-[#171B21] hover:border-[#1D4E89]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{pair.left}</span>
                        {isMatched && (
                          <CheckCircle2
                            className="h-4 w-4 shrink-0 text-[#2A6F4E]"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#526071]">
                  2. Toca su pareja ({payload.rightHeading})
                </div>
                {shuffledRight.map((pair) => {
                  const isMatched = matchedIds.includes(pair.id);
                  return (
                    <button
                      key={pair.id}
                      type="button"
                      disabled={isMatched || solved || !activeLeftId}
                      onClick={() => handlePairRightClick(pair.id, payload)}
                      className={`w-full rounded-xl border p-3.5 text-left text-sm leading-snug transition-colors duration-150 ${
                        isMatched
                          ? 'border-[#2A6F4E]/45 bg-[#E1EFE8] text-[#1D543A]'
                          : activeLeftId
                          ? 'border-[#C67D1E]/70 bg-white text-[#171B21] hover:bg-[#F6EAD7]/70 cursor-pointer'
                          : 'border-[#232A34]/12 bg-[#EFECE4] text-[#526071]'
                      }`}
                    >
                      {pair.right}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MECHANIC 3: SEQUENCE ORDER */}
          {payload.kind === 'sequence-order' && (
            <div className="space-y-3.5">
              <div className="space-y-2.5">
                {orderedItems.map((item, idx) => {
                  const isInRightSpot = yerayCheckActive && item.order === idx;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 ${
                        isInRightSpot
                          ? 'border-[#2A6F4E] bg-[#E1EFE8]'
                          : 'border-[#232A34]/15 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAE6DC] font-mono text-sm font-bold text-[#1D4E89] tabular-nums">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-[#171B21]">
                            {item.label}
                            {isInRightSpot && (
                              <span className="ml-2 text-xs text-[#2A6F4E]">
                                ✓ ¡En su sitio!
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-[#4A5564]">
                            {item.detail}
                          </p>
                        </div>
                      </div>

                      {!solved && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveSequenceItem(idx, -1)}
                            aria-label={`Subir ${item.label}`}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] hover:bg-[#EAE6DC] disabled:opacity-35 cursor-pointer"
                          >
                            <ArrowUp className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === orderedItems.length - 1}
                            onClick={() => moveSequenceItem(idx, 1)}
                            aria-label={`Bajar ${item.label}`}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] hover:bg-[#EAE6DC] disabled:opacity-35 cursor-pointer"
                          >
                            <ArrowDown className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {!solved && (
                <button
                  type="button"
                  onClick={() => handleCheckSequence(payload)}
                  className="rounded-lg bg-[#1D4E89] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#153A68] cursor-pointer"
                >
                  ¡Comprobar orden!
                </button>
              )}
            </div>
          )}

          {/* MECHANIC 4: FACT VS BIAS */}
          {payload.kind === 'fact-vs-bias' && (
            <div className="space-y-3.5">
              <div className="space-y-2.5">
                {payload.statements.map((st) => {
                  const chosen = classifications[st.id];
                  const isCorrect = yerayCheckActive && chosen === st.category;
                  return (
                    <div
                      key={st.id}
                      className={`rounded-xl border p-3.5 ${
                        isCorrect
                          ? 'border-[#2A6F4E] bg-[#E1EFE8]/60'
                          : 'border-[#232A34]/15 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-[#526071]">
                        <span>{st.source}</span>
                        {isCorrect && (
                          <span className="font-semibold text-[#2A6F4E]">
                            ✓ Correcto
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-[#171B21]">
                        «{st.quote}»
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={solved}
                          onClick={() => {
                            soundEngine.playStep();
                            setClassifications((prev) => ({
                              ...prev,
                              [st.id]: 'hecho',
                            }));
                          }}
                          className={`rounded-lg border px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                            chosen === 'hecho'
                              ? 'border-[#1D4E89] bg-[#1D4E89] text-white'
                              : 'border-[#232A34]/20 bg-[#F5F3EE] text-[#232A34] hover:border-[#1D4E89]'
                          }`}
                        >
                          Hecho comprobable
                        </button>
                        <button
                          type="button"
                          disabled={solved}
                          onClick={() => {
                            soundEngine.playStep();
                            setClassifications((prev) => ({
                              ...prev,
                              [st.id]: 'opinion',
                            }));
                          }}
                          className={`rounded-lg border px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                            chosen === 'opinion'
                              ? 'border-[#C67D1E] bg-[#C67D1E] text-[#14181F]'
                              : 'border-[#232A34]/20 bg-[#F5F3EE] text-[#232A34] hover:border-[#C67D1E]'
                          }`}
                        >
                          Opinión o prejuicio
                        </button>
                      </div>
                      {solved && (
                        <p className="mt-2 text-xs font-medium text-[#2A6F4E]">
                          ✓ {st.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {!solved && (
                <button
                  type="button"
                  onClick={() => handleCheckFactBias(payload)}
                  className="rounded-lg bg-[#1D4E89] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#153A68] cursor-pointer"
                >
                  ¡Comprobar fuentes!
                </button>
              )}
            </div>
          )}

          {/* MECHANIC 5: COMPASS CODE */}
          {payload.kind === 'compass-code' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#232A34]/15 bg-white p-4">
                <div className="flex items-center justify-between text-sm font-bold text-[#171B21]">
                  <span className="inline-flex items-center gap-2">
                    <Compass className="h-4 w-4 text-[#1D4E89]" />
                    1. Rumbo en la brújula
                  </span>
                  {yerayCheckActive && compassDir === payload.correctDirection && (
                    <span className="text-xs text-[#2A6F4E]">✓ ¡Bien!</span>
                  )}
                </div>
                <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {payload.directions.map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      disabled={solved}
                      onClick={() => {
                        soundEngine.playStep();
                        setCompassDir(dir);
                      }}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                        compassDir === dir
                          ? 'border-[#1D4E89] bg-[#1D4E89] text-white'
                          : 'border-[#232A34]/18 bg-[#F5F3EE] text-[#232A34] hover:border-[#1D4E89]'
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#232A34]/15 bg-white p-4">
                <div className="flex items-center justify-between text-sm font-bold text-[#171B21]">
                  <span>2. Señal de fuego (almenara)</span>
                  {yerayCheckActive && signalId === payload.correctSignalId && (
                    <span className="text-xs text-[#2A6F4E]">✓ ¡Bien!</span>
                  )}
                </div>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                  {payload.signalOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={solved}
                      onClick={() => {
                        soundEngine.playStep();
                        setSignalId(opt.id);
                      }}
                      className={`rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                        signalId === opt.id
                          ? 'border-[#C67D1E] bg-[#F6EAD7] text-[#171B21]'
                          : 'border-[#232A34]/15 bg-[#FAF8F4] text-[#232A34] hover:border-[#C67D1E]'
                      }`}
                    >
                      <div className="text-sm font-bold">{opt.label}</div>
                      <div className="mt-0.5 text-xs text-[#4A5564]">
                        {opt.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#232A34]/15 bg-white p-4">
                <div className="flex items-center justify-between text-sm font-bold text-[#171B21]">
                  <span>3. Castillo que recibe el aviso</span>
                  {yerayCheckActive &&
                    watchtower === payload.correctWatchtower && (
                      <span className="text-xs text-[#2A6F4E]">✓ ¡Bien!</span>
                    )}
                </div>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                  {payload.watchtowerOptions.map((tower) => (
                    <button
                      key={tower}
                      type="button"
                      disabled={solved}
                      onClick={() => {
                        soundEngine.playStep();
                        setWatchtower(tower);
                      }}
                      className={`rounded-lg border px-3 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                        watchtower === tower
                          ? 'border-[#1D4E89] bg-[#1D4E89] text-white'
                          : 'border-[#232A34]/18 bg-[#F5F3EE] text-[#232A34] hover:border-[#1D4E89]'
                      }`}
                    >
                      {tower}
                    </button>
                  ))}
                </div>
              </div>

              {!solved && (
                <button
                  type="button"
                  onClick={() => handleCheckCompass(payload)}
                  className="rounded-lg bg-[#1D4E89] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#153A68] cursor-pointer"
                >
                  ¡Encender almenara!
                </button>
              )}
            </div>
          )}

          {/* MECHANIC 6: SUITCASE SELECT */}
          {payload.kind === 'suitcase-select' && (
            <div className="space-y-3.5">
              <div className="font-mono text-xs font-semibold text-[#526071] tabular-nums">
                En la maleta: {pickedItems.length} / {payload.requiredCount}
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {payload.items.map((item) => {
                  const selected = pickedItems.includes(item.id);
                  const isGoodPick =
                    yerayCheckActive && selected && item.isHistorical;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={solved}
                      aria-pressed={selected}
                      onClick={() => handleToggleSuitcaseItem(item.id)}
                      className={`rounded-xl border p-3.5 text-left transition-transform duration-150 active:scale-[0.99] cursor-pointer ${
                        isGoodPick
                          ? 'border-[#2A6F4E] bg-[#E1EFE8] text-[#171B21]'
                          : selected
                          ? 'border-[#1D4E89] bg-[#E8F0FA] text-[#171B21]'
                          : 'border-[#232A34]/15 bg-white text-[#232A34] hover:border-[#1D4E89]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold">{item.title}</span>
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold ${
                            selected
                              ? 'border-[#1D4E89] bg-[#1D4E89] text-white'
                              : 'border-[#232A34]/30 bg-white text-transparent'
                          }`}
                        >
                          ✓
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#4A5564]">
                        {item.description}
                      </p>
                      {solved && (
                        <p
                          className={`mt-1.5 text-xs font-semibold ${
                            item.isHistorical
                              ? 'text-[#2A6F4E]'
                              : 'text-[#8A3B1E]'
                          }`}
                        >
                          {item.reason}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {!solved && (
                <button
                  type="button"
                  onClick={() => handleCheckSuitcase(payload)}
                  className="rounded-lg bg-[#1D4E89] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#153A68] cursor-pointer"
                >
                  ¡Cerrar maleta de 1952!
                </button>
              )}
            </div>
          )}

          {/* MECHANIC 7: WATER FLOW */}
          {payload.kind === 'water-flow' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-[#526071]">
                <span>Toca los 4 pasos en orden (1 → 4).</span>
                {!solved && waterSequence.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setWaterSequence([]);
                      soundEngine.playClick();
                    }}
                    className="font-semibold text-[#1D4E89] hover:underline cursor-pointer"
                  >
                    Reiniciar orden
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {payload.nodes.map((node) => {
                  const pos = waterSequence.indexOf(node.id);
                  const isPicked = pos !== -1;
                  const isGoodSpot =
                    yerayCheckActive && isPicked && node.correctStep === pos + 1;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      disabled={solved}
                      onClick={() => handleToggleWaterNode(node.id, payload)}
                      className={`rounded-xl border p-4 text-left transition-transform duration-150 active:scale-[0.99] cursor-pointer ${
                        isGoodSpot
                          ? 'border-[#2A6F4E] bg-[#E1EFE8] text-[#171B21]'
                          : isPicked
                          ? 'border-[#1D4E89] bg-[#E8F0FA] text-[#171B21]'
                          : 'border-[#232A34]/15 bg-white text-[#232A34] hover:border-[#1D4E89]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 text-sm font-bold">
                          <Droplets className="h-4 w-4 text-[#1D4E89]" />
                          {node.title}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#1D4E89] tabular-nums">
                          {isPicked ? `Paso ${pos + 1}` : 'Tocar'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#4A5564]">{node.role}</p>
                    </button>
                  );
                })}
              </div>

              {!solved && (
                <button
                  type="button"
                  onClick={() => handleCheckWater(payload)}
                  className="rounded-lg bg-[#1D4E89] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#153A68] cursor-pointer"
                >
                  ¡Abrir compuertas del agua!
                </button>
              )}
            </div>
          )}

          {/* Feedback banner */}
          {feedback && (
            <div
              role="status"
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                feedback.type === 'success'
                  ? 'border-[#2A6F4E]/40 bg-[#E1EFE8] text-[#194A33]'
                  : feedback.type === 'error'
                  ? 'border-[#A43D2F]/35 bg-[#F8E5E2] text-[#7D2B20]'
                  : 'border-[#1D4E89]/30 bg-[#E8F0FA] text-[#173A66]'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Progressive Zero-Penalty Hint System adapted by Primary Cycle */}
          {!solved && (
            <div className="rounded-xl border border-[#232A34]/12 bg-[#EAE6DC]/75 p-3.5 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#333D4B]">
                  <Lightbulb className="h-4 w-4 text-[#C67D1E]" />
                  <span>
                    Pistas sin penalización ({Math.min(hintLevel, maxHints)}/
                    {maxHints} · {difficulty.levelName})
                  </span>
                </div>
                {hintLevel < maxHints && (
                  <button
                    type="button"
                    onClick={revealNextHint}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#C67D1E]/60 bg-[#F6EAD7] px-3 py-1.5 text-xs font-bold text-[#6E420B] hover:bg-[#EED9B7] whitespace-nowrap cursor-pointer"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>
                      {hintLevel === 0
                        ? 'Pista 1 (Orientación)'
                        : hintLevel === 1
                        ? 'Pista 2 (Clave)'
                        : 'Pista 3 (Solución guía)'}
                    </span>
                  </button>
                )}
              </div>

              {hintLevel >= 1 && (
                <div className="space-y-1.5 text-xs sm:text-sm text-[#2F3845]">
                  <p>
                    <strong className="text-[#171B21]">1.</strong> {hints.level1}
                  </p>
                  {hintLevel >= 2 && (
                    <p>
                      <strong className="text-[#171B21]">2.</strong>{' '}
                      {hints.level2}
                    </p>
                  )}
                  {maxHints >= 3 && hintLevel >= 3 && (
                    <p>
                      <strong className="text-[#171B21]">3.</strong>{' '}
                      {hints.level3}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3">
          <span className="text-xs text-[#526071]">
            Sin prisas · Cada intento te acerca al sello.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#232A34] px-4 py-2 text-sm font-semibold text-[#F5F3EE] hover:bg-[#171B21] whitespace-nowrap cursor-pointer"
          >
            {solved ? '¡Seguir explorando!' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  );
};
