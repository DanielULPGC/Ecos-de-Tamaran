import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Award,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  Eye,
  EyeOff,
  Feather,
  Flame,
  Gem,
  Globe2,
  Heart,
  HeartHandshake,
  Hourglass,
  Lightbulb,
  Lock,
  Medal,
  Mountain,
  Puzzle,
  Search,
  Shapes,
  Shield,
  Ship,
  Sparkles,
  Stamp,
  StickyNote,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import {
  BadgeId,
  ExpeditionState,
  HonorAchievementIconKey,
  HonorAchievementId,
  RoomId,
} from '../types/game';
import { ROOMS_DATA } from '../data/roomsData';
import { BADGES, getExplorerById } from '../data/charactersAndBadges';
import { TRANSVERSAL_MISSIONS } from '../data/enrichmentData';
import {
  HONOR_ACHIEVEMENTS,
  evaluateHonorAchievement,
} from '../data/honorAchievements';
import {
  TIME_CAPSULES,
  TimeCapsuleDefinition,
  evaluateTimeCapsuleProgress,
} from '../data/timeCapsules';
import { TimeCapsuleViewerModal } from './TimeCapsuleViewerModal';
import { soundEngine } from '../utils/audio';
import { isRoomAccessible } from '../utils/expeditionStorage';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface ConquestsAlbumModalProps {
  state: ExpeditionState;
  muted: boolean;
  onJumpToRoom: (roomIndex: number) => void;
  onMarkHonorSeen: (ids: HonorAchievementId[]) => void;
  onMarkTimeCapsuleSeen: (roomId: RoomId) => void;
  onClose: () => void;
}

type AlbumFilter =
  | 'all'
  | 'capsules'
  | 'honor'
  | 'seals'
  | 'badges'
  | 'transversal';

