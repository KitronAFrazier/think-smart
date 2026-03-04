import { NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/roles";
import { getServerAuthContext } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type ContentEntity = "curriculum" | "groups" | "events";

type ContentPayload = {
  entity?: ContentEntity;
  id?: string;
  name?: string;
  color?: string;
  title?: string;
  location?: string | null;
  eventDate?: string | null;
  seats?: number | null;
  eventType?: string;
};

async function requireAdmin() {
  const auth = await getServerAuthContext();
  if (!auth?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const role = await getCurrentUserRole(auth);
  if (role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { auth };
}

function parseEntity(value: string | null | undefined): ContentEntity | null {
  if (value === "curriculum" || value === "groups" || value === "events") {
    return value;
  }

  return null;
}

function isMissingTableError(message: string | undefined, table: string): boolean {
  if (!message) {
    return false;
  }

  const text = message.toLowerCase();
  if (!text.includes(table.toLowerCase())) {
    return false;
  }

  return text.includes("could not find the table") || text.includes("schema cache") || text.includes("does not exist");
}

function isMissingColumnError(message: string | undefined, column: string): boolean {
  if (!message) {
    return false;
  }

  const text = message.toLowerCase();
  return text.includes("column") && text.includes(column.toLowerCase()) && text.includes("does not exist");
}

function normalizeColor(input: string | undefined): string {
  const color = input?.trim();
  if (!color) {
    return "#2563EB";
  }
  return color;
}

function normalizeEventDate(input: string | null | undefined): string {
  if (!input) {
    return new Date().toISOString();
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid eventDate.");
  }

  return parsed.toISOString();
}

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return guard.error;
  }

  const url = new URL(request.url);
  const entity = parseEntity(url.searchParams.get("entity"));
  if (!entity) {
    return NextResponse.json({ error: "Invalid entity." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceClient();

    if (entity === "curriculum") {
      const query = supabase
        .from("subjects")
        .select("id, name, color, created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      let data: { id: string; name: string; color: string | null; created_at: string }[] | null = null;
      let error: { message: string } | null = null;

      const withStudentIdFilter = await query.is("student_id", null);
      if (withStudentIdFilter.error && isMissingColumnError(withStudentIdFilter.error.message, "student_id")) {
        const fallback = await query;
        data = fallback.data;
        error = fallback.error;
      } else {
        data = withStudentIdFilter.data;
        error = withStudentIdFilter.error;
      }

      if (error) {
        if (isMissingTableError(error.message, "subjects")) {
          return NextResponse.json({ items: [] });
        }
        throw new Error(error.message);
      }

      return NextResponse.json({ items: data ?? [] });
    }

    if (entity === "groups") {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, location, event_date, seats, created_at")
        .eq("event_type", "group")
        .order("event_date", { ascending: true })
        .limit(200);

      if (error) {
        if (isMissingTableError(error.message, "events")) {
          return NextResponse.json({ items: [] });
        }
        throw new Error(error.message);
      }

      return NextResponse.json({ items: data ?? [] });
    }

    const { data, error } = await supabase
      .from("events")
      .select("id, title, event_type, location, event_date, seats, created_at")
      .neq("event_type", "group")
      .order("event_date", { ascending: true })
      .limit(200);

    if (error) {
      if (isMissingTableError(error.message, "events")) {
        return NextResponse.json({ items: [] });
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not fetch content.";
    console.error("GET /api/admin/content failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return guard.error;
  }

  let payload: ContentPayload;
  try {
    payload = (await request.json()) as ContentPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const entity = payload.entity;
  if (!entity) {
    return NextResponse.json({ error: "Missing entity." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceClient();

    if (entity === "curriculum") {
      if (!payload.name?.trim()) {
        return NextResponse.json({ error: "Missing curriculum name." }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("subjects")
        .insert({
          user_id: guard.auth.user.id,
          name: payload.name.trim(),
          color: normalizeColor(payload.color),
        })
        .select("id, name, color, created_at")
        .maybeSingle();

      if (error) {
        if (isMissingColumnError(error.message, "student_id")) {
          const fallback = await supabase
            .from("subjects")
            .insert({
              user_id: guard.auth.user.id,
              name: payload.name.trim(),
              color: normalizeColor(payload.color),
            })
            .select("id, name, color, created_at")
            .maybeSingle();

          if (fallback.error) {
            throw new Error(fallback.error.message);
          }

          return NextResponse.json({ item: fallback.data });
        }
        if (isMissingTableError(error.message, "subjects")) {
          return NextResponse.json(
            { error: "Missing table: public.subjects. Apply supabase/master.sql to enable curriculum management." },
            { status: 503 },
          );
        }
        throw new Error(error.message);
      }

      return NextResponse.json({ item: data });
    }

    if (!payload.title?.trim()) {
      return NextResponse.json({ error: "Missing title." }, { status: 400 });
    }

    const eventType = entity === "groups" ? "group" : (payload.eventType?.trim() || "event");
    const { data, error } = await supabase
      .from("events")
      .insert({
        user_id: guard.auth.user.id,
        title: payload.title.trim(),
        event_type: eventType,
        location: payload.location ?? null,
        event_date: normalizeEventDate(payload.eventDate),
        seats: payload.seats ?? null,
      })
      .select("id, title, event_type, location, event_date, seats, created_at")
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error.message, "events")) {
        return NextResponse.json(
          { error: "Missing table: public.events. Apply supabase/master.sql to enable groups/events management." },
          { status: 503 },
        );
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create item.";
    console.error("POST /api/admin/content failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return guard.error;
  }

  let payload: ContentPayload;
  try {
    payload = (await request.json()) as ContentPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const entity = payload.entity;
  const id = payload.id;
  if (!entity || !id) {
    return NextResponse.json({ error: "Missing entity or id." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceClient();

    if (entity === "curriculum") {
      const update: { name?: string; color?: string } = {};

      if (payload.name !== undefined) {
        if (!payload.name.trim()) {
          return NextResponse.json({ error: "Curriculum name cannot be empty." }, { status: 400 });
        }
        update.name = payload.name.trim();
      }

      if (payload.color !== undefined) {
        update.color = normalizeColor(payload.color);
      }

      const { data, error } = await supabase
        .from("subjects")
        .update(update)
        .eq("id", id)
        .select("id, name, color, created_at")
        .maybeSingle();

      if (error) {
        if (isMissingTableError(error.message, "subjects")) {
          return NextResponse.json(
            { error: "Missing table: public.subjects. Apply supabase/master.sql to enable curriculum management." },
            { status: 503 },
          );
        }
        throw new Error(error.message);
      }

      return NextResponse.json({ item: data });
    }

    const update: { title?: string; location?: string | null; event_date?: string; seats?: number | null; event_type?: string } = {};

    if (payload.title !== undefined) {
      if (!payload.title.trim()) {
        return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
      }
      update.title = payload.title.trim();
    }

    if (payload.location !== undefined) {
      update.location = payload.location;
    }

    if (payload.eventDate !== undefined) {
      update.event_date = normalizeEventDate(payload.eventDate);
    }

    if (payload.seats !== undefined) {
      update.seats = payload.seats;
    }

    if (entity === "groups") {
      update.event_type = "group";
    } else if (payload.eventType !== undefined) {
      update.event_type = payload.eventType.trim() || "event";
    }

    const { data, error } = await supabase
      .from("events")
      .update(update)
      .eq("id", id)
      .select("id, title, event_type, location, event_date, seats, created_at")
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error.message, "events")) {
        return NextResponse.json(
          { error: "Missing table: public.events. Apply supabase/master.sql to enable groups/events management." },
          { status: 503 },
        );
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ item: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update item.";
    console.error("PATCH /api/admin/content failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const guard = await requireAdmin();
  if ("error" in guard) {
    return guard.error;
  }

  let payload: ContentPayload;
  try {
    payload = (await request.json()) as ContentPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const entity = payload.entity;
  const id = payload.id;
  if (!entity || !id) {
    return NextResponse.json({ error: "Missing entity or id." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseServiceClient();

    if (entity === "curriculum") {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) {
        if (isMissingTableError(error.message, "subjects")) {
          return NextResponse.json(
            { error: "Missing table: public.subjects. Apply supabase/master.sql to enable curriculum management." },
            { status: 503 },
          );
        }
        throw new Error(error.message);
      }
      return NextResponse.json({ ok: true });
    }

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      if (isMissingTableError(error.message, "events")) {
        return NextResponse.json(
          { error: "Missing table: public.events. Apply supabase/master.sql to enable groups/events management." },
          { status: 503 },
        );
      }
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete item.";
    console.error("DELETE /api/admin/content failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
