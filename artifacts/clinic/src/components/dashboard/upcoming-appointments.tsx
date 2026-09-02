import { useMemo } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, CalendarDays, CalendarX2 } from "lucide-react";
import { useListAppointments } from "@workspace/api-client-react";

const AR_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const STATUS_LABELS: Record<string, { ar: string; color: string; bg: string }> = {
  waiting_arrival: { ar: "في انتظار", color: "#0A6CFF", bg: "rgba(10,108,255,0.12)" },
  in_reception: { ar: "في الاستقبال", color: "#147DFF", bg: "rgba(20,125,255,0.12)" },
  in_examination: { ar: "في الكشف", color: "#00D8D8", bg: "rgba(0,216,216,0.12)" },
  completed: { ar: "تمت الزيارة", color: "#00C9C9", bg: "rgba(0,201,201,0.12)" },
  session_done: { ar: "انتهت الجلسة", color: "#008C91", bg: "rgba(0,140,145,0.12)" },
  postponed: { ar: "مؤجل", color: "#FFC857", bg: "rgba(255,200,87,0.12)" },
  no_show: { ar: "لم يحضر", color: "#FF4D60", bg: "rgba(255,77,96,0.12)" },
  cancelled: { ar: "ملغي", color: "#FF4D60", bg: "rgba(255,77,96,0.12)" },
};

function fmtTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return t;
  const period = h >= 12 ? "م" : "ص";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function checkInitial(name: string) {
  return (name || "؟").trim().charAt(0);
}

function AppointmentRow({
  name,
  type,
  time,
  status,
  initial,
}: {
  name: string;
  type: string;
  time: string;
  status: string;
  initial: string;
}) {
  const st = STATUS_LABELS[status] || { ar: status, color: "#8EA2BD", bg: "rgba(142,162,189,0.12)" };

  return (
    <div
      className="flex items-center justify-between rounded-[10px] px-2 py-2 transition-all duration-200 hover:bg-[rgba(255,255,255,0.02)]"
      dir="rtl"
    >
      <div className="flex items-center gap-3">
        {/* RIGHT: avatar */}
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white border border-[#0A6CFF]/30"
          style={{
            background: "linear-gradient(135deg, #0A6CFF, #00D8D8)",
            boxShadow: "0 0 12px rgba(10,108,255,0.20)",
          }}
        >
          {initial}
        </span>

        {/* CENTER: name + type */}
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white truncate">{name}</p>
          <p className="text-[11px] truncate" style={{ color: "#8EA2BD" }}>
            {type || "—"}
          </p>
        </div>
      </div>

      {/* LEFT: status + time */}
      <div className="flex items-center gap-4">
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: st.bg, color: st.color, border: `1px solid ${st.color}30` }}
        >
          {st.ar}
        </span>
        <span className="text-[12px] font-bold text-white w-12 text-left" dir="ltr">
          {time}
        </span>
      </div>
    </div>
  );
}

export function UpcomingAppointments() {
  const [, setLocation] = useLocation();
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { data: list, isLoading } = useListAppointments({ date: today, limit: 50 });

  const upcoming = useMemo(() => {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const nowDate = now.toISOString().split("T")[0];
    const listArr = list?.appointments ?? [];
    return listArr
      .filter((a) => {
        if (nowDate !== today) return true;
        const [h, m] = (a.appointmentTime || "00:00").split(":").map(Number);
        const apptMin = (h || 0) * 60 + (m || 0);
        return apptMin >= nowMin - 60;
      })
      .filter((a) => !["completed", "cancelled", "no_show"].includes(a.status))
      .slice(0, 6);
  }, [list, today]);

  const dayName = AR_DAYS[new Date().getDay()];

  return (
    <div className="flex flex-col h-full" dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="h-4 w-4 text-[#0A6CFF]" />
        <h3 className="text-[14px] font-bold text-white">المواعيد القادمة</h3>
        <span className="px-2 py-0.5 rounded text-[9px] font-bold mr-auto" style={{ background: "rgba(10,108,255,0.1)", color: "#0A6CFF" }}>
          {dayName}
        </span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <CalendarDays className="w-5 h-5 animate-pulse text-[#8EA2BD]" />
        </div>
      ) : upcoming.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(40,130,220,0.08)" }}>
            <CalendarX2 className="w-6 h-6" style={{ color: "#8EA2BD" }} />
          </div>
          <p className="text-[13px] font-bold text-white">لا توجد مواعيد قادمة</p>
          <p className="text-[11px] mt-1" style={{ color: "#8EA2BD" }}>لم يتم تسجيل أي مواعيد لليوم</p>
        </div>
      ) : (
        <div className="space-y-1 flex-1">
          {upcoming.map((a) => (
            <AppointmentRow
              key={a.id}
              name={a.patientNameAr}
              type={a.serviceNames?.join("، ") || ""}
              time={fmtTime(a.appointmentTime)}
              status={a.status}
              initial={checkInitial(a.patientNameAr)}
            />
          ))}
        </div>
      )}

      <button
        className="w-full flex items-center justify-center gap-2 rounded-lg py-2 mt-4 text-[12px] font-bold transition-colors"
        style={{
          background: "rgba(10, 108, 255, 0.1)",
          color: "#0A6CFF",
        }}
        onClick={() => setLocation("/appointments")}
      >
        <ArrowLeft className="h-4 w-4" />
        عرض جميع المواعيد
      </button>
    </div>
  );
}