import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { sessionOptions } from "@/lib/session";
import type { SessionData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "IDトークンが必要です" }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.uid = decoded.uid;
    session.email = decoded.email ?? "";
    await session.save();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }
}
