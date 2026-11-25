import React, { useEffect, useRef, useState } from 'react';
import {
  Accessibility,
  ArrowRight,
  Backpack,
  Bell,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  Compass,
  Gem,
  Globe2,
  Headphones,
  Heart,
  HeartHandshake,
  Hourglass,
  IdCard,
  KeyRound,
  Lock,
  LockOpen,
  Map,
  Pause,
  Puzzle,
  Search,
  Shapes,
  Ship,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  Waves,
  Wind,
} from 'lucide-react';
import {
  CanarianCollectible,
  CharacterReactionId,
  CycleId,
  ExplorerProfile,
  RoomData,
  RoomEmotionCheck,
  RoomHotspot,
  RoomProgress,
} from '../types/game';
import { BADGES } from '../data/charactersAndBadges';
import { getMoodById } from '../data/enrichmentData';
import { formatEscapeTime } from '../data/escapeLocks';
import { getDifficultyProfile } from '../data/difficultyConfig';
import { RoomShadowChallenge } from '../data/shadowMatchData';
import { CHARACTER_REACTION_META } from '../data/characterReactions';
import { ExplorerReactionAvatar } from './ExplorerReactionAvatar';
import { RoomAtmosphereParticles } from './RoomAtmosphereParticles';
import { isSpeechSupported, speakText } from '../utils/speech';
import { AMBIENT_SOUNDSCAPE_META } from '../utils/ambientAudio';

interface RoomStageProps {
  room: RoomData;
  totalRooms: number;
  cycle: CycleId;
  explorer: ExplorerProfile;
  reaction: CharacterReactionId;
  reactionPulseKey: number;
  companionLine: string;
  badgesCount: number;
  unseenPauseAlerts: number;
  elapsedSeconds: number;
  showEscapeTimer: boolean;
  missionsCompleted: number;
  missionsTotal: number;
  currentJigsawSolved: boolean;
  currentCapsuleUnlocked: boolean;
  currentCapsuleIsNew: boolean;
  progress: RoomProgress;
  collectible: CanarianCollectible;
  shadowChallenge: RoomShadowChallenge;
  roomEmotion?: RoomEmotionCheck;
  muted: boolean;
  voiceAuto: boolean;
  ambientEnabled: boolean;
  onHoverReaction?: (reaction: CharacterReactionId | null) => void;
  onTapAvatar?: () => void;
  onSelectHotspot: (hotspot: RoomHotspot) => void;
  onSelectCollectible: () => void;
  onSelectShadow: () => void;
  onOpenExitLock: () => void;
  onOpenMissionLog: () => void;
  onOpenJigsaw: () => void;
  onOpenTimeCapsule: () => void;
  onOpenTransversal: () => void;
  onOpenAssembly: () => void;
  onOpenDua: () => void;
  onOpenThermometer: () => void;
  onOpenMap: () => void;
  onOpenJournal: () => void;
  onOpenCharacterSheet: () => void;
  onOpenTeacherGuide: () => void;
  onOpenPause: () => void;
  onToggleMute: () => void;
  onToggleVoiceAuto: () => void;
  onToggleAmbient: () => void;
  onAdvanceRoom: () => void;
  onInspectCollectedClue: () => void;
}

