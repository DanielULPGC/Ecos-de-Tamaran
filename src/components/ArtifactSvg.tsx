import React from 'react';
import { ArtifactIconKey } from '../data/shadowMatchData';

interface ArtifactSvgProps {
  artifactId: ArtifactIconKey;
  silhouette?: boolean;
  className?: string;
}

/**
 * Custom archival vector illustrations for the 16 Gran Canaria historical artifacts.
 * When `silhouette` is true, renders the exact same silhouette path in solid dark ink
 * so visual shape matching is 100% faithful and unmistakable.
 */
export const ArtifactSvg: React.FC<ArtifactSvgProps> = ({
  artifactId,
  silhouette = false,
  className = 'h-20 w-20',
}) => {
  const S = '#1F2630';
  const fill = (color: string) => (silhouette ? S : color);
  const stroke = (color: string) => (silhouette ? S : color);
  const detailOpacity = silhouette ? 0 : 1;

  switch (artifactId) {
    case 'vasija':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Two side handles */}
          <path
            d="M28 45 C14 45 14 63 29 63"
            fill="none"
            stroke={stroke('#8C4A27')}
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M72 45 C86 45 86 63 71 63"
            fill="none"
            stroke={stroke('#8C4A27')}
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Globular vessel body + flared rim */}
          <path
            d="M34 22 L66 22 L63 32 C76 41 80 60 72 76 C66 86 58 89 50 89 C42 89 34 86 28 76 C20 60 24 41 37 32 Z"
            fill={fill('#B55D35')}
            stroke={stroke('#5E2D16')}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Rim ellipse */}
          <ellipse
            cx="50"
            cy="22"
            rx="16"
            ry="4"
            fill={fill('#7D3B1D')}
            stroke={stroke('#5E2D16')}
            strokeWidth="2"
          />
          {/* Geometric canarii zig-zag motif (hidden in silhouette) */}
          <g opacity={detailOpacity}>
            <path
              d="M31 52 L38 45 L45 52 L52 45 L59 52 L66 45 L71 51"
              fill="none"
              stroke="#F6EAD7"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="28"
              y1="61"
              x2="72"
              y2="61"
              stroke="#5E2D16"
              strokeWidth="2"
            />
          </g>
        </svg>
      );

    case 'pintadera':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Top dorsal handle */}
          <path
            d="M42 30 L42 17 C42 13 58 13 58 17 L58 30 Z"
            fill={fill('#9E522B')}
            stroke={stroke('#592B14')}
            strokeWidth="2.5"
          />
          {/* Iconic triangular geometric stamp body */}
          <path
            d="M50 26 L86 82 C88 85 85 88 81 88 L19 88 C15 88 12 85 14 82 Z"
            fill={fill('#C67D1E')}
            stroke={stroke('#592B14')}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <g opacity={detailOpacity}>
            <polygon points="50,38 74,78 26,78" fill="#8C4A27" />
            <polygon points="50,48 64,73 36,73" fill="#F6EAD7" />
            <polygon points="50,58 56,70 44,70" fill="#A43D2F" />
          </g>
        </svg>
      );

    case 'molino':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Wooden turning peg rising on right */}
          <path
            d="M69 52 L75 18 C76 14 83 15 82 20 L76 54 Z"
            fill={fill('#8B5A2B')}
            stroke={stroke('#4A2D12')}
            strokeWidth="2.5"
          />
          {/* Bottom volcanic basalt stone */}
          <path
            d="M14 66 L86 66 L86 78 C86 84 70 89 50 89 C30 89 14 84 14 78 Z"
            fill={fill('#5A636E')}
            stroke={stroke('#2D333B')}
            strokeWidth="2.5"
          />
          {/* Top rotary stone */}
          <path
            d="M18 52 L82 52 L82 65 C82 70 68 75 50 75 C32 75 18 70 18 65 Z"
            fill={fill('#78828E')}
            stroke={stroke('#2D333B')}
            strokeWidth="2.5"
          />
          <ellipse
            cx="50"
            cy="52"
            rx="32"
            ry="11"
            fill={fill('#8E98A4')}
            stroke={stroke('#2D333B')}
            strokeWidth="2.5"
          />
          {/* Center grain hopper */}
          <g opacity={detailOpacity}>
            <ellipse cx="50" cy="52" rx="8" ry="3.5" fill="#3B424A" />
            <circle cx="34" cy="55" r="2" fill="#E6A94F" />
            <circle cx="40" cy="58" r="1.8" fill="#E6A94F" />
            <circle cx="62" cy="56" r="2" fill="#E6A94F" />
          </g>
        </svg>
      );

    case 'idolo':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Stylized Ídolo de Tara terracotta silhouette */}
          <path
            d="M50 12 C56 12 60 17 58 24 C57 27 56 30 58 32 C72 34 83 41 83 52 C83 61 76 66 68 68 C73 74 75 82 68 87 C61 91 53 88 50 85 C47 88 39 91 32 87 C25 82 27 74 32 68 C24 66 17 61 17 52 C17 41 28 34 42 32 C44 30 43 27 42 24 C40 17 44 12 50 12 Z"
            fill={fill('#C06C44')}
            stroke={stroke('#633018')}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <g opacity={detailOpacity}>
            <circle cx="46" cy="20" r="1.6" fill="#3E1E0F" />
            <circle cx="54" cy="20" r="1.6" fill="#3E1E0F" />
            <path
              d="M35 45 C42 50 58 50 65 45"
              fill="none"
              stroke="#F6EAD7"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M39 58 L61 58"
              stroke="#633018"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case 'carabela':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Main mast + sails */}
          <line
            x1="48"
            y1="14"
            x2="48"
            y2="66"
            stroke={stroke('#5C3A21')}
            strokeWidth="4"
          />
          {/* Main billowing square sail */}
          <path
            d="M31 24 C45 21 59 22 71 26 C67 39 67 49 71 58 C57 55 43 55 29 58 C34 47 34 36 31 24 Z"
            fill={fill('#F6EAD7')}
            stroke={stroke('#7A5638')}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Lateen stern sail */}
          <path
            d="M22 33 L30 58 L14 57 Z"
            fill={fill('#EAE0CE')}
            stroke={stroke('#7A5638')}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Pennant flag */}
          <path d="M48 14 L64 18 L48 22 Z" fill={fill('#A43D2F')} />
          {/* Wooden hull with high stern castle */}
          <path
            d="M12 56 L26 56 L30 64 L78 64 L88 57 L80 82 C66 87 34 87 20 82 Z"
            fill={fill('#7D4E2D')}
            stroke={stroke('#3D2414')}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <g opacity={detailOpacity}>
            <path d="M50 32 L50 48 M42 40 L58 40" stroke="#A43D2F" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="22" y1="72" x2="78" y2="72" stroke="#4D2E18" strokeWidth="2" />
          </g>
        </svg>
      );

    case 'pluma':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Feather quill rising diagonally */}
          <path
            d="M46 58 C49 41 61 21 84 12 C82 32 71 48 52 57 Z"
            fill={fill('#F5F3EE')}
            stroke={stroke('#526071')}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Inkwell bottle */}
          <path
            d="M32 52 L54 52 L54 59 L62 65 L62 86 C62 88 60 89 58 89 L28 89 C26 89 24 88 24 86 L24 65 L32 59 Z"
            fill={fill('#1D4E89')}
            stroke={stroke('#123055')}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <g opacity={detailOpacity}>
            <path d="M45 58 L78 18" stroke="#C67D1E" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="31" y="70" width="24" height="12" rx="2" fill="#F6EAD7" />
            <line x1="35" y1="76" x2="51" y2="76" stroke="#1D4E89" strokeWidth="2" />
          </g>
        </svg>
      );

    case 'pergamino':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Left & right scroll wooden ends */}
          <rect
            x="10"
            y="26"
            width="12"
            height="44"
            rx="5"
            fill={fill('#8B5A2B')}
            stroke={stroke('#4A2D12')}
            strokeWidth="2.5"
          />
          <rect
            x="78"
            y="26"
            width="12"
            height="44"
            rx="5"
            fill={fill('#8B5A2B')}
            stroke={stroke('#4A2D12')}
            strokeWidth="2.5"
          />
          {/* Rolled parchment sheet */}
          <rect
            x="20"
            y="29"
            width="60"
            height="38"
            rx="3"
            fill={fill('#F2E3C2')}
            stroke={stroke('#7D5C34')}
            strokeWidth="2.5"
          />
          {/* Hanging wax seal + ribbon */}
          <path
            d="M54 66 L50 88 L58 82 L66 88 L62 66 Z"
            fill={fill('#A43D2F')}
            stroke={stroke('#611F16')}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle
            cx="58"
            cy="66"
            r="9"
            fill={fill('#C0392B')}
            stroke={stroke('#611F16')}
            strokeWidth="2"
          />
          <g opacity={detailOpacity}>
            <line x1="29" y1="39" x2="70" y2="39" stroke="#6E5233" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="29" y1="48" x2="64" y2="48" stroke="#6E5233" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="29" y1="57" x2="46" y2="57" stroke="#6E5233" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        </svg>
      );

    case 'llave-real':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Ornate medieval wrought-iron key */}
          <path
            d="M50 12 C62 12 71 21 71 32 C71 40 65 47 57 50 L57 86 L44 86 L44 79 L32 79 L32 72 L44 72 L44 65 L35 65 L35 58 L44 58 L44 50 C35 47 29 40 29 32 C29 21 38 12 50 12 Z"
            fill={fill('#C67D1E')}
            stroke={stroke('#5E3808')}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle
            cx="50"
            cy="31"
            r="9"
            fill={silhouette ? '#F5F3EE' : '#F6EAD7'}
            stroke={stroke('#5E3808')}
            strokeWidth="2.5"
          />
          <g opacity={detailOpacity}>
            <line x1="50" y1="52" x2="50" y2="82" stroke="#7A4C0E" strokeWidth="2" />
          </g>
        </svg>
      );

    case 'sextante':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Sextant triangular frame + curved lower graduated arc */}
          <path
            d="M50 15 L83 68 C73 79 62 84 50 84 C38 84 27 79 17 68 Z"
            fill="none"
            stroke={stroke('#C67D1E')}
            strokeWidth="8"
            strokeLinejoin="round"
          />
          {/* Index arm extending from top pivot to bottom arc */}
          <line
            x1="50"
            y1="15"
            x2="63"
            y2="82"
            stroke={stroke('#8A5410')}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Sighting telescope tube */}
          <rect
            x="16"
            y="40"
            width="34"
            height="10"
            rx="3"
            transform="rotate(-14 33 45)"
            fill={fill('#1D4E89')}
            stroke={stroke('#102D52')}
            strokeWidth="2.2"
          />
          <circle
            cx="50"
            cy="18"
            r="7"
            fill={fill('#E6A94F')}
            stroke={stroke('#5E3808')}
            strokeWidth="2.2"
          />
          <g opacity={detailOpacity}>
            <path
              d="M25 69 C33 76 41 79 50 79 C59 79 67 76 75 69"
              fill="none"
              stroke="#5E3808"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
          </g>
        </svg>
      );

    case 'catalejo':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Telescoping diagonal brass spyglass */}
          <g transform="rotate(-34 50 50)">
            <rect
              x="10"
              y="43"
              width="24"
              height="14"
              rx="3"
              fill={fill('#C67D1E')}
              stroke={stroke('#5E3808')}
              strokeWidth="2.5"
            />
            <rect
              x="33"
              y="40"
              width="27"
              height="20"
              rx="3"
              fill={fill('#8B5A2B')}
              stroke={stroke('#4A2D12')}
              strokeWidth="2.5"
            />
            <rect
              x="59"
              y="37"
              width="31"
              height="26"
              rx="4"
              fill={fill('#D99B38')}
              stroke={stroke('#5E3808')}
              strokeWidth="2.5"
            />
            <g opacity={detailOpacity}>
              <rect x="84" y="39" width="4" height="22" rx="1" fill="#8AB4E8" />
              <line x1="38" y1="45" x2="55" y2="45" stroke="#F6EAD7" strokeWidth="2" opacity="0.5" />
            </g>
          </g>
        </svg>
      );

    case 'ancla':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Top ring */}
          <circle
            cx="50"
            cy="19"
            r="8"
            fill="none"
            stroke={stroke('#3A4452')}
            strokeWidth="5.5"
          />
          {/* Crossbar stock */}
          <rect
            x="28"
            y="30"
            width="44"
            height="8"
            rx="3"
            fill={fill('#7D4E2D')}
            stroke={stroke('#3D2414')}
            strokeWidth="2"
          />
          {/* Vertical shank */}
          <rect
            x="46"
            y="27"
            width="8"
            height="54"
            rx="3"
            fill={fill('#475364')}
          />
          {/* Curved anchor flukes */}
          <path
            d="M18 62 C21 80 35 88 50 88 C65 88 79 80 82 62"
            fill="none"
            stroke={stroke('#3A4452')}
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Arrow fluke tips */}
          <polygon points="14,66 20,52 27,65" fill={fill('#3A4452')} />
          <polygon points="86,66 80,52 73,65" fill={fill('#3A4452')} />
        </svg>
      );

    case 'campana':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Suspension arch */}
          <path
            d="M38 24 C38 13 62 13 62 24"
            fill="none"
            stroke={stroke('#5E3808')}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Bronze watchtower bell */}
          <path
            d="M50 22 C35 22 28 36 26 56 L17 75 L83 75 L74 56 C72 36 65 22 50 22 Z"
            fill={fill('#C67D1E')}
            stroke={stroke('#5E3808')}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Clapper */}
          <circle
            cx="50"
            cy="81"
            r="7"
            fill={fill('#6E420B')}
            stroke={stroke('#3E2405')}
            strokeWidth="2"
          />
          <g opacity={detailOpacity}>
            <line x1="24" y1="67" x2="76" y2="67" stroke="#F6EAD7" strokeWidth="2.5" opacity="0.7" />
            <path d="M40 33 C37 41 35 50 34 58" fill="none" stroke="#F6EAD7" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
          </g>
        </svg>
      );

    case 'maleta':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Top handle */}
          <path
            d="M38 30 L38 20 C38 17 62 17 62 20 L62 30"
            fill="none"
            stroke={stroke('#5C3A21')}
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Suitcase body */}
          <rect
            x="14"
            y="30"
            width="72"
            height="54"
            rx="8"
            fill={fill('#9C5A25')}
            stroke={stroke('#4D2B10')}
            strokeWidth="2.5"
          />
          {/* Details */}
          <g opacity={detailOpacity}>
            <rect x="28" y="30" width="8" height="54" fill="#6E3D16" />
            <rect x="64" y="30" width="8" height="54" fill="#6E3D16" />
            <rect x="27" y="51" width="10" height="7" rx="1.5" fill="#E6A94F" />
            <rect x="63" y="51" width="10" height="7" rx="1.5" fill="#E6A94F" />
            <rect
              x="41"
              y="46"
              width="18"
              height="12"
              rx="2"
              fill="#F6EAD7"
              stroke="#4D2B10"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      );

    case 'timple':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Diagonal iconic Canarian timple */}
          <g transform="rotate(38 50 50)">
            {/* Peghead */}
            <rect
              x="44"
              y="6"
              width="12"
              height="14"
              rx="3"
              fill={fill('#6E3D16')}
              stroke={stroke('#3D200A')}
              strokeWidth="2"
            />
            {/* Slender neck */}
            <rect
              x="46"
              y="19"
              width="8"
              height="31"
              fill={fill('#593012')}
            />
            {/* Narrow hourglass soundbox */}
            <path
              d="M50 47 C61 47 64 55 60 63 C58 66 59 68 62 72 C68 79 65 92 50 92 C35 92 32 79 38 72 C41 68 42 66 40 63 C36 55 39 47 50 47 Z"
              fill={fill('#C67D1E')}
              stroke={stroke('#5E3808')}
              strokeWidth="2.5"
            />
            <g opacity={detailOpacity}>
              <circle cx="50" cy="64" r="6" fill="#3D200A" stroke="#F6EAD7" strokeWidth="1.5" />
              <rect x="43" y="79" width="14" height="3.5" rx="1" fill="#3D200A" />
              <line x1="48" y1="20" x2="48" y2="79" stroke="#F6EAD7" strokeWidth="0.9" />
              <line x1="50" y1="20" x2="50" y2="79" stroke="#F6EAD7" strokeWidth="0.9" />
              <line x1="52" y1="20" x2="52" y2="79" stroke="#F6EAD7" strokeWidth="0.9" />
            </g>
          </g>
        </svg>
      );

    case 'vapor':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* Twin tilted steamship smokestacks */}
          <path
            d="M36 44 L41 21 L50 21 L46 44 Z"
            fill={fill('#A43D2F')}
            stroke={stroke('#5E1E15')}
            strokeWidth="2.2"
          />
          <path
            d="M54 44 L59 23 L67 23 L63 44 Z"
            fill={fill('#A43D2F')}
            stroke={stroke('#5E1E15')}
            strokeWidth="2.2"
          />
          {/* White superstructure cabin */}
          <path
            d="M24 58 L28 44 L74 44 L78 58 Z"
            fill={fill('#F5F3EE')}
            stroke={stroke('#3A4452')}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Deep steel transatlantic hull */}
          <path
            d="M10 56 L90 56 L82 78 C72 82 28 82 18 78 Z"
            fill={fill('#232A34')}
            stroke={stroke('#10141A')}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <g opacity={detailOpacity}>
            <rect x="33" y="48" width="6" height="5" rx="1" fill="#1D4E89" />
            <rect x="44" y="48" width="6" height="5" rx="1" fill="#1D4E89" />
            <rect x="55" y="48" width="6" height="5" rx="1" fill="#1D4E89" />
            <line x1="16" y1="71" x2="84" y2="71" stroke="#C67D1E" strokeWidth="3" />
          </g>
        </svg>
      );

    case 'cantaro':
      return (
        <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
          {/* High arched pouring handle on right */}
          <path
            d="M59 27 C82 24 85 56 68 67"
            fill="none"
            stroke={stroke('#9C4E2B')}
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          {/* Flared lip, slender neck, wide terracotta belly */}
          <path
            d="M36 16 L60 16 L56 26 L56 36 C70 44 74 62 68 77 C63 86 56 89 48 89 C40 89 33 86 28 77 C22 62 26 44 40 36 L40 26 Z"
            fill={fill('#C06439')}
            stroke={stroke('#5E2D16')}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <g opacity={detailOpacity}>
            <path
              d="M30 57 C39 61 57 61 66 57"
              fill="none"
              stroke="#1D4E89"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M32 67 C40 70 56 70 64 67"
              fill="none"
              stroke="#F6EAD7"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );
  }
};
