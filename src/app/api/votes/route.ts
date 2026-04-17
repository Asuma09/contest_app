import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { eventId, choiceId, voterToken } = await req.json();

    if (!eventId || !choiceId || !voterToken) {
      return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
    }

    // イベントの存在と公開状態を確認
    const eventDoc = await adminDb.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
    }
    if (!eventDoc.data()?.isOpen) {
      return NextResponse.json({ error: "このイベントは締め切られています" }, { status: 403 });
    }

    // 二重投票チェック
    const existing = await adminDb
      .collection("votes")
      .where("eventId", "==", eventId)
      .where("voterToken", "==", voterToken)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json({ error: "すでに投票済みです" }, { status: 409 });
    }

    await adminDb.collection("votes").add({
      eventId,
      choiceId,
      voterToken,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "投票に失敗しました" }, { status: 500 });
  }
}
