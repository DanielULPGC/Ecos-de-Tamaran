import { FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from 'firebase/auth';

const firebaseConfigModules = import.meta.glob<{ default?: FirebaseOptions }>(
  '../../firebase-applet-config.json',
  { eager: true }
);
const firebaseConfig: FirebaseOptions | null =
  Object.values(firebaseConfigModules)[0]?.default ?? null;

export const CLASSROOM_SCOPES: string[] = [
  'https://www.googleapis.com/auth/classroom.addons.student',
  'https://www.googleapis.com/auth/classroom.addons.teacher',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
  'https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly',
  'https://www.googleapis.com/auth/classroom.guardianlinks.students',
  'https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/classroom.profile.photos',
  'https://www.googleapis.com/auth/classroom.push-notifications',
  'https://www.googleapis.com/auth/classroom.rosters',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
  'https://www.googleapis.com/auth/classroom.topics',
  'https://www.googleapis.com/auth/classroom.topics.readonly',
];

let authInstance: ReturnType<typeof getAuth> | null = null;
let authInitFailed = false;

function getSafeAuth(): ReturnType<typeof getAuth> | null {
  if (authInstance) return authInstance;
  if (authInitFailed) return null;
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    authInitFailed = true;
    return null;
  }
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    return authInstance;
  } catch {
    authInitFailed = true;
    return null;
  }
}

const provider = new GoogleAuthProvider();
for (const scope of CLASSROOM_SCOPES) {
  provider.addScope(scope);
}
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
// Strictly in-memory OAuth access token cache (never persisted to localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export const initClassroomAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: (user: User | null) => void
) => {
  const auth = getSafeAuth();
  if (!auth) {
    onAuthFailure?.(null);
    return () => {};
  }
  try {
    return onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        if (cachedAccessToken) {
          onAuthSuccess?.(user, cachedAccessToken);
        } else if (!isSigningIn) {
          cachedAccessToken = null;
          onAuthFailure?.(user);
        }
      } else {
        cachedAccessToken = null;
        onAuthFailure?.(null);
      }
    });
  } catch {
    onAuthFailure?.(null);
    return () => {};
  }
};

export const googleClassroomSignIn = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  const auth = getSafeAuth();
  if (!auth) {
    throw new Error(
      'El servicio de inicio de sesión de Google Classroom no está disponible en este dominio o navegador.'
    );
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error(
        'No se recibió un token de acceso válido de Google Classroom. Vuelve a intentarlo.'
      );
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getClassroomAccessToken = (): string | null => cachedAccessToken;

export const clearClassroomAccessToken = (): void => {
  cachedAccessToken = null;
};

export const getCurrentClassroomUser = (): User | null =>
  getSafeAuth()?.currentUser ?? null;

export const classroomSignOut = async (): Promise<void> => {
  cachedAccessToken = null;
  const auth = getSafeAuth();
  if (auth) {
    await auth.signOut();
  }
};
