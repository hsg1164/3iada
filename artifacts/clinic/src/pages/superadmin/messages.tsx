import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Reply,
  Archive,
  MoreVertical
} from "lucide-react";

/* ─── Realistic Mock Data ─── */
const MOCK_MESSAGES = [
  {
    id: 1,
    name: "مريم خالد",
    phone: "0501112222",
    email: "maryam@example.com",
    subject: "استفسار عن أسعار الاشتراكات",
    message: "مرحباً، أود الاستفسار عن تفاصيل الباقة الاحترافية وهل تشمل إدارة فروع متعددة للعيادة؟ شكراً لكم.",
    status: "new",
    created_at: "2023-10-15T14:30:00",
  },
  {
    id: 2,
    name: "أحمد العتيبي",
    phone: "0503334444",
    email: "ahmed@example.com",
    subject: "مشكلة فنية في الدخول",
    message: "أواجه مشكلة في تسجيل الدخول لحساب العيادة الخاص بي، تظهر لي رسالة خطأ 500.",
    status: "replied",
    created_at: "2023-10-15T10:15:22",
  },
  {
    id: 3,
    name: "سارة ناصر",
    phone: "0505556666",
    email: "sara@example.com",
    subject: "طلب عرض سعر خاص",
    message: "نحن مجمع طبي يضم 15 عيادة، هل يوجد لديكم أسعار خاصة للمجمعات الكبيرة؟",
    status: "read",
    created_at: "2023-10-14T18:45:10",
  },
  {
    id: 4,
    name: "د. خالد السعيد",
    phone: "0507778888",
    email: "khaled@example.com",
    subject: "اقتراح تطوير",
    message: "أقترح إضافة ميزة الوصفات الطبية الإلكترونية المرتبطة بصيدلية وزارة الصحة.",
    status: "archived",
    created_at: "2023-10-13T09:00:00",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "جديدة", color: "#0A6CFF", bg: "rgba(10,108,255,0.1)" },
  read: { label: "مقروءة", color: "#8EA2BD", bg: "rgba(142,162,189,0.1)" },
  replied: { label: "تم الرد", color: "#00D8D8", bg: "rgba(0,217,208,0.1)" },
  archived: { label: "مؤرشفة", color: "#FFC857", bg: "rgba(255,200,87,0.1)" },
};

export default function MessagesManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMessages = MOCK_MESSAGES.filter(
    (msg) =>
      msg.name.includes(searchTerm) ||
      msg.subject.includes(searchTerm) ||
      msg.message.includes(searchTerm)
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
              رسائل الموقع (Contact Us)
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              إدارة الرسائل والاستفسارات الواردة من صفحة اتصل بنا في الموقع التعريفي.
            </p>
          </div>
        </div>

        {/* ─── Search & Filters ─── */}
        <div
          className="rounded-[14px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
          style={{
            background: "linear-gradient(145deg, #071A32, #061329)",
            border: "1px solid rgba(40,130,220,0.16)",
          }}
        >
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8EA2BD]" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الموضوع، أو محتوى الرسالة..."
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
        </div>

        {/* ─── Messages Grid ─── */}
        <div className="grid grid-cols-1 gap-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-[14px] p-5 flex flex-col md:flex-row gap-5 transition-all hover:bg-[rgba(10,108,255,0.02)] relative overflow-hidden"
              style={{
                background: "#050C1F",
                border: "1px solid rgba(40,130,220,0.16)",
              }}
            >
              {/* Highlight bar for new messages */}
              {msg.status === "new" && (
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-[#0A6CFF]" />
              )}

              {/* Avatar & Basic Info */}
              <div className="flex items-start gap-4 md:w-1/4 shrink-0">
                <span
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-bold text-white shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #0A6CFF, #00D8D8)",
                    boxShadow: msg.status === "new" ? "0 0 15px rgba(10,108,255,0.3)" : "none",
                  }}
                >
                  {msg.name.trim().charAt(0)}
                </span>
                <div>
                  <h3 className="text-[14px] font-bold text-white">{msg.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#8EA2BD] mt-1.5">
                    <Mail className="w-3 h-3" /> {msg.email}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8EA2BD] mt-1" dir="ltr">
                    <Phone className="w-3 h-3" /> {msg.phone}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pr-0 md:pr-4 md:border-r border-[rgba(40,130,220,0.16)]">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="text-[13px] font-bold text-white">{msg.subject}</h4>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="flex items-center gap-1 text-[10px] text-[#8EA2BD]">
                      <Clock className="w-3 h-3" /> {timeAgo(msg.created_at)}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        background: STATUS_CONFIG[msg.status].bg,
                        color: STATUS_CONFIG[msg.status].color,
                      }}
                    >
                      {STATUS_CONFIG[msg.status].label}
                    </span>
                  </div>
                </div>
                <p className="text-[12px] text-[#8EA2BD] leading-relaxed">
                  {msg.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col items-center justify-center gap-2 shrink-0 pr-0 md:pr-4 md:border-r border-[rgba(40,130,220,0.16)]">
                <button
                  className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(10,108,255,0.1)] text-[#8EA2BD] hover:text-[#0A6CFF]"
                  title="الرد على الرسالة"
                >
                  <Reply className="w-4 h-4" />
                </button>
                <button
                  className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(255,200,87,0.1)] text-[#8EA2BD] hover:text-[#FFC857]"
                  title="أرشفة"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
