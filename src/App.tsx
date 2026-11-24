import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { initClassroomAuth } from './utils/googleClassroomAuth';
import type { ClassroomLaunchMode } from './components/GoogleClassroomModal';
import {
  AtlasLayerId,
  AtlasModalTab,
  BadgeDefinition,
  CharacterReactionId,
  CycleId,
  DuaSettings,
  ExpeditionState,
  ExplorerId,
  HonorAchievementDefinition,
  HonorAchievementId,
  JournalEntry,
  RoomHotspot,
  RoomId,
  RoomProgress,
  StickyNote,
  ThermometerMoodId,
} from './types/game';
import { ROOMS_DATA } from './data/roomsData';
import {
  BADGES,
  computeUnlockedBadges,
  getExplorerById,
} from './data/charactersAndBadges';
import {
  computeUnlockedHonorIds,
  getHonorById,
} from './data/honorAchievements';
import {
  CANARIAN_COLLECTIBLES,
  TRANSVERSAL_MISSIONS,
} from './data/enrichmentData';
import {
  deriveRoomProgressReaction,
  getExplorerReactionLine,
} from './data/characterReactions';
import { soundEngine } from './utils/audio';
import {
  setSpeechActivityListener,
  setSpeechRate,
  speakText,
  stopSpeaking,
} from './utils/speech';
import { ambientAudio, AmbientVolumeLevel } from './utils/ambientAudio';
import { TitleScreen } from './components/TitleScreen';
import { RoomStage } from './components/RoomStage';
import { ClueModal } from './components/ClueModal';
import { PuzzleModal } from './components/PuzzleModal';
import { EmpathyModal } from './components/EmpathyModal';
import { JournalModal } from './components/JournalModal';
import { IslandMapModal } from './components/IslandMapModal';
import { PauseModal } from './components/PauseModal';
import { RoomTransition } from './components/RoomTransition';
import { VictoryScreen } from './components/VictoryScreen';
import { CelebrationOverlay } from './components/CelebrationOverlay';
import { TransversalModal } from './components/TransversalModal';
import { CollectibleModal } from './components/CollectibleModal';
import { AssemblyModal } from './components/AssemblyModal';
import { DuaPanelModal } from './components/DuaPanelModal';
import { ThermometerModal } from './components/ThermometerModal';
import { RoomExitLockModal } from './components/RoomExitLockModal';
import { MissionActionTarget } from './data/missionLogData';
import { ShadowMatchModal } from './components/ShadowMatchModal';
import { SHADOW_CHALLENGES } from './data/shadowMatchData';
import {
  evaluateTimeCapsuleProgress,
  getTimeCapsuleByRoom,
  getUnlockedTimeCapsuleRoomIds,
} from './data/timeCapsules';

const TeacherGuideModal = lazy(() =>
  import('./components/TeacherGuideModal').then((m) => ({
    default: m.TeacherGuideModal,
  }))
);
const ConquestsAlbumModal = lazy(() =>
  import('./components/ConquestsAlbumModal').then((m) => ({
    default: m.ConquestsAlbumModal,
  }))
);
const AudiobookModal = lazy(() =>
  import('./components/AudiobookModal').then((m) => ({
    default: m.AudiobookModal,
  }))
);
const MissionLogModal = lazy(() =>
  import('./components/MissionLogModal').then((m) => ({
    default: m.MissionLogModal,
  }))
);
const PicturePuzzleModal = lazy(() =>
  import('./components/PicturePuzzleModal').then((m) => ({
    default: m.PicturePuzzleModal,
  }))
);
const HistoricalGlossaryModal = lazy(() =>
  import('./components/HistoricalGlossaryModal').then((m) => ({
    default: m.HistoricalGlossaryModal,
  }))
);
const CharacterSheetModal = lazy(() =>
  import('./components/CharacterSheetModal').then((m) => ({
    default: m.CharacterSheetModal,
  }))
);
const TimeCapsuleViewerModal = lazy(() =>
  import('./components/TimeCapsuleViewerModal').then((m) => ({
    default: m.TimeCapsuleViewerModal,
  }))
);
const ExplorerAchievementsModal = lazy(() =>
  import('./components/ExplorerAchievementsModal').then((m) => ({
    default: m.ExplorerAchievementsModal,
  }))
);
const GoogleClassroomModal = lazy(() =>
  import('./components/GoogleClassroomModal').then((m) => ({
    default: m.GoogleClassroomModal,
  }))
);

const STORAGE_KEY = 'ecos_tamaran_expedition_v2';

const DEFAULT_DUA: DuaSettings = {
  dyslexiaFont: false,
  highContrast: false,
  voiceRate: 1.0,
  pictograms: false,
};

function createInitialRoomProgress(): RoomProgress {
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

function createInitialState(
  cycle: CycleId = 'ciclo2',
  explorerId: ExplorerId = 'nayra',
  explorerName = '',
  muted = false,
  voiceAuto = false,
  dua: DuaSettings = DEFAULT_DUA,
  ambientEnabled = true,
  ambientVolume: AmbientVolumeLevel = 0.55,
  showEscapeTimer = true
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
  };
}

function mergeRoomProgress(saved?: Partial<RoomProgress>): RoomProgress {
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

function loadSavedState(): ExpeditionState {
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
      typeof parsed.showEscapeTimer === 'boolean' ? parsed.showEscapeTimer : true
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
    };
    return {
      ...hydrated,
      unlockedHonorIds: computeUnlockedHonorIds(hydrated),
    };
  } catch {
    return createInitialState();
  }
}

type ActiveModal =
  | null
  | { type: 'clue' }
  | { type: 'puzzle1' }
  | { type: 'puzzle2' }
  | { type: 'empathy' }
  | { type: 'transversal' }
  | { type: 'collectible' }
  | { type: 'assembly' }
  | { type: 'dua' }
  | { type: 'thermometer'; moment: 'before' | 'after' }
  | { type: 'map'; initialTab?: AtlasModalTab }
  | { type: 'missions' }
  | { type: 'jigsaw' }
  | { type: 'shadow' }
  | { type: 'conquests' }
  | { type: 'audiobook' }
  | { type: 'journal' }
  | { type: 'historicalGlossary'; returnToJournal?: boolean }
  | { type: 'characterSheet' }
  | { type: 'timeCapsule'; roomId: RoomId; isNew?: boolean }
  | { type: 'explorerAchievements' }
  | { type: 'exitLock' }
  | { type: 'classroom'; defaultMode?: ClassroomLaunchMode }
  | { type: 'teacher' };

