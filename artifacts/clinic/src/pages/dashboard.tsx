import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  useGetDashboardStats,
  useGetDailyFunnel,
  useListAppointments,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, UserPlus, Users, DollarSign, Activity, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AppointmentJourney } from "@/components/dashboard/appointment-journey";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { QuickAccess } from "@/components/dashboard/quick-access";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

/* ─── animation variants ─── */
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] as const } },
};

/* ─── shared card style for analytics row ─── */
const cardStyle: React.CSSProperties = {
  background: "linear-gradient(145deg, #071A32, #061329)",
  border: "1px solid rgba(40,130,220,0.16)",
  backdropFilter: "blur(18px)",
  borderRadius: 14,
};

const AR_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ━━━━━━━━━━━━━━━━━━ MAIN DASHBOARD ━━━━━━━━━━━━━━━━━━ */
export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: funnel, isLoading: funnelLoading } = useGetDailyFunnel();
  const { user } = useAuth();

  const weekRange = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(isoDate(d));
    }
    return dates;
  }, []);

  const weeklyQuery = useListAppointments(
    { dateFrom: weekRange[0], dateTo: weekRange[6], limit: 200 }
  );

  const {
    weeklyRevenue,
    sparkAppointments,
    sparkRevenue,
  } = useMemo(() => {
    const byDate = new Map<string, { count: number; revenue: number }>();
    for (const d of weekRange) byDate.set(d, { count: 0, revenue: 0 });
    for (const a of weeklyQuery.data?.appointments ?? []) {
      const key = a.appointmentDate || "";
      if (!byDate.has(key)) continue;
      const rec = byDate.get(key)!;
      rec.count += 1;
      rec.revenue += a.paidAmount || 0;
    }
    const revenue = weekRange.map((d) => ({
      day: AR_DAYS[new Date(d + "T00:00:00").getDay()],
      value: Math.round(byDate.get(d)!.revenue),
    }));
    const appointmentsSpark = weekRange.map((d) => byDate.get(d)!.count);
    const revenueSpark = weekRange.map((d) => Math.round(byDate.get(d)!.revenue));
    return { weeklyRevenue: revenue, sparkAppointments: appointmentsSpark, sparkRevenue: revenueSpark };
  }, [weeklyQuery.data, weekRange]);

  const isDoctor = user?.roleName === "doctor";
  const isReceptionist = user?.roleName === "receptionist";
  const isAdmin =
    user?.roleName === "admin" || user?.isSuperadmin || (!isDoctor && !isReceptionist);

  const greeting = isDoctor
    ? `مرحباً بك د. ${user?.name?.split(" ").slice(-1)[0] || ""}`
    : `مرحباً بك ${user?.name || "المستخدم"}`;

  const isLoading = statsLoading || funnelLoading || (weeklyQuery.isLoading && !weeklyQuery.data);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ─── Header ─── */}
        <motion.div variants={fadeUp} className="flex flex-col mb-8 mt-2">
          <h1
            className="text-[32px] font-extrabold text-white tracking-tight leading-tight"
            style={{ fontFamily: '"Thmanyah Sans", ui-sans-serif, system-ui, sans-serif' }}
          >
            لوحة التحكم
          </h1>
          <p className="text-[14px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
            {greeting}، إليك ملخص العيادة اليوم
          </p>
        </motion.div>

        {/* ─── KPI Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="إجمالي المواعيد"
            rawValue={stats?.todayAppointments ?? 0}
            icon={CalendarDays}
            iconBg="rgba(10, 108, 255, 0.4)"
            iconColor="#0A6CFF"
            sparkData={sparkAppointments}
          />
          <StatCard
            title="مرضى جدد اليوم"
            rawValue={stats?.newPatientsToday ?? 0}
            icon={UserPlus}
            iconBg="rgba(139, 92, 246, 0.4)"
            iconColor="#8B5CF6"
            sparkData={[]}
          />
          <StatCard
            title="إجمالي المرضى"
            rawValue={stats?.totalPatients ?? 0}
            icon={Users}
            iconBg="rgba(0, 216, 216, 0.4)"
            iconColor="#00D8D8"
            sparkData={[]}
          />
          <StatCard
            title="إيرادات اليوم"
            rawValue={stats?.todayRevenue ?? 0}
            formattedSuffix="ر.س"
            icon={DollarSign}
            iconBg="rgba(59, 130, 246, 0.4)"
            iconColor="#3B82F6"
            sparkData={sparkRevenue}
          />
        </div>

        {/* ─── Analytics Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">

          {/* 1st in RTL (Right) — Daily Booking Journey */}
          <motion.div variants={fadeUp}>
            <Card className="h-full flex flex-col" style={cardStyle}>
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-bold text-white">
                    مسار الحجوزات اليومي
                  </h3>
                  <CalendarDays className="h-4 w-4 text-[#0A6CFF]" />
                </div>
                <div className="flex-1 flex items-center justify-center mb-6">
                  <AppointmentJourney
                    waitingArrival={funnel?.waitingArrival ?? 0}
                    inReception={funnel?.inReception ?? 0}
                    inExamination={funnel?.inExamination ?? 0}
                    completed={funnel?.completed ?? 0}
                    sessionDone={funnel?.sessionDone ?? 0}
                    postponed={funnel?.postponed ?? 0}
                    noShow={funnel?.noShow ?? 0}
                  />
                </div>
                <button
                  className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-[12px] font-bold transition-colors mt-auto"
                  style={{
                    background: "rgba(10, 108, 255, 0.1)",
                    color: "#0A6CFF",
                  }}
                >
                  <Activity className="h-4 w-4" />
                  عرض تفاصيل الحجوزات
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2nd in RTL (Center) — Revenue Chart */}
          <motion.div variants={fadeUp}>
            <Card className="h-full flex flex-col" style={cardStyle}>
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#00D8D8]" />
                    <h3 className="text-[14px] font-bold text-white">
                      نظرة عامة على الإيرادات
                    </h3>
                  </div>
                  <button
                    className="flex items-center gap-2 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#8EA2BD" }}
                  >
                    آخر 7 أيام
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex-1">
                  <RevenueChart data={weeklyRevenue} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 3rd in RTL (Left) — Upcoming Appointments */}
          <motion.div variants={fadeUp}>
            <Card className="h-full" style={cardStyle}>
              <CardContent className="p-5">
                <UpcomingAppointments />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Quick Access ─── */}
        <motion.div variants={fadeUp}>
          <QuickAccess
            showSecretary={isAdmin || isReceptionist}
            showDoctor={isAdmin || isDoctor}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}