import { useState } from "react";
import { 
  useGetSystemSettings, useUpdateSystemSettings, 
  useGetTaxSettings, useUpdateTaxSettings,
  useListBranches, useListReferralProviders, useCreateReferralProvider,
  useListWorkingDays, useUpsertWorkingDays,
  useListHolidays, useCreateHoliday, useDeleteHoliday
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings as SettingsIcon, Receipt, Network, Save, Plus, CalendarDays, Trash2, Activity } from "lucide-react";

const providerSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

const holSchema = z.object({
  date: z.string().min(1, "التاريخ مطلوب"),
  title: z.string().min(2, "العنوان مطلوب"),
  branch: z.string().optional()
});

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const BRANCHES = ["فرع غزة", "فرع خان يونس"];

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: systemSettings, isLoading: sysLoading } = useGetSystemSettings();
  const { data: taxSettings, isLoading: taxLoading } = useGetTaxSettings();
  const { data: providers, isLoading: provLoading } = useListReferralProviders();
  const { data: workingDays, isLoading: wdLoading } = useListWorkingDays();
  const { data: holidays, isLoading: holLoading } = useListHolidays();

  const updateSystem = useUpdateSystemSettings({ mutation: { onSuccess: () => { toast({ title: "تم الحفظ", description: "تم تحديث إعدادات النظام" }); queryClient.invalidateQueries(); } } });
  const updateTax = useUpdateTaxSettings({ mutation: { onSuccess: () => { toast({ title: "تم الحفظ", description: "تم تحديث الإعدادات الضريبية" }); queryClient.invalidateQueries(); } } });
  const createProvider = useCreateReferralProvider({ mutation: { onSuccess: () => { toast({ title: "تم الإضافة", description: "تم إضافة جهة الإحالة بنجاح" }); queryClient.invalidateQueries(); setIsProvOpen(false); provForm.reset(); } } });
  const upsertWD = useUpsertWorkingDays({ mutation: { onSuccess: () => { toast({ title: "تم الحفظ", description: "تم تحديث أيام العمل" }); queryClient.invalidateQueries(); } } });
  const createHoliday = useCreateHoliday({ mutation: { onSuccess: () => { toast({ title: "تم الإضافة", description: "تم إضافة الإجازة بنجاح" }); queryClient.invalidateQueries(); setIsHolOpen(false); holForm.reset(); } } });
  const deleteHoliday = useDeleteHoliday({ mutation: { onSuccess: () => { toast({ title: "تم الحذف", description: "تم حذف الإجازة" }); queryClient.invalidateQueries(); } } });

  const [sysState, setSysState] = useState({ activeBranch: "غزة", appointmentOrder: "by_time", autoRefreshMinutes: 5, displayBranch: "" });
  const [taxState, setTaxState] = useState({ taxType: "on_request", taxTitle: "ضريبة القيمة المضافة", taxPercentage: 16 });
  const [schedule, setSchedule] = useState<Record<string, Record<number, { isWorking: boolean; openTime: string; closeTime: string }>>>({});
  
  const [isProvOpen, setIsProvOpen] = useState(false);
  const [isHolOpen, setIsHolOpen] = useState(false);

  const provForm = useForm<z.infer<typeof providerSchema>>({ resolver: zodResolver(providerSchema), defaultValues: { name: "", specialty: "", phone: "", address: "" } });
  const holForm = useForm<z.infer<typeof holSchema>>({ resolver: zodResolver(holSchema), defaultValues: { date: "", title: "", branch: "__all__" } });

  const onSaveSchedule = () => {
    const data: any[] = [];
    Object.entries(schedule).forEach(([branch, days]) => {
      Object.entries(days).forEach(([d, v]) => {
        data.push({ branch, dayOfWeek: parseInt(d), isWorking: v.isWorking, openTime: v.openTime, closeTime: v.closeTime });
      });
    });
    upsertWD.mutate({ data });
  };

  const inp = "bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]";
  const sel = "bg-[#061329] border-[rgba(40,130,220,0.16)] text-white";
  const lbl = "text-[#8EA2BD] text-[12px] font-bold";

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              <SettingsIcon className="h-6 w-6 text-[#0A6CFF]" /> الإعدادات
            </h1>
            <p className="text-[13px] mt-2 font-medium text-[#8EA2BD]">
              تخصيص النظام، الضرائب، الفروع، والمواعيد.
            </p>
          </div>
        </div>

        <Tabs defaultValue="system" className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 lg:grid-cols-4 max-w-3xl bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[10px] h-auto p-1 gap-1">
            <TabsTrigger value="system" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD] py-2.5"><SettingsIcon className="h-4 w-4 ml-2" /> إعدادات النظام</TabsTrigger>
            <TabsTrigger value="tax" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD] py-2.5"><Receipt className="h-4 w-4 ml-2" /> الضرائب والفواتير</TabsTrigger>
            <TabsTrigger value="providers" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD] py-2.5"><Network className="h-4 w-4 ml-2" /> جهات الإحالة</TabsTrigger>
            <TabsTrigger value="schedule" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD] py-2.5"><CalendarDays className="h-4 w-4 ml-2" /> جداول الدوام</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-4">
            <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
              <div className="bg-[rgba(10,108,255,0.04)] border-b border-[rgba(40,130,220,0.16)] p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-[15px] text-white">إعدادات النظام العامة</h2>
                  <p className="text-[11px] text-[#8EA2BD] mt-1">تخصيص العرض والتشغيل</p>
                </div>
                <button onClick={() => updateSystem.mutate({ data: sysState })} disabled={updateSystem.isPending} className="flex items-center gap-2 h-[36px] px-5 rounded-[8px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] hover:brightness-110 border-0 shadow-[0_4px_15px_rgba(10,108,255,0.25)]" style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)" }}><Save className="h-4 w-4" /> حفظ</button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={lbl}>الفرع الافتراضي للمستخدم</label>
                  <Select value={sysState.activeBranch} onValueChange={v => setSysState(s => ({ ...s, activeBranch: v }))}>
                    <SelectTrigger className={inp}><SelectValue /></SelectTrigger>
                    <SelectContent className={sel}><SelectItem value="غزة" className="text-[12px]">فرع غزة</SelectItem><SelectItem value="خان يونس" className="text-[12px]">فرع خان يونس</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className={lbl}>ترتيب عرض المواعيد (في شاشة الاستقبال)</label>
                  <Select value={sysState.appointmentOrder} onValueChange={v => setSysState(s => ({ ...s, appointmentOrder: v }))}>
                    <SelectTrigger className={inp}><SelectValue /></SelectTrigger>
                    <SelectContent className={sel}><SelectItem value="by_time" className="text-[12px]">حسب وقت الحجز</SelectItem><SelectItem value="by_arrival" className="text-[12px]">حسب أولوية الحضور (First Come First Serve)</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className={lbl}>تحديث الشاشات تلقائياً كل (دقائق)</label>
                  <Input type="number" min="1" value={sysState.autoRefreshMinutes} onChange={e => setSysState(s => ({ ...s, autoRefreshMinutes: parseInt(e.target.value) || 5 }))} className={inp} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tax" className="space-y-4">
            <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
              <div className="bg-[rgba(255,200,87,0.04)] border-b border-[rgba(40,130,220,0.16)] p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-[15px] text-white flex items-center gap-2"><Receipt className="h-4 w-4 text-[#FFC857]" /> إعدادات الضرائب</h2>
                </div>
                <button onClick={() => updateTax.mutate({ data: taxState })} disabled={updateTax.isPending} className="flex items-center gap-2 h-[36px] px-5 rounded-[8px] text-[12px] font-bold text-[#050C1F] transition-all hover:scale-[1.02] hover:brightness-110 border-0 shadow-[0_4px_15px_rgba(255,200,87,0.25)] bg-[#FFC857]"><Save className="h-4 w-4" /> حفظ</button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={lbl}>طريقة تطبيق الضريبة</label>
                  <Select value={taxState.taxType} onValueChange={v => setTaxState(s => ({ ...s, taxType: v }))}>
                    <SelectTrigger className={inp}><SelectValue /></SelectTrigger>
                    <SelectContent className={sel}>
                      <SelectItem value="always" className="text-[12px]">تطبق دائماً على جميع الفواتير</SelectItem>
                      <SelectItem value="on_request" className="text-[12px]">عند طلب فاتورة ضريبية فقط</SelectItem>
                      <SelectItem value="none" className="text-[12px]">معفاة (لا توجد ضريبة)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className={lbl}>اسم الضريبة الظاهر</label>
                  <Input value={taxState.taxTitle} onChange={e => setTaxState(s => ({ ...s, taxTitle: e.target.value }))} className={inp} disabled={taxState.taxType === 'none'} />
                </div>
                <div className="space-y-2">
                  <label className={lbl}>نسبة الضريبة (%)</label>
                  <Input type="number" min="0" max="100" value={taxState.taxPercentage} onChange={e => setTaxState(s => ({ ...s, taxPercentage: parseFloat(e.target.value) || 0 }))} className={inp} disabled={taxState.taxType === 'none'} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
              <div className="bg-[rgba(139,92,246,0.04)] border-b border-[rgba(40,130,220,0.16)] p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-[15px] text-white">جهات الإحالة الخارجية</h2>
                  <p className="text-[11px] text-[#8EA2BD] mt-1">الأطباء والمراكز التي تحول المرضى لعيادتك</p>
                </div>
                <button onClick={() => { provForm.reset(); setIsProvOpen(true); }} className="flex items-center gap-2 h-[36px] px-5 rounded-[8px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] border-0 shadow-[0_4px_15px_rgba(139,92,246,0.25)]" style={{ background: "linear-gradient(135deg, #8B5CF6, #0A6CFF)" }}><Plus className="h-4 w-4" /> إضافة جهة</button>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-[rgba(6,19,41,0.2)] border-b border-[rgba(40,130,220,0.08)]">
                      <th className="px-5 py-3 text-[11px] font-bold text-[#8EA2BD]">الاسم</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-[#8EA2BD]">التخصص</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-[#8EA2BD]">الهاتف</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-[#8EA2BD]">العنوان</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(40,130,220,0.08)]">
                    {provLoading ? (
                      <tr><td colSpan={4} className="py-10 text-center"><Activity className="w-6 h-6 animate-spin text-[#8B5CF6] mx-auto" /></td></tr>
                    ) : !Array.isArray(providers) || providers.length === 0 ? (
                      <tr><td colSpan={4} className="py-10 text-center text-[#8EA2BD] text-[13px]">لا يوجد جهات مضافة</td></tr>
                    ) : (
                      providers.map((p: any) => (
                        <tr key={p.id} className="hover:bg-[rgba(10,108,255,0.02)] transition-colors">
                          <td className="px-5 py-3 text-[13px] font-bold text-white">{p.name}</td>
                          <td className="px-5 py-3 text-[12px] text-[#8EA2BD]">{p.specialty || '-'}</td>
                          <td className="px-5 py-3 text-[12px] text-[#8EA2BD] font-mono" dir="ltr">{p.phone || '-'}</td>
                          <td className="px-5 py-3 text-[12px] text-[#8EA2BD]">{p.address || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <Dialog open={isProvOpen} onOpenChange={setIsProvOpen}>
              <DialogContent className="sm:max-w-[400px] border-[rgba(139,92,246,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.15)]">
                <div className="bg-[rgba(139,92,246,0.1)] border-b border-[rgba(139,92,246,0.2)] px-6 py-4 flex items-center gap-3"><div className="bg-[#8B5CF6] rounded-full p-1.5 text-white"><Network className="w-4 h-4" /></div><DialogTitle className="text-white font-extrabold text-[15px]">إضافة جهة إحالة جديدة</DialogTitle></div>
                <div className="p-6">
                  <Form {...provForm}>
                    <form onSubmit={provForm.handleSubmit(data => createProvider.mutate({ data }))} className="space-y-4">
                      <FormField control={provForm.control} name="name" render={({ field }) => (<FormItem><FormLabel className={lbl}>الاسم *</FormLabel><FormControl><Input {...field} className={inp} /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>)} />
                      <FormField control={provForm.control} name="specialty" render={({ field }) => (<FormItem><FormLabel className={lbl}>التخصص</FormLabel><FormControl><Input {...field} className={inp} /></FormControl></FormItem>)} />
                      <FormField control={provForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel className={lbl}>الهاتف</FormLabel><FormControl><Input dir="ltr" {...field} className={inp + " text-left font-mono"} /></FormControl></FormItem>)} />
                      <FormField control={provForm.control} name="address" render={({ field }) => (<FormItem><FormLabel className={lbl}>العنوان</FormLabel><FormControl><Input {...field} className={inp} /></FormControl></FormItem>)} />
                      <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-[rgba(40,130,220,0.16)]">
                        <Button type="button" variant="ghost" onClick={() => setIsProvOpen(false)} className="text-[#8EA2BD] hover:text-white border-0 text-[12px]">إلغاء</Button>
                        <Button type="submit" disabled={createProvider.isPending} className="bg-[#8B5CF6] text-white text-[12px] h-[38px] px-6 font-bold hover:brightness-110 border-0">إضافة</Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
              <div className="bg-[rgba(0,217,208,0.04)] border-b border-[rgba(40,130,220,0.16)] p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-[15px] text-white">أيام العمل لكل فرع</h2>
                  <p className="text-[11px] text-[#8EA2BD] mt-1">حدد أيام وساعات عمل كل فرع</p>
                </div>
                <button onClick={onSaveSchedule} disabled={upsertWD.isPending} className="flex items-center gap-2 h-[36px] px-5 rounded-[8px] text-[12px] font-bold text-[#050C1F] bg-[#00D8D8] transition-all hover:scale-[1.02] hover:brightness-110 border-0 shadow-[0_4px_15px_rgba(0,217,208,0.25)]"><Save className="h-4 w-4" /> حفظ الجدول</button>
              </div>
              <div className="p-6">
                {wdLoading ? <div className="flex justify-center py-10"><Activity className="w-8 h-8 animate-spin text-[#00D8D8]" /></div> : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {BRANCHES.map(branch => (
                      <div key={branch}>
                        <h3 className="text-[14px] font-bold text-white mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#0A6CFF]"></span>{branch}</h3>
                        <div className="space-y-3">
                          {DAY_NAMES.map((dayName, d) => {
                            const entry = schedule[branch]?.[d] ?? { isWorking: d < 5, openTime: "09:00", closeTime: "17:00" };
                            return (
                              <div key={d} className={`flex items-center gap-4 p-4 rounded-[10px] border transition-colors ${entry.isWorking ? 'bg-[rgba(6,19,41,0.4)] border-[rgba(40,130,220,0.16)]' : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]'}`}>
                                <Switch checked={entry.isWorking} onCheckedChange={val => setSchedule(s => ({ ...s, [branch]: { ...s[branch], [d]: { ...entry, isWorking: val } } }))} />
                                <span className={`w-20 text-[12px] font-bold ${!entry.isWorking ? 'text-[#8EA2BD]' : 'text-white'}`}>{dayName}</span>
                                {entry.isWorking ? (
                                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-[#8EA2BD]">من</span>
                                      <Input type="time" value={entry.openTime} className={`${inp} w-[100px] text-center font-mono`} style={{ colorScheme: "dark" }} onChange={e => setSchedule(s => ({ ...s, [branch]: { ...s[branch], [d]: { ...entry, openTime: e.target.value } } }))} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-[#8EA2BD]">إلى</span>
                                      <Input type="time" value={entry.closeTime} className={`${inp} w-[100px] text-center font-mono`} style={{ colorScheme: "dark" }} onChange={e => setSchedule(s => ({ ...s, [branch]: { ...s[branch], [d]: { ...entry, closeTime: e.target.value } } }))} />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-[12px] text-[#FF4D60] font-bold">إجازة</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
              <div className="bg-[rgba(255,77,96,0.04)] border-b border-[rgba(40,130,220,0.16)] p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-[15px] text-white">الإجازات والأعياد</h2>
                  <p className="text-[11px] text-[#8EA2BD] mt-1">أضف الإجازات الرسمية والمناسبات الخاصة</p>
                </div>
                <button onClick={() => { holForm.reset(); setIsHolOpen(true); }} className="flex items-center gap-2 h-[36px] px-5 rounded-[8px] text-[12px] font-bold text-white bg-[rgba(255,77,96,0.1)] hover:bg-[rgba(255,77,96,0.2)] text-[#FF4D60] border border-[rgba(255,77,96,0.2)] transition-all"><Plus className="h-4 w-4" /> إضافة إجازة</button>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-[rgba(6,19,41,0.2)] border-b border-[rgba(40,130,220,0.08)]">
                      <th className="px-5 py-3 text-[11px] font-bold text-[#8EA2BD]">التاريخ</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-[#8EA2BD]">العنوان</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-[#8EA2BD]">الفرع</th>
                      <th className="px-5 py-3 w-[80px]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(40,130,220,0.08)]">
                    {holLoading ? (
                      <tr><td colSpan={4} className="py-10 text-center"><Activity className="w-6 h-6 animate-spin text-[#FF4D60] mx-auto" /></td></tr>
                    ) : !Array.isArray(holidays) || holidays.length === 0 ? (
                      <tr><td colSpan={4} className="py-10 text-center text-[#8EA2BD] text-[13px]">لا يوجد إجازات مضافة</td></tr>
                    ) : holidays.map((h: any) => (
                      <tr key={h.id} className="hover:bg-[rgba(10,108,255,0.02)] transition-colors">
                        <td className="px-5 py-3 text-[12px] font-mono text-white" dir="ltr">{h.date}</td>
                        <td className="px-5 py-3 text-[13px] font-bold text-[#FF4D60]">{h.title}</td>
                        <td className="px-5 py-3 text-[12px] text-[#8EA2BD]">{h.branch || 'جميع الفروع'}</td>
                        <td className="px-5 py-3">
                          <button className="w-7 h-7 flex items-center justify-center rounded bg-[rgba(255,255,255,0.05)] text-[#8EA2BD] hover:bg-[rgba(255,77,96,0.1)] hover:text-[#FF4D60] transition-colors" onClick={() => deleteHoliday.mutate({ id: h.id })}><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Dialog open={isHolOpen} onOpenChange={setIsHolOpen}>
              <DialogContent className="sm:max-w-[400px] border-[rgba(255,77,96,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(255,77,96,0.15)]">
                <div className="bg-[rgba(255,77,96,0.1)] border-b border-[rgba(255,77,96,0.2)] px-6 py-4 flex items-center gap-3"><div className="bg-[#FF4D60] rounded-full p-1.5 text-white"><CalendarDays className="w-4 h-4" /></div><DialogTitle className="text-white font-extrabold text-[15px]">إضافة إجازة أو عطلة</DialogTitle></div>
                <div className="p-6">
                  <Form {...holForm}>
                    <form onSubmit={holForm.handleSubmit(data => createHoliday.mutate({ data: { date: data.date, title: data.title, branch: (!data.branch || data.branch === "__all__") ? null : data.branch } }))} className="space-y-4">
                      <FormField control={holForm.control} name="title" render={({ field }) => (<FormItem><FormLabel className={lbl}>العنوان *</FormLabel><FormControl><Input placeholder="مثال: عيد الفطر المبارك" {...field} className={inp} /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>)} />
                      <FormField control={holForm.control} name="date" render={({ field }) => (<FormItem><FormLabel className={lbl}>التاريخ *</FormLabel><FormControl><Input type="date" {...field} className={inp} style={{ colorScheme: "dark" }} /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>)} />
                      <FormField control={holForm.control} name="branch" render={({ field }) => (
                        <FormItem><FormLabel className={lbl}>يطبق على</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "__all__"}>
                            <FormControl><SelectTrigger className={inp}><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent className={sel}>
                              <SelectItem value="__all__" className="text-[12px]">جميع الفروع</SelectItem>
                              <SelectItem value="فرع غزة" className="text-[12px]">فرع غزة</SelectItem>
                              <SelectItem value="فرع خان يونس" className="text-[12px]">فرع خان يونس</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-[rgba(40,130,220,0.16)]">
                        <Button type="button" variant="ghost" onClick={() => setIsHolOpen(false)} className="text-[#8EA2BD] hover:text-white border-0 text-[12px]">إلغاء</Button>
                        <Button type="submit" disabled={createHoliday.isPending} className="bg-[#FF4D60] text-white text-[12px] h-[38px] px-6 font-bold hover:brightness-110 border-0">إضافة الإجازة</Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>

          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}