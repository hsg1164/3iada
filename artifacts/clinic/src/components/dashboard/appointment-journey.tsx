import { useState } from "react";
import { CalendarDays } from "lucide-react";

interface Segment {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ segments, total }: { segments: Segment[]; total: number }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const r = 70;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center justify-between gap-6 w-full px-4" dir="rtl">
      {/* Legend on the right in RTL */}
      <div className="flex flex-col gap-3">
        {segments.map((seg, i) => (
          <div
            key={seg.label}
            className="flex items-center justify-between min-w-[120px] cursor-pointer"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-xs" style={{ color: "#8EA2BD" }}>
                {seg.label}
              </span>
            </div>
            <span className="text-sm font-bold text-white ml-2">{seg.value}</span>
          </div>
        ))}
      </div>

      {/* Donut on the left in RTL */}
      <div className="relative shrink-0">
        <svg width="150" height="150" style={{ direction: "ltr" }}>
          {segments.map((seg, i) => {
            const pct = total > 0 ? seg.value / total : 0;
            const dash = pct * circumference;
            const rotation = (offset / total) * 360 - 90;
            offset += seg.value;
            const isHover = hoverIdx === i;
            return (
              <circle
                key={seg.label}
                cx="75"
                cy="75"
                r={r}
                fill="none"
                stroke={seg.color}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={0}
                strokeWidth={isHover ? 14 : 10}
                strokeLinecap="round"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: "50% 50%",
                  transition: "all 0.3s cubic-bezier(.2,.8,.2,1)",
                  opacity: isHover ? 1 : 0.85,
                  filter: isHover ? `drop-shadow(0 0 8px ${seg.color}55)` : "none",
                }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[32px] font-extrabold text-white leading-none mb-1">{total}</span>
          <span className="text-[10px]" style={{ color: "#8EA2BD" }}>
            إجمالي الحجوزات
          </span>
        </div>
      </div>
    </div>
  );
}

export function AppointmentJourney({
  waitingArrival,
  inReception,
  inExamination,
  completed,
  sessionDone,
  postponed,
  noShow,
}: {
  waitingArrival: number;
  inReception: number;
  inExamination: number;
  completed: number;
  sessionDone: number;
  postponed: number;
  noShow: number;
}) {
  const total = waitingArrival + inReception + inExamination + completed + sessionDone + postponed + noShow;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10" dir="rtl">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(40,130,220,0.08)" }}>
          <CalendarDays className="w-6 h-6" style={{ color: "#8EA2BD" }} />
        </div>
        <p className="text-[13px] font-bold text-white">لا توجد حجوزات اليوم</p>
        <p className="text-[11px] mt-1" style={{ color: "#8EA2BD" }}>لم يتم تسجيل أي مواعيد بعد</p>
      </div>
    );
  }

  const segments = [
    { label: "في الانتظار", value: waitingArrival, color: "#0A6CFF" },
    { label: "في الاستقبال", value: inReception, color: "#00D8D8" },
    { label: "في الكشف", value: inExamination, color: "#008C91" },
    { label: "تمت الزيارة", value: completed, color: "#00C9C9" },
    ...(sessionDone > 0 ? [{ label: "انتهت الجلسة", value: sessionDone, color: "#147DFF" }] : []),
    ...(postponed > 0 ? [{ label: "مؤجل", value: postponed, color: "#FFC857" }] : []),
    ...(noShow > 0 ? [{ label: "لم يحضر", value: noShow, color: "#FF4D60" }] : []),
  ];

  return <DonutChart segments={segments} total={total} />;
}
