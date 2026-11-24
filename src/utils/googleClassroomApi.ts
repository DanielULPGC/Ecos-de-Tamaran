import { ExpeditionState } from '../types/game';
import { ROOMS_DATA } from '../data/roomsData';
import { BADGES, getExplorerById } from '../data/charactersAndBadges';
import { getDifficultyProfile } from '../data/difficultyConfig';
import { formatEscapeTime } from '../data/escapeLocks';
import { getUnlockedTimeCapsuleRoomIds } from '../data/timeCapsules';

const CLASSROOM_BASE = 'https://classroom.googleapis.com/v1';

export type CourseRole = 'teacher' | 'student';

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  courseState?: string;
  alternateLink?: string;
  role: CourseRole;
}

export interface ClassroomCourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  maxPoints?: number;
  topicId?: string;
  workType?: string;
}

export interface ClassroomAnnouncement {
  id: string;
  courseId: string;
  text: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
}

export interface ClassroomMaterial {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state?: string;
  alternateLink?: string;
  creationTime?: string;
  topicId?: string;
}

export interface ClassroomTopic {
  courseId: string;
  topicId: string;
  name: string;
  updateTime?: string;
}

export interface ClassroomStudent {
  courseId: string;
  userId: string;
  profile?: {
    id?: string;
    name?: {
      fullName?: string;
      givenName?: string;
      familyName?: string;
    };
    emailAddress?: string;
    photoUrl?: string;
  };
}

export interface ClassroomSubmission {
  id: string;
  courseId: string;
  courseWorkId: string;
  userId: string;
  state?: 'SUBMISSION_STATE_UNSPECIFIED' | 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  late?: boolean;
  assignedGrade?: number;
  draftGrade?: number;
  alternateLink?: string;
  updateTime?: string;
}

export class ClassroomApiError extends Error {
  status: number;
  needsReauth: boolean;

  constructor(message: string, status: number, needsReauth = false) {
    super(message);
    this.name = 'ClassroomApiError';
    this.status = status;
    this.needsReauth = needsReauth;
  }
}

async function classroomFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${CLASSROOM_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let apiMessage = `Error ${res.status} al conectar con Google Classroom.`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) {
        apiMessage = errJson.error.message;
      }
    } catch {
      // Ignore JSON parse errors on error payloads
    }
    const needsReauth = res.status === 401;
    throw new ClassroomApiError(apiMessage, res.status, needsReauth);
  }

  return (await res.json()) as T;
}

export async function fetchClassroomCourses(
  token: string
): Promise<ClassroomCourse[]> {
  const [teacherRes, studentRes] = await Promise.allSettled([
    classroomFetch<{ courses?: Omit<ClassroomCourse, 'role'>[] }>(
      '/courses?courseStates=ACTIVE&teacherId=me&pageSize=30',
      token
    ),
    classroomFetch<{ courses?: Omit<ClassroomCourse, 'role'>[] }>(
      '/courses?courseStates=ACTIVE&studentId=me&pageSize=30',
      token
    ),
  ]);

  if (
    teacherRes.status === 'rejected' &&
    studentRes.status === 'rejected'
  ) {
    throw teacherRes.reason;
  }

  const byId = new Map<string, ClassroomCourse>();

  if (teacherRes.status === 'fulfilled' && teacherRes.value.courses) {
    for (const c of teacherRes.value.courses) {
      byId.set(c.id, { ...c, role: 'teacher' });
    }
  }

  if (studentRes.status === 'fulfilled' && studentRes.value.courses) {
    for (const c of studentRes.value.courses) {
      if (!byId.has(c.id)) {
        byId.set(c.id, { ...c, role: 'student' });
      }
    }
  }

  return Array.from(byId.values());
}

export interface CourseDetailsBundle {
  courseWork: ClassroomCourseWork[];
  announcements: ClassroomAnnouncement[];
  materials: ClassroomMaterial[];
  topics: ClassroomTopic[];
  students: ClassroomStudent[];
}

