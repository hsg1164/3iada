import { motion } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Building2,
  Users,
  Activity,
  TrendingUp,
  DollarSign,
  ArrowLeft,
  MessageSquare,
  Clock,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { SiteMessagesWidget } from "@/components/dashboard/site-messages-widget";

/* ─── animation variants ─── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] as const },
  },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] as const },
  },
};

/* ─── Count-up hook ─── */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const ref = useRef<number | null>(null);
  const start = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    start.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - (start.current || now);
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target, duration]);

  return value;
}

/* ─── card style ─── */
const cardStyle: React.CSSProperties = {
  background: "linear-gradient(145deg, #071A32, #061329)",
  border: "1px solid rgba(40,130,220,0.16)",
  backdropFilter: "blur(18px)",
  borderRadius: 14,
};

/* ─── Stats card ─── */
function StatCard({
  title,
  value,
  suffix,
  prefix,
  change,
  changeLabel,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  change: string;
  changeLabel: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  const animated = useCountUp(value);

  return (
    <motion.div variants={scaleIn}>
      <div
        className="group relative overflow-hidden rounded-[14px] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        style={{
          background: "#050C1F",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Background glow */}
        <div
          className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-15 pointer-events-none blur-[40px]"
          style={{ background: iconColor, transform: "translate(-20%, -30%)" }}
        />

        <div className="relative flex items-start justify-between" dir="rtl">
          {/* Text */}
          <div>
            <p className="text-[12px] font-medium text-[#8EA2BD] mb-2">{title}</p>
            <h3 className="text-[28px] font-extrabold text-white tracking-tight leading-none" dir="ltr">
              {prefix || ""}
              {animated.toLocaleString("en-US")}
              {suffix && (
                <span className="text-[13px] font-normal mr-1 text-[#8EA2BD]">{suffix}</span>
              )}
            </h3>
            <div className="flex items-center gap-1.5 mt-3">
              <TrendingUp className="w-3.5 h-3.5 text-[#00D9D0]" />
              <span className="text-[12px] font-bold text-[#00D9D0]" dir="ltr">
                {change}
              </span>
              <span className="text-[11px] text-[#8EA2BD] mr-1">{changeLabel}</span>
            </div>
          </div>

          {/* Icon */}
          <div
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 46,
              height: 46,
              background: "rgba(0,0,0,0.2)",
              border: `1px solid ${iconColor}40`,
              boxShadow: `0 0 20px ${iconColor}30`,
            }}
          >
            <Icon style={{ color: iconColor, width: 22, height: 22 }} strokeWidth={2} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Chart data ─── */
const GROWTH_DATA = [
  { month: "يناير", clinics: 12 },
  { month: "فبراير", clinics: 14 },
  { month: "مارس", clinics: 16 },
  { month: "أبريل", clinics: 19 },
  { month: "مايو", clinics: 21 },
  { month: "يونيو", clinics: 24 },
];

const PIE_DATA = [
  { name: "الباقة الأساسية", value: 8, color: "#0A6CFF" },
  { name: "الباقة المتقدمة", value: 10, color: "#00D8D8" },
  { name: "الباقة المميزة", value: 4, color: "#8B5CF6" },
  { name: "تجريبية", value: 2, color: "#FFC857" },
];

/* ─── Chart tooltip ─── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[10px] px-3 py-2"
      style={{
        background: "rgba(6,19,41,0.96)",
        border: "1px solid rgba(0,216,216,0.25)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >
      <p className="text-[10px] font-bold text-[#8EA2BD]">{label}</p>
      <p className="text-sm font-extrabold text-[#00D8D8]">{payload[0].value} عيادة</p>
    </div>
  );
};

/* ━━━━━━━━━━━━━━━━━━ MAIN ━━━━━━━━━━━━━━━━━━ */

export default function SuperAdminDashboard() {
  const stats = {
    totalClinics: 24,
    activeClinics: 21,
    totalUsers: 145,
    mrr: 4500,
  };

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
        {/* ─── Header ─── */}
        <motion.div variants={fadeUp} className="flex flex-col mb-6">
          <h1
            className="text-[30px] font-extrabold text-white tracking-tight leading-tight"
            style={{ fontFamily: '"Thmanyah Sans", ui-sans-serif, system-ui, sans-serif' }}
          >
            نظرة عامة على المنصة
          </h1>
          <p className="text-[14px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
            مرحباً بك في مركز التحكم الرئيسي لشبكة العيادات.
          </p>
        </motion.div>

        {/* ─── KPI Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي العيادات"
            value={stats.totalClinics}
            change="+3"
            changeLabel="هذا الشهر"
            icon={Building2}
            iconColor="#0A6CFF"
          />
          <StatCard
            title="العيادات النشطة"
            value={stats.activeClinics}
            change="92%"
            changeLabel="نسبة النشاط"
            icon={Activity}
            iconColor="#00D8D8"
          />
          <StatCard
            title="إجمالي المستخدمين"
            value={stats.totalUsers}
            change="+12"
            changeLabel="أطباء سكرتاريا ومدراء"
            icon={Users}
            iconColor="#8B5CF6"
          />
          <StatCard
            title="الإيرادات المتكررة (MRR)"
            value={stats.mrr}
            prefix="$"
            change="+15%"
            changeLabel="نمو"
            icon={DollarSign}
            iconColor="#3B82F6"
          />
        </div>

        {/* ─── Charts Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Clinic Growth Chart */}
          <motion.div variants={fadeUp}>
            <div className="rounded-[14px] p-5 h-full" style={cardStyle}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#00D8D8]" />
                  <h3 className="text-[14px] font-bold text-white">
                    نمو العيادات (آخر 6 أشهر)
                  </h3>
                </div>
              </div>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={GROWTH_DATA} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="saGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00D8D8" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#0A6CFF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="saLineGrad" x1="1" y1="0" x2="0" y2="0">
                        <stop offset="0%" stopColor="#0A6CFF" />
                        <stop offset="100%" stopColor="#00D8D8" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.04)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#8EA2BD", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      reversed
                    />
                    <YAxis
                      tick={{ fill: "#8EA2BD", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={35}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="clinics"
                      stroke="url(#saLineGrad)"
                      strokeWidth={2.5}
                      fill="url(#saGrowthGrad)"
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: "#00D8D8",
                        stroke: "#061329",
                        strokeWidth: 2,
                        style: { filter: "drop-shadow(0 0 6px rgba(0,217,208,0.4))" },
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Plan Distribution Donut */}
          <motion.div variants={fadeUp}>
            <div className="rounded-[14px] p-5 h-full flex flex-col" style={cardStyle}>
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-4 w-4 text-[#0A6CFF]" />
                <h3 className="text-[14px] font-bold text-white">
                  توزيع الباقات المشتركة
                </h3>
              </div>

              <div className="flex-1 flex items-center justify-between gap-6 px-4">
                {/* Legend */}
                <div className="flex flex-col gap-4">
                  {PIE_DATA.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-[12px] text-[#8EA2BD]">{entry.name}</span>
                      </div>
                      <span className="text-[14px] font-bold text-white mr-3">{entry.value}</span>
                    </div>
                  ))}
                </div>

                {/* Pie */}
                <div className="shrink-0">
                  <ResponsiveContainer width={170} height={170}>
                    <PieChart>
                      <Pie
                        data={PIE_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {PIE_DATA.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Site Messages ─── */}
        <motion.div variants={fadeUp}>
          <SiteMessagesWidget />
        </motion.div>
      </motion.div>
    </div>
  );
}
