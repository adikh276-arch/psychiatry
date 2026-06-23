import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function ensureTable() {
  await db`
    CREATE TABLE IF NOT EXISTS psych_symptom_checkins (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      scores JSONB NOT NULL,
      note TEXT DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await ensureTable();
    const rows = await db`
      SELECT id, scores, note, created_at
      FROM psych_symptom_checkins
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 30
    `;
    return NextResponse.json(rows.map(r => ({
      id: r.id.toString(),
      scores: r.scores,
      note: r.note,
      created_at: r.created_at,
    })));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await ensureTable();
    const { scores, note } = await req.json();
    await db`
      INSERT INTO psych_symptom_checkins (user_id, scores, note)
      VALUES (${userId}, ${JSON.stringify(scores)}::jsonb, ${note || ''})
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
