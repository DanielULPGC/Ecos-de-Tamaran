export type CycleId = 'ciclo2' | 'ciclo3';

export type ExplorerId = 'nayra' | 'aday' | 'sofia' | 'yeray';

export type CharacterReactionId =
  | 'curioso'
  | 'concentrado'
  | 'sorpresa'
  | 'alegria'
  | 'animo'
  | 'orgullo';

export type BadgeId =
  | 'sello-aborigen'
  | 'sello-conquista'
  | 'sello-pirateria'
  | 'sello-sigloXX'
  | 'ojo-explorador'
  | 'corazon-empatico'
  | 'mente-critica'
  | 'guardian-tamaran'
  | 'agenda-2030'
  | 'tesoro-canario'
  | 'maestro-sombras'
  | 'explorador-natural'
  | 'cronista-tiempo'
  | 'restaurador-mural';

export type AtlasLayerId = 'relieve' | 'ecosistemas' | 'agua' | 'patrimonio';

export type AtlasModalTab =
  | 'mapa'
  | 'medio-natural'
  | 'linea-tiempo'
  | 'album';

export type SpecificCompetencyId =
  | 'CE2'
  | 'CE5'
  | 'CE6'
  | 'CE7'
  | 'CE8'
  | 'CE9';

export type HonorAchievementId =
  | 'detective-minucioso'
  | 'mente-autonoma'
  | 'cazador-canarismos'
  | 'poeta-peganotas'
  | 'brujula-interior'
  | 'semilla-2030'
  | 'cronista-tamaran'
  | 'escuadron-unido';

export type HonorAchievementCategory =
  | 'Observación'
  | 'Ingenio'
  | 'Patrimonio'
  | 'Reflexión'
  | 'EMOCREA'
  | 'Compromiso'
  | 'Escritura'
  | 'Colaboración';

export type HonorAchievementIconKey =
  | 'search'
  | 'brain'
  | 'gem'
  | 'sticky'
  | 'heart'
  | 'globe'
  | 'feather'
  | 'users';

export interface HonorAchievementDefinition {
  id: HonorAchievementId;
  title: string;
  description: string;
  hidden: boolean;
  mysteryHint: string;
  category: HonorAchievementCategory;
  iconKey: HonorAchievementIconKey;
  targetCount: number;
}

export type EmotionFaceKey =
  | 'preocupacion'
  | 'miedo'
  | 'anoranza'
  | 'enfado'
  | 'calma'
  | 'alegria'
  | 'indiferencia';

export type ThermometerMoodId =
  | 'curiosidad'
  | 'calma'
  | 'nervios'
  | 'alegria'
  | 'orgullo';

export interface RoomEmotionCheck {
  before?: ThermometerMoodId;
  after?: ThermometerMoodId;
}

export interface DuaSettings {
  dyslexiaFont: boolean;
  highContrast: boolean;
  voiceRate: 0.8 | 1.0 | 1.15;
  pictograms: boolean;
}

export interface TransversalMission {
  roomId: RoomId;
  axis: 'Coeducación e Igualdad' | 'Convivencia y Derechos' | 'Alfabetización Mediática' | 'Sostenibilidad · ODS';
  odsTag: string;
  title: string;
  story: Record<CycleId, string>;
  question: string;
  options: {
    id: string;
    label: string;
    isBest: boolean;
    feedback: string;
  }[];
  actionTip: string;
}

export interface CanarianCollectible {
  id: string;
  roomId: RoomId;
  word: string;
  secondaryWord: string;
  category: 'Fauna canaria' | 'Música y tradición' | 'Habla canaria' | 'Naturaleza';
  meaning: string;
  exampleSentence: string;
  culturalFact: string;
  hotspotX: number;
  hotspotY: number;
  iconKey: 'alpispa' | 'perenquen' | 'timple' | 'guagua';
}

export interface ExplorerAttributes {
  observacion: number;
  empatia: number;
  ingenio: number;
  trabajoEnEquipo: number;
}

export interface ExplorerDevelopmentMilestone {
  roomId: RoomId;
  stageLabel: string;
  growthNote: string;
}

export interface ExplorerDevelopmentSheet {
  age: string;
  origin: string;
  personalityTraits: string[];
  favoriteObject: string;
  favoritePlace: string;
  motto: string;
  bio: string;
  attributes: ExplorerAttributes;
  startingGoal: string;
  growthStrength: string;
  learningChallenge: string;
  competencyFocus: string;
  milestones: ExplorerDevelopmentMilestone[];
}

