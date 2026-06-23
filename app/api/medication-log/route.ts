import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function ensureTable() {
  await db`
    CREATE TABLE IF NOT EXISTS psych_medication_logs (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      medication VARCHAR(255) NOT NULL,
      dose VARCHAR(100) NOT NULL,
      time VARCHAR(10) NOT NULL,
      taken BOOLEAN NOT NULL DEFAULT true,
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
      SELECT id, medication, dose, time, taken, note, created_at
      FROM psych_medication_logs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 60
    `;
    return NextResponse.json(rows.map(r => ({
      id: r.id.toString(),
      medication: r.medication,
      dose: r.dose,
      time: r.time,
      taken: r.taken,
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
    const { medication, dose, time, taken, note } = await req.json();
    await db`
      INSERT INTO psych_medication_logs (user_id, medication, dose, time, taken, note)
      VALUES (${userId}, ${medication}, ${dose}, ${time}, ${taken}, ${note || ''})
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
