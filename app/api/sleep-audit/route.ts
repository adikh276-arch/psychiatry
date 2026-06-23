import { parseDbDate } from '@/lib/dateUtils';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function ensureTableExists() {
  await db`
    CREATE TABLE IF NOT EXISTS sleep_audit_entries (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      audit_data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Auto-backfill any missing columns for legacy migrations
  await db`ALTER TABLE sleep_audit_entries ADD COLUMN IF NOT EXISTS user_id VARCHAR(255)`.catch(() => {});
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
      SELECT id, audit_data, created_at 
      FROM sleep_audit_entries 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 20
    `;

    const formatted = rows.map(r => ({
      id: r.id.toString(),
      date: parseDbDate(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      score: r.audit_data.score,
      rating: r.audit_data.rating,
      note: r.audit_data.note || ""
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Failed to fetch sleep audits:", err);
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

    if (body.score === undefined || body.rating === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const auditData = {
      score: body.score,
      rating: body.rating,
      note: body.note || "",
      selectedIndices: body.selectedIndices || []
    };

    await db`
      INSERT INTO sleep_audit_entries (user_id, audit_data)
      VALUES (${userId}, ${JSON.stringify(auditData)}::jsonb)
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to save sleep audit:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
