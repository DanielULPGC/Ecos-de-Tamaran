import React from 'react';
import { CharacterReactionId, ExplorerId } from '../types/game';
import { CHARACTER_REACTION_META } from '../data/characterReactions';

interface ExplorerReactionAvatarProps {
  explorerId: ExplorerId;
  explorerName: string;
  reaction: CharacterReactionId;
  pulseKey?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-11 w-11',
  md: 'h-14 w-14',
  lg: 'h-16 w-16',
};

interface ExplorerAppearance {
  skin: string;
  skinShadow: string;
  cheek: string;
  hairMain: string;
  hairHighlight: string;
  hairStroke: string;
  shirt: string;
  vest: string;
  vestAccent: string;
  hasFreckles: boolean;
  hasGlasses: boolean;
  hasPencil: boolean;
  hasScarf: boolean;
  hasPendant: boolean;
}

const APPEARANCE: Record<ExplorerId, ExplorerAppearance> = {
  nayra: {
    skin: '#E6AE82',
    skinShadow: '#CF9366',
    cheek: '#D97B62',
    hairMain: '#472E1E',
    hairHighlight: '#694630',
    hairStroke: '#28180E',
    shirt: '#F5EFE3',
    vest: '#4B6B4A',
    vestAccent: '#365035',
    hasFreckles: true,
    hasGlasses: false,
    hasPencil: false,
    hasScarf: false,
    hasPendant: true,
  },
  aday: {
    skin: '#F0C09B',
    skinShadow: '#D9A57D',
    cheek: '#DF8770',
    hairMain: '#382B23',
    hairHighlight: '#5A473B',
    hairStroke: '#211813',
    shirt: '#F5EFE3',
    vest: '#D49A3A',
    vestAccent: '#A67321',
    hasFreckles: false,
    hasGlasses: false,
    hasPencil: false,
    hasScarf: true,
    hasPendant: false,
  },
  sofia: {
    skin: '#F3C7A6',
    skinShadow: '#DCA984',
    cheek: '#E28974',
    hairMain: '#63422B',
    hairHighlight: '#855C3E',
    hairStroke: '#382315',
    shirt: '#E8DFCF',
    vest: '#3B6485',
    vestAccent: '#284761',
    hasFreckles: true,
    hasGlasses: true,
    hasPencil: false,
    hasScarf: false,
    hasPendant: false,
  },
  yeray: {
    skin: '#F2C39E',
    skinShadow: '#D9A680',
    cheek: '#E2866C',
    hairMain: '#9B683A',
    hairHighlight: '#BD8652',
    hairStroke: '#573619',
    shirt: '#F5EFE3',
    vest: '#C39C62',
    vestAccent: '#8F6C3A',
    hasFreckles: true,
    hasGlasses: false,
    hasPencil: true,
    hasScarf: false,
    hasPendant: false,
  },
};