const BadgeGlyph: React.FC<{ id: BadgeId; unlocked: boolean }> = ({
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

const HonorGlyph: React.FC<{
  iconKey: HonorAchievementIconKey;
  hiddenLocked: boolean;
}> = ({ iconKey, hiddenLocked }) => {
  const cls = 'h-5 w-5';
  if (hiddenLocked) return <EyeOff className={cls} aria-hidden="true" />;

  switch (iconKey) {
    case 'search':
      return <Search className={cls} aria-hidden="true" />;
    case 'brain':
      return <Brain className={cls} aria-hidden="true" />;
    case 'gem':
      return <Gem className={cls} aria-hidden="true" />;
    case 'sticky':
      return <StickyNote className={cls} aria-hidden="true" />;
    case 'heart':
      return <Heart className={cls} aria-hidden="true" />;
    case 'globe':
      return <Globe2 className={cls} aria-hidden="true" />;
    case 'feather':
      return <Feather className={cls} aria-hidden="true" />;
    case 'users':
      return <Users className={cls} aria-hidden="true" />;
  }
};

export const ConquestsAlbumModal: React.FC<ConquestsAlbumModalProps> = ({
  state,
  muted,
  onJumpToRoom,
  onMarkHonorSeen,
  onMarkTimeCapsuleSeen,
  onClose,
}) => {
  // Capture newly unlocked Muro de Honor IDs on mount so their golden glow
  // animation plays clearly for the entire visit until the student leaves.
  const initialNewlyUnlockedIds = useMemo(
    () =>
      state.unlockedHonorIds.filter((id) => !state.seenHonorIds.includes(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const unseenCapsuleRoomIds = useMemo(
    () =>
      TIME_CAPSULES.filter(
        (c) =>
          evaluateTimeCapsuleProgress(c.roomId, state.progress[c.roomId])
            .unlocked && !state.seenTimeCapsuleRooms.includes(c.roomId)
      ).map((c) => c.roomId),
    [state.progress, state.seenTimeCapsuleRooms]
  );

  const [filter, setFilter] = useState<AlbumFilter>(() =>
    unseenCapsuleRoomIds.length > 0
      ? 'capsules'
      : initialNewlyUnlockedIds.length > 0
      ? 'honor'
      : 'all'
  );
  const [selectedCapsule, setSelectedCapsule] =
    useState<TimeCapsuleDefinition | null>(null);
  const [replayCounts, setReplayCounts] = useState<
    Partial<Record<HonorAchievementId, number>>
  >({});

  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocusTrap(dialogRef, !selectedCapsule);

  const viewedHonorRef = useRef<boolean>(
    filter === 'all' || filter === 'honor'
  );
  const markHonorSeenRef = useRef(onMarkHonorSeen);
  markHonorSeenRef.current = onMarkHonorSeen;

  useEffect(() => {
    if (filter === 'all' || filter === 'honor') {
      viewedHonorRef.current = true;
    }
  }, [filter]);

  // Mark newly unlocked Muro de Honor achievements as seen once the user exits
  useEffect(() => {
    return () => {
      if (viewedHonorRef.current && initialNewlyUnlockedIds.length > 0) {
        markHonorSeenRef.current(initialNewlyUnlockedIds);
      }
    };
  }, [initialNewlyUnlockedIds]);

  const explorer = getExplorerById(state.explorerId);

  // Build flat list of all 12 historical seals (3 per room)
  const allSeals = ROOMS_DATA.flatMap((room, roomIndex) => {
    const p = state.progress[room.id];
    return [
      {
        id: `${room.id}-p1`,
        roomIndex,
        roomNumber: room.number,
        roomEpoch: room.epoch,
        roomZone: room.mapZoneLabel,
        title: room.puzzle1.sealTitle,
        subtitle: room.puzzle1.title,
        kind: 'enigma' as const,
        unlocked: p.puzzle1Solved,
      },
      {
        id: `${room.id}-p2`,
        roomIndex,
        roomNumber: room.number,
        roomEpoch: room.epoch,
        roomZone: room.mapZoneLabel,
        title: room.puzzle2.sealTitle,
        subtitle: room.puzzle2.title,
        kind: 'enigma' as const,
        unlocked: p.puzzle2Solved,
      },
      {
        id: `${room.id}-emp`,
        roomIndex,
        roomNumber: room.number,
        roomEpoch: room.epoch,
        roomZone: room.mapZoneLabel,
        title: room.empathy.sealTitle,
        subtitle: room.empathy.title,
        kind: 'empathy' as const,
        unlocked: p.empathySolved,
      },
    ];
  });

  const unlockedSealsCount = allSeals.filter((s) => s.unlocked).length;
  const unlockedBadgesCount = state.unlockedBadges.length;

  const transversalItems = ROOMS_DATA.map((room, roomIndex) => ({
    room,
    roomIndex,
    mission: TRANSVERSAL_MISSIONS[room.id as RoomId],
    solved: state.progress[room.id].transversalSolved,
  }));
  const solvedTransversalCount = transversalItems.filter((t) => t.solved).length;

  const honorItems = HONOR_ACHIEVEMENTS.map((def) => {
    const evaluation = evaluateHonorAchievement(def, state);
    const isNewlyUnlocked =
      evaluation.unlocked && initialNewlyUnlockedIds.includes(def.id);
    return {
      def,
      evaluation,
      isNewlyUnlocked,
    };
  });

  const unlockedHonorCount = honorItems.filter(
    (item) => item.evaluation.unlocked
  ).length;
  const hiddenTotalCount = honorItems.filter((item) => item.def.hidden).length;
  const hiddenUnlockedCount = honorItems.filter(
    (item) => item.def.hidden && item.evaluation.unlocked
  ).length;

  const capsuleItems = TIME_CAPSULES.map((capsule) => {
    const roomIndex = ROOMS_DATA.findIndex((r) => r.id === capsule.roomId);
    const room = ROOMS_DATA[roomIndex] ?? ROOMS_DATA[0];
    const progress = evaluateTimeCapsuleProgress(
      capsule.roomId,
      state.progress[capsule.roomId]
    );
    const isNew =
      progress.unlocked && !state.seenTimeCapsuleRooms.includes(capsule.roomId);
    return { capsule, room, roomIndex, progress, isNew };
  });

  const unlockedCapsulesCount = capsuleItems.filter(
    (item) => item.progress.unlocked
  ).length;

  const totalItems =
    allSeals.length +
    BADGES.length +
    transversalItems.length +
    HONOR_ACHIEVEMENTS.length +
    TIME_CAPSULES.length;
  const totalUnlocked =
    unlockedSealsCount +
    unlockedBadgesCount +
    solvedTransversalCount +
    unlockedHonorCount +
    unlockedCapsulesCount;
  const masteryPct = Math.round((totalUnlocked / totalItems) * 100);

  const triggerReplayShine = (id: HonorAchievementId) => {
    soundEngine.playDiscover();
    setReplayCounts((prev) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1,
    }));
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="conquests-album-title"
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
              className="h-13 w-13 rounded-xl border-2 border-[#C67D1E] object-cover shrink-0"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-[#526071]">
                <span className="inline-flex items-center gap-1 text-[#8A5410] font-bold">
                  <Trophy
                    className="h-3.5 w-3.5 text-[#C67D1E]"
                    aria-hidden="true"
                  />
                  <span>
                    {state.explorerName.trim() ||
                      `Expedición con ${explorer.name}`}
                  </span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#1D4E89] tabular-nums">
                  {unlockedSealsCount}/{allSeals.length} sellos
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#8A5410] tabular-nums">
                  {unlockedBadgesCount}/{BADGES.length} insignias
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#2A6F4E] tabular-nums">
                  {solvedTransversalCount}/{transversalItems.length} ODS 2030
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#8A5410] tabular-nums">
                  {unlockedHonorCount}/{HONOR_ACHIEVEMENTS.length} honor
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#1D4E89] tabular-nums">
                  {unlockedCapsulesCount}/{TIME_CAPSULES.length} cápsulas
                </span>
              </div>
              <h2
                id="conquests-album-title"
                className="mt-0.5 font-display text-xl font-bold text-[#171B21] sm:text-2xl truncate"
              >
                Álbum de Conquistas de Gran Canaria
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar Álbum de Conquistas"
            className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] shrink-0 cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Overall Progress Strip + Filter Tabs */}
        <div className="border-b border-[#232A34]/12 bg-[#EFECE4] px-6 py-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[#232A34]">
              Progreso total del álbum
            </span>
            <span className="font-mono font-bold text-[#1D4E89] tabular-nums">
              {totalUnlocked}/{totalItems} logros ({masteryPct}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#DFDACF]">
            <div
              className="h-full rounded-full bg-[#2A6F4E] transition-transform duration-300 origin-left"
              style={{ transform: `scaleX(${masteryPct / 100})` }}
            />
          </div>

          <div
            role="tablist"
            aria-label="Filtrar secciones del Álbum de Conquistas"
            className="flex flex-wrap items-center gap-2 pt-0.5"
          >
            {(
              [
                {
                  id: 'all',
                  label: `Vista completa (${totalUnlocked}/${totalItems})`,
                },
                {
                  id: 'capsules',
                  label:
                    unseenCapsuleRoomIds.length > 0
                      ? `Cápsulas del Tiempo (${unlockedCapsulesCount}/${TIME_CAPSULES.length}) · Nueva`
                      : `Cápsulas del Tiempo (${unlockedCapsulesCount}/${TIME_CAPSULES.length})`,
                },
                {
                  id: 'honor',
                  label:
                    initialNewlyUnlockedIds.length > 0
                      ? `Muro de Honor (${unlockedHonorCount}/${HONOR_ACHIEVEMENTS.length}) · Nuevo`
                      : `Muro de Honor (${unlockedHonorCount}/${HONOR_ACHIEVEMENTS.length})`,
                },
                {
                  id: 'seals',
                  label: `Sellos históricos (${unlockedSealsCount}/12)`,
                },
                {
                  id: 'badges',
                  label: `Insignias (${unlockedBadgesCount}/${BADGES.length})`,
                },
                {
                  id: 'transversal',
                  label: `Misiones 2030 (${solvedTransversalCount}/4)`,
                },
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
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? tab.id === 'honor' || tab.id === 'capsules'
                        ? 'bg-[#8A5410] text-white'
                        : 'bg-[#1D4E89] text-white'
                      : 'border border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#1D4E89]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Grids Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {/* SECTION: CÁPSULAS DEL TIEMPO (IMÁGENES HISTÓRICAS GENERADAS POR IA) */}
          {(filter === 'all' || filter === 'capsules') && (
            <section className="space-y-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Hourglass
                    className="h-5 w-5 text-[#C67D1E]"
                    aria-hidden="true"
                  />
                  <h3 className="font-display text-lg font-bold text-[#171B21]">
                    Cápsulas del Tiempo · Escenas Históricas de Gran Canaria
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold text-[#526071] tabular-nums">
                  {unlockedCapsulesCount} de {TIME_CAPSULES.length} abiertas
                </span>
              </div>

              <p className="text-xs leading-relaxed text-[#4A5564] max-w-3xl">
                Al completar al menos 2 desafíos en cada sala (enigmas, dilema
                empático, juego de sombras o Misión 2030), desbloqueas una
                cápsula con una ilustración histórica generada por IA sobre un
                acontecimiento clave de esa época.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {capsuleItems.map(
                  ({ capsule, room, roomIndex, progress, isNew }) => (
                    <article
                      key={capsule.roomId}
                      className={`relative flex flex-col overflow-hidden rounded-2xl border transition-colors ${
                        progress.unlocked
                          ? isNew
                            ? 'honor-unlock-lift border-[#C67D1E] bg-white shadow-md'
                            : 'border-[#C67D1E]/55 bg-white shadow-sm'
                          : 'border-dashed border-[#232A34]/24 bg-[#EFECE4]/75'
                      }`}
                    >
                      {/* Unobstructed 16:9 Artwork Frame (zero text over the image!) */}
                      {progress.unlocked ? (
                        <div className="aspect-video w-full overflow-hidden bg-[#171B21]">
                          <img
                            src={capsule.imagePath}
                            alt={capsule.imageAlt}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-[#E3DED3] px-5 text-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#232A34]/20 bg-[#F5F3EE] text-[#526071]">
                            <Lock className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div className="font-display text-sm font-bold text-[#171B21]">
                            Cápsula {capsule.capsuleNumber} sellada · Sala{' '}
                            {room.number}
                          </div>
                          <p className="max-w-xs text-xs text-[#4A5564]">
                            Completa {progress.required} desafíos en{' '}
                            <strong>{room.title}</strong> para revelar la
                            escena histórica de {room.epoch}.
                          </p>
                          <div className="mt-1 w-full max-w-[200px] space-y-1">
                            <div className="flex items-center justify-between font-mono text-[11px] text-[#526071] tabular-nums">
                              <span>Desafíos</span>
                              <span>
                                {Math.min(progress.completed, progress.required)}
                                /{progress.required}
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#CFC9BC]">
                              <div
                                className="h-full rounded-full bg-[#C67D1E] transition-transform duration-300 origin-left"
                                style={{
                                  transform: `scaleX(${Math.min(
                                    1,
                                    progress.completed / progress.required
                                  )})`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Details cleanly BELOW the image */}
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold text-[#526071]">
                            <span className="font-mono font-bold text-[#8A5410]">
                              Cápsula {capsule.capsuleNumber} · Sala{' '}
                              {room.number}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{capsule.historicalDate}</span>
                            {isNew && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-bold text-[#2A6F4E]">
                                  ¡Recién abierta!
                                </span>
                              </>
                            )}
                          </div>
                          <h4 className="mt-1 font-display text-base font-bold text-[#171B21]">
                            {progress.unlocked
                              ? capsule.title
                              : `Escena secreta de ${room.epoch}`}
                          </h4>
                          <p className="mt-1 text-xs leading-relaxed text-[#3D4754]">
                            {progress.unlocked
                              ? capsule.summary[state.cycle]
                              : `Viaja a ${room.title} y supera enigmas, el dilema empático, las sombras o la Misión 2030 para abrir esta lámina.`}
                          </p>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between border-t border-[#232A34]/10 pt-2.5 text-xs">
                          <span
                            className={`font-semibold ${
                              progress.unlocked
                                ? 'text-[#1D543A]'
                                : 'text-[#526071]'
                            }`}
                          >
                            {progress.unlocked
                              ? 'Ilustración IA desbloqueada ✓'
                              : `${Math.min(
                                  progress.completed,
                                  progress.required
                                )}/${progress.required} desafíos`}
                          </span>

                          {progress.unlocked ? (
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playDiscover();
                                onMarkTimeCapsuleSeen(capsule.roomId);
                                setSelectedCapsule(capsule);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#1D4E89] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#153A68] whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Ver cápsula</span>
                            </button>
                          ) : isRoomAccessible(state, roomIndex) ? (
                            <button
                              type="button"
                              onClick={() => onJumpToRoom(roomIndex)}
                              className="inline-flex items-center gap-1 font-bold text-[#1D4E89] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <span>Ir a Sala {room.number}</span>
                              <ArrowUpRight
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#6B7482] whitespace-nowrap shrink-0">
                              <Lock className="h-3 w-3" aria-hidden="true" />
                              <span>Abre Sala {room.number - 1}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            </section>
          )}
          {/* SECTION 0: MURO DE HONOR (RETOS OCULTOS Y ESTILO DE JUEGO) */}
          {(filter === 'all' || filter === 'honor') && (
            <section className="space-y-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Medal
                    className="h-5 w-5 text-[#C67D1E]"
                    aria-hidden="true"
                  />
                  <h3 className="font-display text-lg font-bold text-[#171B21]">
                    Muro de Honor · Retos Ocultos y Estilo de Juego
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-semibold text-[#526071] tabular-nums">
                  <span>
                    {unlockedHonorCount} de {HONOR_ACHIEVEMENTS.length} logros
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {hiddenUnlockedCount} de {hiddenTotalCount} retos ocultos
                  </span>
                  {initialNewlyUnlockedIds.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-[#8A5410]">
                        {initialNewlyUnlockedIds.length}{' '}
                        {initialNewlyUnlockedIds.length === 1
                          ? 'recién desbloqueado'
                          : 'recién desbloqueados'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-xs leading-relaxed text-[#4A5564] max-w-3xl">
                Premia tu forma personal de investigar Gran Canaria: observar con
                calma, resolver enigmas sin pistas, cuidar tus reflexiones y
                descubrir secretos. Los retos ocultos solo revelan su nombre
                cuando consigues desbloquearlos.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {honorItems.map(({ def, evaluation, isNewlyUnlocked }) => {
                  const unlocked = evaluation.unlocked;
                  const hiddenLocked = def.hidden && !unlocked;
                  const replayCount = replayCounts[def.id] ?? 0;
                  const showReplaySheen = replayCount > 0;

                  return (
                    <article
                      key={def.id}
                      className={`relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 transition-colors ${
                        unlocked
                          ? isNewlyUnlocked
                            ? 'honor-unlock-lift border-[#C67D1E] bg-[#FAF4E8] shadow-md'
                            : 'border-[#C67D1E]/65 bg-[#FAF4E8]'
                          : hiddenLocked
                          ? 'border-dashed border-[#232A34]/28 bg-[#EAE6DC]/80'
                          : 'border-[#232A34]/15 bg-white'
                      }`}
                    >
                      {/* Luminous golden glow aura on newly unlocked plaques (compositor-only) */}
                      {isNewlyUnlocked && (
                        <span
                          aria-hidden="true"
                          className="honor-halo-layer pointer-events-none absolute inset-0 rounded-xl border-2 border-[#E6A94F] bg-gradient-to-br from-[#F8DC9C]/25 via-transparent to-[#E6A94F]/20"
                        />
                      )}

                      {/* Diagonal golden sheen sweep on newly unlocked plaques */}
                      {isNewlyUnlocked && (
                        <span
                          aria-hidden="true"
                          className="honor-sheen-layer pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/75 to-transparent"
                        />
                      )}

                      {/* On-demand golden sheen replay when student clicks 'Ver brillo' */}
                      {showReplaySheen && (
                        <span
                          key={`${def.id}-shine-${replayCount}`}
                          aria-hidden="true"
                          className="honor-sheen-once pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#FFF7DE]/85 to-transparent"
                        />
                      )}

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 ${
                              unlocked
                                ? 'border-[#FFF6DC] bg-[#C67D1E] text-[#14181F]'
                                : hiddenLocked
                                ? 'border-[#232A34]/20 bg-[#D7D2C6] text-[#526071]'
                                : 'border-[#232A34]/12 bg-[#EFECE4] text-[#526071]'
                            }`}
                          >
                            <HonorGlyph
                              iconKey={def.iconKey}
                              hiddenLocked={hiddenLocked}
                            />
                          </span>

                          <div className="text-right text-[11px] leading-tight text-[#526071]">
                            <div className="font-mono font-semibold">
                              {hiddenLocked ? 'Reto oculto' : def.category}
                            </div>
                            <div className="mt-0.5 font-mono text-[10px]">
                              {isNewlyUnlocked ? (
                                <span className="font-bold text-[#8A5410]">
                                  ¡Nuevo brillo!
                                </span>
                              ) : def.hidden ? (
                                unlocked ? (
                                  <span className="text-[#8A5410] font-semibold">
                                    Secreto hallado
                                  </span>
                                ) : (
                                  <span>???</span>
                                )
                              ) : (
                                <span>Logro especial</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <h4 className="mt-3 font-display text-sm font-bold text-[#171B21] leading-snug">
                          {hiddenLocked ? 'Reto secreto por descubrir' : def.title}
                        </h4>

                        <p
                          className={`mt-1 text-xs leading-relaxed ${
                            hiddenLocked
                              ? 'italic text-[#4A5564]'
                              : 'text-[#3D4754]'
                          }`}
                        >
                          {hiddenLocked ? def.mysteryHint : def.description}
                        </p>

                        {/* Progress bar for visible locked challenges */}
                        {!unlocked && !hiddenLocked && (
                          <div className="mt-3 space-y-1">
                            <div className="flex items-center justify-between font-mono text-[11px] text-[#526071] tabular-nums">
                              <span>Avance</span>
                              <span>
                                {evaluation.current}/{evaluation.target}
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DFDACF]">
                              <div
                                className="h-full rounded-full bg-[#C67D1E] transition-transform duration-300 origin-left"
                                style={{
                                  transform: `scaleX(${
                                    evaluation.progressPct / 100
                                  })`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="relative z-10 mt-3.5 flex items-center justify-between border-t border-[#232A34]/10 pt-2.5 text-[11px]">
                        <span
                          className={`font-semibold tabular-nums ${
                            unlocked
                              ? 'text-[#1D543A]'
                              : hiddenLocked
                              ? 'text-[#526071]'
                              : 'text-[#6B7482]'
                          }`}
                        >
                          {unlocked
                            ? `Desbloqueado ✓ · ${evaluation.target}/${evaluation.target}`
                            : hiddenLocked
                            ? 'Por descubrir'
                            : 'En curso'}
                        </span>

                        {unlocked && (
                          <button
                            type="button"
                            onClick={() => triggerReplayShine(def.id)}
                            aria-label={`Repetir animación de brillo de ${def.title}`}
                            className="inline-flex items-center gap-1 font-bold text-[#8A5410] hover:text-[#5E3808] whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <Sparkles
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            <span>Brillo</span>
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 1: HISTORICAL SEALS GRID (12) */}
          {(filter === 'all' || filter === 'seals') && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Stamp
                    className="h-5 w-5 text-[#1D4E89]"
                    aria-hidden="true"
                  />
                  <h3 className="font-display text-lg font-bold text-[#171B21]">
                    Sellos Históricos de las 4 Épocas
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold text-[#526071] tabular-nums">
                  {unlockedSealsCount} de 12 desbloqueados
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {allSeals.map((seal) => {
                  const isEmpathy = seal.kind === 'empathy';
                  return (
                    <article
                      key={seal.id}
                      className={`flex flex-col justify-between rounded-xl border p-3.5 transition-colors ${
                        seal.unlocked
                          ? isEmpathy
                            ? 'border-[#C67D1E]/55 bg-[#FAF4E8]'
                            : 'border-[#2A6F4E]/45 bg-[#E8F3EC]'
                          : 'border-dashed border-[#232A34]/22 bg-[#EFECE4]/65'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                              seal.unlocked
                                ? isEmpathy
                                  ? 'border-[#F6EAD7] bg-[#C67D1E] text-[#14181F]'
                                  : 'border-[#D8F3DC] bg-[#2A6F4E] text-white'
                                : 'border-[#232A34]/20 bg-[#E1DDD3] text-[#6B7482]'
                            }`}
                          >
                            {seal.unlocked ? (
                              isEmpathy ? (
                                <HeartHandshake
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              ) : (
                                <CheckCircle2
                                  className="h-4 w-4"
                                  aria-hidden="true"
                                />
                              )
                            ) : (
                              <Lock className="h-4 w-4" aria-hidden="true" />
                            )}
                          </span>

                          <span className="font-mono text-[11px] font-semibold text-[#526071] tabular-nums">
                            Sala {seal.roomNumber} · {seal.roomZone}
                          </span>
                        </div>

                        <h4 className="mt-2.5 text-sm font-bold text-[#171B21] leading-snug">
                          {seal.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-[#4A5564] leading-snug">
                          {seal.subtitle}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[#232A34]/10 pt-2 text-[11px]">
                        <span
                          className={`font-semibold ${
                            seal.unlocked ? 'text-[#1D543A]' : 'text-[#6B7482]'
                          }`}
                        >
                          {seal.unlocked ? 'Sello estampado ✓' : 'Pendiente'}
                        </span>
                        {!seal.unlocked &&
                          (isRoomAccessible(state, seal.roomIndex) ? (
                            <button
                              type="button"
                              onClick={() => onJumpToRoom(seal.roomIndex)}
                              className="inline-flex items-center gap-0.5 font-bold text-[#1D4E89] hover:underline cursor-pointer"
                            >
                              <span>Ir</span>
                              <ArrowUpRight
                                className="h-3 w-3"
                                aria-hidden="true"
                              />
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#6B7482]">
                              <Lock className="h-3 w-3" aria-hidden="true" />
                              <span>Bloqueada</span>
                            </span>
                          ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 2: COLLECTIBLE BADGES GRID (10) */}
          {(filter === 'all' || filter === 'badges') && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award
                    className="h-5 w-5 text-[#C67D1E]"
                    aria-hidden="true"
                  />
                  <h3 className="font-display text-lg font-bold text-[#171B21]">
                    Insignias Coleccionables de Exploración
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold text-[#526071] tabular-nums">
                  {unlockedBadgesCount} de {BADGES.length} conseguidas
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {BADGES.map((badge) => {
                  const unlocked = state.unlockedBadges.includes(badge.id);
                  return (
                    <article
                      key={badge.id}
                      className={`flex flex-col items-center rounded-xl border p-4 text-center transition-colors ${
                        unlocked
                          ? 'border-[#C67D1E]/65 bg-white shadow-sm'
                          : 'border-dashed border-[#232A34]/20 bg-[#EFECE4]/65 opacity-80'
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                          unlocked
                            ? badge.kind === 'epoch'
                              ? 'border-[#F6EAD7] bg-[#1D4E89] text-[#F6EAD7]'
                              : 'border-[#FAF4E8] bg-[#C67D1E] text-[#14181F]'
                            : 'border-[#232A34]/20 bg-[#E1DDD3] text-[#6B7482]'
                        }`}
                      >
                        <BadgeGlyph id={badge.id} unlocked={unlocked} />
                      </div>
                      <h4 className="mt-2.5 text-xs font-bold text-[#171B21] leading-snug">
                        {badge.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-[#4A5564] leading-snug">
                        {badge.subtitle}
                      </p>
                      <span
                        className={`mt-2.5 inline-flex items-center gap-1 font-mono text-[10px] font-bold ${
                          unlocked ? 'text-[#2A6F4E]' : 'text-[#6B7482]'
                        }`}
                      >
                        {unlocked ? (
                          <>
                            <Sparkles
                              className="h-3 w-3"
                              aria-hidden="true"
                            />
                            <span>Desbloqueada</span>
                          </>
                        ) : (
                          <span>Por descubrir</span>
                        )}
                      </span>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 3: TRANSVERSAL MISSIONS GRID (4 · AGENDA CANARIA 2030) */}
          {(filter === 'all' || filter === 'transversal') && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Globe2
                    className="h-5 w-5 text-[#2A6F4E]"
                    aria-hidden="true"
                  />
                  <h3 className="font-display text-lg font-bold text-[#171B21]">
                    Misiones Transversales · Agenda Canaria 2030
                  </h3>
                </div>
                <span className="font-mono text-xs font-semibold text-[#526071] tabular-nums">
                  {solvedTransversalCount} de {transversalItems.length}{' '}
                  completadas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {transversalItems.map(({ room, roomIndex, mission, solved }) => (
                  <article
                    key={room.id}
                    className={`flex flex-col justify-between rounded-xl border p-4 transition-colors ${
                      solved
                        ? 'border-[#2A6F4E]/55 bg-[#E8F3EC]'
                        : 'border-[#232A34]/15 bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-mono text-[11px] font-bold text-[#1D543A]">
                            Sala {room.number} · {mission.axis}
                          </div>
                          <div className="text-[11px] text-[#526071]">
                            {mission.odsTag}
                          </div>
                        </div>
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            solved
                              ? 'bg-[#2A6F4E] text-white'
                              : 'bg-[#EAE6DC] text-[#6B7482]'
                          }`}
                        >
                          {solved ? (
                            <CheckCircle2
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          ) : (
                            <Lock className="h-4 w-4" aria-hidden="true" />
                          )}
                        </span>
                      </div>

                      <h4 className="font-display text-base font-bold text-[#171B21]">
                        {mission.title}
                      </h4>

                      {/* Visual per-mission status bar */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DFDACF]">
                        <div
                          className={`h-full rounded-full transition-transform duration-300 origin-left ${
                            solved ? 'bg-[#2A6F4E]' : 'bg-[#C67D1E]/40'
                          }`}
                          style={{ transform: `scaleX(${solved ? 1 : 0.12})` }}
                        />
                      </div>

                      {solved ? (
                        <p className="text-xs leading-relaxed text-[#1D543A] font-medium pt-0.5">
                          {mission.actionTip}
                        </p>
                      ) : (
                        <p className="text-xs text-[#526071] pt-0.5">
                          Abre el botón <strong>Misión 2030</strong> dentro de{' '}
                          {room.title} para completar este reto transversal.
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#232A34]/10 pt-2.5 text-xs">
                      <span
                        className={`font-bold ${
                          solved ? 'text-[#1D543A]' : 'text-[#8A5410]'
                        }`}
                      >
                        {solved ? 'Completada ✓' : 'Sin completar'}
                      </span>
                      {isRoomAccessible(state, roomIndex) ? (
                        <button
                          type="button"
                          onClick={() => onJumpToRoom(roomIndex)}
                          className="inline-flex items-center gap-1 font-bold text-[#1D4E89] hover:underline cursor-pointer"
                        >
                          <span>
                            {solved
                              ? `Revisar Sala ${room.number}`
                              : `Ir a Sala ${room.number}`}
                          </span>
                          <ArrowUpRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#6B7482]">
                          <Lock className="h-3 w-3" aria-hidden="true" />
                          <span>Sala bloqueada</span>
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <span className="text-xs text-[#526071]">
            Abre tus Cápsulas del Tiempo para inspeccionar cada escena histórica
            o pulsa «Ir» en cualquier reto pendiente.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#232A34] px-5 py-2 text-sm font-semibold text-[#F5F3EE] hover:bg-[#171B21] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Volver al menú de pausa
          </button>
        </div>
      </div>

      {selectedCapsule && (
        <TimeCapsuleViewerModal
          capsule={selectedCapsule}
          cycle={state.cycle}
          muted={muted}
          onClose={() => setSelectedCapsule(null)}
        />
      )}
    </div>
  );
};
