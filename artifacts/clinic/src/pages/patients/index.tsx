import { useState, useEffect, useRef } from "react";
import { useListPatients, useDeletePatient } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Filter, Edit, Trash2, Eye, Upload, X, Activity, User, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";
import RestoreImport from "./restore-import";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Patients() {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{ gender?: string; maritalStatus?: string; nationality?: string; address?: string }>({});
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const limit = 20;

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchValue);
      setPage(1);
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [searchValue]);

  const { data, isLoading } = useListPatients({
    search: debouncedSearch || undefined,
    page,
    limit,
    ...(filters.gender ? { gender: filters.gender } : {}),
    ...(filters.maritalStatus ? { maritalStatus: filters.maritalStatus } : {}),
    ...(filters.nationality ? { nationality: filters.nationality } : {}),
    ...(filters.address ? { address: filters.address } : {}),
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const totalPages = data?.total ? Math.ceil(data.total / limit) : 1;

  const deletePatient = useDeletePatient({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم الحذف", description: "تم نقل المريض إلى الأرشيف" });
        queryClient.invalidateQueries();
      },
      onError: () => {
        toast({ title: "خطأ", description: "حدث خطأ أثناء الحذف", variant: "destructive" });
      }
    }
  });

  const clearFilters = () => {
    setFilters({});
    setPage(1);
    setFilterOpen(false);
  };

  const pageStart = data?.total ? (page - 1) * limit + 1 : 0;
  const pageEnd = data?.total ? Math.min(page * limit, data.total) : 0;

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
              قائمة المرضى
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              إدارة بيانات المرضى، السجلات الطبية، والملفات الشخصية.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setRestoreOpen(true)}
              className="flex items-center justify-center gap-2 h-[42px] px-6 rounded-[10px] text-[13px] font-bold text-white transition-all hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(40,130,220,0.16)]"
            >
              <Upload className="w-4 h-4" /> استرداد
            </button>
            <Link href="/patients/new">
              <button
                className="flex items-center justify-center gap-2 h-[42px] px-6 rounded-[10px] text-[13px] font-bold text-white transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #0A6CFF, #00D8D8)",
                  boxShadow: "0 4px 15px rgba(10,108,255,0.25)",
                }}
              >
                <Plus className="w-4 h-4" /> مريض جديد
              </button>
            </Link>
          </div>
        </div>

        <RestoreImport
          open={restoreOpen}
          onOpenChange={setRestoreOpen}
          onComplete={() => queryClient.invalidateQueries()}
        />

        {/* ─── Search & Filters ─── */}
        <div
          className="rounded-[14px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
          style={{
            background: "#050C1F",
            border: "1px solid rgba(40,130,220,0.16)",
          }}
        >
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8EA2BD]" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الكود، أو رقم الجوال..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-[40px] w-full rounded-[10px] pr-9 pl-4 text-[12px] text-white outline-none transition-all duration-300"
              style={{
                background: "rgba(6,19,41,.6)",
                border: "1px solid rgba(40,130,220,0.16)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0A6CFF")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(40,130,220,0.16)")}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 h-[40px] px-4 rounded-[10px] text-[12px] font-bold text-white transition-all border"
              style={Object.keys(filters).length > 0 
                ? { background: "rgba(10,108,255,0.1)", borderColor: "#0A6CFF", color: "#0A6CFF" }
                : { background: "rgba(6,19,41,.6)", borderColor: "rgba(40,130,220,0.16)" }
              }
            >
              <Filter className="h-4 w-4" /> تصفية
              {Object.keys(filters).length > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0A6CFF] text-white text-[10px] ml-1">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={clearFilters}
                className="h-[40px] w-[40px] flex items-center justify-center rounded-[10px] text-[#FF4D60] hover:bg-[rgba(255,77,96,0.1)] border border-[rgba(255,77,96,0.2)] transition-colors"
                title="مسح التصفية"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ─── Patients Table ─── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#00D8D8]">
            <Activity className="w-8 h-8 animate-spin" />
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
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD] w-12">#</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الكود</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">المريض</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">معلومات الاتصال</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">زيارات</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">آخر زيارة</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD] text-left">أدوات</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(40,130,220,0.08)" }}>
                  {data?.patients?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-[#8EA2BD] text-[13px]">
                        لا يوجد مرضى
                      </td>
                    </tr>
                  ) : (
                    data?.patients?.map((patient: any, index: number) => (
                      <tr key={patient.id} className="transition-colors hover:bg-[rgba(10,108,255,0.02)]">
                        <td className="px-5 py-4 text-[12px] text-[#8EA2BD]">{pageStart + index}</td>
                        <td className="px-5 py-4 font-mono text-[11px] text-[#00D8D8] bg-[rgba(0,217,208,0.05)] rounded-md inline-block mt-3 ml-2">
                          {patient.localCode}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold text-white shrink-0"
                              style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)" }}
                            >
                              {patient.nameAr?.charAt(0) || <User className="w-4 h-4"/>}
                            </span>
                            <div>
                              <p className="text-[13px] font-bold text-white">{patient.nameAr}</p>
                              <p className="text-[11px] text-[#8EA2BD] mt-0.5">
                                {patient.ageYears ? `${patient.ageYears} سنة` : "-"} • {patient.gender || "-"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 text-[11px] text-white" dir="ltr">
                              <Phone className="w-3 h-3 text-[#8EA2BD]" /> 
                              {patient.phones?.[0]?.number || "-"}
                            </div>
                            {patient.address && (
                              <div className="flex items-center gap-2 text-[11px] text-[#8EA2BD]">
                                <MapPin className="w-3 h-3" /> {patient.address}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] text-[11px] font-bold">
                            {patient.totalVisits || 0}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[11px] text-[#8EA2BD]">
                          {patient.lastVisitDate ? new Date(patient.lastVisitDate).toLocaleDateString("ar-EG") : "-"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <Link href={`/patients/${patient.id}`}>
                              <button className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(10,108,255,0.1)] text-[#8EA2BD] hover:text-[#0A6CFF]" title="عرض التفاصيل">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                            <button className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(0,217,208,0.1)] text-[#8EA2BD] hover:text-[#00D8D8]" title="تعديل">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if(confirm(`هل أنت متأكد من نقل (${patient.nameAr}) إلى الأرشيف؟`)) {
                                  deletePatient.mutate({ id: patient.id });
                                }
                              }}
                              className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(255,77,96,0.1)] text-[#8EA2BD] hover:text-[#FF4D60]" 
                              title="حذف (أرشفة)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-[rgba(40,130,220,0.16)] bg-[rgba(6,19,41,0.4)]">
                <p className="text-[11px] text-[#8EA2BD]">
                  عرض {pageStart}-{pageEnd} من {data?.total ?? 0}
                </p>
                <div className="flex items-center gap-1" dir="ltr">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-8 px-3 rounded-md text-[11px] border border-[rgba(40,130,220,0.16)] text-white hover:bg-[rgba(10,108,255,0.1)] disabled:opacity-50"
                  >
                    السابق
                  </button>
                  <span className="h-8 px-4 flex items-center justify-center rounded-md text-[11px] font-bold bg-[#0A6CFF] text-white">
                    {page}
                  </span>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="h-8 px-3 rounded-md text-[11px] border border-[rgba(40,130,220,0.16)] text-white hover:bg-[rgba(10,108,255,0.1)] disabled:opacity-50"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ─── Filter Dialog ─── */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="sm:max-w-[400px] border-[rgba(40,130,220,0.2)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="bg-gradient-to-l from-[#0A6CFF] to-[#00D8D8] px-6 py-4 flex items-center justify-between">
            <DialogTitle className="text-white font-extrabold text-[16px]">تصفية متقدمة</DialogTitle>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <Label className="text-[#8EA2BD] text-[12px] font-bold">الجنس</Label>
              <Select value={filters.gender || ""} onValueChange={(v) => setFilters(f => ({ ...f, gender: v === "all" ? undefined : v }))}>
                <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px] mt-1.5">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                  <SelectItem value="all" className="text-[12px]">الكل</SelectItem>
                  <SelectItem value="ذكر" className="text-[12px]">ذكر</SelectItem>
                  <SelectItem value="أنثى" className="text-[12px]">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#8EA2BD] text-[12px] font-bold">الحالة الاجتماعية</Label>
              <Select value={filters.maritalStatus || ""} onValueChange={(v) => setFilters(f => ({ ...f, maritalStatus: v === "all" ? undefined : v }))}>
                <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px] mt-1.5">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                  <SelectItem value="all" className="text-[12px]">الكل</SelectItem>
                  <SelectItem value="أعزب" className="text-[12px]">أعزب</SelectItem>
                  <SelectItem value="متزوج" className="text-[12px]">متزوج</SelectItem>
                  <SelectItem value="مطلقة" className="text-[12px]">مطلقة</SelectItem>
                  <SelectItem value="أرمل" className="text-[12px]">أرمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[#8EA2BD] text-[12px] font-bold">الجنسية</Label>
              <Input 
                placeholder="مثال: فلسطين" 
                value={filters.nationality || ""} 
                onChange={(e) => setFilters(f => ({ ...f, nationality: e.target.value || undefined }))} 
                className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px] mt-1.5"
              />
            </div>
            <div>
              <Label className="text-[#8EA2BD] text-[12px] font-bold">العنوان</Label>
              <Input 
                placeholder="مثال: غزة" 
                value={filters.address || ""} 
                onChange={(e) => setFilters(f => ({ ...f, address: e.target.value || undefined }))} 
                className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px] mt-1.5"
              />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-[rgba(40,130,220,0.16)] flex justify-end gap-3">
            <Button variant="ghost" onClick={clearFilters} className="text-[#8EA2BD] hover:text-white hover:bg-[rgba(255,255,255,0.05)] text-[12px] h-[38px] px-5">مسح الكل</Button>
            <Button onClick={() => { setPage(1); setFilterOpen(false); }} className="bg-[#0A6CFF] text-white text-[12px] h-[38px] px-6 font-bold hover:brightness-110 border-0">تطبيق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
