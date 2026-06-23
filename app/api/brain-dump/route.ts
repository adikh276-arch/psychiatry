import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { trace, metrics } from "@opentelemetry/api";
import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { withSpan } from "@superlog/otel-helpers";

const tracer = trace.getTracer("therapy.web");
const meter = metrics.getMeter("therapy.web");
const logger = logs.getLogger("therapy.web");

const sessionsSaved = meter.createCounter("brain_dump.session.saved");


async function ensureTablesExist() {
  await db`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      date VARCHAR(255) NOT NULL,
      reflection TEXT
    )
  `;
  await db`
    CREATE TABLE IF NOT EXISTS thoughts (
      local_id VARCHAR(255) NOT NULL,
      session_id VARCHAR(255) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      user_id VARCHAR(255) NOT NULL,
      text TEXT NOT NULL,
      bucket VARCHAR(255),
      PRIMARY KEY (local_id, session_id)
    )
  `;
}

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureTablesExist();
    const sessions = await db`
      SELECT * FROM sessions WHERE user_id = ${userId} ORDER BY date DESC
    `;

    const sessionsWithThoughts = [];
    for (const session of sessions) {
      const sessionThoughts = await db`
        SELECT local_id as id, text, bucket FROM thoughts 
        WHERE session_id = ${session.id} AND user_id = ${userId}
      `;
      sessionsWithThoughts.push({
        ...session,
        thoughts: sessionThoughts,
      });
    }

    return NextResponse.json(sessionsWithThoughts);
  } catch (err) {
    console.error("Failed to fetch brain dump sessions:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return await withSpan("brain_dump.save", async (span) => {
    span.setAttribute("user.id", userId);
    try {
      await ensureTablesExist();
      const { id, date, thoughts, reflection } = await req.json();

      if (!id || !thoughts) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      span.setAttribute("thought.count", thoughts.length);

      await db`
        INSERT INTO sessions (id, user_id, date, reflection)
        VALUES (${id}, ${userId}, ${date}, ${reflection || ""})
      `;

      for (const thought of thoughts) {
        await db`
          INSERT INTO thoughts (local_id, session_id, user_id, text, bucket)
          VALUES (${thought.id}, ${id}, ${userId}, ${thought.text}, ${thought.bucket || ""})
        `;
      }

      sessionsSaved.add(1, { outcome: "success" });
      logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: "INFO",
        body: "saved brain dump session",
        attributes: {
          "user.id": userId,
          "thought.count": thoughts.length,
          outcome: "success"
        }
      });

      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("Failed to save brain dump session:", err);
      sessionsSaved.add(1, { outcome: "error" });
      logger.emit({
        severityNumber: SeverityNumber.ERROR,
        severityText: "ERROR",
        body: "failed to save brain dump session",
        attributes: {
          "user.id": userId,
          outcome: "error",
          error: String(err)
        }
      });
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }, { tracer });
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
    await ensureTablesExist();
    await db`
      DELETE FROM sessions WHERE id = ${id} AND user_id = ${userId}
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete brain dump session:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
