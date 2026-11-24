import React from 'react';
import { EmotionFaceKey } from '../types/game';

interface EmotionFaceSvgProps {
  face: EmotionFaceKey;
  className?: string;
}

export const EmotionFaceSvg: React.FC<EmotionFaceSvgProps> = ({
  face,
  className = 'h-14 w-14',
}) => {
  const palette: Record<
    EmotionFaceKey,
    { bg: string; ring: string; stroke: string }
  > = {
    preocupacion: { bg: '#F7E7C8', ring: '#C67D1E', stroke: '#4A3415' },
    miedo: { bg: '#E3EAF7', ring: '#1D4E89', stroke: '#193557' },
    anoranza: { bg: '#EFE6F5', ring: '#6F4E8A', stroke: '#3B284C' },
    enfado: { bg: '#F8DFDC', ring: '#A43D2F', stroke: '#5C1E16' },
    calma: { bg: '#DDF0E6', ring: '#2A6F4E', stroke: '#184430' },
    alegria: { bg: '#FCF0C8', ring: '#C88A16', stroke: '#4D3609' },
    indiferencia: { bg: '#E7E9ED', ring: '#6B7482', stroke: '#343B45' },
  };

  const colors = palette[face];

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="28"
        fill={colors.bg}
        stroke={colors.ring}
        strokeWidth="2.5"
      />

      {face === 'preocupacion' && (
        <g stroke={colors.stroke} strokeLinecap="round" fill="none">
          {/* Tilted worried brows */}
          <path d="M18 22 Q23 19 27 21" strokeWidth="2.4" />
          <path d="M46 22 Q41 19 37 21" strokeWidth="2.4" />
          <circle cx="23" cy="29" r="2.6" fill={colors.stroke} stroke="none" />
          <circle cx="41" cy="29" r="2.6" fill={colors.stroke} stroke="none" />
          {/* Wavy concerned mouth */}
          <path d="M23 43 Q28 38 32 41 Q36 44 41 40" strokeWidth="2.5" />
          {/* Sweat drop */}
          <path
            d="M48 24 C50 27 50 30 48 30 C46 30 46 27 48 24 Z"
            fill="#4B91D1"
            stroke="none"
          />
        </g>
      )}

      {face === 'miedo' && (
        <g stroke={colors.stroke} strokeLinecap="round" fill="none">
          <path d="M18 20 Q23 16 27 20" strokeWidth="2.4" />
          <path d="M37 20 Q41 16 46 20" strokeWidth="2.4" />
          <circle cx="23" cy="28" r="4.2" fill="#FFFFFF" strokeWidth="2" />
          <circle cx="41" cy="28" r="4.2" fill="#FFFFFF" strokeWidth="2" />
          <circle cx="23" cy="28" r="1.8" fill={colors.stroke} stroke="none" />
          <circle cx="41" cy="28" r="1.8" fill={colors.stroke} stroke="none" />
          <ellipse cx="32" cy="43" rx="5.5" ry="6.5" fill={colors.stroke} opacity="0.85" stroke="none" />
        </g>
      )}

      {face === 'anoranza' && (
        <g stroke={colors.stroke} strokeLinecap="round" fill="none">
          <path d="M18 23 Q23 20 27 22" strokeWidth="2.2" />
          <path d="M46 23 Q41 20 37 22" strokeWidth="2.2" />
          <circle cx="23" cy="29" r="2.6" fill={colors.stroke} stroke="none" />
          <circle cx="41" cy="29" r="2.6" fill={colors.stroke} stroke="none" />
          {/* Gentle bittersweet mouth */}
          <path d="M24 43 Q32 38 40 43" strokeWidth="2.4" />
          {/* Small teardrop */}
          <path
            d="M20 33 C22 36 22 39 20 39 C18 39 18 36 20 33 Z"
            fill="#5698D6"
            stroke="none"
          />
        </g>
      )}

      {face === 'enfado' && (
        <g stroke={colors.stroke} strokeLinecap="round" fill="none">
          <path d="M18 21 L28 25" strokeWidth="2.8" />
          <path d="M46 21 L36 25" strokeWidth="2.8" />
          <circle cx="23" cy="30" r="2.6" fill={colors.stroke} stroke="none" />
          <circle cx="41" cy="30" r="2.6" fill={colors.stroke} stroke="none" />
          <path d="M23 44 Q32 37 41 44" strokeWidth="2.6" />
        </g>
      )}

      {face === 'calma' && (
        <g stroke={colors.stroke} strokeLinecap="round" fill="none">
          <path d="M18 28 Q23 24 28 28" strokeWidth="2.5" />
          <path d="M36 28 Q41 24 46 28" strokeWidth="2.5" />
          <path d="M24 40 Q32 45 40 40" strokeWidth="2.5" />
        </g>
      )}

      {face === 'alegria' && (
        <g stroke={colors.stroke} strokeLinecap="round" fill="none">
          <circle cx="23" cy="26" r="2.8" fill={colors.stroke} stroke="none" />
          <circle cx="41" cy="26" r="2.8" fill={colors.stroke} stroke="none" />
          <circle cx="17" cy="34" r="3.5" fill="#F29B7B" opacity="0.6" stroke="none" />
          <circle cx="47" cy="34" r="3.5" fill="#F29B7B" opacity="0.6" stroke="none" />
          <path d="M21 38 Q32 49 43 38" strokeWidth="2.8" />
        </g>
      )}

      {face === 'indiferencia' && (
        <g stroke={colors.stroke} strokeLinecap="round" fill="none">
          <line x1="18" y1="27" x2="27" y2="27" strokeWidth="2.5" />
          <line x1="37" y1="27" x2="46" y2="27" strokeWidth="2.5" />
          <line x1="24" y1="42" x2="40" y2="42" strokeWidth="2.5" />
        </g>
      )}
    </svg>
  );
};