export const ExplorerReactionAvatar: React.FC<ExplorerReactionAvatarProps> = ({
  explorerId,
  explorerName,
  reaction,
  pulseKey = 0,
  size = 'md',
  className = '',
}) => {
  const meta = CHARACTER_REACTION_META[reaction];
  const look = APPEARANCE[explorerId];

  const renderBackHair = () => {
    if (explorerId === 'nayra') {
      return (
        <g fill={look.hairMain} stroke={look.hairStroke} strokeWidth="2">
          <circle cx="26" cy="48" r="13" />
          <circle cx="74" cy="48" r="13" />
          <circle cx="24" cy="64" r="12" />
          <circle cx="76" cy="64" r="12" />
          <circle cx="30" cy="34" r="13" />
          <circle cx="70" cy="34" r="13" />
          <circle cx="50" cy="28" r="17" />
          <circle cx="33" cy="74" r="9" />
          <circle cx="67" cy="74" r="9" />
        </g>
      );
    }

    if (explorerId === 'sofia') {
      return (
        <g>
          {/* Back hair + two braids */}
          <ellipse
            cx="50"
            cy="44"
            rx="27"
            ry="25"
            fill={look.hairMain}
            stroke={look.hairStroke}
            strokeWidth="2"
          />
          {/* Left braid */}
          <g fill={look.hairMain} stroke={look.hairStroke} strokeWidth="1.7">
            <ellipse cx="26" cy="67" rx="5.2" ry="5.5" />
            <ellipse cx="25" cy="76" rx="4.8" ry="5.2" />
            <ellipse cx="25" cy="84" rx="4.2" ry="4.6" />
          </g>
          <rect
            x="21"
            y="86"
            width="8"
            height="3"
            rx="1.5"
            fill="#C67D1E"
          />
          {/* Right braid */}
          <g fill={look.hairMain} stroke={look.hairStroke} strokeWidth="1.7">
            <ellipse cx="74" cy="67" rx="5.2" ry="5.5" />
            <ellipse cx="75" cy="76" rx="4.8" ry="5.2" />
            <ellipse cx="75" cy="84" rx="4.2" ry="4.6" />
          </g>
          <rect
            x="71"
            y="86"
            width="8"
            height="3"
            rx="1.5"
            fill="#C67D1E"
          />
        </g>
      );
    }

    if (explorerId === 'aday') {
      return (
        <g fill={look.hairMain} stroke={look.hairStroke} strokeWidth="2">
          <path d="M23 50 C20 28 36 16 52 17 C70 18 81 30 77 50 C78 58 74 63 70 62 L30 62 C25 62 22 57 23 50 Z" />
        </g>
      );
    }

    // Yeray messy explorer hair
    return (
      <g fill={look.hairMain} stroke={look.hairStroke} strokeWidth="2">
        <path d="M24 52 C19 36 28 20 46 18 C54 14 66 17 72 25 C82 30 81 44 76 54 L24 54 Z" />
      </g>
    );
  };

  const renderFrontHair = () => {
    if (explorerId === 'nayra') {
      return (
        <g>
          <path
            d="M27 44 C29 27 42 22 50 24 C60 21 72 28 73 44 C69 36 62 32 54 33 C47 30 39 32 34 39 C31 41 29 43 27 44 Z"
            fill={look.hairMain}
            stroke={look.hairStroke}
            strokeWidth="1.8"
          />
          <path
            d="M36 29 C42 25 48 26 52 28"
            fill="none"
            stroke={look.hairHighlight}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M56 27 C62 27 66 30 68 35"
            fill="none"
            stroke={look.hairHighlight}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      );
    }

    if (explorerId === 'aday') {
      return (
        <g>
          <path
            d="M25 46 C26 27 40 19 52 21 C65 20 75 29 75 46 C71 39 65 34 59 35 C55 30 48 31 43 36 C37 32 31 37 25 46 Z"
            fill={look.hairMain}
            stroke={look.hairStroke}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M37 28 C44 24 53 24 61 28"
            fill="none"
            stroke={look.hairHighlight}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      );
    }

    if (explorerId === 'sofia') {
      return (
        <g>
          <path
            d="M26 47 C27 28 40 21 50 23 C61 21 73 29 74 47 C68 38 58 33 50 29 C43 34 33 38 26 47 Z"
            fill={look.hairMain}
            stroke={look.hairStroke}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M50 23 L50 30"
            stroke={look.hairStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M35 30 C40 27 45 27 48 28"
            fill="none"
            stroke={look.hairHighlight}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>
      );
    }

    // Yeray spiky warm bangs + pencil tucked behind right ear
    return (
      <g>
        {look.hasPencil && (
          <g transform="rotate(28 74 41)">
            <rect
              x="71"
              y="26"
              width="4.2"
              height="24"
              rx="1"
              fill="#E8B94B"
              stroke="#573619"
              strokeWidth="1.2"
            />
            <polygon points="71,50 75.2,50 73.1,55" fill="#F2D7B6" />
            <polygon points="72.3,53.2 73.9,53.2 73.1,55" fill="#232A34" />
          </g>
        )}
        <path
          d="M26 46 C26 28 38 20 50 22 C56 17 65 20 69 27 C74 30 75 39 74 46 C69 39 63 34 58 37 C54 31 46 31 42 37 C37 33 31 38 26 46 Z"
          fill={look.hairMain}
          stroke={look.hairStroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M38 28 C44 24 52 24 58 27"
          fill="none"
          stroke={look.hairHighlight}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    );
  };

  const renderClothing = () => (
    <g>
      {/* Neck */}
      <rect
        x="43"
        y="70"
        width="14"
        height="12"
        rx="5"
        fill={look.skinShadow}
      />
      {/* Shoulders base shirt */}
      <path
        d="M20 98 C22 82 34 78 50 78 C66 78 78 82 80 98 Z"
        fill={look.shirt}
        stroke="#2B2623"
        strokeWidth="2"
      />
      {look.hasScarf ? (
        /* Aday's warm ochre scarf */
        <g>
          <path
            d="M31 78 C39 86 61 86 69 78 C71 84 68 92 50 92 C32 92 29 84 31 78 Z"
            fill={look.vest}
            stroke={look.vestAccent}
            strokeWidth="1.8"
          />
          <path
            d="M37 84 C44 87 56 87 63 84"
            fill="none"
            stroke="#F3CF7A"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      ) : (
        /* Explorer vest / jacket lapels */
        <g>
          <path
            d="M22 98 C24 84 33 79 41 79 L44 98 Z"
            fill={look.vest}
            stroke={look.vestAccent}
            strokeWidth="1.8"
          />
          <path
            d="M78 98 C76 84 67 79 59 79 L56 98 Z"
            fill={look.vest}
            stroke={look.vestAccent}
            strokeWidth="1.8"
          />
        </g>
      )}
      {look.hasPendant && (
        /* Nayra's terracotta pintadera necklace */
        <g>
          <path
            d="M43 79 L50 90 L57 79"
            fill="none"
            stroke="#6E4427"
            strokeWidth="1.4"
          />
          <polygon
            points="50,87 54,91 50,95 46,91"
            fill="#C66B3D"
            stroke="#592C16"
            strokeWidth="1.2"
          />
        </g>
      )}
    </g>
  );

  const renderExpressionFeatures = () => {
    const browColor = look.hairStroke;
    const eyeDark = '#231A15';

    switch (reaction) {
      case 'alegria':
        return (
          <g>
            {/* Happy upturned crescent eyes */}
            <path
              d="M33 52 Q39 45 45 52"
              fill="none"
              stroke={eyeDark}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M55 52 Q61 45 67 52"
              fill="none"
              stroke={eyeDark}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            {/* Raised joyous eyebrows */}
            <path
              d="M33 43 Q39 39 45 42"
              fill="none"
              stroke={browColor}
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            <path
              d="M55 42 Q61 39 67 43"
              fill="none"
              stroke={browColor}
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            {/* Bright rosy cheeks */}
            <ellipse cx="33" cy="59" rx="5.5" ry="3.2" fill={look.cheek} opacity="0.58" />
            <ellipse cx="67" cy="59" rx="5.5" ry="3.2" fill={look.cheek} opacity="0.58" />
            {/* Big beaming open smile */}
            <path
              d="M39 62 Q50 74 61 62 Z"
              fill="#FFFFFF"
              stroke={eyeDark}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M42 66 Q50 71 58 66"
              fill="#D96B5C"
              opacity="0.7"
            />
          </g>
        );

      case 'sorpresa':
        return (
          <g>
            {/* High surprised eyebrows */}
            <path
              d="M33 41 Q39 36 45 40"
              fill="none"
              stroke={browColor}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M55 40 Q61 36 67 41"
              fill="none"
              stroke={browColor}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Wide sparkling eyes */}
            <circle cx="39" cy="51" r="5" fill="#FFFFFF" stroke={eyeDark} strokeWidth="1.8" />
            <circle cx="61" cy="51" r="5" fill="#FFFFFF" stroke={eyeDark} strokeWidth="1.8" />
            <circle cx="39.5" cy="51" r="3" fill={eyeDark} />
            <circle cx="61.5" cy="51" r="3" fill={eyeDark} />
            <circle cx="38" cy="49.3" r="1.3" fill="#FFFFFF" />
            <circle cx="60" cy="49.3" r="1.3" fill="#FFFFFF" />
            <circle cx="41" cy="52.5" r="0.7" fill="#FFFFFF" />
            <circle cx="63" cy="52.5" r="0.7" fill="#FFFFFF" />
            {/* Soft blush */}
            <ellipse cx="33" cy="59" rx="4.6" ry="2.8" fill={look.cheek} opacity="0.48" />
            <ellipse cx="67" cy="59" rx="4.6" ry="2.8" fill={look.cheek} opacity="0.48" />
            {/* Cute surprised "O" mouth */}
            <ellipse
              cx="50"
              cy="65.5"
              rx="4.3"
              ry="5"
              fill="#C95A4C"
              stroke={eyeDark}
              strokeWidth="2"
            />
            <ellipse cx="50" cy="67.5" rx="2.4" ry="1.8" fill="#E88D7F" />
          </g>
        );

      case 'concentrado':
        return (
          <g>
            {/* Focused slightly angled eyebrows */}
            <path
              d="M33 43 L45 45.5"
              fill="none"
              stroke={browColor}
              strokeWidth="2.3"
              strokeLinecap="round"
            />
            <path
              d="M67 43 L55 45.5"
              fill="none"
              stroke={browColor}
              strokeWidth="2.3"
              strokeLinecap="round"
            />
            {/* Attentive focused eyes */}
            <ellipse cx="39" cy="51.5" rx="4.2" ry="3.5" fill="#FFFFFF" stroke={eyeDark} strokeWidth="1.7" />
            <ellipse cx="61" cy="51.5" rx="4.2" ry="3.5" fill="#FFFFFF" stroke={eyeDark} strokeWidth="1.7" />
            <circle cx="40" cy="51.5" r="2.4" fill={eyeDark} />
            <circle cx="62" cy="51.5" r="2.4" fill={eyeDark} />
            <circle cx="39" cy="50.3" r="1" fill="#FFFFFF" />
            <circle cx="61" cy="50.3" r="1" fill="#FFFFFF" />
            {/* Light cheek */}
            <ellipse cx="34" cy="59" rx="4" ry="2.3" fill={look.cheek} opacity="0.34" />
            <ellipse cx="66" cy="59" rx="4" ry="2.3" fill={look.cheek} opacity="0.34" />
            {/* Focused thoughtful half-smile / pursed mouth */}
            <path
              d="M44 65 Q50 64 56 63"
              fill="none"
              stroke={eyeDark}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        );

      case 'animo':
        return (
          <g>
            {/* Empathetic tilted brows ("ups, casi") */}
            <path
              d="M33 45 Q39 41 45 42"
              fill="none"
              stroke={browColor}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M55 42 Q61 41 67 45"
              fill="none"
              stroke={browColor}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Determined squinted "oops" eyes (> <) */}
            <path
              d="M34 49 L43 52 L34 55"
              fill="none"
              stroke={eyeDark}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M66 49 L57 52 L66 55"
              fill="none"
              stroke={eyeDark}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Rosy blush */}
            <ellipse cx="33" cy="59" rx="4.6" ry="2.7" fill={look.cheek} opacity="0.45" />
            <ellipse cx="67" cy="59" rx="4.6" ry="2.7" fill={look.cheek} opacity="0.45" />
            {/* Friendly wavy "ups" mouth */}
            <path
              d="M42 65.5 Q46 62.5 50 65.5 Q54 68.5 58 65"
              fill="none"
              stroke={eyeDark}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        );

      case 'orgullo':
        return (
          <g>
            {/* Confident warm brows */}
            <path
              d="M33 43 Q39 39.5 45 42"
              fill="none"
              stroke={browColor}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M55 42 Q61 39.5 67 43"
              fill="none"
              stroke={browColor}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Shining proud eyes */}
            <circle cx="39" cy="51" r="4.4" fill="#FFFFFF" stroke={eyeDark} strokeWidth="1.8" />
            <circle cx="61" cy="51" r="4.4" fill="#FFFFFF" stroke={eyeDark} strokeWidth="1.8" />
            <circle cx="39" cy="51" r="2.7" fill={eyeDark} />
            <circle cx="61" cy="51" r="2.7" fill={eyeDark} />
            {/* Star catchlight */}
            <circle cx="37.8" cy="49.4" r="1.2" fill="#FFF4C2" />
            <circle cx="59.8" cy="49.4" r="1.2" fill="#FFF4C2" />
            <ellipse cx="33" cy="59" rx="5" ry="3" fill={look.cheek} opacity="0.52" />
            <ellipse cx="67" cy="59" rx="5" ry="3" fill={look.cheek} opacity="0.52" />
            {/* Confident wide grin */}
            <path
              d="M40 62.5 Q50 71 60 62.5"
              fill="none"
              stroke={eyeDark}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>
        );

      case 'curioso':
      default:
        return (
          <g>
            {/* Relaxed curious brows */}
            <path
              d="M33 43.5 Q39 40.5 45 43"
              fill="none"
              stroke={browColor}
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            <path
              d="M55 42 Q61 39 67 42.5"
              fill="none"
              stroke={browColor}
              strokeWidth="2.1"
              strokeLinecap="round"
            />
            {/* Bright eyes glancing slightly up-right */}
            <circle cx="39" cy="51.5" r="4.3" fill="#FFFFFF" stroke={eyeDark} strokeWidth="1.7" />
            <circle cx="61" cy="51.5" r="4.3" fill="#FFFFFF" stroke={eyeDark} strokeWidth="1.7" />
            <circle cx="40.3" cy="51" r="2.5" fill={eyeDark} />
            <circle cx="62.3" cy="51" r="2.5" fill={eyeDark} />
            <circle cx="39.2" cy="49.6" r="1.1" fill="#FFFFFF" />
            <circle cx="61.2" cy="49.6" r="1.1" fill="#FFFFFF" />
            {/* Subtle warm blush */}
            <ellipse cx="34" cy="59" rx="4.2" ry="2.5" fill={look.cheek} opacity="0.38" />
            <ellipse cx="66" cy="59" rx="4.2" ry="2.5" fill={look.cheek} opacity="0.38" />
            {/* Gentle hopeful smile */}
            <path
              d="M42 63.5 Q50 69 58 63.5"
              fill="none"
              stroke={eyeDark}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        );
    }
  };

  const renderReactionCue = () => {
    if (reaction === 'alegria' || reaction === 'orgullo') {
      return (
        <g aria-hidden="true">
          {/* Golden 4-point sparkles */}
          <path
            d="M15 17 L17 22 L22 24 L17 26 L15 31 L13 26 L8 24 L13 22 Z"
            fill="#E6A94F"
            stroke="#9C5A25"
            strokeWidth="0.8"
          />
          <path
            d="M85 13 L86.5 17 L90.5 18.5 L86.5 20 L85 24 L83.5 20 L79.5 18.5 L83.5 17 Z"
            fill="#52B788"
            stroke="#1D543A"
            strokeWidth="0.7"
          />
        </g>
      );
    }

    if (reaction === 'sorpresa') {
      return (
        <g aria-hidden="true">
          {/* Crisp comic exclamation burst */}
          <rect
            x="81"
            y="11"
            width="4.5"
            height="12"
            rx="2.2"
            fill="#D98E2B"
            stroke="#7A490C"
            strokeWidth="0.9"
          />
          <circle
            cx="83.25"
            cy="27"
            r="2.4"
            fill="#D98E2B"
            stroke="#7A490C"
            strokeWidth="0.9"
          />
          <path
            d="M13 20 L20 24 M11 28 L18 29"
            stroke="#D98E2B"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      );
    }

    if (reaction === 'concentrado') {
      return (
        <g aria-hidden="true">
          {/* Focused thought dots */}
          <circle cx="80" cy="24" r="2.2" fill="#4D88C8" />
          <circle cx="86" cy="18" r="3" fill="#1D4E89" />
          <circle cx="92" cy="12" r="2" fill="#8AB4E8" />
        </g>
      );
    }

    if (reaction === 'animo') {
      return (
        <g aria-hidden="true">
          {/* Comic sweatdrop */}
          <path
            d="M83 18 C83 18 89 26 89 30 C89 33.3 86.3 36 83 36 C79.7 36 77 33.3 77 30 C77 26 83 18 83 18 Z"
            fill="#7EC4EE"
            stroke="#1D4E89"
            strokeWidth="1.4"
          />
          <circle cx="81.2" cy="29.5" r="1.3" fill="#FFFFFF" opacity="0.85" />
        </g>
      );
    }

    return null;
  };

  return (
    <div
      key={`${explorerId}-${reaction}-${pulseKey}`}
      title={`${explorerName}: ${meta.label} — ${meta.shortStatus}`}
      aria-label={`${explorerName}, ${meta.ariaLabel}`}
      className={`relative shrink-0 overflow-hidden rounded-xl border-2 shadow-sm transition-colors duration-200 ${SIZE_CLASSES[size]} ${meta.frameBorderClass} ${meta.animationClass} ${className}`}
      style={{ backgroundColor: meta.bgTintHex }}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full block"
        role="img"
        aria-hidden="true"
      >
        {/* Warm archival parchment backdrop ring */}
        <circle
          cx="50"
          cy="54"
          r="43"
          fill="#FFFFFF"
          opacity="0.45"
        />

        {renderBackHair()}
        {renderClothing()}

        {/* Ears */}
        <circle
          cx="26"
          cy="53"
          r="5"
          fill={look.skinShadow}
          stroke="#4A3222"
          strokeWidth="1.5"
        />
        <circle
          cx="74"
          cy="53"
          r="5"
          fill={look.skinShadow}
          stroke="#4A3222"
          strokeWidth="1.5"
        />

        {/* Face shape */}
        <path
          d="M28 48 C28 31 38 25 50 25 C62 25 72 31 72 48 C72 64 62 74 50 74 C38 74 28 64 28 48 Z"
          fill={look.skin}
          stroke="#4A3222"
          strokeWidth="1.9"
        />

        {/* Subtle nose */}
        <path
          d="M49 55 Q50.5 58 52 57"
          fill="none"
          stroke="#9E6A4A"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Freckles */}
        {look.hasFreckles && (
          <g fill="#A86944" opacity="0.58">
            <circle cx="35" cy="57" r="0.9" />
            <circle cx="38" cy="58.5" r="0.9" />
            <circle cx="41" cy="57.2" r="0.8" />
            <circle cx="59" cy="57.2" r="0.8" />
            <circle cx="62" cy="58.5" r="0.9" />
            <circle cx="65" cy="57" r="0.9" />
          </g>
        )}

        {/* Dynamic Eyes, Brows & Mouth */}
        {renderExpressionFeatures()}

        {/* Sofia's round tortoiseshell glasses */}
        {look.hasGlasses && (
          <g
            fill="none"
            stroke="#59351E"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <circle cx="39" cy="51.5" r="7.4" fill="#FFFFFF" fillOpacity="0.14" />
            <circle cx="61" cy="51.5" r="7.4" fill="#FFFFFF" fillOpacity="0.14" />
            <path d="M46.4 51.5 L53.6 51.5" />
            <path d="M31.6 50.5 L27 49.5" />
            <path d="M68.4 50.5 L73 49.5" />
          </g>
        )}

        {renderFrontHair()}
        {renderReactionCue()}
      </svg>
    </div>
  );
};
