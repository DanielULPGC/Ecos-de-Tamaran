import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Headphones,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { CycleId, ExpeditionState } from '../types/game';
import { ROOMS_DATA, TITLE_ART_PATH } from '../data/roomsData';
import { getExplorerById } from '../data/charactersAndBadges';
import { TRANSVERSAL_MISSIONS } from '../data/enrichmentData';
import {
  isSpeechSupported,
  speakSequenceItem,
  stopSpeaking,
} from '../utils/speech';
import { soundEngine } from '../utils/audio';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface AudiobookChapter {
  id: string;
  badgeLabel: string;
  epochLabel: string;
  title: string;
  narration: string;
  imagePath: string;
  accentNote?: string;
}

interface AudiobookModalProps {
  state: ExpeditionState;
  cycle: CycleId;
  onChangeVoiceRate: (rate: 0.8 | 1.0 | 1.15) => void;
  onUnmute: () => void;
  onClose: () => void;
}

export const AudiobookModal: React.FC<AudiobookModalProps> = ({
  state,
  cycle,
  onChangeVoiceRate,
  onUnmute,
  onClose,
}) => {
  const speechAvailable = isSpeechSupported();
  const explorer = getExplorerById(state.explorerId);

  // Assemble chronological audio chapters from all visited rooms
  const chapters = useMemo<AudiobookChapter[]>(() => {
    const visitedRooms = ROOMS_DATA.filter((room, idx) => {
      const p = state.progress[room.id];
      const hasActivity =
        p.clueFound ||
        p.puzzle1Solved ||
        p.puzzle2Solved ||
        p.empathySolved ||
        p.transversalSolved ||
        p.collectibleFound ||
        Boolean(state.journal[room.id]) ||
        Boolean(state.emotions[room.id]?.before) ||
        Boolean(state.emotions[room.id]?.after);
      return idx <= state.currentRoomIndex || hasActivity;
    });

    const totalSeals = visitedRooms.reduce((sum, r) => {
      const p = state.progress[r.id];
      return (
        sum +
        Number(p.puzzle1Solved) +
        Number(p.puzzle2Solved) +
        Number(p.empathySolved)
      );
    }, 0);

    const teamName = state.explorerName.trim();
    const introWho = teamName
      ? `Hola, ${teamName}. Soy ${explorer.name}`
      : `Hola, equipo explorador. Soy ${explorer.name}`;

    const list: AudiobookChapter[] = [
      {
        id: 'prologo',
        badgeLabel: 'Prólogo',
        epochLabel: 'Ecos de Tamarán · Gran Canaria',
        title: `Crónica de viaje con ${explorer.name}`,
        narration: `${introWho}, tu guía en Ecos de Tamarán. Hasta ahora hemos recorrido ${
          visitedRooms.length
        } ${
          visitedRooms.length === 1 ? 'época' : 'épocas'
        } de la historia de Gran Canaria y hemos reunido ${totalSeals} ${
          totalSeals === 1 ? 'sello histórico' : 'sellos históricos'
        }. Ponte cómodo y escucha todo lo que hemos descubierto juntos.`,
        imagePath: TITLE_ART_PATH,
        accentNote: `${visitedRooms.length}/4 salas visitadas · ${totalSeals}/12 sellos`,
      },
    ];

    visitedRooms.forEach((room) => {
      const p = state.progress[room.id];
      const entry = state.journal[room.id];
      const mission = TRANSVERSAL_MISSIONS[room.id];
      const seals =
        Number(p.puzzle1Solved) +
        Number(p.puzzle2Solved) +
        Number(p.empathySolved);

      // 1. Arrival narrative of the visited room
      list.push({
        id: `${room.id}-llegada`,
        badgeLabel: `Sala ${room.number}`,
        epochLabel: `${room.epoch} · ${room.years}`,
        title: room.title,
        narration: `Sala ${room.number}: ${room.title}, en ${room.location}. ${room.arrivalNarrative[cycle]}`,
        imagePath: room.imagePath,
        accentNote: room.location,
      });

      // 2. Collected historical clue (if discovered)
      if (p.clueFound) {
        list.push({
          id: `${room.id}-hallazgo`,
          badgeLabel: `Sala ${room.number} · Hallazgo`,
          epochLabel: `${room.epoch} · ${room.years}`,
          title: room.clue.title,
          narration: `Hallazgo descubierto: ${room.clue.title}. ${room.clue.text[cycle]} Dato curioso: ${room.clue.historicalNote}`,
          imagePath: room.imagePath,
          accentNote: room.clue.itemLabel,
        });
      }

      // 3. Empathy voices & student's own journal reflection (if completed)
      if (entry) {
        const [v1, v2] = room.empathy.voices;
        const stickyClause = entry.stickyNote
          ? ` Resumiste esta experiencia en tu pega-nota con la palabra ${entry.stickyNote.word}.`
          : '';
        list.push({
          id: `${room.id}-reflexion`,
          badgeLabel: `Sala ${room.number} · Reflexión`,
          epochLabel: `${room.epoch} · Dilema empático`,
          title: room.empathy.title,
          narration: `En ${room.empathy.title}, escuchaste a ${v1.name} y a ${v2.name}. Reconociste la emoción de ${entry.emotionSelected} y elegiste este acuerdo: ${entry.decisionLabel}. En tu diario escribiste: ${entry.reflectionText}.${stickyClause}`,
          imagePath: room.imagePath,
          accentNote: entry.stickyNote
            ? `Pega-nota: ${entry.stickyNote.emoji} ${entry.stickyNote.word}`
            : `Emoción: ${entry.emotionSelected}`,
        });
      }

      // 4. Transversal Mission Agenda 2030 (if completed)
      if (p.transversalSolved) {
        list.push({
          id: `${room.id}-transversal`,
          badgeLabel: `Sala ${room.number} · Misión 2030`,
          epochLabel: `${mission.axis} · ${mission.odsTag}`,
          title: mission.title,
          narration: `Misión transversal sobre ${mission.axis}: ${mission.title}. ${mission.story[cycle]} ${mission.actionTip}`,
          imagePath: room.imagePath,
          accentNote: mission.odsTag,
        });
      }

      // 5. Room completion epilogue (if all 3 seals unlocked)
      if (seals === 3) {
        list.push({
          id: `${room.id}-cierre`,
          badgeLabel: `Sala ${room.number} · Completada`,
          epochLabel: `${room.mapZoneLabel} iluminada`,
          title: `Logro de ${room.mapZoneLabel}`,
          narration: room.transitionSummary,
          imagePath: room.imagePath,
          accentNote: '3/3 sellos conseguidos ✓',
        });
      }
    });

    return list;
  }, [state, cycle, explorer]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [finishedAll, setFinishedAll] = useState(false);
  const [listenedIds, setListenedIds] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocusTrap(dialogRef, true);
  const pauseTimerRef = useRef<number | null>(null);

  const safeIndex = Math.min(currentIndex, Math.max(0, chapters.length - 1));
  const activeChapter = chapters[safeIndex];

  const clearPendingPause = useCallback(() => {
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
  }, []);

  const stopPlayback = useCallback(() => {
    clearPendingPause();
    stopSpeaking();
    setIsPlaying(false);
  }, [clearPendingPause]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      clearPendingPause();
      stopSpeaking();
    };
  }, [clearPendingPause]);

  // Sequential playback effect
  useEffect(() => {
    if (!isPlaying || !activeChapter) return;
    if (state.muted || !speechAvailable) {
      setIsPlaying(false);
      return;
    }

    clearPendingPause();

    speakSequenceItem(activeChapter.narration, {
      muted: state.muted,
      rateOverride: state.dua.voiceRate,
      onEnd: () => {
        setListenedIds((prev) =>
          prev.includes(activeChapter.id) ? prev : [...prev, activeChapter.id]
        );
        if (safeIndex < chapters.length - 1) {
          // Gentle 650ms breath between narrative chapters
          pauseTimerRef.current = window.setTimeout(() => {
            setCurrentIndex((prev) => Math.min(prev + 1, chapters.length - 1));
          }, 650);
        } else {
          setIsPlaying(false);
          setFinishedAll(true);
          soundEngine.playSuccess();
        }
      },
      onError: () => {
        setIsPlaying(false);
      },
    });
  }, [
    isPlaying,
    safeIndex,
    activeChapter,
    chapters.length,
    state.muted,
    state.dua.voiceRate,
    speechAvailable,
    clearPendingPause,
  ]);

  const handleTogglePlay = () => {
    if (!speechAvailable) return;
    if (state.muted) {
      onUnmute();
    }
    if (isPlaying) {
      soundEngine.playClick();
      stopPlayback();
    } else {
      soundEngine.playDiscover();
      if (finishedAll && safeIndex === chapters.length - 1) {
        setCurrentIndex(0);
      }
      setFinishedAll(false);
      setIsPlaying(true);
    }
  };

  const handleSelectChapter = (idx: number) => {
    clearPendingPause();
    stopSpeaking();
    soundEngine.playStep();
    setFinishedAll(false);
    setCurrentIndex(idx);
    if (speechAvailable && !state.muted) {
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (safeIndex <= 0) return;
    handleSelectChapter(safeIndex - 1);
  };

  const handleNext = () => {
    if (safeIndex >= chapters.length - 1) return;
    handleSelectChapter(safeIndex + 1);
  };

  const handleRestartAll = () => {
    if (state.muted) onUnmute();
    clearPendingPause();
    stopSpeaking();
    soundEngine.playDiscover();
    setFinishedAll(false);
    setCurrentIndex(0);
    if (speechAvailable) {
      setIsPlaying(true);
    }
  };

  const progressPct = Math.round(((safeIndex + 1) / chapters.length) * 100);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="audiobook-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/86 p-3 sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={explorer.portraitPath}
              alt={explorer.name}
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-xl border-2 border-[#1D4E89] object-cover shrink-0"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#1D4E89]">
                <Headphones className="h-4 w-4" aria-hidden="true" />
                <span>Audiolibro de la Aventura · Reproducción secuencial</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {chapters.length} fragmentos
                </span>
              </div>
              <h2
                id="audiobook-modal-title"
                className="mt-0.5 font-display text-xl font-bold text-[#171B21] sm:text-2xl truncate"
              >
                Escucha tu viaje por Gran Canaria
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopPlayback();
              onClose();
            }}
            aria-label="Cerrar audiolibro"
            className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] shrink-0 cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Unmute / Browser support guard */}
        {!speechAvailable && (
          <div className="border-b border-[#A43D2F]/25 bg-[#F8E5E2] px-6 py-3 text-xs font-semibold text-[#7D2B20]">
            Este navegador no dispone de síntesis de voz en español, pero puedes leer toda la crónica secuencial capítulo a capítulo.
          </div>
        )}

        {speechAvailable && state.muted && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C67D1E]/35 bg-[#FAF4E8] px-6 py-3 text-xs">
            <span className="inline-flex items-center gap-2 font-semibold text-[#6E420B]">
              <VolumeX className="h-4 w-4" aria-hidden="true" />
              <span>El sonido está silenciado. Actívalo para escuchar el audiolibro.</span>
            </span>
            <button
              type="button"
              onClick={() => {
                onUnmute();
                setFinishedAll(false);
                setIsPlaying(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C67D1E] px-3 py-1.5 text-xs font-bold text-[#14181F] hover:bg-[#D98E2B] cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Activar voz y reproducir</span>
            </button>
          </div>
        )}

        {/* Body: Left Now-Playing Stage + Right Sequential Tracklist */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] items-start">
            {/* NOW PLAYING STAGE */}
            <section className="rounded-2xl border border-[#232A34]/15 bg-white overflow-hidden shadow-sm">
              {/* Chapter Illustrated Cover */}
              <div className="relative h-44 sm:h-48 w-full bg-[#171B21] overflow-hidden">
                <img
                  src={activeChapter.imagePath}
                  alt={activeChapter.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#12161C]/92 via-[#12161C]/35 to-transparent"
                />
                <div className="absolute inset-x-4 bottom-3.5 flex items-end justify-between gap-2 text-[#F5F3EE]">
                  <div>
                    <div className="font-mono text-[11px] font-bold text-[#E6A94F]">
                      {activeChapter.badgeLabel} · {activeChapter.epochLabel}
                    </div>
                    <h3 className="mt-0.5 font-display text-lg font-bold leading-snug sm:text-xl">
                      {activeChapter.title}
                    </h3>
                  </div>
                  <span className="rounded-md border border-[#F5F3EE]/25 bg-[#171B21]/85 px-2.5 py-1 font-mono text-[11px] font-bold tabular-nums shrink-0">
                    {safeIndex + 1}/{chapters.length}
                  </span>
                </div>
              </div>

              {/* Chapter Progress Bar */}
              <div className="h-1.5 w-full bg-[#E3DED3]">
                <div
                  className="h-full bg-[#1D4E89] transition-transform duration-300 origin-left"
                  style={{ transform: `scaleX(${progressPct / 100})` }}
                />
              </div>

              {/* Live Transcript & Transport Controls */}
              <div className="p-5 space-y-4">
                {activeChapter.accentNote && (
                  <div className="text-xs font-bold text-[#2A6F4E]">
                    {activeChapter.accentNote}
                  </div>
                )}

                <p className="rounded-xl border border-[#232A34]/10 bg-[#FAF8F4] p-4 text-[15px] leading-relaxed text-[#171B21]">
                  {activeChapter.narration}
                </p>

                {finishedAll && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#2A6F4E]/35 bg-[#E1EFE8] px-4 py-2.5 text-xs font-bold text-[#1D543A]">
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      ¡Has escuchado toda tu aventura hasta ahora! Sigue explorando para añadir nuevos capítulos.
                    </span>
                  </div>
                )}

                {/* Transport Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safeIndex === 0}
                      onClick={handlePrev}
                      aria-label="Capítulo anterior"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#232A34]/18 bg-[#F5F3EE] text-[#232A34] hover:bg-[#EAE6DC] disabled:opacity-40 cursor-pointer"
                    >
                      <SkipBack className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      disabled={!speechAvailable}
                      onClick={handleTogglePlay}
                      className={`inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 ${
                        isPlaying
                          ? 'bg-[#A43D2F] text-white hover:bg-[#8B3226]'
                          : 'bg-[#1D4E89] text-white hover:bg-[#153A68]'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="h-4 w-4 fill-current" aria-hidden="true" />
                          <span>Detener</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                          <span>
                            {finishedAll
                              ? 'Escuchar otra vez'
                              : safeIndex === 0
                              ? 'Escuchar aventura'
                              : 'Seguir escuchando'}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={safeIndex >= chapters.length - 1}
                      onClick={handleNext}
                      aria-label="Capítulo siguiente"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#232A34]/18 bg-[#F5F3EE] text-[#232A34] hover:bg-[#EAE6DC] disabled:opacity-40 cursor-pointer"
                    >
                      <SkipForward className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Speed selector */}
                  <div className="flex items-center gap-1 rounded-lg border border-[#232A34]/15 bg-[#EFECE4] p-1">
                    {([0.8, 1.0, 1.15] as const).map((rate) => {
                      const active = state.dua.voiceRate === rate;
                      return (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            onChangeVoiceRate(rate);
                          }}
                          className={`rounded-md px-2.5 py-1 font-mono text-xs font-bold transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#1D4E89] text-white'
                              : 'text-[#333D4B] hover:text-[#171B21]'
                          }`}
                        >
                          {rate}×
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* SEQUENTIAL CHAPTER TRACKLIST */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-[#526071]">
                  Capítulos desbloqueados en orden ({chapters.length})
                </h3>
                <button
                  type="button"
                  onClick={handleRestartAll}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1D4E89] hover:underline cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Desde el inicio</span>
                </button>
              </div>

              <ol className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {chapters.map((chap, idx) => {
                  const isActive = idx === safeIndex;
                  const isListened = listenedIds.includes(chap.id);
                  return (
                    <li key={chap.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectChapter(idx)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                          isActive
                            ? 'border-[#1D4E89] bg-[#E8F0FA]'
                            : isListened
                            ? 'border-[#2A6F4E]/35 bg-[#E8F3EC]/75 hover:border-[#1D4E89]'
                            : 'border-[#232A34]/12 bg-white hover:border-[#1D4E89]'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                            isActive
                              ? 'bg-[#1D4E89] text-white'
                              : isListened
                              ? 'bg-[#2A6F4E] text-white'
                              : 'bg-[#EAE6DC] text-[#333D4B]'
                          }`}
                        >
                          {isActive && isPlaying ? (
                            <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : isListened ? (
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            idx + 1
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 text-[11px] font-mono font-semibold text-[#526071]">
                            <span className="truncate">{chap.badgeLabel}</span>
                            {isActive && isPlaying && (
                              <span className="text-[#1D4E89] font-bold shrink-0">
                                Sonando
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 truncate text-xs font-bold text-[#171B21]">
                            {chap.title}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <span className="text-xs text-[#526071]">
            El audiolibro avanza automáticamente de un fragmento al siguiente para que escuches sin tocar nada.
          </span>
          <button
            type="button"
            onClick={() => {
              stopPlayback();
              onClose();
            }}
            className="rounded-lg bg-[#232A34] px-5 py-2 text-sm font-semibold text-[#F5F3EE] hover:bg-[#171B21] cursor-pointer"
          >
            Cerrar audiolibro
          </button>
        </div>
      </div>
    </div>
  );
};
