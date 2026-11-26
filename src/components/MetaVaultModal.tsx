import React, { useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  KeyRound,
  Lock,
  LockOpen,
  Sparkles,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import {
  CharacterReactionId,
  CycleId,
  ExpeditionState,
  RoomId,
} from '../types/game';
import {
  getCollectedPintaderaRooms,
  PINTADERA_FRAGMENTS,
  SECRET_CHAMBER_RELIC,
} from '../data/metaVaultData';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface MetaVaultModalProps {
  state: ExpeditionState;
  cycle: CycleId;
  muted: boolean;
  onSolved: () => void;
  onReaction: (reaction: CharacterReactionId, line?: string) => void;
  onClose: () => void;
}

export const MetaVaultModal: React.FC<MetaVaultModalProps> = ({
  state,
  cycle,
  muted,
  onSolved,
  onReaction,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocusTrap(dialogRef, true);

  const collectedRooms = useMemo(
    () => getCollectedPintaderaRooms(state),
    [state]
  );
  const allFragmentsReady =
    collectedRooms.length === PINTADERA_FRAGMENTS.length || state.teacherMode;
  const alreadySolved = Boolean(state.metaVault?.solved);
  const speechAvailable = isSpeechSupported();

  const initialSelection = useMemo<[number, number, number, number]>(() => {
    if (alreadySolved) {
      return [
        PINTADERA_FRAGMENTS[0].metaDial[cycle].correctIndex,
        PINTADERA_FRAGMENTS[1].metaDial[cycle].correctIndex,
        PINTADERA_FRAGMENTS[2].metaDial[cycle].correctIndex,
        PINTADERA_FRAGMENTS[3].metaDial[cycle].correctIndex,
      ];
    }
    return [
      (PINTADERA_FRAGMENTS[0].metaDial[cycle].correctIndex + 1) %
        PINTADERA_FRAGMENTS[0].metaDial[cycle].options.length,
      (PINTADERA_FRAGMENTS[1].metaDial[cycle].correctIndex + 1) %
        PINTADERA_FRAGMENTS[1].metaDial[cycle].options.length,
      (PINTADERA_FRAGMENTS[2].metaDial[cycle].correctIndex + 1) %
        PINTADERA_FRAGMENTS[2].metaDial[cycle].options.length,
      (PINTADERA_FRAGMENTS[3].metaDial[cycle].correctIndex + 1) %
        PINTADERA_FRAGMENTS[3].metaDial[cycle].options.length,
    ];
  }, [alreadySolved, cycle]);

  const [selectedIndices, setSelectedIndices] =
    useState<[number, number, number, number]>(initialSelection);
  const [feedback, setFeedback] = useState<{
    matches: [boolean, boolean, boolean, boolean];
    message: string;
    isError: boolean;
  } | null>(null);
  const [justSolved, setJustSolved] = useState(false);

  const isSolved = alreadySolved || justSolved;

  const rotateQuadrantDial = (idx: 0 | 1 | 2 | 3, delta: -1 | 1) => {
    if (!allFragmentsReady || isSolved) return;
    soundEngine.playLockTick();
    setFeedback(null);
    setSelectedIndices((prev) => {
      const next: [number, number, number, number] = [...prev];
      const len = PINTADERA_FRAGMENTS[idx].metaDial[cycle].options.length;
      next[idx] = (prev[idx] + delta + len) % len;
      return next;
    });
  };

  const handleCheckMetaLock = () => {
    if (!allFragmentsReady || isSolved) return;
    const matches: [boolean, boolean, boolean, boolean] = [
      selectedIndices[0] === PINTADERA_FRAGMENTS[0].metaDial[cycle].correctIndex,
      selectedIndices[1] === PINTADERA_FRAGMENTS[1].metaDial[cycle].correctIndex,
      selectedIndices[2] === PINTADERA_FRAGMENTS[2].metaDial[cycle].correctIndex,
      selectedIndices[3] === PINTADERA_FRAGMENTS[3].metaDial[cycle].correctIndex,
    ];
    const okCount = matches.filter(Boolean).length;

    if (okCount === 4) {
      soundEngine.playVictory();
      setJustSolved(true);
      setFeedback({
        matches,
        message:
          '¡Los cuatro cuadrantes de la Gran Pintadera encajan y la Cámara Secreta se abre!',
        isError: false,
      });
      onReaction(
        'orgullo',
        '¡Increíble trabajo en equipo! Habéis abierto la Cámara Secreta del Cuaderno del Tiempo.'
      );
      onSolved();
    } else {
      soundEngine.playGentleError();
      setFeedback({
        matches,
        message: `Tenéis ${okCount} de 4 cuadrantes alineados. Revisad en equipo las épocas marcadas en ámbar.`,
        isError: true,
      });
      onReaction(
        'animo',
        '¡Muy cerca! Comentad juntos qué ocurrió en cada época para alinear los 4 cuadrantes.'
      );
    }
  };

  const hasFragment = (roomId: RoomId) => collectedRooms.includes(roomId);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="meta-vault-title"
      data-dialog-theme="dark"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F16]/88 p-3 sm:p-5"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E6A94F]/45 bg-[#171B21] text-[#F5F3EE] shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-[#F5F3EE]/12 bg-[#1E242E] px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3 min-w-0">
            <span
              className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 ${
                isSolved
                  ? 'badge-medal-pop border-[#74C69D] bg-[#2A6F4E] text-white'
                  : allFragmentsReady
                  ? 'border-[#E6A94F] bg-[#C67D1E] text-[#14181F]'
                  : 'border-[#F5F3EE]/20 bg-[#14181F] text-[#E6A94F]'
              }`}
            >
              {isSolved ? (
                <LockOpen className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Compass className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <div className="font-mono text-xs font-semibold text-[#E6A94F] tabular-nums">
                Meta-cerrojo entre las 4 salas · {collectedRooms.length}/4
                fragmentos de la Gran Pintadera
              </div>
              <h2
                id="meta-vault-title"
                className="mt-0.5 font-display text-xl font-bold text-[#F5F3EE] sm:text-2xl"
              >
                Cámara Secreta del Cuaderno del Tiempo
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            aria-label="Cerrar cámara secreta"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#F5F3EE]/18 bg-[#171B21] text-[#F5F3EE] hover:border-[#E6A94F] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-5">
          {/* Top visual assembly: Interactive 4-quadrant SVG Pintadera + fragment status */}
          <section className="grid gap-4 md:grid-cols-[210px_1fr] items-center rounded-2xl border border-[#F5F3EE]/12 bg-[#1D232C] p-4">
            <div className="flex flex-col items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="h-44 w-44 drop-shadow-[0_0_20px_rgba(230,169,79,0.22)]"
                role="img"
                aria-label={`Gran Pintadera de Gran Canaria: ${collectedRooms.length} de 4 fragmentos reunidos`}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="92"
                  fill="#12161D"
                  stroke={isSolved ? '#74C69D' : '#E6A94F'}
                  strokeOpacity={isSolved ? 0.95 : 0.45}
                  strokeWidth="2.5"
                />
                {/* NW Quadrant — Sala 1 */}
                <path
                  d="M 100 100 L 100 16 A 84 84 0 0 0 16 100 Z"
                  fill={hasFragment('aborigenes') ? '#C67D1E' : '#232A34'}
                  fillOpacity={hasFragment('aborigenes') ? 0.85 : 0.55}
                  stroke="#F5F3EE"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                />
                <polygon
                  points="58,42 74,70 42,70"
                  fill={hasFragment('aborigenes') ? '#FAF4E8' : '#556070'}
                  fillOpacity="0.9"
                />
                {/* NE Quadrant — Sala 2 */}
                <path
                  d="M 100 100 L 184 100 A 84 84 0 0 0 100 16 Z"
                  fill={hasFragment('conquista') ? '#2A6F4E' : '#232A34'}
                  fillOpacity={hasFragment('conquista') ? 0.85 : 0.55}
                  stroke="#F5F3EE"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                />
                <rect
                  x="128"
                  y="46"
                  width="26"
                  height="26"
                  transform="rotate(45 141 59)"
                  fill={hasFragment('conquista') ? '#D8F3DC' : '#556070'}
                  fillOpacity="0.9"
                />
                {/* SW Quadrant — Sala 3 */}
                <path
                  d="M 100 100 L 16 100 A 84 84 0 0 0 100 184 Z"
                  fill={hasFragment('pirateria') ? '#1D4E89' : '#232A34'}
                  fillOpacity={hasFragment('pirateria') ? 0.9 : 0.55}
                  stroke="#F5F3EE"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                />
                <circle
                  cx="59"
                  cy="141"
                  r="14"
                  fill="none"
                  stroke={hasFragment('pirateria') ? '#DCE8F8' : '#556070'}
                  strokeWidth="4"
                />
                {/* SE Quadrant — Sala 4 */}
                <path
                  d="M 100 100 L 100 184 A 84 84 0 0 0 184 100 Z"
                  fill={hasFragment('sigloXX') ? '#9C5A25' : '#232A34'}
                  fillOpacity={hasFragment('sigloXX') ? 0.88 : 0.55}
                  stroke="#F5F3EE"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                />
                <path
                  d="M 124 143 Q 134 128 144 143 T 164 143"
                  fill="none"
                  stroke={hasFragment('sigloXX') ? '#FAF4E8' : '#556070'}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Center Medallion */}
                <circle
                  cx="100"
                  cy="100"
                  r="24"
                  fill={isSolved ? '#2A6F4E' : '#171B21'}
                  stroke={isSolved ? '#D8F3DC' : '#E6A94F'}
                  strokeWidth="2.5"
                />
                <text
                  x="100"
                  y="105"
                  textAnchor="middle"
                  fill="#F5F3EE"
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  {isSolved ? '✓' : `${collectedRooms.length}/4`}
                </text>
              </svg>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs sm:text-sm leading-relaxed text-[#E2DDD2]">
                Cada época esconde un cuadrante de la{' '}
                <strong className="text-[#F3C876]">
                  Gran Pintadera de Gran Canaria
                </strong>
                . Reúne los 4 fragmentos abriendo cada cerrojo de salida o
                usando la <strong>Linterna de inspección</strong> en las salas.
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {PINTADERA_FRAGMENTS.map((frag) => {
                  const found = hasFragment(frag.roomId);
                  return (
                    <div
                      key={frag.roomId}
                      className={`rounded-xl border px-3 py-2 text-xs ${
                        found
                          ? 'border-[#52B788]/55 bg-[#182E24]'
                          : 'border-[#F5F3EE]/12 bg-[#14181F] opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#F5F3EE]">
                          {frag.roomNumber}. {frag.runeLabel}
                        </span>
                        {found ? (
                          <CheckCircle2
                            className="h-3.5 w-3.5 text-[#74C69D] shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <Lock
                            className="h-3.5 w-3.5 text-[#8F97A3] shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#B9B3A7]">
                        {found
                          ? frag.coordinateTag
                          : `Explora Sala ${frag.roomNumber} con linterna o abre su cerrojo`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Unlocked Secret Relic Card */}
          {isSolved && (
            <section className="rounded-2xl border-2 border-[#74C69D]/70 bg-gradient-to-br from-[#193327] via-[#1C2A24] to-[#292217] p-5 space-y-3 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9FE2BF]">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>{SECRET_CHAMBER_RELIC.subtitle}</span>
                  </div>
                  <h3 className="mt-1 font-display text-xl font-bold text-[#FAF4E8]">
                    {SECRET_CHAMBER_RELIC.title}
                  </h3>
                </div>
                {speechAvailable && (
                  <button
                    type="button"
                    onClick={() =>
                      speakText(
                        `${SECRET_CHAMBER_RELIC.title}. ${SECRET_CHAMBER_RELIC.message[cycle]}`,
                        muted
                      )
                    }
                    aria-label="Escuchar mensaje de la Cámara Secreta"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#74C69D]/45 bg-[#14181F] text-[#9FE2BF] hover:border-[#74C69D] cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="text-sm leading-relaxed text-[#EEF6F0]">
                {SECRET_CHAMBER_RELIC.message[cycle]}
              </p>
              <div className="flex items-start gap-2 rounded-xl border border-[#E6A94F]/40 bg-[#14181F]/70 p-3 text-xs text-[#F3C876]">
                <Users className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{SECRET_CHAMBER_RELIC.cooperativePrompt}</span>
              </div>
            </section>
          )}

          {/* Cooperative 4-Epoch Meta-Combination Dials */}
          <section
            className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
              isSolved
                ? 'border-[#52B788]/55 bg-[#162820]'
                : allFragmentsReady
                ? 'border-[#E6A94F]/55 bg-[#202630]'
                : 'border-[#F5F3EE]/12 bg-[#1A1F27]/70 opacity-75'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <KeyRound
                  className={`h-4 w-4 ${
                    isSolved
                      ? 'text-[#74C69D]'
                      : allFragmentsReady
                      ? 'text-[#E6A94F]'
                      : 'text-[#8F97A3]'
                  }`}
                  aria-hidden="true"
                />
                <span className="text-xs font-bold text-[#F5F3EE]">
                  Enigma cooperativo entre épocas (alinea los 4 cuadrantes)
                </span>
              </div>
              {!allFragmentsReady && (
                <span className="text-[11px] font-semibold text-[#F3C876]">
                  Faltan {4 - collectedRooms.length} fragmentos para girar los
                  anillos
                </span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {PINTADERA_FRAGMENTS.map((frag, idx) => {
                const dialIdx = idx as 0 | 1 | 2 | 3;
                const dial = frag.metaDial[cycle];
                const currentOption = dial.options[selectedIndices[dialIdx]];
                const matchState = feedback ? feedback.matches[dialIdx] : null;

                return (
                  <div
                    key={frag.roomId}
                    className={`rounded-xl border p-3.5 space-y-2 ${
                      isSolved || matchState === true
                        ? 'border-[#52B788] bg-[#162920]'
                        : matchState === false
                        ? 'border-[#E6A94F] bg-[#2D2316]'
                        : 'border-[#F5F3EE]/16 bg-[#14181F]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-bold text-[#E6C58D]">
                        {dial.label}
                      </span>
                      <span className="font-mono text-[#9AA3B0]">
                        {frag.runeLabel}
                      </span>
                    </div>
                    <p className="text-xs text-[#D6D0C4] leading-snug">
                      {dial.prompt}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={!allFragmentsReady || isSolved}
                        onClick={() => rotateQuadrantDial(dialIdx, -1)}
                        aria-label={`Opción anterior en ${dial.label}`}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#F5F3EE]/16 bg-[#222833] text-[#F5F3EE] hover:border-[#E6A94F] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                      </button>

                      <button
                        type="button"
                        disabled={!allFragmentsReady || isSolved}
                        onClick={() => rotateQuadrantDial(dialIdx, 1)}
                        className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-[#E6A94F]/45 bg-[#1C222B] px-2.5 py-1.5 text-center text-xs font-bold text-[#F5F3EE] disabled:border-[#F5F3EE]/15 disabled:text-[#8F97A3] disabled:cursor-not-allowed cursor-pointer"
                      >
                        <span>
                          {allFragmentsReady ? currentOption : '• • •'}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={!allFragmentsReady || isSolved}
                        onClick={() => rotateQuadrantDial(dialIdx, 1)}
                        aria-label={`Siguiente opción en ${dial.label}`}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#F5F3EE]/16 bg-[#222833] text-[#F5F3EE] hover:border-[#E6A94F] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {feedback && (
              <div
                role="status"
                className={`rounded-xl border px-4 py-3 text-xs sm:text-sm font-semibold ${
                  feedback.isError
                    ? 'border-[#E6A94F]/55 bg-[#2D2316] text-[#FAF4E8]'
                    : 'border-[#52B788]/65 bg-[#1A3528] text-[#D8F3DC]'
                }`}
              >
                {feedback.message}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F5F3EE]/12 bg-[#1E242E] px-5 py-3.5 sm:px-6">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="rounded-xl border border-[#F5F3EE]/20 px-4 py-2 text-xs font-semibold text-[#E2DDD2] hover:bg-[#2A313D] cursor-pointer"
          >
            Volver
          </button>

          {!isSolved && (
            <button
              type="button"
              disabled={!allFragmentsReady}
              onClick={handleCheckMetaLock}
              className="inline-flex items-center gap-2 rounded-xl bg-[#C67D1E] px-5 py-2.5 text-sm font-bold text-[#14181F] shadow-lg hover:bg-[#D98E2B] disabled:bg-[#3A424F] disabled:text-[#9AA3B0] disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>
                {allFragmentsReady
                  ? 'Alinear Gran Pintadera y abrir cámara'
                  : `Reúne ${4 - collectedRooms.length} fragmentos más`}
              </span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
