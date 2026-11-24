import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FolderPlus,
  GraduationCap,
  Link2,
  Loader2,
  LogOut,
  Megaphone,
  RefreshCw,
  Send,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { ExpeditionState } from '../types/game';
import { useDialogFocusTrap } from '../utils/useDialogFocusTrap';
import { soundEngine } from '../utils/audio';
import {
  classroomSignOut,
  clearClassroomAccessToken,
  getClassroomAccessToken,
  getCurrentClassroomUser,
  googleClassroomSignIn,
} from '../utils/googleClassroomAuth';
import {
  buildClassLaunchAnnouncementDraft,
  buildDidacticMaterialDraft,
  buildEscapeRoomAssignmentDraft,
  buildProgressAnnouncementDraft,
  ClassroomApiError,
  ClassroomCourse,
  ClassroomSubmission,
  CourseDetailsBundle,
  createClassroomAnnouncement,
  createClassroomCourseWork,
  createClassroomMaterial,
  createClassroomTopic,
  fetchClassroomCourses,
  fetchCourseDetails,
  fetchStudentSubmissions,
} from '../utils/googleClassroomApi';

export type ClassroomLaunchMode = 'assignment' | 'shareProgress';

interface GoogleClassroomModalProps {
  state: ExpeditionState;
  defaultMode?: ClassroomLaunchMode;
  onAuthChange?: (user: User | null) => void;
  onClose: () => void;
}

type ModalTab = 'publish' | 'coursework' | 'stream' | 'roster';
type PublishKind = 'assignment' | 'announcement' | 'material' | 'topic';

type PendingWriteAction =
  | {
      kind: 'assignment';
      course: ClassroomCourse;
      title: string;
      description: string;
      maxPoints?: number;
      topicId?: string;
      topicName?: string;
      linkUrl?: string;
    }
  | {
      kind: 'announcement';
      course: ClassroomCourse;
      text: string;
      linkUrl?: string;
    }
  | {
      kind: 'material';
      course: ClassroomCourse;
      title: string;
      description: string;
      topicId?: string;
      topicName?: string;
      linkUrl?: string;
    }
  | {
      kind: 'topic';
      course: ClassroomCourse;
      name: string;
    };

const EMPTY_DETAILS: CourseDetailsBundle = {
  courseWork: [],
  announcements: [],
  materials: [],
  topics: [],
  students: [],
};

const SUBMISSION_STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  TURNED_IN: { label: 'Entregada', tone: 'text-[#1D543A] bg-[#E8F3EC] border-[#2A6F4E]/35' },
  RETURNED: { label: 'Devuelta', tone: 'text-[#1D4E89] bg-[#E8F0FA] border-[#1D4E89]/35' },
  CREATED: { label: 'Asignada', tone: 'text-[#526071] bg-[#F5F3EE] border-[#232A34]/15' },
  NEW: { label: 'Sin iniciar', tone: 'text-[#526071] bg-[#F5F3EE] border-[#232A34]/15' },
  RECLAIMED_BY_STUDENT: {
    label: 'Recuperada',
    tone: 'text-[#8A5410] bg-[#FAF4E8] border-[#C67D1E]/35',
  },
};

