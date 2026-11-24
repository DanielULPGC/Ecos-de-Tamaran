import {
  CharacterReactionId,
  ExplorerId,
  RoomProgress,
} from '../types/game';

export interface CharacterReactionMeta {
  id: CharacterReactionId;
  label: string;
  shortStatus: string;
  frameBorderClass: string;
  bgTintHex: string;
  lightTextClass: string;
  darkTextClass: string;
  animationClass: string;
  ariaLabel: string;
}

export const CHARACTER_REACTION_META: Record<
  CharacterReactionId,
  CharacterReactionMeta
> = {
  curioso: {
    id: 'curioso',
    label: 'Curiosidad',
    shortStatus: 'Explorando la sala',
    frameBorderClass: 'border-[#E6A94F]/80',
    bgTintHex: '#FBF5E8',
    lightTextClass: 'text-[#8A5410]',
    darkTextClass: 'text-[#E6A94F]',
    animationClass: '',
    ariaLabel: 'Expresión de curiosidad mientras explora',
  },
  concentrado: {
    id: 'concentrado',
    label: 'Concentración',
    shortStatus: 'Analizando el reto',
    frameBorderClass: 'border-[#4D88C8]',
    bgTintHex: '#EAF2FB',
    lightTextClass: 'text-[#1D4E89]',
    darkTextClass: 'text-[#8AB4E8]',
    animationClass: 'reaction-focus-breathe',
    ariaLabel: 'Expresión de concentración resolviendo un enigma',
  },
  sorpresa: {
    id: 'sorpresa',
    label: '¡Sorpresa!',
    shortStatus: '¡Qué descubrimiento!',
    frameBorderClass: 'border-[#D98E2B]',
    bgTintHex: '#FDF2DC',
    lightTextClass: 'text-[#9C5A25]',
    darkTextClass: 'text-[#F3C876]',
    animationClass: 'reaction-surprise-pop',
    ariaLabel: 'Expresión de sorpresa ante un hallazgo o pista',
  },
  alegria: {
    id: 'alegria',
    label: '¡Alegría!',
    shortStatus: '¡Reto superado!',
    frameBorderClass: 'border-[#52B788]',
    bgTintHex: '#E5F5EC',
    lightTextClass: 'text-[#1D543A]',
    darkTextClass: 'text-[#74C69D]',
    animationClass: 'reaction-joy-bounce',
    ariaLabel: 'Expresión de alegría por un acierto',
  },
  animo: {
    id: 'animo',
    label: '¡Casi!',
    shortStatus: 'Probemos otra idea',
    frameBorderClass: 'border-[#C96B59]',
    bgTintHex: '#FCEEEB',
    lightTextClass: 'text-[#8E3528]',
    darkTextClass: 'text-[#F2A699]',
    animationClass: 'reaction-retry-wobble',
    ariaLabel: 'Expresión de ánimo tras un intento fallido',
  },
  orgullo: {
    id: 'orgullo',
    label: 'Orgullo',
    shortStatus: '¡Época dominada!',
    frameBorderClass: 'border-[#E6A94F]',
    bgTintHex: '#FAF0D7',
    lightTextClass: 'text-[#7A490C]',
    darkTextClass: 'text-[#F3C876]',
    animationClass: 'reaction-joy-bounce',
    ariaLabel: 'Expresión de orgullo por completar la sala',
  },
};

export function deriveRoomProgressReaction(
  progress: RoomProgress,
  isChallengeOpen: boolean
): CharacterReactionId {
  if (isChallengeOpen) return 'concentrado';

  const seals =
    Number(progress.puzzle1Solved) +
    Number(progress.puzzle2Solved) +
    Number(progress.empathySolved);

  if (seals === 3) return 'orgullo';

  if (
    seals > 0 ||
    progress.clueFound ||
    progress.shadowSolved ||
    progress.transversalSolved ||
    progress.collectibleFound
  ) {
    return 'concentrado';
  }

  return 'curioso';
}

const EXPLORER_REACTION_LINES: Record<
  ExplorerId,
  Record<CharacterReactionId, string>
> = {
  nayra: {
    curioso: '¡Mira bien cada rincón! Mi lupa ya detecta pistas antiguas.',
    concentrado: 'Observemos los detalles con calma… aquí hay una clave.',
    sorpresa: '¡Vaya hallazgo! Esto nos cuenta un secreto de Gran Canaria.',
    alegria: '¡Toma ya! Qué gran trabajo de investigación en equipo.',
    animo: '¡Casi lo tienes! Revisemos los detalles y volvamos a probar.',
    orgullo: '¡Sala completada con matrícula! Qué gran rastreadora eres.',
  },
  aday: {
    curioso: 'Escuchemos la historia de este lugar con mente abierta.',
    concentrado: 'Pensemos en cómo se sentían y qué ocurrió aquí.',
    sorpresa: '¡Guau! Qué detalle tan interesante acabamos de descubrir.',
    alegria: '¡Qué alegría! Con empatía e ingenio todo se consigue.',
    animo: 'No pasa nada por fallar: cada intento nos acerca a la solución.',
    orgullo: '¡Has iluminado esta época! Sigamos adelante con energía.',
  },
  sofia: {
    curioso: '¡Catalejo listo! Exploremos los puntos marcados en el mapa.',
    concentrado: 'Ajustemos el rumbo… un paso más y encajará perfecto.',
    sorpresa: '¡Tierra a la vista! Menudo descubrimiento acabas de hacer.',
    alegria: '¡Rumbo exacto! Lo has resuelto con precisión de navegante.',
    animo: '¡Un pequeño giro al timón! Probemos otra combinación.',
    orgullo: '¡Misión cumplida en esta escala! Listos para zarpar.',
  },
  yeray: {
    curioso: '¡Qué escenario tan chulo! Vamos a ver qué enigmas esconde.',
    concentrado: 'Manos a la obra: conectemos las piezas paso a paso.',
    sorpresa: '¡Chispa! Mira lo que acabamos de destapar.',
    alegria: '¡Encajó a la primera! Menuda chispa creativa tienes.',
    animo: '¡Uy, por poco! Ajustemos una pieza y lo volvemos a intentar.',
    orgullo: '¡Todo funcionando como un reloj! A por la siguiente época.',
  },
};

export function getExplorerReactionLine(
  explorerId: ExplorerId,
  reaction: CharacterReactionId
): string {
  return EXPLORER_REACTION_LINES[explorerId][reaction];
}
