import {
  AtlasLayerId,
  CycleId,
  DuaSettings,
  ExpeditionState,
  ExplorerId,
  MetaVaultState,
  RoomId,
  RoomProgress,
  TeamTurnsState,
} from '../types/game';
import { ROOMS_DATA } from '../data/roomsData';
import { computeUnlockedBadges } from '../data/charactersAndBadges';
import { computeUnlockedHonorIds } from '../data/honorAchievements';
import type { AmbientVolumeLevel } from './ambientAudio';

export const STORAGE_KEY = 'ecos_tamaran_expedition_v2';

export const DEFAULT_DUA: DuaSettings = {
  dyslexiaFont: false,
  highContrast: false,
  voiceRate: 1.0,
  pictograms: false,
};

export const DEFAULT_TEAM_TURNS: TeamTurnsState = {
  enabled: false,
  autoRotate: true,
  rotationIndex: 0,
  memberNames: ['', '', '', ''],
};

export const DEFAULT_META_VAULT: MetaVaultState = {
  discoveredInscriptions: [],
  collectedFragments: [],
  solved: false,
};

export function createInitialRoomProgress(): RoomProgress {
  return {
    clueFound: false,
    puzzle1Solved: false,
    puzzle2Solved: false,
    empathySolved: false,
    doorUnlocked: false,
    transversalSolved: false,
    collectibleFound: false,
    shadowSolved: false,
    hintsUsed: {
      puzzle1: 0,
      puzzle2: 0,
    },
  };
}

export function createInitialState(
  cycle: CycleId = 'ciclo2',
  explorerId: ExplorerId = 'nayra',
  explorerName = '',
  muted = false,
  voiceAuto = false,
  dua: DuaSettings = DEFAULT_DUA,
  ambientEnabled = true,
  ambientVolume: AmbientVolumeLevel = 0.55,
  showEscapeTimer = true,
  teacherMode = false,
  teamTurns: TeamTurnsState = DEFAULT_TEAM_TURNS
): ExpeditionState {
  return {
    phase: 'TITLE_MENU',
    cycle,
    explorerId,
    explorerName,
    currentRoomIndex: 0,
    elapsedSeconds: 0,
    showEscapeTimer,
    muted,
    voiceAuto,
    ambientEnabled,
    ambientVolume,
    dua,
    progress: {
      aborigenes: createInitialRoomProgress(),
      conquista: createInitialRoomProgress(),
      pirateria: createInitialRoomProgress(),
      sigloXX: createInitialRoomProgress(),
    },
    journal: {},
    emotions: {},
    unlockedBadges: [],
    seenBadgeIds: [],
    unlockedHonorIds: [],
    seenHonorIds: [],
    seenTimeCapsuleRooms: [],
    explorersTried: [explorerId],
    solvedJigsawRooms: [],
    atlasLayersCompleted: [],
    timelineSolved: false,
    teacherMode,
    teamTurns: {
      ...DEFAULT_TEAM_TURNS,
      ...teamTurns,
      memberNames: [
        teamTurns.memberNames?.[0] ?? '',
        teamTurns.memberNames?.[1] ?? '',
        teamTurns.memberNames?.[2] ?? '',
        teamTurns.memberNames?.[3] ?? '',
      ],
    },
    metaVault: {
      discoveredInscriptions: [],
      collectedFragments: [],
      solved: false,
    },
  };
}

export function mergeRoomProgress(saved?: Partial<RoomProgress>): RoomProgress {
  const base = createInitialRoomProgress();
  if (!saved) return base;
  return {
    ...base,
    ...saved,
    hintsUsed: {
      ...base.hintsUsed,
      ...(saved.hintsUsed ?? {}),
    },
  };
}

/**
 * Determines whether a room is accessible under sequential Escape Room rules.
 * Room 1 (index 0) is always accessible. Subsequent rooms require opening the
 * previous room's exit lock, unless Modo Docente is enabled (or the room
 * already contains saved progress from an earlier session).
 */
export function isRoomAccessible(
  state: ExpeditionState,
  roomIndex: number
): boolean {
  if (roomIndex <= 0) return true;
  if (roomIndex >= ROOMS_DATA.length) return false;
  if (state.teacherMode) return true;
  if (roomIndex <= state.currentRoomIndex) return true;

  const targetRoom = ROOMS_DATA[roomIndex];
  const targetProgress = state.progress[targetRoom.id];
  if (
    targetProgress &&
    (targetProgress.clueFound ||
      targetProgress.puzzle1Solved ||
      targetProgress.puzzle2Solved ||
      targetProgress.empathySolved ||
      targetProgress.doorUnlocked)
  ) {
    return true;
  }

  const prevRoom = ROOMS_DATA[roomIndex - 1];
  return Boolean(prevRoom && state.progress[prevRoom.id]?.doorUnlocked);
}

