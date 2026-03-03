"use client";

import { useEffect, useMemo, useState } from "react";
import { safeJsonParse } from "@/lib/http";

type Entity = "curriculum" | "groups" | "events";

type CurriculumItem = {
  id: string;
  name: string;
  color: string | null;
  created_at: string;
};

type EventItem = {
  id: string;
  title: string;
  event_type?: string;
  location: string | null;
  event_date: string;
  seats: number | null;
  created_at: string;
};

type ContentResponse = {
  items?: Array<CurriculumItem | EventItem>;
  error?: string;
};

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "N/A";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }
  return parsed.toLocaleDateString();
}

function toDateInput(value: string | null | undefined): string {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 10);
}

export default function AdminContentPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [groups, setGroups] = useState<EventItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  const [curriculumName, setCurriculumName] = useState("");
  const [groupTitle, setGroupTitle] = useState("");
  const [groupLocation, setGroupLocation] = useState("");
  const [groupSeats, setGroupSeats] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("event");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventSeats, setEventSeats] = useState("");

  async function fetchEntity(entity: Entity) {
    const response = await fetch(`/api/admin/content?entity=${entity}`);
    const json = await safeJsonParse<ContentResponse>(response);

    if (!response.ok) {
      throw new Error(json.error ?? `Could not load ${entity}.`);
    }

    return json.items ?? [];
  }

  async function loadAll() {
    setLoading(true);
    setError(null);

    try {
      const [curriculumItems, groupItems, eventItems] = await Promise.all([
        fetchEntity("curriculum"),
        fetchEntity("groups"),
        fetchEntity("events"),
      ]);

      setCurriculum(curriculumItems as CurriculumItem[]);
      setGroups(groupItems as EventItem[]);
      setEvents(eventItems as EventItem[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load content.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function createCurriculum() {
    if (!curriculumName.trim()) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity: "curriculum", name: curriculumName }),
      });
      const json = await safeJsonParse<{ error?: string }>(response);
      if (!response.ok) {
        throw new Error(json.error ?? "Could not add curriculum item.");
      }

      setCurriculumName("");
      setSuccess("Curriculum item added.");
      await loadAll();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not add curriculum item.");
    }
  }

  async function createGroup() {
    if (!groupTitle.trim()) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "groups",
          title: groupTitle,
          location: groupLocation || null,
          seats: groupSeats ? Number(groupSeats) : null,
        }),
      });
      const json = await safeJsonParse<{ error?: string }>(response);
      if (!response.ok) {
        throw new Error(json.error ?? "Could not add group.");
      }

      setGroupTitle("");
      setGroupLocation("");
      setGroupSeats("");
      setSuccess("Group added.");
      await loadAll();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not add group.");
    }
  }

  async function createEvent() {
    if (!eventTitle.trim()) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: "events",
          title: eventTitle,
          eventType,
          location: eventLocation || null,
          eventDate: eventDate || null,
          seats: eventSeats ? Number(eventSeats) : null,
        }),
      });
      const json = await safeJsonParse<{ error?: string }>(response);
      if (!response.ok) {
        throw new Error(json.error ?? "Could not add event.");
      }

      setEventTitle("");
      setEventLocation("");
      setEventType("event");
      setEventDate("");
      setEventSeats("");
      setSuccess("Event added.");
      await loadAll();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not add event.");
    }
  }

  async function removeItem(entity: Entity, id: string) {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, id }),
      });
      const json = await safeJsonParse<{ error?: string }>(response);
      if (!response.ok) {
        throw new Error(json.error ?? "Could not delete item.");
      }

      setSuccess("Item deleted.");
      await loadAll();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete item.");
    }
  }

  const counts = useMemo(
    () => ({
      curriculum: curriculum.length,
      groups: groups.length,
      events: events.length,
    }),
    [curriculum.length, events.length, groups.length],
  );

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="section-header" style={{ marginBottom: 10 }}>
        <div className="section-title">Curriculum, Groups, and Events</div>
        <button className="btn btn-secondary btn-sm" type="button" onClick={() => void loadAll()} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <span className="badge blue">Curriculum: {counts.curriculum}</span>
        <span className="badge purple">Groups: {counts.groups}</span>
        <span className="badge green">Events: {counts.events}</span>
      </div>

      {error ? <div className="badge red" style={{ marginBottom: 10 }}>{error}</div> : null}
      {success ? <div className="badge green" style={{ marginBottom: 10 }}>{success}</div> : null}

      <div style={{ display: "grid", gap: 16 }}>
        <div className="card-sm" style={{ border: "1px solid var(--border)" }}>
          <div className="section-header" style={{ marginBottom: 8 }}>
            <div className="section-title" style={{ fontSize: "1rem" }}>Curriculum</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="form-input" placeholder="Add subject..." value={curriculumName} onChange={(event) => setCurriculumName(event.target.value)} />
              <button className="btn btn-primary btn-sm" type="button" onClick={() => void createCurriculum()}>Add</button>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {curriculum.map((item) => (
              <span key={item.id} className="badge gray" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {item.name}
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => void removeItem("curriculum", item.id)}>x</button>
              </span>
            ))}
          </div>
        </div>

        <div className="card-sm" style={{ border: "1px solid var(--border)" }}>
          <div className="section-header" style={{ marginBottom: 8 }}>
            <div className="section-title" style={{ fontSize: "1rem" }}>Groups</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr .6fr auto", gap: 8, marginBottom: 10 }}>
            <input className="form-input" placeholder="Group name" value={groupTitle} onChange={(event) => setGroupTitle(event.target.value)} />
            <input className="form-input" placeholder="Location" value={groupLocation} onChange={(event) => setGroupLocation(event.target.value)} />
            <input className="form-input" placeholder="Seats" value={groupSeats} onChange={(event) => setGroupSeats(event.target.value)} />
            <button className="btn btn-primary btn-sm" type="button" onClick={() => void createGroup()}>Add Group</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Seats</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.location ?? "N/A"}</td>
                    <td>{item.seats ?? "N/A"}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td><button className="btn btn-ghost btn-sm" type="button" onClick={() => void removeItem("groups", item.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-sm" style={{ border: "1px solid var(--border)" }}>
          <div className="section-header" style={{ marginBottom: 8 }}>
            <div className="section-title" style={{ fontSize: "1rem" }}>Events</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr .7fr auto", gap: 8, marginBottom: 10 }}>
            <input className="form-input" placeholder="Event title" value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} />
            <select className="form-select" value={eventType} onChange={(event) => setEventType(event.target.value)}>
              <option value="event">event</option>
              <option value="field_trip">field_trip</option>
              <option value="workshop">workshop</option>
            </select>
            <input className="form-input" placeholder="Location" value={eventLocation} onChange={(event) => setEventLocation(event.target.value)} />
            <input className="form-input" type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
            <input className="form-input" placeholder="Seats" value={eventSeats} onChange={(event) => setEventSeats(event.target.value)} />
            <button className="btn btn-primary btn-sm" type="button" onClick={() => void createEvent()}>Add Event</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Seats</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.event_type ?? "event"}</td>
                    <td>{toDateInput(item.event_date)}</td>
                    <td>{item.location ?? "N/A"}</td>
                    <td>{item.seats ?? "N/A"}</td>
                    <td><button className="btn btn-ghost btn-sm" type="button" onClick={() => void removeItem("events", item.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
