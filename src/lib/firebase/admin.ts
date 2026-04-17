import type { App } from "firebase-admin/app";

let _app: App | null = null;

function getAdminApp(): App {
  if (_app) return _app;
  // Dynamic import to avoid initialization at module load time
  const { initializeApp, getApps, cert } = require("firebase-admin/app");
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app!;
  }
  _app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
  return _app!;
}

export function getAdminAuth() {
  const { getAuth } = require("firebase-admin/auth");
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  const { getFirestore } = require("firebase-admin/firestore");
  return getFirestore(getAdminApp());
}

// Named exports for direct use (initialized lazily)
export const adminAuth = {
  verifyIdToken: (token: string) => getAdminAuth().verifyIdToken(token),
};

export const adminDb = new Proxy({} as ReturnType<typeof import("firebase-admin/firestore").getFirestore>, {
  get(_target, prop) {
    const db = getAdminDb();
    const value = (db as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") return value.bind(db);
    return value;
  },
});