function formatIsoDate(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function getSafeAppUrl(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
}

export const GoogleSignInButton: React.FC<{
  onClick: () => void;
  loading?: boolean;
  label?: string;
}> = ({ onClick, loading = false, label = 'Iniciar sesión con Google' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="inline-flex items-center justify-center gap-3 rounded-lg border border-[#747775] bg-white px-5 py-2.5 text-sm font-semibold text-[#1F1F1F] shadow-sm transition-colors hover:bg-[#F8FAFD] hover:shadow active:bg-[#EEF2F7] disabled:opacity-60 cursor-pointer"
  >
    {loading ? (
      <Loader2 className="h-5 w-5 animate-spin text-[#4285F4]" aria-hidden="true" />
    ) : (
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="h-5 w-5 shrink-0"
        aria-hidden="true"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
        <path fill="none" d="M0 0h48v48H0z" />
      </svg>
    )}
    <span>{loading ? 'Conectando con Google…' : label}</span>
  </button>
);

export const GoogleClassroomModal: React.FC<GoogleClassroomModalProps> = ({
  state,
  defaultMode = 'assignment',
  onAuthChange,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocusTrap(dialogRef, true);

  const [user, setUser] = useState<User | null>(() => getCurrentClassroomUser());
  const [token, setToken] = useState<string | null>(() => getClassroomAccessToken());
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [details, setDetails] = useState<CourseDetailsBundle>(EMPTY_DETAILS);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [activeTab, setActiveTab] = useState<ModalTab>('publish');
  const [publishKind, setPublishKind] = useState<PublishKind>(
    defaultMode === 'shareProgress' ? 'announcement' : 'assignment'
  );

  // Assignment form state
  const assignmentDraft = useMemo(
    () => buildEscapeRoomAssignmentDraft(state),
    [state]
  );
  const materialDraft = useMemo(
    () => buildDidacticMaterialDraft(state),
    [state]
  );

  const [assignmentTitle, setAssignmentTitle] = useState(assignmentDraft.title);
  const [assignmentDesc, setAssignmentDesc] = useState(assignmentDraft.description);
  const [assignmentPoints, setAssignmentPoints] = useState<string>(
    String(assignmentDraft.maxPoints)
  );
  const [assignmentTopicId, setAssignmentTopicId] = useState<string>('');
  const [assignmentAttachLink, setAssignmentAttachLink] = useState(true);

  // Announcement form state
  const [announcementText, setAnnouncementText] = useState(() =>
    defaultMode === 'shareProgress'
      ? buildProgressAnnouncementDraft(state)
      : buildClassLaunchAnnouncementDraft(state)
  );
  const [announcementAttachLink, setAnnouncementAttachLink] = useState(
    defaultMode !== 'shareProgress'
  );

  // Material form state
  const [materialTitle, setMaterialTitle] = useState(materialDraft.title);
  const [materialDesc, setMaterialDesc] = useState(materialDraft.description);
  const [materialTopicId, setMaterialTopicId] = useState<string>('');
  const [materialAttachLink, setMaterialAttachLink] = useState(true);

  // Topic form state
  const [topicName, setTopicName] = useState('Ecos de Tamarán · Gran Canaria');

  // Submissions viewer state
  const [expandedWorkId, setExpandedWorkId] = useState<string | null>(null);
  const [submissionsByWork, setSubmissionsByWork] = useState<
    Record<string, ClassroomSubmission[]>
  >({});
  const [loadingSubmissionsId, setLoadingSubmissionsId] = useState<string | null>(
    null
  );

  // Confirmation & feedback banners
  const [pendingWrite, setPendingWrite] = useState<PendingWriteAction | null>(
    null
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<{
    message: string;
    link?: string;
  } | null>(null);

  const needsAuth = !token || !user;

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) ?? null,
    [courses, selectedCourseId]
  );

  const handleApiError = useCallback((err: unknown, fallback: string) => {
    if (err instanceof ClassroomApiError) {
      if (err.needsReauth) {
        clearClassroomAccessToken();
        setToken(null);
        setErrorMsg(
          'Tu sesión de Google Classroom ha caducado. Vuelve a iniciar sesión con Google.'
        );
        return;
      }
      if (err.status === 403) {
        setErrorMsg(
          'No tienes permisos para realizar esta acción en esta clase de Google Classroom (verifica si tu cuenta es docente en este curso).'
        );
        return;
      }
      setErrorMsg(err.message);
      return;
    }
    setErrorMsg(err instanceof Error ? err.message : fallback);
  }, []);

  const loadCourses = useCallback(
    async (accessToken: string) => {
      setLoadingCourses(true);
      setErrorMsg(null);
      try {
        const list = await fetchClassroomCourses(accessToken);
        setCourses(list);
        setSelectedCourseId((prev) => {
          if (prev && list.some((c) => c.id === prev)) return prev;
          return list[0]?.id ?? '';
        });
      } catch (err) {
        handleApiError(err, 'No se pudieron cargar tus clases de Google Classroom.');
      } finally {
        setLoadingCourses(false);
      }
    },
    [handleApiError]
  );

  const loadDetails = useCallback(
    async (accessToken: string, course: ClassroomCourse) => {
      setLoadingDetails(true);
      setErrorMsg(null);
      setExpandedWorkId(null);
      try {
        const bundle = await fetchCourseDetails(
          accessToken,
          course.id,
          course.role
        );
        setDetails(bundle);
      } catch (err) {
        handleApiError(err, 'No se pudieron cargar los datos de esta clase.');
      } finally {
        setLoadingDetails(false);
      }
    },
    [handleApiError]
  );

  useEffect(() => {
    if (token) {
      void loadCourses(token);
    }
  }, [token, loadCourses]);

  useEffect(() => {
    if (token && selectedCourse) {
      void loadDetails(token, selectedCourse);
      if (selectedCourse.role === 'student' && publishKind !== 'announcement') {
        setPublishKind('announcement');
      }
    } else {
      setDetails(EMPTY_DETAILS);
    }
  }, [token, selectedCourse, loadDetails]);

  const handleSignIn = async () => {
    soundEngine.playClick();
    setIsSigningIn(true);
    setErrorMsg(null);
    setSuccessBanner(null);
    try {
      const result = await googleClassroomSignIn();
      setUser(result.user);
      setToken(result.accessToken);
      onAuthChange?.(result.user);
      soundEngine.playSuccess();
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: string }).code)
          : '';
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg(
          'Se cerró la ventana de acceso antes de completar el inicio de sesión.'
        );
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg(
          'El navegador bloqueó la ventana emergente de Google. Permite las ventanas emergentes para este sitio e inténtalo de nuevo.'
        );
      } else {
        handleApiError(err, 'No se pudo iniciar sesión con Google.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    soundEngine.playClick();
    await classroomSignOut();
    setUser(null);
    setToken(null);
    setCourses([]);
    setSelectedCourseId('');
    setDetails(EMPTY_DETAILS);
    setSuccessBanner(null);
    setErrorMsg(null);
    onAuthChange?.(null);
  };

  const handleToggleSubmissions = async (workId: string) => {
    if (!token || !selectedCourse) return;
    soundEngine.playClick();
    if (expandedWorkId === workId) {
      setExpandedWorkId(null);
      return;
    }
    setExpandedWorkId(workId);
    if (submissionsByWork[workId]) return;

    setLoadingSubmissionsId(workId);
    try {
      const subs = await fetchStudentSubmissions(token, selectedCourse.id, workId);
      setSubmissionsByWork((prev) => ({ ...prev, [workId]: subs }));
    } catch (err) {
      handleApiError(err, 'No se pudieron consultar las entregas de esta tarea.');
    } finally {
      setLoadingSubmissionsId(null);
    }
  };

  const requestPublishConfirmation = () => {
    if (!selectedCourse) return;
    soundEngine.playClick();
    setErrorMsg(null);
    setSuccessBanner(null);

    const appUrl = getSafeAppUrl();

    if (publishKind === 'assignment') {
      if (!assignmentTitle.trim()) {
        setErrorMsg('Escribe un título para la tarea antes de publicarla.');
        return;
      }
      const parsedPoints = Number(assignmentPoints);
      const topicObj = details.topics.find((t) => t.topicId === assignmentTopicId);
      setPendingWrite({
        kind: 'assignment',
        course: selectedCourse,
        title: assignmentTitle.trim(),
        description: assignmentDesc.trim(),
        maxPoints: Number.isFinite(parsedPoints) && parsedPoints > 0 ? parsedPoints : undefined,
        topicId: assignmentTopicId || undefined,
        topicName: topicObj?.name,
        linkUrl: assignmentAttachLink && appUrl ? appUrl : undefined,
      });
    } else if (publishKind === 'announcement') {
      if (!announcementText.trim()) {
        setErrorMsg('Escribe el texto del anuncio antes de publicarlo.');
        return;
      }
      setPendingWrite({
        kind: 'announcement',
        course: selectedCourse,
        text: announcementText.trim(),
        linkUrl: announcementAttachLink && appUrl ? appUrl : undefined,
      });
    } else if (publishKind === 'material') {
      if (!materialTitle.trim()) {
        setErrorMsg('Escribe un título para el material didáctico.');
        return;
      }
      const topicObj = details.topics.find((t) => t.topicId === materialTopicId);
      setPendingWrite({
        kind: 'material',
        course: selectedCourse,
        title: materialTitle.trim(),
        description: materialDesc.trim(),
        topicId: materialTopicId || undefined,
        topicName: topicObj?.name,
        linkUrl: materialAttachLink && appUrl ? appUrl : undefined,
      });
    } else if (publishKind === 'topic') {
      if (!topicName.trim()) {
        setErrorMsg('Escribe un nombre para el tema de Classroom.');
        return;
      }
      setPendingWrite({
        kind: 'topic',
        course: selectedCourse,
        name: topicName.trim(),
      });
    }
  };

  const executeConfirmedWrite = async () => {
    if (!pendingWrite || !token) return;
    setIsPublishing(true);
    setErrorMsg(null);

    try {
      if (pendingWrite.kind === 'assignment') {
        const created = await createClassroomCourseWork(
          token,
          pendingWrite.course.id,
          {
            title: pendingWrite.title,
            description: pendingWrite.description,
            maxPoints: pendingWrite.maxPoints,
            topicId: pendingWrite.topicId,
            linkUrl: pendingWrite.linkUrl,
          }
        );
        soundEngine.playSuccess();
        setSuccessBanner({
          message: `Tarea «${created.title}» publicada en ${pendingWrite.course.name}.`,
          link: created.alternateLink,
        });
      } else if (pendingWrite.kind === 'announcement') {
        const created = await createClassroomAnnouncement(
          token,
          pendingWrite.course.id,
          {
            text: pendingWrite.text,
            linkUrl: pendingWrite.linkUrl,
          }
        );
        soundEngine.playSuccess();
        setSuccessBanner({
          message: `Anuncio publicado en el tablón de ${pendingWrite.course.name}.`,
          link: created.alternateLink,
        });
      } else if (pendingWrite.kind === 'material') {
        const created = await createClassroomMaterial(
          token,
          pendingWrite.course.id,
          {
            title: pendingWrite.title,
            description: pendingWrite.description,
            topicId: pendingWrite.topicId,
            linkUrl: pendingWrite.linkUrl,
          }
        );
        soundEngine.playSuccess();
        setSuccessBanner({
          message: `Material «${created.title}» publicado en ${pendingWrite.course.name}.`,
          link: created.alternateLink,
        });
      } else if (pendingWrite.kind === 'topic') {
        const created = await createClassroomTopic(
          token,
          pendingWrite.course.id,
          pendingWrite.name
        );
        soundEngine.playSuccess();
        setSuccessBanner({
          message: `Tema «${created.name}» creado en ${pendingWrite.course.name}.`,
        });
      }

      const courseToRefresh = pendingWrite.course;
      setPendingWrite(null);
      await loadDetails(token, courseToRefresh);
    } catch (err) {
      setPendingWrite(null);
      handleApiError(err, 'No se pudo completar la publicación en Google Classroom.');
    } finally {
      setIsPublishing(false);
    }
  };

  const studentNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of details.students) {
      const name = s.profile?.name?.fullName || s.profile?.emailAddress || s.userId;
      map.set(s.userId, name);
    }
    return map;
  }, [details.students]);

  const topicNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of details.topics) {
      map.set(t.topicId, t.name);
    }
    return map;
  }, [details.topics]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-classroom-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C1016]/84 p-3 sm:p-5"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#232A34]/15 bg-[#F5F3EE] text-[#232A34] shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-[#232A34]/12 bg-[#EAE6DC] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2A6F4E] text-white shadow-sm">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="font-mono text-[11px] font-semibold text-[#1D543A]">
                Conexión de aula · Google Classroom
              </div>
              <h2
                id="google-classroom-modal-title"
                className="font-display text-xl font-bold text-[#171B21] sm:text-2xl truncate"
              >
                Google Classroom en Ecos de Tamarán
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar Google Classroom"
            className="rounded-lg p-2 text-[#526071] hover:bg-[#232A34]/10 hover:text-[#171B21] shrink-0 cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 space-y-5">
          {/* Error alert */}
          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-[#A43D2F]/35 bg-[#F8E5E2] px-4 py-3 text-xs text-[#7D2B20]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                aria-label="Ocultar aviso"
                className="rounded p-0.5 hover:bg-[#7D2B20]/10 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Success banner */}
          {successBanner && (
            <div
              aria-live="polite"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2A6F4E]/40 bg-[#E8F3EC] px-4 py-3 text-xs font-semibold text-[#1D543A]"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{successBanner.message}</span>
              </div>
              {successBanner.link && (
                <a
                  href={successBanner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-[#2A6F4E]/40 bg-white px-2.5 py-1 text-[11px] font-bold text-[#1D543A] hover:bg-[#F5F3EE] whitespace-nowrap"
                >
                  <span>Abrir en Classroom</span>
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>
          )}

          {needsAuth ? (
            /* Sign-in Onboarding View */
            <div className="rounded-2xl border border-[#232A34]/12 bg-white p-6 sm:p-8 text-center space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8F3EC] text-[#2A6F4E]">
                <GraduationCap className="h-9 w-9" aria-hidden="true" />
              </div>

              <div className="mx-auto max-w-xl space-y-2">
                <h3 className="font-display text-xl font-bold text-[#171B21]">
                  Conecta tus clases de Google Classroom
                </h3>
                <p className="text-sm leading-relaxed text-[#46515E]">
                  Inicia sesión con tu cuenta de Google para gestionar tus clases directamente
                  desde el Escape Room. Siempre te pediremos confirmación antes de publicar
                  cualquier tarea, material o anuncio.
                </p>
              </div>

              <div className="grid gap-3 text-left sm:grid-cols-3 max-w-2xl mx-auto pt-1">
                <div className="rounded-xl border border-[#232A34]/10 bg-[#FAF8F4] p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1D4E89]">
                    <ClipboardList className="h-4 w-4" aria-hidden="true" />
                    <span>Tareas del Escape Room</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#526071]">
                    Publica la expedición adaptada a 2.º o 3.º Ciclo con criterios LOMLOE y enlace directo.
                  </p>
                </div>

                <div className="rounded-xl border border-[#232A34]/10 bg-[#FAF8F4] p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2A6F4E]">
                    <Megaphone className="h-4 w-4" aria-hidden="true" />
                    <span>Tablón y entregas</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#526071]">
                    Comparte el resumen de tu expedición en el tablón o consulta el estado de las entregas.
                  </p>
                </div>

                <div className="rounded-xl border border-[#232A34]/10 bg-[#FAF8F4] p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8A5410]">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    <span>Control total</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-[#526071]">
                    Sesión segura solo en memoria del navegador y confirmación explícita en cada publicación.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <GoogleSignInButton
                  onClick={handleSignIn}
                  loading={isSigningIn}
                />
              </div>
            </div>
          ) : (
            /* Signed-In Classroom Workspace */
            <>
              {/* Account Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#232A34]/12 bg-white px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName ?? 'Usuario Google'}
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 rounded-full border border-[#232A34]/15 object-cover shrink-0"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D4E89] text-xs font-bold text-white shrink-0">
                      {(user.displayName || user.email || 'G')[0].toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-[#171B21]">
                      {user.displayName || 'Cuenta de Google conectada'}
                    </div>
                    <div className="truncate text-xs text-[#526071]">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => token && loadCourses(token)}
                    disabled={loadingCourses}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#232A34]/18 bg-[#F5F3EE] px-3 py-1.5 text-xs font-semibold text-[#232A34] hover:border-[#1D4E89] disabled:opacity-60 cursor-pointer"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${loadingCourses ? 'animate-spin' : ''}`}
                      aria-hidden="true"
                    />
                    <span>Actualizar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#A43D2F]/30 bg-[#F8E5E2] px-3 py-1.5 text-xs font-semibold text-[#7D2B20] hover:bg-[#F1D2CD] cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>

              {/* Course Picker */}
              {loadingCourses ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-[#232A34]/10 bg-white py-10 text-sm text-[#526071]">
                  <Loader2 className="h-5 w-5 animate-spin text-[#1D4E89]" aria-hidden="true" />
                  <span>Cargando tus clases de Google Classroom…</span>
                </div>
              ) : courses.length === 0 ? (
                <div className="rounded-xl border border-[#232A34]/12 bg-white p-6 text-center space-y-2">
                  <div className="font-display text-base font-bold text-[#171B21]">
                    No se encontraron clases activas
                  </div>
                  <p className="text-xs text-[#526071] max-w-md mx-auto leading-relaxed">
                    Tu cuenta ({user.email}) no tiene cursos activos en Google Classroom todavía.
                    Crea o únete a una clase en Classroom y pulsa «Actualizar».
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="classroom-course-select"
                      className="block text-xs font-bold text-[#526071] mb-1.5"
                    >
                      Clase activa ({courses.length}{' '}
                      {courses.length === 1 ? 'curso disponible' : 'cursos disponibles'})
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        id="classroom-course-select"
                        value={selectedCourseId}
                        onChange={(e) => {
                          soundEngine.playClick();
                          setSelectedCourseId(e.target.value);
                          setSuccessBanner(null);
                        }}
                        className="flex-1 min-w-[240px] rounded-xl border border-[#232A34]/20 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#171B21] focus:border-[#1D4E89]"
                      >
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                            {c.section ? ` — ${c.section}` : ''} (
                            {c.role === 'teacher' ? 'Docente' : 'Estudiante'})
                          </option>
                        ))}
                      </select>

                      {selectedCourse && (
                        <span
                          className={`rounded-lg border px-2.5 py-2 text-xs font-bold whitespace-nowrap ${
                            selectedCourse.role === 'teacher'
                              ? 'border-[#2A6F4E]/35 bg-[#E8F3EC] text-[#1D543A]'
                              : 'border-[#1D4E89]/35 bg-[#E8F0FA] text-[#1D4E89]'
                          }`}
                        >
                          {selectedCourse.role === 'teacher'
                            ? 'Rol: Docente'
                            : 'Rol: Estudiante'}
                        </span>
                      )}

                      {selectedCourse?.alternateLink && (
                        <a
                          href={selectedCourse.alternateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#232A34]/18 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1D4E89] hover:border-[#1D4E89] whitespace-nowrap"
                        >
                          <span>Abrir clase</span>
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Workspace Tabs */}
                  {selectedCourse && (
                    <>
                      <div
                        role="tablist"
                        aria-label="Secciones de la clase"
                        className="flex flex-wrap gap-1.5 border-b border-[#232A34]/12 pb-2"
                      >
                        {(
                          [
                            {
                              id: 'publish' as const,
                              label: 'Publicar desde el juego',
                              icon: Send,
                            },
                            {
                              id: 'coursework' as const,
                              label: `Tareas (${details.courseWork.length})`,
                              icon: ClipboardList,
                            },
                            {
                              id: 'stream' as const,
                              label: `Tablón y materiales (${
                                details.announcements.length + details.materials.length
                              })`,
                              icon: BookOpen,
                            },
                            ...(selectedCourse.role === 'teacher'
                              ? [
                                  {
                                    id: 'roster' as const,
                                    label: `Alumnado (${details.students.length})`,
                                    icon: Users,
                                  },
                                ]
                              : []),
                          ] as const
                        ).map((tab) => {
                          const Icon = tab.icon;
                          const active = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              role="tab"
                              aria-selected={active}
                              onClick={() => {
                                soundEngine.playClick();
                                setActiveTab(tab.id);
                              }}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                                active
                                  ? 'bg-[#1D4E89] text-white'
                                  : 'bg-white border border-[#232A34]/15 text-[#333D4B] hover:border-[#1D4E89]'
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {loadingDetails ? (
                        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#232A34]/10 bg-white py-10 text-xs text-[#526071]">
                          <Loader2 className="h-4 w-4 animate-spin text-[#1D4E89]" aria-hidden="true" />
                          <span>Sincronizando datos de {selectedCourse.name}…</span>
                        </div>
                      ) : (
                        <>
                          {/* TAB 1: PUBLISH FROM ECOS DE TAMARAN */}
                          {activeTab === 'publish' && (
                            <div className="space-y-4">
                              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                {selectedCourse.role === 'teacher' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundEngine.playClick();
                                      setPublishKind('assignment');
                                    }}
                                    className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                                      publishKind === 'assignment'
                                        ? 'border-[#1D4E89] bg-[#E8F0FA] text-[#171B21] font-bold'
                                        : 'border-[#232A34]/15 bg-white text-[#46515E] hover:border-[#1D4E89]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 font-bold">
                                      <ClipboardList className="h-3.5 w-3.5 text-[#1D4E89]" />
                                      <span>Crear tarea</span>
                                    </div>
                                    <div className="mt-0.5 text-[11px] font-normal text-[#526071]">
                                      Asignar el Escape Room
                                    </div>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    soundEngine.playClick();
                                    setPublishKind('announcement');
                                  }}
                                  className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                                    publishKind === 'announcement'
                                      ? 'border-[#2A6F4E] bg-[#E8F3EC] text-[#171B21] font-bold'
                                      : 'border-[#232A34]/15 bg-white text-[#46515E] hover:border-[#2A6F4E]'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 font-bold">
                                    <Megaphone className="h-3.5 w-3.5 text-[#2A6F4E]" />
                                    <span>Anuncio / Progreso</span>
                                  </div>
                                  <div className="mt-0.5 text-[11px] font-normal text-[#526071]">
                                    Publicar en el tablón
                                  </div>
                                </button>

                                {selectedCourse.role === 'teacher' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundEngine.playClick();
                                      setPublishKind('material');
                                    }}
                                    className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                                      publishKind === 'material'
                                        ? 'border-[#C67D1E] bg-[#FAF4E8] text-[#171B21] font-bold'
                                        : 'border-[#232A34]/15 bg-white text-[#46515E] hover:border-[#C67D1E]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 font-bold">
                                      <BookOpen className="h-3.5 w-3.5 text-[#8A5410]" />
                                      <span>Material LOMLOE</span>
                                    </div>
                                    <div className="mt-0.5 text-[11px] font-normal text-[#526071]">
                                      Recurso sin calificación
                                    </div>
                                  </button>
                                )}

                                {selectedCourse.role === 'teacher' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      soundEngine.playClick();
                                      setPublishKind('topic');
                                    }}
                                    className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                                      publishKind === 'topic'
                                        ? 'border-[#232A34] bg-[#EFECE4] text-[#171B21] font-bold'
                                        : 'border-[#232A34]/15 bg-white text-[#46515E] hover:border-[#232A34]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 font-bold">
                                      <FolderPlus className="h-3.5 w-3.5 text-[#232A34]" />
                                      <span>Crear tema</span>
                                    </div>
                                    <div className="mt-0.5 text-[11px] font-normal text-[#526071]">
                                      Organizar Trabajo de clase
                                    </div>
                                  </button>
                                )}
                              </div>

                              {/* Forms */}
                              <div className="rounded-xl border border-[#232A34]/12 bg-white p-4 sm:p-5 space-y-3.5">
                                {publishKind === 'assignment' && (
                                  <>
                                    <div>
                                      <label
                                        htmlFor="gc-assign-title"
                                        className="block text-xs font-bold text-[#333D4B] mb-1"
                                      >
                                        Título de la tarea
                                      </label>
                                      <input
                                        id="gc-assign-title"
                                        type="text"
                                        value={assignmentTitle}
                                        onChange={(e) => setAssignmentTitle(e.target.value)}
                                        className="w-full rounded-lg border border-[#232A34]/20 bg-[#FAF8F4] px-3 py-2 text-sm text-[#171B21]"
                                      />
                                    </div>

                                    <div>
                                      <label
                                        htmlFor="gc-assign-desc"
                                        className="block text-xs font-bold text-[#333D4B] mb-1"
                                      >
                                        Instrucciones para el alumnado
                                      </label>
                                      <textarea
                                        id="gc-assign-desc"
                                        rows={6}
                                        value={assignmentDesc}
                                        onChange={(e) => setAssignmentDesc(e.target.value)}
                                        className="w-full rounded-lg border border-[#232A34]/20 bg-[#FAF8F4] px-3 py-2 text-xs leading-relaxed text-[#171B21]"
                                      />
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                      <div>
                                        <label
                                          htmlFor="gc-assign-points"
                                          className="block text-xs font-bold text-[#333D4B] mb-1"
                                        >
                                          Puntuación máxima (0 = sin calificar)
                                        </label>
                                        <input
                                          id="gc-assign-points"
                                          type="number"
                                          min={0}
                                          max={100}
                                          value={assignmentPoints}
                                          onChange={(e) => setAssignmentPoints(e.target.value)}
                                          className="w-full rounded-lg border border-[#232A34]/20 bg-[#FAF8F4] px-3 py-2 text-sm text-[#171B21]"
                                        />
                                      </div>

                                      <div>
                                        <label
                                          htmlFor="gc-assign-topic"
                                          className="block text-xs font-bold text-[#333D4B] mb-1"
                                        >
                                          Tema de Classroom (opcional)
                                        </label>
                                        <select
                                          id="gc-assign-topic"
                                          value={assignmentTopicId}
                                          onChange={(e) => setAssignmentTopicId(e.target.value)}
                                          className="w-full rounded-lg border border-[#232A34]/20 bg-[#FAF8F4] px-3 py-2 text-sm text-[#171B21]"
                                        >
                                          <option value="">Sin tema</option>
                                          {details.topics.map((t) => (
                                            <option key={t.topicId} value={t.topicId}>
                                              {t.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    <label className="flex items-center gap-2 text-xs text-[#333D4B] cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={assignmentAttachLink}
                                        onChange={(e) =>
                                          setAssignmentAttachLink(e.target.checked)
                                        }
                                        className="h-4 w-4 rounded border-[#232A34]/30"
                                      />
                                      <Link2 className="h-3.5 w-3.5 text-[#1D4E89]" />
                                      <span>
                                        Adjuntar enlace directo a Ecos de Tamarán
                                      </span>
                                    </label>
                                  </>
                                )}

                                {publishKind === 'announcement' && (
                                  <>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <label
                                        htmlFor="gc-ann-text"
                                        className="text-xs font-bold text-[#333D4B]"
                                      >
                                        Mensaje para el tablón de {selectedCourse.name}
                                      </label>
                                      <div className="flex flex-wrap gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            soundEngine.playClick();
                                            setAnnouncementText(
                                              buildProgressAnnouncementDraft(state)
                                            );
                                          }}
                                          className="rounded-md border border-[#2A6F4E]/35 bg-[#E8F3EC] px-2.5 py-1 text-[11px] font-bold text-[#1D543A] hover:bg-[#DDF0E4] cursor-pointer"
                                        >
                                          Cargar mi progreso
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            soundEngine.playClick();
                                            setAnnouncementText(
                                              buildClassLaunchAnnouncementDraft(state)
                                            );
                                          }}
                                          className="rounded-md border border-[#1D4E89]/35 bg-[#E8F0FA] px-2.5 py-1 text-[11px] font-bold text-[#1D4E89] hover:bg-[#DAE7F7] cursor-pointer"
                                        >
                                          Plantilla de lanzamiento
                                        </button>
                                      </div>
                                    </div>

                                    <textarea
                                      id="gc-ann-text"
                                      rows={5}
                                      value={announcementText}
                                      onChange={(e) => setAnnouncementText(e.target.value)}
                                      className="w-full rounded-lg border border-[#232A34]/20 bg-[#FAF8F4] px-3 py-2 text-xs leading-relaxed text-[#171B21]"
                                    />

                                    <label className="flex items-center gap-2 text-xs text-[#333D4B] cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={announcementAttachLink}
                                        onChange={(e) =>
                                          setAnnouncementAttachLink(e.target.checked)
                                        }
                                        className="h-4 w-4 rounded border-[#232A34]/30"
                                      />
                                      <Link2 className="h-3.5 w-3.5 text-[#1D4E89]" />
                                      <span>Adjuntar enlace a la aplicación</span>
                                    </label>
                                  </>
                                )}

                                {publishKind === 'material' && (
                                  <>
                                    <div>
                                      <label
                                        htmlFor="gc-mat-title"
                                        className="block text-xs font-bold text-[#333D4B] mb-1"
                                      >
                                        Título del material
                                      </label>
                                      <input
                                        id="gc-mat-title"
                                        type="text"
                                        value={materialTitle}
                                        onChange={(e) => setMaterialTitle(e.target.value)}
                                        className="w-full rounded-lg border border-[#232A34]/20 bg-[#FAF8F4] px-3 py-2 text-sm text-[#171B21]"
                                      />
                                    </div>

                                    <div>
                                      <label
                                        htmlFor="gc-mat-desc"
                                        className="block text-xs font-bold text-[#333D4B] mb-1"
                                      >
                                        Descripción curricular
                                      </label>
                                      <textarea
                                        id="gc-mat-desc"
                                        rows={5}
                                        value={materialDesc}
                                        onChange={(e) => setMaterialDesc(e.target.value)}
                                        className="w-full rounded-lg border border-[#232A34]/20 bg-[#FAF8F4] px-3 py-2 text-xs leading-relaxed text-[#171B21]"
                                      />
                                    </div>

                                    <div>
                                      <label
                                        htmlFor="gc-mat-topic"
                                        className="block text-xs font-bold text-[#333D4B] mb-1"
                                      >
                                        Tema de Classroom (opcional)
                                      </label>
                                      <select
                                        id="gc-mat-topic"
                                        value={materialTopicId}
                                        onChange={(e) => setMaterialTopicId(e.target.value)}
                                        className="w-full rounded-lg border border-[#232A34]/20 bg-[#FAF8F4] px-3 py-2 text-sm text-[#171B21]"
                                      >
                                        <option value="">Sin tema</option>
                                        {details.topics.map((t) => (
                                          <option key={t.topicId} value={t.topicId}>
                                            {t.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <label className="flex items-center gap-2 text-xs text-[#333D4B] cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={materialAttachLink}
                                        onChange={(e) =>
                                          setMaterialAttachLink(e.target.checked)
                                        }
                                        className="h-4 w-4 rounded border-[#232A34]/30"
                                      />
                                      <Link2 className="h-3.5 w-3.5 text-[#1D4E89]" />
                                      <span>Adjuntar enlace a Ecos de Tamarán</span>
                                    </label>
                                  </>
                                )}

                                {publishKind === 'topic' && (
                                  <div>
                                    <label
                                      htmlFor="gc-topic-name"
                                      className="block text-xs font-bold text-[#333D4B] mb-1"
                                    >
                                      Nombre del nuevo tema en Trabajo de clase
                                    </label>
                                    <input
                                      id="gc-topic-name"
                                      type="text"
                                      value={topicName}
                                      onChange={(e) => setTopicName(e.target.value)}
                                      placeholder="Ej. Ecos de Tamarán · Conocimiento del Medio"
                                      className="w-full rounded-lg border border-[#232A34]/20 bg-[#FAF8F4] px-3 py-2 text-sm text-[#171B21]"
                                    />
                                    {details.topics.length > 0 && (
                                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                                        {details.topics.map((t) => (
                                          <span
                                            key={t.topicId}
                                            className="rounded-md border border-[#232A34]/12 bg-[#F5F3EE] px-2 py-0.5 text-[11px] text-[#526071]"
                                          >
                                            {t.name}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="flex justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={requestPublishConfirmation}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#2A6F4E] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#1E563B] cursor-pointer"
                                  >
                                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>Revisar y publicar en Classroom</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TAB 2: COURSEWORK & SUBMISSIONS */}
                          {activeTab === 'coursework' && (
                            <div className="space-y-3">
                              {details.courseWork.length === 0 ? (
                                <div className="rounded-xl border border-[#232A34]/12 bg-white p-6 text-center text-xs text-[#526071]">
                                  Aún no hay tareas publicadas en esta clase.
                                </div>
                              ) : (
                                details.courseWork.map((work) => {
                                  const isExpanded = expandedWorkId === work.id;
                                  const subs = submissionsByWork[work.id] ?? [];
                                  const topicLabel = work.topicId
                                    ? topicNameById.get(work.topicId)
                                    : undefined;

                                  return (
                                    <div
                                      key={work.id}
                                      className="rounded-xl border border-[#232A34]/12 bg-white p-4 space-y-2.5"
                                    >
                                      <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div className="min-w-0">
                                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#526071]">
                                            {topicLabel && (
                                              <span className="font-semibold text-[#1D4E89]">
                                                {topicLabel}
                                              </span>
                                            )}
                                            {work.maxPoints ? (
                                              <span className="font-mono">
                                                {work.maxPoints} pts
                                              </span>
                                            ) : (
                                              <span>Sin calificar</span>
                                            )}
                                            {work.creationTime && (
                                              <span>· {formatIsoDate(work.creationTime)}</span>
                                            )}
                                          </div>
                                          <h3 className="text-sm font-bold text-[#171B21]">
                                            {work.title}
                                          </h3>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          {selectedCourse.role === 'teacher' && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                void handleToggleSubmissions(work.id)
                                              }
                                              className="rounded-lg border border-[#1D4E89]/30 bg-[#E8F0FA] px-3 py-1.5 text-[11px] font-bold text-[#1D4E89] hover:bg-[#DAE7F7] cursor-pointer"
                                            >
                                              {isExpanded
                                                ? 'Ocultar entregas'
                                                : 'Ver entregas'}
                                            </button>
                                          )}
                                          {work.alternateLink && (
                                            <a
                                              href={work.alternateLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 rounded-lg border border-[#232A34]/18 bg-[#F5F3EE] px-2.5 py-1.5 text-[11px] font-semibold text-[#232A34] hover:border-[#1D4E89]"
                                            >
                                              <span>Abrir</span>
                                              <ExternalLink className="h-3 w-3" />
                                            </a>
                                          )}
                                        </div>
                                      </div>

                                      {work.description && (
                                        <p className="text-xs leading-relaxed text-[#46515E] line-clamp-3 whitespace-pre-line">
                                          {work.description}
                                        </p>
                                      )}

                                      {isExpanded && (
                                        <div className="mt-2 rounded-lg border border-[#232A34]/10 bg-[#FAF8F4] p-3">
                                          {loadingSubmissionsId === work.id ? (
                                            <div className="flex items-center gap-2 text-xs text-[#526071]">
                                              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1D4E89]" />
                                              <span>Consultando entregas del alumnado…</span>
                                            </div>
                                          ) : subs.length === 0 ? (
                                            <div className="text-xs text-[#526071]">
                                              No hay entregas registradas todavía para esta tarea.
                                            </div>
                                          ) : (
                                            <div className="space-y-1.5">
                                              <div className="text-[11px] font-bold text-[#526071]">
                                                Entregas ({subs.length})
                                              </div>
                                              <ul className="divide-y divide-[#232A34]/10">
                                                {subs.map((sub) => {
                                                  const statusMeta =
                                                    SUBMISSION_STATUS_LABELS[
                                                      sub.state ?? 'NEW'
                                                    ] ?? SUBMISSION_STATUS_LABELS.NEW;
                                                  const stuName =
                                                    studentNameById.get(sub.userId) ??
                                                    `Estudiante ${sub.userId.slice(-5)}`;
                                                  return (
                                                    <li
                                                      key={sub.id}
                                                      className="flex flex-wrap items-center justify-between gap-2 py-1.5 text-xs"
                                                    >
                                                      <span className="font-semibold text-[#171B21]">
                                                        {stuName}
                                                      </span>
                                                      <div className="flex items-center gap-2">
                                                        {typeof sub.assignedGrade ===
                                                          'number' && (
                                                          <span className="font-mono text-[11px] font-bold text-[#1D4E89]">
                                                            Nota: {sub.assignedGrade}
                                                          </span>
                                                        )}
                                                        <span
                                                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusMeta.tone}`}
                                                        >
                                                          {statusMeta.label}
                                                          {sub.late ? ' (tarde)' : ''}
                                                        </span>
                                                      </div>
                                                    </li>
                                                  );
                                                })}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}

                          {/* TAB 3: STREAM ANNOUNCEMENTS & MATERIALS */}
                          {activeTab === 'stream' && (
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#526071] mb-2">
                                  Anuncios recientes ({details.announcements.length})
                                </h3>
                                {details.announcements.length === 0 ? (
                                  <div className="rounded-xl border border-[#232A34]/12 bg-white p-4 text-xs text-[#526071]">
                                    No hay anuncios en el tablón todavía.
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {details.announcements.map((ann) => (
                                      <article
                                        key={ann.id}
                                        className="rounded-xl border border-[#232A34]/12 bg-white p-4 space-y-1.5"
                                      >
                                        <div className="flex items-center justify-between gap-2 text-[11px] text-[#526071]">
                                          <span>{formatIsoDate(ann.creationTime)}</span>
                                          {ann.alternateLink && (
                                            <a
                                              href={ann.alternateLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 font-semibold text-[#1D4E89] hover:underline"
                                            >
                                              <span>Ver en tablón</span>
                                              <ExternalLink className="h-3 w-3" />
                                            </a>
                                          )}
                                        </div>
                                        <p className="text-xs leading-relaxed text-[#232A34] whitespace-pre-line">
                                          {ann.text}
                                        </p>
                                      </article>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#526071] mb-2">
                                  Materiales publicados ({details.materials.length})
                                </h3>
                                {details.materials.length === 0 ? (
                                  <div className="rounded-xl border border-[#232A34]/12 bg-white p-4 text-xs text-[#526071]">
                                    No hay materiales publicados en esta clase.
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {details.materials.map((mat) => (
                                      <article
                                        key={mat.id}
                                        className="rounded-xl border border-[#232A34]/12 bg-white p-4 space-y-1"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <h4 className="text-sm font-bold text-[#171B21]">
                                            {mat.title}
                                          </h4>
                                          {mat.alternateLink && (
                                            <a
                                              href={mat.alternateLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1D4E89] hover:underline shrink-0"
                                            >
                                              <span>Abrir</span>
                                              <ExternalLink className="h-3 w-3" />
                                            </a>
                                          )}
                                        </div>
                                        {mat.description && (
                                          <p className="text-xs leading-relaxed text-[#46515E] whitespace-pre-line line-clamp-3">
                                            {mat.description}
                                          </p>
                                        )}
                                      </article>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* TAB 4: CLASS ROSTER */}
                          {activeTab === 'roster' && (
                            <div className="rounded-xl border border-[#232A34]/12 bg-white p-4">
                              {details.students.length === 0 ? (
                                <p className="text-xs text-[#526071] text-center py-4">
                                  No hay estudiantes matriculados en esta clase todavía.
                                </p>
                              ) : (
                                <ul className="grid gap-2 sm:grid-cols-2">
                                  {details.students.map((stu) => {
                                    const fullName =
                                      stu.profile?.name?.fullName || 'Estudiante';
                                    const rawPhoto = stu.profile?.photoUrl;
                                    const photoSrc = rawPhoto
                                      ? rawPhoto.startsWith('//')
                                        ? `https:${rawPhoto}`
                                        : rawPhoto
                                      : null;
                                    return (
                                      <li
                                        key={stu.userId}
                                        className="flex items-center gap-3 rounded-lg border border-[#232A34]/10 bg-[#FAF8F4] px-3 py-2"
                                      >
                                        {photoSrc ? (
                                          <img
                                            src={photoSrc}
                                            alt={fullName}
                                            referrerPolicy="no-referrer"
                                            className="h-8 w-8 rounded-full object-cover shrink-0"
                                          />
                                        ) : (
                                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D4E89]/15 text-xs font-bold text-[#1D4E89] shrink-0">
                                            {fullName[0].toUpperCase()}
                                          </span>
                                        )}
                                        <div className="min-w-0">
                                          <div className="truncate text-xs font-bold text-[#171B21]">
                                            {fullName}
                                          </div>
                                          {stu.profile?.emailAddress && (
                                            <div className="truncate text-[11px] text-[#526071]">
                                              {stu.profile.emailAddress}
                                            </div>
                                          )}
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#232A34]/12 bg-[#EFECE4] px-5 py-3.5 sm:px-6">
          <span className="text-xs text-[#526071]">
            Tus datos de expedición siguen guardándose localmente en este navegador.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#1D4E89] px-5 py-2 text-xs font-bold text-white hover:bg-[#153A68] cursor-pointer"
          >
            Cerrar
          </button>
        </footer>

        {/* Mandatory Explicit Confirmation Overlay before any Classroom mutation */}
        {pendingWrite && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0C1016]/70 p-4">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="gc-confirm-title"
              className="w-full max-w-lg rounded-2xl border border-[#232A34]/20 bg-white p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF4E8] text-[#8A5410] border border-[#C67D1E]/35">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3
                    id="gc-confirm-title"
                    className="font-display text-lg font-bold text-[#171B21]"
                  >
                    ¿Confirmar publicación en Google Classroom?
                  </h3>
                  <p className="mt-1 text-xs text-[#526071]">
                    Esta acción creará contenido real visible para los miembros de la clase{' '}
                    <strong>{pendingWrite.course.name}</strong>.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#232A34]/12 bg-[#FAF8F4] p-3.5 text-xs space-y-1.5">
                <div>
                  <span className="font-bold text-[#526071]">Acción: </span>
                  <span className="font-semibold text-[#171B21]">
                    {pendingWrite.kind === 'assignment'
                      ? 'Crear nueva tarea publicada'
                      : pendingWrite.kind === 'announcement'
                      ? 'Publicar anuncio en el tablón'
                      : pendingWrite.kind === 'material'
                      ? 'Publicar material didáctico'
                      : 'Crear tema en Trabajo de clase'}
                  </span>
                </div>
                {'title' in pendingWrite && (
                  <div>
                    <span className="font-bold text-[#526071]">Título: </span>
                    <span className="text-[#171B21]">{pendingWrite.title}</span>
                  </div>
                )}
                {'name' in pendingWrite && (
                  <div>
                    <span className="font-bold text-[#526071]">Tema: </span>
                    <span className="text-[#171B21]">{pendingWrite.name}</span>
                  </div>
                )}
                {'topicName' in pendingWrite && pendingWrite.topicName && (
                  <div>
                    <span className="font-bold text-[#526071]">Tema asignado: </span>
                    <span className="text-[#171B21]">{pendingWrite.topicName}</span>
                  </div>
                )}
                {'maxPoints' in pendingWrite && pendingWrite.maxPoints && (
                  <div>
                    <span className="font-bold text-[#526071]">Puntuación: </span>
                    <span className="text-[#171B21]">{pendingWrite.maxPoints} puntos</span>
                  </div>
                )}
                {'description' in pendingWrite && pendingWrite.description && (
                  <p className="pt-1 text-[11px] leading-relaxed text-[#46515E] line-clamp-4 whitespace-pre-line border-t border-[#232A34]/10">
                    {pendingWrite.description}
                  </p>
                )}
                {'text' in pendingWrite && (
                  <p className="pt-1 text-[11px] leading-relaxed text-[#46515E] line-clamp-5 whitespace-pre-line border-t border-[#232A34]/10">
                    {pendingWrite.text}
                  </p>
                )}
                {'linkUrl' in pendingWrite && pendingWrite.linkUrl && (
                  <div className="pt-1 text-[11px] text-[#1D4E89] truncate">
                    Enlace adjunto: {pendingWrite.linkUrl}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={() => setPendingWrite(null)}
                  className="rounded-lg border border-[#232A34]/20 bg-white px-4 py-2 text-xs font-semibold text-[#232A34] hover:bg-[#F5F3EE] disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={() => void executeConfirmedWrite()}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#2A6F4E] px-4 py-2 text-xs font-bold text-white hover:bg-[#1E563B] disabled:opacity-60 cursor-pointer"
                >
                  {isPublishing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{isPublishing ? 'Publicando…' : 'Confirmar y publicar'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
