import { CycleId } from '../types/game';

export interface DifficultyProfile {
  cycle: CycleId;
  levelName: string;
  shortTag: string;
  cycleLabel: string;
  gradesLabel: string;
  shadowPiecesCount: 3 | 4;
  shadowShowCardCue: boolean;
  maxPuzzleHints: 2 | 3;
  clueLengthLabel: string;
  exitLockOptionsPerDial: 3 | 4;
  jigsawDefaultLabel: string;
  summaryPoints: string[];
}

export const DIFFICULTY_PROFILES: Record<CycleId, DifficultyProfile> = {
  ciclo2: {
    cycle: 'ciclo2',
    levelName: 'Nivel Explorador',
    shortTag: 'Guiado',
    cycleLabel: '2.º Ciclo',
    gradesLabel: '3.º y 4.º Primaria',
    shadowPiecesCount: 3,
    shadowShowCardCue: true,
    maxPuzzleHints: 3,
    clueLengthLabel: 'Pistas breves y directas',
    exitLockOptionsPerDial: 3,
    jigsawDefaultLabel: '6 piezas (3×2)',
    summaryPoints: [
      'Puzle de sombras: 3 piezas con pista visual en cada silueta',
      'Pistas breves de lectura ágil y hasta 3 niveles de ayuda',
      'Enigmas 3×3 y cerrojo de salida con 3 opciones por cilindro',
    ],
  },
  ciclo3: {
    cycle: 'ciclo3',
    levelName: 'Nivel Investigador',
    shortTag: 'Desafío',
    cycleLabel: '3.º Ciclo',
    gradesLabel: '5.º y 6.º Primaria',
    shadowPiecesCount: 4,
    shadowShowCardCue: false,
    maxPuzzleHints: 2,
    clueLengthLabel: 'Pistas extensas con datos históricos',
    exitLockOptionsPerDial: 4,
    jigsawDefaultLabel: '9 piezas (3×3)',
    summaryPoints: [
      'Puzle de sombras: 4 piezas de observación pura sin pista fija',
      'Pistas más extensas con fechas reales y máximo 2 ayudas analíticas',
      'Enigmas 4×4 y cerrojo de salida con 4 opciones por cilindro',
    ],
  },
};

export function getDifficultyProfile(cycle: CycleId): DifficultyProfile {
  return DIFFICULTY_PROFILES[cycle];
}
