import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  Eye,
  Flame,
  Gem,
  Globe2,
  HeartHandshake,
  Lightbulb,
  Lock,
  Mountain,
  Puzzle,
  Shapes,
  Shield,
  Ship,
  Sparkles,
  Stamp,
  Volume2,
  X,
} from 'lucide-react';
import {
  AtlasModalTab,
  BadgeDefinition,
  BadgeId,
  ExpeditionState,
} from '../types/game';
import {
  BADGES,
  evaluateBadgeProgress,
  getExplorerById,
} from '../data/charactersAndBadges';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

export type AchievementNavigationTarget =
  | { type: 'room'; roomIndex: number }
  | { type: 'atlas'; tab: AtlasModalTab }
  | { type: 'jigsaw' };

interface ExplorerAchievementsModalProps {
  state: ExpeditionState;
  onMarkBadgesSeen: (ids: BadgeId[]) => void;
  onNavigateTarget: (target: AchievementNavigationTarget) => void;
  onClose: () => void;
}

type AchievementsFilter =
  | 'all'
  | 'unlocked'
  | 'locked'
  | 'epoch'
  | 'attitude'
  | 'challenge';

const BadgeMedalIcon: React.FC<{ id: BadgeId; unlocked: boolean }> = ({
  id,
  unlocked,
}) => {
  const cls = 'h-5 w-5';
  if (!unlocked) return <Lock className={cls} aria-hidden="true" />;

  switch (id) {
    case 'sello-aborigen':
      return <Stamp className={cls} aria-hidden="true" />;
    case 'sello-conquista':
      return <Compass className={cls} aria-hidden="true" />;
    case 'sello-pirateria':
      return <Flame className={cls} aria-hidden="true" />;
    case 'sello-sigloXX':
      return <Ship className={cls} aria-hidden="true" />;
    case 'ojo-explorador':
      return <Eye className={cls} aria-hidden="true" />;
    case 'corazon-empatico':
      return <HeartHandshake className={cls} aria-hidden="true" />;
    case 'mente-critica':
      return <Lightbulb className={cls} aria-hidden="true" />;
    case 'guardian-tamaran':
      return <Shield className={cls} aria-hidden="true" />;
    case 'agenda-2030':
      return <Globe2 className={cls} aria-hidden="true" />;
    case 'tesoro-canario':
      return <Gem className={cls} aria-hidden="true" />;
    case 'maestro-sombras':
      return <Shapes className={cls} aria-hidden="true" />;
    case 'explorador-natural':
      return <Mountain className={cls} aria-hidden="true" />;
    case 'cronista-tiempo':
      return <Clock className={cls} aria-hidden="true" />;
    case 'restaurador-mural':
      return <Puzzle className={cls} aria-hidden="true" />;
  }
};

function getKindLabel(kind: BadgeDefinition['kind']): string {
  switch (kind) {
    case 'epoch':
      return 'Época histórica';
    case 'attitude':
      return 'Actitud y empatía';
    case 'challenge':
      return 'Reto específico';
  }
}

function getNavigationForBadge(
  id: BadgeId,
  currentRoomIndex: number
): { label: string; target: AchievementNavigationTarget } {
  switch (id) {
    case 'sello-aborigen':
      return { label: 'Ir a Sala 1', target: { type: 'room', roomIndex: 0 } };
    case 'sello-conquista':
      return { label: 'Ir a Sala 2', target: { type: 'room', roomIndex: 1 } };
    case 'sello-pirateria':
      return { label: 'Ir a Sala 3', target: { type: 'room', roomIndex: 2 } };
    case 'sello-sigloXX':
      return { label: 'Ir a Sala 4', target: { type: 'room', roomIndex: 3 } };
    case 'mente-critica':
      return { label: 'Ir a Sala 2', target: { type: 'room', roomIndex: 1 } };
    case 'explorador-natural':
      return {
        label: 'Abrir Atlas Natural',
        target: { type: 'atlas', tab: 'medio-natural' },
      };
    case 'cronista-tiempo':
      return {
        label: 'Abrir Línea del Tiempo',
        target: { type: 'atlas', tab: 'linea-tiempo' },
      };
    case 'restaurador-mural':
      return { label: 'Abrir Puzles', target: { type: 'jigsaw' } };
    default:
      return {
        label: `Explorar Sala ${currentRoomIndex + 1}`,
        target: { type: 'room', roomIndex: currentRoomIndex },
      };
  }
}

