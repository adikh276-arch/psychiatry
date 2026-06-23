import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function ensureTableExists() {
  await db`
    CREATE TABLE IF NOT EXISTS vibe_entries (
      id VARCHAR(255) PRIMARY KEY,
      user_id BIGINT NOT NULL,
      vibe VARCHAR(255) NOT NULL,
      reflections TEXT NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

    // Auto-backfill any missing columns for legacy migrations
    await db`ALTER TABLE vibe_entries ADD COLUMN IF NOT EXISTS id VARCHAR(255)`.catch(() => {});
}

export async function GET() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("user_id")?.value;
  if (!userIdStr) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(userIdStr, 10);

  try {
    await ensureTableExists();
    const rows = await db`
      SELECT id, vibe, reflections, timestamp 
      FROM vibe_entries 
      WHERE user_id = ${userId} 
      ORDER BY timestamp DESC
    `;

    const formatted = rows.map(r => ({
      id: r.id,
      vibe: r.vibe,
      reflections: typeof r.reflections === 'string' ? JSON.parse(r.reflections) : (r.reflections || []),
      timestamp: r.timestamp
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Failed to fetch vibe entries:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("user_id")?.value;
  if (!userIdStr) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(userIdStr, 10);

  try {
    await ensureTableExists();
    const body = await req.json();

    if (!body.id || !body.vibe || !body.reflections) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await db`
      INSERT INTO vibe_entries (id, user_id, vibe, reflections, timestamp)
      VALUES (
        ${body.id},
        ${userId},
        ${body.vibe},
        ${JSON.stringify(body.reflections)},
        ${body.timestamp || new Date().toISOString()}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save vibe entry:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
