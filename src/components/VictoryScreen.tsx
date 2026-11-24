import React from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  GraduationCap,
  Headphones,
  Heart,
  HeartHandshake,
  Printer,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  CycleId,
  ExpeditionState,
  JournalEntry,
  ThermometerMoodId,
} from '../types/game';
import { ROOMS_DATA } from '../data/roomsData';
import { BADGES, getExplorerById } from '../data/charactersAndBadges';
import { getMoodById, THERMOMETER_MOODS } from '../data/enrichmentData';
import { formatEscapeTime } from '../data/escapeLocks';
import { downloadReflectionReport } from '../utils/exportSummary';
import { soundEngine } from '../utils/audio';
import { StickyNoteCard } from './StickyNoteWidget';

interface VictoryScreenProps {
  state: ExpeditionState;
  cycle: CycleId;
  onChangeName: (name: string) => void;
  onSelectRoom4AfterMood: (mood: ThermometerMoodId) => void;
  onOpenAudiobook: () => void;
  onOpenClassroom: () => void;
  onOpenTeacherGuide: () => void;
  onPlayAgain: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  state,
  cycle,
  onChangeName,
  onSelectRoom4AfterMood,
  onOpenAudiobook,
  onOpenClassroom,
  onOpenTeacherGuide,
  onPlayAgain,
}) => {
  const explorer = getExplorerById(state.explorerId);

  const entries: JournalEntry[] = ROOMS_DATA.map((room) => state.journal[room.id])
    .filter((entry): entry is JournalEntry => Boolean(entry));

  const totalSeals = ROOMS_DATA.reduce((sum, room) => {
    const p = state.progress[room.id];
    return (
      sum +
      Number(p.puzzle1Solved) +
      Number(p.puzzle2Solved) +
      Number(p.empathySolved)
    );
  }, 0);

  const transversalCount = ROOMS_DATA.filter(
    (r) => state.progress[r.id].transversalSolved
  ).length;
  const collectiblesCount = ROOMS_DATA.filter(
    (r) => state.progress[r.id].collectibleFound
  ).length;
  const room4After = state.emotions.sigloXX?.after;

  const cycleLabel =
    cycle === 'ciclo2'
      ? '2.º Ciclo de Primaria (3.º y 4.º)'
      : '3.º Ciclo de Primaria (5.º y 6.º)';

  const handleDownload = () => {
    downloadReflectionReport(state.explorerName, cycle, entries, state.emotions);
  };

  return (
    <main className="min-h-screen w-full bg-[#171B21] px-4 py-8 text-[#232A34] sm:px-8">
      <div className="print-surface mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[#F5F3EE]/15 bg-[#F5F3EE] shadow-2xl">
        {/* Diploma Banner */}
        <header className="border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={explorer.portraitPath}
                alt={explorer.name}
                referrerPolicy="no-referrer"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-[#C67D1E] object-cover shrink-0 shadow-md"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#2A6F4E]">
                  <Award className="h-4 w-4" aria-hidden="true" />
                  <span>¡Escape Room completado · Gran Canaria iluminada!</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {totalSeals}/12 sellos · {state.unlockedBadges.length}/
                    {BADGES.length} insignias · {transversalCount}/4 ODS ·{' '}
                    {collectiblesCount}/4 tesoros
                  </span>
                  {state.showEscapeTimer && state.elapsedSeconds > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 font-mono text-[#1D4E89] tabular-nums">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{formatEscapeTime(state.elapsedSeconds)}</span>
                      </span>
                    </>
                  )}
                </div>
                <h1 className="mt-1 font-display text-2xl font-bold text-[#171B21] sm:text-4xl">
                  Diploma de Escape · Tamarán
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#3E4856]">
                  Explorador guía: <strong>{explorer.name}</strong> ({explorer.powerName}) · {cycleLabel}
                </p>
              </div>
            </div>

            {/* Action toolbar */}
            <div className="no-print flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenAudiobook}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C67D1E] px-4 py-2.5 text-xs font-bold text-[#14181F] hover:bg-[#D98E2B] whitespace-nowrap cursor-pointer"
              >
                <Headphones className="h-4 w-4" aria-hidden="true" />
                <span>Escuchar audiolibro</span>
              </button>
              <button
                type="button"
                onClick={onOpenClassroom}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2A6F4E] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1E563B] whitespace-nowrap cursor-pointer"
              >
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                <span>Compartir en Classroom</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1D4E89] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#153A68] whitespace-nowrap cursor-pointer"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Descargar resumen (.html)</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg border border-[#232A34]/20 bg-white px-4 py-2.5 text-xs font-bold text-[#232A34] hover:bg-[#F5F3EE] whitespace-nowrap cursor-pointer"
              >
                <Printer className="h-4 w-4 text-[#1D4E89]" aria-hidden="true" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>

          {/* Editable student/team name */}
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#232A34]/12 bg-white px-4 py-3">
            <label
              htmlFor="victory-name"
              className="text-xs font-bold text-[#526071] whitespace-nowrap"
            >
              Nombre del alumno, alumna o equipo:
            </label>
            <input
              id="victory-name"
              type="text"
              maxLength={50}
              value={state.explorerName}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="Escribe aquí tu nombre o equipo antes de descargar"
              className="flex-1 min-w-[220px] bg-transparent text-sm font-bold text-[#171B21] placeholder:font-normal placeholder:text-[#7D8794] focus:outline-none"
            />
          </div>
        </header>

        {/* Body */}
        <div className="space-y-6 px-6 py-6 sm:px-8">
          {/* Collectible Badges Achieved */}
          <section>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#C67D1E]" aria-hidden="true" />
              <h2 className="font-display text-lg font-bold text-[#171B21]">
                Insignias conseguidas ({state.unlockedBadges.length}/{BADGES.length})
              </h2>
            </div>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {BADGES.map((badge) => {
                const earned = state.unlockedBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-xl border p-3.5 ${
                      earned
                        ? 'border-[#C67D1E]/55 bg-[#FAF4E8]'
                        : 'border-[#232A34]/10 bg-white/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#171B21]">
                        {badge.title}
                      </span>
                      {earned && (
                        <CheckCircle2
                          className="h-4 w-4 text-[#2A6F4E] shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[#526071]">
                      {badge.subtitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Emotional Evolution Timeline (Antes -> Después · EMOCREA) */}
          <section className="space-y-3 rounded-2xl border border-[#232A34]/12 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-[#C67D1E]" aria-hidden="true" />
                <h2 className="font-display text-lg font-bold text-[#171B21]">
                  Evolución Emocional (Antes → Después · EMOCREA)
                </h2>
              </div>
              <span className="text-xs text-[#526071]">
                Cómo te sentiste durante el viaje
              </span>
            </div>

            {!room4After && (
              <div className="no-print rounded-xl border border-[#C67D1E]/35 bg-[#FAF4E8] p-3.5 space-y-2">
                <div className="text-xs font-bold text-[#8A5410]">
                  ¿Cómo te sientes ahora al terminar toda la aventura? (1 toque):
                </div>
                <div className="flex flex-wrap gap-2">
                  {THERMOMETER_MOODS.map((mood) => (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playDiscover();
                        onSelectRoom4AfterMood(mood.id);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#232A34]/15 bg-white px-3 py-1.5 text-xs font-bold text-[#171B21] hover:border-[#2A6F4E] cursor-pointer"
                    >
                      <span aria-hidden="true">{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {ROOMS_DATA.map((room) => {
                const emo = state.emotions[room.id];
                const beforeMood = getMoodById(emo?.before);
                const afterMood = getMoodById(emo?.after);
                return (
                  <div
                    key={room.id}
                    className="rounded-xl border border-[#232A34]/12 bg-[#FAF8F4] p-3 text-xs space-y-1.5"
                  >
                    <div className="font-mono text-[11px] font-semibold text-[#1D4E89]">
                      Sala {room.number} · {room.mapZoneLabel}
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-[#171B21]">
                      <span>
                        {beforeMood
                          ? `${beforeMood.emoji} ${beforeMood.label}`
                          : '—'}
                      </span>
                      <span aria-hidden="true" className="text-[#8A5410]">
                        →
                      </span>
                      <span>
                        {afterMood
                          ? `${afterMood.emoji} ${afterMood.label}`
                          : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Empathy & Critical Reflection Summary */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <HeartHandshake
                className="h-5 w-5 text-[#C67D1E]"
                aria-hidden="true"
              />
              <h2 className="font-display text-xl font-bold text-[#171B21]">
                Diario de Empatía y Pensamiento Crítico
              </h2>
            </div>

            {entries.length === 0 ? (
              <p className="rounded-xl border border-[#232A34]/12 bg-white p-5 text-sm text-[#526071]">
                No hay entradas registradas en el diario todavía.
              </p>
            ) : (
              <div className="space-y-3.5">
                {entries.map((entry, idx) => (
                  <article
                    key={entry.roomId}
                    className="rounded-xl border border-[#232A34]/15 bg-white p-5 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display text-lg font-bold text-[#1D4E89]">
                        {idx + 1}. {entry.roomTitle}
                      </h3>
                      <span className="text-xs text-[#526071]">
                        {entry.epoch}
                      </span>
                    </div>

                    <div className="grid gap-2 text-xs text-[#333D4B] sm:grid-cols-2">
                      <p>
                        <strong className="text-[#171B21]">
                          Emoción (EMOCREA):
                        </strong>{' '}
                        {entry.emotionSelected}
                      </p>
                      <p>
                        <strong className="text-[#171B21]">
                          Decisión empática:
                        </strong>{' '}
                        {entry.decisionLabel}
                      </p>
                    </div>

                    <p className="text-xs text-[#333D4B]">
                      <strong className="text-[#171B21]">
                        Pensamiento crítico:
                      </strong>{' '}
                      {entry.criticalTakeaway}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-[#232A34]/10 bg-[#FAF8F4] p-3.5 text-sm leading-relaxed text-[#171B21]">
                      <p className="flex-1">«{entry.reflectionText}»</p>
                      {entry.stickyNote && (
                        <div className="shrink-0 self-start sm:self-center">
                          <StickyNoteCard note={entry.stickyNote} compact />
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer actions */}
        <footer className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onOpenTeacherGuide}
            className="inline-flex items-center gap-2 rounded-lg border border-[#232A34]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#232A34] hover:bg-[#EAE6DC] whitespace-nowrap cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-[#1D4E89]" aria-hidden="true" />
            <span>Ver Ficha Docente LOMLOE</span>
          </button>

          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2A6F4E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#225B40] whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Jugar con otro personaje</span>
          </button>
        </footer>
      </div>
    </main>
  );
};
