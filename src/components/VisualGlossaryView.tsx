import React, { useMemo, useState } from 'react';
import { BookOpen, Search, Volume2 } from 'lucide-react';
import { GlossaryIconKey, GLOSSARY_TERMS } from '../data/glossaryData';
import { isSpeechSupported, speakText } from '../utils/speech';
import { soundEngine } from '../utils/audio';

const GlossaryPictogramSvg: React.FC<{ iconKey: GlossaryIconKey }> = ({
  iconKey,
}) => {
  const cls = 'h-12 w-12 shrink-0';
  switch (iconKey) {
    case 'pintadera':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#FAF4E8" stroke="#B44F2A" strokeWidth="2" />
          <polygon points="28,10 35,21 21,21" fill="#B44F2A" />
          <polygon points="10,28 21,21 21,35" fill="#B44F2A" />
          <polygon points="46,28 35,21 35,35" fill="#B44F2A" />
          <polygon points="28,46 35,35 21,35" fill="#B44F2A" />
          <rect x="23" y="23" width="10" height="10" fill="#C67D1E" />
        </svg>
      );
    case 'silo':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#EFECE4" stroke="#6E420B" strokeWidth="2" />
          <path d="M8 44 L14 16 L42 16 L48 44 Z" fill="#8A6E52" />
          <rect x="17" y="22" width="8" height="9" rx="3" fill="#232A34" />
          <rect x="31" y="22" width="8" height="9" rx="3" fill="#232A34" />
          <rect x="24" y="34" width="8" height="9" rx="3" fill="#232A34" />
        </svg>
      );
    case 'guanartemato':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#E8F0FA" stroke="#1D4E89" strokeWidth="2" />
          <circle cx="28" cy="28" r="16" fill="#C9A875" stroke="#232A34" strokeWidth="1.8" />
          <path d="M28 12 L28 44" stroke="#1D4E89" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="20" cy="26" r="3" fill="#B44F2A" />
          <circle cx="36" cy="30" r="3" fill="#2A6F4E" />
        </svg>
      );
    case 'alfareria':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#FAF4E8" stroke="#B44F2A" strokeWidth="2" />
          <path d="M21 15 L35 15 L33 21 C40 25, 41 38, 33 43 L23 43 C15 38, 16 25, 23 21 Z" fill="#B44F2A" />
          <path d="M18 30 L38 30" stroke="#FAF4E8" strokeWidth="2" />
          <polygon points="24,30 28,25 32,30" fill="#E6A94F" />
        </svg>
      );
    case 'cronica':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#FAF4E8" stroke="#8A5410" strokeWidth="2" />
          <rect x="14" y="12" width="28" height="32" rx="3" fill="#FFFFFF" stroke="#8A5410" strokeWidth="2" />
          <line x1="19" y1="20" x2="37" y2="20" stroke="#232A34" strokeWidth="2" />
          <line x1="19" y1="27" x2="35" y2="27" stroke="#526071" strokeWidth="2" />
          <line x1="19" y1="34" x2="31" y2="34" stroke="#526071" strokeWidth="2" />
        </svg>
      );
    case 'toponimia':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#E1EFE8" stroke="#2A6F4E" strokeWidth="2" />
          <polygon points="10,42 25,18 40,42" fill="#2A6F4E" />
          <polygon points="26,42 37,24 47,42" fill="#1D543A" />
          <rect x="16" y="10" width="24" height="10" rx="3" fill="#FFFFFF" stroke="#1D4E89" strokeWidth="1.8" />
          <line x1="21" y1="15" x2="35" y2="15" stroke="#1D4E89" strokeWidth="2" />
        </svg>
      );
    case 'mestizaje':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#FAF4E8" stroke="#C67D1E" strokeWidth="2" />
          <circle cx="22" cy="28" r="12" fill="#1D4E89" opacity="0.8" />
          <circle cx="34" cy="28" r="12" fill="#C67D1E" opacity="0.8" />
          <circle cx="28" cy="28" r="4" fill="#F5F3EE" />
        </svg>
      );
    case 'prejuicio':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#F8E5E2" stroke="#A43D2F" strokeWidth="2" />
          <circle cx="28" cy="28" r="15" fill="none" stroke="#A43D2F" strokeWidth="3" />
          <line x1="18" y1="18" x2="38" y2="38" stroke="#A43D2F" strokeWidth="3" />
          <circle cx="28" cy="28" r="4" fill="#232A34" />
        </svg>
      );
    case 'almenara':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#FAF4E8" stroke="#C67D1E" strokeWidth="2" />
          <rect x="16" y="36" width="24" height="8" rx="2" fill="#526071" />
          <path d="M28 11 C36 20, 38 29, 28 36 C18 29, 20 20, 28 11 Z" fill="#C67D1E" />
          <path d="M28 19 C32 24, 33 29, 28 34 C23 29, 24 24, 28 19 Z" fill="#F6D06F" />
        </svg>
      );
    case 'atalaya':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#E8F0FA" stroke="#1D4E89" strokeWidth="2" />
          <rect x="20" y="16" width="16" height="26" fill="#6B7482" stroke="#232A34" strokeWidth="1.8" />
          <path d="M18 16 L18 11 L23 11 L23 14 L26 14 L26 11 L30 11 L30 14 L33 14 L33 11 L38 11 L38 16 Z" fill="#526071" />
          <rect x="25" y="23" width="6" height="8" rx="3" fill="#232A34" />
          <path d="M10 43 Q28 39 46 43" fill="none" stroke="#1D4E89" strokeWidth="2.5" />
        </svg>
      );
    case 'cochinilla':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#E1EFE8" stroke="#2A6F4E" strokeWidth="2" />
          <ellipse cx="28" cy="30" rx="12" ry="15" fill="#2A6F4E" />
          <circle cx="24" cy="24" r="3" fill="#F5F3EE" />
          <circle cx="32" cy="31" r="3.5" fill="#B4372E" />
          <circle cx="25" cy="36" r="2.5" fill="#B4372E" />
        </svg>
      );
    case 'bulo':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#FAF4E8" stroke="#8A5410" strokeWidth="2" />
          <rect x="11" y="14" width="26" height="19" rx="5" fill="#FFFFFF" stroke="#8A5410" strokeWidth="2" />
          <text x="24" y="28" textAnchor="middle" fill="#A43D2F" fontSize="14" fontWeight="700">?</text>
          <circle cx="38" cy="37" r="8" fill="#1D4E89" />
          <path d="M35 37 L37.5 39.5 L42 34.5" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'anacronismo':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#E8F0FA" stroke="#1D4E89" strokeWidth="2" />
          <circle cx="28" cy="28" r="15" fill="#FFFFFF" stroke="#1D4E89" strokeWidth="2.5" />
          <line x1="28" y1="28" x2="28" y2="18" stroke="#232A34" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="28" x2="36" y2="28" stroke="#C67D1E" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="42" cy="14" r="6" fill="#A43D2F" />
          <text x="42" y="17.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700">!</text>
        </svg>
      );
    case 'acequia':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#E8F0FA" stroke="#1D4E89" strokeWidth="2" />
          <path d="M12 18 C22 18, 22 38, 32 38 L46 38" fill="none" stroke="#1D4E89" strokeWidth="6" strokeLinecap="round" />
          <path d="M12 18 C22 18, 22 38, 32 38 L46 38" fill="none" stroke="#90CAF9" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
          <circle cx="41" cy="22" r="5" fill="#2A6F4E" />
        </svg>
      );
    case 'alisios':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#E8F0FA" stroke="#1D4E89" strokeWidth="2" />
          <path d="M12 22 L35 22 C39 22, 39 16, 35 16" fill="none" stroke="#1D4E89" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M10 30 L42 30 C46 30, 46 24, 42 24" fill="none" stroke="#2A6F4E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 38 L34 38 C38 38, 38 43, 34 43" fill="none" stroke="#1D4E89" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'emigracion':
      return (
        <svg viewBox="0 0 56 56" className={cls} aria-hidden="true">
          <rect x="2" y="2" width="52" height="52" rx="12" fill="#FAF4E8" stroke="#C67D1E" strokeWidth="2" />
          <rect x="14" y="21" width="28" height="20" rx="4" fill="#8A5410" stroke="#232A34" strokeWidth="1.8" />
          <path d="M22 21 L22 16 C22 14, 34 14, 34 16 L34 21" fill="none" stroke="#232A34" strokeWidth="2.2" />
          <circle cx="28" cy="31" r="4" fill="#F6EAD7" />
        </svg>
      );
  }
};

