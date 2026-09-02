import { useEffect, useRef, useState, useId } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

/* ─── Count-up hook ─── */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const ref = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    startTime.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - (startTime.current || now);
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);

  return value;
}

/* ─── Mini sparkline (matches the image's glowing bottom-right chart) ─── */
function MiniSparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 40;
  const padY = 4;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = padY + (h - 2 * padY) - ((v - min) / range) * (h - 2 * padY);
      return `${x},${y}`;
    })
    .join(" ");
  const areaPoints = points + ` ${w},${h} 0,${h}`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="shrink-0"
      style={{ direction: "ltr", display: "block", filter: `drop-shadow(0 4px 6px ${color}40)` }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sp-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#sp-grad-${id})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Stat Card ─── */
interface StatCardProps {
  title: string;
  rawValue: number;
  formattedPrefix?: string;
  formattedSuffix?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  iconBg: string; // Used for the circle glow
  iconColor: string; // The solid color for borders and text
  sparkData: number[];
}

export function StatCard({
  title,
  rawValue,
  formattedPrefix,
  formattedSuffix,
  change,
  changeLabel,
  icon: Icon,
  iconBg,
  iconColor,
  sparkData,
}: StatCardProps) {
  const uid = useId();
  const animated = useCountUp(rawValue);
  const isEmpty = rawValue === 0;
  const isPositive = (change ?? 0) >= 0;
  const trendColor = isPositive ? "#00D9D0" : "#FF4D60"; // Green/Cyan for positive, Red for negative as per image

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] as const },
        },
      }}
      className="h-[145px]"
    >
      <div
        className="group relative h-full overflow-hidden rounded-[14px] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        style={{
          background: "#050C1F", // Very dark navy matching the image
          border: `1px solid rgba(255, 255, 255, 0.05)`,
        }}
      >
        {/* Background glow behind the icon */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none blur-[40px]"
          style={{ background: iconColor, transform: "translate(20%, -20%)" }}
        />

        <div className="relative h-full flex flex-col justify-between p-4" dir="rtl">
          
          {/* ─── TOP ROW ─── */}
          <div className="flex items-start justify-between">
            {/* RIGHT (in RTL): Title & Number */}
            <div className="flex flex-col items-start mt-1">
              <p className="font-medium text-[13px] text-[#8EA2BD] mb-1">
                {title}
              </p>
              {isEmpty ? (
                <h3 className="font-bold text-[22px] text-[#8EA2BD] tracking-tight leading-none mt-1">
                  لا يوجد
                </h3>
              ) : (
                <h3 className="font-bold text-[28px] text-white tracking-tight leading-none" dir="ltr">
                  {formattedPrefix || ""}
                  {animated.toLocaleString("en-US")}
                  {formattedSuffix && <span className="text-[14px] font-normal ml-1 text-[#8EA2BD]">{formattedSuffix}</span>}
                </h3>
              )}
            </div>

            {/* LEFT (in RTL): Icon in a glowing circle */}
            <div
              className="flex items-center justify-center shrink-0 rounded-full"
              style={{
                width: 46,
                height: 46,
                background: "rgba(0,0,0,0.2)",
                border: `1px solid ${iconColor}40`,
                boxShadow: `0 0 15px ${iconBg}`,
              }}
            >
              <Icon style={{ color: iconColor, width: 22, height: 22 }} strokeWidth={2} />
            </div>
          </div>

          {/* ─── BOTTOM ROW ─── */}
          <div className="flex items-end justify-between mt-2">
            {/* RIGHT (in RTL): Percentage */}
            {change !== undefined && !isEmpty && (
              <div className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color: trendColor }}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span dir="ltr">
                  {isPositive ? "+" : ""}{change}%
                </span>
                {changeLabel && <span className="text-[#8EA2BD] font-normal mr-1 text-[11px]">{changeLabel}</span>}
              </div>
            )}

            {/* LEFT (in RTL): Sparkline */}
            {sparkData.length > 1 && !isEmpty ? (
              <div className="shrink-0 -mb-2">
                <MiniSparkline data={sparkData} color={iconColor} id={uid} />
              </div>
            ) : (
              <div className="shrink-0 -mb-2 h-10" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
