import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { sessionOptions } from "@/lib/session";
import { FieldValue } from "firebase-admin/firestore";
import type { SessionData } from "@/types";

async function requireAdmin() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.uid) throw new Error("Unauthorized");
}

export async function GET() {
  try {
    await requireAdmin();
    const snapshot = await adminDb
      .collection("events")
      .orderBy("createdAt", "desc")
      .get();

    const events = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const votesSnapshot = await adminDb
          .collection("votes")
          .where("eventId", "==", doc.id)
          .get();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString() ?? null,
          closedAt: data.closedAt?.toDate().toISOString() ?? null,
          voteCount: votesSnapshot.size,
        };
      })
    );

    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { title, description, organizer, venue, schedule, choices, closedAt } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
    }
    if (!choices || choices.length < 2) {
      return NextResponse.json({ error: "選択肢は2つ以上必要です" }, { status: 400 });
    }

    const docRef = await adminDb.collection("events").add({
      title: title.trim(),
      description: description?.trim() ?? "",
      organizer: organizer?.trim() ?? "",
      venue: venue?.trim() ?? "",
      schedule: schedule ?? [],
      choices,
      isOpen: true,
      createdAt: FieldValue.serverTimestamp(),
      closedAt: closedAt ? new Date(closedAt) : null,
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "作成に失敗しました" }, { status: 500 });
  }
}
