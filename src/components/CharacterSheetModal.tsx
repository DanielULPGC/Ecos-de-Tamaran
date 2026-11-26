import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  Backpack,
  CheckCircle2,
  Circle,
  Compass,
  Heart,
  MapPin,
  Sparkles,
  Target,
  UserCheck,
  Volume2,
  X,
} from 'lucide-react';
import {
  CharacterReactionId,
  ExpeditionState,
  ExplorerAttributes,
  ExplorerId,
} from '../types/game';
import { EXPLORERS, getExplorerById } from '../data/charactersAndBadges';
import { ROOMS_DATA } from '../data/roomsData';
import { CHARACTER_REACTION_META } from '../data/characterReactions';
import { ExplorerReactionAvatar } from './ExplorerReactionAvatar';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface CharacterSheetModalProps {
  initialExplorerId: ExplorerId;
  activeExplorerId: ExplorerId;
  state: ExpeditionState;
  muted: boolean;
  onSelectExplorer: (id: ExplorerId) => void;
  onClose: () => void;
}

const ATTRIBUTE_LABELS: Array<{
  key: keyof ExplorerAttributes;
  label: string;
  colorClass: string;
}> = [
  { key: 'observacion', label: 'Observación', colorClass: 'bg-[#2A6F4E]' },
  { key: 'empatia', label: 'Empatía', colorClass: 'bg-[#C67D1E]' },
  { key: 'ingenio', label: 'Ingenio', colorClass: 'bg-[#1D4E89]' },
  {
    key: 'trabajoEnEquipo',
    label: 'Trabajo en equipo',
    colorClass: 'bg-[#9C5A25]',
  },
];

const PREVIEW_REACTIONS: CharacterReactionId[] = [
  'curioso',
  'concentrado',
  'sorpresa',
  'alegria',
  'animo',
  'orgullo',
];

