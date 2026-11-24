import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  ClipboardList,
  Clock,
  Compass,
  Gem,
  Globe2,
  HeartHandshake,
  Mountain,
  Search,
  Shapes,
  Volume2,
  X,
} from 'lucide-react';
import {
  AtlasModalTab,
  CycleId,
  ExpeditionState,
  RoomId,
} from '../types/game';
import {
  MissionActionTarget,
  MissionLomloeArea,
  buildMissionLogByRoom,
} from '../data/missionLogData';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText } from '../utils/speech';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface MissionLogModalProps {
  state: ExpeditionState;
  cycle: CycleId;
  onNavigateToMission: (roomIndex: number, target: MissionActionTarget) => void;
  onOpenAtlasTab?: (tab: AtlasModalTab) => void;
  onClose: () => void;
}

type StatusFilter = 'all' | 'core' | 'pending' | 'completed';
type RoomFilter = 'all' | RoomId;

const TargetGlyph: React.FC<{ target: MissionActionTarget }> = ({ target }) => {
  const cls = 'h-3.5 w-3.5 shrink-0';
  switch (target) {
    case 'clue':
      return <Search className={cls} aria-hidden="true" />;
    case 'puzzle1':
    case 'puzzle2':
      return <Compass className={cls} aria-hidden="true" />;
    case 'empathy':
      return <HeartHandshake className={cls} aria-hidden="true" />;
    case 'shadow':
      return <Shapes className={cls} aria-hidden="true" />;
    case 'transversal':
      return <Globe2 className={cls} aria-hidden="true" />;
    case 'collectible':
      return <Gem className={cls} aria-hidden="true" />;
  }
};

const AREA_ORDER: MissionLomloeArea[] = [
  'Conocimiento del Medio',
  'EMOCREA y Empatía',
  'Valores y Agenda 2030',
  'Patrimonio Canario',
];

