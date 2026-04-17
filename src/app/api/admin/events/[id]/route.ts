import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { sessionOptions } from "@/lib/session";
import type { SessionData } from "@/types";

async function requireAdmin() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.uid) throw new Error("Unauthorized");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const doc = await adminDb.collection("events").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
    }

    const data = doc.data()!;
    const votesSnapshot = await adminDb
      .collection("votes")
      .where("eventId", "==", id)
      .get();

    const countMap: Record<string, number> = {};
    votesSnapshot.docs.forEach((v) => {
      const choiceId = v.data().choiceId;
      countMap[choiceId] = (countMap[choiceId] ?? 0) + 1;
    });

    const voteCounts = (data.choices ?? []).map(
      (c: { id: string; text: string }) => ({
        choiceId: c.id,
        choiceText: c.text,
        count: countMap[c.id] ?? 0,
      })
    );

    return NextResponse.json({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate().toISOString() ?? null,
      closedAt: data.closedAt?.toDate().toISOString() ?? null,
      voteCounts,
      totalVotes: votesSnapshot.size,
    });
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.organizer !== undefined) updateData.organizer = body.organizer.trim();
    if (body.venue !== undefined) updateData.venue = body.venue.trim();
    if (body.schedule !== undefined) updateData.schedule = body.schedule;
    if (body.choices !== undefined) updateData.choices = body.choices;
    if (body.isOpen !== undefined) updateData.isOpen = body.isOpen;
    if (body.closedAt !== undefined) {
      updateData.closedAt = body.closedAt ? new Date(body.closedAt) : null;
    }

    await adminDb.collection("events").doc(id).update(updateData);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // 関連する投票を削除
    const votesSnapshot = await adminDb
      .collection("votes")
      .where("eventId", "==", id)
      .get();

    const batch = adminDb.batch();
    votesSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    batch.delete(adminDb.collection("events").doc(id));
    await batch.commit();

    return NextResponse.json({ ok: true });
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
