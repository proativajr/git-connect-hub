import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import sharkJaws from "@/assets/shark-jaws.png";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };
type GeminiMsg = { role: "user" | "model"; parts: { text: string }[] };

const SUPABASE_URL = "https://iglmchnscxruybdiuseo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbG1jaG5zY3hydXliZGl1c2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzY3OTIsImV4cCI6MjA4NzU1Mjc5Mn0.PFY2we3jT-I_nXuKr8O4IQ01tpwfknOWRRNMB0dYQyA";
const CHAT_URL = `${SUPABASE_URL}/functions/v1/shark-chat`;

async function sendChat(messages: Msg[]): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const authToken = session?.access_token ?? SUPABASE_ANON_KEY;

  // Convert chat history to Gemini format
  const history: GeminiMsg[] = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1].content;

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ message: lastMessage, history }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    let errMsg = "Falha na conexão";
    try {
      const err = JSON.parse(errText);
      errMsg = err.error || err.message || errMsg;
    } catch { /* keep default */ }
    throw new Error(errMsg);
  }

  const data = await resp.json();
  return data.reply;
}

const SharkChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    setInput("");
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    try {
      const reply = await sendChat([...messages, userMsg]);
      setMessages((p) => [...p, { role: "assistant", content: reply }]);
    } catch (e: any) {
      console.error(e);
      setMessages((p) => [...p, { role: "assistant", content: `Erro: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating shark character */}
      <div className="fixed bottom-0 right-6 z-50 group">
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-card text-card-foreground text-sm rounded-xl shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Sou o Jaws, tiro suas dúvidas igual eu mordo 🦈
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="relative h-[90px] w-[90px] overflow-hidden cursor-pointer hover:translate-y-[-8px] transition-transform duration-300 bg-transparent border-none outline-none"
          aria-label="Abrir chat Shark"
        >
          <img
            src={sharkJaws}
            alt="Jaws - Assistente IA"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120px] max-w-none object-contain object-bottom"
          />
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-[100px] right-6 z-50 w-[360px] h-[480px] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground">
            <img src={sharkJaws} alt="Jaws" className="h-6 w-6 object-contain" />
            <span className="font-semibold text-sm">Jaws — Assistente IA</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 ocean-scroll">
            {messages.length === 0 && (
              <p className="text-muted-foreground text-sm text-center mt-8">
                Olá! Sou o Shark 🦈<br />Como posso te ajudar?
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-card-foreground"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-xl px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 p-3 border-t border-border"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default SharkChat;