function getExplorerRankLabel(unlockedCount: number, total: number): string {
  const ratio = unlockedCount / Math.max(1, total);
  if (ratio >= 0.9) return 'Leyenda de Tamarán';
  if (ratio >= 0.65) return 'Vigía de Gran Canaria';
  if (ratio >= 0.35) return 'Cronista en Ruta';
  if (unlockedCount >= 1) return 'Rastreador en Marcha';
  return 'Inicio de Expedición';
}

export const ExplorerAchievementsModal: React.FC<
  ExplorerAchievementsModalProps
> = ({ state, onMarkBadgesSeen, onNavigateTarget, onClose }) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocusTrap(dialogRef, true);

  // Freeze newly unlocked unseen badges on mount so their celebration animation
  // remains visible during the entire visit and clears smoothly on close.
  const initialNewlyUnlockedIds = useMemo(
    () =>
      state.unlockedBadges.filter(
        (id) => !(state.seenBadgeIds ?? []).includes(id)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [filter, setFilter] = useState<AchievementsFilter>('all');
  const [replayCounts, setReplayCounts] = useState<
    Partial<Record<BadgeId, number>>
  >({});

  const markSeenRef = useRef(onMarkBadgesSeen);
  markSeenRef.current = onMarkBadgesSeen;

  useEffect(() => {
    if (initialNewlyUnlockedIds.length > 0) {
      soundEngine.playBadgeUnlock();
    }
    return () => {
      stopSpeaking();
      if (initialNewlyUnlockedIds.length > 0) {
        markSeenRef.current(initialNewlyUnlockedIds);
      }
    };
  }, [initialNewlyUnlockedIds]);

  const explorer = getExplorerById(state.explorerId);
  const speechAvailable = isSpeechSupported();

  const evaluatedBadges = useMemo(
    () =>
      BADGES.map((badge) => {
        const progress = evaluateBadgeProgress(badge.id, state);
        const isNewlyUnlocked =
          progress.unlocked && initialNewlyUnlockedIds.includes(badge.id);
        return { badge, progress, isNewlyUnlocked };
      }),
    [state, initialNewlyUnlockedIds]
  );

  const unlockedItems = evaluatedBadges.filter((b) => b.progress.unlocked);
  const lockedItems = evaluatedBadges.filter((b) => !b.progress.unlocked);
  const newlyUnlockedItems = evaluatedBadges.filter((b) => b.isNewlyUnlocked);

  const totalCount = BADGES.length;
  const unlockedCount = unlockedItems.length;
  const pct = Math.round((unlockedCount / totalCount) * 100);
  const rankLabel = getExplorerRankLabel(unlockedCount, totalCount);

  const filteredItems = useMemo(() => {
    return evaluatedBadges.filter(({ badge, progress }) => {
      if (filter === 'unlocked') return progress.unlocked;
      if (filter === 'locked') return !progress.unlocked;
      if (filter === 'epoch') return badge.kind === 'epoch';
      if (filter === 'attitude') return badge.kind === 'attitude';
      if (filter === 'challenge') return badge.kind === 'challenge';
      return true;
    });
  }, [evaluatedBadges, filter]);

  const triggerReplayAnimation = (id: BadgeId) => {
    soundEngine.playBadgeUnlock();
    setReplayCounts((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1,
    }));
  };

  const handleReadSummary = () => {
    const newMsg =
      newlyUnlockedItems.length > 0
        ? `Tienes ${newlyUnlockedItems.length} ${
            newlyUnlockedItems.length === 1
              ? 'insignia recién desbloqueada'
              : 'insignias recién desbloqueadas'
          }: ${newlyUnlockedItems.map((i) => i.badge.title).join(', ')}. `
        : '';
    speakText(
      `Logros de Explorador. ${newMsg}Has conseguido ${unlockedCount} de ${totalCount} insignias, con rango ${rankLabel}.`,
      state.muted
    );
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="explorer-achievements-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/86 p-3 sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Archival Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={explorer.portraitPath}
              alt={explorer.name}
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-xl border-2 border-[#C67D1E] object-cover shrink-0"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-[#526071]">
                <span className="inline-flex items-center gap-1 font-bold text-[#8A5410]">
                  <Award className="h-3.5 w-3.5 text-[#C67D1E]" aria-hidden="true" />
                  <span>{rankLabel}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#1D4E89] tabular-nums">
                  {unlockedCount}/{totalCount} insignias ({pct}%)
                </span>
                {newlyUnlockedItems.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-bold text-[#2A6F4E]">
                      ¡{newlyUnlockedItems.length}{' '}
                      {newlyUnlockedItems.length === 1
                        ? 'nuevo logro'
                        : 'nuevos logros'}
                      !
                    </span>
                  </>
                )}
              </div>
              <h2
                id="explorer-achievements-title"
                className="mt-0.5 font-display text-xl font-bold text-[#171B21] sm:text-2xl truncate"
              >
                Logros de Explorador
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {speechAvailable && (
              <button
                type="button"
                onClick={handleReadSummary}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#232A34]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#1D4E89] hover:border-[#1D4E89] whitespace-nowrap cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Escuchar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar Logros de Explorador"
              className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Progress Bar + Filter Tabs */}
        <div className="border-b border-[#232A34]/12 bg-[#EFECE4] px-6 py-3 space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#232A34]">
                Progreso de insignias de la expedición
              </span>
              <span className="font-mono font-bold text-[#1D4E89] tabular-nums">
                {unlockedCount} de {totalCount} ({pct}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#DFDACF]">
              <div
                className="h-full rounded-full bg-[#C67D1E] transition-transform duration-300 origin-left"
                style={{ transform: `scaleX(${pct / 100})` }}
              />
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Filtrar logros de explorador"
            className="flex flex-wrap items-center gap-1.5"
          >
            {(
              [
                { id: 'all', label: `Todas (${totalCount})` },
                { id: 'unlocked', label: `Obtenidas (${unlockedCount})` },
                {
                  id: 'locked',
                  label: `Por desbloquear (${lockedItems.length})`,
                },
                { id: 'epoch', label: 'Épocas (4)' },
                { id: 'attitude', label: 'Actitudes (4)' },
                { id: 'challenge', label: 'Retos (6)' },
              ] as const
            ).map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    soundEngine.playClick();
                    setFilter(tab.id);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#1D4E89] text-white'
                      : 'border border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#1D4E89]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Newly Unlocked Animated Celebration Spotlight */}
          {newlyUnlockedItems.length > 0 && (
            <section
              aria-live="polite"
              className="honor-unlock-lift relative overflow-hidden rounded-2xl border border-[#C67D1E] bg-[#171B21] p-4 sm:p-5 text-[#F5F3EE]"
            >
              <span
                aria-hidden="true"
                className="honor-sheen-layer pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-transparent via-[#F8DC9C]/25 to-transparent"
              />
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-mono text-xs font-bold text-[#F3C876]">
                    ¡Nuevo logro desbloqueado!
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#F5F3EE]">
                    {newlyUnlockedItems.length === 1
                      ? `Has conseguido la insignia «${newlyUnlockedItems[0].badge.title}»`
                      : `Has conseguido ${newlyUnlockedItems.length} nuevas insignias de explorador`}
                  </h3>
                  <p className="text-xs text-[#D5DCE4]">
                    {newlyUnlockedItems
                      .map((item) => item.badge.subtitle)
                      .join(' · ')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {newlyUnlockedItems.slice(0, 3).map(({ badge }) => (
                    <div
                      key={badge.id}
                      className="relative flex h-12 w-12 items-center justify-center"
                    >
                      <span
                        aria-hidden="true"
                        className="badge-ring-burst pointer-events-none absolute inset-0 rounded-full border-2 border-[#F3C876]"
                      />
                      <span className="badge-medal-pop flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#FFF4D6] bg-[#C67D1E] text-[#14181F]">
                        <BadgeMedalIcon id={badge.id} unlocked />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Badges List / Grid */}
          {filteredItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#232A34]/20 bg-white p-8 text-center text-sm text-[#526071]">
              Aún no hay insignias en esta categoría. Completa retos en las
              salas, el Atlas Natural o la Línea del Tiempo para desbloquearlas.
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map(({ badge, progress, isNewlyUnlocked }) => {
                const replayCount = replayCounts[badge.id] ?? 0;
                const animateUnlock = isNewlyUnlocked || replayCount > 0;
                const nav = getNavigationForBadge(
                  badge.id,
                  state.currentRoomIndex
                );

                return (
                  <article
                    key={badge.id}
                    className={`relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 transition-colors ${
                      progress.unlocked
                        ? isNewlyUnlocked
                          ? 'honor-unlock-lift border-[#C67D1E] bg-[#FAF4E8] shadow-md'
                          : 'border-[#C67D1E]/55 bg-white shadow-sm'
                        : 'border-[#232A34]/15 bg-[#EFECE4]/75'
                    }`}
                  >
                    {/* Golden unlock sheen sweep when newly earned or replayed */}
                    {animateUnlock && (
                      <span
                        key={`${badge.id}-sheen-${replayCount}`}
                        aria-hidden="true"
                        className="honor-sheen-once pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#FFF7DE]/80 to-transparent"
                      />
                    )}

                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        {/* Medallion with burst ring & spark animation */}
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                          {animateUnlock && (
                            <>
                              <span
                                key={`${badge.id}-ring-${replayCount}`}
                                aria-hidden="true"
                                className="badge-ring-burst pointer-events-none absolute inset-0 rounded-full border-2 border-[#C67D1E]"
                              />
                              <span
                                key={`${badge.id}-spark-${replayCount}`}
                                aria-hidden="true"
                                className="badge-spark-float pointer-events-none absolute -top-1 -right-1 text-[#C67D1E]"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                              </span>
                            </>
                          )}
                          <span
                            key={`${badge.id}-medal-${replayCount}`}
                            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                              animateUnlock ? 'badge-medal-pop' : ''
                            } ${
                              progress.unlocked
                                ? badge.kind === 'epoch'
                                  ? 'border-[#F6EAD7] bg-[#1D4E89] text-[#F6EAD7]'
                                  : badge.kind === 'challenge'
                                  ? 'border-[#D8F3DC] bg-[#2A6F4E] text-white'
                                  : 'border-[#FFF6DC] bg-[#C67D1E] text-[#14181F]'
                                : 'border-[#232A34]/18 bg-[#DDD8CC] text-[#6B7482]'
                            }`}
                          >
                            <BadgeMedalIcon
                              id={badge.id}
                              unlocked={progress.unlocked}
                            />
                          </span>
                        </div>

                        <div className="text-right text-[11px] text-[#526071]">
                          <div className="font-mono font-semibold">
                            {getKindLabel(badge.kind)}
                          </div>
                          <div className="mt-0.5 font-mono text-[10px]">
                            {isNewlyUnlocked ? (
                              <span className="font-bold text-[#8A5410]">
                                ¡Recién obtenida!
                              </span>
                            ) : progress.unlocked ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-[#1D543A]">
                                <CheckCircle2
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                                <span>Obtenida</span>
                              </span>
                            ) : (
                              <span className="tabular-nums">
                                {progress.current}/{progress.target}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <h3 className="mt-3 font-display text-base font-bold text-[#171B21] leading-snug">
                        {badge.title}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-[#3D4754]">
                        {badge.subtitle}
                      </p>
                      {badge.requirementDetail && (
                        <p className="mt-1 text-[11px] leading-relaxed text-[#526071]">
                          {badge.requirementDetail}
                        </p>
                      )}

                      {!progress.unlocked && (
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between font-mono text-[11px] text-[#526071] tabular-nums">
                            <span>Progreso</span>
                            <span>
                              {progress.current}/{progress.target}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DAD4C8]">
                            <div
                              className="h-full rounded-full bg-[#1D4E89] transition-transform duration-300 origin-left"
                              style={{
                                transform: `scaleX(${
                                  progress.progressPct / 100
                                })`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10 mt-3.5 flex items-center justify-between border-t border-[#232A34]/10 pt-2.5 text-xs">
                      {progress.unlocked ? (
                        <>
                          <span className="font-semibold text-[#1D543A]">
                            Insignia lograda ✓
                          </span>
                          <button
                            type="button"
                            onClick={() => triggerReplayAnimation(badge.id)}
                            aria-label={`Repetir animación de ${badge.title}`}
                            className="inline-flex items-center gap-1 font-bold text-[#8A5410] hover:text-[#5E3808] whitespace-nowrap cursor-pointer"
                          >
                            <Sparkles
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            <span>Ver brillo</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[#526071]">Por desbloquear</span>
                          <button
                            type="button"
                            onClick={() => onNavigateTarget(nav.target)}
                            className="inline-flex items-center gap-1 font-bold text-[#1D4E89] hover:underline whitespace-nowrap cursor-pointer"
                          >
                            <span>{nav.label}</span>
                            <ArrowUpRight
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <span className="text-xs text-[#526071]">
            Cada reto completado desbloquea una insignia con animación en tu
            expediente de Gran Canaria.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#232A34] px-5 py-2 text-sm font-semibold text-[#F5F3EE] hover:bg-[#171B21] whitespace-nowrap cursor-pointer"
          >
            Volver al menú de pausa
          </button>
        </div>
      </div>
    </div>
  );
};
