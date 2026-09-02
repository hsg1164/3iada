import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  CalendarCheck2,
  CheckCircle2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

type Stat = {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  wrap: string;
  tile: string;
};

const STATS: Stat[] = [
  {
    icon: Users,
    label: "المرضى",
    value: "١٣٤٨",
    trend: "+١٢٪",
    wrap: "border-sky-100 dark:border-sky-400/20 bg-sky-50/80 dark:bg-sky-500/[0.09]",
    tile: "bg-sky-100/80 dark:bg-sky-400/15 text-sky-600 dark:text-sky-300",
  },
  {
    icon: CalendarCheck2,
    label: "المواعيد",
    value: "٩٦",
    trend: "+٨ اليوم",
    wrap: "border-violet-100 dark:border-violet-400/20 bg-violet-50/80 dark:bg-violet-500/[0.10]",
    tile: "bg-violet-100/80 dark:bg-violet-400/15 text-violet-600 dark:text-violet-300",
  },
  {
    icon: Wallet,
    label: "إيرادات اليوم",
    value: "٤٬٢٠٠ ر.م",
    trend: "+٢٤٪",
    wrap: "border-teal-100 dark:border-[#00D4B8]/25 bg-teal-50/80 dark:bg-[#00D4B8]/[0.09]",
    tile: "bg-teal-100/80 dark:bg-[#00D4B8]/15 text-teal-600 dark:text-[#19E6D0]",
  },
];

