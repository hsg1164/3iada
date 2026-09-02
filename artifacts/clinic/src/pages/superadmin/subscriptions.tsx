import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Search,
  DollarSign,
  TrendingUp
} from "lucide-react";

/* ─── Realistic Mock Data ─── */
const MOCK_INVOICES = [
  {
    id: "INV-2023-001",
    clinic: "عيادة الطبيب (الفرع الرئيسي)",
    plan: "الباقة الاحترافية (Pro)",
    amount: "$89.00",
    date: "2023-10-01",
    status: "paid",
  },
  {
    id: "INV-2023-002",
    clinic: "مجمع النور الطبي",
    plan: "باقة المؤسسات (Enterprise)",
    amount: "$199.00",
    date: "2023-10-03",
    status: "paid",
  },
  {
    id: "INV-2023-003",
    clinic: "عيادات الابتسامة لطب الأسنان",
    plan: "الباقة الأساسية (Basic)",
    amount: "$29.00",
    date: "2023-10-05",
    status: "pending",
  },
  {
    id: "INV-2023-004",
    clinic: "مركز الحياة للعلاج الطبيعي",
    plan: "الباقة الاحترافية (Pro)",
    amount: "$89.00",
    date: "2023-10-10",
    status: "overdue",
  },
  {
    id: "INV-2023-005",
    clinic: "عيادة د. أمل الجلدية",
    plan: "الباقة الأساسية (Basic)",
    amount: "$29.00",
    date: "2023-10-12",
    status: "paid",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SubscriptionsManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInvoices = MOCK_INVOICES.filter(
    (inv) =>
      inv.clinic.includes(searchTerm) ||
      inv.id.includes(searchTerm)
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
              الاشتراكات والفواتير
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              إدارة باقات العيادات، متابعة عمليات الدفع، وتصدير الفواتير.
            </p>
          </div>
        </div>

        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "الإيرادات الشهرية (MRR)", value: "$4,500", icon: DollarSign, color: "#00D8D8", change: "+15%" },
            { label: "فواتير مدفوعة", value: "142", icon: CheckCircle2, color: "#0A6CFF", change: "هذا الشهر" },
            { label: "فواتير قيد الانتظار", value: "12", icon: Clock, color: "#FFC857", change: "$450 معلقة" },
            { label: "فواتير متأخرة", value: "3", icon: AlertCircle, color: "#FF4D60", change: "تتطلب إجراء" },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-[14px] p-5 flex items-center justify-between"
              style={{
                background: "linear-gradient(145deg, #071A32, #061329)",
                border: "1px solid rgba(40,130,220,0.16)",
              }}
            >
              <div>
                <p className="text-[11px] text-[#8EA2BD] mb-1.5">{stat.label}</p>
                <h3 className="text-[20px] font-bold text-white leading-none" dir="ltr">{stat.value}</h3>
                <p className="text-[10px] mt-2 font-bold" style={{ color: stat.color }}>{stat.change}</p>
              </div>
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 40,
                  height: 40,
                  background: "rgba(0,0,0,0.2)",
                  border: `1px solid ${stat.color}40`,
                  boxShadow: `0 0 15px ${stat.color}20`,
                }}
              >
                <stat.icon style={{ color: stat.color, width: 18, height: 18 }} />
              </div>
            </div>
          ))}
        </div>

        {/* ─── Main Content Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Plans Overview */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-[14px] font-bold text-white flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-[#0A6CFF]" /> نظرة على الباقات
            </h3>
            
            {[
              { name: "الباقة الأساسية", users: "حتى 3 مستخدمين", price: "$29", count: 8, color: "#8EA2BD" },
              { name: "الباقة الاحترافية", users: "حتى 10 مستخدمين", price: "$89", count: 12, color: "#0A6CFF" },
              { name: "باقة المؤسسات", users: "مستخدمين غير محدودين", price: "$199", count: 4, color: "#8B5CF6" },
            ].map((plan, i) => (
              <div
                key={i}
                className="rounded-[12px] p-4 flex flex-col gap-3 transition-all hover:bg-[rgba(10,108,255,0.02)]"
                style={{
                  background: "#050C1F",
                  border: "1px solid rgba(40,130,220,0.16)",
                  borderRight: `3px solid ${plan.color}`
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[13px] font-bold text-white">{plan.name}</h4>
                    <p className="text-[11px] text-[#8EA2BD] mt-1">{plan.users}</p>
                  </div>
                  <span className="text-[14px] font-bold text-white bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded-md" dir="ltr">{plan.price} <span className="text-[10px] text-[#8EA2BD] font-normal">/mo</span></span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#00D8D8] bg-[rgba(0,217,208,0.06)] px-2 py-1 rounded w-fit">
                  <Building2 className="w-3 h-3" />
                  {plan.count} عيادات مشتركة
                </div>
              </div>
            ))}
          </div>

          {/* Invoices Table */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#00D8D8]" /> سجل الفواتير الأخير
              </h3>
              <div className="relative w-[250px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8EA2BD]" />
                <input
                  type="text"
                  placeholder="ابحث عن عيادة أو رقم فاتورة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-[34px] w-full rounded-[8px] pr-9 pl-4 text-[11px] text-white outline-none transition-all duration-300 bg-[#050C1F]"
                  style={{ border: "1px solid rgba(40,130,220,0.16)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                />
              </div>
            </div>

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
                      <th className="px-4 py-3 text-[11px] font-bold text-[#8EA2BD]">رقم الفاتورة</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[#8EA2BD]">العيادة</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[#8EA2BD]">المبلغ</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[#8EA2BD]">تاريخ الاستحقاق</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[#8EA2BD]">الحالة</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[#8EA2BD]">تحميل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "rgba(40,130,220,0.08)" }}>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="transition-colors hover:bg-[rgba(10,108,255,0.02)]">
                        <td className="px-4 py-3 text-[12px] font-bold text-[#0A6CFF]" dir="ltr">
                          {inv.id}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[12px] font-bold text-white">{inv.clinic}</p>
                          <p className="text-[10px] text-[#8EA2BD] mt-0.5">{inv.plan}</p>
                        </td>
                        <td className="px-4 py-3 text-[12px] font-bold text-white" dir="ltr">
                          {inv.amount}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[#8EA2BD]" dir="ltr">
                          {inv.date}
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold"
                            style={
                              inv.status === "paid"
                                ? { color: "#00D8D8", background: "rgba(0,217,208,0.08)" }
                                : inv.status === "pending"
                                ? { color: "#FFC857", background: "rgba(255,200,87,0.08)" }
                                : { color: "#FF4D60", background: "rgba(255,77,96,0.08)" }
                            }
                          >
                            {inv.status === "paid" ? "مدفوعة" : inv.status === "pending" ? "قيد الانتظار" : "متأخرة"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className="h-7 w-7 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(10,108,255,0.1)] text-[#8EA2BD] hover:text-[#0A6CFF]"
                            title="تحميل الفاتورة PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
