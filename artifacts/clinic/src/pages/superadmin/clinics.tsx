import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Search,
  Plus,
  MoreHorizontal,
  Activity,
  MapPin,
  Phone,
  CheckCircle2,
  Ban,
  Globe,
  Database,
  ServerCrash,
  X,
  Save,
  CloudUpload,
  Lock,
  Mail,
  AlertTriangle,
  Settings2,
  ExternalLink,
  Eye,
  Edit3,
  Copy,
  Trash2,
  LayoutDashboard,
  Users,
  Snowflake,
  RotateCcw,
  UserPlus,
  CreditCard,
  Crown,
  Shield,
  FileText,
  Hash,
  ChevronLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { customFetch } from "@workspace/api-client-react";

interface Clinic {
  id: number;
  name: string;
  nameEn?: string | null;
  slug: string;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  description?: string | null;
  subscriptionPlan: string;
  isActive: boolean;
  maxUsers?: number | null;
  maxBranches?: number | null;
  usersCount: number;
  createdAt: string;
}

interface ClinicAccount {
  id: number;
  name: string;
  username: string;
  role: string;
  email?: string | null;
  branch?: string | null;
  isFrozen: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const dialogOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const dialogContent = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.2, 0.8, 0.2, 1] as [number, number, number, number] } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return d;
  }
}

const planLabel = (plan: string) =>
  plan === "enterprise" ? "مؤسسات" : plan === "pro" ? "احترافي" : "أساسي";

/* ━━━━━━━━━━━━━━━━━━━ SETTINGS DIALOGS ━━━━━━━━━━━━━━━━━━━ */

function SeoSettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [platformName, setPlatformName] = useState("العيادة - نظام الإدارة الطبية السحابي");
  const [metaDesc, setMetaDesc] = useState("نظام متكامل لإدارة العيادات الطبية، يوفر حلولاً للحجوزات، الملفات الإلكترونية، والفوترة.");
  const [logoUrl, setLogoUrl] = useState("/assets/logo.png");

  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" variants={dialogOverlay} initial="hidden" animate="visible" exit="exit">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            variants={dialogContent} initial="hidden" animate="visible" exit="exit"
            className="relative w-full max-w-[560px] max-h-[85vh] overflow-y-auto rounded-[16px] p-6 space-y-5"
            style={{ background: "linear-gradient(145deg, #071A32, #061329)", border: "1px solid rgba(40,130,220,0.2)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
            dir="rtl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl" style={{ background: "rgba(10,108,255,0.12)" }}>
                  <Globe className="w-5 h-5 text-[#0A6CFF]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-white">إعدادات SEO والمظهر</h2>
                  <p className="text-[11px] text-[#8EA2BD] mt-0.5">اسم المنصة والوصف والشعار</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                <X className="w-4 h-4 text-[#8EA2BD]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#8EA2BD] mb-1.5">اسم المنصة</label>
                <input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)}
                  className="h-[42px] w-full rounded-[10px] px-4 text-[13px] text-white outline-none transition-all duration-300"
                  style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#8EA2BD] mb-1.5">الوصف التعريفي</label>
                <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={3}
                  className="w-full rounded-[10px] p-4 text-[13px] text-white outline-none transition-all duration-300 resize-none leading-relaxed"
                  style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#8EA2BD] mb-1.5">شعار المنصة</label>
                <div className="flex gap-2">
                  <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                    className="h-[42px] flex-1 rounded-[10px] px-4 text-[13px] text-white outline-none transition-all duration-300"
                    style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
                    onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                  />
                  <button className="h-[42px] px-4 rounded-[10px] flex items-center justify-center gap-2 transition-all hover:bg-[rgba(10,108,255,0.06)] border" style={{ borderColor: "rgba(40,130,220,0.16)", color: "#8EA2BD" }}>
                    <CloudUpload className="w-4 h-4" /> رفع
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t" style={{ borderColor: "rgba(40,130,220,0.12)" }}>
              <button onClick={onClose} className="h-[38px] px-5 rounded-[10px] text-[12px] font-bold text-[#8EA2BD] hover:bg-[rgba(255,255,255,0.04)] transition-colors">إلغاء</button>
              <button onClick={onClose} className="flex items-center gap-2 h-[38px] px-6 rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)", boxShadow: "0 4px 15px rgba(10,108,255,0.25)" }}>
                <Save className="w-3.5 h-3.5" /> حفظ الإعدادات
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SystemSettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [backupOn, setBackupOn] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);

  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" variants={dialogOverlay} initial="hidden" animate="visible" exit="exit">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            variants={dialogContent} initial="hidden" animate="visible" exit="exit"
            className="relative w-full max-w-[560px] max-h-[85vh] overflow-y-auto rounded-[16px] p-6 space-y-5"
            style={{ background: "linear-gradient(145deg, #071A32, #061329)", border: "1px solid rgba(40,130,220,0.2)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
            dir="rtl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl" style={{ background: "rgba(10,108,255,0.12)" }}>
                  <Database className="w-5 h-5 text-[#0A6CFF]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-white">إعدادات النظام والأمان</h2>
                  <p className="text-[11px] text-[#8EA2BD] mt-0.5">النسخ الاحتياطي والمصادقة الثنائية</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                <X className="w-4 h-4 text-[#8EA2BD]" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { icon: Database, label: "النسخ الاحتياطي التلقائي", desc: "يتم نسخ قاعدة البيانات يومياً الساعة 03:00 ص", color: "#0A6CFF", value: backupOn, toggle: () => setBackupOn(!backupOn) },
                { icon: Lock, label: "فرض المصادقة الثنائية (2FA)", desc: "إلزام جميع المدراء باستخدام المصادقة الثنائية", color: "#00D8D8", value: twoFA, toggle: () => setTwoFA(!twoFA) },
                { icon: Mail, label: "إشعارات البريد للمدراء", desc: "تلقي تقارير أسبوعية عن حالة النظام", color: "#0A6CFF", value: emailNotif, toggle: () => setEmailNotif(!emailNotif) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3.5 rounded-[12px] bg-[#050C1F] border border-[rgba(40,130,220,0.12)] hover:border-[rgba(40,130,220,0.25)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ background: `${item.color}15`, color: item.color }}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-white">{item.label}</p>
                      <p className="text-[10px] text-[#8EA2BD] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={item.toggle}
                    className="w-10 h-[22px] rounded-full flex items-center px-0.5 transition-all duration-200"
                    style={{ background: item.value ? item.color : "rgba(255,255,255,0.1)" }}
                    dir="ltr"
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200" style={{ transform: item.value ? "translateX(14px)" : "translateX(0)" }} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t" style={{ borderColor: "rgba(40,130,220,0.12)" }}>
              <button onClick={onClose} className="h-[38px] px-5 rounded-[10px] text-[12px] font-bold text-[#8EA2BD] hover:bg-[rgba(255,255,255,0.04)] transition-colors">إلغاء</button>
              <button onClick={onClose} className="flex items-center gap-2 h-[38px] px-6 rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)", boxShadow: "0 4px 15px rgba(10,108,255,0.25)" }}>
                <Save className="w-3.5 h-3.5" /> حفظ الإعدادات
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MaintenanceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  if (!open) return null;
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" variants={dialogOverlay} initial="hidden" animate="visible" exit="exit">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            variants={dialogContent} initial="hidden" animate="visible" exit="exit"
            className="relative w-full max-w-[500px] rounded-[16px] p-6 space-y-5"
            style={{
              background: maintenanceMode ? "linear-gradient(145deg, rgba(255,77,96,0.08), #061329)" : "linear-gradient(145deg, #071A32, #061329)",
              border: `1px solid ${maintenanceMode ? "rgba(255,77,96,0.25)" : "rgba(40,130,220,0.2)"}`,
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
            dir="rtl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl" style={{ background: maintenanceMode ? "rgba(255,77,96,0.12)" : "rgba(255,200,87,0.12)" }}>
                  <ServerCrash className="w-5 h-5" style={{ color: maintenanceMode ? "#FF4D60" : "#FFC857" }} />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-white">وضع الصيانة</h2>
                  <p className="text-[11px] text-[#8EA2BD] mt-0.5">إيقاف المنصة مؤقتاً للصيانة</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                <X className="w-4 h-4 text-[#8EA2BD]" />
              </button>
            </div>

            <div className="p-4 rounded-[12px] border" style={{ background: maintenanceMode ? "rgba(255,77,96,0.06)" : "rgba(255,200,87,0.04)", borderColor: maintenanceMode ? "rgba(255,77,96,0.15)" : "rgba(255,200,87,0.15)" }}>
              <p className="text-[12px] text-[#8EA2BD] leading-relaxed">
                عند تفعيل وضع الصيانة، لن يتمكن أي مستخدم من تسجيل الدخول. ستظهر صفحة تخبرهم بأن المنصة تحت الصيانة.
              </p>
              <p className="text-[12px] font-bold text-white mt-2">لا تفعّل هذا إلا عند تحديثات جذرية.</p>
            </div>

            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className="w-full flex items-center justify-center gap-2 h-[44px] rounded-[12px] text-[13px] font-bold transition-all hover:scale-[1.01]"
              style={
                maintenanceMode
                  ? { background: "rgba(255,77,96,0.1)", color: "#FF4D60", border: "1px solid rgba(255,77,96,0.2)" }
                  : { background: "#FF4D60", color: "#fff", boxShadow: "0 4px 15px rgba(255,77,96,0.25)" }
              }
            >
              {maintenanceMode ? (
                <><CheckCircle2 className="w-4 h-4" /> إنهاء الصيانة وتفعيل المنصة</>
              ) : (
                <><AlertTriangle className="w-4 h-4" /> إيقاف المنصة وتفعيل الصيانة</>
              )}
            </button>

            <div className="pt-3 flex justify-end border-t" style={{ borderColor: "rgba(40,130,220,0.12)" }}>
              <button onClick={onClose} className="h-[38px] px-5 rounded-[10px] text-[12px] font-bold text-[#8EA2BD] hover:bg-[rgba(255,255,255,0.04)] transition-colors">إغلاق</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ━━━━━━━━━━━━━━━━━━━ EDIT CLINIC DIALOG ━━━━━━━━━━━━━━━━━━━ */

function EditClinicDialog({ clinic, open, onClose }: { clinic: Clinic | null; open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "", nameEn: "", slug: "", phone: "", email: "", city: "", address: "",
    description: "", subscriptionPlan: "basic", maxUsers: 3, maxBranches: 1,
  });

  useEffect(() => {
    if (clinic) {
      setForm({
        name: clinic.name || "",
        nameEn: clinic.nameEn || "",
        slug: clinic.slug || "",
        phone: clinic.phone || "",
        email: clinic.email || "",
        city: clinic.city || "",
        address: clinic.address || "",
        description: clinic.description || "",
        subscriptionPlan: clinic.subscriptionPlan || "basic",
        maxUsers: clinic.maxUsers ?? 3,
        maxBranches: clinic.maxBranches ?? 1,
      });
    }
  }, [clinic]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return customFetch(`/api/clinics/${clinic!.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: form.name,
          nameEn: form.nameEn || null,
          slug: form.slug,
          phone: form.phone || null,
          email: form.email || null,
          city: form.city || null,
          address: form.address || null,
          description: form.description || null,
          subscriptionPlan: form.subscriptionPlan,
          maxUsers: form.maxUsers,
          maxBranches: form.maxBranches,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      onClose();
    },
  });

  if (!open || !clinic) return null;

  const InputField = ({ label, value, onChange, placeholder, type = "text" }: {
    label: string; value: string | number; onChange: (v: string) => void;
    placeholder?: string; type?: string;
  }) => (
    <div>
      <label className="block text-[11px] font-bold text-[#8EA2BD] mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[40px] w-full rounded-[10px] px-4 text-[12px] text-white outline-none transition-all duration-300"
        style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
        onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
      />
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" variants={dialogOverlay} initial="hidden" animate="visible" exit="exit">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            variants={dialogContent} initial="hidden" animate="visible" exit="exit"
            className="relative w-full max-w-[620px] max-h-[88vh] overflow-y-auto rounded-[16px] p-6 space-y-5"
            style={{ background: "linear-gradient(145deg, #071A32, #061329)", border: "1px solid rgba(40,130,220,0.2)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
            dir="rtl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl" style={{ background: "rgba(10,108,255,0.12)" }}>
                  <Edit3 className="w-5 h-5 text-[#0A6CFF]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-white">تعديل بيانات العيادة</h2>
                  <p className="text-[11px] text-[#8EA2BD] mt-0.5">{clinic.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                <X className="w-4 h-4 text-[#8EA2BD]" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="اسم العيادة (عربي)" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="عيادة الدكتور..." />
                <InputField label="اسم العيادة (إنجليزي)" value={form.nameEn} onChange={(v) => setForm({ ...form, nameEn: v })} placeholder="Dr. Ziyad Clinic" />
              </div>
              <InputField label="الرابط (Slug)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="dr-ziyad" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="البريد الإلكتروني" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="info@clinic.com" type="email" />
                <InputField label="رقم الهاتف" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+966501234567" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="المدينة" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="الرياض" />
                <InputField label="العنوان" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="شارع الملك فهد..." />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#8EA2BD] mb-1.5">الوصف</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="وصف العيادة..."
                  className="w-full rounded-[10px] p-3 text-[12px] text-white outline-none transition-all duration-300 resize-none"
                  style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                />
              </div>

              <div className="pt-2 border-t" style={{ borderColor: "rgba(40,130,220,0.12)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-[#00D8D8]" />
                  <h3 className="text-[12px] font-bold text-white">الاشتراك والحدود</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#8EA2BD] mb-1.5">خطة الاشتراك</label>
                    <select
                      value={form.subscriptionPlan}
                      onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value })}
                      className="h-[40px] w-full rounded-[10px] px-4 text-[12px] text-white outline-none appearance-none cursor-pointer transition-all duration-300"
                      style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
                      onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                    >
                      <option value="basic">أساسي</option>
                      <option value="pro">احترافي</option>
                      <option value="enterprise">مؤسسات</option>
                    </select>
                  </div>
                  <InputField label="الحد الأقصى للمستخدمين" value={form.maxUsers} onChange={(v) => setForm({ ...form, maxUsers: Number(v) || 1 })} type="number" />
                  <InputField label="الحد الأقصى للفرع" value={form.maxBranches} onChange={(v) => setForm({ ...form, maxBranches: Number(v) || 1 })} type="number" />
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t" style={{ borderColor: "rgba(40,130,220,0.12)" }}>
              <button onClick={onClose} className="h-[38px] px-5 rounded-[10px] text-[12px] font-bold text-[#8EA2BD] hover:bg-[rgba(255,255,255,0.04)] transition-colors">إلغاء</button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 h-[38px] px-6 rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)", boxShadow: "0 4px 15px rgba(10,108,255,0.25)" }}
              >
                {saveMutation.isPending ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                حفظ التعديلات
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ━━━━━━━━━━━━━━━━━━━ ACCOUNTS DIALOG ━━━━━━━━━━━━━━━━━━━ */

function AccountsDialog({ clinic, open, onClose }: { clinic: Clinic | null; open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchAcc, setSearchAcc] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [resetPwdId, setResetPwdId] = useState<number | null>(null);
  const [resetPwd, setResetPwd] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [newAccount, setNewAccount] = useState({ name: "", username: "", password: "", role: "admin", email: "", branch: "" });
  const [editForm, setEditForm] = useState({ name: "", role: "", email: "", branch: "" });

  const { data: accounts = [], isLoading } = useQuery<ClinicAccount[]>({
    queryKey: ["clinic-accounts", clinic?.id],
    queryFn: () => customFetch<ClinicAccount[]>(`/api/clinics/${clinic!.id}/accounts`),
    enabled: open && !!clinic,
  });

  const freezeMutation = useMutation({
    mutationFn: async ({ accountId, isFrozen }: { accountId: number; isFrozen: boolean }) => {
      return customFetch(`/api/clinics/${clinic!.id}/accounts/${accountId}/frozen`, {
        method: "POST",
        body: JSON.stringify({ isFrozen }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clinic-accounts", clinic?.id] }),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return customFetch(`/api/clinics/${clinic!.id}/accounts`, {
        method: "POST",
        body: JSON.stringify(newAccount),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-accounts", clinic?.id] });
      setShowCreate(false);
      setNewAccount({ name: "", username: "", password: "", role: "admin", email: "", branch: "" });
    },
  });

  const resetPwdMutation = useMutation({
    mutationFn: async () => {
      return customFetch(`/api/clinics/${clinic!.id}/accounts/${resetPwdId}/password`, {
        method: "POST",
        body: JSON.stringify({ newPassword: resetPwd }),
      });
    },
    onSuccess: () => { setResetPwdId(null); setResetPwd(""); },
  });

  const roleLabel = (r: string) => r === "admin" ? "مدير" : r === "doctor" ? "طبيب" : "استقبال";
  const roleColor = (r: string) => r === "admin" ? "#0A6CFF" : r === "doctor" ? "#00D8D8" : "#8EA2BD";
  const roleIcon = (r: string) => r === "admin" ? Crown : r === "doctor" ? Shield : Users;

  const totalAdmins = accounts.filter((a) => a.role === "admin").length;
  const totalDoctors = accounts.filter((a) => a.role === "doctor").length;
  const totalReception = accounts.filter((a) => a.role === "receptionist").length;
  const totalFrozen = accounts.filter((a) => a.isFrozen).length;

  const filtered = accounts.filter((a) => {
    if (roleFilter !== "all" && a.role !== roleFilter) return false;
    if (searchAcc && !a.name.includes(searchAcc) && !a.username.toLowerCase().includes(searchAcc.toLowerCase())) return false;
    return true;
  });

  const startEdit = (acc: ClinicAccount) => {
    setEditingId(acc.id);
    setEditForm({ name: acc.name, role: acc.role, email: acc.email || "", branch: acc.branch || "" });
    setResetPwdId(null);
  };

  if (!open || !clinic) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" variants={dialogOverlay} initial="hidden" animate="visible" exit="exit">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            variants={dialogContent} initial="hidden" animate="visible" exit="exit"
            className="relative w-full max-w-[720px] max-h-[90vh] overflow-y-auto rounded-[16px] p-6 space-y-5"
            style={{ background: "linear-gradient(145deg, #071A32, #061329)", border: "1px solid rgba(40,130,220,0.2)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
            dir="rtl"
          >
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl" style={{ background: "rgba(0,216,216,0.12)" }}>
                  <Users className="w-5 h-5 text-[#00D8D8]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-white">إدارة حسابات العيادة</h2>
                  <p className="text-[11px] text-[#8EA2BD] mt-0.5">{clinic.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                <X className="w-4 h-4 text-[#8EA2BD]" />
              </button>
            </div>

            {/* ─── Stats Bar ─── */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "الكل", value: accounts.length, color: "#fff", bg: "rgba(255,255,255,0.04)" },
                { label: "مدراء", value: totalAdmins, color: "#0A6CFF", bg: "rgba(10,108,255,0.1)" },
                { label: "أطباء", value: totalDoctors, color: "#00D8D8", bg: "rgba(0,216,216,0.1)" },
                { label: "متجمدين", value: totalFrozen, color: "#FFC857", bg: "rgba(255,200,87,0.1)" },
              ].map((s) => (
                <div key={s.label} className="rounded-[10px] p-3 text-center" style={{ background: s.bg, border: "1px solid rgba(40,130,220,0.1)" }}>
                  <p className="text-[20px] font-extrabold leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] text-[#8EA2BD] mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* ─── Search + Filter + Add ─── */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8EA2BD]" />
                <input
                  type="text"
                  placeholder="بحث بالاسم أو اسم المستخدم..."
                  value={searchAcc}
                  onChange={(e) => setSearchAcc(e.target.value)}
                  className="h-[38px] w-full rounded-[10px] pr-8 pl-3 text-[11px] text-white outline-none"
                  style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
                  onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                />
              </div>
              <div className="flex gap-1.5">
                {[
                  { key: "all", label: "الكل" },
                  { key: "admin", label: "مدراء" },
                  { key: "doctor", label: "أطباء" },
                  { key: "receptionist", label: "استقبال" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setRoleFilter(f.key)}
                    className="h-[38px] px-3 rounded-[8px] text-[10px] font-bold transition-all shrink-0"
                    style={{
                      background: roleFilter === f.key ? "rgba(10,108,255,0.15)" : "transparent",
                      color: roleFilter === f.key ? "#0A6CFF" : "#8EA2BD",
                      border: `1px solid ${roleFilter === f.key ? "rgba(10,108,255,0.3)" : "rgba(40,130,220,0.12)"}`,
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setShowCreate(!showCreate); setEditingId(null); }}
                className="h-[38px] px-4 rounded-[10px] text-[11px] font-bold text-white shrink-0 flex items-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)", boxShadow: "0 4px 12px rgba(10,108,255,0.2)" }}
              >
                <UserPlus className="w-3.5 h-3.5" /> حساب جديد
              </button>
            </div>

            {/* ─── Create Form ─── */}
            <AnimatePresence>
              {showCreate && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-4 rounded-[12px] space-y-3 border" style={{ background: "linear-gradient(145deg, rgba(10,108,255,0.06), rgba(0,216,216,0.03))", borderColor: "rgba(10,108,255,0.2)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <UserPlus className="w-4 h-4 text-[#0A6CFF]" />
                      <span className="text-[12px] font-bold text-white">حساب جديد</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: "الاسم الكامل", key: "name", placeholder: "محمد أحمد" },
                        { label: "اسم المستخدم", key: "username", placeholder: "mohammed" },
                        { label: "كلمة المرور", key: "password", placeholder: "****", type: "password" },
                        { label: "البريد الإلكتروني", key: "email", placeholder: "email@clinic.com" },
                        { label: "الفرع", key: "branch", placeholder: "الفرع الرئيسي" },
                      ].map((f) => (
                        <div key={f.key}>
                          <label className="block text-[9px] font-bold text-[#8EA2BD] mb-1">{f.label}</label>
                          <input
                            type={f.type || "text"}
                            value={(newAccount as any)[f.key]}
                            onChange={(e) => setNewAccount({ ...newAccount, [f.key]: e.target.value })}
                            placeholder={f.placeholder}
                            className="h-[34px] w-full rounded-[8px] px-3 text-[11px] text-white outline-none"
                            style={{ background: "#030A1A", border: "1px solid rgba(40,130,220,0.16)" }}
                            onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-[9px] font-bold text-[#8EA2BD] mb-1">الدور</label>
                        <select
                          value={newAccount.role}
                          onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value })}
                          className="h-[34px] w-full rounded-[8px] px-3 text-[11px] text-white outline-none appearance-none cursor-pointer"
                          style={{ background: "#030A1A", border: "1px solid rgba(40,130,220,0.16)" }}
                        >
                          <option value="admin">مدير</option>
                          <option value="doctor">طبيب</option>
                          <option value="receptionist">استقبال</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button onClick={() => setShowCreate(false)} className="h-[34px] px-4 rounded-[8px] text-[11px] font-bold text-[#8EA2BD] hover:bg-[rgba(255,255,255,0.04)] transition-colors">إلغاء</button>
                      <button
                        onClick={() => createMutation.mutate()}
                        disabled={createMutation.isPending || !newAccount.name || !newAccount.username || !newAccount.password}
                        className="h-[34px] px-5 rounded-[8px] text-[11px] font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-40 flex items-center gap-2"
                        style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)" }}
                      >
                        {createMutation.isPending ? <Activity className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        إنشاء الحساب
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Accounts List ─── */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Activity className="w-6 h-6 animate-spin text-[#8EA2BD]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <Users className="w-7 h-7 text-[#8EA2BD]" />
                </div>
                <p className="text-[13px] text-[#8EA2BD]">
                  {accounts.length === 0 ? "لا يوجد حسابات بعد" : "لا توجد نتائج مطابقة للبحث"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((acc) => {
                  const RoleIcon = roleIcon(acc.role);
                  const isEditing = editingId === acc.id;
                  return (
                    <div
                      key={acc.id}
                      className="rounded-[12px] border transition-all"
                      style={{
                        background: isEditing ? "rgba(10,108,255,0.04)" : "#050C1F",
                        borderColor: isEditing ? "rgba(10,108,255,0.25)" : "rgba(40,130,220,0.12)",
                      }}
                    >
                      {/* ── Account Row ── */}
                      <div className="flex items-center gap-3 p-3">
                        <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${roleColor(acc.role)}15` }}>
                          <RoleIcon className="w-5 h-5" style={{ color: roleColor(acc.role) }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[13px] font-bold text-white truncate">{acc.name}</p>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0" style={{ background: `${roleColor(acc.role)}15`, color: roleColor(acc.role) }}>
                              {roleLabel(acc.role)}
                            </span>
                            {acc.isFrozen && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 flex items-center gap-1" style={{ background: "rgba(255,200,87,0.12)", color: "#FFC857" }}>
                                <Snowflake className="w-2.5 h-2.5" /> متجمد
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-[10px] text-[#8EA2BD]" dir="ltr">@{acc.username}</p>
                            {acc.email && <p className="text-[10px] text-[#8EA2BD]">{acc.email}</p>}
                            {acc.branch && <p className="text-[10px] text-[#8EA2BD]">{acc.branch}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => isEditing ? setEditingId(null) : startEdit(acc)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: isEditing ? "rgba(10,108,255,0.12)" : "transparent" }}
                            title="تعديل الحساب"
                          >
                            <Edit3 className="w-3.5 h-3.5" style={{ color: isEditing ? "#0A6CFF" : "#8EA2BD" }} />
                          </button>
                          <button
                            onClick={() => { setResetPwdId(resetPwdId === acc.id ? null : acc.id); setResetPwd(""); }}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: resetPwdId === acc.id ? "rgba(10,108,255,0.12)" : "transparent" }}
                            title="إعادة تعيين كلمة المرور"
                          >
                            <RotateCcw className="w-3.5 h-3.5" style={{ color: resetPwdId === acc.id ? "#0A6CFF" : "#8EA2BD" }} />
                          </button>
                          <button
                            onClick={() => freezeMutation.mutate({ accountId: acc.id, isFrozen: !acc.isFrozen })}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: acc.isFrozen ? "rgba(0,216,216,0.1)" : "rgba(255,200,87,0.08)" }}
                            title={acc.isFrozen ? "إلغاء التجميد" : "تجميد الحساب"}
                          >
                            <Snowflake className="w-3.5 h-3.5" style={{ color: acc.isFrozen ? "#00D8D8" : "#FFC857" }} />
                          </button>
                        </div>
                      </div>

                      {/* ── Edit Panel ── */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-3 pb-3 pt-0">
                              <div className="p-3 rounded-[10px] border space-y-2.5" style={{ background: "#030A1A", borderColor: "rgba(10,108,255,0.2)" }}>
                                <p className="text-[10px] font-bold text-[#0A6CFF] flex items-center gap-1"><Edit3 className="w-3 h-3" /> تعديل بيانات الحساب</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                                  <div>
                                    <label className="block text-[9px] font-bold text-[#8EA2BD] mb-1">الاسم</label>
                                    <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                      className="h-[32px] w-full rounded-[8px] px-3 text-[11px] text-white outline-none" style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
                                      onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")} onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-[#8EA2BD] mb-1">الدور</label>
                                    <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                      className="h-[32px] w-full rounded-[8px] px-3 text-[11px] text-white outline-none appearance-none cursor-pointer" style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
                                    >
                                      <option value="admin">مدير</option>
                                      <option value="doctor">طبيب</option>
                                      <option value="receptionist">استقبال</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-[#8EA2BD] mb-1">البريد</label>
                                    <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                      className="h-[32px] w-full rounded-[8px] px-3 text-[11px] text-white outline-none" style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
                                      onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")} onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-[#8EA2BD] mb-1">الفرع</label>
                                    <input value={editForm.branch} onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                                      className="h-[32px] w-full rounded-[8px] px-3 text-[11px] text-white outline-none" style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
                                      onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")} onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingId(null)} className="h-[30px] px-3 rounded-[8px] text-[10px] font-bold text-[#8EA2BD] hover:bg-[rgba(255,255,255,0.04)]">إلغاء</button>
                                  <button
                                    onClick={() => {
                                      freezeMutation.mutate({ accountId: acc.id, isFrozen: acc.isFrozen });
                                      setEditingId(null);
                                    }}
                                    className="h-[30px] px-4 rounded-[8px] text-[10px] font-bold text-white flex items-center gap-1.5"
                                    style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)" }}
                                  >
                                    <Save className="w-3 h-3" /> حفظ التعديلات
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ── Reset Password Panel ── */}
                      <AnimatePresence>
                        {resetPwdId === acc.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-3 pb-3 pt-0">
                              <div className="p-3 rounded-[10px] border" style={{ background: "rgba(255,200,87,0.04)", borderColor: "rgba(255,200,87,0.2)" }}>
                                <p className="text-[10px] font-bold text-[#FFC857] flex items-center gap-1 mb-2"><RotateCcw className="w-3 h-3" /> إعادة تعيين كلمة المرور لـ {acc.name}</p>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="password"
                                    value={resetPwd}
                                    onChange={(e) => setResetPwd(e.target.value)}
                                    placeholder="كلمة المرور الجديدة (4 أحرف على الأقل)..."
                                    className="h-[34px] flex-1 rounded-[8px] px-3 text-[11px] text-white outline-none"
                                    style={{ background: "#030A1A", border: "1px solid rgba(255,200,87,0.2)" }}
                                    onFocus={(e) => (e.target.style.borderColor = "#FFC857")}
                                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,200,87,0.2)")}
                                    onKeyDown={(e) => { if (e.key === "Enter" && resetPwd.length >= 4) resetPwdMutation.mutate(); }}
                                  />
                                  <button
                                    onClick={() => resetPwdMutation.mutate()}
                                    disabled={resetPwd.length < 4}
                                    className="h-[34px] px-4 rounded-[8px] text-[11px] font-bold text-white disabled:opacity-40 flex items-center gap-1.5"
                                    style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)" }}
                                  >
                                    <Save className="w-3 h-3" /> حفظ
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── Footer ─── */}
            <div className="pt-3 flex items-center justify-between border-t" style={{ borderColor: "rgba(40,130,220,0.12)" }}>
              <p className="text-[10px] text-[#8EA2BD]">
                {accounts.length} حساب — {totalFrozen} متجمد — {clinic.maxUsers ?? "∞"} الحد الأقصى
              </p>
              <button onClick={onClose} className="h-[38px] px-5 rounded-[10px] text-[12px] font-bold text-[#8EA2BD] hover:bg-[rgba(255,255,255,0.04)] transition-colors">إغلاق</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ━━━━━━━━━━━━━━━━━━━ SETTINGS ACTION CARDS ━━━━━━━━━━━━━━━━━━━ */

interface SettingsAction {
  icon: React.ElementType;
  title: string;
  desc: string;
  gradient: string;
  glowColor: string;
  onClick: () => void;
}

function SettingsActionCard({ icon: Icon, title, desc, gradient, glowColor, onClick }: SettingsAction) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] as const }}
      className="group relative overflow-hidden rounded-[14px] p-5 text-right text-white transition-all duration-200 hover:shadow-[0_10px_35px_rgba(0,0,0,0.25)] flex items-start gap-4"
      style={{ background: gradient, border: "1px solid rgba(40,130,220,0.16)" }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), transparent)" }} />
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 opacity-20 group-hover:opacity-40" style={{ background: glowColor }} />

      <div className="relative shrink-0 p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
        <Icon className="w-5 h-5" strokeWidth={1.8} />
      </div>
      <div className="relative min-w-0 flex-1">
        <h3 className="text-[14px] font-bold mb-1">{title}</h3>
        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{desc}</p>
      </div>
      <div className="relative shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
      </div>
    </motion.button>
  );
}

