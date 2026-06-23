import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const concern = searchParams.get("concern");
  const activity = searchParams.get("activity");

  if (!concern || !activity) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const rows = await db`
      SELECT entry_data, created_at
      FROM guided_series_logs
      WHERE user_id = ${userId} AND activity_name = ${activity}
      ORDER BY created_at DESC
      LIMIT 5
    `;
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Failed to fetch guided series history:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