export interface ExplorerProfile {
  id: ExplorerId;
  name: string;
  role: string;
  powerName: string;
  powerShort: string;
  powerDetail: string;
  portraitPath: string;
  accentHex: string;
  greeting: string;
  cheerLines: string[];
  sheet: ExplorerDevelopmentSheet;
}

export interface BadgeDefinition {
  id: BadgeId;
  title: string;
  subtitle: string;
  kind: 'epoch' | 'attitude' | 'challenge';
  requirementDetail?: string;
}

export type GamePhase =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'ROOM_TRANSITION'
  | 'PAUSED'
  | 'VICTORY';

export type RoomId = 'aborigenes' | 'conquista' | 'pirateria' | 'sigloXX';

export type HotspotKind = 'clue' | 'puzzle1' | 'puzzle2' | 'empathy';

export interface RoomHotspot {
  id: string;
  kind: HotspotKind;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
}

export interface ClueContent {
  id: string;
  title: string;
  itemLabel: string;
  subtitle: string;
  text: Record<CycleId, string>;
  historicalNote: string;
}

export interface ProgressiveHints {
  level1: string;
  level2: string;
  level3: string;
}

export type PuzzleMechanic =
  | 'pattern-grid'
  | 'pair-match'
  | 'sequence-order'
  | 'fact-vs-bias'
  | 'compass-code'
  | 'suitcase-select'
  | 'water-flow';

export interface PatternGridPayload {
  kind: 'pattern-grid';
  gridSize: number;
  targetPattern: number[];
  referenceNote: string;
  rowClues: string[];
}

export interface PairMatchItem {
  id: string;
  left: string;
  right: string;
}

export interface PairMatchPayload {
  kind: 'pair-match';
  leftHeading: string;
  rightHeading: string;
  pairs: PairMatchItem[];
}

export interface SequenceItem {
  id: string;
  label: string;
  detail: string;
  order: number;
}

export interface SequenceOrderPayload {
  kind: 'sequence-order';
  items: SequenceItem[];
}

export interface FactBiasStatement {
  id: string;
  source: string;
  quote: string;
  category: 'hecho' | 'opinion';
  explanation: string;
}

export interface FactVsBiasPayload {
  kind: 'fact-vs-bias';
  statements: FactBiasStatement[];
}

export interface CompassCodePayload {
  kind: 'compass-code';
  directions: string[];
  correctDirection: string;
  signalOptions: { id: string; label: string; description: string }[];
  correctSignalId: string;
  watchtowerOptions: string[];
  correctWatchtower: string;
}

export interface SuitcaseItem {
  id: string;
  title: string;
  description: string;
  isHistorical: boolean;
  reason: string;
}

export interface SuitcaseSelectPayload {
  kind: 'suitcase-select';
  requiredCount: number;
  items: SuitcaseItem[];
}

export interface WaterNode {
  id: string;
  title: string;
  role: string;
  correctStep: number;
}

export interface WaterFlowPayload {
  kind: 'water-flow';
  nodes: WaterNode[];
}

export type PuzzlePayload =
  | PatternGridPayload
  | PairMatchPayload
  | SequenceOrderPayload
  | FactVsBiasPayload
  | CompassCodePayload
  | SuitcaseSelectPayload
  | WaterFlowPayload;

export interface PuzzleDefinition {
  id: string;
  sealTitle: string;
  title: string;
  intro: Record<CycleId, string>;
  mechanic: PuzzleMechanic;
  payload: Record<CycleId, PuzzlePayload>;
  hints: Record<CycleId, ProgressiveHints>;
  successMessage: string;
}

export interface CharacterVoice {
  name: string;
  role: string;
  quote: Record<CycleId, string>;
  feelingClue: string;
}

export interface EmotionChoice {
  id: string;
  shortLabel: string;
  label: string;
  description: string;
  face: EmotionFaceKey;
  isRecommended?: boolean;
}

export interface DilemmaOption {
  id: string;
  label: string;
  feedback: string;
}

export interface EmpathyDilemma {
  id: string;
  sealTitle: string;
  title: string;
  setting: string;
  voices: [CharacterVoice, CharacterVoice];
  emotionPrompt: string;
  emotionChoices: EmotionChoice[];
  criticalQuestion: Record<CycleId, string>;
  criticalChoices: {
    id: string;
    label: string;
    isBest: boolean;
    feedback: string;
  }[];
  criticalChoicesCiclo3?: {
    id: string;
    label: string;
    isBest: boolean;
    feedback: string;
  }[];
  decisionPrompt: string;
  decisionChoices: DilemmaOption[];
  reflectionPrompt: Record<CycleId, string>;
  guidedStarters: string[];
}

