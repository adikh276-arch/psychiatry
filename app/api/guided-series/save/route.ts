import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function ensureTableExists() {
  await db`
    CREATE TABLE IF NOT EXISTS guided_series_logs (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      concern VARCHAR(255),
      activity_name VARCHAR(255),
      entry_data JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { concern, activityName, entryData } = await req.json();

  if (!concern || !activityName || !entryData) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await ensureTableExists();
    await db`
      INSERT INTO guided_series_logs (user_id, concern, activity_name, entry_data)
      VALUES (${userId}, ${concern}, ${activityName}, ${JSON.stringify(entryData)})
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save guided series log:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
