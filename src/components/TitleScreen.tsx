import React, { useState } from 'react';
import {
  Accessibility,
  BookOpen,
  Compass,
  GraduationCap,
  Headphones,
  IdCard,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CycleId, ExplorerId } from '../types/game';
import { TITLE_ART_PATH } from '../data/roomsData';
import { EXPLORERS, getExplorerById } from '../data/charactersAndBadges';
import { DIFFICULTY_PROFILES, getDifficultyProfile } from '../data/difficultyConfig';
import { isSpeechSupported, speakText } from '../utils/speech';

interface TitleScreenProps {
  cycle: CycleId;
  explorerId: ExplorerId;
  explorerName: string;
  hasSavedProgress: boolean;
  classroomConnected?: boolean;
  muted: boolean;
  voiceAuto: boolean;
  onSelectCycle: (cycle: CycleId) => void;
  onSelectExplorer: (id: ExplorerId) => void;
  onChangeName: (name: string) => void;
  onStart: () => void;
  onResetAndStart: () => void;
  onOpenCharacterSheet: () => void;
  onOpenTeacherGuide: () => void;
  onOpenClassroom: () => void;
  onOpenDua: () => void;
  onToggleMute: () => void;
  onToggleVoiceAuto: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  cycle,
  explorerId,
  explorerName,
  hasSavedProgress,
  classroomConnected = false,
  muted,
  voiceAuto,
  onSelectCycle,
  onSelectExplorer,
  onChangeName,
  onStart,
  onResetAndStart,
  onOpenCharacterSheet,
  onOpenTeacherGuide,
  onOpenClassroom,
  onOpenDua,
  onToggleMute,
  onToggleVoiceAuto,
}) => {
  const [imgError, setImgError] = useState(false);
  const selectedExplorer = getExplorerById(explorerId);
  const activeDifficulty = getDifficultyProfile(cycle);
  const speechAvailable = isSpeechSupported();

  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden bg-[#171B21] text-[#F5F3EE] select-none flex items-center">
      {/* Full-viewport illustrated backdrop */}
      {!imgError ? (
        <img
          src={TITLE_ART_PATH}
          alt="Escritorio de exploración con mapa ilustrado de Gran Canaria, pintadera aborigen y brújula"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="fixed inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <div
          className="fixed inset-0"
          style={{
            background:
              'radial-gradient(circle at 72% 48%, #3c342a 0%, #1d242e 55%, #13171d 100%)',
          }}
        />
      )}

      {/* Measured contrast scrim over calm left negative space */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-gradient-to-r from-[#12161C]/96 via-[#12161C]/86 to-[#12161C]/28"
      />

      {/* Top-right quiet utility buttons */}
      <div className="fixed top-4 right-5 z-20 flex items-center gap-2">
        {speechAvailable && (
          <button
            type="button"
            onClick={onToggleVoiceAuto}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
              voiceAuto
                ? 'border-[#E6A94F] bg-[#C67D1E] text-[#14181F]'
                : 'border-[#F5F3EE]/20 bg-[#171B21]/88 text-[#F5F3EE] hover:border-[#E6A94F]'
            }`}
          >
            <Headphones className="h-4 w-4" aria-hidden="true" />
            <span>{voiceAuto ? 'Voz: Activada' : 'Voz narradora'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenDua}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#F5F3EE]/20 bg-[#171B21]/88 px-3 py-2 text-xs font-semibold text-[#F5F3EE] transition-colors duration-150 hover:border-[#E6A94F] hover:bg-[#232A34] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Accessibility className="h-4 w-4 text-[#8AB4E8]" aria-hidden="true" />
          <span>DUA</span>
        </button>

        <button
          type="button"
          onClick={onOpenClassroom}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
            classroomConnected
              ? 'border-[#74C69D]/70 bg-[#1B3A2C]/92 text-[#E8F8EF] hover:border-[#74C69D]'
              : 'border-[#F5F3EE]/20 bg-[#171B21]/88 text-[#F5F3EE] hover:border-[#74C69D] hover:bg-[#232A34]'
          }`}
        >
          <GraduationCap className="h-4 w-4 text-[#74C69D]" aria-hidden="true" />
          <span>{classroomConnected ? 'Classroom · Conectado' : 'Classroom'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenTeacherGuide}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#F5F3EE]/20 bg-[#171B21]/88 px-3 py-2 text-xs font-semibold text-[#F5F3EE] transition-colors duration-150 hover:border-[#C67D1E] hover:bg-[#232A34] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <BookOpen className="h-4 w-4 text-[#E6A94F]" aria-hidden="true" />
          <span>Ficha Docente</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
          title={muted ? 'Activar sonido' : 'Silenciar sonido'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#F5F3EE]/20 bg-[#171B21]/88 text-[#F5F3EE] transition-colors duration-150 hover:border-[#C67D1E] hover:bg-[#232A34] shrink-0 cursor-pointer"
        >
          {muted ? (
            <VolumeX className="h-4 w-4 text-[#D9A76A]" aria-hidden="true" />
          ) : (
            <Volume2 className="h-4 w-4 text-[#E6A94F]" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Main Title Content over left calm negative space */}
      <div className="relative z-10 w-full px-5 py-14 sm:px-10 lg:px-14">
        <div className="w-full max-w-2xl">
          {/* Bespoke inline SVG Emblem + Title Lockup */}
          <div className="mb-4">
            <svg
              viewBox="0 0 320 44"
              className="h-9 w-auto text-[#E6A94F]"
              role="img"
              aria-label="Emblema de pintadera y brújula de Gran Canaria"
            >
              <g transform="translate(22 22)">
                <circle
                  r="19"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
                <polygon
                  points="0,-11 11,0 0,11 -11,0"
                  fill="none"
                  stroke="#F5F3EE"
                  strokeWidth="1.5"
                />
                <polygon points="0,-5 5,0 0,5 -5,0" fill="currentColor" />
              </g>
              <line
                x1="50"
                y1="22"
                x2="96"
                y2="22"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.55"
              />
              <text
                x="108"
                y="26"
                fill="#E9E5DC"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="11"
                letterSpacing="1.4"
              >
                ESCAPE ROOM · 4 SALAS · GRAN CANARIA
              </text>
            </svg>

            <h1 className="mt-1.5 font-display text-4xl font-bold tracking-tight text-[#F5F3EE] sm:text-5xl leading-[1.06]">
              Ecos de Tamarán
            </h1>
            <p className="mt-1 font-display text-lg italic text-[#E6C58D] sm:text-xl">
              Escape Room histórico y emocional · El Cuaderno del Tiempo
            </p>
          </div>

          {/* Interactive Character & Cycle Setup Panel */}
          <div className="mt-4 space-y-4 rounded-2xl border border-[#F5F3EE]/16 bg-[#171B21]/88 p-5 shadow-2xl">
            {/* 1. Choose Explorer */}
            <div>
              <div className="flex items-baseline justify-between gap-2 mb-2.5">
                <span className="text-xs font-semibold text-[#E9E5DC]">
                  1. Elige a tu explorador o exploradora
                </span>
                <span className="text-xs text-[#E6C58D]">
                  Poder: {selectedExplorer.powerName}
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label="Selector de personaje explorador"
                className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
              >
                {EXPLORERS.map((char) => {
                  const isSelected = char.id === explorerId;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        onSelectExplorer(char.id);
                        if (voiceAuto) {
                          speakText(`${char.name}. ${char.greeting}`, muted);
                        }
                      }}
                      className={`group flex flex-col items-center rounded-xl border p-2 text-center transition-transform duration-150 active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? 'border-[#E6A94F] bg-[#252D38] ring-2 ring-[#E6A94F]/40'
                          : 'border-[#F5F3EE]/14 bg-[#0F1318]/80 hover:border-[#F5F3EE]/35'
                      }`}
                    >
                      <div className="relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-lg border border-[#F5F3EE]/20 bg-[#232A34]">
                        <img
                          src={char.portraitPath}
                          alt={char.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-105"
                        />
                      </div>
                      <span className="mt-1.5 text-sm font-bold text-[#F5F3EE]">
                        {char.name}
                      </span>
                      <span className="text-[11px] leading-tight text-[#C7C1B5]">
                        {char.powerShort}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explorer speech bubble & basic traits + development sheet CTA */}
              <div className="mt-2.5 rounded-lg border border-[#F5F3EE]/12 bg-[#0F1318]/88 px-3.5 py-2.5 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#E2DDD2]">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Sparkles
                      className="h-3.5 w-3.5 shrink-0 text-[#E6A94F]"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      <strong className="text-[#F5F3EE]">
                        {selectedExplorer.name}
                      </strong>{' '}
                      ({selectedExplorer.sheet.age}) · «{selectedExplorer.greeting}»
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={onOpenCharacterSheet}
                      className="inline-flex items-center gap-1 rounded-md border border-[#E6A94F]/45 bg-[#232A34] px-2.5 py-1 text-[11px] font-bold text-[#F3C876] hover:border-[#E6A94F] hover:bg-[#2C3542] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <IdCard className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Hoja de desarrollo</span>
                    </button>
                    {speechAvailable && (
                      <button
                        type="button"
                        onClick={() =>
                          speakText(
                            `Soy ${selectedExplorer.name}. ${selectedExplorer.greeting} Mi poder es ${selectedExplorer.powerName}: ${selectedExplorer.powerShort}.`,
                            muted
                          )
                        }
                        aria-label="Escuchar presentación del personaje"
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-[#E6A94F] hover:bg-[#232A34] whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Oír</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#B9B3A7]">
                  <span>{selectedExplorer.sheet.origin}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#9EC5EA]">
                    {selectedExplorer.sheet.personalityTraits
                      .slice(0, 3)
                      .join(' · ')}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Difficulty Selector by Primary Cycle */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E9E5DC]">
                  <SlidersHorizontal
                    className="h-3.5 w-3.5 text-[#E6A94F]"
                    aria-hidden="true"
                  />
                  <span>2. Dificultad según tu ciclo de Primaria</span>
                </span>
                <span className="font-mono text-[11px] font-semibold text-[#90CAF9]">
                  {activeDifficulty.levelName} · {activeDifficulty.shortTag}
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label="Selector de dificultad y ciclo de Primaria"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {(['ciclo2', 'ciclo3'] as const).map((cid) => {
                  const prof = DIFFICULTY_PROFILES[cid];
                  const active = cycle === cid;
                  return (
                    <button
                      key={cid}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onSelectCycle(cid)}
                      className={`rounded-xl border px-3.5 py-2.5 text-left transition-colors duration-150 cursor-pointer ${
                        active
                          ? 'border-[#E6A94F] bg-[#1D3659] text-white ring-1 ring-[#E6A94F]/45'
                          : 'border-[#F5F3EE]/14 bg-[#0F1318]/85 text-[#D6D0C4] hover:border-[#F5F3EE]/35 hover:bg-[#1E242E]'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-bold text-[#F5F3EE]">
                          {prof.levelName} · {prof.cycleLabel}
                        </span>
                        <span className="font-mono text-[10px] font-semibold text-[#E6C58D] whitespace-nowrap">
                          {prof.gradesLabel}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#C7D3E3]">
                        <span>Sombras: {prof.shadowPiecesCount} piezas</span>
                        <span aria-hidden="true">·</span>
                        <span>{prof.clueLengthLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{prof.maxPuzzleHints} pistas</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-lg border border-[#F5F3EE]/10 bg-[#0F1318]/78 px-3.5 py-2 text-[11px] text-[#C7C1B5]">
                <span className="font-semibold text-[#E6C58D]">
                  Ajuste activo ({activeDifficulty.cycleLabel}):
                </span>{' '}
                {activeDifficulty.summaryPoints.join(' · ')}
              </div>
            </div>

            {/* 3. Team Name */}
            <div>
              <label
                htmlFor="explorer-name-input"
                className="block text-xs font-semibold text-[#D6D0C4] mb-1.5"
              >
                3. Tu nombre o equipo (opcional)
              </label>
              <input
                id="explorer-name-input"
                type="text"
                maxLength={45}
                value={explorerName}
                onChange={(e) => onChangeName(e.target.value)}
                placeholder="Ej. Equipo Roque Nublo · 4.º A"
                className="w-full rounded-lg border border-[#F5F3EE]/18 bg-[#0F1318]/90 px-3.5 py-2.5 text-sm text-[#F5F3EE] placeholder:text-[#8F97A3] transition-colors focus:border-[#E6A94F]"
              />
            </div>

            {/* Primary CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onStart}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#C67D1E] px-6 py-3 text-sm font-bold text-[#11151B] transition-transform duration-150 hover:bg-[#D98E2B] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
                <span>
                  {hasSavedProgress
                    ? `Seguir con ${selectedExplorer.name}`
                    : `¡Jugar con ${selectedExplorer.name}!`}
                </span>
              </button>

              {hasSavedProgress && (
                <button
                  type="button"
                  onClick={onResetAndStart}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#F5F3EE]/20 bg-transparent px-4 py-3 text-sm font-medium text-[#E2DDD2] transition-colors duration-150 hover:bg-[#232A34] hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Empezar de cero</span>
                </button>
              )}
            </div>
          </div>

          {/* Single flat control-hint line */}
          <p className="mt-4 font-mono text-xs text-[#C7C1B5] tracking-wide">
            Enter Iniciar · 4 salas con cerrojo · Pistas sin presión · 14 insignias
          </p>
        </div>
      </div>
    </main>
  );
};