export interface RoomData {
  id: RoomId;
  number: number;
  epoch: string;
  years: string;
  title: string;
  location: string;
  mapZoneLabel: string;
  imagePath: string;
  fallbackGradient: string;
  arrivalNarrative: Record<CycleId, string>;
  transitionSummary: string;
  hotspots: RoomHotspot[];
  clue: ClueContent;
  puzzle1: PuzzleDefinition;
  puzzle2: PuzzleDefinition;
  empathy: EmpathyDilemma;
}

export type StickyNoteColor = 'ochre' | 'laurel' | 'sky' | 'coral';

export interface StickyNote {
  word: string;
  emoji: string;
  color: StickyNoteColor;
}

export interface JournalEntry {
  roomId: RoomId;
  roomTitle: string;
  epoch: string;
  emotionSelected: string;
  criticalTakeaway: string;
  decisionLabel: string;
  reflectionText: string;
  completedAt: string;
  stickyNote?: StickyNote;
}

export interface RoomProgress {
  clueFound: boolean;
  puzzle1Solved: boolean;
  puzzle2Solved: boolean;
  empathySolved: boolean;
  doorUnlocked: boolean;
  transversalSolved: boolean;
  collectibleFound: boolean;
  shadowSolved: boolean;
  hintsUsed: {
    puzzle1: number;
    puzzle2: number;
  };
}

export interface ExpeditionState {
  phase: GamePhase;
  cycle: CycleId;
  explorerId: ExplorerId;
  explorerName: string;
  currentRoomIndex: number;
  elapsedSeconds: number;
  showEscapeTimer: boolean;
  muted: boolean;
  voiceAuto: boolean;
  ambientEnabled: boolean;
  ambientVolume: 0.28 | 0.55 | 0.85;
  dua: DuaSettings;
  progress: Record<RoomId, RoomProgress>;
  journal: Partial<Record<RoomId, JournalEntry>>;
  emotions: Partial<Record<RoomId, RoomEmotionCheck>>;
  unlockedBadges: BadgeId[];
  seenBadgeIds: BadgeId[];
  unlockedHonorIds: HonorAchievementId[];
  seenHonorIds: HonorAchievementId[];
  seenTimeCapsuleRooms: RoomId[];
  explorersTried: ExplorerId[];
  solvedJigsawRooms: RoomId[];
  atlasLayersCompleted: AtlasLayerId[];
  timelineSolved: boolean;
  teacherMode: boolean;
}

export interface CodedEvaluationCriterion {
  code: string;
  ce: SpecificCompetencyId;
  text: string;
}

export interface SpecificCompetencyDefinition {
  id: SpecificCompetencyId;
  shortTitle: string;
  officialFocus: string;
  descriptors: string;
  blocks: string;
}

export interface CompetencyEvaluationResult {
  id: SpecificCompetencyId;
  shortTitle: string;
  descriptors: string;
  percentage: number;
  level: 'Iniciado' | 'En proceso' | 'Adquirido' | 'Avanzado';
  evidence: string;
}

export interface LearningSituationSession {
  number: number;
  title: string;
  duration: string;
  blocks: string;
  ces: SpecificCompetencyId[];
  activity: string;
}

export interface LearningSituationPlan {
  title: string;
  code: string;
  justification: string;
  finalProduct: string;
  cycleScope: string;
  duration: string;
  groupings: string[];
  duaMeasures: string[];
  assessmentInstruments: string[];
  sessions: LearningSituationSession[];
}

export interface TeacherRoomCurriculum {
  roomId: RoomId;
  roomTitle: string;
  epoch: string;
  competenciasEspecificas: SpecificCompetencyId[];
  saberesBloqueA: Record<CycleId, string[]>;
  saberesBloqueB: Record<CycleId, string[]>;
  saberesConocimientoMedio: Record<CycleId, string[]>;
  saberesEmocreaValores: Record<CycleId, string[]>;
  criteriosCodificados: Record<CycleId, CodedEvaluationCriterion[]>;
  criteriosEvaluacion: Record<CycleId, string[]>;
  competenciasClave: string[];
  preguntasAsamblea: string[];
}

export interface ScientificPrecisionNote {
  id: string;
  topic: string;
  roomRef: string;
  clarification: string;
}

export interface CompetencyRubricRow {
  id: string;
  dimension: string;
  competencies: string;
  iniciado: string;
  enProceso: string;
  adquirido: string;
  avanzado: string;
}