export async function fetchCourseDetails(
  token: string,
  courseId: string,
  role: CourseRole
): Promise<CourseDetailsBundle> {
  const encodedId = encodeURIComponent(courseId);
  const [cwRes, annRes, matRes, topRes, stuRes] = await Promise.allSettled([
    classroomFetch<{ courseWork?: ClassroomCourseWork[] }>(
      `/courses/${encodedId}/courseWork?pageSize=20`,
      token
    ),
    classroomFetch<{ announcements?: ClassroomAnnouncement[] }>(
      `/courses/${encodedId}/announcements?pageSize=15`,
      token
    ),
    classroomFetch<{ courseWorkMaterial?: ClassroomMaterial[] }>(
      `/courses/${encodedId}/courseWorkMaterials?pageSize=15`,
      token
    ),
    classroomFetch<{ topic?: ClassroomTopic[] }>(
      `/courses/${encodedId}/topics?pageSize=30`,
      token
    ),
    role === 'teacher'
      ? classroomFetch<{ students?: ClassroomStudent[] }>(
          `/courses/${encodedId}/students?pageSize=50`,
          token
        )
      : Promise.resolve({ students: [] }),
  ]);

  // Propagate 401 token expiration immediately
  for (const r of [cwRes, annRes, matRes, topRes, stuRes]) {
    if (
      r.status === 'rejected' &&
      r.reason instanceof ClassroomApiError &&
      r.reason.needsReauth
    ) {
      throw r.reason;
    }
  }

  return {
    courseWork:
      cwRes.status === 'fulfilled' ? cwRes.value.courseWork ?? [] : [],
    announcements:
      annRes.status === 'fulfilled' ? annRes.value.announcements ?? [] : [],
    materials:
      matRes.status === 'fulfilled' ? matRes.value.courseWorkMaterial ?? [] : [],
    topics: topRes.status === 'fulfilled' ? topRes.value.topic ?? [] : [],
    students: stuRes.status === 'fulfilled' ? stuRes.value.students ?? [] : [],
  };
}

export async function fetchStudentSubmissions(
  token: string,
  courseId: string,
  courseWorkId: string
): Promise<ClassroomSubmission[]> {
  const data = await classroomFetch<{
    studentSubmissions?: ClassroomSubmission[];
  }>(
    `/courses/${encodeURIComponent(courseId)}/courseWork/${encodeURIComponent(
      courseWorkId
    )}/studentSubmissions?pageSize=50`,
    token
  );
  return data.studentSubmissions ?? [];
}

