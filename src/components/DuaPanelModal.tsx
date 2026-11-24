import React from 'react';
import { Accessibility, Check, Volume2, X } from 'lucide-react';
import { DuaSettings } from '../types/game';
import { soundEngine } from '../utils/audio';
import { isSpeechSupported, speakText } from '../utils/speech';

interface DuaPanelModalProps {
  dua: DuaSettings;
  muted: boolean;
  onChangeDua: (next: DuaSettings) => void;
  onClose: () => void;
}

export const DuaPanelModal: React.FC<DuaPanelModalProps> = ({
  dua,
  muted,
  onChangeDua,
  onClose,
}) => {
  const speechAvailable = isSpeechSupported();

  const toggleField = (field: 'dyslexiaFont' | 'highContrast' | 'pictograms') => {
    soundEngine.playClick();
    onChangeDua({
      ...dua,
      [field]: !dua[field],
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dua-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/84 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1D4E89]">
              <Accessibility className="h-4 w-4" aria-hidden="true" />
              <span>Diseño Universal para el Aprendizaje (DUA)</span>
            </div>
            <h2
              id="dua-modal-title"
              className="mt-1 font-display text-xl font-bold text-[#171B21]"
            >
              Accesibilidad y apoyos visuales
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel DUA"
            className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Toggle 1: Dyslexia-friendly reading */}
          <button
            type="button"
            role="switch"
            aria-checked={dua.dyslexiaFont}
            onClick={() => toggleField('dyslexiaFont')}
            className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
              dua.dyslexiaFont
                ? 'border-[#1D4E89] bg-[#E8F0FA]'
                : 'border-[#232A34]/15 bg-white hover:border-[#1D4E89]'
            }`}
          >
            <div>
              <div className="text-sm font-bold text-[#171B21]">
                Tipografía de lectura fácil (apoyo dislexia)
              </div>
              <p className="mt-0.5 text-xs text-[#4A5564]">
                Aumenta el espaciado entre letras, palabras y líneas para facilitar la lectura.
              </p>
            </div>
            <span
              className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
                dua.dyslexiaFont ? 'bg-[#1D4E89] justify-end' : 'bg-[#CBD2DC] justify-start'
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
            </span>
          </button>

          {/* Toggle 2: High contrast */}
          <button
            type="button"
            role="switch"
            aria-checked={dua.highContrast}
            onClick={() => toggleField('highContrast')}
            className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
              dua.highContrast
                ? 'border-[#1D4E89] bg-[#E8F0FA]'
                : 'border-[#232A34]/15 bg-white hover:border-[#1D4E89]'
            }`}
          >
            <div>
              <div className="text-sm font-bold text-[#171B21]">
                Modo alto contraste
              </div>
              <p className="mt-0.5 text-xs text-[#4A5564]">
                Refuerza los bordes y el contraste entre texto y fondo en todas las tarjetas.
              </p>
            </div>
            <span
              className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
                dua.highContrast ? 'bg-[#1D4E89] justify-end' : 'bg-[#CBD2DC] justify-start'
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
            </span>
          </button>

          {/* Toggle 3: Visual pictograms */}
          <button
            type="button"
            role="switch"
            aria-checked={dua.pictograms}
            onClick={() => toggleField('pictograms')}
            className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors cursor-pointer ${
              dua.pictograms
                ? 'border-[#1D4E89] bg-[#E8F0FA]'
                : 'border-[#232A34]/15 bg-white hover:border-[#1D4E89]'
            }`}
          >
            <div>
              <div className="text-sm font-bold text-[#171B21]">
                Pictogramas de apoyo paso a paso
              </div>
              <p className="mt-0.5 text-xs text-[#4A5564]">
                Muestra secuencias visuales cortas (👀 Observa → 👆 Toca → ✅ Comprueba) en los retos.
              </p>
            </div>
            <span
              className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
                dua.pictograms ? 'bg-[#1D4E89] justify-end' : 'bg-[#CBD2DC] justify-start'
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
            </span>
          </button>

          {/* Voice speed selector */}
          {speechAvailable && (
            <div className="rounded-xl border border-[#232A34]/15 bg-white p-4 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-[#171B21]">
                  Velocidad de la voz narradora
                </span>
                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      '¡Hola! Así suena la voz narradora de Ecos de Tamarán.',
                      muted,
                      dua.voiceRate
                    )
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-[#1D4E89]/30 bg-[#F5F3EE] px-2.5 py-1 text-xs font-bold text-[#1D4E89] hover:bg-[#E8F0FA] cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Probar voz</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { rate: 0.8, label: 'Despacio (0.8×)' },
                    { rate: 1.0, label: 'Normal (1.0×)' },
                    { rate: 1.15, label: 'Ágil (1.15×)' },
                  ] as const
                ).map((item) => {
                  const active = dua.voiceRate === item.rate;
                  return (
                    <button
                      key={item.rate}
                      type="button"
                      onClick={() => {
                        soundEngine.playStep();
                        onChangeDua({ ...dua, voiceRate: item.rate });
                      }}
                      className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                        active
                          ? 'border-[#1D4E89] bg-[#1D4E89] text-white'
                          : 'border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] hover:border-[#1D4E89]'
                      }`}
                    >
                      {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#1D4E89] px-5 py-2 text-sm font-bold text-white hover:bg-[#153A68] cursor-pointer"
          >
            Guardar y volver
          </button>
        </div>
      </div>
    </div>
  );
};
