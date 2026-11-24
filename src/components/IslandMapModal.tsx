import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  Droplets,
  Gem,
  Landmark,
  Lightbulb,
  Lock,
  MapPin,
  Mountain,
  RotateCcw,
  Sparkles,
  Trees,
  Volume2,
  X,
} from 'lucide-react';
import {
  AtlasLayerId,
  AtlasModalTab,
  CharacterReactionId,
  ExpeditionState,
} from '../types/game';
import { ROOMS_DATA } from '../data/roomsData';
import { BADGES, getExplorerById } from '../data/charactersAndBadges';
import { CANARIAN_COLLECTIBLES } from '../data/enrichmentData';
import {
  ATLAS_LAYERS,
  NATURAL_ATLAS_LANDMARKS,
  TIME_UNITS_CHALLENGES,
  TIMELINE_MILESTONES,
  TimelineMilestone,
} from '../data/naturalAtlasData';
import { CanarianEmblemSvg } from './CollectibleModal';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';
import { soundEngine } from '../utils/audio';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface IslandMapModalProps {
  state: ExpeditionState;
  initialTab?: AtlasModalTab;
  onJumpToRoom: (roomIndex: number) => void;
  onCompleteAtlasLayer: (layerId: AtlasLayerId) => void;
  onCompleteTimeline: () => void;
  onReaction?: (reaction: CharacterReactionId, line?: string) => void;
  onClose: () => void;
}

const ZONE_COORDS: Record<
  string,
  { cx: number; cy: number; labelX: number; labelY: number }
> = {
  aborigenes: { cx: 112, cy: 74, labelX: 112, labelY: 46 },
  conquista: { cx: 205, cy: 112, labelX: 208, labelY: 86 },
  pirateria: { cx: 215, cy: 164, labelX: 216, labelY: 194 },
  sigloXX: { cx: 170, cy: 56, labelX: 185, labelY: 32 },
};

const LayerGlyph: React.FC<{ layer: AtlasLayerId }> = ({ layer }) => {
  const cls = 'h-3.5 w-3.5 shrink-0';
  switch (layer) {
    case 'relieve':
      return <Mountain className={cls} aria-hidden="true" />;
    case 'ecosistemas':
      return <Trees className={cls} aria-hidden="true" />;
    case 'agua':
      return <Droplets className={cls} aria-hidden="true" />;
    case 'patrimonio':
      return <Landmark className={cls} aria-hidden="true" />;
  }
};

function buildShuffledMilestones(items: TimelineMilestone[]): TimelineMilestone[] {
  if (items.length <= 2) return [...items].reverse();
  // Deterministic non-chronological shuffle so students always have a real puzzle
  const copy = [...items];
  const rotated = [...copy.slice(2), copy[0], copy[1]];
  if (rotated.length >= 4) {
    [rotated[0], rotated[1]] = [rotated[1], rotated[0]];
  }
  return rotated;
}

