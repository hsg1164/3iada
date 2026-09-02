import { motion } from "framer-motion";
import {
  Settings2,
  Globe,
  ServerCrash,
  Save,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Lock,
  Database,
  CloudUpload
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PlatformSettings() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

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
              إعدادات المنصة
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              التحكم في الإعدادات العامة للمنصة، إعدادات البريد الإلكتروني، الحماية، ووضع الصيانة.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ─── General Settings ─── */}
          <div
            className="rounded-[14px] p-6 space-y-6"
            style={{
              background: "linear-gradient(145deg, #071A32, #061329)",
              border: "1px solid rgba(40,130,220,0.16)",
            }}
          >
            <div className="flex items-center gap-2 mb-2 text-white">
              <Globe className="w-5 h-5 text-[#0A6CFF]" />
              <h2 className="text-[15px] font-bold">المعلومات الأساسية للمنصة (SEO)</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#8EA2BD] mb-1.5">
                  اسم المنصة
                </label>
                <input
                  type="text"
                  defaultValue="العيادة - نظام الإدارة الطبية السحابي"
                  className="h-[42px] w-full rounded-[10px] px-4 text-[13px] text-white outline-none transition-all duration-300"
                  style={{
                    background: "#050C1F",
                    border: "1px solid rgba(40,130,220,0.16)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#8EA2BD] mb-1.5">
                  الوصف التعريفي (Meta Description)
                </label>
                <textarea
                  defaultValue="نظام متكامل لإدارة العيادات الطبية، يوفر حلولاً للحجوزات، الملفات الإلكترونية، والفوترة لتعزيز كفاءة العيادات وتجربة المرضى."
                  className="w-full rounded-[10px] p-4 text-[13px] text-white outline-none transition-all duration-300 min-h-[100px] resize-none leading-relaxed"
                  style={{
                    background: "#050C1F",
                    border: "1px solid rgba(40,130,220,0.16)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#8EA2BD] mb-1.5">
                  شعار المنصة (Logo URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue="/assets/logo.png"
                    className="h-[42px] flex-1 rounded-[10px] px-4 text-[13px] text-white outline-none transition-all duration-300"
                    style={{
                      background: "#050C1F",
                      border: "1px solid rgba(40,130,220,0.16)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                  />
                  <button
                    className="h-[42px] px-4 rounded-[10px] flex items-center justify-center gap-2 transition-all hover:bg-[rgba(10,108,255,0.06)] border"
                    style={{ borderColor: "rgba(40,130,220,0.16)", color: "#8EA2BD" }}
                  >
                    <CloudUpload className="w-4 h-4" /> رفع
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  className="flex items-center gap-2 h-[42px] px-6 rounded-[10px] text-[13px] font-bold text-white transition-all hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #0A6CFF, #00D8D8)",
                    boxShadow: "0 4px 15px rgba(10,108,255,0.25)",
                  }}
                >
                  <Save className="w-4 h-4" /> حفظ الإعدادات
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* ─── Technical Settings ─── */}
            <div
              className="rounded-[14px] p-6 space-y-6"
              style={{
                background: "linear-gradient(145deg, #071A32, #061329)",
                border: "1px solid rgba(40,130,220,0.16)",
              }}
            >
              <div className="flex items-center gap-2 mb-2 text-white">
                <Database className="w-5 h-5 text-[#8B5CF6]" />
                <h2 className="text-[15px] font-bold">إعدادات النظام والنسخ الاحتياطي</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-[10px] bg-[#050C1F] border border-[rgba(40,130,220,0.16)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[rgba(139,92,246,0.1)] text-[#8B5CF6]">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-white">النسخ الاحتياطي التلقائي</p>
                      <p className="text-[10px] text-[#8EA2BD] mt-0.5">يتم نسخ قاعدة البيانات يومياً الساعة 03:00 ص</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-start px-1 cursor-pointer" dir="ltr">
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm ml-auto" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-[10px] bg-[#050C1F] border border-[rgba(40,130,220,0.16)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[rgba(0,216,216,0.1)] text-[#00D8D8]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-white">فرض المصادقة الثنائية (2FA)</p>
                      <p className="text-[10px] text-[#8EA2BD] mt-0.5">إلزام جميع المدراء باستخدام المصادقة الثنائية</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-start px-1 cursor-pointer" dir="ltr">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#8EA2BD] shadow-sm mr-auto" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-[10px] bg-[#050C1F] border border-[rgba(40,130,220,0.16)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[rgba(10,108,255,0.1)] text-[#0A6CFF]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-white">إشعارات البريد للمدراء</p>
                      <p className="text-[10px] text-[#8EA2BD] mt-0.5">تلقي تقارير أسبوعية عن حالة النظام</p>
                    </div>
                  </div>
                  <div className="w-10 h-5 rounded-full bg-[#0A6CFF] flex items-center justify-start px-1 cursor-pointer" dir="ltr">
                    <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm ml-auto" />
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Maintenance Mode ─── */}
            <div
              className="rounded-[14px] p-6 space-y-4"
              style={{
                background: maintenanceMode ? "linear-gradient(145deg, rgba(255,77,96,0.1), rgba(6,19,41,0.9))" : "linear-gradient(145deg, rgba(255,200,87,0.05), #061329)",
                border: `1px solid ${maintenanceMode ? "rgba(255,77,96,0.3)" : "rgba(255,200,87,0.2)"}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: maintenanceMode ? "#FF4D60" : "#FFC857" }}>
                <ServerCrash className="w-5 h-5" />
                <h2 className="text-[15px] font-bold">وضع الصيانة (Maintenance Mode)</h2>
              </div>
              
              <p className="text-[12px] text-[#8EA2BD] leading-relaxed">
                عند تفعيل هذا الخيار، لن يتمكن أي مستخدم (أطباء، مرضى، سكرتاريا) من تسجيل الدخول للنظام. ستظهر لهم صفحة تخبرهم بأن المنصة تحت الصيانة.
                <br/>
                <span className="text-white font-bold">لا تقم بتفعيل هذا الخيار إلا عند إجراء تحديثات جذرية تتطلب إيقاف النظام.</span>
              </p>

              <button
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className="w-full flex items-center justify-center gap-2 h-[42px] rounded-[10px] text-[13px] font-bold transition-all hover:scale-[1.02] mt-2"
                style={
                  maintenanceMode
                    ? { background: "rgba(255,77,96,0.1)", color: "#FF4D60", border: "1px solid rgba(255,77,96,0.2)" }
                    : { background: "#FF4D60", color: "#fff", boxShadow: "0 4px 15px rgba(255,77,96,0.25)" }
                }
              >
                {maintenanceMode ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> إنهاء الصيانة وتفعيل المنصة
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" /> إيقاف المنصة وتفعيل الصيانة
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
