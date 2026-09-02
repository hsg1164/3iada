import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { 
  useListAppointments, useCreateAppointment, 
  useUpdateAppointmentStatus, useRecordAppointmentPayment, 
  useCancelAppointment, useListPatients, useListServices, useListBranches 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus, Calendar as CalendarIcon, Clock, Filter, DollarSign, XCircle,
  ChevronDown, CheckCircle, Activity, User, Phone, MapPin, MoreHorizontal,
  Stethoscope, CreditCard, Receipt
} from "lucide-react";

/* ─── Schema ─── */
const appointmentSchema = z.object({
  patientId: z.coerce.number().min(1, "اختر المريض"),
  branch: z.string().min(1, "الفرع مطلوب"),
  appointmentDate: z.string().min(1, "تاريخ الحجز مطلوب"),
  appointmentTime: z.string().min(1, "وقت الحجز مطلوب"),
  source: z.enum(['walk_in', 'phone', 'social_media', 'website', 'email']),
  paymentMethod: z.enum(['cash', 'credit_card', 'check', 'bank_transfer', 'postal_transfer']),
  serviceIds: z.array(z.coerce.number()).optional(),
  doctorId: z.coerce.number().optional().nullable(),
  notes: z.string().optional()
});

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "المبلغ يجب أن يكون أكبر من 0"),
  paymentMethod: z.enum(['cash', 'credit_card', 'check', 'bank_transfer', 'postal_transfer']),
  note: z.string().optional()
});

