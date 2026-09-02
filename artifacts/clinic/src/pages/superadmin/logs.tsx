import { motion } from "framer-motion";
import {
  ShieldAlert,
  ActivitySquare,
  Search,
  Filter,
  ArrowDownToLine,
  User,
  Settings,
  CreditCard,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { useState } from "react";

/* ─── Realistic Mock Data ─── */
const MOCK_LOGS = [
  {
    id: "LOG-092",
    admin: "زياد أبو دقة",
    action: "تغيير إعدادات المنصة",
    details: "تحديث الشعار والوصف التعريفي للنظام",
    module: "Settings",
    severity: "low",
    date: "2023-10-15 14:30:00",
  },
  {
    id: "LOG-091",
    admin: "أحمد العتيبي",
    action: "إضافة عيادة جديدة",
    details: "تم تسجيل مجمع النور الطبي وإصدار فاتورة",
    module: "Clinics",
    severity: "medium",
    date: "2023-10-15 10:15:22",
  },
  {
    id: "LOG-090",
    admin: "سارة ناصر",
    action: "إعادة تعيين كلمة مرور",
    details: "إعادة تعيين كلمة المرور للمستخدم (maryam.k)",
    module: "Users",
    severity: "high",
    date: "2023-10-14 18:45:10",
  },
  {
    id: "LOG-089",
    admin: "زياد أبو دقة",
    action: "تسجيل دخول ناجح",
    details: "تسجيل دخول من جهاز جديد (IP: 192.168.1.1)",
    module: "Auth",
    severity: "low",
    date: "2023-10-14 09:00:00",
  },
  {
    id: "LOG-088",
    admin: "أحمد العتيبي",
    action: "تجميد حساب عيادة",
    details: "تم إيقاف عيادة الحياة بسبب عدم دفع الفاتورة",
    module: "Clinics",
    severity: "critical",
    date: "2023-10-13 15:20:45",
  },
  {
    id: "LOG-087",
    admin: "النظام",
    action: "نسخ احتياطي",
    details: "اكتمل النسخ الاحتياطي التلقائي لقاعدة البيانات",
    module: "System",
    severity: "low",
    date: "2023-10-13 03:00:00",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function getModuleIcon(module: string) {
  switch (module) {
    case "Settings": return <Settings className="w-3.5 h-3.5" />;
    case "Clinics": return <Building2 className="w-3.5 h-3.5" />;
    case "Users": return <User className="w-3.5 h-3.5" />;
    case "Auth": return <ShieldAlert className="w-3.5 h-3.5" />;
    case "System": return <ActivitySquare className="w-3.5 h-3.5" />;
    default: return <ActivitySquare className="w-3.5 h-3.5" />;
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "low": return { color: "#00D8D8", bg: "rgba(0,217,208,0.1)" };
    case "medium": return { color: "#0A6CFF", bg: "rgba(10,108,255,0.1)" };
    case "high": return { color: "#FFC857", bg: "rgba(255,200,87,0.1)" };
    case "critical": return { color: "#FF4D60", bg: "rgba(255,77,96,0.1)" };
    default: return { color: "#8EA2BD", bg: "rgba(142,162,189,0.1)" };
  }
}

export default function SecurityLogs() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = MOCK_LOGS.filter(
    (log) =>
      log.action.includes(searchTerm) ||
      log.admin.includes(searchTerm) ||
      log.details.includes(searchTerm)
  );

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1
              className="text-[28px] font-extrabold text-white tracking-tight"
              style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}
            >
              سجلات الأمان والتدقيق
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              تتبع ومراقبة كافة نشاطات مدراء النظام والتغييرات على مستوى المنصة (Audit Trail).
            </p>
          </div>
          <button
            className="flex items-center gap-2 h-[38px] px-4 rounded-[10px] text-[12px] font-bold text-[#8EA2BD] transition-all hover:bg-[rgba(10,108,255,0.06)] hover:text-white border"
            style={{ borderColor: "rgba(40,130,220,0.16)" }}
          >
            <ArrowDownToLine className="w-4 h-4" /> تصدير السجلات (CSV)
          </button>
        </div>

        {/* ─── Search & Filters ─── */}
        <div
          className="rounded-[14px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
          style={{
            background: "linear-gradient(145deg, #071A32, #061329)",
            border: "1px solid rgba(40,130,220,0.16)",
          }}
        >
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8EA2BD]" />
            <input
              type="text"
              placeholder="ابحث في السجلات (إجراء، مدير، تفاصيل)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[40px] w-full rounded-[10px] pr-9 pl-4 text-[12px] text-white outline-none transition-all duration-300"
              style={{
                background: "#050C1F",
                border: "1px solid rgba(40,130,220,0.16)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              className="flex items-center gap-2 h-[40px] px-4 rounded-[10px] text-[12px] font-bold transition-all bg-[#050C1F] hover:bg-[rgba(10,108,255,0.06)] border"
              style={{ borderColor: "rgba(40,130,220,0.16)", color: "#8EA2BD" }}
            >
              <Filter className="w-4 h-4" /> تصفية حسب الأهمية
            </button>
          </div>
        </div>

        {/* ─── Logs Table ─── */}
        <div
          className="rounded-[14px] overflow-hidden"
          style={{
            background: "#050C1F",
            border: "1px solid rgba(40,130,220,0.16)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr style={{ background: "rgba(10,108,255,0.04)", borderBottom: "1px solid rgba(40,130,220,0.16)" }}>
                  <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">رقم السجل</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">المدير / المستخدم</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الإجراء والتفاصيل</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">القسم (Module)</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">مستوى الأهمية</th>
                  <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(40,130,220,0.08)" }}>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-[rgba(10,108,255,0.02)]">
                    <td className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]" dir="ltr">
                      {log.id}
                    </td>
                    <td className="px-5 py-4 text-[12px] font-bold text-white">
                      {log.admin}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[12px] font-bold text-white">{log.action}</p>
                      <p className="text-[11px] text-[#8EA2BD] mt-0.5">{log.details}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8EA2BD]">
                        {getModuleIcon(log.module)}
                        {log.module}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold"
                        style={{
                          background: getSeverityColor(log.severity).bg,
                          color: getSeverityColor(log.severity).color,
                        }}
                      >
                        {log.severity === "critical" && <AlertTriangle className="w-3 h-3 ml-1" />}
                        {log.severity.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8EA2BD]" dir="ltr">
                        <Clock className="w-3 h-3" />
                        {log.date}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
