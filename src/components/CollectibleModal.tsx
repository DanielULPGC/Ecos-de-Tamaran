import React, { useEffect } from 'react';
import { Sparkles, Volume2, X } from 'lucide-react';
import { CanarianCollectible } from '../types/game';
import { isSpeechSupported, speakText, stopSpeaking } from '../utils/speech';

export const CanarianEmblemSvg: React.FC<{
  iconKey: CanarianCollectible['iconKey'];
  className?: string;
}> = ({ iconKey, className = 'h-12 w-12' }) => {
  switch (iconKey) {
    case 'alpispa':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#E8F0FA" stroke="#1D4E89" strokeWidth="2.5" />
          {/* Little wagtail bird (alpispa) silhouette in warm ochre & slate */}
          <path
            d="M16 40 C22 33, 30 28, 39 27 C43 23, 47 22, 50 24 L54 25 L50 27 C49 32, 44 37, 36 40 L20 46 Z"
            fill="#2E3B4A"
          />
          <path
            d="M27 38 C32 39, 39 39, 43 34 C40 33, 34 33, 29 35 Z"
            fill="#E6A94F"
          />
          <circle cx="46" cy="25" r="1.5" fill="#F5F3EE" />
          <path d="M35 40 L34 49 M39 39 L40 49" stroke="#8A5410" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'perenquen':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#E1EFE8" stroke="#2A6F4E" strokeWidth="2.5" />
          {/* Friendly Canarian gecko (perenquén) */}
          <path
            d="M19 46 C22 40, 26 37, 30 33 C33 29, 36 24, 41 21 C44 19, 48 21, 46 25 C43 29, 39 33, 35 37 C31 41, 27 44, 21 48"
            fill="none"
            stroke="#2A6F4E"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M36 26 L31 21 M40 31 L46 31 M28 35 L23 31 M31 40 L37 44"
            stroke="#1D543A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="43.5" cy="22" r="1.4" fill="#F5F3EE" />
          <circle cx="41" cy="24.5" r="1.4" fill="#F5F3EE" />
        </svg>
      );
    case 'timple':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#FAF4E8" stroke="#C67D1E" strokeWidth="2.5" />
          {/* Canarian timple tilted */}
          <g transform="rotate(-35 32 32)">
            <ellipse cx="32" cy="40" rx="10" ry="12" fill="#C67D1E" stroke="#6E420B" strokeWidth="2" />
            <circle cx="32" cy="37" r="3.5" fill="#232A34" />
            <rect x="29.5" y="13" width="5" height="17" rx="1.5" fill="#6E420B" />
            <rect x="28" y="10" width="8" height="4.5" rx="1.5" fill="#8A5410" />
            <line x1="27" y1="45" x2="37" y2="45" stroke="#232A34" strokeWidth="2" />
            <line x1="31" y1="14" x2="31" y2="45" stroke="#F5F3EE" strokeWidth="0.9" />
            <line x1="33" y1="14" x2="33" y2="45" stroke="#F5F3EE" strokeWidth="0.9" />
          </g>
        </svg>
      );
    case 'guagua':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#F6EAD7" stroke="#1D4E89" strokeWidth="2.5" />
          {/* Classic yellow/blue Gran Canaria guagua */}
          <rect x="14" y="23" width="36" height="19" rx="4" fill="#E6A94F" stroke="#232A34" strokeWidth="2" />
          <rect x="18" y="27" width="8" height="6" rx="1" fill="#1D4E89" />
          <rect x="28" y="27" width="8" height="6" rx="1" fill="#1D4E89" />
          <rect x="38" y="27" width="8" height="6" rx="1" fill="#1D4E89" />
          <line x1="14" y1="36" x2="50" y2="36" stroke="#1D4E89" strokeWidth="2.5" />
          <circle cx="22" cy="43" r="4" fill="#232A34" stroke="#F5F3EE" strokeWidth="1.5" />
          <circle cx="42" cy="43" r="4" fill="#232A34" stroke="#F5F3EE" strokeWidth="1.5" />
        </svg>
      );
  }
};

interface CollectibleModalProps {
  collectible: CanarianCollectible;
  muted: boolean;
  voiceAuto: boolean;
  onClose: () => void;
}

export const CollectibleModal: React.FC<CollectibleModalProps> = ({
  collectible,
  muted,
  voiceAuto,
  onClose,
}) => {
  const speechAvailable = isSpeechSupported();

  const fullSpeech = `${collectible.word} y ${collectible.secondaryWord}. ${collectible.meaning} Por ejemplo: ${collectible.exampleSentence} ${collectible.culturalFact}`;

  useEffect(() => {
    if (voiceAuto) {
      speakText(fullSpeech, muted);
    }
    return () => stopSpeaking();
  }, [fullSpeech, muted, voiceAuto]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="collectible-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/82 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#C67D1E]/40 bg-[#F5F3EE] text-[#232A34] shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#FAF4E8] px-6 py-4">
          <div className="flex items-center gap-3.5">
            <CanarianEmblemSvg
              iconKey={collectible.iconKey}
              className="h-14 w-14 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8A5410]">
                <Sparkles className="h-3.5 w-3.5 text-[#C67D1E]" aria-hidden="true" />
                <span>Tesoro Canario · {collectible.category}</span>
              </div>
              <h2
                id="collectible-modal-title"
                className="mt-0.5 font-display text-2xl font-bold text-[#171B21]"
              >
                {collectible.word}{' '}
                <span className="text-base font-medium text-[#526071]">
                  · {collectible.secondaryWord}
                </span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar tesoro canario"
            className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <p className="text-[15px] font-medium leading-relaxed text-[#171B21]">
            {collectible.meaning}
          </p>

          <div className="rounded-xl border border-[#1D4E89]/20 bg-[#E8F0FA] px-4 py-3 text-sm italic text-[#171B21]">
            {collectible.exampleSentence}
          </div>

          <div className="rounded-xl border border-[#232A34]/12 bg-white p-4">
            <div className="text-xs font-bold text-[#1D4E89]">
              Además, en nuestro habla canaria…
            </div>
            <p className="mt-1 text-sm text-[#333D4B]">
              {collectible.culturalFact}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          {speechAvailable ? (
            <button
              type="button"
              onClick={() => speakText(fullSpeech, muted)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1D4E89]/35 bg-white px-3.5 py-2 text-xs font-bold text-[#1D4E89] hover:bg-[#E8F0FA] cursor-pointer"
            >
              <Volume2 className="h-4 w-4" aria-hidden="true" />
              <span>Pronunciar en voz alta</span>
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#C67D1E] px-5 py-2 text-sm font-bold text-[#14181F] hover:bg-[#D98E2B] cursor-pointer"
          >
            ¡Guardado en el Álbum!
          </button>
        </div>
      </div>
    </div>
  );
};