export const MissionLogModal: React.FC<MissionLogModalProps> = ({
  state,
  cycle,
  onNavigateToMission,
  onOpenAtlasTab,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocusTrap(dialogRef, true);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roomFilter, setRoomFilter] = useState<RoomFilter>('all');
  const [expandedCurriculum, setExpandedCurriculum] = useState<
    Partial<Record<RoomId, boolean>>
  >({});

  const speechAvailable = isSpeechSupported();

  const roomGroups = useMemo(
    () => buildMissionLogByRoom(state, cycle),
    [state, cycle]
  );

  const allItems = useMemo(
    () => roomGroups.flatMap((group) => group.items),
    [roomGroups]
  );

  const totalCount = allItems.length;
  const completedCount = allItems.filter((item) => item.completed).length;
  const pendingCount = totalCount - completedCount;
  const overallPct = Math.round((completedCount / totalCount) * 100);

  const areaStats = useMemo(
    () =>
      AREA_ORDER.map((area) => {
        const subset = allItems.filter((item) => item.area === area);
        const done = subset.filter((item) => item.completed).length;
        return {
          area,
          done,
          total: subset.length,
          pct: Math.round((done / subset.length) * 100),
        };
      }),
    [allItems]
  );

  const filteredGroups = useMemo(() => {
    return roomGroups
      .filter((group) => roomFilter === 'all' || group.roomId === roomFilter)
      .map((group) => ({
        ...group,
        visibleItems: group.items.filter((item) => {
          if (statusFilter === 'core') return item.isCoreSeal;
          if (statusFilter === 'pending') return !item.completed;
          if (statusFilter === 'completed') return item.completed;
          return true;
        }),
      }))
      .filter(
        (group) => statusFilter === 'all' || group.visibleItems.length > 0
      );
  }, [roomGroups, roomFilter, statusFilter]);

  const toggleCurriculum = (roomId: RoomId) => {
    soundEngine.playClick();
    setExpandedCurriculum((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  const handleReadSummary = () => {
    const cycleLabel =
      cycle === 'ciclo2'
        ? 'segundo ciclo de Primaria'
        : 'tercer ciclo de Primaria';
    const nextPending = allItems.find((item) => !item.completed);
    const summaryText = nextPending
      ? `Bitácora de Misiones LOMLOE para ${cycleLabel}. Has completado ${completedCount} de ${totalCount} objetivos, lo que supone un ${overallPct} por ciento. Tu siguiente reto pendiente está en la Sala ${nextPending.roomNumber}: ${nextPending.title}.`
      : `Bitácora de Misiones LOMLOE para ${cycleLabel}. ¡Enhorabuena! Has completado los ${totalCount} objetivos de las cuatro épocas de Gran Canaria.`;
    speakText(summaryText, state.muted);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-log-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/86 p-3 sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Archival Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-[#526071]">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#1D4E89]">
                <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Currículo de Canarias · Decreto 211/2022</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {cycle === 'ciclo2'
                  ? '2.º Ciclo (3.º y 4.º)'
                  : '3.º Ciclo (5.º y 6.º)'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[#2A6F4E] tabular-nums">
                {completedCount}/{totalCount} objetivos ({overallPct}%)
              </span>
            </div>
            <h2
              id="mission-log-title"
              className="mt-1 font-display text-xl font-bold text-[#171B21] sm:text-2xl"
            >
              Bitácora de Misiones LOMLOE
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {speechAvailable && (
              <button
                type="button"
                onClick={handleReadSummary}
                title="Escuchar resumen de progreso"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#232A34]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[#1D4E89] hover:border-[#1D4E89] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Escuchar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar Bitácora de Misiones"
              className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] shrink-0 cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* LOMLOE Areas Progress Strip + Interactive Filters */}
        <div className="border-b border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5 space-y-3.5">
          {/* 4-Area LOMLOE Breakdown */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {areaStats.map((stat) => (
              <div
                key={stat.area}
                className="rounded-lg border border-[#232A34]/12 bg-white px-3 py-2"
              >
                <div className="flex items-baseline justify-between gap-2 text-[11px]">
                  <span className="font-semibold text-[#232A34] truncate">
                    {stat.area}
                  </span>
                  <span className="font-mono font-bold text-[#1D4E89] tabular-nums shrink-0">
                    {stat.done}/{stat.total}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E3DED3]">
                  <div
                    className={`h-full rounded-full transition-transform duration-300 origin-left ${
                      stat.done === stat.total
                        ? 'bg-[#2A6F4E]'
                        : 'bg-[#1D4E89]'
                    }`}
                    style={{ transform: `scaleX(${stat.pct / 100})` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Conocimiento del Medio: Atlas del Medio Natural (Bloque A) y Línea del Tiempo (CE7) */}
          {onOpenAtlasTab && (
            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[#2A6F4E]/35 bg-[#E8F3EC] px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Mountain
                    className="h-4 w-4 text-[#2A6F4E] shrink-0"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#171B21] truncate">
                      Atlas del Medio Natural (Bloque A · CE2/CE5/CE6)
                    </div>
                    <div className="font-mono text-[11px] text-[#1D543A] tabular-nums">
                      {(state.atlasLayersCompleted ?? []).length}/4 capas
                      indagadas
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenAtlasTab('medio-natural')}
                  className="inline-flex items-center gap-1 rounded-md bg-[#2A6F4E] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#1D543A] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Explorar</span>
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg border border-[#9C5A25]/35 bg-[#F8EFE6] px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock
                    className="h-4 w-4 text-[#9C5A25] shrink-0"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#171B21] truncate">
                      Línea del Tiempo y Unidades (Bloque C · CE7)
                    </div>
                    <div className="font-mono text-[11px] text-[#784319]">
                      {state.timelineSolved
                        ? 'Reto cronológico completado ✓'
                        : 'Pendiente de ordenar etapas'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenAtlasTab('linea-tiempo')}
                  className="inline-flex items-center gap-1 rounded-md bg-[#9C5A25] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#784319] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{state.timelineSolved ? 'Revisar' : 'Abrir'}</span>
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Status & Room Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div
              role="tablist"
              aria-label="Filtrar misiones por estado"
              className="flex flex-wrap items-center gap-1.5"
            >
              {(
                [
                  { id: 'all', label: `Todos (${totalCount})` },
                  { id: 'core', label: 'Sellos clave (12)' },
                  { id: 'pending', label: `Pendientes (${pendingCount})` },
                  { id: 'completed', label: `Completados (${completedCount})` },
                ] as const
              ).map((tab) => {
                const active = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      soundEngine.playClick();
                      setStatusFilter(tab.id);
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

            <div
              role="tablist"
              aria-label="Filtrar misiones por sala"
              className="flex flex-wrap items-center gap-1.5"
            >
              {(
                [
                  { id: 'all', label: 'Todas las salas' },
                  { id: 'aborigenes', label: 'Sala 1' },
                  { id: 'conquista', label: 'Sala 2' },
                  { id: 'pirateria', label: 'Sala 3' },
                  { id: 'sigloXX', label: 'Sala 4' },
                ] as const
              ).map((tab) => {
                const active = roomFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      soundEngine.playClick();
                      setRoomFilter(tab.id);
                    }}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#232A34] text-[#F5F3EE]'
                        : 'border border-[#232A34]/15 bg-white text-[#4A5564] hover:border-[#232A34]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Room-by-Room Mission Checklist */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="rounded-xl border border-[#2A6F4E]/35 bg-[#E8F3EC] p-6 text-center">
              <CheckCircle2
                className="mx-auto h-8 w-8 text-[#2A6F4E]"
                aria-hidden="true"
              />
              <h3 className="mt-2 font-display text-lg font-bold text-[#171B21]">
                {statusFilter === 'pending'
                  ? '¡No quedan misiones pendientes en esta selección!'
                  : 'Todavía no hay misiones completadas en esta selección'}
              </h3>
              <p className="mt-1 text-xs text-[#3D4754]">
                {statusFilter === 'pending'
                  ? 'Has superado todos los retos curriculares LOMLOE de las salas seleccionadas.'
                  : 'Cambia el filtro a «Pendientes» o «Todos» para empezar tu siguiente reto.'}
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isCurrentRoom = group.roomIndex === state.currentRoomIndex;
              const roomPct = Math.round(
                (group.completedCount / group.totalCount) * 100
              );
              const isExpanded = Boolean(expandedCurriculum[group.roomId]);
              const allCoreDone = group.coreCompletedCount === 3;

              return (
                <section
                  key={group.roomId}
                  className="space-y-3 border-b border-[#232A34]/10 pb-6 last:border-b-0 last:pb-0"
                >
                  {/* Room Section Heading */}
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#526071]">
                        <span className="font-mono font-bold text-[#1D4E89] tabular-nums">
                          Sala {group.roomNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{group.epoch}</span>
                        <span aria-hidden="true">·</span>
                        <span>{group.years}</span>
                        {isCurrentRoom && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-bold text-[#8A5410]">
                              Estás aquí
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="mt-0.5 font-display text-lg font-bold text-[#171B21]">
                        {group.roomTitle}
                      </h3>
                      <div className="mt-0.5 text-xs text-[#526071]">
                        Competencias clave LOMLOE:{' '}
                        <span className="font-medium text-[#232A34]">
                          {group.competenciasClave.join(' · ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
                        <span
                          className={`font-bold ${
                            group.completedCount === group.totalCount
                              ? 'text-[#1D543A]'
                              : 'text-[#1D4E89]'
                          }`}
                        >
                          {group.completedCount}/{group.totalCount} objetivos
                        </span>
                        <span aria-hidden="true" className="text-[#8E96A3]">
                          ·
                        </span>
                        <span className="text-[#526071]">
                          {group.coreCompletedCount}/3 sellos clave
                        </span>
                      </div>
                      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[#DFDACF]">
                        <div
                          className={`h-full rounded-full transition-transform duration-300 origin-left ${
                            group.completedCount === group.totalCount
                              ? 'bg-[#2A6F4E]'
                              : 'bg-[#1D4E89]'
                          }`}
                          style={{ transform: `scaleX(${roomPct / 100})` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mission Rows */}
                  <ul className="space-y-2">
                    {group.visibleItems.map((item) => (
                      <li
                        key={item.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
                          item.completed
                            ? 'border-[#2A6F4E]/40 bg-[#E8F3EC]/75'
                            : 'border-[#232A34]/14 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                              item.completed
                                ? 'border-[#2A6F4E] bg-[#2A6F4E] text-white'
                                : item.isCoreSeal
                                ? 'border-[#C67D1E] bg-[#FAF4E8] text-[#8A5410]'
                                : 'border-[#232A34]/20 bg-[#F5F3EE] text-[#526071]'
                            }`}
                          >
                            {item.completed ? (
                              <CheckCircle2
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            ) : (
                              <Circle className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                          </span>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#526071]">
                              <span
                                className={`font-bold ${
                                  item.completed
                                    ? 'text-[#1D543A]'
                                    : 'text-[#8A5410]'
                                }`}
                              >
                                {item.completed ? 'Completado' : 'Pendiente'}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 font-semibold text-[#1D4E89]">
                                <TargetGlyph target={item.actionTarget} />
                                <span>{item.area}</span>
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-[#4A5564]">
                                {item.competencyCodes}
                              </span>
                              {item.isCoreSeal && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-semibold text-[#8A5410]">
                                    Sello clave
                                  </span>
                                </>
                              )}
                            </div>

                            <h4 className="mt-0.5 text-sm font-bold text-[#171B21] leading-snug">
                              {item.title}
                            </h4>
                            <p className="mt-0.5 text-xs leading-relaxed text-[#3D4754]">
                              {item.lomloeObjective}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end shrink-0 pl-10 sm:pl-0">
                          <button
                            type="button"
                            onClick={() =>
                              onNavigateToMission(
                                item.roomIndex,
                                item.actionTarget
                              )
                            }
                            className={`inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              item.completed
                                ? 'border border-[#2A6F4E]/40 bg-white text-[#1D543A] hover:bg-[#DDF0E4]'
                                : 'bg-[#1D4E89] text-white hover:bg-[#153A68]'
                            }`}
                          >
                            <span>
                              {item.completed ? 'Revisar' : 'Ir al reto'}
                            </span>
                            <ArrowUpRight
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Expandable LOMLOE Evaluation Criteria Drawer per Room */}
                  <div className="pt-0.5">
                    <button
                      type="button"
                      onClick={() => toggleCurriculum(group.roomId)}
                      aria-expanded={isExpanded}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D4E89] hover:underline cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {isExpanded
                          ? 'Ocultar criterios de evaluación LOMLOE'
                          : 'Ver criterios de evaluación y saberes LOMLOE de esta sala'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <ChevronDown
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 grid gap-3 rounded-xl border border-[#232A34]/12 bg-[#EFECE4] p-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#171B21]">
                              Criterios codificados ({cycle === 'ciclo2' ? '2.º Ciclo' : '3.º Ciclo'})
                            </span>
                            <span
                              className={`font-mono text-[11px] font-bold ${
                                allCoreDone
                                  ? 'text-[#1D543A]'
                                  : 'text-[#8A5410]'
                              }`}
                            >
                              {allCoreDone ? 'Alcanzados ✓' : 'En progreso'}
                            </span>
                          </div>
                          <ul className="space-y-1.5 text-xs leading-relaxed text-[#333D4B]">
                            {group.criteriosCodificados.map((criterion) => (
                              <li key={criterion.code} className="flex items-start gap-2">
                                <span className="mt-0.5 font-mono text-[10px] font-bold text-[#1D4E89] shrink-0">
                                  {criterion.code} ({criterion.ce})
                                </span>
                                <span>{criterion.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-xs font-bold text-[#171B21]">
                            Saberes Bloques A y C · EMOCREA
                          </div>
                          <ul className="space-y-1.5 text-xs leading-relaxed text-[#333D4B]">
                            {[
                              ...group.saberesBloqueA,
                              ...group.saberesConocimientoMedio,
                              ...group.saberesEmocreaValores,
                            ].map((saber, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span
                                  className="mt-0.5 text-[#2A6F4E] font-bold shrink-0"
                                  aria-hidden="true"
                                >
                                  ·
                                </span>
                                <span>{saber}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <span className="text-xs text-[#526071]">
            Pulsa «Ir al reto» en cualquier objetivo pendiente para abrirlo
            directamente en su sala.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#232A34] px-5 py-2 text-sm font-semibold text-[#F5F3EE] hover:bg-[#171B21] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Cerrar bitácora
          </button>
        </div>
      </div>
    </div>
  );
};
