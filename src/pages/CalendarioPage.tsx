import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, Plus, RefreshCw, ExternalLink } from "lucide-react";
import { useGoogleToken } from "@/hooks/useGoogleToken";
import GoogleConnectButton from "@/components/google/GoogleConnectButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

interface GCalendar {
  id: string;
  summary: string;
  backgroundColor?: string;
  primary?: boolean;
}

interface GEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
  organizer?: { displayName?: string; email?: string };
}

const CalendarioPage = () => {
  const { token, loading } = useGoogleToken();
  const [calendars, setCalendars] = useState<GCalendar[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<(GEvent & { calendarId: string; color?: string })[]>([]);
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ summary: "", date: "", time: "09:00", description: "" });
  const [creating, setCreating] = useState(false);

  const monthBounds = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { start: start.toISOString(), end: end.toISOString() };
  }, []);

  const monthLabel = useMemo(() => {
    return new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }, []);

  const fetchCalendars = async () => {
    if (!token) return;
    try {
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Falha ao buscar calendários");
      const data = await res.json();
      const items: GCalendar[] = data.items ?? [];
      setCalendars(items);
      // por padrão, marca o primário
      const initial = new Set(items.filter((c) => c.primary).map((c) => c.id));
      if (initial.size === 0 && items[0]) initial.add(items[0].id);
      setSelected(initial);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const fetchEvents = async () => {
    if (!token || selected.size === 0) {
      setEvents([]);
      return;
    }
    setBusy(true);
    try {
      const all: (GEvent & { calendarId: string; color?: string })[] = [];
      for (const cid of selected) {
        const cal = calendars.find((c) => c.id === cid);
        const url = new URL(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cid)}/events`
        );
        url.searchParams.set("timeMin", monthBounds.start);
        url.searchParams.set("timeMax", monthBounds.end);
        url.searchParams.set("singleEvents", "true");
        url.searchParams.set("orderBy", "startTime");
        url.searchParams.set("maxResults", "50");
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) continue;
        const data = await res.json();
        for (const ev of data.items ?? []) {
          all.push({ ...ev, calendarId: cid, color: cal?.backgroundColor });
        }
      }
      all.sort((a, b) => {
        const ta = a.start?.dateTime || a.start?.date || "";
        const tb = b.start?.dateTime || b.start?.date || "";
        return ta.localeCompare(tb);
      });
      setEvents(all);
    } catch (e: any) {
      toast({ title: "Erro ao buscar eventos", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    fetchCalendars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, calendars.length, token]);

  const toggleCalendar = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createEvent = async () => {
    if (!token || !form.summary || !form.date) {
      toast({ title: "Preencha título e data", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const start = new Date(`${form.date}T${form.time}:00`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: form.summary,
            description: form.description || undefined,
            start: { dateTime: start.toISOString() },
            end: { dateTime: end.toISOString() },
          }),
        }
      );
      if (!res.ok) throw new Error("Falha ao criar evento");
      toast({ title: "Evento criado" });
      setCreateOpen(false);
      setForm({ summary: "", date: "", time: "09:00", description: "" });
      fetchEvents();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-b-2 border-accent rounded-full" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-10 sm:py-16">
        <div className="flex items-center gap-3 mb-8">
          <CalendarIcon className="h-7 w-7 text-accent" />
          <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
        </div>
        <GoogleConnectButton
          label="Conectar Google Calendar"
          description="Conecte sua conta Google para visualizar e criar eventos em seus calendários."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-7 w-7 text-accent" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
            <p className="text-sm text-muted-foreground capitalize">{monthLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchEvents} disabled={busy}>
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo evento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar de calendários */}
        <aside className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">Meus calendários</h2>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {calendars.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhum calendário encontrado.</p>
            )}
            {calendars.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 cursor-pointer text-sm text-foreground hover:bg-muted/40 rounded-md p-1.5"
              >
                <Checkbox
                  checked={selected.has(c.id)}
                  onCheckedChange={() => toggleCalendar(c.id)}
                />
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: c.backgroundColor || "hsl(var(--accent))" }}
                />
                <span className="truncate">{c.summary}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* Lista de eventos */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Eventos do mês ({events.length})
          </h2>
          {events.length === 0 && !busy && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhum evento neste mês para os calendários selecionados.
            </p>
          )}
          <ul className="space-y-2">
            {events.map((ev) => {
              const startISO = ev.start?.dateTime || ev.start?.date;
              const startDate = startISO ? new Date(startISO) : null;
              return (
                <li
                  key={`${ev.calendarId}-${ev.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors"
                >
                  <span
                    className="h-3 w-3 rounded-full shrink-0 mt-1.5"
                    style={{ backgroundColor: ev.color || "hsl(var(--accent))" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {ev.summary || "(sem título)"}
                      </p>
                      {ev.htmlLink && (
                        <a
                          href={ev.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-accent shrink-0"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    {startDate && (
                      <p className="text-xs text-muted-foreground">
                        {startDate.toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: ev.start?.dateTime ? "2-digit" : undefined,
                          minute: ev.start?.dateTime ? "2-digit" : undefined,
                        })}
                      </p>
                    )}
                    {ev.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {ev.description}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={createEvent} disabled={creating}>
              {creating ? "Criando..." : "Criar evento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarioPage;
