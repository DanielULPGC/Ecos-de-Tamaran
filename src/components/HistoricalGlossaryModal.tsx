import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookA,
  BookOpen,
  Compass,
  Search,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { CycleId } from '../types/game';
import {
  HISTORICAL_GLOSSARY_ENTRIES,
  HistoricalGlossaryEntry,
  HistoricalGlossaryTheme,
} from '../data/historicalGlossaryData';
import { GLOSSARY_TERMS } from '../data/glossaryData';
import { VisualGlossaryView } from './VisualGlossaryView';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface HistoricalGlossaryModalProps {
  cycle: CycleId;
  muted: boolean;
  initialMode?: 'dictionary' | 'visual';
  onClose: () => void;
}

const THEMES: Array<'all' | HistoricalGlossaryTheme> = [
  'all',
  'Época Aborigen',
  'Conquista',
  'Piratería',
  'Siglo XX',
  'Conceptos clave',
];

export const HistoricalGlossaryModal: React.FC<HistoricalGlossaryModalProps> = ({
  cycle,
  muted,
  initialMode = 'dictionary',
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocusTrap(dialogRef, true);

  const [glossaryMode, setGlossaryMode] = useState<'dictionary' | 'visual'>(
    initialMode
  );
  const [query, setQuery] = useState('');
  const [themeFilter, setThemeFilter] = useState<
    'all' | HistoricalGlossaryTheme
  >('all');
  const [letterFilter, setLetterFilter] = useState<string>('ALL');
  const [readingCycle, setReadingCycle] = useState<CycleId>(cycle);
  const [selectedId, setSelectedId] = useState<string>(
    HISTORICAL_GLOSSARY_ENTRIES[0].id
  );

  const speechAvailable = isSpeechSupported();

  useEffect(() => {
    setReadingCycle(cycle);
  }, [cycle]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const availableLetters = useMemo(() => {
    const letters = Array.from(
      new Set(HISTORICAL_GLOSSARY_ENTRIES.map((e) => e.letter))
    ).sort();
    return letters;
  }, []);

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HISTORICAL_GLOSSARY_ENTRIES.filter((entry) => {
      if (themeFilter !== 'all' && entry.theme !== themeFilter) return false;
      if (letterFilter !== 'ALL' && entry.letter !== letterFilter) return false;
      if (!q) return true;
      return (
        entry.term.toLowerCase().includes(q) ||
        entry.definition[readingCycle].toLowerCase().includes(q) ||
        entry.inGranCanaria.toLowerCase().includes(q) ||
        entry.oneLineSummary.toLowerCase().includes(q)
      );
    });
  }, [query, themeFilter, letterFilter, readingCycle]);

  const activeEntry: HistoricalGlossaryEntry | undefined = useMemo(() => {
    const matchInFiltered = filteredEntries.find((e) => e.id === selectedId);
    if (matchInFiltered) return matchInFiltered;
    return filteredEntries[0];
  }, [filteredEntries, selectedId]);

  const relatedEntries = useMemo(() => {
    if (!activeEntry) return [];
    return activeEntry.relatedIds
      .map((id) => HISTORICAL_GLOSSARY_ENTRIES.find((e) => e.id === id))
      .filter((e): e is HistoricalGlossaryEntry => Boolean(e));
  }, [activeEntry]);

  const handleJumpToTerm = (id: string) => {
    soundEngine.playClick();
    stopSpeaking();
    setGlossaryMode('dictionary');
    setQuery('');
    setThemeFilter('all');
    setLetterFilter('ALL');
    setSelectedId(id);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="historical-glossary-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/86 p-3 sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-[#526071]">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#1D4E89]">
                <BookA className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Glosario Escolar Unificado de Gran Canaria</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {HISTORICAL_GLOSSARY_ENTRIES.length} términos A–Z ·{' '}
                {GLOSSARY_TERMS.length} fichas con pictogramas
              </span>
            </div>
            <h2
              id="historical-glossary-title"
              className="mt-0.5 font-display text-xl font-bold text-[#171B21] sm:text-2xl"
            >
              Glosario de Términos Históricos y Visuales
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              role="tablist"
              aria-label="Modo de consulta del glosario"
              className="inline-flex rounded-lg border border-[#232A34]/15 bg-[#DFDACF] p-0.5"
            >
              <button
                type="button"
                role="tab"
                aria-selected={glossaryMode === 'dictionary'}
                onClick={() => {
                  soundEngine.playClick();
                  stopSpeaking();
                  setGlossaryMode('dictionary');
                }}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  glossaryMode === 'dictionary'
                    ? 'bg-[#1D4E89] text-white'
                    : 'text-[#333D4B] hover:text-[#171B21]'
                }`}
              >
                <BookA className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Diccionario A–Z</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={glossaryMode === 'visual'}
                onClick={() => {
                  soundEngine.playClick();
                  stopSpeaking();
                  setGlossaryMode('visual');
                }}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  glossaryMode === 'visual'
                    ? 'bg-[#C67D1E] text-[#14181F]'
                    : 'text-[#333D4B] hover:text-[#171B21]'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Visual (Pictogramas)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              aria-label="Cerrar Glosario de Términos Históricos"
              className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] shrink-0 cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {glossaryMode === 'visual' ? (
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <VisualGlossaryView muted={muted} />
          </div>
        ) : (
          <>
            {/* Search + Theme + Alphabetical Filter Strip */}
            <div className="border-b border-[#232A34]/12 bg-[#EFECE4] px-5 py-3 sm:px-6 space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <label className="relative flex-1">
                  <span className="sr-only">Buscar un término histórico</span>
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#526071]"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar palabra (ej. aborigen, conquista, pirata, siglo…)"
                    className="w-full rounded-lg border border-[#232A34]/18 bg-white py-2 pl-9 pr-3 text-sm text-[#171B21] placeholder:text-[#6B7482] focus:border-[#1D4E89]"
                  />
                </label>

                {/* Quick Reading-Level Switch */}
                <div
                  role="group"
                  aria-label="Nivel de lectura de las definiciones"
                  className="flex items-center gap-1 rounded-lg border border-[#232A34]/15 bg-[#E4E0D6] p-0.5 shrink-0 self-start sm:self-auto"
                >
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setReadingCycle('ciclo2');
                    }}
                    className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      readingCycle === 'ciclo2'
                        ? 'bg-[#1D4E89] text-white'
                        : 'text-[#333D4B] hover:text-[#171B21]'
                    }`}
                  >
                    2.º Ciclo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setReadingCycle('ciclo3');
                    }}
                    className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      readingCycle === 'ciclo3'
                        ? 'bg-[#1D4E89] text-white'
                        : 'text-[#333D4B] hover:text-[#171B21]'
                    }`}
                  >
                    3.º Ciclo
                  </button>
                </div>
              </div>

              {/* Theme Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {THEMES.map((theme) => {
                  const active = themeFilter === theme;
                  return (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setThemeFilter(theme);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#232A34] text-[#F5F3EE]'
                          : 'border border-[#232A34]/15 bg-white text-[#3E4856] hover:border-[#232A34]'
                      }`}
                    >
                      {theme === 'all' ? 'Todos los temas' : theme}
                    </button>
                  );
                })}
              </div>

              {/* Alphabetical Quick Jump */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setLetterFilter('ALL');
                  }}
                  className={`rounded px-2 py-0.5 font-mono text-xs font-bold transition-colors cursor-pointer ${
                    letterFilter === 'ALL'
                      ? 'bg-[#1D4E89] text-white'
                      : 'text-[#4A5564] hover:bg-[#232A34]/10'
                  }`}
                >
                  A–Z
                </button>
                {availableLetters.map((letter) => {
                  const active = letterFilter === letter;
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setLetterFilter(letter);
                      }}
                      className={`h-6 w-6 rounded font-mono text-xs font-bold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#C67D1E] text-[#14181F]'
                          : 'text-[#333D4B] hover:bg-[#232A34]/10'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Two-Column Editorial Dictionary Workspace */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              {filteredEntries.length === 0 ? (
                <div className="rounded-xl border border-[#232A34]/15 bg-white p-8 text-center space-y-2">
                  <p className="font-display text-lg font-bold text-[#171B21]">
                    No se encontraron términos con ese filtro
                  </p>
                  <p className="text-xs text-[#526071]">
                    Prueba con otra palabra o limpia los filtros para ver los{' '}
                    {HISTORICAL_GLOSSARY_ENTRIES.length} conceptos históricos.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setThemeFilter('all');
                      setLetterFilter('ALL');
                    }}
                    className="mt-2 rounded-lg bg-[#1D4E89] px-4 py-2 text-xs font-bold text-white hover:bg-[#153A68] cursor-pointer"
                  >
                    Ver todos los términos
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-12 items-start">
                  {/* Left Index List */}
                  <div className="lg:col-span-5 space-y-1.5 max-h-[52vh] lg:max-h-[56vh] overflow-y-auto pr-1">
                    {filteredEntries.map((entry) => {
                      const selected = activeEntry?.id === entry.id;
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            stopSpeaking();
                            setSelectedId(entry.id);
                          }}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                            selected
                              ? 'border-[#1D4E89] bg-[#E8F0FA]'
                              : 'border-[#232A34]/12 bg-white hover:border-[#1D4E89]/60'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#C67D1E]">
                                {entry.letter}
                              </span>
                              <span className="text-sm font-bold text-[#171B21] truncate">
                                {entry.term}
                              </span>
                            </div>
                            <div className="mt-0.5 text-[11px] text-[#526071] truncate">
                              {entry.theme} · {entry.oneLineSummary}
                            </div>
                          </div>
                          <ArrowRight
                            className={`h-4 w-4 shrink-0 ${
                              selected ? 'text-[#1D4E89]' : 'text-[#9AA3B0]'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Featured Definition Card */}
                  {activeEntry && (
                    <article className="lg:col-span-7 rounded-2xl border border-[#232A34]/15 bg-white p-5 sm:p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-[#232A34]/10 pb-3.5">
                        <div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-[#526071]">
                            <span className="font-mono font-bold text-[#8A5410]">
                              Letra {activeEntry.letter}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#1D4E89] font-bold">
                              {activeEntry.theme}
                            </span>
                          </div>
                          <h3 className="mt-1 font-display text-2xl font-bold text-[#171B21] sm:text-3xl">
                            {activeEntry.term}
                          </h3>
                        </div>

                        {speechAvailable && (
                          <button
                            type="button"
                            onClick={() =>
                              speakText(
                                `${activeEntry.term}. ${activeEntry.definition[readingCycle]} En Gran Canaria: ${activeEntry.inGranCanaria}`,
                                muted
                              )
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1D4E89]/35 bg-[#E8F0FA] px-3 py-2 text-xs font-bold text-[#1D4E89] hover:bg-[#DAE7F7] whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <Volume2 className="h-4 w-4" aria-hidden="true" />
                            <span>Escuchar</span>
                          </button>
                        )}
                      </div>

                      {/* Main School Definition */}
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-[#526071]">
                          ¿Qué significa? (
                          {readingCycle === 'ciclo2'
                            ? 'Explicación sencilla · 2.º Ciclo'
                            : 'Definición escolar · 3.º Ciclo'}
                          )
                        </div>
                        <p className="text-base leading-relaxed text-[#171B21]">
                          {activeEntry.definition[readingCycle]}
                        </p>
                      </div>

                      {/* Quick 1-line memory cue */}
                      <div className="rounded-xl border border-[#C67D1E]/35 bg-[#FAF4E8] px-4 py-3 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#8A5410]">
                          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Para recordarlo en una frase</span>
                        </div>
                        <p className="text-sm font-medium text-[#232A34]">
                          {activeEntry.oneLineSummary}
                        </p>
                      </div>

                      {/* Concrete Gran Canaria connection */}
                      <div className="rounded-xl border border-[#2A6F4E]/35 bg-[#E8F3EC] px-4 py-3 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D543A]">
                          <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>En la historia de Gran Canaria</span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#232A34]">
                          {activeEntry.inGranCanaria}
                        </p>
                      </div>

                      {/* Related Terms Cross-links */}
                      {relatedEntries.length > 0 && (
                        <div className="border-t border-[#232A34]/10 pt-3 space-y-2">
                          <div className="text-xs font-bold text-[#526071]">
                            Conceptos relacionados
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {relatedEntries.map((rel) => (
                              <button
                                key={rel.id}
                                type="button"
                                onClick={() => handleJumpToTerm(rel.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#232A34]/18 bg-[#F5F3EE] px-3 py-1.5 text-xs font-bold text-[#1D4E89] transition-colors hover:border-[#1D4E89] hover:bg-[#E8F0FA] whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                <span>{rel.term}</span>
                                <ArrowRight
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#232A34]/12 bg-[#EFECE4] px-5 py-3 sm:px-6">
          <span className="text-xs text-[#526071]">
            Alterna arriba entre el <strong>Diccionario A–Z</strong> adaptado por ciclo y el{' '}
            <strong>Glosario Visual</strong> con pictogramas por sala.
          </span>
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="rounded-lg bg-[#232A34] px-5 py-2 text-sm font-semibold text-[#F5F3EE] hover:bg-[#171B21] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Cerrar glosario
          </button>
        </div>
      </div>
    </div>
  );
};
