import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  ShieldCheck,
  Stethoscope,
  ClipboardList,
  Mail,
  Phone,
  Building2,
  KeyRound,
  Ban,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { customFetch } from "@workspace/api-client-react";

/* ─── Types ─── */
interface Clinic {
  id: number;
  name: string;
}

interface Account {
  id: number;
  name: string;
  username: string;
  email: string | null;
  branch: string | null;
  isFrozen: boolean;
  isSuperadmin: boolean;
  createdAt: string;
  roleName: string;
  clinicId: number;
  clinicName: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const roleLabel = (role: string) =>
  role === "admin"
    ? "مدير عيادة"
    : role === "doctor"
    ? "طبيب"
    : role === "receptionist"
    ? "سكرتير"
    : role;

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  // Step 1: Fetch all clinics
  const { data: clinics = [] } = useQuery<Clinic[]>({
    queryKey: ["clinics"],
    queryFn: () => customFetch<Clinic[]>("/api/clinics"),
  });

  // Step 2: For each clinic, fetch its accounts & merge
  const { data: allUsers = [], isLoading } = useQuery<Account[]>({
    queryKey: ["all-platform-users", clinics.map((c) => c.id)],
    enabled: clinics.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        clinics.map(async (clinic) => {
          try {
            const accounts = await customFetch<any[]>(`/api/clinics/${clinic.id}/accounts`);
            return accounts.map((a: any) => ({
              ...a,
              clinicId: clinic.id,
              clinicName: clinic.name,
            }));
          } catch {
            return [];
          }
        })
      );
      return results.flat();
    },
  });

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.includes(searchTerm) ||
      u.username.includes(searchTerm) ||
      u.clinicName.includes(searchTerm)
  );

  const totalUsers = allUsers.length;
  const doctorsCount = allUsers.filter((u) => u.roleName === "doctor").length;
  const adminsCount = allUsers.filter((u) => u.roleName === "admin").length;

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
              مستخدمي المنصة
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              إدارة كافة المستخدمين عبر جميع العيادات (بيانات حقيقية من الخادم).
            </p>
          </div>
        </div>

        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "إجمالي المستخدمين", value: totalUsers, icon: Users, color: "#0A6CFF" },
            { label: "أطباء", value: doctorsCount, icon: Stethoscope, color: "#00D8D8" },
            { label: "مدراء العيادات", value: adminsCount, icon: ShieldCheck, color: "#8B5CF6" },
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
                <p className="text-[12px] text-[#8EA2BD] mb-1">{stat.label}</p>
                <h3 className="text-[24px] font-bold text-white leading-none">{stat.value}</h3>
              </div>
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  background: "rgba(0,0,0,0.2)",
                  border: `1px solid ${stat.color}40`,
                  boxShadow: `0 0 15px ${stat.color}20`,
                }}
              >
                <stat.icon style={{ color: stat.color, width: 22, height: 22 }} />
              </div>
            </div>
          ))}
        </div>

        {/* ─── Search ─── */}
        <div
          className="rounded-[14px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
          style={{
            background: "#050C1F",
            border: "1px solid rgba(40,130,220,0.16)",
          }}
        >
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8EA2BD]" />
            <input
              type="text"
              placeholder="ابحث بالاسم، اسم المستخدم، أو العيادة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[40px] w-full rounded-[10px] pr-9 pl-4 text-[12px] text-white outline-none transition-all duration-300"
              style={{
                background: "rgba(6,19,41,.6)",
                border: "1px solid rgba(40,130,220,0.16)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
            />
          </div>
        </div>

        {/* ─── Users Table ─── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#8EA2BD]">
            <Activity className="w-6 h-6 animate-spin" />
          </div>
        ) : (
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
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">المستخدم</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الدور والصلاحية</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">العيادة المرتبطة</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">معلومات الاتصال</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">حالة الحساب</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(40,130,220,0.08)" }}>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-[#8EA2BD] text-[13px]">
                        لا يوجد مستخدمين مطابقين للبحث
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={`${user.clinicId}-${user.id}`} className="transition-colors hover:bg-[rgba(10,108,255,0.02)]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                              style={{
                                background: "linear-gradient(135deg, #0A6CFF, #00D8D8)",
                              }}
                            >
                              {user.name.charAt(0)}
                            </span>
                            <div>
                              <p className="text-[13px] font-bold text-white">{user.name}</p>
                              <p className="text-[11px] text-[#8EA2BD] mt-0.5" dir="ltr">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                            style={
                              user.roleName === "admin"
                                ? { background: "rgba(139,92,246,0.1)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.2)" }
                                : user.roleName === "doctor"
                                ? { background: "rgba(0,216,216,0.1)", color: "#00D8D8", border: "1px solid rgba(0,216,216,0.2)" }
                                : { background: "rgba(10,108,255,0.1)", color: "#0A6CFF", border: "1px solid rgba(10,108,255,0.2)" }
                            }
                          >
                            {user.roleName === "admin" && <ShieldCheck className="w-3 h-3" />}
                            {user.roleName === "doctor" && <Stethoscope className="w-3 h-3" />}
                            {user.roleName === "receptionist" && <ClipboardList className="w-3 h-3" />}
                            {roleLabel(user.roleName)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-[#8EA2BD]" />
                            <span className="text-[12px] text-white">{user.clinicName}</span>
                          </div>
                          {user.branch && (
                            <p className="text-[10px] text-[#8EA2BD] mt-0.5 mr-5">فرع: {user.branch}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            {user.email && (
                              <div className="flex items-center gap-2 text-[11px] text-[#8EA2BD]">
                                <Mail className="w-3 h-3" /> {user.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold"
                            style={
                              !user.isFrozen
                                ? { color: "#00D8D8", background: "rgba(0,217,208,0.08)" }
                                : { color: "#FF4D60", background: "rgba(255,77,96,0.08)" }
                            }
                          >
                            {!user.isFrozen ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                            {!user.isFrozen ? "نشط" : "مجمد"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="h-7 w-7 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(10,108,255,0.1)] text-[#8EA2BD] hover:text-[#0A6CFF]"
                              title="إعادة تعيين كلمة المرور"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="h-7 w-7 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(255,77,96,0.1)] text-[#8EA2BD] hover:text-[#FF4D60]"
                              title="تجميد الحساب"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
