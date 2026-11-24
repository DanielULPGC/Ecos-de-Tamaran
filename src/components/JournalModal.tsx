import React, { useEffect, useRef, useState } from 'react';
import {
  BookA,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  FileDown,
  Globe2,
  Headphones,
  Heart,
  HeartHandshake,
  Plus,
  StickyNote as StickyNoteIcon,
  X,
} from 'lucide-react';
import { CycleId, ExpeditionState, RoomId, StickyNote } from '../types/game';
import { ROOMS_DATA } from '../data/roomsData';
import { getMoodById, TRANSVERSAL_MISSIONS } from '../data/enrichmentData';
import { GLOSSARY_TERMS } from '../data/glossaryData';
import { StickyNoteCard, StickyNoteEditor } from './StickyNoteWidget';
import { VisualGlossaryView } from './VisualGlossaryView';
import { HistoricalTimelineView } from './HistoricalTimelineView';
import { soundEngine } from '../utils/audio';
import { stopSpeaking } from '../utils/speech';
import { exportJournalToPdf } from '../utils/exportJournalPdf';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface JournalModalProps {
  state: ExpeditionState;
  cycle: CycleId;
  onUpdateStickyNote: (roomId: RoomId, note: StickyNote | undefined) => void;
  onOpenAudiobook: () => void;
  onOpenHistoricalGlossary: () => void;
  onClose: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  state,
  cycle,
  onUpdateStickyNote,
  onOpenAudiobook,
  onOpenHistoricalGlossary,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocusTrap(dialogRef, true);

  const [activeTab, setActiveTab] = useState<'diario' | 'timeline' | 'glosario'>(
    'diario'
  );
  const [editingRoomId, setEditingRoomId] = useState<RoomId | null>(null);
  const [highlightedRoomId, setHighlightedRoomId] = useState<RoomId | null>(null);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);
  const roomRefs = useRef<Partial<Record<RoomId, HTMLElement | null>>>({});

  useEffect(() => {
    if (!pdfExported) return;
    const t = window.setTimeout(() => setPdfExported(false), 2400);
    return () => window.clearTimeout(t);
  }, [pdfExported]);

  const handleExportPdf = async () => {
    if (pdfExporting) return;
    setPdfExporting(true);
    try {
      soundEngine.playDiscover();
      await exportJournalToPdf(state, cycle);
      setPdfExported(true);
    } finally {
      setPdfExporting(false);
    }
  };

  useEffect(() => {
    if (!highlightedRoomId || activeTab !== 'diario') return;
    const raf = window.requestAnimationFrame(() => {
      roomRefs.current[highlightedRoomId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
    const timer = window.setTimeout(() => {
      setHighlightedRoomId(null);
    }, 2000);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [highlightedRoomId, activeTab]);

  const handleJumpToReflection = (roomId: RoomId) => {
    stopSpeaking();
    setActiveTab('diario');
    setHighlightedRoomId(roomId);
  };

  const completedCount = ROOMS_DATA.filter((r) => {
    const p = state.progress[r.id];
    return p.puzzle1Solved && p.puzzle2Solved && p.empathySolved;
  }).length;

  const pinnedNotes = ROOMS_DATA.map((room) => ({
    room,
    note: state.journal[room.id]?.stickyNote,
  })).filter(
    (item): item is { room: (typeof ROOMS_DATA)[number]; note: StickyNote } =>
      Boolean(item.note)
  );

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/82 p-3 sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#526071]">
              <BookMarked className="h-4 w-4 text-[#1D4E89]" aria-hidden="true" />
              <span>
                {state.explorerName.trim() || 'Equipo Explorador de Tamarán'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{cycle === 'ciclo2' ? '2.º Ciclo' : '3.º Ciclo'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {completedCount}/4 salas · {pinnedNotes.length} pega-notas
              </span>
            </div>
            <h2
              id="journal-modal-title"
              className="mt-1 font-display text-xl font-bold text-[#171B21] sm:text-2xl"
            >
              Cuaderno de Exploración y Reflexión
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onOpenHistoricalGlossary();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#232A34]/25 bg-white px-3 py-2 text-xs font-bold text-[#171B21] transition-colors hover:border-[#1D4E89] hover:bg-[#E8F0FA] hover:text-[#1D4E89] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BookA className="h-4 w-4 text-[#1D4E89]" aria-hidden="true" />
              <span>Glosario Unificado</span>
            </button>
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onOpenAudiobook();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1D4E89]/35 bg-white px-3 py-2 text-xs font-bold text-[#1D4E89] transition-colors hover:bg-[#E8F0FA] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Headphones className="h-4 w-4" aria-hidden="true" />
              <span>Audiolibro</span>
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={pdfExporting}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-65 ${
                pdfExported
                  ? 'bg-[#2A6F4E] text-white'
                  : 'bg-[#1D4E89] text-white hover:bg-[#153A68]'
              }`}
            >
              {pdfExported ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>¡PDF descargado!</span>
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" aria-hidden="true" />
                  <span>{pdfExporting ? 'Generando PDF…' : 'Exportar PDF'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              aria-label="Cerrar cuaderno"
              className="rounded-lg p-2 text-[#526071] transition-colors hover:bg-[#232A34]/10 hover:text-[#171B21] cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Crisp Segmented Tab Bar: Diario vs Línea de Tiempo vs Glosario Visual */}
        <div
          role="tablist"
          aria-label="Secciones del cuaderno"
          className="flex flex-wrap items-center gap-2 border-b border-[#232A34]/12 bg-[#EFECE4] px-6 py-2.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'diario'}
            onClick={() => {
              soundEngine.playClick();
              stopSpeaking();
              setActiveTab('diario');
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'diario'
                ? 'bg-[#1D4E89] text-white'
                : 'border border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#1D4E89]'
            }`}
          >
            <BookMarked className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Diario y Pega-notas</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'timeline'}
            onClick={() => {
              soundEngine.playClick();
              stopSpeaking();
              setActiveTab('timeline');
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-[#2A6F4E] text-white'
                : 'border border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#2A6F4E]'
            }`}
          >
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Línea de Tiempo</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'glosario'}
            onClick={() => {
              soundEngine.playClick();
              stopSpeaking();
              setActiveTab('glosario');
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'glosario'
                ? 'bg-[#C67D1E] text-[#14181F]'
                : 'border border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#C67D1E]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Glosario Visual ({GLOSSARY_TERMS.length})</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {activeTab === 'glosario' ? (
            <VisualGlossaryView muted={state.muted} />
          ) : activeTab === 'timeline' ? (
            <HistoricalTimelineView
              state={state}
              cycle={cycle}
              onJumpToReflection={handleJumpToReflection}
            />
          ) : (
            <>
          {/* Muro de Pega-notas (summary strip) */}
          <section className="rounded-xl border border-[#232A34]/12 bg-[#EFECE4] p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171B21]">
                <StickyNoteIcon
                  className="h-4 w-4 text-[#C67D1E]"
                  aria-hidden="true"
                />
                <span>Muro de Pega-notas emocionales (resumen en 1 palabra)</span>
              </div>
              <span className="font-mono text-xs text-[#526071] tabular-nums">
                {pinnedNotes.length}/4
              </span>
            </div>

            {pinnedNotes.length === 0 ? (
              <p className="text-xs text-[#526071]">
                Aún no has pegado ninguna nota. Completa el dilema de una sala y añade una pega-nota con 1 palabra y el emoji de la emoción que sentiste.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {pinnedNotes.map(({ room, note }) => (
                  <StickyNoteCard
                    key={room.id}
                    note={note}
                    compact
                    roomLabel={`Sala ${room.number}`}
                    onEdit={() => {
                      soundEngine.playClick();
                      setEditingRoomId(room.id);
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Per-room Journal Entries */}
          {ROOMS_DATA.map((room) => {
            const p = state.progress[room.id];
            const entry = state.journal[room.id];
            const isEditing = editingRoomId === room.id;
            const seals =
              Number(p.puzzle1Solved) +
              Number(p.puzzle2Solved) +
              Number(p.empathySolved);

            return (
              <section
                key={room.id}
                ref={(el) => {
                  roomRefs.current[room.id] = el;
                }}
                className={`rounded-xl border bg-white p-5 space-y-3 transition-shadow duration-300 ${
                  highlightedRoomId === room.id
                    ? 'border-[#C67D1E] ring-2 ring-[#C67D1E]/60 shadow-md'
                    : 'border-[#232A34]/12'
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="font-mono text-xs text-[#526071] tabular-nums">
                      Sala {room.number} · {room.epoch} ({room.years})
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#171B21]">
                      {room.title}
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#1D4E89] tabular-nums">
                    Sellos: {seals}/3
                  </span>
                </div>

                {/* Seals row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-[#3E4856]">
                  <span className="inline-flex items-center gap-1.5">
                    {p.puzzle1Solved ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#2A6F4E]" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-[#9AA3B0]" />
                    )}
                    {room.puzzle1.sealTitle}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    {p.puzzle2Solved ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#2A6F4E]" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-[#9AA3B0]" />
                    )}
                    {room.puzzle2.sealTitle}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    {p.empathySolved ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#2A6F4E]" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-[#C67D1E]" />
                    )}
                    {room.empathy.sealTitle}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Globe2
                      className={`h-3.5 w-3.5 ${
                        p.transversalSolved ? 'text-[#2A6F4E]' : 'text-[#9AA3B0]'
                      }`}
                    />
                    <span>
                      {TRANSVERSAL_MISSIONS[room.id].axis}
                      {p.transversalSolved ? ' ✓' : ''}
                    </span>
                  </span>
                </div>

                {/* Emotional Thermometer Evolution (Antes -> Después) */}
                {(() => {
                  const emo = state.emotions[room.id];
                  const beforeMood = getMoodById(emo?.before);
                  const afterMood = getMoodById(emo?.after);
                  if (!beforeMood && !afterMood) return null;
                  return (
                    <div className="flex flex-wrap items-center gap-2 border-t border-[#232A34]/10 pt-2.5 text-xs text-[#3E4856]">
                      <Heart
                        className="h-3.5 w-3.5 text-[#C67D1E]"
                        aria-hidden="true"
                      />
                      <strong className="text-[#171B21]">
                        Termómetro EMOCREA:
                      </strong>
                      <span>
                        Antes:{' '}
                        {beforeMood
                          ? `${beforeMood.emoji} ${beforeMood.label}`
                          : '—'}
                      </span>
                      <span aria-hidden="true">→</span>
                      <span>
                        Después:{' '}
                        {afterMood
                          ? `${afterMood.emoji} ${afterMood.label}`
                          : '—'}
                      </span>
                    </div>
                  );
                })()}

                {p.clueFound && (
                  <p className="text-xs text-[#4A5564] border-t border-[#232A34]/10 pt-2.5">
                    <strong className="text-[#171B21]">Hallazgo recogido:</strong>{' '}
                    {room.clue.title} — {room.clue.historicalNote}
                  </p>
                )}

                {entry ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-[#2A6F4E]/25 bg-[#F4F8F6] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 text-sm flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2A6F4E]">
                          <HeartHandshake
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          <span>Entrada del Diario de Reflexión</span>
                        </div>
                        <p className="text-xs text-[#333D4B]">
                          <strong>Emoción identificada:</strong>{' '}
                          {entry.emotionSelected}
                        </p>
                        <p className="text-xs text-[#333D4B]">
                          <strong>Decisión empática:</strong>{' '}
                          {entry.decisionLabel}
                        </p>
                        <p className="pt-1 text-sm leading-relaxed text-[#171B21]">
                          «{entry.reflectionText}»
                        </p>
                      </div>

                      {/* Pinned Digital Post-it or Add button */}
                      <div className="flex flex-col items-start sm:items-center justify-center shrink-0 pt-1">
                        {entry.stickyNote && !isEditing ? (
                          <StickyNoteCard
                            note={entry.stickyNote}
                            onEdit={() => {
                              soundEngine.playClick();
                              setEditingRoomId(room.id);
                            }}
                          />
                        ) : !isEditing ? (
                          <button
                            type="button"
                            onClick={() => {
                              soundEngine.playClick();
                              setEditingRoomId(room.id);
                            }}
                            className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#C67D1E]/60 bg-[#FFF8E1] px-4 py-3 text-center text-xs font-bold text-[#6E420B] transition-colors hover:border-[#C67D1E] hover:bg-[#FFF0C2] cursor-pointer"
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            <span>Añadir pega-nota</span>
                            <span className="text-[11px] font-normal text-[#8A5410]">
                              1 palabra + emoji
                            </span>
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {isEditing && (
                      <StickyNoteEditor
                        roomId={room.id}
                        initialNote={entry.stickyNote}
                        onSave={(note) => {
                          onUpdateStickyNote(room.id, note);
                          setEditingRoomId(null);
                        }}
                        onRemove={
                          entry.stickyNote
                            ? () => {
                                onUpdateStickyNote(room.id, undefined);
                                setEditingRoomId(null);
                              }
                            : undefined
                        }
                        onCancel={() => setEditingRoomId(null)}
                      />
                    )}
                  </div>
                ) : (
                  <p className="text-xs italic text-[#6B7482]">
                    Completa el dilema empático de esta sala para escribir tu reflexión y pegar tu nota emocional.
                  </p>
                )}
              </section>
            );
          })}
            </>
          )}
        </div>

        <div className="flex justify-end border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="rounded-lg bg-[#232A34] px-5 py-2 text-sm font-semibold text-[#F5F3EE] hover:bg-[#171B21] cursor-pointer"
          >
            Cerrar cuaderno
          </button>
        </div>
      </div>
    </div>
  );
};