export async function createClassroomCourseWork(
  token: string,
  courseId: string,
  payload: {
    title: string;
    description: string;
    maxPoints?: number;
    topicId?: string;
    linkUrl?: string;
  }
): Promise<ClassroomCourseWork> {
  const body: Record<string, unknown> = {
    title: payload.title.trim(),
    description: payload.description.trim(),
    workType: 'ASSIGNMENT',
    state: 'PUBLISHED',
  };

  if (typeof payload.maxPoints === 'number' && payload.maxPoints > 0) {
    body.maxPoints = payload.maxPoints;
  }
  if (payload.topicId) {
    body.topicId = payload.topicId;
  }
  if (payload.linkUrl) {
    body.materials = [{ link: { url: payload.linkUrl } }];
  }

  return classroomFetch<ClassroomCourseWork>(
    `/courses/${encodeURIComponent(courseId)}/courseWork`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}

export async function createClassroomAnnouncement(
  token: string,
  courseId: string,
  payload: {
    text: string;
    linkUrl?: string;
  }
): Promise<ClassroomAnnouncement> {
  const body: Record<string, unknown> = {
    text: payload.text.trim(),
    state: 'PUBLISHED',
  };

  if (payload.linkUrl) {
    body.materials = [{ link: { url: payload.linkUrl } }];
  }

  return classroomFetch<ClassroomAnnouncement>(
    `/courses/${encodeURIComponent(courseId)}/announcements`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}

export async function createClassroomMaterial(
  token: string,
  courseId: string,
  payload: {
    title: string;
    description: string;
    topicId?: string;
    linkUrl?: string;
  }
): Promise<ClassroomMaterial> {
  const body: Record<string, unknown> = {
    title: payload.title.trim(),
    description: payload.description.trim(),
    state: 'PUBLISHED',
  };

  if (payload.topicId) {
    body.topicId = payload.topicId;
  }
  if (payload.linkUrl) {
    body.materials = [{ link: { url: payload.linkUrl } }];
  }

  return classroomFetch<ClassroomMaterial>(
    `/courses/${encodeURIComponent(courseId)}/courseWorkMaterials`,
    token,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );
}

export async function createClassroomTopic(
  token: string,
  courseId: string,
  name: string
): Promise<ClassroomTopic> {
  return classroomFetch<ClassroomTopic>(
    `/courses/${encodeURIComponent(courseId)}/topics`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({ name: name.trim() }),
    }
  );
}

// --- Pedagogical Templates for Ecos de Tamarán ---

export function buildEscapeRoomAssignmentDraft(state: ExpeditionState): {
  title: string;
  description: string;
  maxPoints: number;
} {
  const diff = getDifficultyProfile(state.cycle);
  return {
    title: `Escape Room: Ecos de Tamarán (${diff.cycleLabel} · ${diff.levelName})`,
    description: [
      `Misión histórica interactiva sobre Gran Canaria — ${diff.cycleLabel} (${diff.gradesLabel}).`,
      '',
      'Objetivos de la expedición:',
      '1. Seleccionar el nivel ' +
        diff.levelName +
        ' (' +
        diff.cycleLabel +
        ') y elegir a tu explorador/a guía.',
      '2. Explorar las 4 salas históricas (Agáldar aborigen, Real de Las Palmas 1478, Atalaya de San Cristóbal 1599 y Muelle de La Luz s. XX) consiguiendo los 3 sellos y abriendo cada cerrojo de salida.',
      '3. Completar el Diario de Reflexión EMOCREA (dilema empático + pega-nota) y abrir las 4 Cápsulas del Tiempo.',
      '4. Al finalizar, descargar el Diario en PDF y adjuntarlo en esta entrega de Google Classroom.',
      '',
      'Currículo: Conocimiento del Medio Natural, Social y Cultural (CE2–CE9 · Decreto 211/2022 Canarias), EMOCREA y Agenda Canaria 2030.',
    ].join('\n'),
    maxPoints: 10,
  };
}

export function buildDidacticMaterialDraft(state: ExpeditionState): {
  title: string;
  description: string;
} {
  const diff = getDifficultyProfile(state.cycle);
  return {
    title: `Material de consulta: Ecos de Tamarán · Gran Canaria (${diff.cycleLabel})`,
    description: [
      'Recurso interactivo de Conocimiento del Medio, Historia de Gran Canaria, EMOCREA y Agenda Canaria 2030.',
      '',
      'Incluye:',
      '• 4 salas históricas de Escape Room con pistas adaptadas a ' +
        diff.cycleLabel +
        ' (' +
        diff.gradesLabel +
        ').',
      '• Atlas del Medio Natural de Gran Canaria (Relieve volcánico, Ecosistemas, Alisios y Patrimonio) y Línea del Tiempo (CE7).',
      '• Glosario histórico escolar A–Z y Glosario Visual con pictogramas DUA.',
      '• Lectura en voz alta, fuente apta para dislexia y modo alto contraste.',
    ].join('\n'),
  };
}

export function buildProgressAnnouncementDraft(state: ExpeditionState): string {
  const diff = getDifficultyProfile(state.cycle);
  const explorer = getExplorerById(state.explorerId);
  const team = state.explorerName.trim() || 'Equipo Explorador de Tamarán';
  const totalSeals = ROOMS_DATA.reduce((sum, room) => {
    const p = state.progress[room.id];
    return (
      sum +
      Number(p.puzzle1Solved) +
      Number(p.puzzle2Solved) +
      Number(p.empathySolved)
    );
  }, 0);
  const doorsOpened = ROOMS_DATA.filter(
    (room) => state.progress[room.id].doorUnlocked
  ).length;
  const capsulesCount = getUnlockedTimeCapsuleRoomIds(state).length;
  const stickyWords = ROOMS_DATA.map(
    (r) => state.journal[r.id]?.stickyNote?.word?.trim()
  ).filter((w): w is string => Boolean(w));

  const lines = [
    `Expedición «Ecos de Tamarán: El Cuaderno del Tiempo» — ${team}`,
    `Nivel: ${diff.levelName} (${diff.cycleLabel}) · Guía: ${explorer.name}`,
    `Progreso del Escape Room: ${doorsOpened}/4 cerrojos abiertos · ${totalSeals}/12 sellos · ${state.unlockedBadges.length}/${BADGES.length} insignias · ${capsulesCount}/4 Cápsulas del Tiempo.`,
  ];

  if (state.showEscapeTimer && state.elapsedSeconds > 0) {
    lines.push(`Tiempo de expedición: ${formatEscapeTime(state.elapsedSeconds)}.`);
  }

  if (stickyWords.length > 0) {
    lines.push(`Palabras clave de mi Diario EMOCREA: ${stickyWords.join(', ')}.`);
  }

  return lines.join('\n');
}

export function buildClassLaunchAnnouncementDraft(state: ExpeditionState): string {
  const diff = getDifficultyProfile(state.cycle);
  return [
    `¡Hoy viajamos por la historia de Gran Canaria con «Ecos de Tamarán: El Cuaderno del Tiempo»!`,
    `Entra en el enlace, elige «${diff.levelName} (${diff.cycleLabel})», forma tu equipo y supera los 4 cerrojos del Escape Room.`,
    'Recuerda activar el sonido o la lectura en voz alta si lo prefieres y guardar tus reflexiones en el Diario.',
  ].join('\n');
}