interface VisualGlossaryViewProps {
  muted: boolean;
}

export const VisualGlossaryView: React.FC<VisualGlossaryViewProps> = ({
  muted,
}) => {
  const [roomFilter, setRoomFilter] = useState<'all' | 1 | 2 | 3 | 4>('all');
  const [query, setQuery] = useState('');
  const speechAvailable = isSpeechSupported();

  const filteredTerms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY_TERMS.filter((item) => {
      const matchesRoom = roomFilter === 'all' || item.roomNumber === roomFilter;
      const matchesQuery =
        !q ||
        item.term.toLowerCase().includes(q) ||
        item.simpleDefinition.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesRoom && matchesQuery;
    });
  }, [roomFilter, query]);

  return (
    <div className="space-y-4">
      {/* Intro & Controls */}
      <div className="rounded-xl border border-[#1D4E89]/20 bg-[#E8F0FA] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1D4E89]">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Diccionario ilustrado de términos históricos y arqueológicos</span>
          </div>
          <span className="font-mono text-xs font-semibold text-[#1D4E89] tabular-nums">
            {filteredTerms.length} de {GLOSSARY_TERMS.length} palabras
          </span>
        </div>

        {/* Search + Room filter */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#526071]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar palabra (ej. pintadera, almenara, silo...)"
              aria-label="Buscar palabra en el glosario visual"
              className="w-full rounded-lg border border-[#232A34]/20 bg-white pl-9 pr-3 py-2 text-xs font-medium text-[#171B21] placeholder:text-[#7D8794]"
            />
          </div>

          <div
            role="group"
            aria-label="Filtrar términos por sala"
            className="flex flex-wrap items-center gap-1.5"
          >
            {(
              [
                { id: 'all', label: 'Todas' },
                { id: 1, label: 'Sala 1' },
                { id: 2, label: 'Sala 2' },
                { id: 3, label: 'Sala 3' },
                { id: 4, label: 'Sala 4' },
              ] as const
            ).map((btn) => {
              const active = roomFilter === btn.id;
              return (
                <button
                  key={String(btn.id)}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setRoomFilter(btn.id);
                  }}
                  className={`rounded-lg px-2.5 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#1D4E89] text-white'
                      : 'border border-[#232A34]/15 bg-white text-[#333D4B] hover:border-[#1D4E89]'
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Pictogram Term Grid */}
      {filteredTerms.length === 0 ? (
        <div className="rounded-xl border border-[#232A34]/12 bg-white p-6 text-center text-sm text-[#526071]">
          No encontramos ninguna palabra con «{query}». Prueba con otra palabra o pulsa <strong>Todas</strong>.
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {filteredTerms.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-[#232A34]/14 bg-white p-4 space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <GlossaryPictogramSvg iconKey={item.iconKey} />
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] font-semibold text-[#526071]">
                        Sala {item.roomNumber} · {item.category}
                      </div>
                      <h3 className="font-display text-base font-bold text-[#171B21] leading-snug">
                        {item.term}
                      </h3>
                    </div>
                  </div>

                  {speechAvailable && (
                    <button
                      type="button"
                      onClick={() =>
                        speakText(
                          `${item.term}. ${item.simpleDefinition} ${item.example}`,
                          muted
                        )
                      }
                      aria-label={`Escuchar explicación de ${item.term}`}
                      title="Escuchar en voz alta"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#1D4E89]/25 bg-[#F5F3EE] text-[#1D4E89] hover:bg-[#E8F0FA] cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* 3-Step Visual Pictogram Strip */}
                <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[#232A34]/10 bg-[#FAF8F4] px-3 py-2 text-xs font-bold text-[#232A34]">
                  <span>{item.pictogramSteps[0]}</span>
                  <span aria-hidden="true" className="text-[#8A5410]">
                    →
                  </span>
                  <span>{item.pictogramSteps[1]}</span>
                  <span aria-hidden="true" className="text-[#8A5410]">
                    →
                  </span>
                  <span>{item.pictogramSteps[2]}</span>
                </div>

                <p className="text-sm leading-relaxed text-[#232A34]">
                  {item.simpleDefinition}
                </p>
              </div>

              <p className="border-t border-[#232A34]/10 pt-2 text-xs text-[#4A5564]">
                <strong className="text-[#1D4E89]">En la aventura:</strong>{' '}
                {item.example}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