const BARS = [42, 66, 50, 76, 58, 92, 70];
const DAYS = ["سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];
const HOT_BAR = 5;

function DashboardChrome() {
  return (
    <div className="flex items-center justify-between mb-6 sm:mb-7">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#19E6D0] opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00D4B8]" />
        </span>
        <span className="text-sm font-medium text-slate-900 dark:text-slate-200 font-sans-thmanyah">
          لوحة التحكم — اليوم
        </span>
      </div>
      <div className="flex items-center gap-2" dir="ltr">
        <span className="h-3 w-3 rounded-full bg-[#00D4B8]/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/70" />
        <span className="h-3 w-3 rounded-full bg-red-400/60" />
      </div>
    </div>
  );
}

function DashboardStats({ reduce }: { reduce: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 + i * 0.14, duration: 0.55, ease }}
          className={`rounded-2xl border p-4 sm:p-5 ${s.wrap}`}
        >
          <div className="flex items-start justify-between mb-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.tile}`}>
              <s.icon className="h-4 w-4" />
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 dark:bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-300">
              <TrendingUp className="h-2.5 w-2.5" />
              {s.trend}
            </span>
          </div>
          <p className="font-display font-bold text-slate-900 dark:text-white text-[1.15rem] sm:text-[1.65rem] leading-none tabular-nums">
            {s.value}
          </p>
          <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-2">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

function RevenueChart({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6, ease }}
      className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50 dark:bg-[#101d36] p-5 sm:p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200 font-sans-thmanyah">
          <Activity className="h-4 w-4 text-teal-600 dark:text-[#19E6D0]" />
          حركة الإيرادات الأسبوعية
        </span>
        <span className="rounded-full bg-teal-50 dark:bg-[#00D4B8]/10 border border-teal-200 dark:border-[#00D4B8]/25 px-2.5 py-1 text-[11px] font-medium text-teal-600 dark:text-[#19E6D0]">
          +٢٤٪
        </span>
      </div>

      <div className="flex items-end gap-2 sm:gap-3 h-32 sm:h-40">
        {BARS.map((h, i) => (
          <div key={i} className="relative flex-1 h-full flex items-end">
            {i === HOT_BAR && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 10, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.95, duration: 0.5, ease }}
                className="absolute -top-14 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded-xl border border-slate-200 dark:border-[#00D4B8]/30 bg-white dark:bg-[#0a1526] px-3 py-2 shadow-[0_12px_35px_rgba(15,40,80,0.18)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45),0_0_24px_rgba(0,212,184,0.22)]"
              >
                <p className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 leading-none">
                  <Wallet className="h-3 w-3 text-teal-600 dark:text-[#19E6D0]" />
                  دفعة مستلمة
                </p>
                <p
                  className="font-display font-bold text-teal-600 dark:text-[#19E6D0] text-sm mt-1.5 leading-none"
                  dir="rtl"
                >
                  ٥٬١٠٠ ر.م
                </p>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-b border-l border-slate-200 dark:border-[#00D4B8]/30 bg-white dark:bg-[#0a1526]" />
              </motion.div>
            )}
            <motion.div
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.15 + i * 0.09, duration: 0.7, ease }}
              className={`w-full origin-bottom rounded-t-lg ${
                i === HOT_BAR
                  ? "bg-gradient-to-t from-teal-500/60 via-[#00D4B8] to-[#19E6D0] shadow-[0_0_26px_rgba(0,212,184,0.5)]"
                  : "bg-gradient-to-t from-[#00D4B8]/25 via-[#00D4B8]/55 to-teal-300/80"
              }`}
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 sm:gap-3">
        {DAYS.map((d) => (
          <span
            key={d}
            className="flex-1 text-center text-[9px] sm:text-[10px] font-normal text-slate-400 dark:text-slate-500"
          >
            {d}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function FloatingAppointmentCard({ reduce }: { reduce: boolean }) {
  return (
    <div
      className="absolute -left-4 sm:-left-6 xl:-left-16 top-6 sm:top-12 hidden md:block"
      style={{ transform: "translateZ(70px)" }}
    >
      <div className={reduce ? "" : "hero-float-appt"}>
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -28, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 1.55, duration: 0.65, ease }}
          className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 dark:border-[#00D4B8]/25 bg-white dark:bg-[#0d1930] px-5 py-4 shadow-[0_24px_60px_-18px_rgba(4,38,84,0.28)] dark:shadow-[0_24px_60px_-18px_rgba(4,38,84,0.4)]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 dark:from-[#00D4B8]/30 dark:to-[#00D4B8]/5 ring-1 ring-teal-200 dark:ring-[#00D4B8]/30">
            <CalendarCheck2 className="h-5 w-5 text-teal-600 dark:text-[#19E6D0]" />
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
              موعد مؤكد
              <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">د. أحمد محمد · ٣:٠٠ م</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FloatingPaymentCard({ reduce }: { reduce: boolean }) {
  return (
    <div
      className="absolute -right-4 sm:-right-6 xl:-right-14 bottom-6 sm:bottom-12 hidden sm:block"
      style={{ transform: "translateZ(40px)" }}
    >
      <div className={reduce ? "" : "hero-float-pay"}>
        <motion.div
          initial={reduce ? false : { opacity: 0, x: 28, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 1.75, duration: 0.65, ease }}
          className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 dark:border-white/12 bg-white dark:bg-[#0d1930] px-5 py-4 shadow-[0_24px_60px_-18px_rgba(4,38,84,0.28)] dark:shadow-[0_24px_60px_-18px_rgba(4,38,84,0.4)]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-400/30 dark:to-teal-400/5 ring-1 ring-teal-200 dark:ring-teal-300/30">
            <Wallet className="h-5 w-5 text-teal-600 dark:text-teal-300" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white font-sans-thmanyah">دفعة مستلمة</p>
            <p className="font-display text-xs font-bold text-teal-600 dark:text-[#19E6D0] mt-1">٥٬١٠٠ ر.م</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function HeroDashboard() {
  const reduce = useReducedMotion();

  return (
    <div className="hero-scene relative w-full max-w-[700px] mx-auto lg:mx-0 lg:max-w-[92%] xl:max-w-[680px]">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 64, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.05, delay: 0.35, ease }}
      >
        <div className="hero-tilt">
          {/* soft ambient glow behind the dashboard */}
          <div
            aria-hidden
            className={`absolute -inset-10 rounded-[3rem] blur-3xl ${
              reduce ? "" : "animate-pulse"
            }`}
            style={{
              background:
                "radial-gradient(ellipse at 55% 45%, rgba(0,212,184,0.13), rgba(11,22,43,0.16) 60%, transparent 78%)",
            }}
          />

          {/* ===== main dashboard ===== */}
          <div className={reduce ? "relative" : "hero-float-main relative"}>
            <div className="relative overflow-hidden rounded-[26px] border border-slate-200/90 dark:border-[#00D4B8]/[0.16] bg-white dark:bg-[#0c1629] p-5 sm:p-7 shadow-[0_50px_100px_-30px_rgba(4,38,84,0.4),0_24px_60px_-20px_rgba(0,104,226,0.18),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_50px_100px_-30px_rgba(4,38,84,0.45),0_24px_60px_-20px_rgba(0,104,226,0.22),inset_0_1px_0_rgba(255,255,255,0.07)]">
              <DashboardChrome />
              <DashboardStats reduce={!!reduce} />
              <RevenueChart reduce={!!reduce} />
            </div>
          </div>

          {/* ===== floating cards ===== */}
          <FloatingAppointmentCard reduce={!!reduce} />
          <FloatingPaymentCard reduce={!!reduce} />
        </div>
      </motion.div>
    </div>
  );
}
