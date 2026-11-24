import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  HeartHandshake,
  Lock,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { CycleId, ExpeditionState, RoomId } from '../types/game';
import { ROOMS_DATA } from '../data/roomsData';
import { getMoodById } from '../data/enrichmentData';
import { isSpeechSupported, speakText } from '../utils/speech';
import { soundEngine } from '../utils/audio';

interface TimelineMilestone {
  year: string;
  label: string;
}

const EPOCH_MILESTONES: Record<
  RoomId,
  {
    shortYear: string;
    shortName: string;
    summary: Record<CycleId, string>;
    milestones: TimelineMilestone[];
  }
> = {
  aborigenes: {
    shortYear: 'Siglos I–XV',
    shortName: 'Aborígenes',
    summary: {
      ciclo2:
        'Los antiguos canarios (canarii) vivían en aldeas, hacían gofio de cebada y guardaban las cosechas para toda la comunidad.',
      ciclo3:
        'Sociedad amazigh insular organizada en los guanartematos de Agáldar y Telde, con graneros comunales como Valerón y arte geométrico en pintaderas y cuevas.',
    },
    milestones: [
      { year: 'Siglos I–XV', label: 'Pintaderas de barro y frisos de la Cueva Pintada (Gáldar).' },
      { year: 'Época canarii', label: 'Cenobio de Valerón: más de 300 silos comunitarios en la roca.' },
      { year: 'Antes de 1478', label: 'Organización territorial en los guanartematos de Agáldar y Telde.' },
    ],
  },
  conquista: {
    shortYear: '1478–1483',
    shortName: 'Conquista',
    summary: {
      ciclo2:
        'Llegaron naves castellanas al barranco de Guiniguada. Tras años de conflicto y pactos, nació una sociedad mezclada con raíces diversas.',
      ciclo3:
        'Cinco años de enfrentamientos, resistencia indígena y acuerdos diplomáticos (Pacto de Calatayud) que dieron origen a una sociedad mestiza en Gran Canaria.',
    },
    milestones: [
      { year: '24 jun. 1478', label: 'Fundación del campamento del Real de Las Palmas junto al Guiniguada.' },
      { year: '1481', label: 'Pacto de Calatayud impulsado por Tenesor Semidán.' },
      { year: '1483', label: 'Fin de la conquista en Ansite y convivencia mestiza que conserva topónimos canarii.' },
    ],
  },
  pirateria: {
    shortYear: 'Siglos XVI–XIX',
    shortName: 'Piratería',
    summary: {
      ciclo2:
        'Gran Canaria era parada clave de barcos hacia América. Las torres y el Castillo de la Luz protegían la costa con señales de fuego.',
      ciclo3:
        'Puente atlántico entre Europa, África y América: defensa costera con almenaras frente a corsarios (1599) y ciclos comerciales de azúcar, vino y cochinilla.',
    },
    milestones: [
      { year: 'Siglo XVI', label: 'Primer auge económico con los ingenios de caña de azúcar y las acequias.' },
      { year: 'Junio 1599', label: 'Defensa de Las Palmas ante la flota corsaria con avisos desde San Cristóbal.' },
      { year: 'Siglos XVII–XIX', label: 'Exportación de vinos canarios y del valioso tinte rojo de cochinilla.' },
    ],
  },
  sigloXX: {
    shortYear: '1900–Hoy',
    shortName: 'Siglo XX',
    summary: {
      ciclo2:
        'Muchas familias canarias emigraron en barco desde el Puerto de La Luz. Hoy cuidamos el agua de nuestras presas y acogemos a quien llega nuevo.',
      ciclo3:
        'Memoria viva de la emigración canaria hacia América (1952), ingeniería hidráulica de presas y heredamientos, y compromiso actual con la sostenibilidad y la acogida.',
    },
    milestones: [
      { year: 'Años 1950', label: 'Emigración marítima desde el Puerto de La Luz hacia Venezuela y Cuba.' },
      { year: 'Siglo XX', label: 'Construcción de grandes presas, galerías y red insular de agua.' },
      { year: 'Actualidad', label: 'Gran Canaria como tierra de acogida, memoria histórica y Agenda 2030.' },
    ],
  },
};

interface HistoricalTimelineViewProps {
  state: ExpeditionState;
  cycle: CycleId;
  onJumpToReflection: (roomId: RoomId) => void;
}