export const IslandMapModal: React.FC<IslandMapModalProps> = ({
  state,
  initialTab = 'mapa',
  onJumpToRoom,
  onCompleteAtlasLayer,
  onCompleteTimeline,
  onReaction,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocusTrap(dialogRef, true);

  const [activeTab, setActiveTab] = useState<AtlasModalTab>(initialTab);
  const [activeLayer, setActiveLayer] = useState<AtlasLayerId>('relieve');
  const [selectedLandmarkId, setSelectedLandmarkId] =
    useState<string>('roque-nublo');
  const [selectedInquiryOption, setSelectedInquiryOption] = useState<
    Record<AtlasLayerId, string | undefined>
  >({
    relieve: undefined,
    ecosistemas: undefined,
    agua: undefined,
    patrimonio: undefined,
  });

  // Timeline interactive state
  const cycleMilestones = useMemo(
    () =>
      TIMELINE_MILESTONES.filter(
        (m) => state.cycle === 'ciclo3' || !m.ciclo3Only
      ),
    [state.cycle]
  );

  const [orderedMilestones, setOrderedMilestones] = useState<TimelineMilestone[]>(
    () =>
      state.timelineSolved
        ? [...cycleMilestones]
        : buildShuffledMilestones(cycleMilestones)
  );
  const [sequenceVerified, setSequenceVerified] = useState<boolean>(
    state.timelineSolved
  );
  const [sequenceFeedback, setSequenceFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(
    state.timelineSolved
      ? {
          type: 'success',
          text: '¡Orden cronológico verificado! Todas las etapas de Gran Canaria están situadas en su secuencia real.',
        }
      : null
  );
  const [timeUnitOptionId, setTimeUnitOptionId] = useState<string | null>(() =>
    state.timelineSolved
      ? TIME_UNITS_CHALLENGES[state.cycle].options.find((o) => o.isCorrect)
          ?.id ?? null
      : null
  );

  // Sync timeline milestones if cycle changes while modal is open
  useEffect(() => {
    setOrderedMilestones(
      state.timelineSolved
        ? [...cycleMilestones]
        : buildShuffledMilestones(cycleMilestones)
    );
    setSequenceVerified(state.timelineSolved);
    setTimeUnitOptionId(
      state.timelineSolved
        ? TIME_UNITS_CHALLENGES[state.cycle].options.find((o) => o.isCorrect)
            ?.id ?? null
        : null
    );
  }, [cycleMilestones, state.cycle, state.timelineSolved]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const explorer = getExplorerById(state.explorerId);
  const speechAvailable = isSpeechSupported();

  const litZonesCount = ROOMS_DATA.filter((room) => {
    const p = state.progress[room.id];
    return p.puzzle1Solved && p.puzzle2Solved && p.empathySolved;
  }).length;

  const collectiblesFoundCount = CANARIAN_COLLECTIBLES.filter(
    (c) => state.progress[c.roomId].collectibleFound
  ).length;

  const completedAtlasLayers = state.atlasLayersCompleted ?? [];
  const activeLayerDef =
    ATLAS_LAYERS.find((l) => l.id === activeLayer) ?? ATLAS_LAYERS[0];
  const layerLandmarks = useMemo(
    () => NATURAL_ATLAS_LANDMARKS.filter((lm) => lm.layer === activeLayer),
    [activeLayer]
  );
  const selectedLandmark =
    layerLandmarks.find((lm) => lm.id === selectedLandmarkId) ??
    layerLandmarks[0];

  const handleSelectLayer = (layerId: AtlasLayerId) => {
    soundEngine.playClick();
    setActiveLayer(layerId);
    const firstLandmark = NATURAL_ATLAS_LANDMARKS.find(
      (lm) => lm.layer === layerId
    );
    if (firstLandmark) setSelectedLandmarkId(firstLandmark.id);
  };

  const handleInquiryAnswer = (layerId: AtlasLayerId, optionId: string) => {
    const def = ATLAS_LAYERS.find((l) => l.id === layerId);
    if (!def) return;
    const opt = def.inquiry.options.find((o) => o.id === optionId);
    if (!opt) return;

    setSelectedInquiryOption((prev) => ({ ...prev, [layerId]: optionId }));
    if (opt.isCorrect) {
      soundEngine.playSuccess();
      onCompleteAtlasLayer(layerId);
      onReaction?.(
        'alegria',
        `¡Indagación completada en ${def.shortLabel}! Conectaste el medio natural con la historia.`
      );
    } else {
      soundEngine.playGentleError();
      onReaction?.('animo', 'Observa bien la evidencia del mapa e inténtalo de nuevo.');
    }
  };

  const moveMilestone = (index: number, delta: -1 | 1) => {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= orderedMilestones.length) return;
    soundEngine.playClick();
    setOrderedMilestones((prev) => {
      const copy = [...prev];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
    setSequenceVerified(false);
    setSequenceFeedback(null);
  };

  const verifyTimelineSequence = () => {
    const isCorrect = orderedMilestones.every(
      (item, idx) => idx === 0 || orderedMilestones[idx - 1].order < item.order
    );
    if (isCorrect) {
      soundEngine.playSuccess();
      setSequenceVerified(true);
      setSequenceFeedback({
        type: 'success',
        text: '¡Excelente orden cronológico! Ahora completa la pregunta de unidades del tiempo para sellar la Línea del Tiempo.',
      });
      const currentUnitOpt = TIME_UNITS_CHALLENGES[state.cycle].options.find(
        (o) => o.id === timeUnitOptionId
      );
      if (currentUnitOpt?.isCorrect) {
        onCompleteTimeline();
      }
      onReaction?.('alegria', '¡Ordenaste la historia de Gran Canaria paso a paso!');
    } else {
      soundEngine.playGentleError();
      setSequenceVerified(false);
      setSequenceFeedback({
        type: 'error',
        text: 'Alguna etapa está descolocada. Fíjate en la regla temporal superior: primero los siglos III–XV, después el siglo XV, XVI y XX.',
      });
      onReaction?.('animo', 'Revisa qué etapa ocurrió antes en el tiempo.');
    }
  };

  const resetTimeline = () => {
    soundEngine.playClick();
    setOrderedMilestones(buildShuffledMilestones(cycleMilestones));
    setSequenceVerified(false);
    setSequenceFeedback(null);
  };

  const timeUnitChallenge = TIME_UNITS_CHALLENGES[state.cycle];
  const selectedTimeUnit = timeUnitChallenge.options.find(
    (o) => o.id === timeUnitOptionId
  );

  const handleSelectTimeUnit = (optionId: string) => {
    setTimeUnitOptionId(optionId);
    const opt = timeUnitChallenge.options.find((o) => o.id === optionId);
    if (!opt) return;
    if (opt.isCorrect) {
      soundEngine.playSuccess();
      if (sequenceVerified || state.timelineSolved) {
        onCompleteTimeline();
        onReaction?.(
          'orgullo',
          '¡Línea del Tiempo y unidades históricas dominadas (CE7)!'
        );
      }
    } else {
      soundEngine.playGentleError();
      onReaction?.('animo', 'Piensa cuántos años forman una década y un siglo.');
    }
  };

  const layerInquirySolved = completedAtlasLayers.includes(activeLayer);
  const currentSelectedInquiry = activeLayerDef.inquiry.options.find(
    (o) => o.id === selectedInquiryOption[activeLayer]
  );

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="island-map-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/84 p-3 sm:p-6"
    >
      <div className="flex max-h-[93vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={explorer.portraitPath}
              alt={explorer.name}
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-xl border border-[#232A34]/20 object-cover shrink-0"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-[#526071]">
                <span className="font-mono text-[#1D4E89] font-semibold tabular-nums">
                  {litZonesCount}/4 épocas
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#2A6F4E] font-semibold tabular-nums">
                  {completedAtlasLayers.length}/4 capas naturales
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#8A5410] font-semibold tabular-nums">
                  Línea del Tiempo: {state.timelineSolved ? '✓' : 'pendiente'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#526071] font-semibold tabular-nums">
                  {state.unlockedBadges.length}/{BADGES.length} insignias
                </span>
              </div>
              <h2
                id="island-map-title"
                className="font-display text-xl font-bold text-[#171B21] sm:text-2xl truncate"
              >
                Atlas de Gran Canaria · Medio Natural y Tiempo Histórico
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar Atlas de Gran Canaria"
            className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] shrink-0 cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Crisp Segmented 4-Tab Bar */}
        <div
          role="tablist"
          aria-label="Secciones del Atlas de Gran Canaria"
          className="flex flex-wrap items-center gap-2 border-b border-[#232A34]/12 bg-[#EFECE4] px-6 py-2.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mapa'}
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('mapa');
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'mapa'
                ? 'bg-[#1D4E89] text-white'
                : 'bg-white text-[#333D4B] border border-[#232A34]/15 hover:border-[#1D4E89]'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Mapa e Insignias</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'medio-natural'}
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('medio-natural');
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'medio-natural'
                ? 'bg-[#2A6F4E] text-white'
                : 'bg-white text-[#333D4B] border border-[#232A34]/15 hover:border-[#2A6F4E]'
            }`}
          >
            <Mountain className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              Medio Natural · Bloque A ({completedAtlasLayers.length}/4)
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'linea-tiempo'}
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('linea-tiempo');
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'linea-tiempo'
                ? 'bg-[#9C5A25] text-white'
                : 'bg-white text-[#333D4B] border border-[#232A34]/15 hover:border-[#9C5A25]'
            }`}
          >
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              Línea del Tiempo · CE7 {state.timelineSolved ? '✓' : ''}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'album'}
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('album');
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'album'
                ? 'bg-[#C67D1E] text-[#14181F]'
                : 'bg-white text-[#333D4B] border border-[#232A34]/15 hover:border-[#C67D1E]'
            }`}
          >
            <Gem className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Álbum Canario ({collectiblesFoundCount}/4)</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* TAB 1: MAPA HISTÓRICO E INSIGNIAS */}
          {activeTab === 'mapa' && (
            <>
              <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] items-center">
                <div className="rounded-2xl border border-[#232A34]/15 bg-[#1B2B3A] p-4 text-[#F5F3EE]">
                  <div className="flex items-center justify-between text-xs text-[#C8D5E2] mb-2">
                    <span className="font-mono">
                      OCÉANO ATLÁNTICO · GRAN CANARIA
                    </span>
                    <span>Toca una zona para viajar</span>
                  </div>

                  <svg
                    viewBox="0 0 310 260"
                    className="mx-auto w-full max-w-[360px]"
                    role="img"
                    aria-label="Mapa interactivo iluminado de Gran Canaria con las cuatro zonas históricas"
                  >
                    <circle
                      cx="155"
                      cy="132"
                      r="116"
                      fill="none"
                      stroke="#3E5D7A"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.55"
                    />

                    <path
                      d="M158 34
                         C166 28, 180 30, 183 41
                         C185 48, 179 54, 184 61
                         C204 71, 224 94, 228 124
                         C232 156, 217 190, 190 212
                         C166 231, 130 232, 102 216
                         C74 200, 58 168, 62 134
                         C65 101, 86 70, 118 56
                         C135 49, 148 45, 158 34 Z"
                      fill={litZonesCount === 4 ? '#D6B87A' : '#8A7B63'}
                      stroke="#F5F3EE"
                      strokeWidth="2.5"
                    />

                    <g transform="translate(144 134)" opacity="0.8">
                      <polygon points="0,-14 14,10 -14,10" fill="#5D4E3C" />
                      <polygon
                        points="0,-14 4,-4 -4,-4"
                        fill="#F5F3EE"
                        opacity="0.7"
                      />
                      <text
                        x="0"
                        y="23"
                        textAnchor="middle"
                        fill="#F5F3EE"
                        fontSize="8.5"
                        fontFamily="Plus Jakarta Sans, sans-serif"
                        fontWeight="600"
                      >
                        Roque Nublo
                      </text>
                    </g>

                    <path
                      d="M112 74 Q165 86 205 112 T215 164 M205 112 Q185 84 170 56"
                      fill="none"
                      stroke="#F5F3EE"
                      strokeWidth="1.5"
                      strokeDasharray="3 4"
                      opacity="0.55"
                    />

                    {ROOMS_DATA.map((room, idx) => {
                      const p = state.progress[room.id];
                      const seals =
                        Number(p.puzzle1Solved) +
                        Number(p.puzzle2Solved) +
                        Number(p.empathySolved);
                      const isLit = seals === 3;
                      const isCurrent = idx === state.currentRoomIndex;
                      const pos = ZONE_COORDS[room.id];

                      return (
                        <g
                          key={room.id}
                          onClick={() => onJumpToRoom(idx)}
                          className="cursor-pointer"
                        >
                          {isLit && (
                            <circle
                              cx={pos.cx}
                              cy={pos.cy}
                              r="22"
                              fill="#E6A94F"
                              opacity="0.28"
                            />
                          )}
                          {isCurrent && (
                            <circle
                              cx={pos.cx}
                              cy={pos.cy}
                              r="17"
                              fill="none"
                              stroke="#F5F3EE"
                              strokeWidth="2"
                              strokeDasharray="3 2"
                            />
                          )}
                          <circle
                            cx={pos.cx}
                            cy={pos.cy}
                            r="12"
                            fill={
                              isLit
                                ? '#2A6F4E'
                                : isCurrent
                                ? '#C67D1E'
                                : '#2E3B4A'
                            }
                            stroke="#F5F3EE"
                            strokeWidth="2"
                          />
                          <text
                            x={pos.cx}
                            y={pos.cy + 4}
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="10"
                            fontFamily="IBM Plex Mono, monospace"
                            fontWeight="700"
                          >
                            {isLit ? '★' : room.number}
                          </text>
                          <text
                            x={pos.labelX}
                            y={pos.labelY}
                            textAnchor="middle"
                            fill="#F5F3EE"
                            fontSize="9.5"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                            fontWeight="700"
                          >
                            {room.mapZoneLabel}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-[#526071]">
                    Progreso en las 4 épocas de la isla
                  </div>
                  {ROOMS_DATA.map((room, idx) => {
                    const p = state.progress[room.id];
                    const seals =
                      Number(p.puzzle1Solved) +
                      Number(p.puzzle2Solved) +
                      Number(p.empathySolved);
                    const done = seals === 3;
                    const active = idx === state.currentRoomIndex;

                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => onJumpToRoom(idx)}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${
                          done
                            ? 'border-[#2A6F4E]/40 bg-[#E1EFE8]'
                            : active
                            ? 'border-[#C67D1E] bg-[#F6EAD7]'
                            : 'border-[#232A34]/15 bg-white hover:border-[#1D4E89]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                              done
                                ? 'bg-[#2A6F4E] text-white'
                                : active
                                ? 'bg-[#C67D1E] text-[#14181F]'
                                : 'bg-[#EAE6DC] text-[#333D4B]'
                            }`}
                          >
                            {done ? (
                              <CheckCircle2
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            ) : (
                              <MapPin className="h-4 w-4" aria-hidden="true" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-[#171B21]">
                              {room.number}. {room.title}
                            </div>
                            <div className="text-xs text-[#4A5564]">
                              {room.mapZoneLabel} · {room.years}
                            </div>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-[#1D4E89] tabular-nums shrink-0">
                          {seals}/3 ★
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Collectible Badges Showcase */}
              <section className="space-y-3 border-t border-[#232A34]/12 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award
                      className="h-5 w-5 text-[#C67D1E]"
                      aria-hidden="true"
                    />
                    <h3 className="font-display text-lg font-bold text-[#171B21]">
                      Vitrina de Insignias Coleccionables
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#526071] tabular-nums">
                    {state.unlockedBadges.length} / {BADGES.length}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {BADGES.map((badge) => {
                    const unlocked = state.unlockedBadges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`rounded-xl border p-3.5 transition-colors ${
                          unlocked
                            ? 'border-[#C67D1E]/60 bg-[#FAF4E8]'
                            : 'border-[#232A34]/12 bg-[#EFECE4]/70 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                              unlocked
                                ? 'bg-[#C67D1E] text-[#14181F]'
                                : 'bg-[#DDD8CC] text-[#6B7482]'
                            }`}
                          >
                            {unlocked ? (
                              <Sparkles
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            ) : (
                              <Lock className="h-4 w-4" aria-hidden="true" />
                            )}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-[#526071]">
                            {unlocked ? 'Lograda' : 'Por lograr'}
                          </span>
                        </div>
                        <div className="mt-2.5 text-sm font-bold text-[#171B21]">
                          {badge.title}
                        </div>
                        <p className="mt-0.5 text-xs text-[#4A5564]">
                          {badge.subtitle}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* TAB 2: MEDIO NATURAL Y GEOGRAFÍA (BLOQUE A · CONOCIMIENTO DEL MEDIO) */}
          {activeTab === 'medio-natural' && (
            <section className="space-y-5">
              {/* Layer selector bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {ATLAS_LAYERS.map((layer) => {
                    const active = activeLayer === layer.id;
                    const done = completedAtlasLayers.includes(layer.id);
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        onClick={() => handleSelectLayer(layer.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-[#232A34] text-[#F5F3EE]'
                            : done
                            ? 'border border-[#2A6F4E]/45 bg-[#E8F3EC] text-[#1D543A] hover:border-[#2A6F4E]'
                            : 'border border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#1D4E89]'
                        }`}
                      >
                        <LayerGlyph layer={layer.id} />
                        <span>{layer.shortLabel}</span>
                        {done && (
                          <CheckCircle2
                            className="h-3.5 w-3.5 text-[#2A6F4E]"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs text-[#526071] font-mono tabular-nums">
                  {activeLayerDef.blockTag} · {activeLayerDef.ceTag}
                </div>
              </div>

              {/* Two-zone Educational Sandbox */}
              <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr] items-start">
                {/* LEFT ZONE: Interactive Scientific SVG Atlas of Gran Canaria */}
                <div className="space-y-3">
                  <div className="rounded-2xl border border-[#232A34]/15 bg-[#152432] p-4 text-[#F5F3EE]">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#C8D5E2] mb-2">
                      <span className="font-semibold text-[#F5F3EE]">
                        {activeLayerDef.title}
                      </span>
                      <span className="font-mono text-[11px]">
                        Toca cada enclave natural
                      </span>
                    </div>

                    <svg
                      viewBox="0 0 320 265"
                      className="mx-auto w-full max-w-[420px]"
                      role="img"
                      aria-label={`Mapa científico interactivo de Gran Canaria: capa ${activeLayerDef.title}`}
                    >
                      {/* Compass rose (top-left) */}
                      <g transform="translate(30 30)" opacity="0.85">
                        <circle
                          cx="0"
                          cy="0"
                          r="16"
                          fill="none"
                          stroke="#6C89A5"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="-6"
                          textAnchor="middle"
                          fill="#F5F3EE"
                          fontSize="8"
                          fontWeight="700"
                        >
                          N
                        </text>
                        <text
                          x="0"
                          y="13"
                          textAnchor="middle"
                          fill="#9CB2C8"
                          fontSize="7"
                        >
                          S
                        </text>
                        <text
                          x="10"
                          y="3"
                          textAnchor="middle"
                          fill="#9CB2C8"
                          fontSize="7"
                        >
                          E
                        </text>
                        <text
                          x="-10"
                          y="3"
                          textAnchor="middle"
                          fill="#9CB2C8"
                          fontSize="7"
                        >
                          O
                        </text>
                      </g>

                      {/* Layer-specific Atlantic context: Trade Winds (Alisios NE) */}
                      {activeLayer === 'agua' && (
                        <g stroke="#7CC4FA" strokeWidth="1.8" fill="none" opacity="0.9">
                          <path d="M278 24 L224 58" markerEnd="none" />
                          <polygon points="222,60 231,58 227,51" fill="#7CC4FA" stroke="none" />
                          <path d="M294 52 L242 84" />
                          <polygon points="240,86 249,84 245,77" fill="#7CC4FA" stroke="none" />
                          <text
                            x="256"
                            y="18"
                            textAnchor="middle"
                            fill="#B8E1FF"
                            fontSize="8.5"
                            fontWeight="700"
                            stroke="none"
                          >
                            Alisios (NE)
                          </text>
                        </g>
                      )}

                      {/* Base volcanic silhouette of Gran Canaria */}
                      <path
                        d="M158 34
                           C166 28, 180 30, 183 41
                           C185 48, 179 54, 184 61
                           C204 71, 224 94, 228 124
                           C232 156, 217 190, 190 212
                           C166 231, 130 232, 102 216
                           C74 200, 58 168, 62 134
                           C65 101, 86 70, 118 56
                           C135 49, 148 45, 158 34 Z"
                        fill={
                          activeLayer === 'ecosistemas'
                            ? '#5F7751'
                            : activeLayer === 'agua'
                            ? '#5B7482'
                            : activeLayer === 'patrimonio'
                            ? '#8F7A5A'
                            : '#876B52'
                        }
                        stroke="#F5F3EE"
                        strokeWidth="2.2"
                      />

                      {/* Layer visual overlays inside the island */}
                      {activeLayer === 'relieve' && (
                        <g fill="none" stroke="#F6EAD7" opacity="0.45">
                          <ellipse cx="146" cy="134" rx="58" ry="52" strokeWidth="1.2" />
                          <ellipse cx="146" cy="134" rx="34" ry="30" strokeWidth="1.4" />
                          <ellipse cx="146" cy="134" rx="14" ry="12" strokeWidth="1.6" />
                          {/* Radial barrancos */}
                          <line x1="146" y1="134" x2="112" y2="74" strokeDasharray="2 3" />
                          <line x1="146" y1="134" x2="204" y2="112" strokeDasharray="2 3" />
                          <line x1="146" y1="134" x2="152" y2="210" strokeDasharray="2 3" />
                          <line x1="146" y1="134" x2="88" y2="148" strokeDasharray="2 3" />
                        </g>
                      )}

                      {activeLayer === 'ecosistemas' && (
                        <g opacity="0.68">
                          {/* Northern humid monteverde band */}
                          <path
                            d="M95 82 Q145 58 195 88 Q165 108 110 105 Z"
                            fill="#2A6F4E"
                          />
                          {/* Western Tamadaba pine forest */}
                          <circle cx="94" cy="118" r="22" fill="#3B835E" />
                          {/* Southern arid cardonal & dunes */}
                          <path
                            d="M102 190 Q150 225 196 192 Q165 178 122 178 Z"
                            fill="#D9B468"
                          />
                        </g>
                      )}

                      {activeLayer === 'agua' && (
                        <g>
                          {/* Mar de nubes north-east belt */}
                          <path
                            d="M96 76 Q148 56 202 88 Q186 105 135 102 Q104 98 96 76 Z"
                            fill="#DCEEFF"
                            opacity="0.45"
                          />
                          <text
                            x="148"
                            y="92"
                            textAnchor="middle"
                            fill="#F5F3EE"
                            fontSize="8"
                            fontWeight="700"
                          >
                            Mar de nubes (Barlovento)
                          </text>
                          {/* Water runoff to dams */}
                          <path
                            d="M146 132 Q138 152 128 170 M146 132 Q178 122 204 112"
                            fill="none"
                            stroke="#7CC4FA"
                            strokeWidth="2"
                            strokeDasharray="3 3"
                          />
                        </g>
                      )}

                      {activeLayer === 'patrimonio' && (
                        <g>
                          {/* Western-central UNESCO Biosphere Reserve zone */}
                          <path
                            d="M72 130 C76 92, 110 74, 148 92 C164 102, 166 156, 150 198 C118 214, 70 184, 72 130 Z"
                            fill="#2A6F4E"
                            fillOpacity="0.34"
                            stroke="#9FE3BE"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                          />
                          <text
                            x="108"
                            y="165"
                            textAnchor="middle"
                            fill="#D8F3DC"
                            fontSize="7.5"
                            fontWeight="700"
                          >
                            Reserva Biosfera
                          </text>
                        </g>
                      )}

                      {/* Interactive Landmark Pins */}
                      {layerLandmarks.map((lm, idx) => {
                        const isSelected = selectedLandmark?.id === lm.id;
                        return (
                          <g
                            key={lm.id}
                            onClick={() => {
                              soundEngine.playClick();
                              setSelectedLandmarkId(lm.id);
                            }}
                            className="cursor-pointer"
                          >
                            {isSelected && (
                              <circle
                                cx={lm.cx}
                                cy={lm.cy}
                                r="18"
                                fill="#F6EAD7"
                                opacity="0.28"
                              />
                            )}
                            <circle
                              cx={lm.cx}
                              cy={lm.cy}
                              r={isSelected ? 12 : 10}
                              fill={
                                isSelected
                                  ? activeLayerDef.accentHex
                                  : '#232A34'
                              }
                              stroke="#F5F3EE"
                              strokeWidth="2"
                            />
                            <text
                              x={lm.cx}
                              y={lm.cy + 3.5}
                              textAnchor="middle"
                              fill="#FFFFFF"
                              fontSize="9.5"
                              fontFamily="IBM Plex Mono, monospace"
                              fontWeight="700"
                            >
                              {idx + 1}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Quick Landmark Selector Pills below map (accessible for keyboard & touch) */}
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
                      {layerLandmarks.map((lm, idx) => {
                        const active = selectedLandmark?.id === lm.id;
                        return (
                          <button
                            key={lm.id}
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              setSelectedLandmarkId(lm.id);
                            }}
                            className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                              active
                                ? 'bg-[#F5F3EE] text-[#171B21]'
                                : 'bg-white/10 text-[#DCE5EE] hover:bg-white/20'
                            }`}
                          >
                            {idx + 1}. {lm.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Altitude / Process 3-step Profile Strip */}
                  <div className="grid gap-2.5 sm:grid-cols-3">
                    {activeLayerDef.altitudeStrip.map((band) => (
                      <div
                        key={band.zone}
                        className="rounded-xl border border-[#232A34]/12 bg-white p-3"
                      >
                        <div className="font-mono text-[11px] font-bold text-[#1D4E89] tabular-nums">
                          {band.elevation}
                        </div>
                        <div className="mt-0.5 text-xs font-bold text-[#171B21]">
                          {band.zone}
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-[#4A5564]">
                          {band.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT ZONE: Selected Landmark Ficha + Inquiry Challenge */}
                <div className="space-y-4">
                  {/* Layer overview */}
                  <div className="rounded-xl border border-[#232A34]/12 bg-white p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-mono font-semibold text-[#526071]">
                          {selectedLandmark.zoneLabel} ·{' '}
                          {selectedLandmark.metricLabel}
                        </div>
                        <h3 className="mt-0.5 font-display text-lg font-bold text-[#171B21]">
                          {selectedLandmark.name}
                        </h3>
                      </div>
                      {speechAvailable && (
                        <button
                          type="button"
                          onClick={() =>
                            speakText(
                              `${selectedLandmark.name}. ${
                                selectedLandmark.summary[state.cycle]
                              } ${selectedLandmark.humanNatureLink}`,
                              state.muted
                            )
                          }
                          aria-label={`Escuchar ficha de ${selectedLandmark.name}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#232A34]/15 bg-[#F5F3EE] px-2.5 py-1.5 text-xs font-bold text-[#1D4E89] hover:border-[#1D4E89] shrink-0 cursor-pointer"
                        >
                          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Oír</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs leading-relaxed text-[#2F3845]">
                      {selectedLandmark.summary[state.cycle]}
                    </p>

                    <p className="rounded-lg bg-[#F5F3EE] px-3 py-2 text-xs font-medium text-[#1D543A]">
                      <strong>Vínculo medio natural e historia:</strong>{' '}
                      {selectedLandmark.humanNatureLink}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#232A34]/10 pt-2.5 text-[11px]">
                      <span className="font-mono text-[#526071]">
                        {selectedLandmark.curriculumTag}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const idx = ROOMS_DATA.findIndex(
                            (r) => r.id === selectedLandmark.roomId
                          );
                          if (idx >= 0) onJumpToRoom(idx);
                        }}
                        className="inline-flex items-center gap-1 font-bold text-[#1D4E89] hover:underline whitespace-nowrap cursor-pointer"
                      >
                        <span>
                          Ver en Sala{' '}
                          {(ROOMS_DATA.findIndex(
                            (r) => r.id === selectedLandmark.roomId
                          ) ?? 0) + 1}
                        </span>
                        <ArrowUpRight
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Interactive Inquiry Mini-Challenge (CE2 + CE5 + CE6) */}
                  <div
                    className={`rounded-xl border p-4 space-y-3 ${
                      layerInquirySolved
                        ? 'border-[#2A6F4E]/50 bg-[#E8F3EC]'
                        : 'border-[#C67D1E]/45 bg-[#FAF4E8]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#171B21]">
                        <Lightbulb
                          className="h-4 w-4 text-[#C67D1E]"
                          aria-hidden="true"
                        />
                        <span>
                          Mini-reto de Indagación (
                          {activeLayerDef.inquiry.ceCodes.join(' · ')})
                        </span>
                      </span>
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          layerInquirySolved
                            ? 'text-[#1D543A]'
                            : 'text-[#8A5410]'
                        }`}
                      >
                        {layerInquirySolved ? 'Comprobado ✓' : 'Pendiente'}
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-[#526071]">
                      {activeLayerDef.inquiry.hypothesisPrompt[state.cycle]}
                    </p>

                    <p className="text-xs font-bold leading-snug text-[#171B21]">
                      {activeLayerDef.inquiry.question[state.cycle]}
                    </p>

                    <div className="space-y-2">
                      {activeLayerDef.inquiry.options.map((opt) => {
                        const isChosen =
                          selectedInquiryOption[activeLayer] === opt.id ||
                          (layerInquirySolved && opt.isCorrect);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleInquiryAnswer(activeLayer, opt.id)
                            }
                            className={`w-full rounded-lg border px-3 py-2.5 text-left text-xs leading-snug transition-colors cursor-pointer ${
                              isChosen && opt.isCorrect
                                ? 'border-[#2A6F4E] bg-white font-bold text-[#1D543A]'
                                : isChosen && !opt.isCorrect
                                ? 'border-[#A43D2F] bg-[#FCEAE7] text-[#7D2B20]'
                                : 'border-[#232A34]/15 bg-white text-[#232A34] hover:border-[#1D4E89]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {(currentSelectedInquiry || layerInquirySolved) && (
                      <div
                        className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                          layerInquirySolved || currentSelectedInquiry?.isCorrect
                            ? 'bg-white text-[#1D543A]'
                            : 'bg-[#FCEAE7] text-[#7D2B20]'
                        }`}
                      >
                        {currentSelectedInquiry
                          ? currentSelectedInquiry.feedback
                          : activeLayerDef.inquiry.conclusion}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: LÍNEA DEL TIEMPO INTERACTIVA (CE7 · BLOQUE C) */}
          {activeTab === 'linea-tiempo' && (
            <section className="space-y-5">
              {/* Top Visual Chronological Ruler */}
              <div className="rounded-2xl border border-[#232A34]/15 bg-white p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-[11px] font-semibold text-[#9C5A25]">
                      Bloque C · Sociedades en el tiempo (CE7) ·{' '}
                      {state.cycle === 'ciclo2' ? '2.º Ciclo' : '3.º Ciclo'}
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#171B21]">
                      Regla del Tiempo de Gran Canaria
                    </h3>
                  </div>
                  <div className="text-xs font-mono text-[#526071] tabular-nums">
                    1 década = 10 años · 1 siglo = 100 años · 1 milenio = 1.000
                    años
                  </div>
                </div>

                {/* Horizontal Visual Ruler */}
                <div className="grid gap-2 sm:grid-cols-4 pt-1">
                  {[
                    {
                      age: 'Época Aborigen',
                      span: 'Siglos III – XV',
                      room: 'Sala 1 · Gáldar',
                      bg: 'bg-[#FAF4E8] border-[#C67D1E]/40',
                    },
                    {
                      age: 'Conquista (s. XV)',
                      span: '1478 – 1483',
                      room: 'Sala 2 · Guiniguada',
                      bg: 'bg-[#F5EFEA] border-[#9C5A25]/40',
                    },
                    {
                      age: 'Edad Moderna y s. XIX',
                      span: '1595 – 1899',
                      room: 'Sala 3 · Costa Atlántica',
                      bg: 'bg-[#E8F0FA] border-[#1D4E89]/35',
                    },
                    {
                      age: 'Edad Contemporánea',
                      span: 'Siglos XX – XXI',
                      room: 'Sala 4 · Puerto de La Luz',
                      bg: 'bg-[#E8F3EC] border-[#2A6F4E]/40',
                    },
                  ].map((era, idx) => (
                    <div
                      key={era.age}
                      className={`rounded-xl border p-3 ${era.bg}`}
                    >
                      <div className="font-mono text-[11px] font-bold text-[#526071] tabular-nums">
                        {idx + 1}. {era.span}
                      </div>
                      <div className="mt-0.5 text-xs font-bold text-[#171B21]">
                        {era.age}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#4A5564]">
                        {era.room}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Challenge Grid */}
              <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr] items-start">
                {/* Step 1: Order milestones chronologically */}
                <div className="rounded-2xl border border-[#232A34]/15 bg-white p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-display text-base font-bold text-[#171B21]">
                        Paso 1 · Ordena los hitos de más antiguo a más reciente
                      </h4>
                      <p className="text-xs text-[#526071]">
                        Usa las flechas Subir / Bajar para colocar las{' '}
                        {orderedMilestones.length} etapas en su orden histórico
                        real.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetTimeline}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#232A34]/15 bg-[#F5F3EE] px-2.5 py-1.5 text-xs font-semibold text-[#333D4B] hover:border-[#1D4E89] whitespace-nowrap cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Mezclar</span>
                    </button>
                  </div>

                  <ol className="space-y-2">
                    {orderedMilestones.map((item, idx) => (
                      <li
                        key={item.id}
                        className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                          sequenceVerified
                            ? 'border-[#2A6F4E]/45 bg-[#E8F3EC]'
                            : 'border-[#232A34]/15 bg-[#FAF8F4]'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#232A34] font-mono text-xs font-bold text-[#F5F3EE] tabular-nums">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#171B21]">
                              {item.title}
                            </div>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-[#4A5564]">
                              {item.shortFact[state.cycle]}
                            </p>
                            {sequenceVerified && (
                              <div className="mt-1 font-mono text-[11px] font-semibold text-[#1D543A]">
                                {item.dateLabel} · {item.historicalAge}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveMilestone(idx, -1)}
                            aria-label={`Subir ${item.title}`}
                            className="rounded-md border border-[#232A34]/15 bg-white p-1.5 text-[#232A34] hover:border-[#1D4E89] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === orderedMilestones.length - 1}
                            onClick={() => moveMilestone(idx, 1)}
                            aria-label={`Bajar ${item.title}`}
                            className="rounded-md border border-[#232A34]/15 bg-white p-1.5 text-[#232A34] hover:border-[#1D4E89] disabled:opacity-35 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ArrowDown
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={verifyTimelineSequence}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4E89] px-4 py-2 text-xs font-bold text-white hover:bg-[#153A68] cursor-pointer"
                    >
                      <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Comprobar orden cronológico</span>
                    </button>
                    {sequenceVerified && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1D543A]">
                        <CheckCircle2
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        <span>Orden correcto</span>
                      </span>
                    )}
                  </div>

                  {sequenceFeedback && (
                    <div
                      className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                        sequenceFeedback.type === 'success'
                          ? 'bg-[#E8F3EC] text-[#1D543A]'
                          : 'bg-[#FCEAE7] text-[#7D2B20]'
                      }`}
                    >
                      {sequenceFeedback.text}
                    </div>
                  )}
                </div>

                {/* Step 2: Time units & Historical Ages verification */}
                <div
                  className={`rounded-2xl border p-4 space-y-3 ${
                    state.timelineSolved
                      ? 'border-[#2A6F4E]/50 bg-[#E8F3EC]'
                      : 'border-[#C67D1E]/45 bg-[#FAF4E8]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-base font-bold text-[#171B21]">
                      Paso 2 · Unidades del tiempo
                    </h4>
                    <span className="font-mono text-[11px] font-bold text-[#8A5410]">
                      {state.timelineSolved ? 'Completado ✓' : 'CE7'}
                    </span>
                  </div>

                  <p className="text-xs font-semibold leading-relaxed text-[#232A34]">
                    {timeUnitChallenge.question}
                  </p>

                  <div className="space-y-2">
                    {timeUnitChallenge.options.map((opt) => {
                      const chosen = timeUnitOptionId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectTimeUnit(opt.id)}
                          className={`w-full rounded-lg border px-3 py-2.5 text-left text-xs leading-snug transition-colors cursor-pointer ${
                            chosen && opt.isCorrect
                              ? 'border-[#2A6F4E] bg-white font-bold text-[#1D543A]'
                              : chosen && !opt.isCorrect
                              ? 'border-[#A43D2F] bg-[#FCEAE7] text-[#7D2B20]'
                              : 'border-[#232A34]/15 bg-white text-[#232A34] hover:border-[#1D4E89]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {selectedTimeUnit && (
                    <div
                      className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                        selectedTimeUnit.isCorrect
                          ? 'bg-white text-[#1D543A]'
                          : 'bg-[#FCEAE7] text-[#7D2B20]'
                      }`}
                    >
                      {selectedTimeUnit.feedback}
                    </div>
                  )}

                  {state.timelineSolved && (
                    <div className="rounded-lg border border-[#2A6F4E]/35 bg-white p-3 text-xs font-semibold text-[#1D543A]">
                      ✓ ¡Reto cronológico CE7 sellado en tu expediente de
                      Conocimiento del Medio!
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* TAB 4: ÁLBUM CANARIO */}
          {activeTab === 'album' && (
            <section className="space-y-4">
              <div className="rounded-xl border border-[#C67D1E]/35 bg-[#FAF4E8] p-4">
                <h3 className="font-display text-lg font-bold text-[#171B21]">
                  Álbum del Patrimonio y Habla Canaria
                </h3>
                <p className="mt-1 text-xs text-[#4A5564]">
                  En cada una de las 4 salas hay escondido un{' '}
                  <strong>Tesoro Canario</strong> dorado. Encuéntralos todos
                  para completar tu álbum y escuchar cómo se pronuncian.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {CANARIAN_COLLECTIBLES.map((item) => {
                  const room = ROOMS_DATA.find((r) => r.id === item.roomId);
                  const found = state.progress[item.roomId].collectibleFound;
                  return (
                    <article
                      key={item.id}
                      className={`rounded-2xl border p-4 transition-colors ${
                        found
                          ? 'border-[#C67D1E]/55 bg-white shadow-sm'
                          : 'border-[#232A34]/12 bg-[#EFECE4]/70 opacity-85'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {found ? (
                            <CanarianEmblemSvg
                              iconKey={item.iconKey}
                              className="h-14 w-14 shrink-0"
                            />
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#232A34]/25 bg-[#E3DED3] text-[#6B7482]">
                              <Lock className="h-5 w-5" aria-hidden="true" />
                            </div>
                          )}
                          <div>
                            <div className="text-[11px] font-mono font-semibold text-[#8A5410]">
                              Sala {room?.number} · {item.category}
                            </div>
                            <h4 className="font-display text-lg font-bold text-[#171B21]">
                              {found
                                ? `${item.word} · ${item.secondaryWord}`
                                : 'Tesoro escondido'}
                            </h4>
                          </div>
                        </div>

                        {found && speechAvailable && (
                          <button
                            type="button"
                            onClick={() =>
                              speakText(
                                `${item.word} y ${item.secondaryWord}. ${item.meaning} ${item.culturalFact}`,
                                state.muted
                              )
                            }
                            aria-label={`Pronunciar ${item.word}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#1D4E89]/30 bg-[#F5F3EE] px-2.5 py-1.5 text-xs font-bold text-[#1D4E89] hover:bg-[#E8F0FA] shrink-0 cursor-pointer"
                          >
                            <Volume2
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            <span>Oír</span>
                          </button>
                        )}
                      </div>

                      {found ? (
                        <div className="mt-3 space-y-2 text-xs text-[#333D4B]">
                          <p className="font-medium text-[#171B21]">
                            {item.meaning}
                          </p>
                          <p className="italic text-[#1D4E89]">
                            {item.exampleSentence}
                          </p>
                          <p className="border-t border-[#232A34]/10 pt-2 text-[#4A5564]">
                            {item.culturalFact}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-[#526071]">
                          <span>
                            Busca el destello dorado en {room?.title}.
                          </span>
                          {room && (
                            <button
                              type="button"
                              onClick={() => onJumpToRoom(room.number - 1)}
                              className="font-bold text-[#1D4E89] hover:underline whitespace-nowrap cursor-pointer"
                            >
                              Ir a Sala {room.number}
                            </button>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div className="flex justify-end border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#1D4E89] px-5 py-2 text-sm font-semibold text-white hover:bg-[#153A68] cursor-pointer"
          >
            Volver a la expedición
          </button>
        </div>
      </div>
    </div>
  );
};
