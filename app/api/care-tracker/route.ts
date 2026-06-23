import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function ensureTableExists() {
  await db`
    CREATE TABLE IF NOT EXISTS selfcare_entries (
      user_id VARCHAR(255) NOT NULL,
      date VARCHAR(255) NOT NULL,
      did_self_care BOOLEAN,
      activities TEXT,
      duration VARCHAR(255),
      prevention_reasons TEXT,
      helpful_type VARCHAR(255),
      mood VARCHAR(255),
      mood_emoji VARCHAR(255),
      PRIMARY KEY (user_id, date)
    )
  `;

    // Auto-backfill any missing columns for legacy migrations
    await db`ALTER TABLE selfcare_entries ADD COLUMN IF NOT EXISTS user_id VARCHAR(255)`.catch(() => {});
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
      SELECT * FROM selfcare_entries 
      WHERE user_id = ${userId} 
      ORDER BY date DESC
    `;

    const formatted = rows.map(r => ({
      date: r.date,
      didSelfCare: r.did_self_care,
      activities: typeof r.activities === "string" ? JSON.parse(r.activities) : (r.activities || []),
      duration: r.duration || "",
      preventionReasons: typeof r.prevention_reasons === "string" ? JSON.parse(r.prevention_reasons) : (r.prevention_reasons || []),
      helpfulType: r.helpful_type || "",
      mood: r.mood || "",
      moodEmoji: r.mood_emoji || "",
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Failed to fetch selfcare entries:", err);
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
    const entry = await req.json();

    if (!entry.date) {
      return NextResponse.json({ error: "Missing date field" }, { status: 400 });
    }

    await db`
      INSERT INTO selfcare_entries (
        user_id, date, did_self_care, activities, duration, 
        prevention_reasons, helpful_type, mood, mood_emoji
      )
      VALUES (
        ${userId}, 
        ${entry.date}, 
        ${entry.didSelfCare}, 
        ${JSON.stringify(entry.activities || [])}, 
        ${entry.duration || ""},
        ${JSON.stringify(entry.preventionReasons || [])}, 
        ${entry.helpfulType || ""}, 
        ${entry.mood || ""}, 
        ${entry.moodEmoji || ""}
      )
      ON CONFLICT (user_id, date) DO UPDATE SET
        did_self_care = EXCLUDED.did_self_care,
        activities = EXCLUDED.activities,
        duration = EXCLUDED.duration,
        prevention_reasons = EXCLUDED.prevention_reasons,
        helpful_type = EXCLUDED.helpful_type,
        mood = EXCLUDED.mood,
        mood_emoji = EXCLUDED.mood_emoji
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save selfcare entry:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