export const HistoricalTimelineView: React.FC<HistoricalTimelineViewProps> = ({
  state,
  cycle,
  onJumpToReflection,
}) => {
  const speechAvailable = isSpeechSupported();

  const timelineItems = ROOMS_DATA.map((room, idx) => {
    const p = state.progress[room.id];
    const seals =
      Number(p.puzzle1Solved) +
      Number(p.puzzle2Solved) +
      Number(p.empathySolved);
    const isCompleted = seals === 3;
    const hasActivity =
      p.clueFound ||
      seals > 0 ||
      p.transversalSolved ||
      p.collectibleFound ||
      Boolean(state.journal[room.id]) ||
      Boolean(state.emotions[room.id]?.before) ||
      Boolean(state.emotions[room.id]?.after);
    const isVisited = idx <= state.currentRoomIndex || hasActivity;
    const isCurrent = idx === state.currentRoomIndex;

    return {
      room,
      seals,
      isCompleted,
      isVisited,
      isCurrent,
      entry: state.journal[room.id],
      emotion: state.emotions[room.id],
      meta: EPOCH_MILESTONES[room.id],
    };
  });

  const visitedCount = timelineItems.filter((item) => item.isVisited).length;

  return (
    <div className="space-y-5">
      {/* Horizontal Chronological Axis Summary */}
      <section className="rounded-xl border border-[#1D4E89]/20 bg-[#E8F0FA] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1D4E89]">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>Línea de Tiempo Histórica de Gran Canaria</span>
          </div>
          <span className="font-mono text-xs font-semibold text-[#1D4E89] tabular-nums">
            {visitedCount}/4 épocas visitadas
          </span>
        </div>

        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {timelineItems.map((item) => (
            <button
              key={item.room.id}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                const el = document.getElementById(`timeline-card-${item.room.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }}
              className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-colors cursor-pointer ${
                item.isCompleted
                  ? 'border-[#2A6F4E]/50 bg-[#E1EFE8]'
                  : item.isVisited
                  ? 'border-[#C67D1E]/60 bg-[#FAF4E8]'
                  : 'border-dashed border-[#232A34]/20 bg-white/75 opacity-80'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span className="font-mono text-[10px] font-bold text-[#1D4E89] tabular-nums">
                  {item.meta.shortYear}
                </span>
                {item.isCompleted ? (
                  <CheckCircle2
                    className="h-3.5 w-3.5 text-[#2A6F4E] shrink-0"
                    aria-hidden="true"
                  />
                ) : item.isVisited ? (
                  <Compass
                    className="h-3.5 w-3.5 text-[#C67D1E] shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <Lock
                    className="h-3.5 w-3.5 text-[#6B7482] shrink-0"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="mt-1 text-xs font-bold text-[#171B21]">
                {item.room.number}. {item.meta.shortName}
              </div>
              <div className="text-[11px] text-[#526071]">
                {item.isCompleted
                  ? 'Completada ✓'
                  : item.isCurrent
                  ? 'Sala actual'
                  : item.isVisited
                  ? 'Visitada'
                  : 'Por explorar'}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Vertical Chronological Spine with Key Milestones & Reflection Jump */}
      <ol className="relative space-y-4 pl-6 sm:pl-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#C67D1E]/40">
        {timelineItems.map((item) => {
          const beforeMood = getMoodById(item.emotion?.before);
          const afterMood = getMoodById(item.emotion?.after);

          return (
            <li
              key={item.room.id}
              id={`timeline-card-${item.room.id}`}
              className="relative"
            >
              {/* Timeline Spine Node */}
              <span
                aria-hidden="true"
                className={`absolute -left-6 sm:-left-8 top-4 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border-2 font-mono text-[10px] font-bold shadow-sm ${
                  item.isCompleted
                    ? 'border-[#D8F3DC] bg-[#2A6F4E] text-white'
                    : item.isVisited
                    ? 'border-[#FAF4E8] bg-[#C67D1E] text-[#14181F]'
                    : 'border-[#C7C1B5] bg-[#EFECE4] text-[#6B7482]'
                }`}
              >
                {item.isCompleted ? '✓' : item.room.number}
              </span>

              <article
                className={`rounded-xl border p-4 sm:p-5 space-y-3.5 transition-colors ${
                  item.isVisited
                    ? 'border-[#232A34]/15 bg-white shadow-sm'
                    : 'border-dashed border-[#232A34]/20 bg-[#EFECE4]/70'
                }`}
              >
                {/* Epoch Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={item.room.imagePath}
                      alt={item.room.title}
                      referrerPolicy="no-referrer"
                      className={`h-14 w-20 rounded-lg border border-[#232A34]/15 object-cover shrink-0 ${
                        item.isVisited ? '' : 'grayscale opacity-70'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                        <span className="font-mono font-bold text-[#1D4E89] tabular-nums">
                          {item.room.years}
                        </span>
                        <span aria-hidden="true" className="text-[#8B93A0]">
                          ·
                        </span>
                        <span className="font-semibold text-[#526071]">
                          {item.room.epoch}
                        </span>
                      </div>
                      <h3 className="mt-0.5 font-display text-lg font-bold text-[#171B21]">
                        Sala {item.room.number}: {item.room.title}
                      </h3>
                      <p className="text-xs text-[#526071]">
                        {item.room.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`font-mono text-xs font-bold tabular-nums ${
                        item.isCompleted
                          ? 'text-[#2A6F4E]'
                          : item.isVisited
                          ? 'text-[#8A5410]'
                          : 'text-[#6B7482]'
                      }`}
                    >
                      {item.seals}/3 sellos
                    </span>
                    {speechAvailable && item.isVisited && (
                      <button
                        type="button"
                        onClick={() =>
                          speakText(
                            `${item.room.epoch}, ${item.room.years}. ${item.meta.summary[cycle]} Hitos clave: ${item.meta.milestones
                              .map((m) => `${m.year}, ${m.label}`)
                              .join(' ')}`,
                            state.muted
                          )
                        }
                        aria-label={`Escuchar época ${item.room.epoch}`}
                        title="Escuchar resumen cronológico"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1D4E89]/25 bg-[#F5F3EE] text-[#1D4E89] hover:bg-[#E8F0FA] cursor-pointer"
                      >
                        <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Epoch Summary + Key Milestones */}
                {item.isVisited ? (
                  <>
                    <p className="text-sm leading-relaxed text-[#2F3845]">
                      {item.meta.summary[cycle]}
                    </p>

                    <div className="rounded-lg border border-[#232A34]/10 bg-[#FAF8F4] p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D4E89]">
                        <Sparkles className="h-3.5 w-3.5 text-[#C67D1E]" aria-hidden="true" />
                        <span>Hitos clave de esta época</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#232A34]">
                        {item.meta.milestones.map((m, idx) => (
                          <li key={idx} className="flex items-baseline gap-2">
                            <span className="font-mono text-[11px] font-bold text-[#8A5410] whitespace-nowrap shrink-0">
                              {m.year}:
                            </span>
                            <span className="leading-snug">{m.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Reflection Snippet + Jump to Reflection Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#232A34]/10 pt-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        {item.entry ? (
                          <>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#2A6F4E]">
                              <HeartHandshake
                                className="h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                              />
                              <span>Reflexión guardada</span>
                              {item.entry.stickyNote && (
                                <span className="font-bold text-[#6E420B]">
                                  · {item.entry.stickyNote.emoji}{' '}
                                  {item.entry.stickyNote.word}
                                </span>
                              )}
                            </div>
                            <p className="truncate text-xs italic text-[#3E4856]">
                              «{item.entry.reflectionText}»
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-[#526071]">
                            Aún no has guardado la reflexión del dilema de esta sala.
                            {(beforeMood || afterMood) && (
                              <span className="ml-1.5 font-medium text-[#232A34]">
                                · Emoción:{' '}
                                {beforeMood ? beforeMood.emoji : '—'} →{' '}
                                {afterMood ? afterMood.emoji : '—'}
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          onJumpToReflection(item.room.id);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4E89] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#153A68] whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>
                          {item.entry
                            ? 'Ver reflexión en el diario'
                            : 'Ir a su ficha en el diario'}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs italic text-[#6B7482]">
                    Época todavía sin visitar. Avanza por las salas de Gran Canaria para descubrir sus hitos históricos y desbloquear tu reflexión aquí.
                  </p>
                )}
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
