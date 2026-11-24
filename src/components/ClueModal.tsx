import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Search, Volume2, X } from 'lucide-react';
import { ClueContent, CycleId } from '../types/game';
import { getDifficultyProfile } from '../data/difficultyConfig';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface ClueModalProps {
  clue: ClueContent;
  cycle: CycleId;
  muted: boolean;
  voiceAuto: boolean;
  pictograms: boolean;
  onClose: () => void;
}

export const ClueModal: React.FC<ClueModalProps> = ({
  clue,
  cycle,
  muted,
  voiceAuto,
  pictograms,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocusTrap(dialogRef, true);

  const difficulty = getDifficultyProfile(cycle);
  // 2.º Ciclo keeps clues concise by default (expandable); 3.º Ciclo shows full archival note directly
  const [showExtendedNote, setShowExtendedNote] = useState(cycle === 'ciclo3');
  const speechAvailable = isSpeechSupported();

  useEffect(() => {
    setShowExtendedNote(cycle === 'ciclo3');
  }, [cycle, clue.id]);

  useEffect(() => {
    if (voiceAuto) {
      speakText(`${clue.title}. ${clue.text[cycle]}`, muted);
    }
    return () => stopSpeaking();
  }, [clue, cycle, muted, voiceAuto]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="clue-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/78 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-[#526071]">
              <span className="inline-flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-[#1D4E89]" aria-hidden="true" />
                <span>{clue.subtitle}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#1D4E89]">
                {difficulty.clueLengthLabel}
              </span>
            </div>
            <h2
              id="clue-modal-title"
              className="mt-1 font-display text-xl font-bold text-[#171B21]"
            >
              {clue.title}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {speechAvailable && (
              <button
                type="button"
                onClick={() =>
                  speakText(
                    showExtendedNote
                      ? `${clue.title}. ${clue.text[cycle]} ${clue.historicalNote}`
                      : `${clue.title}. ${clue.text[cycle]}`,
                    muted
                  )
                }
                aria-label="Escuchar hallazgo"
                className="inline-flex items-center gap-1 rounded-lg border border-[#1D4E89]/30 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1D4E89] hover:bg-[#E8F0FA] cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Escuchar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar hallazgo"
              className="rounded-lg p-2 text-[#526071] transition-colors hover:bg-[#232A34]/10 hover:text-[#171B21] cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          {pictograms && (
            <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-[#1D4E89]/25 bg-white px-4 py-2 text-xs font-bold text-[#1D4E89]">
              <span>👀 Observa el hallazgo</span>
              <span aria-hidden="true">→</span>
              <span>🧠 Guarda esta pista</span>
              <span aria-hidden="true">→</span>
              <span>🔑 Úsala en el cerrojo</span>
            </div>
          )}

          <p className="text-base font-medium leading-relaxed text-[#171B21]">
            {clue.text[cycle]}
          </p>

          {cycle === 'ciclo2' ? (
            <div className="rounded-xl border border-[#232A34]/12 bg-[#EAE6DC]/70 p-3.5">
              <button
                type="button"
                onClick={() => setShowExtendedNote((prev) => !prev)}
                aria-expanded={showExtendedNote}
                className="flex w-full items-center justify-between gap-2 text-xs font-semibold text-[#1D4E89] cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Dato curioso opcional (saber más)</span>
                </span>
                {showExtendedNote ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              {showExtendedNote && (
                <p className="mt-2 text-sm text-[#333D4B]">
                  {clue.historicalNote}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-[#232A34]/12 bg-[#EAE6DC]/70 p-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1D4E89]">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Análisis de fuente histórica · 3.º Ciclo</span>
              </div>
              <p className="mt-1 text-sm text-[#333D4B]">
                {clue.historicalNote}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#1D4E89] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#153A68] whitespace-nowrap cursor-pointer"
          >
            ¡Anotado!
          </button>
        </div>
      </div>
    </div>
  );
};
