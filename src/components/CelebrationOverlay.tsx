import React from 'react';
import { Award, Medal, Sparkles } from 'lucide-react';
import { BadgeDefinition, HonorAchievementDefinition } from '../types/game';

interface CelebrationOverlayProps {
  burstKey: number;
  headline: string | null;
  badge?: BadgeDefinition | null;
  honorAchievement?: HonorAchievementDefinition | null;
}

const CONFETTI_PIECES = [
  { left: '12%', delay: '0ms', color: '#E6A94F', rot: '18deg' },
  { left: '22%', delay: '60ms', color: '#52B788', rot: '-24deg' },
  { left: '31%', delay: '30ms', color: '#4B91D1', rot: '35deg' },
  { left: '42%', delay: '90ms', color: '#E6A94F', rot: '-15deg' },
  { left: '51%', delay: '15ms', color: '#F5F3EE', rot: '42deg' },
  { left: '61%', delay: '75ms', color: '#52B788', rot: '-30deg' },
  { left: '72%', delay: '45ms', color: '#4B91D1', rot: '22deg' },
  { left: '83%', delay: '100ms', color: '#E6A94F', rot: '-40deg' },
  { left: '90%', delay: '20ms', color: '#52B788', rot: '28deg' },
  { left: '18%', delay: '120ms', color: '#D97B48', rot: '-12deg' },
  { left: '47%', delay: '140ms', color: '#D97B48', rot: '16deg' },
  { left: '77%', delay: '110ms', color: '#F5F3EE', rot: '-26deg' },
];

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  burstKey,
  headline,
  badge,
  honorAchievement,
}) => {
  if (!headline && !badge && !honorAchievement) return null;

  const isHonor = Boolean(honorAchievement);

  return (
    <div
      key={burstKey}
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
    >
      {/* Gentle confetti burst */}
      {CONFETTI_PIECES.map((piece, idx) => (
        <span
          key={idx}
          aria-hidden="true"
          className="confetti-piece absolute top-0 h-3 w-2.5 rounded-xs"
          style={{
            left: piece.left,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            transform: `rotate(${piece.rot})`,
          }}
        />
      ))}

      {/* Crisp celebration / badge / honor unlock banner */}
      <div className="flex justify-center pt-16 px-4">
        <div
          className={`celebration-pop relative overflow-hidden flex items-center gap-3 rounded-2xl border px-5 py-3 text-[#F5F3EE] shadow-2xl ${
            isHonor
              ? 'border-[#F3C876] bg-[#181C23]/96'
              : 'border-[#E6A94F]/70 bg-[#171B21]/95'
          }`}
        >
          {(isHonor || badge) && (
            <span
              aria-hidden="true"
              className="honor-sheen-layer pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-transparent via-[#F8DC9C]/45 to-transparent"
            />
          )}

          <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center">
            {(badge || isHonor) && (
              <span
                aria-hidden="true"
                className="badge-ring-burst pointer-events-none absolute inset-0 rounded-full border-2 border-[#F3C876]"
              />
            )}
            <div
              className={`badge-medal-pop flex h-10 w-10 items-center justify-center rounded-xl ${
                isHonor
                  ? 'bg-[#E6A94F] text-[#14181F]'
                  : 'bg-[#C67D1E] text-[#14181F]'
              }`}
            >
              {isHonor ? (
                <Medal className="h-5 w-5" aria-hidden="true" />
              ) : badge ? (
                <Award className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              )}
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-xs font-mono font-semibold text-[#F3C876]">
              {honorAchievement
                ? `Muro de Honor · ${
                    honorAchievement.hidden
                      ? 'Reto oculto descubierto'
                      : 'Logro especial'
                  }`
                : badge
                ? `Nueva insignia: ${badge.title}`
                : '¡Logro desbloqueado!'}
            </div>
            <div className="text-sm font-semibold text-[#F5F3EE]">
              {honorAchievement
                ? `${honorAchievement.title} — ${honorAchievement.description}`
                : headline || badge?.subtitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
