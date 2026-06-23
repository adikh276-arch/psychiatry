import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function ensureTable() {
  await db`
    CREATE TABLE IF NOT EXISTS psych_side_effect_logs (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      effect VARCHAR(255) NOT NULL,
      severity INT NOT NULL DEFAULT 2,
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
      SELECT id, effect, severity, note, created_at
      FROM psych_side_effect_logs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 60
    `;
    return NextResponse.json(rows.map(r => ({
      id: r.id.toString(),
      effect: r.effect,
      severity: r.severity,
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
    const { effect, severity, note } = await req.json();
    await db`
      INSERT INTO psych_side_effect_logs (user_id, effect, severity, note)
      VALUES (${userId}, ${effect}, ${severity}, ${note || ''})
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