export function loadSavedState(): ExpeditionState {
  if (typeof window === 'undefined') return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<ExpeditionState>;
    const validExplorer: ExplorerId =
      parsed.explorerId === 'aday' ||
      parsed.explorerId === 'sofia' ||
      parsed.explorerId === 'yeray'
        ? parsed.explorerId
        : 'nayra';

    const savedDua: DuaSettings = {
      dyslexiaFont: Boolean(parsed.dua?.dyslexiaFont),
      highContrast: Boolean(parsed.dua?.highContrast),
      voiceRate:
        parsed.dua?.voiceRate === 0.8 || parsed.dua?.voiceRate === 1.15
          ? parsed.dua.voiceRate
          : 1.0,
      pictograms: Boolean(parsed.dua?.pictograms),
    };

    const savedAmbientEnabled =
      typeof parsed.ambientEnabled === 'boolean' ? parsed.ambientEnabled : true;
    const savedAmbientVolume: AmbientVolumeLevel =
      parsed.ambientVolume === 0.28 || parsed.ambientVolume === 0.85
        ? parsed.ambientVolume
        : 0.55;

    const base = createInitialState(
      parsed.cycle === 'ciclo3' ? 'ciclo3' : 'ciclo2',
      validExplorer,
      typeof parsed.explorerName === 'string' ? parsed.explorerName : '',
      Boolean(parsed.muted),
      Boolean(parsed.voiceAuto),
      savedDua,
      savedAmbientEnabled,
      savedAmbientVolume,
      typeof parsed.showEscapeTimer === 'boolean'
        ? parsed.showEscapeTimer
        : true,
      Boolean(parsed.teacherMode)
    );

    const hydrated: ExpeditionState = {
      ...base,
      phase: 'TITLE_MENU',
      elapsedSeconds:
        typeof parsed.elapsedSeconds === 'number' && parsed.elapsedSeconds >= 0
          ? Math.floor(parsed.elapsedSeconds)
          : 0,
      currentRoomIndex:
        typeof parsed.currentRoomIndex === 'number' &&
        parsed.currentRoomIndex >= 0 &&
        parsed.currentRoomIndex < ROOMS_DATA.length
          ? parsed.currentRoomIndex
          : 0,
      progress: {
        aborigenes: mergeRoomProgress(parsed.progress?.aborigenes),
        conquista: mergeRoomProgress(parsed.progress?.conquista),
        pirateria: mergeRoomProgress(parsed.progress?.pirateria),
        sigloXX: mergeRoomProgress(parsed.progress?.sigloXX),
      },
      journal: parsed.journal ?? {},
      emotions: parsed.emotions ?? {},
      unlockedBadges: Array.isArray(parsed.unlockedBadges)
        ? parsed.unlockedBadges
        : [],
      seenBadgeIds: Array.isArray(parsed.seenBadgeIds)
        ? parsed.seenBadgeIds
        : [],
      unlockedHonorIds: Array.isArray(parsed.unlockedHonorIds)
        ? parsed.unlockedHonorIds
        : [],
      seenHonorIds: Array.isArray(parsed.seenHonorIds)
        ? parsed.seenHonorIds
        : [],
      seenTimeCapsuleRooms: Array.isArray(parsed.seenTimeCapsuleRooms)
        ? parsed.seenTimeCapsuleRooms
        : [],
      explorersTried:
        Array.isArray(parsed.explorersTried) && parsed.explorersTried.length > 0
          ? parsed.explorersTried
          : [validExplorer],
      solvedJigsawRooms: Array.isArray(parsed.solvedJigsawRooms)
        ? parsed.solvedJigsawRooms
        : [],
      atlasLayersCompleted: Array.isArray(parsed.atlasLayersCompleted)
        ? parsed.atlasLayersCompleted.filter(
            (l): l is AtlasLayerId =>
              l === 'relieve' ||
              l === 'ecosistemas' ||
              l === 'agua' ||
              l === 'patrimonio'
          )
        : [],
      timelineSolved: Boolean(parsed.timelineSolved),
      teacherMode: Boolean(parsed.teacherMode),
      teamTurns: {
        enabled: Boolean(parsed.teamTurns?.enabled),
        autoRotate:
          typeof parsed.teamTurns?.autoRotate === 'boolean'
            ? parsed.teamTurns.autoRotate
            : true,
        rotationIndex:
          typeof parsed.teamTurns?.rotationIndex === 'number' &&
          parsed.teamTurns.rotationIndex >= 0
            ? Math.floor(parsed.teamTurns.rotationIndex) % 4
            : 0,
        memberNames: [
          typeof parsed.teamTurns?.memberNames?.[0] === 'string'
            ? parsed.teamTurns.memberNames[0]
            : '',
          typeof parsed.teamTurns?.memberNames?.[1] === 'string'
            ? parsed.teamTurns.memberNames[1]
            : '',
          typeof parsed.teamTurns?.memberNames?.[2] === 'string'
            ? parsed.teamTurns.memberNames[2]
            : '',
          typeof parsed.teamTurns?.memberNames?.[3] === 'string'
            ? parsed.teamTurns.memberNames[3]
            : '',
        ],
      },
      metaVault: {
        discoveredInscriptions: Array.isArray(
          parsed.metaVault?.discoveredInscriptions
        )
          ? parsed.metaVault.discoveredInscriptions.filter(
              (id): id is string => typeof id === 'string'
            )
          : [],
        collectedFragments: Array.isArray(parsed.metaVault?.collectedFragments)
          ? parsed.metaVault.collectedFragments.filter(
              (r): r is RoomId =>
                r === 'aborigenes' ||
                r === 'conquista' ||
                r === 'pirateria' ||
                r === 'sigloXX'
            )
          : [],
        solved: Boolean(parsed.metaVault?.solved),
      },
    };

    return {
      ...hydrated,
      unlockedBadges: computeUnlockedBadges(hydrated),
      unlockedHonorIds: computeUnlockedHonorIds(hydrated),
    };
  } catch {
    return createInitialState();
  }
}

export function saveExpeditionState(state: ExpeditionState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in private mode
  }
}