export const RoomStage: React.FC<RoomStageProps> = ({
  room,
  totalRooms,
  cycle,
  explorer,
  reaction,
  reactionPulseKey,
  companionLine,
  badgesCount,
  unseenPauseAlerts,
  elapsedSeconds,
  showEscapeTimer,
  missionsCompleted,
  missionsTotal,
  currentJigsawSolved,
  currentCapsuleUnlocked,
  currentCapsuleIsNew,
  progress,
  collectible,
  shadowChallenge,
  roomEmotion,
  muted,
  voiceAuto,
  ambientEnabled,
  onHoverReaction,
  onTapAvatar,
  onSelectHotspot,
  onSelectCollectible,
  onSelectShadow,
  onOpenExitLock,
  onOpenMissionLog,
  onOpenJigsaw,
  onOpenTimeCapsule,
  onOpenTransversal,
  onOpenAssembly,
  onOpenDua,
  onOpenThermometer,
  onOpenMap,
  onOpenJournal,
  onOpenCharacterSheet,
  onOpenTeacherGuide,
  onOpenPause,
  onToggleMute,
  onToggleVoiceAuto,
  onToggleAmbient,
  onAdvanceRoom,
  onInspectCollectedClue,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [cluesOpen, setCluesOpen] = useState(false);
  const [backpackOpen, setBackpackOpen] = useState(false);

  const cluesRef = useRef<HTMLDivElement | null>(null);
  const backpackRef = useRef<HTMLDivElement | null>(null);
  const playfieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setImgFailed(false);
    setCluesOpen(false);
    setBackpackOpen(false);
  }, [room.id]);

  useEffect(() => {
    if (!cluesOpen && !backpackOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        cluesOpen &&
        cluesRef.current &&
        target &&
        !cluesRef.current.contains(target)
      ) {
        setCluesOpen(false);
      }
      if (
        backpackOpen &&
        backpackRef.current &&
        target &&
        !backpackRef.current.contains(target)
      ) {
        setBackpackOpen(false);
      }
    };
    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, [cluesOpen, backpackOpen]);

  const speechAvailable = isSpeechSupported();
  const activeMood = getMoodById(roomEmotion?.after ?? roomEmotion?.before);
  const ambientMeta = AMBIENT_SOUNDSCAPE_META[room.id];
  const reactionMeta = CHARACTER_REACTION_META[reaction];

  const renderAmbientIcon = () => {
    const cls = `h-4 w-4 ${
      ambientEnabled && !muted ? 'text-[#74C69D]' : 'text-[#9AA3B0]'
    }`;
    switch (ambientMeta.iconKey) {
      case 'wind':
        return <Wind className={cls} aria-hidden="true" />;
      case 'bell':
        return <Bell className={cls} aria-hidden="true" />;
      case 'waves':
        return <Waves className={cls} aria-hidden="true" />;
      case 'ship':
        return <Ship className={cls} aria-hidden="true" />;
    }
  };

  const sealsUnlocked =
    Number(progress.puzzle1Solved) +
    Number(progress.puzzle2Solved) +
    Number(progress.empathySolved);
  const allSealsUnlocked = sealsUnlocked === 3;
  const cluesCollectedCount =
    Number(progress.clueFound) + Number(progress.shadowSolved);

  const nextCoreLabel = !progress.puzzle1Solved
    ? room.puzzle1.sealTitle
    : !progress.puzzle2Solved
    ? room.puzzle2.sealTitle
    : !progress.empathySolved
    ? room.empathy.sealTitle
    : !progress.doorUnlocked
    ? 'Abrir cerrojo de salida'
    : null;

  const isHotspotDone = (hotspot: RoomHotspot) => {
    if (hotspot.kind === 'clue') return progress.clueFound;
    if (hotspot.kind === 'puzzle1') return progress.puzzle1Solved;
    if (hotspot.kind === 'puzzle2') return progress.puzzle2Solved;
    return progress.empathySolved;
  };

  const getHotspotIcon = (kind: RoomHotspot['kind'], done: boolean) => {
    if (done) return <CheckCircle2 className="h-5 w-5" aria-hidden="true" />;
    if (kind === 'clue') return <Search className="h-4 w-4" aria-hidden="true" />;
    if (kind === 'empathy')
      return <HeartHandshake className="h-4 w-4" aria-hidden="true" />;
    return <Compass className="h-4 w-4" aria-hidden="true" />;
  };

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-[#14181F] text-[#F5F3EE] select-none">
      {/* Focused Escape Room Top HUD */}
      <header className="shrink-0 z-30 flex flex-wrap items-center justify-between gap-2.5 border-b border-[#F5F3EE]/12 bg-[#171B21] px-3 py-2 sm:px-5">
        {/* Left: Room identity, live Escape Timer & 3 Lock Bolts */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-mono text-xs font-semibold text-[#E6A94F] tabular-nums">
              Sala {room.number}/{totalRooms}
            </span>
            <span aria-hidden="true" className="text-[#6F7885]">
              ·
            </span>
            <h1 className="font-display text-base font-semibold text-[#F5F3EE] sm:text-lg">
              {room.title}
            </h1>
            <span aria-hidden="true" className="hidden md:inline text-[#6F7885]">
              ·
            </span>
            <span className="hidden md:inline text-xs text-[#C7C1B5]">
              {room.years} · {getDifficultyProfile(cycle).levelName}
            </span>
            {showEscapeTimer && (
              <>
                <span aria-hidden="true" className="text-[#6F7885]">
                  ·
                </span>
                <span
                  title="Tiempo de exploración en el Escape Room (sin límite ni penalización)"
                  className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#90CAF9] tabular-nums"
                >
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{formatEscapeTime(elapsedSeconds)}</span>
                </span>
              </>
            )}
          </div>

          {/* 3 Seal Lock Bolts status */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1">
              {progress.puzzle1Solved ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-[#52B788]" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-[#9AA3B0]" />
              )}
              <span
                className={
                  progress.puzzle1Solved
                    ? 'font-medium text-[#D8F3DC]'
                    : 'text-[#C7C1B5]'
                }
              >
                {room.puzzle1.sealTitle}
              </span>
            </span>
            <span aria-hidden="true" className="text-[#59616E]">
              /
            </span>
            <span className="inline-flex items-center gap-1">
              {progress.puzzle2Solved ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-[#52B788]" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-[#9AA3B0]" />
              )}
              <span
                className={
                  progress.puzzle2Solved
                    ? 'font-medium text-[#D8F3DC]'
                    : 'text-[#C7C1B5]'
                }
              >
                {room.puzzle2.sealTitle}
              </span>
            </span>
            <span aria-hidden="true" className="text-[#59616E]">
              /
            </span>
            <span className="inline-flex items-center gap-1">
              {progress.empathySolved ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-[#52B788]" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-[#E6A94F]" />
              )}
              <span
                className={
                  progress.empathySolved
                    ? 'font-medium text-[#D8F3DC]'
                    : 'text-[#F1D29C]'
                }
              >
                {room.empathy.sealTitle}
              </span>
            </span>
            {nextCoreLabel && (
              <>
                <span aria-hidden="true" className="hidden lg:inline text-[#59616E]">
                  ·
                </span>
                <span className="hidden lg:inline text-[11px] font-semibold text-[#F3C876]">
                  Objetivo: {nextCoreLabel}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Clean Escape Room Essentials (Clues, Map, Journal, Audio, Pause) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Room Clues Inventory Popover */}
          <div ref={cluesRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setCluesOpen((prev) => !prev);
                setBackpackOpen(false);
              }}
              aria-expanded={cluesOpen}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                cluesCollectedCount > 0
                  ? 'border-[#8AB4E8]/55 bg-[#1B2533] text-[#F5F3EE] hover:border-[#8AB4E8]'
                  : 'border-[#F5F3EE]/18 bg-[#171B21]/92 text-[#C7C1B5] hover:border-[#E6A94F]'
              }`}
            >
              <Search className="h-4 w-4 text-[#90CAF9]" aria-hidden="true" />
              <span>Pistas</span>
              <span className="font-mono text-[#90CAF9] tabular-nums">
                · {cluesCollectedCount}/2
              </span>
            </button>

            {cluesOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 rounded-xl border border-[#F5F3EE]/18 bg-[#1B212A] p-3.5 text-xs text-[#F5F3EE] shadow-2xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#F5F3EE]/10 pb-2">
                  <span className="font-bold text-[#E6A94F]">
                    Carpeta de pistas · Sala {room.number}
                  </span>
                  <span className="font-mono text-[11px] text-[#9AA3B0] tabular-nums">
                    {cluesCollectedCount}/2
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCluesOpen(false);
                    if (progress.clueFound) {
                      onInspectCollectedClue();
                    } else {
                      const clueHotspot = room.hotspots.find(
                        (h) => h.kind === 'clue'
                      );
                      if (clueHotspot) onSelectHotspot(clueHotspot);
                    }
                  }}
                  className="w-full rounded-lg border border-[#F5F3EE]/12 bg-[#14181F] p-2.5 text-left transition-colors hover:border-[#8AB4E8] cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#F5F3EE]">
                      1. {room.clue.itemLabel}
                    </span>
                    <span
                      className={
                        progress.clueFound
                          ? 'text-[#74C69D] font-semibold'
                          : 'text-[#90CAF9]'
                      }
                    >
                      {progress.clueFound ? 'Leer ✓' : 'Buscar'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#B9B3A7] line-clamp-2">
                    {progress.clueFound
                      ? room.clue.text[cycle]
                      : 'Toca el punto con lupa en la escena para recoger esta pista.'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCluesOpen(false);
                    onSelectShadow();
                  }}
                  className="w-full rounded-lg border border-[#F5F3EE]/12 bg-[#14181F] p-2.5 text-left transition-colors hover:border-[#E6A94F] cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#F5F3EE]">
                      2. Pista secreta (Sombras)
                    </span>
                    <span
                      className={
                        progress.shadowSolved
                          ? 'text-[#74C69D] font-semibold'
                          : 'text-[#F3C876]'
                      }
                    >
                      {progress.shadowSolved ? 'Leer ✓' : 'Descifrar'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#B9B3A7] line-clamp-2">
                    {progress.shadowSolved
                      ? shadowChallenge.unlockedClueText[cycle]
                      : 'Empareja los artefactos con su silueta para revelar una pista adicional.'}
                  </p>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenMap}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6A94F]/45 bg-[#171B21]/92 px-3 py-2 text-xs font-semibold text-[#F5F3EE] transition-colors duration-150 hover:border-[#E6A94F] hover:bg-[#232A34] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Map className="h-4 w-4 text-[#E6A94F]" aria-hidden="true" />
            <span className="hidden sm:inline">Mapa</span>
            <span className="font-mono text-[#E6A94F] tabular-nums">
              · {badgesCount}/{BADGES.length}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenJournal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#F5F3EE]/18 bg-[#171B21]/92 px-3 py-2 text-xs font-medium text-[#F5F3EE] transition-colors duration-150 hover:border-[#E6A94F] hover:bg-[#232A34] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookMarked className="h-4 w-4 text-[#8AB4E8]" aria-hidden="true" />
            <span className="hidden sm:inline">Diario</span>
          </button>

          {speechAvailable && (
            <button
              type="button"
              onClick={onToggleVoiceAuto}
              title={
                voiceAuto
                  ? 'Desactivar voz automática'
                  : 'Activar lectura automática en voz alta'
              }
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                voiceAuto
                  ? 'border-[#E6A94F] bg-[#C67D1E] text-[#14181F]'
                  : 'border-[#F5F3EE]/18 bg-[#171B21]/92 text-[#F5F3EE] hover:border-[#E6A94F]'
              }`}
            >
              <Headphones className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline">
                {voiceAuto ? 'Voz: Sí' : 'Voz'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#F5F3EE]/18 bg-[#171B21]/92 text-[#F5F3EE] transition-colors duration-150 hover:border-[#E6A94F] hover:bg-[#232A34] shrink-0 cursor-pointer"
          >
            {muted ? (
              <VolumeX className="h-4 w-4 text-[#C7C1B5]" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4 text-[#E6A94F]" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenPause}
            aria-label="Menú y pausa"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#F5F3EE]/18 bg-[#171B21]/92 px-3 py-2 text-xs font-medium text-[#F5F3EE] transition-colors duration-150 hover:border-[#E6A94F] hover:bg-[#232A34] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Pause className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Pausa</span>
            {unseenPauseAlerts > 0 && (
              <span className="font-mono text-[11px] font-bold text-[#E6A94F] tabular-nums">
                · +{unseenPauseAlerts}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Unobstructed Aspect-Locked Escape Room Playfield */}
      <main
        className="relative flex flex-1 min-h-0 w-full items-center justify-center overflow-hidden p-2 sm:p-3"
        style={{ containerType: 'size' }}
      >
        <div
          ref={playfieldRef}
          className="relative overflow-hidden rounded-xl border border-[#F5F3EE]/14 shadow-2xl"
          style={{
            width: 'min(100cqw, calc(100cqh * 16 / 9), 1440px)',
            height: 'min(100cqh, calc(100cqw * 9 / 16), 810px)',
            background: room.fallbackGradient,
          }}
        >
          {!imgFailed ? (
            <img
              key={room.imagePath}
              src={room.imagePath}
              alt={`${room.title} — ${room.location}`}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8 text-center">
              <div>
                <p className="font-mono text-xs text-[#E6A94F]">
                  {room.location}
                </p>
                <p className="mt-1 font-display text-2xl text-[#F5F3EE]">
                  {room.title}
                </p>
              </div>
            </div>
          )}

          {/* Atmospheric room-specific floating dust/sand/sea-spray particles with tactile sound */}
          <RoomAtmosphereParticles
            roomId={room.id}
            interactionTargetRef={playfieldRef}
          />

          {/* Subtle vignette for pin clarity */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#11151B]/52 via-transparent to-[#11151B]/22"
          />

          {/* Core Escape Room Hotspots (1-4) */}
          {room.hotspots.map((hotspot, idx) => {
            const done = isHotspotDone(hotspot);
            const isEmpathy = hotspot.kind === 'empathy';
            return (
              <button
                key={hotspot.id}
                type="button"
                onClick={() => onSelectHotspot(hotspot)}
                onMouseEnter={() =>
                  onHoverReaction?.(
                    hotspot.kind === 'clue' ? 'sorpresa' : 'concentrado'
                  )
                }
                onMouseLeave={() => onHoverReaction?.(null)}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                aria-label={`${hotspot.label} (${done ? 'Completado' : 'Explorar'})`}
                className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center focus:outline-none cursor-pointer"
              >
                <span className="relative flex h-12 w-12 items-center justify-center">
                  {!done && (
                    <span
                      aria-hidden="true"
                      className={`hotspot-ring absolute inset-0 rounded-full border-2 ${
                        isEmpathy ? 'border-[#E6A94F]' : 'border-[#F5F3EE]'
                      }`}
                    />
                  )}
                  <span
                    className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-lg transition-transform duration-150 group-hover:scale-110 ${
                      done
                        ? 'border-[#D8F3DC] bg-[#2A6F4E] text-white'
                        : isEmpathy
                        ? 'border-[#F6EAD7] bg-[#C67D1E] text-[#14181F]'
                        : 'border-[#F5F3EE] bg-[#1D4E89] text-white'
                    }`}
                  >
                    {getHotspotIcon(hotspot.kind, done)}
                  </span>
                </span>
                <span className="mt-1.5 rounded-md border border-[#F5F3EE]/22 bg-[#171B21]/92 px-2.5 py-1 text-xs font-semibold text-[#F5F3EE] shadow-md transition-transform duration-150 group-hover:-translate-y-0.5 whitespace-nowrap">
                  <span className="font-mono text-[#E6A94F] mr-1 tabular-nums">
                    {idx + 1}.
                  </span>
                  {hotspot.shortLabel}
                  {done && <span className="ml-1 text-[#74C69D]">✓</span>}
                </span>
              </button>
            );
          })}

          {/* Hidden Canarian Heritage Collectible Pin */}
          <button
            type="button"
            onClick={onSelectCollectible}
            onMouseEnter={() => onHoverReaction?.('sorpresa')}
            onMouseLeave={() => onHoverReaction?.(null)}
            style={{
              left: `${collectible.hotspotX}%`,
              top: `${collectible.hotspotY}%`,
            }}
            aria-label={
              progress.collectibleFound
                ? `Reto extra · Tesoro canario descubierto: ${collectible.word}`
                : 'Reto extra opcional · Explorar tesoro canario escondido'
            }
            className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center focus:outline-none cursor-pointer"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-lg transition-transform duration-150 group-hover:scale-110 ${
                progress.collectibleFound
                  ? 'border-[#F6EAD7] bg-[#2A6F4E] text-[#F6EAD7]'
                  : 'border-[#FAF4E8] bg-[#C67D1E]/95 text-[#14181F]'
              }`}
            >
              <Gem className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="mt-1 rounded-md border border-[#E6A94F]/45 bg-[#171B21]/90 px-2 py-0.5 text-[11px] font-semibold text-[#F6EAD7] shadow-md whitespace-nowrap">
              {progress.collectibleFound ? `${collectible.word} ✓` : 'Extra · Tesoro'}
            </span>
          </button>

          {/* Shadow Matching Mini-Game Spatial Pin */}
          <button
            type="button"
            onClick={onSelectShadow}
            onMouseEnter={() => onHoverReaction?.('concentrado')}
            onMouseLeave={() => onHoverReaction?.(null)}
            style={{
              left: `${shadowChallenge.hotspotX}%`,
              top: `${shadowChallenge.hotspotY}%`,
            }}
            aria-label={
              progress.shadowSolved
                ? `Pista extra · Sombras completadas en ${room.title}`
                : `Pista extra · Jugar a Sombras de la Historia en ${room.title}`
            }
            className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center focus:outline-none cursor-pointer"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-lg transition-transform duration-150 group-hover:scale-110 ${
                progress.shadowSolved
                  ? 'border-[#D8F3DC] bg-[#2A6F4E] text-white'
                  : 'border-[#F6EAD7] bg-[#2C3647] text-[#F3C876]'
              }`}
            >
              {progress.shadowSolved ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Shapes className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
            <span className="mt-1 rounded-md border border-[#F3C876]/45 bg-[#171B21]/92 px-2 py-0.5 text-[11px] font-semibold text-[#FAF4E8] shadow-md whitespace-nowrap">
              {progress.shadowSolved ? 'Pista extra ✓' : 'Extra · Sombras'}
            </span>
          </button>
        </div>
      </main>

      {/* Clean Escape Room Bottom Tray: Explorer Companion + Backpack Drawer + Dominant Exit Lock CTA */}
      <footer className="shrink-0 z-30 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#F5F3EE]/12 bg-[#171B21] px-3 py-2 sm:px-5">
        {/* Explorer companion speech bubble with live facial reactions */}
        <div className="flex items-center gap-3 rounded-xl border border-[#F5F3EE]/14 bg-[#1E242D] px-2.5 py-2 pr-3.5 max-w-2xl min-w-0 flex-1 sm:flex-initial">
          <button
            type="button"
            onClick={onTapAvatar}
            title={`Saludar a ${explorer.name} (${reactionMeta.label})`}
            aria-label={`Avatar de ${explorer.name} con expresión de ${reactionMeta.label}. Pulsa para saludar`}
            className="shrink-0 rounded-xl transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ExplorerReactionAvatar
              explorerId={explorer.id}
              explorerName={explorer.name}
              reaction={reaction}
              pulseKey={reactionPulseKey}
              size="sm"
            />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
              <span className="font-bold text-[#E6A94F]">{explorer.name}</span>
              <span aria-hidden="true" className="text-[#59616E]">
                ·
              </span>
              <span className={`font-semibold ${reactionMeta.darkTextClass}`}>
                {reactionMeta.label}
              </span>
              <span aria-hidden="true" className="text-[#59616E]">
                ·
              </span>
              <span className="text-[#C7C1B5]">
                Poder: {explorer.powerName}
              </span>
              <span aria-hidden="true" className="text-[#59616E]">
                ·
              </span>
              <button
                type="button"
                onClick={onOpenCharacterSheet}
                className="inline-flex items-center gap-1 font-semibold text-[#E6C58D] underline underline-offset-2 hover:text-white whitespace-nowrap cursor-pointer"
              >
                <IdCard className="h-3 w-3" aria-hidden="true" />
                <span>Hoja</span>
              </button>
            </div>
            <p className="mt-0.5 text-xs sm:text-sm leading-snug text-[#F5F3EE]">
              {companionLine}
            </p>
          </div>
          {speechAvailable && (
            <button
              type="button"
              onClick={() => speakText(companionLine, muted)}
              aria-label="Escuchar mensaje del explorador"
              title="Escuchar en voz alta"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#F5F3EE]/16 bg-[#232A34] text-[#E6A94F] hover:bg-[#2F3845] cursor-pointer"
            >
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Right: Optional Extras Backpack + Dominant Escape Room Door Lock CTA */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Immediate shortcut only when a brand-new Time Capsule just unlocked */}
          {currentCapsuleUnlocked && currentCapsuleIsNew && (
            <button
              type="button"
              onClick={onOpenTimeCapsule}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6A94F] bg-[#2D2416] px-3 py-2.5 text-xs font-bold text-[#FAF4E8] transition-colors hover:bg-[#3A2E1C] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Hourglass className="h-4 w-4 text-[#E6A94F]" aria-hidden="true" />
              <span>¡Cápsula nueva!</span>
            </button>
          )}

          {/* Collapsible Mochila Extra (keeps all classroom & bonus tools 1 click away without cluttering the room) */}
          <div ref={backpackRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setBackpackOpen((prev) => !prev);
                setCluesOpen(false);
              }}
              aria-expanded={backpackOpen}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                backpackOpen
                  ? 'border-[#E6A94F] bg-[#232A34] text-[#F5F3EE]'
                  : 'border-[#F5F3EE]/20 bg-[#1C222B] text-[#E2DDD2] hover:border-[#E6A94F] hover:bg-[#232A34]'
              }`}
            >
              <Backpack className="h-4 w-4 text-[#E6A94F]" aria-hidden="true" />
              <span>Mochila</span>
            </button>

            {backpackOpen && (
              <div className="absolute right-0 bottom-full mb-2.5 z-50 w-72 sm:w-80 rounded-2xl border border-[#F5F3EE]/18 bg-[#1B212A] p-3.5 shadow-2xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#F5F3EE]/10 pb-2 text-xs">
                  <span className="font-bold text-[#E6A94F]">
                    Mochila de retos extra y aula
                  </span>
                  <span className="font-mono text-[11px] text-[#9AA3B0] tabular-nums">
                    {missionsCompleted}/{missionsTotal}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBackpackOpen(false);
                      onOpenMissionLog();
                    }}
                    className="flex items-center gap-2 rounded-lg border border-[#F5F3EE]/12 bg-[#14181F] px-2.5 py-2 text-left text-xs font-semibold text-[#F5F3EE] hover:border-[#8AB4E8] cursor-pointer"
                  >
                    <ClipboardList
                      className="h-4 w-4 shrink-0 text-[#8AB4E8]"
                      aria-hidden="true"
                    />
                    <span className="truncate">Bitácora</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBackpackOpen(false);
                      onOpenJigsaw();
                    }}
                    className="flex items-center gap-2 rounded-lg border border-[#F5F3EE]/12 bg-[#14181F] px-2.5 py-2 text-left text-xs font-semibold text-[#F5F3EE] hover:border-[#E6A94F] cursor-pointer"
                  >
                    <Puzzle
                      className="h-4 w-4 shrink-0 text-[#E6A94F]"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      Mural {currentJigsawSolved ? '✓' : ''}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBackpackOpen(false);
                      onOpenTransversal();
                    }}
                    className="flex items-center gap-2 rounded-lg border border-[#F5F3EE]/12 bg-[#14181F] px-2.5 py-2 text-left text-xs font-semibold text-[#F5F3EE] hover:border-[#74C69D] cursor-pointer"
                  >
                    <Globe2
                      className="h-4 w-4 shrink-0 text-[#74C69D]"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      Misión 2030 {progress.transversalSolved ? '✓' : ''}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBackpackOpen(false);
                      onOpenThermometer();
                    }}
                    className="flex items-center gap-2 rounded-lg border border-[#F5F3EE]/12 bg-[#14181F] px-2.5 py-2 text-left text-xs font-semibold text-[#F5F3EE] hover:border-[#E6A94F] cursor-pointer"
                  >
                    {activeMood ? (
                      <span className="text-sm leading-none" aria-hidden="true">
                        {activeMood.emoji}
                      </span>
                    ) : (
                      <Heart
                        className="h-4 w-4 shrink-0 text-[#E6A94F]"
                        aria-hidden="true"
                      />
                    )}
                    <span className="truncate">
                      {activeMood ? activeMood.label : 'Emociones'}
                    </span>
                  </button>

                  {currentCapsuleUnlocked && (
                    <button
                      type="button"
                      onClick={() => {
                        setBackpackOpen(false);
                        onOpenTimeCapsule();
                      }}
                      className="col-span-2 flex items-center justify-between gap-2 rounded-lg border border-[#E6A94F]/45 bg-[#2A2217] px-2.5 py-2 text-left text-xs font-bold text-[#FAF4E8] hover:border-[#E6A94F] cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Hourglass
                          className="h-4 w-4 text-[#E6A94F]"
                          aria-hidden="true"
                        />
                        <span>Cápsula del Tiempo · Sala {room.number}</span>
                      </span>
                      <span className="text-[#74C69D]">✓</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 border-t border-[#F5F3EE]/10 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBackpackOpen(false);
                      onOpenAssembly();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#F5F3EE]/10 bg-[#14181F] px-2.5 py-1.5 text-[11px] font-medium text-[#D6D0C4] hover:border-[#74C69D] hover:text-white cursor-pointer"
                  >
                    <Users className="h-3.5 w-3.5 text-[#74C69D]" aria-hidden="true" />
                    <span>Asamblea</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBackpackOpen(false);
                      onOpenDua();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#F5F3EE]/10 bg-[#14181F] px-2.5 py-1.5 text-[11px] font-medium text-[#D6D0C4] hover:border-[#8AB4E8] hover:text-white cursor-pointer"
                  >
                    <Accessibility
                      className="h-3.5 w-3.5 text-[#8AB4E8]"
                      aria-hidden="true"
                    />
                    <span>DUA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBackpackOpen(false);
                      onOpenTeacherGuide();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#F5F3EE]/10 bg-[#14181F] px-2.5 py-1.5 text-[11px] font-medium text-[#D6D0C4] hover:border-[#E6A94F] hover:text-white cursor-pointer"
                  >
                    <BookOpen
                      className="h-3.5 w-3.5 text-[#C7C1B5]"
                      aria-hidden="true"
                    />
                    <span>Docente</span>
                  </button>

                  <button
                    type="button"
                    onClick={onToggleAmbient}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#F5F3EE]/10 bg-[#14181F] px-2.5 py-1.5 text-[11px] font-medium text-[#D6D0C4] hover:border-[#74C69D] hover:text-white cursor-pointer"
                  >
                    {renderAmbientIcon()}
                    <span className="truncate">
                      {ambientEnabled && !muted ? 'Ambiente: Sí' : 'Ambiente: No'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dominant Escape Room Focal Anchor: Always-visible Door Lock Mechanism */}
          {progress.doorUnlocked ? (
            <button
              type="button"
              onClick={onAdvanceRoom}
              className="inline-flex items-center gap-2 rounded-xl border border-[#74C69D]/70 bg-[#2A6F4E] px-4 py-2.5 text-sm font-bold text-white shadow-xl transition-transform duration-150 hover:bg-[#33855E] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LockOpen className="h-4 w-4 text-[#D8F3DC]" aria-hidden="true" />
              <span>
                {room.number < totalRooms
                  ? '¡Escapar a siguiente época!'
                  : '¡Cruzar puerta final!'}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : allSealsUnlocked ? (
            <button
              type="button"
              onClick={onOpenExitLock}
              className="inline-flex items-center gap-2 rounded-xl border border-[#FAF4E8]/55 bg-[#C67D1E] px-4 py-2.5 text-sm font-bold text-[#14181F] shadow-xl transition-transform duration-150 hover:bg-[#D98E2B] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              <span>¡Abrir cerrojo de salida!</span>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenExitLock}
              title="Inspeccionar el cerrojo de la puerta de salida"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E6A94F]/40 bg-[#222833] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-[#F5F3EE] transition-colors hover:border-[#E6A94F] hover:bg-[#2B3342] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Lock className="h-4 w-4 text-[#E6A94F]" aria-hidden="true" />
              <span>Cerrojo</span>
              <span className="font-mono text-xs text-[#E6A94F] tabular-nums">
                {sealsUnlocked}/3
              </span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