/* ─── Helpers ─── */
const getStatusConfig = (status: string) => {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    waiting_arrival: { label: "منتظر الوصول", color: "#FFC857", bg: "rgba(255,200,87,0.1)" },
    in_reception: { label: "في الاستقبال", color: "#0A6CFF", bg: "rgba(10,108,255,0.1)" },
    in_examination: { label: "في غرفة الكشف", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
    completed: { label: "أنهى الكشف", color: "#00D8D8", bg: "rgba(0,217,208,0.1)" },
    session_done: { label: "أنهى الجلسة", color: "#00D8D8", bg: "rgba(0,217,208,0.1)" },
    postponed: { label: "تأجيل الحجز", color: "#8EA2BD", bg: "rgba(142,162,189,0.1)" },
    no_show: { label: "لم يحضر", color: "#FF4D60", bg: "rgba(255,77,96,0.1)" },
    cancelled: { label: "ملغي", color: "#FF4D60", bg: "rgba(255,77,96,0.1)" },
  };
  return map[status] || { label: status, color: "#8EA2BD", bg: "rgba(142,162,189,0.1)" };
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* ─── Main Component ─── */
export default function Appointments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const search = useSearch();
  const today = new Date().toISOString().split('T')[0];
  const [dateFilter, setDateFilter] = useState<string>(today);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [paymentAppId, setPaymentAppId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const deepId = params.get("id");
    if (deepId) {
      setDateFilter("");
      setPaymentAppId(parseInt(deepId));
    }
  }, [search]);

  const { data: appointmentsResponse, isLoading } = useListAppointments(dateFilter ? { date: dateFilter } : {});
  const appointments = appointmentsResponse?.appointments || [];
  
  const { data: patientsList } = useListPatients({ limit: 100 });
  const { data: servicesList } = useListServices({});
  const { data: branches } = useListBranches();

  const createAppointment = useCreateAppointment({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم الحفظ", description: "تم إضافة الحجز بنجاح" });
        queryClient.invalidateQueries();
        setIsAddOpen(false);
        addForm.reset();
      }
    }
  });

  const updateStatus = useUpdateAppointmentStatus({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم التحديث", description: "تم تغيير حالة الحجز" });
        queryClient.invalidateQueries();
      }
    }
  });

  const recordPayment = useRecordAppointmentPayment({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم الدفع", description: "تم تسجيل الدفعة بنجاح" });
        queryClient.invalidateQueries();
        setPaymentAppId(null);
        paymentForm.reset();
      }
    }
  });

  const cancelAppointment = useCancelAppointment({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم الإلغاء", description: "تم إلغاء الحجز بنجاح" });
        queryClient.invalidateQueries();
      }
    }
  });

  const addForm = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      branch: "غزة",
      appointmentDate: today,
      appointmentTime: "10:00",
      source: "phone",
      paymentMethod: "cash",
      serviceIds: [],
    }
  });

  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "cash",
      note: ""
    }
  });

  const onAddSubmit = (values: z.infer<typeof appointmentSchema>) => {
    createAppointment.mutate({ data: values });
  };

  const onPaymentSubmit = (values: z.infer<typeof paymentSchema>) => {
    if (!paymentAppId) return;
    recordPayment.mutate({ id: paymentAppId, data: values });
  };

  const filteredAppointments = appointments.filter((app: any) => 
    !searchTerm || (app.patient && app.patient.nameAr.includes(searchTerm))
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
              المواعيد والحجوزات
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              إدارة جدول العيادة، الحجوزات، الدفعات المستحقة وتحديث حالة المرضى.
            </p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 h-[42px] px-6 rounded-[10px] text-[13px] font-bold text-white transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #0A6CFF, #00D8D8)",
              boxShadow: "0 4px 15px rgba(10,108,255,0.25)",
            }}
          >
            <Plus className="w-4 h-4" /> إضافة حجز جديد
          </button>
        </div>

        {/* ─── Search & Date Filter ─── */}
        <div
          className="rounded-[14px] p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
          style={{
            background: "#050C1F",
            border: "1px solid rgba(40,130,220,0.16)",
          }}
        >
          <div className="relative w-full md:w-[350px]">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8EA2BD]" />
            <input
              type="text"
              placeholder="ابحث باسم المريض..."
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
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-[12px] font-bold text-[#8EA2BD]">تاريخ العرض:</span>
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-[40px] rounded-[10px] px-4 text-[12px] text-white outline-none transition-all duration-300 w-full md:w-[150px]"
              style={{
                background: "rgba(6,19,41,.6)",
                border: "1px solid rgba(40,130,220,0.16)",
                colorScheme: "dark"
              }}
            />
            <button
              onClick={() => setDateFilter("")}
              className="h-[40px] px-4 rounded-[10px] text-[12px] font-bold text-[#8EA2BD] transition-all hover:bg-[rgba(255,77,96,0.1)] hover:text-[#FF4D60]"
              style={{ border: "1px solid rgba(40,130,220,0.16)" }}
            >
              عرض الكل
            </button>
          </div>
        </div>

        {/* ─── Appointments Table ─── */}
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
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الوقت والتاريخ</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">المريض</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الطبيب</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الفرع</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الخدمة والمبلغ</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">حالة الحجز</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD] text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(40,130,220,0.08)" }}>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-[#8EA2BD] text-[13px]">
                        لا توجد حجوزات مطابقة للبحث أو التاريخ
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((app: any) => {
                      const cfg = getStatusConfig(app.status);
                      return (
                        <tr key={app.id} className="transition-colors hover:bg-[rgba(10,108,255,0.02)]">
                          
                          {/* Time & Date */}
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1.5">
                              <span className="flex items-center gap-1.5 text-[14px] font-bold text-[#00D8D8]" dir="ltr">
                                <Clock className="w-3.5 h-3.5" />
                                {app.appointmentTime.substring(0, 5)}
                              </span>
                              <span className="flex items-center gap-1.5 text-[11px] text-[#8EA2BD]" dir="ltr">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                {app.appointmentDate}
                              </span>
                            </div>
                          </td>

                          {/* Patient */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span
                                className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold text-white shrink-0"
                                style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)" }}
                              >
                                {app.patient?.nameAr?.charAt(0) || <User className="w-4 h-4"/>}
                              </span>
                              <div>
                                <p className="text-[13px] font-bold text-white">{app.patient?.nameAr}</p>
                                <p className="text-[11px] text-[#8EA2BD] mt-0.5">{app.patient?.localCode}</p>
                              </div>
                            </div>
                          </td>

                          {/* Doctor */}
                          <td className="px-5 py-4">
                            {app.doctor ? (
                              <div className="flex items-center gap-2 text-[12px] text-white">
                                <Stethoscope className="w-3.5 h-3.5 text-[#0A6CFF]" />
                                د. {app.doctor.name}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#8EA2BD]">غير محدد</span>
                            )}
                          </td>

                          {/* Branch */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-[12px] text-white">
                              <MapPin className="w-3.5 h-3.5 text-[#8EA2BD]" />
                              {app.branch}
                            </div>
                          </td>

                          {/* Financials */}
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-[12px] font-bold text-white">
                                {app.services && app.services.length > 0 
                                  ? app.services.map((s:any) => s.service?.nameAr).join(', ')
                                  : "كشف عام"}
                              </span>
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="text-[#00D8D8] font-bold">${app.totalAmount} مطلوب</span>
                                <span className="text-[#8EA2BD]">/</span>
                                <span className="text-[#0A6CFF] font-bold">${app.paidAmount} مدفوع</span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-[11px] font-bold transition-all hover:brightness-110 border"
                                  style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color + '40' }}
                                >
                                  {cfg.label}
                                  <ChevronDown className="w-3 h-3 ml-1" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 border-[rgba(40,130,220,0.16)] bg-[#050C1F] text-white">
                                <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'in_reception')} className="text-[11px] hover:bg-[rgba(10,108,255,0.1)] focus:bg-[rgba(10,108,255,0.1)] focus:text-white">في الاستقبال</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'in_examination')} className="text-[11px] hover:bg-[rgba(139,92,246,0.1)] focus:bg-[rgba(139,92,246,0.1)] focus:text-white">في غرفة الكشف</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'completed')} className="text-[11px] hover:bg-[rgba(0,217,208,0.1)] focus:bg-[rgba(0,217,208,0.1)] focus:text-white">أنهى الكشف</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(app.id, 'no_show')} className="text-[11px] hover:bg-[rgba(255,77,96,0.1)] text-[#FF4D60] focus:bg-[rgba(255,77,96,0.1)] focus:text-[#FF4D60]">لم يحضر</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setPaymentAppId(app.id)}
                                className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(0,217,208,0.1)] text-[#8EA2BD] hover:text-[#00D8D8]"
                                title="تحصيل دفعة"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => cancelAppointment.mutate({ id: app.id, data: { reason: "طلب من المريض" }})}
                                className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(255,77,96,0.1)] text-[#8EA2BD] hover:text-[#FF4D60]"
                                title="إلغاء الموعد"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── Add Appointment Dialog ─── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[600px] border-[rgba(40,130,220,0.2)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="bg-gradient-to-l from-[#0A6CFF] to-[#00D8D8] px-6 py-4 flex items-center justify-between">
            <DialogTitle className="text-white font-extrabold text-[16px]">تسجيل حجز جديد</DialogTitle>
          </div>
          <div className="p-6">
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <FormField control={addForm.control} name="patientId" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">المريض *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                        <FormControl>
                          <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]">
                            <SelectValue placeholder="ابحث أو اختر المريض..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                          {patientsList?.patients?.map((p: any) => (
                            <SelectItem key={p.id} value={p.id.toString()} className="text-[12px] hover:bg-[rgba(10,108,255,0.1)] focus:bg-[rgba(10,108,255,0.1)]">
                              {p.nameAr} - {p.localCode}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[#FF4D60] text-[10px]" />
                    </FormItem>
                  )} />

                  <FormField control={addForm.control} name="branch" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الفرع *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                          {Array.isArray(branches) && branches.map((b:any) => <SelectItem key={b.id} value={b.name} className="text-[12px]">{b.name}</SelectItem>)}
                          {!branches && (
                            <>
                              <SelectItem value="غزة" className="text-[12px]">فرع غزة</SelectItem>
                              <SelectItem value="خان يونس" className="text-[12px]">فرع خان يونس</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />

                  <FormField control={addForm.control} name="doctorId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الطبيب (اختياري)</FormLabel>
                      <Input type="number" {...field} value={field.value || ""} onChange={e => field.onChange(parseInt(e.target.value) || null)} 
                        className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" 
                      />
                    </FormItem>
                  )} />

                  <FormField control={addForm.control} name="appointmentDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">تاريخ الحجز *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" style={{ colorScheme: "dark" }} />
                      </FormControl>
                      <FormMessage className="text-[#FF4D60] text-[10px]" />
                    </FormItem>
                  )} />

                  <FormField control={addForm.control} name="appointmentTime" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">وقت الحجز *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" style={{ colorScheme: "dark" }} />
                      </FormControl>
                      <FormMessage className="text-[#FF4D60] text-[10px]" />
                    </FormItem>
                  )} />

                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[rgba(40,130,220,0.16)] mt-6">
                  <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="text-[#8EA2BD] hover:text-white hover:bg-[rgba(255,255,255,0.05)] text-[12px] h-[38px] px-5">
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={createAppointment.isPending} className="bg-gradient-to-r from-[#0A6CFF] to-[#00D8D8] text-white text-[12px] h-[38px] px-6 font-bold hover:brightness-110 border-0">
                    {createAppointment.isPending ? "جاري الحفظ..." : "تأكيد الحجز"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Payment Dialog ─── */}
      <Dialog open={!!paymentAppId} onOpenChange={(o) => !o && setPaymentAppId(null)}>
        <DialogContent className="sm:max-w-[400px] border-[rgba(0,217,208,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(0,217,208,0.15)]">
          <div className="bg-[rgba(0,217,208,0.1)] border-b border-[rgba(0,217,208,0.2)] px-6 py-4 flex items-center gap-3">
            <div className="bg-[#00D8D8] rounded-full p-1.5 text-[#050C1F]">
              <Receipt className="w-4 h-4" />
            </div>
            <DialogTitle className="text-white font-extrabold text-[15px]">تحصيل دفعة مالية</DialogTitle>
          </div>
          <div className="p-6">
            <Form {...paymentForm}>
              <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
                <FormField control={paymentForm.control} name="amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">المبلغ (USD) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(0,217,208,0.2)] text-white text-[16px] font-bold h-[48px] text-center" dir="ltr" />
                    </FormControl>
                    <FormMessage className="text-[#FF4D60] text-[10px]" />
                  </FormItem>
                )} />

                <FormField control={paymentForm.control} name="paymentMethod" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">طريقة الدفع *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                        <SelectItem value="cash" className="text-[12px]">نقدي (Cash)</SelectItem>
                        <SelectItem value="credit_card" className="text-[12px]">بطاقة ائتمان</SelectItem>
                        <SelectItem value="bank_transfer" className="text-[12px]">حوالة بنكية</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <div className="pt-4 flex justify-end gap-3 border-t border-[rgba(40,130,220,0.16)] mt-6">
                  <Button type="button" variant="ghost" onClick={() => setPaymentAppId(null)} className="text-[#8EA2BD] hover:text-white hover:bg-[rgba(255,255,255,0.05)] text-[12px] h-[38px] px-5">
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={recordPayment.isPending} className="bg-[#00D8D8] text-[#050C1F] text-[12px] h-[38px] px-6 font-bold hover:brightness-110 border-0">
                    {recordPayment.isPending ? "جاري الدفع..." : "تأكيد الدفع"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
