import { useState } from "react";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { RefreshCw, Database, GitBranch, CheckCircle2, AlertCircle, Download, Upload, Clock, Shield, HardDrive, Activity } from "lucide-react";

const BRANCHES = [
  { name: "فرع غزة", status: "متزامن", lastSync: "منذ 5 دقائق", color: "text-[#00D8D8]", bg: "bg-[rgba(0,217,208,0.1)]", border: "border-[rgba(0,217,208,0.2)]" },
  { name: "فرع خان يونس", status: "متزامن", lastSync: "منذ 12 دقيقة", color: "text-[#00D8D8]", bg: "bg-[rgba(0,217,208,0.1)]", border: "border-[rgba(0,217,208,0.2)]" },
];

const BACKUP_HISTORY = [
  { id: 1, type: "تلقائي", date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), size: "4.2 MB", status: "ناجح" },
  { id: 2, type: "يدوي",   date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), size: "4.0 MB", status: "ناجح" },
  { id: 3, type: "تلقائي", date: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), size: "3.9 MB", status: "ناجح" },
  { id: 4, type: "تلقائي", date: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(), size: "3.8 MB", status: "ناجح" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" });
}

function InfoCard({ icon: Icon, label, value, sub, colorClass }: { icon: React.ElementType; label: string; value: string; sub?: string; colorClass: string }) {
  return (
    <div className="rounded-[14px] p-5 flex flex-col border border-[rgba(40,130,220,0.16)] bg-[#050C1F] transition-all hover:scale-[1.02]">
      <div className="flex items-start gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-[24px] font-extrabold font-mono text-white tracking-tight" dir="ltr">{value}</div>
          <div className="text-[12px] font-bold text-[#8EA2BD] mt-1">{label}</div>
          {sub && <div className="text-[10px] text-[#8EA2BD] mt-1 opacity-70">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Backup() {
  const [syncing, setSyncing] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const { data: stats } = useGetDashboardStats({});

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2500);
  };

  const handleBackup = () => {
    setBackingUp(true);
    setTimeout(() => setBackingUp(false), 3000);
  };

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#8B5CF6] tracking-tight flex items-center gap-2" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              <Shield className="h-6 w-6" /> المزامنة والنسخ الاحتياطي
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              إدارة مزامنة الفروع وحفظ احتياطي لقاعدة البيانات
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handleSync} 
              disabled={syncing}
              className="flex items-center gap-2 h-[40px] px-5 rounded-[10px] text-[12px] font-bold text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] transition-all hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin text-[#00D8D8]" : "text-[#8EA2BD]"}`} />
              {syncing ? "جاري المزامنة..." : "مزامنة الآن"}
            </button>
            <button 
              onClick={handleBackup} 
              disabled={backingUp}
              className="flex items-center gap-2 h-[40px] px-6 rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] hover:brightness-110 border-0 disabled:opacity-50 shadow-[0_4px_15px_rgba(139,92,246,0.25)]"
              style={{ background: "linear-gradient(135deg, #8B5CF6, #0A6CFF)" }}
            >
              <Download className={`h-4 w-4 ${backingUp ? "animate-bounce" : ""}`} />
              {backingUp ? "جاري الحفظ..." : "نسخ احتياطي"}
            </button>
          </div>
        </div>

        {backingUp && (
          <div className="rounded-[12px] p-4 bg-[rgba(10,108,255,0.1)] border border-[rgba(10,108,255,0.2)] flex items-center gap-3 animate-pulse">
            <Database className="h-5 w-5 text-[#0A6CFF]" />
            <span className="text-[13px] font-bold text-[#0A6CFF]">جاري إنشاء النسخة الاحتياطية وتشفيرها...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard icon={Database} label="حجم قاعدة البيانات" value="4.2 MB" colorClass="bg-[rgba(10,108,255,0.1)] text-[#0A6CFF]" />
          <InfoCard icon={HardDrive} label="النسخ الاحتياطية" value="4" sub="آخر 30 يوم" colorClass="bg-[rgba(139,92,246,0.1)] text-[#8B5CF6]" />
          <InfoCard icon={GitBranch} label="الفروع المتزامنة" value="2 / 2" colorClass="bg-[rgba(0,217,208,0.1)] text-[#00D8D8]" />
          <InfoCard icon={Shield} label="آخر نسخة احتياطية" value="ساعتين" colorClass="bg-[rgba(255,200,87,0.1)] text-[#FFC857]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Branch Sync */}
          <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
            <div className="bg-[rgba(10,108,255,0.04)] border-b border-[rgba(40,130,220,0.16)] p-5 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-[#0A6CFF]" />
              <h2 className="font-bold text-[15px] text-white">حالة مزامنة الفروع</h2>
            </div>
            <div className="p-5 space-y-4">
              {BRANCHES.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-[12px] bg-[rgba(6,19,41,0.4)] border border-[rgba(40,130,220,0.08)]">
                  <div className="flex items-center gap-3">
                    <div className="bg-[rgba(255,255,255,0.05)] p-2 rounded-lg text-[#8EA2BD]">
                      <GitBranch className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-[13px]">{b.name}</div>
                      <div className="text-[11px] text-[#8EA2BD] flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> آخر مزامنة: {b.lastSync}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-[6px] text-[11px] font-bold border ${b.color} ${b.bg} ${b.border} flex items-center gap-1.5`}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Backup History */}
          <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
            <div className="bg-[rgba(139,92,246,0.04)] border-b border-[rgba(40,130,220,0.16)] p-5 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#8B5CF6]" />
              <h2 className="font-bold text-[15px] text-white">سجل النسخ الاحتياطي</h2>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-[rgba(40,130,220,0.08)] bg-[rgba(6,19,41,0.2)]">
                    <th className="px-5 py-3 text-[11px] font-bold text-[#8EA2BD]">التاريخ</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#8EA2BD]">النوع</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#8EA2BD]">الحجم</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#8EA2BD] text-center">الحالة</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#8EA2BD] text-left">أدوات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(40,130,220,0.08)]">
                  {BACKUP_HISTORY.map(item => (
                    <tr key={item.id} className="transition-colors hover:bg-[rgba(10,108,255,0.02)]">
                      <td className="px-5 py-3 text-[12px] text-white" dir="ltr">{formatDate(item.date)}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-[4px] border border-[rgba(142,162,189,0.2)] text-[10px] text-[#8EA2BD] bg-[rgba(142,162,189,0.05)]">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-[12px] text-[#8EA2BD]" dir="ltr">{item.size}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00D8D8]">
                          <CheckCircle2 className="h-3 w-3" /> {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button className="h-7 px-3 rounded text-[11px] font-bold bg-[rgba(255,255,255,0.05)] text-[#8EA2BD] hover:bg-[rgba(10,108,255,0.1)] hover:text-[#0A6CFF] transition-colors">
                            تنزيل
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
