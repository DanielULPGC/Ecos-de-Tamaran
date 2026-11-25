import React, { useRef } from 'react';
import {
  Accessibility,
  Award,
  Bell,
  BookA,
  BookOpen,
  ClipboardList,
  Clock,
  Compass,
  GraduationCap,
  Headphones,
  Home,
  IdCard,
  Lock,
  LockOpen,
  Mountain,
  Play,
  Puzzle,
  RotateCcw,
  Ship,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Waves,
  Wind,
} from 'lucide-react';
import { CycleId, ExplorerId, RoomId } from '../types/game';
import { ROOMS_DATA } from '../data/roomsData';
import { formatEscapeTime } from '../data/escapeLocks';
import { DIFFICULTY_PROFILES } from '../data/difficultyConfig';
import { EXPLORERS } from '../data/charactersAndBadges';
import { isSpeechSupported } from '../utils/speech';
import {
  AMBIENT_SOUNDSCAPE_META,
  AmbientVolumeLevel,
} from '../utils/ambientAudio';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';

interface PauseModalProps {
  cycle: CycleId;
  explorerId: ExplorerId;
  currentRoomIndex: number;
  muted: boolean;
  voiceAuto: boolean;
  ambientEnabled: boolean;
  ambientVolume: AmbientVolumeLevel;
  unseenHonorCount?: number;
  capsulesUnlocked?: number;
  unseenCapsulesCount?: number;
  missionsCompleted?: number;
  missionsTotal?: number;
  jigsawSolvedCount?: number;
  atlasLayersCompletedCount?: number;
  timelineSolved?: boolean;
  badgesUnlockedCount?: number;
  badgesTotal?: number;
  unseenBadgesCount?: number;
  elapsedSeconds?: number;
  showEscapeTimer?: boolean;
  unlockedDoorRooms?: RoomId[];
  accessibleRoomIndices?: number[];
  teacherMode?: boolean;
  metaVaultFragmentsCount?: number;
  metaVaultSolved?: boolean;
  teamTurnsEnabled?: boolean;
  classroomUserEmail?: string | null;
  onResume: () => void;
  onChangeCycle: (cycle: CycleId) => void;
  onChangeExplorer: (id: ExplorerId) => void;
  onJumpToRoom: (roomIndex: number) => void;
  onToggleEscapeTimer: () => void;
  onToggleTeacherMode: () => void;
  onToggleTeamTurns: () => void;
  onOpenMetaVault: () => void;
  onToggleMute: () => void;
  onToggleVoiceAuto: () => void;
  onToggleAmbient: () => void;
  onChangeAmbientVolume: (vol: AmbientVolumeLevel) => void;
  onOpenMissionLog: () => void;
  onOpenExplorerAchievements: () => void;
  onOpenNaturalAtlas: () => void;
  onOpenJigsaw: () => void;
  onOpenConquestsAlbum: () => void;
  onOpenAudiobook: () => void;
  onOpenHistoricalGlossary: () => void;
  onOpenCharacterSheet: () => void;
  onOpenClassroom: () => void;
  onOpenTeacherGuide: () => void;
  onOpenDua: () => void;
  onReturnTitle: () => void;
  onResetExpedition: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  cycle,
  explorerId,
  currentRoomIndex,
  muted,
  voiceAuto,
  ambientEnabled,
  ambientVolume,
  unseenHonorCount = 0,
  capsulesUnlocked = 0,
  unseenCapsulesCount = 0,
  missionsCompleted = 0,
  missionsTotal = 28,
  jigsawSolvedCount = 0,
  atlasLayersCompletedCount = 0,
  timelineSolved = false,
  badgesUnlockedCount = 0,
  badgesTotal = 14,
  unseenBadgesCount = 0,
  elapsedSeconds = 0,
  showEscapeTimer = true,
  unlockedDoorRooms = [],
  accessibleRoomIndices = [0],
  teacherMode = false,
  metaVaultFragmentsCount = 0,
  metaVaultSolved = false,
  teamTurnsEnabled = false,
  classroomUserEmail = null,
  onResume,
  onChangeCycle,
  onChangeExplorer,
  onJumpToRoom,
  onToggleEscapeTimer,
  onToggleTeacherMode,
  onToggleTeamTurns,
  onOpenMetaVault,
  onToggleMute,
  onToggleVoiceAuto,
  onToggleAmbient,
  onChangeAmbientVolume,
  onOpenMissionLog,
  onOpenExplorerAchievements,
  onOpenNaturalAtlas,
  onOpenJigsaw,
  onOpenConquestsAlbum,
  onOpenAudiobook,
  onOpenHistoricalGlossary,
  onOpenCharacterSheet,
  onOpenClassroom,
  onOpenTeacherGuide,
  onOpenDua,
  onReturnTitle,
  onResetExpedition,
}) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useDialogFocusTrap(dialogRef, true);

  const speechAvailable = isSpeechSupported();
  const activeRoom = ROOMS_DATA[currentRoomIndex] ?? ROOMS_DATA[0];
  const ambientMeta = AMBIENT_SOUNDSCAPE_META[activeRoom.id];

  const renderAmbientGlyph = () => {
    const cls = 'h-4 w-4 text-[#2A6F4E] shrink-0';
    switch (ambientMeta.iconKey) {
      case 'wind':
        return <Wind className={cls} aria-hidden="true" />;
      case 'bell':
        return <Bell className={cls} aria-hidden="true" />;
      case 'waves':
        return <Waves className={cls} aria-hidden="true" />;
      case 'ship':
        return <Ship className={cls} aria-hidden="true" />;
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1015]/84 p-4"
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        <div className="border-b border-[#232A34]/12 bg-[#EAE6DC] px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#526071] tabular-nums">
            <span>Escape Room en pausa · Sin límite de tiempo</span>
            {showEscapeTimer && (
              <span className="inline-flex items-center gap-1 font-semibold text-[#1D4E89]">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{formatEscapeTime(elapsedSeconds)}</span>
              </span>
            )}
          </div>
          <h2
            id="pause-modal-title"
            className="mt-1 font-display text-2xl font-bold text-[#171B21]"
          >
            Opciones del Escape Room
          </h2>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Switch Explorer mid-game */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-[#526071]">
                Cambiar de explorador o exploradora
              </span>
              <button
                type="button"
                onClick={onOpenCharacterSheet}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1D4E89] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                <IdCard className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ver hoja de desarrollo</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {EXPLORERS.map((char) => {
                const active = char.id === explorerId;
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => onChangeExplorer(char.id)}
                    className={`flex flex-col items-center rounded-xl border p-2 text-center transition-colors cursor-pointer ${
                      active
                        ? 'border-[#1D4E89] bg-[#E8F0FA] font-bold'
                        : 'border-[#232A34]/15 bg-white hover:border-[#1D4E89]'
                    }`}
                  >
                    <img
                      src={char.portraitPath}
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <span className="mt-1 text-xs font-bold text-[#171B21]">
                      {char.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Switch difficulty & cycle */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-[#526071]">
                Dificultad y ciclo de Primaria
              </span>
              <span className="font-mono text-[11px] font-semibold text-[#1D4E89]">
                {DIFFICULTY_PROFILES[cycle].levelName}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-[#232A34]/15 bg-[#EAE6DC] p-1">
              {(['ciclo2', 'ciclo3'] as const).map((cid) => {
                const prof = DIFFICULTY_PROFILES[cid];
                const active = cycle === cid;
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => onChangeCycle(cid)}
                    className={`rounded-md px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#1D4E89] text-white'
                        : 'text-[#333D4B] hover:text-[#171B21]'
                    }`}
                  >
                    <div className="font-bold">
                      {prof.levelName} · {prof.cycleLabel}
                    </div>
                    <div
                      className={`mt-0.5 text-[10px] ${
                        active ? 'text-[#DCE8F8]' : 'text-[#526071]'
                      }`}
                    >
                      Sombras {prof.shadowPiecesCount} piezas · {prof.maxPuzzleHints} pistas
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Escape Room sequential progression with optional Teacher Mode unlock */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-[#526071]">
                Salas del Escape Room
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={teacherMode}
                  onClick={onToggleTeacherMode}
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold transition-colors cursor-pointer ${
                    teacherMode
                      ? 'border-[#C67D1E] bg-[#FAF4E8] text-[#8A5410]'
                      : 'border-[#232A34]/18 bg-white text-[#526071] hover:border-[#1D4E89]'
                  }`}
                >
                  {teacherMode ? (
                    <LockOpen className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Lock className="h-3 w-3" aria-hidden="true" />
                  )}
                  <span>
                    {teacherMode ? 'Modo docente: Activo' : 'Modo docente'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onToggleEscapeTimer}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1D4E89] hover:underline cursor-pointer"
                >
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {showEscapeTimer ? 'Ocultar cronómetro' : 'Mostrar cronómetro'}
                  </span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ROOMS_DATA.map((room, idx) => {
                const escaped = unlockedDoorRooms.includes(room.id);
                const accessible =
                  teacherMode || accessibleRoomIndices.includes(idx);
                return (
                  <button
                    key={room.id}
                    type="button"
                    disabled={!accessible}
                    onClick={() => accessible && onJumpToRoom(idx)}
                    title={
                      accessible
                        ? `Ir a Sala ${room.number}: ${room.epoch}`
                        : `Abre primero el cerrojo de la Sala ${idx} o activa el Modo docente`
                    }
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                      !accessible
                        ? 'border-[#232A34]/10 bg-[#EAE6DC]/75 text-[#7A8390] opacity-70 cursor-not-allowed'
                        : idx === currentRoomIndex
                        ? 'border-[#1D4E89] bg-[#E8F0FA] font-semibold text-[#171B21] cursor-pointer'
                        : 'border-[#232A34]/15 bg-white text-[#3E4856] hover:border-[#1D4E89] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 font-mono text-[11px] tabular-nums">
                      <span
                        className={
                          accessible ? 'text-[#1D4E89]' : 'text-[#7A8390]'
                        }
                      >
                        Sala {room.number}
                      </span>
                      {escaped ? (
                        <LockOpen
                          className="h-3.5 w-3.5 text-[#2A6F4E]"
                          aria-label="Cerrojo abierto"
                        />
                      ) : accessible ? (
                        <span className="text-[10px] font-semibold text-[#8A5410]">
                          {teacherMode && idx > 0 ? 'Libre' : 'Activa'}
                        </span>
                      ) : (
                        <Lock
                          className="h-3.5 w-3.5 text-[#8F97A3]"
                          aria-label="Sala bloqueada"
                        />
                      )}
                    </div>
                    <div className="truncate">{room.epoch}</div>
                  </button>
                );
              })}
            </div>
            {!teacherMode && (
              <p className="mt-1.5 text-[11px] text-[#526071]">
                Las salas siguientes se desbloquean al abrir cada cerrojo de salida. Activa{' '}
                <strong>Modo docente</strong> si necesitas saltar libremente en clase.
              </p>
            )}
          </div>

          {/* Prominent Showcase Grid: Logros de Explorador, Bitácora, Puzles, Álbum, Atlas & Audiolibro */}
          <div className="grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={onOpenExplorerAchievements}
              className="sm:col-span-2 flex items-center justify-between gap-3 rounded-xl border border-[#C67D1E]/70 bg-[#FAF4E8] px-4 py-3 text-left transition-colors hover:border-[#C67D1E] hover:bg-[#F5E8CC] cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#C67D1E] text-[#14181F]">
                  <Award className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#171B21]">
                    Logros de Explorador
                  </div>
                  <div
                    className={`text-[11px] leading-snug ${
                      unseenBadgesCount > 0
                        ? 'font-bold text-[#8A5410]'
                        : 'text-[#526071]'
                    }`}
                  >
                    {unseenBadgesCount > 0
                      ? `¡${unseenBadgesCount} ${
                          unseenBadgesCount === 1
                            ? 'insignia nueva desbloqueada'
                            : 'insignias nuevas desbloqueadas'
                        }! Pulsa para verla`
                      : 'Consulta todas tus insignias obtenidas y los retos para desbloquearlas'}
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#8A5410] tabular-nums whitespace-nowrap shrink-0">
                {badgesUnlockedCount}/{badgesTotal}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenMetaVault}
              className="flex items-center gap-3 rounded-xl border border-[#C67D1E]/55 bg-[#231D14] px-3.5 py-3 text-left text-[#FAF4E8] transition-colors hover:border-[#E6A94F] hover:bg-[#2E2519] cursor-pointer"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#C67D1E] text-[#14181F]">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#FAF4E8]">
                  Cámara Secreta
                </div>
                <div className="font-mono text-[11px] leading-snug text-[#F3C876] tabular-nums">
                  {metaVaultSolved
                    ? 'Gran Pintadera abierta ✓'
                    : `${metaVaultFragmentsCount}/4 fragmentos`}
                </div>
              </div>
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={teamTurnsEnabled}
              onClick={onToggleTeamTurns}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors cursor-pointer ${
                teamTurnsEnabled
                  ? 'border-[#2A6F4E] bg-[#E8F3EC] hover:bg-[#DDF0E4]'
                  : 'border-[#232A34]/20 bg-white hover:border-[#2A6F4E]'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  teamTurnsEnabled
                    ? 'bg-[#2A6F4E] text-white'
                    : 'bg-[#EAE6DC] text-[#3E4856]'
                }`}
              >
                <Users className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#171B21]">
                  Turnos de Equipo
                </div>
                <div className="text-[11px] leading-snug text-[#1D543A]">
                  {teamTurnsEnabled
                    ? 'Barra activa en pizarra'
                    : 'Activar rotación de roles'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenMissionLog}
              className="flex items-center gap-3 rounded-xl border border-[#2A6F4E]/45 bg-[#E8F3EC] px-3.5 py-3 text-left transition-colors hover:border-[#2A6F4E] hover:bg-[#DDF0E4] cursor-pointer"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2A6F4E] text-white">
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#171B21]">
                  Bitácora LOMLOE
                </div>
                <div className="font-mono text-[11px] leading-snug text-[#1D543A] tabular-nums">
                  {missionsCompleted}/{missionsTotal} objetivos
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenJigsaw}
              className="flex items-center gap-3 rounded-xl border border-[#9C5A25]/45 bg-[#F8EFE6] px-3.5 py-3 text-left transition-colors hover:border-[#9C5A25] hover:bg-[#F2E2D2] cursor-pointer"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#9C5A25] text-white">
                <Puzzle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#171B21]">
                  Taller de Puzles
                </div>
                <div className="font-mono text-[11px] leading-snug text-[#784319] tabular-nums">
                  {jigsawSolvedCount}/{ROOMS_DATA.length} murales restaurados
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenConquestsAlbum}
              className="flex items-center gap-3 rounded-xl border border-[#C67D1E]/60 bg-[#FAF4E8] px-3.5 py-3 text-left transition-colors hover:border-[#C67D1E] hover:bg-[#F5E8CC] cursor-pointer"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#C67D1E] text-[#14181F]">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#171B21]">
                  Álbum de Conquistas
                </div>
                <div
                  className={`text-[11px] leading-snug ${
                    unseenCapsulesCount > 0 || unseenHonorCount > 0
                      ? 'font-bold text-[#8A5410]'
                      : 'text-[#526071]'
                  }`}
                >
                  {unseenCapsulesCount > 0
                    ? `${unseenCapsulesCount} ${
                        unseenCapsulesCount === 1
                          ? 'Cápsula del Tiempo nueva'
                          : 'Cápsulas del Tiempo nuevas'
                      }`
                    : unseenHonorCount > 0
                    ? `${unseenHonorCount} ${
                        unseenHonorCount === 1
                          ? 'logro nuevo en Honor'
                          : 'logros nuevos en Honor'
                      }`
                    : `Sellos, Honor · ${capsulesUnlocked}/4 cápsulas`}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenAudiobook}
              className="flex items-center gap-3 rounded-xl border border-[#1D4E89]/45 bg-[#E8F0FA] px-3.5 py-3 text-left transition-colors hover:border-[#1D4E89] hover:bg-[#DAE7F7] cursor-pointer"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1D4E89] text-white">
                <Headphones className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#171B21]">
                  Audiolibro
                </div>
                <div className="text-[11px] leading-snug text-[#526071]">
                  Escucha tu aventura seguida
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenNaturalAtlas}
              className="flex items-center gap-3 rounded-xl border border-[#2A6F4E]/45 bg-[#E8F3EC] px-3.5 py-3 text-left transition-colors hover:border-[#2A6F4E] hover:bg-[#DDF0E4] cursor-pointer"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2A6F4E] text-white">
                <Mountain className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#171B21]">
                  Atlas Natural y Tiempo
                </div>
                <div className="font-mono text-[11px] leading-snug text-[#1D543A] tabular-nums">
                  {atlasLayersCompletedCount}/4 capas · Línea {timelineSolved ? '✓' : 'pend.'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenHistoricalGlossary}
              className="flex items-center gap-3 rounded-xl border border-[#232A34]/30 bg-[#EFECE4] px-3.5 py-3 text-left transition-colors hover:border-[#1D4E89] hover:bg-[#E6E1D6] cursor-pointer"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#232A34] text-[#F5F3EE]">
                <BookA className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#171B21]">
                  Glosario Unificado
                </div>
                <div className="text-[11px] leading-snug text-[#46515E]">
                  Diccionario A–Z y visual
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenClassroom}
              className="sm:col-span-2 flex items-center justify-between gap-3 rounded-xl border border-[#2A6F4E]/55 bg-[#E8F3EC] px-4 py-3 text-left transition-colors hover:border-[#2A6F4E] hover:bg-[#DDF0E4] cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2A6F4E] text-white">
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#171B21]">
                    Google Classroom
                  </div>
                  <div className="truncate text-[11px] leading-snug text-[#1D543A]">
                    {classroomUserEmail
                      ? `Conectado: ${classroomUserEmail}`
                      : 'Publicar tareas, revisar entregas o compartir tu progreso en clase'}
                  </div>
                </div>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#1D543A] whitespace-nowrap shrink-0">
                {classroomUserEmail ? 'Activo' : 'Conectar'}
              </span>
            </button>
          </div>

          {/* Dynamic Room Environmental Soundscape Controls */}
          <div className="rounded-xl border border-[#232A34]/15 bg-white p-3.5 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F3EC]">
                  {renderAmbientGlyph()}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#171B21]">
                    Sonido ambiental · {ambientMeta.label}
                  </div>
                  <div className="text-[11px] leading-snug text-[#526071]">
                    {ambientMeta.elements}
                  </div>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={ambientEnabled && !muted}
                onClick={onToggleAmbient}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  ambientEnabled && !muted
                    ? 'border-[#2A6F4E] bg-[#2A6F4E] text-white'
                    : 'border-[#232A34]/18 bg-[#F5F3EE] text-[#4A5564] hover:border-[#2A6F4E]'
                }`}
              >
                {ambientEnabled && !muted ? 'Activado' : 'Desactivado'}
              </button>
            </div>

            {ambientEnabled && !muted && (
              <div className="flex items-center justify-between gap-2 border-t border-[#232A34]/10 pt-2.5">
                <span className="text-[11px] font-semibold text-[#526071]">
                  Intensidad del ambiente
                </span>
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { value: 0.28, label: 'Suave' },
                      { value: 0.55, label: 'Medio' },
                      { value: 0.85, label: 'Envolvente' },
                    ] as const
                  ).map((opt) => {
                    const active = ambientVolume === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChangeAmbientVolume(opt.value)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-[#1D4E89] text-white'
                            : 'border border-[#232A34]/15 bg-[#F5F3EE] text-[#333D4B] hover:border-[#1D4E89]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Audio & utility toggles */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {speechAvailable && (
              <button
                type="button"
                onClick={onToggleVoiceAuto}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs font-semibold cursor-pointer ${
                  voiceAuto
                    ? 'border-[#C67D1E] bg-[#F6EAD7] text-[#6E420B]'
                    : 'border-[#232A34]/18 bg-white text-[#232A34] hover:bg-[#EAE6DC]'
                }`}
              >
                <Headphones className="h-4 w-4" aria-hidden="true" />
                <span>
                  {voiceAuto ? 'Voz auto: Activada' : 'Activar voz auto'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onToggleMute}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#232A34]/18 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#232A34] hover:bg-[#EAE6DC] cursor-pointer"
            >
              {muted ? (
                <VolumeX className="h-4 w-4 text-[#A43D2F]" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4 text-[#1D4E89]" aria-hidden="true" />
              )}
              <span>{muted ? 'Activar sonido' : 'Silenciar sonido'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenDua}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#232A34]/18 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#232A34] hover:bg-[#EAE6DC] cursor-pointer"
            >
              <Accessibility className="h-4 w-4 text-[#1D4E89]" aria-hidden="true" />
              <span>Accesibilidad DUA</span>
            </button>

            <button
              type="button"
              onClick={onOpenTeacherGuide}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#232A34]/18 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#232A34] hover:bg-[#EAE6DC] cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-[#1D4E89]" aria-hidden="true" />
              <span>Ficha Docente</span>
            </button>

            <button
              type="button"
              onClick={onReturnTitle}
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg border border-[#232A34]/18 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#232A34] hover:bg-[#EAE6DC] cursor-pointer"
            >
              <Home className="h-4 w-4 text-[#526071]" aria-hidden="true" />
              <span>Portada principal</span>
            </button>

            <button
              type="button"
              onClick={onResetExpedition}
              className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg border border-[#A43D2F]/35 bg-[#F8E5E2] px-3.5 py-2.5 text-xs font-semibold text-[#7D2B20] hover:bg-[#F1D2CD] cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Reiniciar expedición completa</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#232A34]/12 bg-[#EFECE4] px-6 py-3.5">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1D4E89] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#153A68] cursor-pointer"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            <span>Seguir jugando</span>
          </button>
        </div>
      </div>
    </div>
  );
};
