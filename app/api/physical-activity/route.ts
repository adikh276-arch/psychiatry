import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function ensureTableExists() {
  await db`
    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      emoji VARCHAR(50),
      name VARCHAR(255),
      duration INTEGER NOT NULL,
      notes TEXT
    )
  `;

    // Auto-backfill any missing columns for legacy migrations
    await db`ALTER TABLE activities ADD COLUMN IF NOT EXISTS user_id VARCHAR(255)`.catch(() => {});
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
      SELECT id, to_char(date, 'YYYY-MM-DD') as date, emoji, name, duration, notes 
      FROM activities 
      WHERE user_id = ${userId} 
      ORDER BY date DESC
    `;

    const formattedRows = rows.map((r: any) => ({
      ...r,
      date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : (typeof r.date === 'string' ? r.date.split('T')[0] : r.date)
    }));
    return NextResponse.json(formattedRows);
  } catch (err) {
    console.error("Failed to fetch activities:", err);
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

    if (!body.date || !body.name || body.duration === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const res = await db`
      INSERT INTO activities (user_id, date, emoji, name, duration, notes)
      VALUES (${userId}, ${body.date}, ${body.emoji || ""}, ${body.name}, ${body.duration}, ${body.notes || ""})
      RETURNING id, to_char(date, 'YYYY-MM-DD') as date, emoji, name, duration, notes
    `;

    return NextResponse.json(res[0]);
  } catch (err) {
    console.error("Failed to add activity:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureTableExists();
    const body = await req.json();

    if (!body.id || !body.name || body.duration === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const res = await db`
      UPDATE activities 
      SET name = ${body.name}, emoji = ${body.emoji || ""}, duration = ${body.duration}, notes = ${body.notes || ""} 
      WHERE id = ${body.id} AND user_id = ${userId}
      RETURNING id, to_char(date, 'YYYY-MM-DD') as date, emoji, name, duration, notes
    `;

    if (res.length === 0) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    return NextResponse.json(res[0]);
  } catch (err) {
    console.error("Failed to edit activity:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureTableExists();
    const url = new URL(req.url);
    const idStr = url.searchParams.get("id");

    if (!idStr) {
      return NextResponse.json({ error: "Missing activity id" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);

    await db`
      DELETE FROM activities 
      WHERE id = ${id} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete activity:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
