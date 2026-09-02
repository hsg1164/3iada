import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ArrowLeft, Clock } from "lucide-react";
import { useLocation } from "wouter";

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                    */
/* ------------------------------------------------------------------ */

type Msg = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  created_at: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("failed");
  return res.json();
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins}د`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `منذ ${h}س`;
  const d = Math.floor(h / 24);
  return d < 30 ? `منذ ${d}ي` : new Date(iso).toLocaleDateString("ar-SA");
}

const STATUS_DOT: Record<string, string> = {
  new: "#0A6CFF",
  read: "#8EA2BD",
  replied: "#00D8D8",
  archived: "#FFC857",
};

/* ------------------------------------------------------------------ */
/*  Shared hook (reused by sidebar badge)                               */
/* ------------------------------------------------------------------ */

export function useContactMessages() {
  return useQuery<Msg[]>({
    queryKey: ["contact-messages"],
    queryFn: () => fetchJson("/api/contact-messages"),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

/* ------------------------------------------------------------------ */
/*  Dashboard widget                                                    */
/* ------------------------------------------------------------------ */

export function SiteMessagesWidget() {
  const [, setLocation] = useLocation();
  const { data = [], isLoading } = useContactMessages();

  const newCount = useMemo(() => data.filter((m) => m.status === "new").length, [data]);
  const latest = useMemo(() => data.slice(0, 5), [data]);

  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #071A32, #061329)",
        border: "1px solid rgba(40,130,220,0.16)",
      }}
    >
      {/* ─── Header Banner ─── */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{
          background: "linear-gradient(135deg, #0A6CFF, #00D8D8)",
        }}
      >
        <div className="flex items-center gap-3 text-white">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/20 backdrop-blur-sm">
            <MessageSquare className="h-4 w-4" />
            {newCount > 0 && (
              <span className="absolute -top-1.5 -left-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF4D60] px-1 text-[9px] font-bold shadow ring-2 ring-[#0A6CFF]">
                {newCount}
              </span>
            )}
          </span>
          <div>
            <h3 className="text-[14px] font-bold leading-tight">رسائل الموقع</h3>
            <p className="text-[11px] font-medium text-white/80">
              {newCount > 0 ? `${newCount} رسالة جديدة` : "لا رسائل جديدة"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setLocation("/superadmin/messages")}
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-white/20 backdrop-blur-sm px-3.5 py-2 text-[12px] font-bold text-white transition-all duration-200 hover:bg-white/30"
        >
          عرض الكل
          <ArrowLeft className="h-3 w-3" />
        </button>
      </div>

      {/* ─── Messages List ─── */}
      <div className="p-0">
        {isLoading ? (
          <div className="space-y-0">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ borderBottom: "1px solid rgba(40,130,220,0.08)" }}
              >
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" style={{ background: "rgba(40,130,220,0.1)" }} />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28" style={{ background: "rgba(40,130,220,0.1)" }} />
                  <Skeleton className="h-3 w-48" style={{ background: "rgba(40,130,220,0.1)" }} />
                </div>
                <Skeleton className="h-3 w-12 shrink-0" style={{ background: "rgba(40,130,220,0.1)" }} />
              </div>
            ))}
          </div>
        ) : latest.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <MessageSquare className="h-10 w-10 text-[#8EA2BD] opacity-30" />
            <p className="text-sm font-semibold text-[#8EA2BD]">لا توجد رسائل بعد</p>
          </div>
        ) : (
          <div>
            {latest.map((m) => (
              <button
                key={m.id}
                onClick={() => setLocation("/superadmin/messages")}
                className="group flex w-full items-center gap-3 px-5 py-3.5 text-right transition-all duration-200 hover:bg-[rgba(0,116,255,.04)]"
                style={{
                  borderBottom: "1px solid rgba(40,130,220,0.08)",
                  background: m.status === "new" ? "rgba(10,108,255,0.04)" : "transparent",
                }}
              >
                {/* Avatar */}
                <span
                  className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #0A6CFF, #00D8D8)",
                    boxShadow: "0 0 10px rgba(10,108,255,0.2)",
                  }}
                >
                  {m.name.trim().charAt(0)}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: STATUS_DOT[m.status],
                      boxShadow: `0 0 0 2px #071A32`,
                    }}
                  />
                </span>

                {/* Content */}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={`truncate text-[13px] font-semibold ${
                        m.status === "new" ? "text-white" : "text-[#8EA2BD]"
                      }`}
                    >
                      {m.name}
                    </span>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{
                        background: "rgba(10,108,255,0.1)",
                        color: "#0A6CFF",
                        border: "1px solid rgba(10,108,255,0.15)",
                      }}
                    >
                      {m.subject}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-[#8EA2BD]">
                    {m.message.length > 50 ? m.message.slice(0, 50) + "…" : m.message}
                  </span>
                </span>

                {/* Time */}
                <span className="flex shrink-0 items-center gap-1 text-[10px] text-[#8EA2BD] opacity-60">
                  <Clock className="h-3 w-3" />
                  {timeAgo(m.created_at)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
