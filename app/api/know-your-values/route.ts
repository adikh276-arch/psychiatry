import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function ensureTableExists() {
  await db`
    CREATE TABLE IF NOT EXISTS reflections (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      value_emoji VARCHAR(50),
      value_name VARCHAR(255),
      reflection TEXT,
      action TEXT
    )
  `;

    // Auto-backfill any missing columns for legacy migrations
    await db`ALTER TABLE reflections ADD COLUMN IF NOT EXISTS user_id VARCHAR(255)`.catch(() => {});
}

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureTableExists();
    const rows = await db`
      SELECT id, user_id, date, value_emoji as "valueEmoji", value_name as "valueName", reflection, action 
      FROM reflections 
      WHERE user_id = ${userId} 
      ORDER BY date DESC
    `;

    const formattedRows = rows.map((r: any) => ({
      ...r,
      date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : (typeof r.date === 'string' ? r.date.split('T')[0] : r.date)
    }));
    return NextResponse.json(formattedRows);
  } catch (err) {
    console.error("Failed to fetch values reflections:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureTableExists();
    const body = await req.json();

    if (!body.valueEmoji || !body.valueName || !body.reflection || !body.action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const res = await db`
      INSERT INTO reflections (user_id, date, value_emoji, value_name, reflection, action)
      VALUES (${userId}, CURRENT_TIMESTAMP, ${body.valueEmoji}, ${body.valueName}, ${body.reflection}, ${body.action})
      RETURNING id, date
    `;

    return NextResponse.json({
      success: true,
      id: res[0].id.toString(),
      date: res[0].date,
    });
  } catch (err) {
    console.error("Failed to save values reflection:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
