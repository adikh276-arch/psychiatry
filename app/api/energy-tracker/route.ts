import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function ensureTableExists() {
  await db`
    CREATE TABLE IF NOT EXISTS energy_logs (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      date VARCHAR(10) NOT NULL,
      level VARCHAR(20) NOT NULL,
      factors TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, date)
    )
  `;

    // Auto-backfill any missing columns for legacy migrations
    await db`ALTER TABLE energy_logs ADD COLUMN IF NOT EXISTS id VARCHAR(255)`.catch(() => {});
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
      SELECT id, date, level, factors, note FROM energy_logs 
      WHERE user_id = ${userId} 
      ORDER BY date DESC
    `;
    const formattedRows = rows.map((r: any) => ({
      ...r,
      date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : (typeof r.date === 'string' ? r.date.split('T')[0] : r.date)
    }));
    return NextResponse.json(formattedRows);
  } catch (err) {
    console.error("Failed to fetch energy logs:", err);
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
    const { id, date, level, factors, note } = await req.json();

    if (!id || !date || !level || !factors) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const factorsStr = typeof factors === "string" ? factors : JSON.stringify(factors);

    await db`
      INSERT INTO energy_logs (id, user_id, date, level, factors, note, created_at)
      VALUES (${id}, ${userId}, ${date}, ${level}, ${factorsStr}, ${note || ""}, NOW())
      ON CONFLICT (user_id, date) 
      DO UPDATE SET 
        level = EXCLUDED.level, 
        factors = EXCLUDED.factors, 
        note = EXCLUDED.note
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save energy log:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  try {
    await ensureTableExists();
    await db`
      DELETE FROM energy_logs WHERE id = ${id} AND user_id = ${userId}
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete energy log:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