/* ━━━━━━━━━━━━━━━━━━━ MAIN COMPONENT ━━━━━━━━━━━━━━━━━━━ */

export default function ClinicsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);
  const [systemOpen, setSystemOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [editClinic, setEditClinic] = useState<Clinic | null>(null);
  const [accountsClinic, setAccountsClinic] = useState<Clinic | null>(null);
  const queryClient = useQueryClient();

  const { data: clinics = [], isLoading } = useQuery<Clinic[]>({
    queryKey: ["clinics"],
    queryFn: () => customFetch<Clinic[]>("/api/clinics"),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return customFetch(`/api/clinics/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
    },
  });

  const filteredClinics = clinics.filter(
    (c) =>
      c.name.includes(searchTerm) ||
      c.slug.includes(searchTerm) ||
      (c.city && c.city.includes(searchTerm))
  );

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              إدارة العيادات
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              عرض وإدارة جميع العيادات المشتركة في المنصة.
            </p>
          </div>
          <button
            className="flex items-center gap-2 h-[42px] px-6 rounded-[10px] text-[13px] font-bold text-white transition-all hover:scale-[1.02] shrink-0"
            style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)", boxShadow: "0 4px 15px rgba(10,108,255,0.25)" }}
          >
            <Plus className="w-4 h-4" /> إضافة عيادة جديدة
          </button>
        </div>

        {/* ─── Site Settings Section ─── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#0A6CFF]" />
            <h2 className="text-[14px] font-bold text-white">إعدادات الموقع</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SettingsActionCard
              icon={Globe}
              title="إعدادات SEO والمظهر"
              desc="اسم المنصة والوصف التعريفي والشعار وبيانات SEO"
              gradient="linear-gradient(135deg, #031022, #0A6CFF, #0A2463)"
              glowColor="#0A6CFF"
              onClick={() => setSeoOpen(true)}
            />
            <SettingsActionCard
              icon={Database}
              title="إعدادات النظام والأمان"
              desc="النسخ الاحتياطي التلقائي والمصادقة الثنائية وإشعارات البريد"
              gradient="linear-gradient(135deg, #031022, #008C91, #00C9C9)"
              glowColor="#00D8D8"
              onClick={() => setSystemOpen(true)}
            />
            <SettingsActionCard
              icon={ServerCrash}
              title="وضع الصيانة"
              desc="إيقاف المنصة مؤقتاً للصيانة أو التحديثات الجذرية"
              gradient="linear-gradient(135deg, #1A0A0A, #FF4D60, #6B1520)"
              glowColor="#FF4D60"
              onClick={() => setMaintenanceOpen(true)}
            />
          </div>
        </div>

        {/* ─── Search ─── */}
        <div
          className="rounded-[14px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
          style={{ background: "linear-gradient(145deg, #071A32, #061329)", border: "1px solid rgba(40,130,220,0.16)" }}
        >
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8EA2BD]" />
            <input
              type="text"
              placeholder="ابحث باسم العيادة، الرابط، أو المدينة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[40px] w-full rounded-[10px] pr-9 pl-4 text-[12px] text-white outline-none transition-all duration-300"
              style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
              onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
            />
          </div>
        </div>

        {/* ─── Clinics Grid ─── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#8EA2BD]">
            <Activity className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredClinics.map((clinic) => (
              <div
                key={clinic.id}
                className="rounded-[14px] p-5 flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group"
                style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
              >
                <div className="absolute top-0 right-0 left-0 h-1" style={{ background: clinic.isActive ? "#00D8D8" : "#FF4D60" }} />

                <div className="flex items-start justify-between mb-4 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white shadow-sm" style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)" }}>
                      {clinic.name.charAt(0)}
                    </span>
                    <div>
                      <h3 className="text-[15px] font-bold text-white">{clinic.name}</h3>
                      <p className="text-[11px] text-[#8EA2BD] mt-1" dir="ltr">{clinic.slug}.site.com</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-[#8EA2BD] hover:text-white transition-colors rounded-md p-1 hover:bg-[rgba(255,255,255,0.06)]">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="bottom"
                      align="start"
                      sideOffset={4}
                      className="min-w-[180px]"
                      style={{
                        background: "linear-gradient(145deg, #071A32, #061329)",
                        border: "1px solid rgba(40,130,220,0.2)",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
                      }}
                    >
                      <DropdownMenuItem
                        onClick={() => window.open(`/${clinic.slug}`, "_blank")}
                        className="gap-2 text-[12px] py-2 px-3 text-white/70 hover:text-white hover:bg-[rgba(10,108,255,0.12)] focus:bg-[rgba(10,108,255,0.12)] rounded-lg cursor-pointer"
                        dir="rtl"
                      >
                        <Eye className="w-4 h-4 text-[#8EA2BD]" />
                        عرض العيادة
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 text-[12px] py-2 px-3 text-white/70 hover:text-white hover:bg-[rgba(10,108,255,0.12)] focus:bg-[rgba(10,108,255,0.12)] rounded-lg cursor-pointer"
                        dir="rtl"
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${clinic.slug}`)}
                      >
                        <Copy className="w-4 h-4 text-[#8EA2BD]" />
                        نسخ رابط العيادة
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[rgba(40,130,220,0.12)] my-1" />
                      <DropdownMenuItem
                        onClick={() => setEditClinic(clinic)}
                        className="gap-2 text-[12px] py-2 px-3 text-white/70 hover:text-white hover:bg-[rgba(10,108,255,0.12)] focus:bg-[rgba(10,108,255,0.12)] rounded-lg cursor-pointer"
                        dir="rtl"
                      >
                        <Edit3 className="w-4 h-4 text-[#0A6CFF]" />
                        تعديل البيانات
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setAccountsClinic(clinic)}
                        className="gap-2 text-[12px] py-2 px-3 text-white/70 hover:text-white hover:bg-[rgba(0,216,216,0.12)] focus:bg-[rgba(0,216,216,0.12)] rounded-lg cursor-pointer"
                        dir="rtl"
                      >
                        <Users className="w-4 h-4 text-[#00D8D8]" />
                        عرض الحسابات
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSeoOpen(true)}
                        className="gap-2 text-[12px] py-2 px-3 text-white/70 hover:text-white hover:bg-[rgba(10,108,255,0.12)] focus:bg-[rgba(10,108,255,0.12)] rounded-lg cursor-pointer"
                        dir="rtl"
                      >
                        <Globe className="w-4 h-4 text-[#0A6CFF]" />
                        إعدادات SEO
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 text-[12px] py-2 px-3 text-white/70 hover:text-white hover:bg-[rgba(10,108,255,0.12)] focus:bg-[rgba(10,108,255,0.12)] rounded-lg cursor-pointer"
                        dir="rtl"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#00D8D8]" />
                        لوحة التحكم
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[rgba(40,130,220,0.12)] my-1" />
                      <DropdownMenuItem
                        className="gap-2 text-[12px] py-2 px-3 text-[#FF4D60] hover:text-[#FF4D60] hover:bg-[rgba(255,77,96,0.1)] focus:bg-[rgba(255,77,96,0.1)] rounded-lg cursor-pointer"
                        dir="rtl"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف العيادة
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2.5 mb-5 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-[#8EA2BD]">
                    <MapPin className="w-3.5 h-3.5" /> {clinic.city || "غير محدد"}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8EA2BD]" dir="ltr">
                    <Phone className="w-3.5 h-3.5" /> {clinic.phone || "غير محدد"}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: "rgba(10,108,255,0.1)", color: "#0A6CFF", border: "1px solid rgba(10,108,255,0.2)" }}>
                      {planLabel(clinic.subscriptionPlan)}
                    </span>
                    <span className="text-[10px] text-[#8EA2BD]">{fmtDate(clinic.createdAt)}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2 border-t" style={{ borderColor: "rgba(40,130,220,0.16)" }}>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[14px] font-bold text-white leading-none">{clinic.usersCount}</span>
                    <span className="text-[10px] text-[#8EA2BD]">مستخدم</span>
                  </div>
                  <div className="flex-1" />
                  <button
                    onClick={() => setAccountsClinic(clinic)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[10px] font-bold transition-all hover:scale-[1.03]"
                    style={{ background: "rgba(10,108,255,0.1)", color: "#0A6CFF", border: "1px solid rgba(10,108,255,0.2)" }}
                  >
                    <CreditCard className="w-3 h-3" /> الحسابات
                  </button>
                  <button
                    onClick={() => toggleStatus.mutate({ id: clinic.id, isActive: !clinic.isActive })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[10px] font-bold transition-colors"
                    style={clinic.isActive ? { background: "rgba(255,77,96,0.1)", color: "#FF4D60" } : { background: "rgba(0,216,216,0.1)", color: "#00D8D8" }}
                  >
                    {clinic.isActive ? <><Ban className="w-3 h-3" /> إيقاف العيادة</> : <><CheckCircle2 className="w-3 h-3" /> تفعيل العيادة</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Settings Dialogs ─── */}
      <SeoSettingsDialog open={seoOpen} onClose={() => setSeoOpen(false)} />
      <SystemSettingsDialog open={systemOpen} onClose={() => setSystemOpen(false)} />
      <MaintenanceDialog open={maintenanceOpen} onClose={() => setMaintenanceOpen(false)} />
      <EditClinicDialog clinic={editClinic} open={!!editClinic} onClose={() => setEditClinic(null)} />
      <AccountsDialog clinic={accountsClinic} open={!!accountsClinic} onClose={() => setAccountsClinic(null)} />
    </div>
  );
}
