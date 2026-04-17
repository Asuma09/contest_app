import type { App } from "firebase-admin/app";

let _app: App | null = null;

/**
 * FIREBASE_PRIVATE_KEY の取得
 * Vercel環境ではBase64エンコードされた FIREBASE_PRIVATE_KEY_BASE64 を優先的に使用する。
 * フォールバックとして通常の FIREBASE_PRIVATE_KEY も対応。
 */
function getPrivateKey(): string {
  // Base64エンコード版（Vercel推奨）
  const base64Key = process.env.FIREBASE_PRIVATE_KEY_BASE64;
  if (base64Key) {
    return Buffer.from(base64Key, "base64").toString("utf-8");
  }

  // 通常版（ローカル開発用）
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!rawKey) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY_BASE64 or FIREBASE_PRIVATE_KEY must be set"
    );
  }

  // 前後のクォートを除去し、リテラル \n を実際の改行に変換
  return rawKey.replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
}

function getAdminApp(): App {
  if (_app) return _app;
  const { initializeApp, getApps, cert } = require("firebase-admin/app");
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app!;
  }

  _app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getPrivateKey(),
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
