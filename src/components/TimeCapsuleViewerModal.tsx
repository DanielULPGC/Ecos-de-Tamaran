import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Eye,
  MapPin,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { CycleId } from '../types/game';
import { TimeCapsuleDefinition } from '../data/timeCapsules';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface TimeCapsuleViewerModalProps {
  capsule: TimeCapsuleDefinition;
  cycle: CycleId;
  muted: boolean;
  isNewUnlock?: boolean;
  onClose: () => void;
}

export const TimeCapsuleViewerModal: React.FC<TimeCapsuleViewerModalProps> = ({
  capsule,
  cycle,
  muted,
  isNewUnlock = false,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocusTrap(dialogRef, true);

  const [spottedIndexes, setSpottedIndexes] = useState<number[]>([]);
  const speechAvailable = isSpeechSupported();

  useEffect(() => {
    setSpottedIndexes([]);
  }, [capsule.roomId]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const toggleSpottedDetail = (idx: number) => {
    setSpottedIndexes((prev) => {
      const exists = prev.includes(idx);
      const next = exists ? prev.filter((item) => item !== idx) : [...prev, idx];
      if (!exists) {
        if (next.length === capsule.spotDetails.length) {
          soundEngine.playSuccess();
        } else {
          soundEngine.playDiscover();
        }
      } else {
        soundEngine.playClick();
      }
      return next;
    });
  };

  const allDetailsSpotted = spottedIndexes.length === capsule.spotDetails.length;

  const handleReadAloud = () => {
    const text = `Cápsula del Tiempo ${capsule.capsuleNumber}: ${capsule.title}. ${capsule.historicalDate}, en ${capsule.location}. ${capsule.summary[cycle]}`;
    speakText(text, muted);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="time-capsule-viewer-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0D1015]/88 p-3 sm:p-5"
    >
      <div className="flex max-h-[93vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#C67D1E]/40 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Archival Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-[#526071]">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#8A5410]">
                <Sparkles
                  className="h-3.5 w-3.5 text-[#C67D1E]"
                  aria-hidden="true"
                />
                <span>
                  Cápsula del Tiempo {capsule.capsuleNumber}/4
                  {isNewUnlock ? ' · ¡Recién desbloqueada!' : ''}
                </span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-mono text-[#1D4E89]">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{capsule.historicalDate}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{capsule.location}</span>
              </span>
            </div>
            <h2
              id="time-capsule-viewer-title"
              className="mt-0.5 font-display text-xl font-bold text-[#171B21] sm:text-2xl"
            >
              {capsule.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {speechAvailable && (
              <button
                type="button"
                onClick={handleReadAloud}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1D4E89]/30 bg-white px-3 py-1.5 text-xs font-bold text-[#1D4E89] hover:bg-[#E8F0FA] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Escuchar relato</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              aria-label="Cerrar Cápsula del Tiempo"
              className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] shrink-0 cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable Content — Unobstructed AI Historical Illustration + Story + Interactive Visual Details */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-5">
          {/* Clean, Unobstructed 16:9 Illustration Frame (zero overlapping text) */}
          <figure className="overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#171B21] shadow-md">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={capsule.imagePath}
                alt={capsule.imageAlt}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-[#232A34]/12 bg-[#FAF8F4] px-4 py-2.5 text-xs text-[#526071]">
              <span className="font-semibold text-[#171B21]">
                {capsule.eventTag}
              </span>
              <span className="font-mono text-[11px]">
                Ilustración histórica generada por IA · {capsule.historicalDate}
              </span>
            </figcaption>
          </figure>

          {/* Historical Explanation */}
          <div className="rounded-2xl border border-[#232A34]/12 bg-white p-4 sm:p-5 space-y-2">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#1D4E89]">
              ¿Qué ocurrió en esta escena? ·{' '}
              {cycle === 'ciclo2' ? '2.º Ciclo' : '3.º Ciclo'}
            </div>
            <p className="text-[15px] leading-relaxed text-[#232A34]">
              {capsule.summary[cycle]}
            </p>
          </div>

          {/* Interactive 3-Detail Visual Observation Challenge */}
          <div className="rounded-2xl border border-[#C67D1E]/35 bg-[#FAF4E8] p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8A5410]">
                <Eye className="h-4 w-4 text-[#C67D1E]" aria-hidden="true" />
                <span>
                  Reto visual: busca estos 3 detalles en la lámina y márcalos al encontrarlos
                </span>
              </div>
              <span
                className={`font-mono text-xs font-bold tabular-nums ${
                  allDetailsSpotted ? 'text-[#1D543A]' : 'text-[#8A5410]'
                }`}
              >
                {spottedIndexes.length}/{capsule.spotDetails.length} localizados
              </span>
            </div>

            <ul className="space-y-2 text-sm text-[#232A34]">
              {capsule.spotDetails.map((detail, idx) => {
                const checked = spottedIndexes.includes(idx);
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => toggleSpottedDetail(idx)}
                      aria-pressed={checked}
                      className={`flex w-full items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                        checked
                          ? 'border-[#2A6F4E]/50 bg-[#E8F3EC] text-[#171B21]'
                          : 'border-[#C67D1E]/25 bg-white/85 text-[#232A34] hover:border-[#C67D1E]'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {checked ? (
                          <CheckCircle2
                            className="h-5 w-5 text-[#2A6F4E]"
                            aria-hidden="true"
                          />
                        ) : (
                          <Circle
                            className="h-5 w-5 text-[#C67D1E]"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <span className="flex-1 leading-snug">{detail}</span>
                      <span
                        className={`text-[11px] font-bold whitespace-nowrap shrink-0 self-center ${
                          checked ? 'text-[#1D543A]' : 'text-[#8A5410]'
                        }`}
                      >
                        {checked ? '¡Visto!' : 'Marcar'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {allDetailsSpotted && (
              <div
                aria-live="polite"
                className="flex items-center gap-2 rounded-xl border border-[#2A6F4E]/40 bg-[#E1EFE8] px-3.5 py-2.5 text-xs font-bold text-[#1D543A]"
              >
                <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  ¡Observación histórica completada! Has leído la ilustración como una fuente del pasado.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#232A34]/12 bg-[#EFECE4] px-5 py-3.5 sm:px-6">
          <span className="text-xs text-[#526071]">
            Esta lámina queda guardada en tu{' '}
            <strong>Álbum de Conquistas → Cápsulas del Tiempo</strong>.
          </span>
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="rounded-lg bg-[#1D4E89] px-5 py-2 text-xs font-bold text-white hover:bg-[#153A68] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Guardar y continuar
          </button>
        </div>
      </div>
    </div>
  );
};
