import {
  ExpeditionState,
  HonorAchievementDefinition,
  HonorAchievementId,
  RoomId,
} from '../types/game';

const ALL_ROOMS: RoomId[] = ['aborigenes', 'conquista', 'pirateria', 'sigloXX'];

export const HONOR_ACHIEVEMENTS: HonorAchievementDefinition[] = [
  {
    id: 'detective-minucioso',
    title: 'Mirada minuciosa',
    description:
      'Encuentra los 4 hallazgos arqueológicos e históricos escondidos en todas las salas de Gran Canaria.',
    hidden: false,
    mysteryHint: 'Explora cada rincón antes de resolver los enigmas.',
    category: 'Observación',
    iconKey: 'search',
    targetCount: 4,
  },
  {
    id: 'mente-autonoma',
    title: 'Mente autónoma',
    description:
      'Resuelve al menos 3 enigmas completos sin necesidad de abrir ninguna pista de ayuda.',
    hidden: false,
    mysteryHint: 'Confía en tu ingenio para superar varios enigmas sin pistas.',
    category: 'Ingenio',
    iconKey: 'brain',
    targetCount: 3,
  },
  {
    id: 'cazador-canarismos',
    title: 'Rastreo de canarismos',
    description:
      'Descubre los 4 tesoros del habla, la fauna y la cultura canaria ocultos en los escenarios.',
    hidden: true,
    mysteryHint:
      'Algo muy nuestro se esconde fuera de las pistas principales en cada época…',
    category: 'Patrimonio',
    iconKey: 'gem',
    targetCount: 4,
  },
  {
    id: 'poeta-peganotas',
    title: 'Arte de pega-notas',
    description:
      'Resume tu aprendizaje con una palabra y un emoji usando pega-notas en al menos 2 entradas del Diario.',
    hidden: true,
    mysteryHint:
      'Abre tu Diario y condensa lo que sentiste en una sola palabra con emoción…',
    category: 'Reflexión',
    iconKey: 'sticky',
    targetCount: 2,
  },
  {
    id: 'brujula-interior',
    title: 'Brújula interior',
    description:
      'Registra tu estado emocional antes y después en el Termómetro EMOCREA de al menos 2 salas.',
    hidden: true,
    mysteryHint:
      'Escucha cómo cambian tus emociones al empezar y al terminar dos épocas…',
    category: 'EMOCREA',
    iconKey: 'heart',
    targetCount: 2,
  },
  {
    id: 'semilla-2030',
    title: 'Semilla 2030',
    description:
      'Completa las 4 Misiones Transversales de la Agenda Canaria 2030 conectando pasado y futuro.',
    hidden: false,
    mysteryHint: 'Supera todas las misiones de la Agenda Canaria 2030.',
    category: 'Compromiso',
    iconKey: 'globe',
    targetCount: 4,
  },
  {
    id: 'cronista-tamaran',
    title: 'Crónica de Gran Canaria',
    description:
      'Redacta reflexiones personales detalladas (más de 40 caracteres) en al menos 2 páginas de tu Diario.',
    hidden: false,
    mysteryHint: 'Escribe con tus propias palabras en el Diario de Reflexión.',
    category: 'Escritura',
    iconKey: 'feather',
    targetCount: 2,
  },
  {
    id: 'escuadron-unido',
    title: 'Escuadrón unido',
    description:
      'Combina los talentos del equipo probando al menos 2 exploradores distintos durante tu expedición.',
    hidden: true,
    mysteryHint:
      'Cada integrante del equipo guarda un talento distinto. Prueba a cambiar de guía…',
    category: 'Colaboración',
    iconKey: 'users',
    targetCount: 2,
  },
];

export interface HonorEvaluation {
  unlocked: boolean;
  current: number;
  target: number;
  progressPct: number;
}

export function evaluateHonorAchievement(
  def: HonorAchievementDefinition,
  state: ExpeditionState
): HonorEvaluation {
  let current = 0;

  switch (def.id) {
    case 'detective-minucioso':
      current = ALL_ROOMS.filter((id) => state.progress[id].clueFound).length;
      break;
    case 'mente-autonoma':
      current = ALL_ROOMS.reduce((acc, id) => {
        const p = state.progress[id];
        let count = 0;
        if (p.puzzle1Solved && p.hintsUsed.puzzle1 === 0) count += 1;
        if (p.puzzle2Solved && p.hintsUsed.puzzle2 === 0) count += 1;
        return acc + count;
      }, 0);
      break;
    case 'cazador-canarismos':
      current = ALL_ROOMS.filter(
        (id) => state.progress[id].collectibleFound
      ).length;
      break;
    case 'poeta-peganotas':
      current = ALL_ROOMS.filter((id) => {
        const note = state.journal[id]?.stickyNote;
        return Boolean(note && note.word.trim().length > 0);
      }).length;
      break;
    case 'brujula-interior':
      current = ALL_ROOMS.filter((id) => {
        const check = state.emotions[id];
        return Boolean(check?.before && check?.after);
      }).length;
      break;
    case 'semilla-2030':
      current = ALL_ROOMS.filter(
        (id) => state.progress[id].transversalSolved
      ).length;
      break;
    case 'cronista-tamaran':
      current = ALL_ROOMS.filter((id) => {
        const text = state.journal[id]?.reflectionText?.trim() ?? '';
        return text.length >= 40;
      }).length;
      break;
    case 'escuadron-unido':
      current = Math.max(1, state.explorersTried?.length ?? 1);
      break;
  }

  const clamped = Math.min(current, def.targetCount);
  const alreadyUnlocked = state.unlockedHonorIds.includes(def.id);
  const unlocked = alreadyUnlocked || current >= def.targetCount;

  return {
    unlocked,
    current: unlocked ? def.targetCount : clamped,
    target: def.targetCount,
    progressPct: unlocked
      ? 100
      : Math.round((clamped / def.targetCount) * 100),
  };
}

export function computeUnlockedHonorIds(
  state: ExpeditionState
): HonorAchievementId[] {
  const earned = new Set<HonorAchievementId>(state.unlockedHonorIds);
  for (const def of HONOR_ACHIEVEMENTS) {
    const evalResult = evaluateHonorAchievement(def, state);
    if (evalResult.unlocked) {
      earned.add(def.id);
    }
  }
  return Array.from(earned);
}

export function getHonorById(
  id: HonorAchievementId
): HonorAchievementDefinition | undefined {
  return HONOR_ACHIEVEMENTS.find((item) => item.id === id);
}