function computeExplorerRank(state: ExpeditionState) {
  let completedRooms = 0;
  let totalPoints = 0;

  ROOMS_DATA.forEach((room) => {
    const p = state.progress[room.id];
    const roomDone = p.puzzle1Solved && p.puzzle2Solved && p.empathySolved;
    if (roomDone) completedRooms += 1;
    totalPoints +=
      Number(p.clueFound) +
      Number(p.puzzle1Solved) * 2 +
      Number(p.puzzle2Solved) * 2 +
      Number(p.empathySolved) * 2 +
      Number(p.transversalSolved) +
      Number(p.collectibleFound) +
      Number(p.shadowSolved);
  });

  if (completedRooms >= 4) {
    return {
      level: 4,
      title: 'Vigía de Gran Canaria',
      completedRooms,
      totalPoints,
    };
  }
  if (completedRooms >= 2 || totalPoints >= 14) {
    return {
      level: 3,
      title: 'Cronista de Gran Canaria',
      completedRooms,
      totalPoints,
    };
  }
  if (completedRooms >= 1 || totalPoints >= 5) {
    return {
      level: 2,
      title: 'Guía del Tiempo',
      completedRooms,
      totalPoints,
    };
  }
  return {
    level: 1,
    title: 'Aprendiz de Expedición',
    completedRooms,
    totalPoints,
  };
}

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  initialExplorerId,
  activeExplorerId,
  state,
  muted,
  onSelectExplorer,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocusTrap(dialogRef, true);

  const [viewingId, setViewingId] = useState<ExplorerId>(initialExplorerId);
  const [previewReaction, setPreviewReaction] =
    useState<CharacterReactionId>('curioso');
  const [reactionPulse, setReactionPulse] = useState(0);

  const explorer = getExplorerById(viewingId);
  const sheet = explorer.sheet;
  const isCurrentActive = viewingId === activeExplorerId;
  const speechAvailable = isSpeechSupported();
  const rank = computeExplorerRank(state);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const handleReadSheet = () => {
    const text = `${explorer.name}, ${explorer.role}. ${sheet.age}, de ${sheet.origin}. ${sheet.bio} Su poder especial es ${explorer.powerName}: ${explorer.powerDetail} Su lema es: ${sheet.motto}`;
    speakText(text, muted);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="character-sheet-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/86 p-3 sm:p-5"
    >
      <div className="flex max-h-[93vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-[#526071]">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#1D4E89]">
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Hoja de Desarrollo del Personaje</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[#8A5410] tabular-nums">
                Nivel {rank.level} · {rank.title}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {rank.completedRooms}/4 etapas completadas
              </span>
            </div>
            <h2
              id="character-sheet-title"
              className="mt-0.5 font-display text-xl font-bold text-[#171B21] sm:text-2xl"
            >
              {explorer.name} — {explorer.role}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {speechAvailable && (
              <button
                type="button"
                onClick={handleReadSheet}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1D4E89]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#1D4E89] hover:bg-[#E8F0FA] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Escuchar ficha</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              aria-label="Cerrar hoja de personaje"
              className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] shrink-0 cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Explorer Switcher Strip */}
        <div
          role="tablist"
          aria-label="Elegir personaje para consultar su hoja de desarrollo"
          className="flex flex-wrap items-center gap-2 border-b border-[#232A34]/12 bg-[#EFECE4] px-5 py-2.5 sm:px-6"
        >
          {EXPLORERS.map((char) => {
            const selected = char.id === viewingId;
            const activeInGame = char.id === activeExplorerId;
            return (
              <button
                key={char.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  soundEngine.playClick();
                  stopSpeaking();
                  setViewingId(char.id);
                  setPreviewReaction('curioso');
                  setReactionPulse((k) => k + 1);
                }}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selected
                    ? 'border-[#1D4E89] bg-[#1D4E89] text-white'
                    : 'border-[#232A34]/15 bg-white text-[#232A34] hover:border-[#1D4E89]'
                }`}
              >
                <span>{char.name}</span>
                {activeInGame && (
                  <span
                    className={`text-[10px] font-mono ${
                      selected ? 'text-[#F3C876]' : 'text-[#2A6F4E]'
                    }`}
                  >
                    · En juego
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Scrollable Character Sheet */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-5">
          {/* Top Grid: Unobstructed Portrait Column + Basic Characteristics */}
          <div className="grid gap-5 md:grid-cols-[240px_1fr] items-start">
            {/* Clean Portrait Card — ZERO text overlapping the illustration */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-white shadow-sm">
              <div className="aspect-square w-full overflow-hidden bg-[#EFECE4]">
                <img
                  src={explorer.portraitPath}
                  alt={`Ilustración de ${explorer.name}, ${explorer.role}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="border-t border-[#232A34]/10 bg-[#FAF8F4] p-3.5 space-y-2.5">
                <div>
                  <div className="text-xs font-bold text-[#171B21]">
                    {explorer.name}
                  </div>
                  <div className="text-[11px] font-medium text-[#526071]">
                    {sheet.age}
                  </div>
                </div>

                {/* Live Expression Previewer */}
                <div className="border-t border-[#232A34]/10 pt-2.5">
                  <div className="flex items-center gap-2.5">
                    <ExplorerReactionAvatar
                      explorerId={explorer.id}
                      explorerName={explorer.name}
                      reaction={previewReaction}
                      pulseKey={reactionPulse}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#526071]">
                        Expresión facial
                      </div>
                      <div
                        className={`text-xs font-bold ${CHARACTER_REACTION_META[previewReaction].lightTextClass}`}
                      >
                        {CHARACTER_REACTION_META[previewReaction].label}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    {PREVIEW_REACTIONS.map((rx) => {
                      const active = rx === previewReaction;
                      return (
                        <button
                          key={rx}
                          type="button"
                          onClick={() => {
                            soundEngine.playStep();
                            setPreviewReaction(rx);
                            setReactionPulse((k) => k + 1);
                          }}
                          className={`rounded-md border px-1.5 py-1 text-[10px] font-semibold transition-colors truncate cursor-pointer ${
                            active
                              ? 'border-[#1D4E89] bg-[#E8F0FA] text-[#1D4E89]'
                              : 'border-[#232A34]/14 bg-white text-[#4A5564] hover:border-[#1D4E89]'
                          }`}
                        >
                          {CHARACTER_REACTION_META[rx].label.replace(/[¡!]/g, '')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Basic Characteristics + Attributes */}
            <div className="space-y-4">
              {/* Bio & Motto */}
              <div className="rounded-2xl border border-[#232A34]/14 bg-white p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-[#171B21]">
                    Características básicas
                  </h3>
                  <span className="font-mono text-xs font-semibold text-[#1D4E89]">
                    {sheet.personalityTraits.join(' · ')}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-[#232A34]">
                  {sheet.bio}
                </p>

                <blockquote className="rounded-xl border border-[#C67D1E]/30 bg-[#FAF4E8] px-3.5 py-2.5 text-xs italic font-medium text-[#6B420F]">
                  «{sheet.motto}»
                </blockquote>

                <dl className="grid gap-2.5 sm:grid-cols-2 pt-1 text-xs">
                  <div className="flex items-start gap-2 rounded-lg bg-[#F5F3EE] p-2.5">
                    <MapPin
                      className="h-4 w-4 shrink-0 text-[#1D4E89] mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="font-bold text-[#171B21]">Origen</dt>
                      <dd className="text-[#46515E]">{sheet.origin}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-[#F5F3EE] p-2.5">
                    <Backpack
                      className="h-4 w-4 shrink-0 text-[#9C5A25] mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="font-bold text-[#171B21]">
                        Objeto inseparable
                      </dt>
                      <dd className="text-[#46515E]">{sheet.favoriteObject}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-[#F5F3EE] p-2.5">
                    <Heart
                      className="h-4 w-4 shrink-0 text-[#2A6F4E] mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="font-bold text-[#171B21]">
                        Rincón favorito
                      </dt>
                      <dd className="text-[#46515E]">{sheet.favoritePlace}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-[#FAF4E8] p-2.5">
                    <Sparkles
                      className="h-4 w-4 shrink-0 text-[#C67D1E] mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <dt className="font-bold text-[#171B21]">
                        Poder · {explorer.powerName}
                      </dt>
                      <dd className="text-[#46515E]">{explorer.powerDetail}</dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* Base Attributes (1-5 meters) */}
              <div className="rounded-2xl border border-[#232A34]/14 bg-white p-4">
                <div className="flex items-baseline justify-between gap-2 mb-3">
                  <h3 className="font-display text-base font-bold text-[#171B21]">
                    Perfil de habilidades
                  </h3>
                  <span className="font-mono text-[11px] text-[#526071]">
                    Escala base 1 – 5
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ATTRIBUTE_LABELS.map((attr) => {
                    const value = sheet.attributes[attr.key];
                    return (
                      <div key={attr.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#171B21]">
                            {attr.label}
                          </span>
                          <span className="font-mono font-bold text-[#526071] tabular-nums">
                            {value}/5
                          </span>
                        </div>
                        <div
                          className="grid grid-cols-5 gap-1"
                          role="meter"
                          aria-label={`${attr.label}: ${value} de 5`}
                          aria-valuemin={0}
                          aria-valuemax={5}
                          aria-valuenow={value}
                        >
                          {[1, 2, 3, 4, 5].map((step) => (
                            <span
                              key={step}
                              className={`h-2 rounded-sm ${
                                step <= value
                                  ? attr.colorClass
                                  : 'bg-[#E3DED3]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Development Sheet Section: Growth Goals + 4-Stage Evolution */}
          <div className="rounded-2xl border border-[#232A34]/14 bg-white p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target
                  className="h-4 w-4 text-[#1D4E89]"
                  aria-hidden="true"
                />
                <h3 className="font-display text-lg font-bold text-[#171B21]">
                  Hoja de desarrollo y evolución
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#2A6F4E]">
                {sheet.competencyFocus}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[#232A34]/10 bg-[#F8F6F1] p-3.5">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1D4E89]">
                  Meta al empezar
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#232A34]">
                  {sheet.startingGoal}
                </p>
              </div>
              <div className="rounded-xl border border-[#2A6F4E]/20 bg-[#EEF6F1] p-3.5">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1D543A]">
                  Fortaleza en el equipo
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#232A34]">
                  {sheet.growthStrength}
                </p>
              </div>
              <div className="rounded-xl border border-[#C67D1E]/25 bg-[#FAF4E8] p-3.5">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8A5410]">
                  Reto de crecimiento
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#232A34]">
                  {sheet.learningChallenge}
                </p>
              </div>
            </div>

            {/* 4-Room Character Arc Milestones linked to real progress */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold text-[#171B21]">
                  Recorrido de evolución por épocas de Gran Canaria
                </span>
                <span className="font-mono text-[11px] text-[#526071] tabular-nums">
                  {rank.completedRooms}/4 etapas selladas
                </span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {sheet.milestones.map((milestone) => {
                  const room = ROOMS_DATA.find(
                    (r) => r.id === milestone.roomId
                  );
                  const p = state.progress[milestone.roomId];
                  const solved =
                    p.puzzle1Solved && p.puzzle2Solved && p.empathySolved;
                  const started =
                    p.clueFound ||
                    p.puzzle1Solved ||
                    p.puzzle2Solved ||
                    p.empathySolved;
                  return (
                    <div
                      key={milestone.roomId}
                      className={`rounded-xl border p-3.5 transition-colors ${
                        solved
                          ? 'border-[#2A6F4E]/45 bg-[#EDF6F0]'
                          : started
                          ? 'border-[#1D4E89]/35 bg-[#F2F6FC]'
                          : 'border-[#232A34]/12 bg-[#FAF8F4]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#171B21]">
                          {milestone.stageLabel}
                        </span>
                        {solved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1D543A]">
                            <CheckCircle2
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            <span>Superada</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#526071]">
                            <Circle
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            <span>{started ? 'En curso' : 'Pendiente'}</span>
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium text-[#526071]">
                        Sala {room?.number} · {room?.epoch}
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#232A34]">
                        {milestone.growthNote}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#232A34]/12 bg-[#EFECE4] px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-medium text-[#526071]">
            <Award className="h-4 w-4 text-[#C67D1E]" aria-hidden="true" />
            <span>
              {isCurrentActive
                ? `${explorer.name} es tu personaje activo en esta expedición.`
                : `Puedes cambiar a ${explorer.name} sin perder tu progreso.`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isCurrentActive && (
              <button
                type="button"
                onClick={() => {
                  onSelectExplorer(viewingId);
                  soundEngine.playPowerUp();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#C67D1E] px-4 py-2 text-xs font-bold text-[#14181F] hover:bg-[#D98E2B] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <UserCheck className="h-4 w-4" aria-hidden="true" />
                <span>Elegir a {explorer.name}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="rounded-lg bg-[#1D4E89] px-5 py-2 text-xs font-bold text-white hover:bg-[#153A68] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Cerrar ficha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
