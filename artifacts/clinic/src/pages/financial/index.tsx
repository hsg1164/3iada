import { useState } from "react";
import { useGetFinancialSummary } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Users, Activity, FileText, Calendar, Filter, Percent } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FinancialSummary() {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [appliedFilters, setAppliedFilters] = useState({ dateFrom: "", dateTo: "" });

  const { data: summary, isLoading } = useGetFinancialSummary({
    dateFrom: appliedFilters.dateFrom || undefined,
    dateTo: appliedFilters.dateTo || undefined
  });

  const handleFilter = () => setAppliedFilters({ dateFrom, dateTo });

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setAppliedFilters({ dateFrom: "", dateTo: "" });
  };

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        
        {/* ─── Header & Filters ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#00D8D8] tracking-tight" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              الملخص المالي
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              نظرة عامة على الإيرادات، المصروفات، والأرباح للعيادة.
            </p>
          </div>
          
          <div 
            className="flex flex-wrap items-end gap-3 p-3 rounded-[12px] border"
            style={{ background: "#050C1F", borderColor: "rgba(40,130,220,0.16)" }}
          >
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#8EA2BD]">من تاريخ</label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[36px]" style={{ colorScheme: "dark" }} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#8EA2BD]">إلى تاريخ</label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[36px]" style={{ colorScheme: "dark" }} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleFilter} className="flex items-center gap-1.5 h-[36px] px-4 rounded-[8px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] border-0" style={{ background: "linear-gradient(135deg, #00D8D8, #0A6CFF)" }}>
                <Filter className="w-3.5 h-3.5" /> تصفية
              </button>
              {(appliedFilters.dateFrom || appliedFilters.dateTo) && (
                <button onClick={clearFilters} className="h-[36px] px-3 rounded-[8px] text-[12px] font-bold text-[#FF4D60] bg-[rgba(255,77,96,0.1)] hover:bg-[#FF4D60] hover:text-white transition-all">
                  إلغاء
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Main KPI Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Net Profit */}
          <div className="rounded-[14px] p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border border-[rgba(0,217,208,0.2)]" style={{ background: "linear-gradient(145deg, rgba(0,217,208,0.1), rgba(0,217,208,0.02))" }}>
            <div className="absolute -left-6 -top-6 w-24 h-24 bg-[#00D8D8] rounded-full blur-[50px] opacity-20 pointer-events-none" />
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-[#00D8D8] text-[14px]">صافي الربح</h3>
              <div className="bg-[#00D8D8] rounded-full p-2 text-[#050C1F] shadow-[0_0_15px_rgba(0,217,208,0.3)]"><TrendingUp className="h-4 w-4" /></div>
            </div>
            {isLoading ? <Activity className="w-6 h-6 animate-spin text-[#00D8D8]" /> : (
              <div className="text-[32px] font-extrabold font-mono tracking-tight text-white flex items-center" dir="ltr">
                <span className="text-[#00D8D8] text-[20px] mr-2">₪</span>{summary?.netProfit || 0}
              </div>
            )}
          </div>

          {/* Total Revenue */}
          <div className="rounded-[14px] p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border border-[rgba(10,108,255,0.2)]" style={{ background: "linear-gradient(145deg, rgba(10,108,255,0.1), rgba(10,108,255,0.02))" }}>
            <div className="absolute -left-6 -top-6 w-24 h-24 bg-[#0A6CFF] rounded-full blur-[50px] opacity-20 pointer-events-none" />
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-[#0A6CFF] text-[14px]">إجمالي الإيرادات</h3>
              <div className="bg-[#0A6CFF] rounded-full p-2 text-white shadow-[0_0_15px_rgba(10,108,255,0.3)]"><DollarSign className="h-4 w-4" /></div>
            </div>
            {isLoading ? <Activity className="w-6 h-6 animate-spin text-[#0A6CFF]" /> : (
              <div className="text-[28px] font-extrabold font-mono tracking-tight text-white flex items-center" dir="ltr">
                <span className="text-[#0A6CFF] text-[18px] mr-2">₪</span>{summary?.totalPayments || 0}
              </div>
            )}
          </div>

          {/* Total Expenses */}
          <div className="rounded-[14px] p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border border-[rgba(255,77,96,0.2)]" style={{ background: "linear-gradient(145deg, rgba(255,77,96,0.1), rgba(255,77,96,0.02))" }}>
            <div className="absolute -left-6 -top-6 w-24 h-24 bg-[#FF4D60] rounded-full blur-[50px] opacity-20 pointer-events-none" />
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-[#FF4D60] text-[14px]">إجمالي المصروفات</h3>
              <div className="bg-[#FF4D60] rounded-full p-2 text-white shadow-[0_0_15px_rgba(255,77,96,0.3)]"><TrendingDown className="h-4 w-4" /></div>
            </div>
            {isLoading ? <Activity className="w-6 h-6 animate-spin text-[#FF4D60]" /> : (
              <div className="text-[28px] font-extrabold font-mono tracking-tight text-white flex items-center" dir="ltr">
                <span className="text-[#FF4D60] text-[18px] mr-2">₪</span>{summary?.totalExpenses || 0}
              </div>
            )}
          </div>

          {/* Total Receivables */}
          <div className="rounded-[14px] p-6 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border border-[rgba(255,200,87,0.2)]" style={{ background: "linear-gradient(145deg, rgba(255,200,87,0.1), rgba(255,200,87,0.02))" }}>
            <div className="absolute -left-6 -top-6 w-24 h-24 bg-[#FFC857] rounded-full blur-[50px] opacity-20 pointer-events-none" />
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-[#FFC857] text-[14px]">إجمالي المستحقات</h3>
              <div className="bg-[#FFC857] rounded-full p-2 text-[#050C1F] shadow-[0_0_15px_rgba(255,200,87,0.3)]"><Wallet className="h-4 w-4" /></div>
            </div>
            {isLoading ? <Activity className="w-6 h-6 animate-spin text-[#FFC857]" /> : (
              <div className="text-[28px] font-extrabold font-mono tracking-tight text-white flex items-center" dir="ltr">
                <span className="text-[#FFC857] text-[18px] mr-2">₪</span>{summary?.totalReceivables || 0}
              </div>
            )}
          </div>

        </div>

        {/* ─── Secondary Stats ─── */}
        <h2 className="text-[16px] font-bold mt-8 mb-4 text-white border-b border-[rgba(40,130,220,0.16)] pb-2 w-max">تفاصيل وإحصائيات إضافية</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <div className="rounded-[12px] p-4 bg-[#050C1F] border border-[rgba(40,130,220,0.16)] flex items-center gap-4 hover:bg-[rgba(10,108,255,0.02)] transition-colors">
            <div className="bg-[rgba(10,108,255,0.1)] p-3 rounded-[10px] text-[#0A6CFF]"><Wallet className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-bold text-[#8EA2BD]">المدفوع نقداً</p>
              {isLoading ? <Activity className="w-4 h-4 animate-spin text-[#0A6CFF] mt-1" /> : <p className="font-mono text-[16px] font-bold text-white mt-1" dir="ltr">₪ {summary?.cashPayments || 0}</p>}
            </div>
          </div>
          
          <div className="rounded-[12px] p-4 bg-[#050C1F] border border-[rgba(40,130,220,0.16)] flex items-center gap-4 hover:bg-[rgba(10,108,255,0.02)] transition-colors">
            <div className="bg-[rgba(139,92,246,0.1)] p-3 rounded-[10px] text-[#8B5CF6]"><Activity className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-bold text-[#8EA2BD]">طرق دفع أخرى</p>
              {isLoading ? <Activity className="w-4 h-4 animate-spin text-[#8B5CF6] mt-1" /> : <p className="font-mono text-[16px] font-bold text-white mt-1" dir="ltr">₪ {summary?.otherPayments || 0}</p>}
            </div>
          </div>

          <div className="rounded-[12px] p-4 bg-[#050C1F] border border-[rgba(40,130,220,0.16)] flex items-center gap-4 hover:bg-[rgba(255,77,96,0.02)] transition-colors">
            <div className="bg-[rgba(255,77,96,0.1)] p-3 rounded-[10px] text-[#FF4D60]"><Percent className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-bold text-[#8EA2BD]">إجمالي الخصومات</p>
              {isLoading ? <Activity className="w-4 h-4 animate-spin text-[#FF4D60] mt-1" /> : <p className="font-mono text-[16px] font-bold text-[#FF4D60] mt-1" dir="ltr">₪ {summary?.totalDiscounts || 0}</p>}
            </div>
          </div>

          <div className="rounded-[12px] p-4 bg-[#050C1F] border border-[rgba(40,130,220,0.16)] flex items-center gap-4 hover:bg-[rgba(0,217,208,0.02)] transition-colors">
            <div className="bg-[rgba(0,217,208,0.1)] p-3 rounded-[10px] text-[#00D8D8]"><Users className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-bold text-[#8EA2BD]">المرضى المخدومين</p>
              {isLoading ? <Activity className="w-4 h-4 animate-spin text-[#00D8D8] mt-1" /> : <p className="text-[16px] font-bold text-white mt-1">{summary?.totalPatients || 0}</p>}
            </div>
          </div>

          <div className="rounded-[12px] p-4 bg-[#050C1F] border border-[rgba(40,130,220,0.16)] flex items-center gap-4 hover:bg-[rgba(255,200,87,0.02)] transition-colors">
            <div className="bg-[rgba(255,200,87,0.1)] p-3 rounded-[10px] text-[#FFC857]"><FileText className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-bold text-[#8EA2BD]">الخدمات المقدمة</p>
              {isLoading ? <Activity className="w-4 h-4 animate-spin text-[#FFC857] mt-1" /> : <p className="text-[16px] font-bold text-white mt-1">{summary?.totalServices || 0}</p>}
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
}