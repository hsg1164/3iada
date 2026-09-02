import { useState } from "react";
import { useListReceivables } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Filter, Search, Phone, ExternalLink, Wallet, Activity, CalendarIcon } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Receivables() {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ dateFrom: "", dateTo: "" });

  const { data: receivables, isLoading } = useListReceivables({
    dateFrom: appliedFilters.dateFrom || undefined,
    dateTo: appliedFilters.dateTo || undefined
  });

  const handleFilter = () => setAppliedFilters({ dateFrom, dateTo });
  
  const filteredList = Array.isArray(receivables) 
    ? receivables.filter(r => !searchTerm || r.patientName.includes(searchTerm))
    : [];
    
  const totalAmount = filteredList.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#FFC857] tracking-tight" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              المستحقات والديون
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              متابعة مبالغ الحجوزات غير المسددة بالكامل والديون المتراكمة على المرضى.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* ─── Sidebar / Stats ─── */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Total Card */}
            <div 
              className="rounded-[14px] p-6 border relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(255,200,87,0.1), rgba(255,200,87,0.02))",
                borderColor: "rgba(255,200,87,0.2)"
              }}
            >
              <div className="absolute -left-6 -top-6 w-24 h-24 bg-[#FFC857] rounded-full blur-[50px] opacity-20 pointer-events-none" />
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#FFC857] rounded-full p-2 text-[#050C1F] shadow-[0_0_15px_rgba(255,200,87,0.3)]">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-[#FFC857] text-[14px]">إجمالي المستحقات</h3>
              </div>
              <div className="text-[32px] font-extrabold font-mono tracking-tight text-white mt-2 flex items-center justify-end" dir="ltr">
                <span className="text-[#FFC857] text-[20px] mr-2">₪</span>
                {totalAmount.toLocaleString()}
              </div>
            </div>

            {/* Filters */}
            <div 
              className="rounded-[14px] p-6 border"
              style={{
                background: "#050C1F",
                borderColor: "rgba(40,130,220,0.16)"
              }}
            >
              <h3 className="font-bold text-white text-[14px] mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#0A6CFF]" /> تصفية النتائج
              </h3>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8EA2BD]" />
                  <input
                    type="text"
                    placeholder="بحث باسم المريض..."
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
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#8EA2BD]">من تاريخ الحجز</label>
                  <Input 
                    type="date" 
                    value={dateFrom} 
                    onChange={e => setDateFrom(e.target.value)}
                    className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" style={{ colorScheme: "dark" }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#8EA2BD]">إلى تاريخ الحجز</label>
                  <Input 
                    type="date" 
                    value={dateTo} 
                    onChange={e => setDateTo(e.target.value)} 
                    className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" style={{ colorScheme: "dark" }}
                  />
                </div>
                
                <button
                  onClick={handleFilter}
                  className="w-full h-[40px] rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] border-0 mt-2"
                  style={{
                    background: "linear-gradient(135deg, #0A6CFF, #00D8D8)",
                    boxShadow: "0 4px 15px rgba(10,108,255,0.25)",
                  }}
                >
                  تطبيق الفلتر
                </button>
              </div>
            </div>
          </div>

          {/* ─── Table ─── */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-[#FFC857]">
                <Activity className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div
                className="rounded-[14px] overflow-hidden h-full"
                style={{
                  background: "#050C1F",
                  border: "1px solid rgba(40,130,220,0.16)",
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr style={{ background: "rgba(10,108,255,0.04)", borderBottom: "1px solid rgba(40,130,220,0.16)" }}>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">المريض</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الهاتف</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">تاريخ الحجز</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">المبلغ المستحق</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD] text-left">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "rgba(40,130,220,0.08)" }}>
                      {filteredList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-[#8EA2BD] text-[13px]">
                            لا يوجد مستحقات حالياً
                          </td>
                        </tr>
                      ) : (
                        filteredList.map((item: any) => (
                          <tr key={item.appointmentId} className="transition-colors hover:bg-[rgba(255,200,87,0.03)]">
                            <td className="px-5 py-4">
                              <Link href={`/patients/${item.patientId}`}>
                                <span className="text-[13px] font-bold text-white hover:text-[#0A6CFF] cursor-pointer transition-colors">
                                  {item.patientName}
                                </span>
                              </Link>
                            </td>
                            <td className="px-5 py-4">
                              {item.patientPhone ? (
                                <div className="flex items-center gap-1.5 text-[12px] text-[#8EA2BD]">
                                  <Phone className="h-3.5 w-3.5 text-[#0A6CFF]" />
                                  <span dir="ltr">{item.patientPhone}</span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-[#8EA2BD]">-</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 text-[12px] text-white" dir="ltr">
                                <CalendarIcon className="w-3.5 h-3.5 text-[#8EA2BD]" />
                                {new Date(item.appointmentDate).toLocaleDateString('ar-EG')}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-extrabold text-[14px] font-mono text-[#FFC857] bg-[rgba(255,200,87,0.1)] px-3 py-1 rounded-[6px] border border-[rgba(255,200,87,0.2)] inline-block" dir="ltr">
                                ₪ {item.amount}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex justify-end">
                                <Link href={`/appointments?id=${item.appointmentId}`}>
                                  <button className="flex items-center gap-1.5 h-8 px-3 rounded-[6px] text-[11px] font-bold bg-[rgba(0,217,208,0.1)] text-[#00D8D8] border border-[rgba(0,217,208,0.2)] hover:bg-[#00D8D8] hover:text-[#050C1F] transition-all">
                                    سداد الدفعة <ExternalLink className="h-3.5 w-3.5 ml-1" />
                                  </button>
                                </Link>
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
          </div>
        </div>
      </motion.div>
    </div>
  );
}