export default function App() {
  const [state, setState] = useState<ExpeditionState>(() => loadSavedState());
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [companionOverride, setCompanionOverride] = useState<string | null>(
    null
  );
  const [celebration, setCelebration] = useState<{
    key: number;
    headline: string | null;
    badge: BadgeDefinition | null;
    honorAchievement: HonorAchievementDefinition | null;
  }>({ key: 0, headline: null, badge: null, honorAchievement: null });
  const celebrationTimerRef = useRef<number | null>(null);
  const [transientReaction, setTransientReaction] = useState<{
    reaction: CharacterReactionId;
    pulseKey: number;
  } | null>(null);
  const [hoverReaction, setHoverReaction] =
    useState<CharacterReactionId | null>(null);
  const reactionTimerRef = useRef<number | null>(null);
  const [classroomUser, setClassroomUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = initClassroomAuth(
      (user) => setClassroomUser(user),
      () => setClassroomUser(null)
    );
    return () => unsubscribe();
  }, []);

  const explorer = getExplorerById(state.explorerId);
  const currentRoom = ROOMS_DATA[state.currentRoomIndex] ?? ROOMS_DATA[0];
  const currentProgress = state.progress[currentRoom.id];

  const triggerCharacterReaction = useCallback(
    (reaction: CharacterReactionId, line?: string) => {
      if (reactionTimerRef.current) {
        window.clearTimeout(reactionTimerRef.current);
      }
      setTransientReaction((prev) => ({
        reaction,
        pulseKey: (prev?.pulseKey ?? 0) + 1,
      }));
      if (line) {
        setCompanionOverride(line);
      }
      const duration =
        reaction === 'alegria' || reaction === 'orgullo' ? 4800 : 3800;
      reactionTimerRef.current = window.setTimeout(() => {
        setTransientReaction(null);
      }, duration);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (reactionTimerRef.current) {
        window.clearTimeout(reactionTimerRef.current);
      }
    };
  }, []);

  const isChallengeModalOpen =
    activeModal?.type === 'puzzle1' ||
    activeModal?.type === 'puzzle2' ||
    activeModal?.type === 'shadow' ||
    activeModal?.type === 'jigsaw' ||
    activeModal?.type === 'transversal' ||
    activeModal?.type === 'empathy' ||
    activeModal?.type === 'exitLock';

  const progressDerivedReaction = useMemo(
    () => deriveRoomProgressReaction(currentProgress, isChallengeModalOpen),
    [currentProgress, isChallengeModalOpen]
  );

  const activeCharacterReaction: CharacterReactionId =
    transientReaction?.reaction ?? hoverReaction ?? progressDerivedReaction;

  const activeReactionPulseKey = transientReaction?.pulseKey ?? 0;

  const handleTapCompanionAvatar = useCallback(() => {
    soundEngine.playClick();
    const cycleOrder: CharacterReactionId[] = [
      'alegria',
      'sorpresa',
      'concentrado',
      'orgullo',
    ];
    const currentIdx = cycleOrder.indexOf(activeCharacterReaction);
    const nextReaction = cycleOrder[(currentIdx + 1) % cycleOrder.length];
    triggerCharacterReaction(
      nextReaction,
      getExplorerReactionLine(state.explorerId, nextReaction)
    );
  }, [activeCharacterReaction, state.explorerId, triggerCharacterReaction]);

  const triggerCelebration = useCallback(
    (
      headline: string,
      badge: BadgeDefinition | null = null,
      honorAchievement: HonorAchievementDefinition | null = null
    ) => {
      if (celebrationTimerRef.current) {
        window.clearTimeout(celebrationTimerRef.current);
      }
      setCelebration((prev) => ({
        key: prev.key + 1,
        headline,
        badge,
        honorAchievement,
      }));
      celebrationTimerRef.current = window.setTimeout(() => {
        setCelebration((prev) => ({
          ...prev,
          headline: null,
          badge: null,
          honorAchievement: null,
        }));
      }, 3200);
    },
    []
  );

  useEffect(() => {
    setSpeechActivityListener((speaking) => {
      ambientAudio.setDucked(speaking);
    });

    const unlockAmbient = () => {
      ambientAudio.unlock();
    };
    window.addEventListener('pointerdown', unlockAmbient, { once: true });
    window.addEventListener('keydown', unlockAmbient, { once: true });

    return () => {
      if (celebrationTimerRef.current) {
        window.clearTimeout(celebrationTimerRef.current);
      }
      window.removeEventListener('pointerdown', unlockAmbient);
      window.removeEventListener('keydown', unlockAmbient);
      setSpeechActivityListener(null);
      ambientAudio.setRoom(null);
      stopSpeaking();
    };
  }, []);

  // Sync mute preference with Web Audio, Ambient Soundscapes & Web Speech
  useEffect(() => {
    soundEngine.setMuted(state.muted);
    ambientAudio.setMuted(state.muted);
    if (state.muted) {
      stopSpeaking();
    }
  }, [state.muted]);

  // Sync dynamic room-based ambient soundscape engine
  useEffect(() => {
    ambientAudio.setEnabled(state.ambientEnabled);
    ambientAudio.setVolume(state.ambientVolume);
    const inHistoricalRoom =
      state.phase === 'PLAYING' ||
      state.phase === 'ROOM_TRANSITION' ||
      state.phase === 'PAUSED';
    const audiobookOpen = activeModal?.type === 'audiobook';
    ambientAudio.setRoom(
      inHistoricalRoom && !audiobookOpen ? currentRoom.id : null
    );
  }, [
    state.phase,
    state.ambientEnabled,
    state.ambientVolume,
    currentRoom.id,
    activeModal,
  ]);

  // Sync DUA voice speed preference
  useEffect(() => {
    setSpeechRate(state.dua.voiceRate);
  }, [state.dua.voiceRate]);

  // Auto-read short arrival cue when entering a room if voiceAuto is enabled
  useEffect(() => {
    setCompanionOverride(null);
    if (state.phase === 'PLAYING' && state.voiceAuto && !activeModal) {
      speakText(currentRoom.arrivalNarrative[state.cycle], state.muted);
    }
  }, [
    state.phase,
    state.currentRoomIndex,
    state.cycle,
    state.voiceAuto,
    state.muted,
    currentRoom,
    activeModal,
  ]);

  // Friendly non-punishing Escape Room elapsed timer (runs only while actively playing)
  useEffect(() => {
    if (state.phase !== 'PLAYING') return;
    const id = window.setInterval(() => {
      setState((prev) =>
        prev.phase === 'PLAYING'
          ? { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }
          : prev
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.phase]);

  // Persist expedition state automatically to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [state]);

  const hasSavedProgress = useMemo(() => {
    return ROOMS_DATA.some((room) => {
      const p = state.progress[room.id];
      return (
        p.clueFound || p.puzzle1Solved || p.puzzle2Solved || p.empathySolved
      );
    });
  }, [state.progress]);

  const handleStart = useCallback(() => {
    stopSpeaking();
    ambientAudio.unlock();
    soundEngine.playDoorOpen();
    setState((prev) => ({ ...prev, phase: 'PLAYING' }));
  }, []);

  const handleResetAndStart = useCallback(() => {
    stopSpeaking();
    ambientAudio.unlock();
    soundEngine.playDoorOpen();
    setActiveModal(null);
    setState((prev) => ({
      ...createInitialState(
        prev.cycle,
        prev.explorerId,
        prev.explorerName,
        prev.muted,
        prev.voiceAuto,
        prev.dua,
        prev.ambientEnabled,
        prev.ambientVolume,
        prev.showEscapeTimer
      ),
      phase: 'PLAYING',
    }));
  }, []);

  const handleResetToTitle = useCallback(() => {
    stopSpeaking();
    soundEngine.playClick();
    setActiveModal(null);
    setState((prev) =>
      createInitialState(
        prev.cycle,
        prev.explorerId,
        prev.explorerName,
        prev.muted,
        prev.voiceAuto,
        prev.dua,
        prev.ambientEnabled,
        prev.ambientVolume,
        prev.showEscapeTimer
      )
    );
  }, []);

  // Keyboard shortcuts: Enter on Title Screen, Esc to close modals or toggle Pause
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (e.key === 'Escape') {
        if (activeModal) {
          e.preventDefault();
          stopSpeaking();
          setActiveModal(null);
          return;
        }
        if (state.phase === 'PLAYING') {
          e.preventDefault();
          stopSpeaking();
          soundEngine.playClick();
          setState((prev) => ({ ...prev, phase: 'PAUSED' }));
        } else if (state.phase === 'PAUSED') {
          e.preventDefault();
          soundEngine.playClick();
          setState((prev) => ({ ...prev, phase: 'PLAYING' }));
        }
      } else if (
        e.key === 'Enter' &&
        !isTyping &&
        !activeModal &&
        state.phase === 'TITLE_MENU'
      ) {
        e.preventDefault();
        handleStart();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeModal, state.phase, handleStart]);

  const finalizeStateWithRewards = useCallback(
    (
      prev: ExpeditionState,
      draft: ExpeditionState,
      celebrationLabel?: string
    ): ExpeditionState => {
      const updatedBadges = computeUnlockedBadges(draft);
      const updatedHonorIds = computeUnlockedHonorIds(draft);

      const newlyEarnedHonorId = updatedHonorIds.find(
        (id) => !prev.unlockedHonorIds.includes(id)
      );
      const newHonor = newlyEarnedHonorId
        ? getHonorById(newlyEarnedHonorId) ?? null
        : null;

      const newlyEarnedBadgeId = updatedBadges.find(
        (id) => !prev.unlockedBadges.includes(id)
      );
      const newBadge = newlyEarnedBadgeId
        ? BADGES.find((b) => b.id === newlyEarnedBadgeId) ?? null
        : null;

      const prevUnlockedCapsules = getUnlockedTimeCapsuleRoomIds(prev);
      const nextUnlockedCapsules = getUnlockedTimeCapsuleRoomIds(draft);
      const newlyUnlockedCapsuleRoom = nextUnlockedCapsules.find(
        (roomId) => !prevUnlockedCapsules.includes(roomId)
      );
      const capsuleHeadline = newlyUnlockedCapsuleRoom
        ? `¡Cápsula del Tiempo desbloqueada: ${getTimeCapsuleByRoom(newlyUnlockedCapsuleRoom).title}!`
        : null;

      if (newHonor) {
        soundEngine.playBadgeUnlock();
        triggerCelebration(
          capsuleHeadline || celebrationLabel || newHonor.title,
          newBadge,
          newHonor
        );
      } else if (newBadge) {
        soundEngine.playBadgeUnlock();
        triggerCelebration(
          capsuleHeadline || celebrationLabel || newBadge.subtitle,
          newBadge
        );
      } else if (capsuleHeadline) {
        soundEngine.playBadgeUnlock();
        triggerCelebration(capsuleHeadline, null);
      } else if (celebrationLabel) {
        triggerCelebration(celebrationLabel, null);
      }

      return {
        ...draft,
        unlockedBadges: updatedBadges,
        unlockedHonorIds: updatedHonorIds,
      };
    },
    [triggerCelebration]
  );

  const applyProgressUpdate = useCallback(
    (
      roomId: RoomId,
      updater: (prev: RoomProgress) => RoomProgress,
      celebrationLabel?: string,
      journalUpdate?: JournalEntry
    ) => {
      setState((prev) => {
        const nextProgress = {
          ...prev.progress,
          [roomId]: updater(prev.progress[roomId]),
        };
        const draft: ExpeditionState = {
          ...prev,
          progress: nextProgress,
          journal: journalUpdate
            ? { ...prev.journal, [roomId]: journalUpdate }
            : prev.journal,
        };
        return finalizeStateWithRewards(prev, draft, celebrationLabel);
      });
    },
    [finalizeStateWithRewards]
  );

  const pickCheerLine = useCallback(
    (indexHint: number) => {
      const lines = explorer.cheerLines;
      return lines[indexHint % lines.length];
    },
    [explorer]
  );

  const handleSelectHotspot = (hotspot: RoomHotspot) => {
    stopSpeaking();
    setHoverReaction(null);
    if (hotspot.kind === 'clue') {
      const alreadyFound = currentProgress.clueFound;
      soundEngine.playDiscover();
      triggerCharacterReaction('sorpresa');
      if (!alreadyFound) {
        applyProgressUpdate(
          currentRoom.id,
          (p) => ({ ...p, clueFound: true }),
          `¡Hallazgo recogido: ${currentRoom.clue.itemLabel}!`
        );
        setCompanionOverride(pickCheerLine(0));
      }
      setActiveModal({ type: 'clue' });
    } else if (hotspot.kind === 'puzzle1') {
      soundEngine.playClick();
      triggerCharacterReaction('concentrado');
      setActiveModal({ type: 'puzzle1' });
    } else if (hotspot.kind === 'puzzle2') {
      soundEngine.playClick();
      triggerCharacterReaction('concentrado');
      setActiveModal({ type: 'puzzle2' });
    } else {
      soundEngine.playClick();
      triggerCharacterReaction('concentrado');
      setActiveModal({ type: 'empathy' });
    }
  };

  const handleCompleteEmpathy = (entry: JournalEntry) => {
    stopSpeaking();
    applyProgressUpdate(
      currentRoom.id,
      (p) => ({ ...p, empathySolved: true }),
      `¡${currentRoom.empathy.sealTitle} conseguido!`,
      entry
    );
    const willCompleteAllSeals =
      currentProgress.puzzle1Solved && currentProgress.puzzle2Solved;
    triggerCharacterReaction(
      willCompleteAllSeals ? 'orgullo' : 'alegria',
      willCompleteAllSeals
        ? '¡Ya tienes los 3 sellos! Pulsa «¡Abrir cerrojo de salida!» para descifrar el código y escapar de la sala.'
        : pickCheerLine(2)
    );
    setActiveModal(null);
  };

  const handleUpdateStickyNote = useCallback(
    (roomId: RoomId, stickyNote: StickyNote | undefined) => {
      setState((prev) => {
        const existing = prev.journal[roomId];
        if (!existing) return prev;
        const draft: ExpeditionState = {
          ...prev,
          journal: {
            ...prev.journal,
            [roomId]: {
              ...existing,
              stickyNote,
            },
          },
        };
        return finalizeStateWithRewards(prev, draft);
      });
    },
    [finalizeStateWithRewards]
  );

  const handleSetRoomMood = useCallback(
    (roomId: RoomId, moment: 'before' | 'after', mood: ThermometerMoodId) => {
      setState((prev) => {
        const draft: ExpeditionState = {
          ...prev,
          emotions: {
            ...prev.emotions,
            [roomId]: {
              ...(prev.emotions[roomId] ?? {}),
              [moment]: mood,
            },
          },
        };
        return finalizeStateWithRewards(prev, draft);
      });
    },
    [finalizeStateWithRewards]
  );

  const handleMarkHonorSeen = useCallback((ids: HonorAchievementId[]) => {
    if (ids.length === 0) return;
    setState((prev) => {
      const merged = Array.from(new Set([...prev.seenHonorIds, ...ids]));
      if (merged.length === prev.seenHonorIds.length) return prev;
      return {
        ...prev,
        seenHonorIds: merged,
      };
    });
  }, []);

  const handleMarkTimeCapsuleSeen = useCallback((roomId: RoomId) => {
    setState((prev) => {
      if (prev.seenTimeCapsuleRooms.includes(roomId)) return prev;
      return {
        ...prev,
        seenTimeCapsuleRooms: [...prev.seenTimeCapsuleRooms, roomId],
      };
    });
  }, []);

  const unlockedCapsuleRooms = useMemo(
    () => getUnlockedTimeCapsuleRoomIds(state),
    [state]
  );
  const unseenCapsulesCount = useMemo(
    () =>
      unlockedCapsuleRooms.filter(
        (roomId) => !state.seenTimeCapsuleRooms.includes(roomId)
      ).length,
    [unlockedCapsuleRooms, state.seenTimeCapsuleRooms]
  );

  const currentCapsuleStatus = useMemo(
    () => evaluateTimeCapsuleProgress(currentRoom.id, currentProgress),
    [currentRoom.id, currentProgress]
  );
  const currentCapsuleIsNew =
    currentCapsuleStatus.unlocked &&
    !state.seenTimeCapsuleRooms.includes(currentRoom.id);

  const unseenHonorCount = useMemo(
    () =>
      state.unlockedHonorIds.filter((id) => !state.seenHonorIds.includes(id))
        .length,
    [state.unlockedHonorIds, state.seenHonorIds]
  );

  const unseenBadgesCount = useMemo(
    () =>
      state.unlockedBadges.filter(
        (id) => !(state.seenBadgeIds ?? []).includes(id)
      ).length,
    [state.unlockedBadges, state.seenBadgeIds]
  );

  const unlockedDoorRooms = useMemo(
    () =>
      ROOMS_DATA.filter((room) => state.progress[room.id].doorUnlocked).map(
        (room) => room.id
      ),
    [state.progress]
  );

  const missionProgressSummary = useMemo(() => {
    const total = ROOMS_DATA.length * 7;
    const completed = ROOMS_DATA.reduce((acc, room) => {
      const p = state.progress[room.id];
      return (
        acc +
        Number(p.clueFound) +
        Number(p.puzzle1Solved) +
        Number(p.puzzle2Solved) +
        Number(p.empathySolved) +
        Number(p.shadowSolved) +
        Number(p.transversalSolved) +
        Number(p.collectibleFound)
      );
    }, 0);
    return { completed, total };
  }, [state.progress]);

  const handleNavigateToMission = useCallback(
    (roomIndex: number, target: MissionActionTarget) => {
      stopSpeaking();
      const targetRoom = ROOMS_DATA[roomIndex] ?? ROOMS_DATA[0];
      const targetProgress = state.progress[targetRoom.id];
      soundEngine.playDoorOpen();

      setState((prev) => ({
        ...prev,
        currentRoomIndex: roomIndex,
        phase: 'PLAYING',
      }));

      if (target === 'clue' && !targetProgress.clueFound) {
        setActiveModal(null);
        setCompanionOverride(
          `Busca el punto con lupa en ${targetRoom.title} para descubrir «${targetRoom.clue.itemLabel}».`
        );
        return;
      }

      if (target === 'collectible' && !targetProgress.collectibleFound) {
        setActiveModal(null);
        setCompanionOverride(
          `Explora el escenario de ${targetRoom.title} y toca el icono de la gema para encontrar el Tesoro Canario.`
        );
        return;
      }

      setActiveModal({ type: target });
    },
    [state.progress]
  );

  const handleSolveJigsawRoom = useCallback(
    (roomId: RoomId) => {
      const room = ROOMS_DATA.find((r) => r.id === roomId);
      setState((prev) => {
        if (prev.solvedJigsawRooms.includes(roomId)) return prev;
        triggerCelebration(
          `¡Mural restaurado: ${room?.title ?? 'Gran Canaria'}!`,
          null
        );
        return {
          ...prev,
          solvedJigsawRooms: [...prev.solvedJigsawRooms, roomId],
        };
      });
    },
    [triggerCelebration]
  );

  const currentCollectible =
    CANARIAN_COLLECTIBLES.find((c) => c.roomId === currentRoom.id) ??
    CANARIAN_COLLECTIBLES[0];

  const handleSelectCollectible = () => {
    stopSpeaking();
    setHoverReaction(null);
    soundEngine.playDiscover();
    triggerCharacterReaction('sorpresa');
    if (!currentProgress.collectibleFound) {
      applyProgressUpdate(
        currentRoom.id,
        (p) => ({ ...p, collectibleFound: true }),
        `¡Tesoro Canario hallado: ${currentCollectible.word}!`
      );
      setCompanionOverride(
        `¡Qué ojo! Has añadido «${currentCollectible.word}» a tu Álbum Canario.`
      );
    }
    setActiveModal({ type: 'collectible' });
  };

  const handleAdvanceRoom = () => {
    stopSpeaking();
    if (state.currentRoomIndex < ROOMS_DATA.length - 1) {
      soundEngine.playDoorOpen();
      setState((prev) => ({ ...prev, phase: 'ROOM_TRANSITION' }));
    } else {
      soundEngine.playVictory();
      triggerCelebration('¡Has iluminado toda Gran Canaria!', null);
      setState((prev) => ({ ...prev, phase: 'VICTORY' }));
    }
  };

  const handleEnterNextRoom = () => {
    soundEngine.playClick();
    setState((prev) => ({
      ...prev,
      phase: 'PLAYING',
      currentRoomIndex: Math.min(
        prev.currentRoomIndex + 1,
        ROOMS_DATA.length - 1
      ),
    }));
  };

  const companionLine =
    companionOverride ?? currentRoom.arrivalNarrative[state.cycle];

  const duaClasses = `${state.dua.dyslexiaFont ? 'dua-dyslexia' : ''} ${
    state.dua.highContrast ? 'dua-high-contrast' : ''
  }`.trim();

  return (
    <div className={`min-h-screen w-full bg-[#171B21] ${duaClasses}`}>
      <CelebrationOverlay
        burstKey={celebration.key}
        headline={celebration.headline}
        badge={celebration.badge}
        honorAchievement={celebration.honorAchievement}
      />

      {state.phase === 'TITLE_MENU' && (
        <TitleScreen
          cycle={state.cycle}
          explorerId={state.explorerId}
          explorerName={state.explorerName}
          hasSavedProgress={hasSavedProgress}
          classroomConnected={Boolean(classroomUser)}
          muted={state.muted}
          voiceAuto={state.voiceAuto}
          onSelectCycle={(cycle) => {
            soundEngine.playClick();
            setState((prev) => ({ ...prev, cycle }));
          }}
          onSelectExplorer={(explorerId) => {
            soundEngine.playPowerUp();
            setState((prev) => ({
              ...prev,
              explorerId,
              explorersTried: hasSavedProgress
                ? Array.from(new Set([...prev.explorersTried, explorerId]))
                : [explorerId],
            }));
          }}
          onChangeName={(explorerName) =>
            setState((prev) => ({ ...prev, explorerName }))
          }
          onStart={handleStart}
          onResetAndStart={handleResetAndStart}
          onOpenCharacterSheet={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'characterSheet' });
          }}
          onOpenTeacherGuide={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'teacher' });
          }}
          onOpenClassroom={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'classroom', defaultMode: 'assignment' });
          }}
          onOpenDua={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'dua' });
          }}
          onToggleMute={() =>
            setState((prev) => ({ ...prev, muted: !prev.muted }))
          }
          onToggleVoiceAuto={() => {
            soundEngine.playClick();
            setState((prev) => {
              const nextVoice = !prev.voiceAuto;
              if (!nextVoice) stopSpeaking();
              return { ...prev, voiceAuto: nextVoice };
            });
          }}
        />
      )}

      {(state.phase === 'PLAYING' || state.phase === 'PAUSED') && (
        <RoomStage
          room={currentRoom}
          totalRooms={ROOMS_DATA.length}
          cycle={state.cycle}
          explorer={explorer}
          reaction={activeCharacterReaction}
          reactionPulseKey={activeReactionPulseKey}
          companionLine={companionLine}
          badgesCount={state.unlockedBadges.length}
          unseenPauseAlerts={unseenBadgesCount + unseenHonorCount + unseenCapsulesCount}
          elapsedSeconds={state.elapsedSeconds}
          showEscapeTimer={state.showEscapeTimer}
          missionsCompleted={missionProgressSummary.completed}
          missionsTotal={missionProgressSummary.total}
          currentJigsawSolved={state.solvedJigsawRooms.includes(currentRoom.id)}
          currentCapsuleUnlocked={currentCapsuleStatus.unlocked}
          currentCapsuleIsNew={currentCapsuleIsNew}
          progress={currentProgress}
          collectible={currentCollectible}
          shadowChallenge={SHADOW_CHALLENGES[currentRoom.id]}
          roomEmotion={state.emotions[currentRoom.id]}
          muted={state.muted}
          voiceAuto={state.voiceAuto}
          ambientEnabled={state.ambientEnabled}
          onHoverReaction={setHoverReaction}
          onTapAvatar={handleTapCompanionAvatar}
          onSelectHotspot={handleSelectHotspot}
          onSelectCollectible={handleSelectCollectible}
          onSelectShadow={() => {
            stopSpeaking();
            setHoverReaction(null);
            soundEngine.playClick();
            triggerCharacterReaction('concentrado');
            setActiveModal({ type: 'shadow' });
          }}
          onOpenExitLock={() => {
            stopSpeaking();
            setHoverReaction(null);
            soundEngine.playLockTick();
            triggerCharacterReaction('concentrado');
            setActiveModal({ type: 'exitLock' });
          }}
          onOpenMissionLog={() => {
            stopSpeaking();
            soundEngine.playClick();
            setActiveModal({ type: 'missions' });
          }}
          onOpenJigsaw={() => {
            stopSpeaking();
            soundEngine.playClick();
            setActiveModal({ type: 'jigsaw' });
          }}
          onOpenTimeCapsule={() => {
            stopSpeaking();
            soundEngine.playDiscover();
            const isNew = currentCapsuleIsNew;
            handleMarkTimeCapsuleSeen(currentRoom.id);
            triggerCharacterReaction('sorpresa');
            setActiveModal({
              type: 'timeCapsule',
              roomId: currentRoom.id,
              isNew,
            });
          }}
          onOpenTransversal={() => {
            stopSpeaking();
            soundEngine.playClick();
            setActiveModal({ type: 'transversal' });
          }}
          onOpenAssembly={() => {
            stopSpeaking();
            soundEngine.playClick();
            setActiveModal({ type: 'assembly' });
          }}
          onOpenDua={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'dua' });
          }}
          onOpenThermometer={() => {
            soundEngine.playClick();
            const roomSeals =
              Number(currentProgress.puzzle1Solved) +
              Number(currentProgress.puzzle2Solved) +
              Number(currentProgress.empathySolved);
            setActiveModal({
              type: 'thermometer',
              moment: roomSeals >= 2 ? 'after' : 'before',
            });
          }}
          onOpenMap={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'map' });
          }}
          onOpenJournal={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'journal' });
          }}
          onOpenCharacterSheet={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'characterSheet' });
          }}
          onOpenTeacherGuide={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'teacher' });
          }}
          onOpenPause={() => {
            stopSpeaking();
            soundEngine.playClick();
            setState((prev) => ({ ...prev, phase: 'PAUSED' }));
          }}
          onToggleMute={() =>
            setState((prev) => ({ ...prev, muted: !prev.muted }))
          }
          onToggleVoiceAuto={() => {
            soundEngine.playClick();
            setState((prev) => {
              const nextVoice = !prev.voiceAuto;
              if (!nextVoice) stopSpeaking();
              return { ...prev, voiceAuto: nextVoice };
            });
          }}
          onToggleAmbient={() => {
            ambientAudio.unlock();
            soundEngine.playClick();
            setState((prev) => ({
              ...prev,
              muted: prev.muted && !prev.ambientEnabled ? false : prev.muted,
              ambientEnabled: !prev.ambientEnabled,
            }));
          }}
          onAdvanceRoom={handleAdvanceRoom}
          onInspectCollectedClue={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'clue' });
          }}
        />
      )}

      {state.phase === 'ROOM_TRANSITION' && (
        <RoomTransition
          completedRoom={currentRoom}
          nextRoom={
            ROOMS_DATA[
              Math.min(state.currentRoomIndex + 1, ROOMS_DATA.length - 1)
            ]
          }
          explorer={explorer}
          completedEmotion={state.emotions[currentRoom.id]}
          elapsedSeconds={state.elapsedSeconds}
          showEscapeTimer={state.showEscapeTimer}
          onSelectAfterMood={(mood) =>
            handleSetRoomMood(currentRoom.id, 'after', mood)
          }
          onContinue={handleEnterNextRoom}
        />
      )}

      {state.phase === 'VICTORY' && (
        <VictoryScreen
          state={state}
          cycle={state.cycle}
          onChangeName={(explorerName) =>
            setState((prev) => ({ ...prev, explorerName }))
          }
          onSelectRoom4AfterMood={(mood) =>
            handleSetRoomMood('sigloXX', 'after', mood)
          }
          onOpenAudiobook={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'audiobook' });
          }}
          onOpenClassroom={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'classroom', defaultMode: 'shareProgress' });
          }}
          onOpenTeacherGuide={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'teacher' });
          }}
          onPlayAgain={handleResetToTitle}
        />
      )}

      {/* Active Modals */}
      {activeModal?.type === 'clue' && (
        <ClueModal
          clue={currentRoom.clue}
          cycle={state.cycle}
          muted={state.muted}
          voiceAuto={state.voiceAuto}
          pictograms={state.dua.pictograms}
          onClose={() => {
            stopSpeaking();
            setActiveModal(null);
          }}
        />
      )}

      {activeModal?.type === 'puzzle1' && (
        <PuzzleModal
          key={`${currentRoom.id}-p1-${state.cycle}-${state.explorerId}`}
          puzzle={currentRoom.puzzle1}
          cycle={state.cycle}
          explorer={explorer}
          muted={state.muted}
          voiceAuto={state.voiceAuto}
          pictograms={state.dua.pictograms}
          alreadySolved={currentProgress.puzzle1Solved}
          initialHintLevel={currentProgress.hintsUsed.puzzle1}
          onHintUsed={(level) =>
            applyProgressUpdate(currentRoom.id, (p) => ({
              ...p,
              hintsUsed: { ...p.hintsUsed, puzzle1: level },
            }))
          }
          onReaction={triggerCharacterReaction}
          onSolved={() => {
            applyProgressUpdate(
              currentRoom.id,
              (p) => ({ ...p, puzzle1Solved: true }),
              `¡${currentRoom.puzzle1.sealTitle} desbloqueado!`
            );
            const willCompleteAllSeals =
              currentProgress.puzzle2Solved && currentProgress.empathySolved;
            triggerCharacterReaction(
              willCompleteAllSeals ? 'orgullo' : 'alegria',
              willCompleteAllSeals
                ? '¡Ya tienes los 3 sellos! Pulsa «¡Abrir cerrojo de salida!» para descifrar el código y escapar de la sala.'
                : pickCheerLine(1)
            );
          }}
          onClose={() => {
            stopSpeaking();
            setActiveModal(null);
          }}
        />
      )}

      {activeModal?.type === 'puzzle2' && (
        <PuzzleModal
          key={`${currentRoom.id}-p2-${state.cycle}-${state.explorerId}`}
          puzzle={currentRoom.puzzle2}
          cycle={state.cycle}
          explorer={explorer}
          muted={state.muted}
          voiceAuto={state.voiceAuto}
          pictograms={state.dua.pictograms}
          alreadySolved={currentProgress.puzzle2Solved}
          initialHintLevel={currentProgress.hintsUsed.puzzle2}
          onHintUsed={(level) =>
            applyProgressUpdate(currentRoom.id, (p) => ({
              ...p,
              hintsUsed: { ...p.hintsUsed, puzzle2: level },
            }))
          }
          onReaction={triggerCharacterReaction}
          onSolved={() => {
            applyProgressUpdate(
              currentRoom.id,
              (p) => ({ ...p, puzzle2Solved: true }),
              `¡${currentRoom.puzzle2.sealTitle} desbloqueado!`
            );
            const willCompleteAllSeals =
              currentProgress.puzzle1Solved && currentProgress.empathySolved;
            triggerCharacterReaction(
              willCompleteAllSeals ? 'orgullo' : 'alegria',
              willCompleteAllSeals
                ? '¡Ya tienes los 3 sellos! Pulsa «¡Abrir cerrojo de salida!» para descifrar el código y escapar de la sala.'
                : pickCheerLine(1)
            );
          }}
          onClose={() => {
            stopSpeaking();
            setActiveModal(null);
          }}
        />
      )}

      {activeModal?.type === 'empathy' && (
        <EmpathyModal
          key={`${currentRoom.id}-emp-${state.cycle}-${state.explorerId}`}
          room={currentRoom}
          dilemma={currentRoom.empathy}
          cycle={state.cycle}
          explorer={explorer}
          muted={state.muted}
          voiceAuto={state.voiceAuto}
          existingEntry={state.journal[currentRoom.id]}
          onReaction={triggerCharacterReaction}
          onComplete={handleCompleteEmpathy}
          onClose={() => {
            stopSpeaking();
            setActiveModal(null);
          }}
        />
      )}

      {activeModal?.type === 'exitLock' && (
        <RoomExitLockModal
          key={`${currentRoom.id}-lock-${state.cycle}`}
          room={currentRoom}
          totalRooms={ROOMS_DATA.length}
          cycle={state.cycle}
          explorer={explorer}
          progress={currentProgress}
          muted={state.muted}
          onJumpToChallenge={(target) => {
            soundEngine.playClick();
            if (target === 'clue' && !currentProgress.clueFound) {
              setActiveModal(null);
              setCompanionOverride(
                `Busca el punto con lupa en ${currentRoom.title} para recoger «${currentRoom.clue.itemLabel}».`
              );
              return;
            }
            setActiveModal({ type: target });
          }}
          onReaction={triggerCharacterReaction}
          onDoorUnlocked={() => {
            if (!currentProgress.doorUnlocked) {
              applyProgressUpdate(
                currentRoom.id,
                (p) => ({ ...p, doorUnlocked: true }),
                `¡Puerta abierta en Sala ${currentRoom.number}!`
              );
            }
          }}
          onEscapeRoom={() => {
            setActiveModal(null);
            handleAdvanceRoom();
          }}
          onClose={() => {
            stopSpeaking();
            setActiveModal(null);
          }}
        />
      )}

      {activeModal?.type === 'transversal' && (
        <TransversalModal
          mission={TRANSVERSAL_MISSIONS[currentRoom.id]}
          cycle={state.cycle}
          explorer={explorer}
          muted={state.muted}
          voiceAuto={state.voiceAuto}
          pictograms={state.dua.pictograms}
          alreadySolved={currentProgress.transversalSolved}
          onReaction={triggerCharacterReaction}
          onSolved={() => {
            applyProgressUpdate(
              currentRoom.id,
              (p) => ({ ...p, transversalSolved: true }),
              `¡Misión 2030 completada: ${TRANSVERSAL_MISSIONS[currentRoom.id].axis}!`
            );
            triggerCharacterReaction(
              'alegria',
              `¡Genial! Has conectado la historia con ${TRANSVERSAL_MISSIONS[currentRoom.id].axis}.`
            );
          }}
          onClose={() => {
            stopSpeaking();
            setActiveModal(null);
          }}
        />
      )}

      {activeModal?.type === 'collectible' && (
        <CollectibleModal
          collectible={currentCollectible}
          muted={state.muted}
          voiceAuto={state.voiceAuto}
          onClose={() => {
            stopSpeaking();
            setActiveModal(null);
          }}
        />
      )}

      {activeModal?.type === 'assembly' && (
        <AssemblyModal
          room={currentRoom}
          muted={state.muted}
          onClose={() => {
            stopSpeaking();
            setActiveModal(null);
          }}
        />
      )}

      {activeModal?.type === 'dua' && (
        <DuaPanelModal
          dua={state.dua}
          muted={state.muted}
          onChangeDua={(dua) => setState((prev) => ({ ...prev, dua }))}
          onClose={() => {
            stopSpeaking();
            setActiveModal(null);
          }}
        />
      )}

      {activeModal?.type === 'thermometer' && (
        <ThermometerModal
          room={currentRoom}
          moment={activeModal.moment}
          currentCheck={state.emotions[currentRoom.id]}
          onSelectMood={(moment, mood) =>
            handleSetRoomMood(currentRoom.id, moment, mood)
          }
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal?.type === 'map' && (
        <IslandMapModal
          state={state}
          initialTab={activeModal.initialTab}
          onJumpToRoom={(idx) => {
            soundEngine.playDoorOpen();
            setActiveModal(null);
            setState((prev) => ({
              ...prev,
              currentRoomIndex: idx,
              phase: 'PLAYING',
            }));
          }}
          onCompleteAtlasLayer={(layerId) => {
            setState((prev) => {
              const existing = prev.atlasLayersCompleted ?? [];
              if (existing.includes(layerId)) return prev;
              const draft: ExpeditionState = {
                ...prev,
                atlasLayersCompleted: [...existing, layerId],
              };
              return finalizeStateWithRewards(prev, draft);
            });
          }}
          onCompleteTimeline={() => {
            setState((prev) => {
              if (prev.timelineSolved) return prev;
              const draft: ExpeditionState = {
                ...prev,
                timelineSolved: true,
              };
              return finalizeStateWithRewards(
                prev,
                draft,
                '¡Línea del Tiempo completada!'
              );
            });
          }}
          onReaction={triggerCharacterReaction}
          onClose={() => setActiveModal(null)}
        />
      )}

      <Suspense fallback={null}>
        {activeModal?.type === 'missions' && (
          <MissionLogModal
            state={state}
            cycle={state.cycle}
            onNavigateToMission={handleNavigateToMission}
            onOpenAtlasTab={(tab) => {
              soundEngine.playClick();
              setActiveModal({ type: 'map', initialTab: tab });
            }}
            onClose={() => {
              stopSpeaking();
              soundEngine.playClick();
              setActiveModal(null);
            }}
          />
        )}

        {activeModal?.type === 'jigsaw' && (
          <PicturePuzzleModal
            initialRoomId={currentRoom.id}
            cycle={state.cycle}
            explorer={explorer}
            solvedRooms={state.solvedJigsawRooms}
            muted={state.muted}
            onReaction={triggerCharacterReaction}
            onSolvedRoom={(roomId) => {
              handleSolveJigsawRoom(roomId);
              triggerCharacterReaction(
                'alegria',
                '¡Mural restaurado! Qué buena vista para encajar todas las piezas.'
              );
            }}
            onClose={() => {
              stopSpeaking();
              soundEngine.playClick();
              setActiveModal(null);
            }}
          />
        )}
      </Suspense>

      {activeModal?.type === 'shadow' && (
        <ShadowMatchModal
          key={`${currentRoom.id}-shadow-${state.cycle}`}
          room={currentRoom}
          challenge={SHADOW_CHALLENGES[currentRoom.id]}
          cycle={state.cycle}
          explorer={explorer}
          muted={state.muted}
          voiceAuto={state.voiceAuto}
          pictograms={state.dua.pictograms}
          alreadySolved={currentProgress.shadowSolved}
          onReaction={triggerCharacterReaction}
          onSolved={() => {
            if (!currentProgress.shadowSolved) {
              applyProgressUpdate(
                currentRoom.id,
                (p) => ({ ...p, shadowSolved: true }),
                `¡Pista secreta desbloqueada en ${currentRoom.title}!`
              );
              triggerCharacterReaction(
                'sorpresa',
                '¡Qué vista! Has descifrado todas las siluetas y desbloqueado una pista histórica extra.'
              );
            }
          }}
          onClose={() => {
            stopSpeaking();
            soundEngine.playClick();
            setActiveModal(null);
          }}
        />
      )}

      <Suspense fallback={null}>
        {activeModal?.type === 'conquests' && (
          <ConquestsAlbumModal
            state={state}
            muted={state.muted}
            onJumpToRoom={(idx) => {
              soundEngine.playDoorOpen();
              setActiveModal(null);
              setState((prev) => ({
                ...prev,
                currentRoomIndex: idx,
                phase: 'PLAYING',
              }));
            }}
            onMarkHonorSeen={handleMarkHonorSeen}
            onMarkTimeCapsuleSeen={handleMarkTimeCapsuleSeen}
            onClose={() => {
              soundEngine.playClick();
              setActiveModal(null);
            }}
          />
        )}

        {activeModal?.type === 'timeCapsule' && (
          <TimeCapsuleViewerModal
            capsule={getTimeCapsuleByRoom(activeModal.roomId)}
            cycle={state.cycle}
            muted={state.muted}
            isNewUnlock={activeModal.isNew}
            onClose={() => {
              stopSpeaking();
              soundEngine.playClick();
              setActiveModal(null);
            }}
          />
        )}

        {activeModal?.type === 'audiobook' && (
          <AudiobookModal
            state={state}
            cycle={state.cycle}
            onChangeVoiceRate={(voiceRate) =>
              setState((prev) => ({
                ...prev,
                dua: { ...prev.dua, voiceRate },
              }))
            }
            onUnmute={() => setState((prev) => ({ ...prev, muted: false }))}
            onClose={() => {
              stopSpeaking();
              setActiveModal(null);
            }}
          />
        )}
      </Suspense>

      {activeModal?.type === 'journal' && (
        <JournalModal
          state={state}
          cycle={state.cycle}
          onUpdateStickyNote={handleUpdateStickyNote}
          onOpenAudiobook={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'audiobook' });
          }}
          onOpenHistoricalGlossary={() => {
            soundEngine.playClick();
            setActiveModal({
              type: 'historicalGlossary',
              returnToJournal: true,
            });
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      <Suspense fallback={null}>
        {activeModal?.type === 'historicalGlossary' && (
          <HistoricalGlossaryModal
            cycle={state.cycle}
            muted={state.muted}
            onClose={() => {
              stopSpeaking();
              soundEngine.playClick();
              if (activeModal.returnToJournal) {
                setActiveModal({ type: 'journal' });
              } else {
                setActiveModal(null);
              }
            }}
          />
        )}
      </Suspense>

      {state.phase === 'PAUSED' && !activeModal && (
        <PauseModal
          cycle={state.cycle}
          explorerId={state.explorerId}
          currentRoomIndex={state.currentRoomIndex}
          muted={state.muted}
          voiceAuto={state.voiceAuto}
          ambientEnabled={state.ambientEnabled}
          ambientVolume={state.ambientVolume}
          unseenHonorCount={unseenHonorCount}
          capsulesUnlocked={unlockedCapsuleRooms.length}
          unseenCapsulesCount={unseenCapsulesCount}
          missionsCompleted={missionProgressSummary.completed}
          missionsTotal={missionProgressSummary.total}
          jigsawSolvedCount={state.solvedJigsawRooms.length}
          atlasLayersCompletedCount={(state.atlasLayersCompleted ?? []).length}
          timelineSolved={Boolean(state.timelineSolved)}
          badgesUnlockedCount={state.unlockedBadges.length}
          badgesTotal={BADGES.length}
          unseenBadgesCount={unseenBadgesCount}
          elapsedSeconds={state.elapsedSeconds}
          showEscapeTimer={state.showEscapeTimer}
          unlockedDoorRooms={unlockedDoorRooms}
          classroomUserEmail={classroomUser?.email ?? null}
          onResume={() => {
            soundEngine.playClick();
            setState((prev) => ({ ...prev, phase: 'PLAYING' }));
          }}
          onChangeCycle={(cycle) => {
            soundEngine.playClick();
            setState((prev) => ({ ...prev, cycle }));
          }}
          onChangeExplorer={(explorerId) => {
            soundEngine.playPowerUp();
            setState((prev) => {
              const nextTried = Array.from(
                new Set([...prev.explorersTried, explorerId])
              );
              const draft: ExpeditionState = {
                ...prev,
                explorerId,
                explorersTried: nextTried,
              };
              return finalizeStateWithRewards(prev, draft);
            });
          }}
          onJumpToRoom={(idx) => {
            soundEngine.playDoorOpen();
            setState((prev) => ({
              ...prev,
              currentRoomIndex: idx,
              phase: 'PLAYING',
            }));
          }}
          onToggleEscapeTimer={() => {
            soundEngine.playClick();
            setState((prev) => ({
              ...prev,
              showEscapeTimer: !prev.showEscapeTimer,
            }));
          }}
          onToggleMute={() =>
            setState((prev) => ({ ...prev, muted: !prev.muted }))
          }
          onToggleVoiceAuto={() => {
            soundEngine.playClick();
            setState((prev) => {
              const nextVoice = !prev.voiceAuto;
              if (!nextVoice) stopSpeaking();
              return { ...prev, voiceAuto: nextVoice };
            });
          }}
          onToggleAmbient={() => {
            ambientAudio.unlock();
            soundEngine.playClick();
            setState((prev) => ({
              ...prev,
              muted: prev.muted && !prev.ambientEnabled ? false : prev.muted,
              ambientEnabled: !prev.ambientEnabled,
            }));
          }}
          onChangeAmbientVolume={(ambientVolume) => {
            ambientAudio.unlock();
            soundEngine.playStep();
            setState((prev) => ({ ...prev, ambientVolume }));
          }}
          onOpenMissionLog={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'missions' });
          }}
          onOpenExplorerAchievements={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'explorerAchievements' });
          }}
          onOpenNaturalAtlas={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'map', initialTab: 'medio-natural' });
          }}
          onOpenJigsaw={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'jigsaw' });
          }}
          onOpenConquestsAlbum={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'conquests' });
          }}
          onOpenAudiobook={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'audiobook' });
          }}
          onOpenHistoricalGlossary={() => {
            soundEngine.playClick();
            setActiveModal({
              type: 'historicalGlossary',
              returnToJournal: false,
            });
          }}
          onOpenCharacterSheet={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'characterSheet' });
          }}
          onOpenClassroom={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'classroom', defaultMode: 'assignment' });
          }}
          onOpenTeacherGuide={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'teacher' });
          }}
          onOpenDua={() => {
            soundEngine.playClick();
            setActiveModal({ type: 'dua' });
          }}
          onReturnTitle={() => {
            soundEngine.playClick();
            setState((prev) => ({ ...prev, phase: 'TITLE_MENU' }));
          }}
          onResetExpedition={handleResetToTitle}
        />
      )}

      <Suspense fallback={null}>
        {activeModal?.type === 'explorerAchievements' && (
          <ExplorerAchievementsModal
            state={state}
            onMarkBadgesSeen={(ids) => {
              setState((prev) => ({
                ...prev,
                seenBadgeIds: Array.from(
                  new Set([...(prev.seenBadgeIds ?? []), ...ids])
                ),
              }));
            }}
            onNavigateTarget={(target) => {
              soundEngine.playDoorOpen();
              if (target.type === 'room') {
                setActiveModal(null);
                setState((prev) => ({
                  ...prev,
                  currentRoomIndex: target.roomIndex,
                  phase: 'PLAYING',
                }));
              } else if (target.type === 'atlas') {
                setActiveModal({ type: 'map', initialTab: target.tab });
              } else if (target.type === 'jigsaw') {
                setActiveModal({ type: 'jigsaw' });
              }
            }}
            onClose={() => {
              stopSpeaking();
              soundEngine.playClick();
              setActiveModal(null);
            }}
          />
        )}

        {activeModal?.type === 'characterSheet' && (
          <CharacterSheetModal
            initialExplorerId={state.explorerId}
            activeExplorerId={state.explorerId}
            state={state}
            muted={state.muted}
            onSelectExplorer={(explorerId) => {
              setState((prev) => {
                const nextTried = Array.from(
                  new Set([...prev.explorersTried, explorerId])
                );
                const draft: ExpeditionState = {
                  ...prev,
                  explorerId,
                  explorersTried: nextTried,
                };
                return finalizeStateWithRewards(prev, draft);
              });
            }}
            onClose={() => {
              stopSpeaking();
              soundEngine.playClick();
              setActiveModal(null);
            }}
          />
        )}

        {activeModal?.type === 'classroom' && (
          <GoogleClassroomModal
            state={state}
            defaultMode={activeModal.defaultMode}
            onAuthChange={(user) => setClassroomUser(user)}
            onClose={() => {
              soundEngine.playClick();
              setActiveModal(null);
            }}
          />
        )}

        {activeModal?.type === 'teacher' && (
          <TeacherGuideModal
            initialCycle={state.cycle}
            state={state}
            onClose={() => setActiveModal(null)}
          />
        )}
      </Suspense>
    </div>
  );
}
