import { useState } from "react";
import { 
  useListServices, useCreateService, useUpdateService, useDeleteService,
  useListServiceGroups, useCreateServiceGroup 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ProductsOwnershipBanner } from "@/components/products-ownership-banner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, Stethoscope, Clock, ShieldAlert, Check, X, Building2, Activity, Layers } from "lucide-react";

const serviceSchema = z.object({
  groupId: z.coerce.number().optional().nullable(),
  branch: z.string().min(1, "الفرع مطلوب"),
  name: z.string().min(2, "الاسم مطلوب"),
  isVisible: z.boolean().default(true),
  priceType: z.enum(['fixed', 'variable']),
  price: z.coerce.number().min(0, "السعر لا يمكن أن يكون سالباً"),
  units: z.coerce.number().min(1, "الوحدات يجب أن تكون 1 على الأقل"),
  patientFee: z.coerce.number().min(0, "رسوم المريض لا يمكن أن تكون سالبة"),
  durationMinutes: z.coerce.number().optional().nullable(),
  usesConsumables: z.boolean().default(false)
});

const groupSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  type: z.enum(['private', 'insurance']),
  validFrom: z.string().optional().nullable(),
  validTo: z.string().optional().nullable()
});

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Services() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

  const { data: services, isLoading: servicesLoading } = useListServices({});
  const { data: groups, isLoading: groupsLoading } = useListServiceGroups();

  const createService = useCreateService({ mutation: { onSuccess: () => { toast({ title: "تم الحفظ", description: "تم إضافة الخدمة بنجاح" }); queryClient.invalidateQueries(); setIsServiceDialogOpen(false); serviceForm.reset(); } } });
  const updateService = useUpdateService({ mutation: { onSuccess: () => { toast({ title: "تم التعديل", description: "تم تحديث بيانات الخدمة بنجاح" }); queryClient.invalidateQueries(); setIsServiceDialogOpen(false); setEditingServiceId(null); } } });
  const deleteService = useDeleteService({ mutation: { onSuccess: () => { toast({ title: "تم الحذف", description: "تم حذف الخدمة بنجاح" }); queryClient.invalidateQueries(); } } });
  const createGroup = useCreateServiceGroup({ mutation: { onSuccess: () => { toast({ title: "تم الحفظ", description: "تم إضافة المجموعة بنجاح" }); queryClient.invalidateQueries(); setIsGroupDialogOpen(false); groupForm.reset(); } } });

  const serviceForm = useForm<z.infer<typeof serviceSchema>>({ resolver: zodResolver(serviceSchema), defaultValues: { branch: "غزة", isVisible: true, priceType: "fixed", price: 0, units: 1, patientFee: 0, usesConsumables: false } });
  const groupForm = useForm<z.infer<typeof groupSchema>>({ resolver: zodResolver(groupSchema), defaultValues: { type: "private" } });

  const openEditService = (service: any) => { setEditingServiceId(service.id); serviceForm.reset({ groupId: service.groupId, branch: service.branch, name: service.name, isVisible: service.isVisible, priceType: service.priceType, price: service.price, units: service.units, patientFee: service.patientFee, durationMinutes: service.durationMinutes, usesConsumables: service.usesConsumables }); setIsServiceDialogOpen(true); };
  const onServiceSubmit = (values: z.infer<typeof serviceSchema>) => { if (editingServiceId) updateService.mutate({ id: editingServiceId, data: values }); else createService.mutate({ data: values }); };
  const onGroupSubmit = (values: z.infer<typeof groupSchema>) => { createGroup.mutate({ data: values }); };

  const inp = "bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]";
  const sel = "bg-[#061329] border-[rgba(40,130,220,0.16)] text-white";
  const lbl = "text-[#8EA2BD] text-[12px] font-bold";

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        <ProductsOwnershipBanner />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>قائمة الخدمات</h1>
            <p className="text-[13px] mt-2 font-medium text-[#8EA2BD]">إدارة الخدمات الطبية، الأسعار، والمجموعات التأمينية.</p>
          </div>
        </div>

        <Tabs defaultValue="services" className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 max-w-md bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[10px] h-[48px] p-1">
            <TabsTrigger value="services" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD]"><Stethoscope className="h-4 w-4 ml-2" /> الخدمات الطبية</TabsTrigger>
            <TabsTrigger value="groups" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD]"><Layers className="h-4 w-4 ml-2" /> المجموعات</TabsTrigger>
          </TabsList>

          {/* ─── SERVICES TAB ─── */}
          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => { setEditingServiceId(null); serviceForm.reset(); setIsServiceDialogOpen(true); }} className="flex items-center gap-2 h-[40px] px-6 rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] border-0" style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)", boxShadow: "0 4px 15px rgba(10,108,255,0.25)" }}>
                <Plus className="h-4 w-4" /> خدمة جديدة
              </button>
            </div>

            {servicesLoading ? (
              <div className="flex items-center justify-center py-20 text-[#00D8D8]"><Activity className="w-8 h-8 animate-spin" /></div>
            ) : (
              <div className="rounded-[14px] overflow-hidden" style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr style={{ background: "rgba(10,108,255,0.04)", borderBottom: "1px solid rgba(40,130,220,0.16)" }}>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الخدمة</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">المجموعة</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">السعر الكلي</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">رسوم المريض</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الوقت</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD] text-center">الحالة</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD] text-left">أدوات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "rgba(40,130,220,0.08)" }}>
                      {!Array.isArray(services) || services.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-12 text-[#8EA2BD] text-[13px]">لا يوجد خدمات مضافة</td></tr>
                      ) : (
                        services.map((service: any) => (
                          <tr key={service.id} className="transition-colors hover:bg-[rgba(10,108,255,0.02)]">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[13px] text-white">{service.name}</span>
                                {service.usesConsumables && <span className="bg-[rgba(10,108,255,0.1)] text-[#0A6CFF] px-2 py-0.5 rounded-[4px] border border-[rgba(10,108,255,0.2)] text-[10px]">مستلزمات</span>}
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-[11px] text-[#8EA2BD]"><Building2 className="h-3 w-3" /> {service.branch}</div>
                            </td>
                            <td className="px-5 py-4">{service.groupName ? <span className="bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] px-2 py-0.5 rounded-[4px] border border-[rgba(139,92,246,0.2)] text-[10px]">{service.groupName}</span> : <span className="text-[#8EA2BD] text-[11px]">-</span>}</td>
                            <td className="px-5 py-4 font-mono font-bold text-white text-[13px]" dir="ltr">₪ {service.price}</td>
                            <td className="px-5 py-4 font-mono font-bold text-[#00D8D8] text-[13px]" dir="ltr">₪ {service.patientFee}</td>
                            <td className="px-5 py-4">{service.durationMinutes ? <span className="flex items-center gap-1 text-[12px] text-[#8EA2BD]"><Clock className="h-3 w-3" /> {service.durationMinutes} د</span> : <span className="text-[#8EA2BD] text-[11px]">-</span>}</td>
                            <td className="px-5 py-4 text-center">{service.isVisible ? <Check className="h-4 w-4 text-[#00D8D8] mx-auto" /> : <X className="h-4 w-4 text-[#FF4D60] mx-auto" />}</td>
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => openEditService(service)} className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(10,108,255,0.1)] text-[#8EA2BD] hover:text-[#0A6CFF]"><Edit className="w-4 h-4" /></button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild><button className="h-8 w-8 rounded-md flex items-center justify-center transition-colors hover:bg-[rgba(255,77,96,0.1)] text-[#8EA2BD] hover:text-[#FF4D60]"><Trash2 className="w-4 h-4" /></button></AlertDialogTrigger>
                                  <AlertDialogContent className="sm:max-w-[400px] border-[rgba(255,77,96,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(255,77,96,0.15)]">
                                    <div className="bg-[rgba(255,77,96,0.1)] border-b border-[rgba(255,77,96,0.2)] px-6 py-4"><AlertDialogTitle className="text-white font-extrabold text-[15px]">حذف الخدمة</AlertDialogTitle></div>
                                    <div className="p-6">
                                      <AlertDialogDescription className="text-[#8EA2BD] text-[13px] mb-6">هل أنت متأكد من حذف خدمة ({service.name})؟</AlertDialogDescription>
                                      <div className="flex justify-end gap-3"><AlertDialogCancel className="bg-transparent text-[#8EA2BD] border-0 hover:text-white h-[38px] px-5">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => deleteService.mutate({ id: service.id })} className="bg-[#FF4D60] text-white h-[38px] px-6 font-bold border-0">نعم، احذف</AlertDialogAction></div>
                                    </div>
                                  </AlertDialogContent>
                                </AlertDialog>
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
          </TabsContent>

          {/* ─── GROUPS TAB ─── */}
          <TabsContent value="groups" className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => { groupForm.reset(); setIsGroupDialogOpen(true); }} className="flex items-center gap-2 h-[40px] px-6 rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] border-0" style={{ background: "linear-gradient(135deg, #8B5CF6, #0A6CFF)", boxShadow: "0 4px 15px rgba(139,92,246,0.25)" }}>
                <Plus className="h-4 w-4" /> مجموعة جديدة
              </button>
            </div>
            {groupsLoading ? (
              <div className="flex items-center justify-center py-20 text-[#8B5CF6]"><Activity className="w-8 h-8 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!Array.isArray(groups) || groups.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-[#8EA2BD] text-[13px] bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[14px]">لا يوجد مجموعات حالياً</div>
                ) : (
                  groups.map((group: any) => (
                    <div key={group.id} className="rounded-[14px] p-5 flex flex-col border border-[rgba(40,130,220,0.16)] bg-[#050C1F] transition-all hover:scale-[1.02]">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-[15px] text-white">{group.name}</h3>
                        {group.type === 'insurance' ? <span className="bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] px-2 py-0.5 rounded-[4px] border border-[rgba(139,92,246,0.2)] text-[10px] font-bold">تأمين</span> : <span className="bg-[rgba(10,108,255,0.1)] text-[#0A6CFF] px-2 py-0.5 rounded-[4px] border border-[rgba(10,108,255,0.2)] text-[10px] font-bold">خاص</span>}
                      </div>
                      <div className="space-y-2 text-[12px]">
                        {group.validFrom && <div className="flex justify-between text-[#8EA2BD]"><span>صالح من:</span><span dir="ltr">{new Date(group.validFrom).toLocaleDateString('ar-EG')}</span></div>}
                        {group.validTo && <div className="flex justify-between text-[#8EA2BD]"><span>صالح إلى:</span><span dir="ltr">{new Date(group.validTo).toLocaleDateString('ar-EG')}</span></div>}
                        {(!group.validFrom && !group.validTo) && <div className="text-[#8EA2BD] flex items-center gap-1.5 text-[11px]"><ShieldAlert className="h-3 w-3" /> فترة الصلاحية مفتوحة</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ─── Service Dialog ─── */}
        <Dialog open={isServiceDialogOpen} onOpenChange={(open) => { setIsServiceDialogOpen(open); if (!open) { setEditingServiceId(null); serviceForm.reset(); } }}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-[rgba(0,217,208,0.3)] bg-[#050C1F] p-0 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="bg-gradient-to-l from-[#0A6CFF] to-[#00D8D8] px-6 py-4"><DialogTitle className="text-white font-extrabold text-[16px]">{editingServiceId ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</DialogTitle></div>
            <div className="p-6">
              <Form {...serviceForm}>
                <form onSubmit={serviceForm.handleSubmit(onServiceSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={serviceForm.control} name="name" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel className={lbl}>اسم الخدمة *</FormLabel><FormControl><Input {...field} className={inp} /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>)} />
                    <FormField control={serviceForm.control} name="groupId" render={({ field }) => (<FormItem><FormLabel className={lbl}>المجموعة</FormLabel><Select onValueChange={v => field.onChange(v === "none" || !v ? null : parseInt(v))} value={field.value?.toString() ?? "none"}><FormControl><SelectTrigger className={inp}><SelectValue placeholder="بدون مجموعة" /></SelectTrigger></FormControl><SelectContent className={sel}><SelectItem value="none" className="text-[12px]">بدون مجموعة</SelectItem>{Array.isArray(groups) && groups.map(g => <SelectItem key={g.id} value={g.id.toString()} className="text-[12px]">{g.name}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                    <FormField control={serviceForm.control} name="branch" render={({ field }) => (<FormItem><FormLabel className={lbl}>الفرع</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className={inp}><SelectValue /></SelectTrigger></FormControl><SelectContent className={sel}><SelectItem value="غزة" className="text-[12px]">فرع غزة</SelectItem><SelectItem value="خان يونس" className="text-[12px]">فرع خان يونس</SelectItem></SelectContent></Select></FormItem>)} />
                    <FormField control={serviceForm.control} name="priceType" render={({ field }) => (<FormItem><FormLabel className={lbl}>نوع السعر</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className={inp}><SelectValue /></SelectTrigger></FormControl><SelectContent className={sel}><SelectItem value="fixed" className="text-[12px]">ثابت</SelectItem><SelectItem value="variable" className="text-[12px]">متغير</SelectItem></SelectContent></Select></FormItem>)} />
                    <FormField control={serviceForm.control} name="price" render={({ field }) => (<FormItem><FormLabel className={lbl}>السعر الكلي (₪) *</FormLabel><FormControl><Input type="number" step="0.5" {...field} className={inp + " font-mono text-left"} dir="ltr" /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>)} />
                    <FormField control={serviceForm.control} name="patientFee" render={({ field }) => (<FormItem><FormLabel className={lbl}>يتحمله المريض (₪) *</FormLabel><FormControl><Input type="number" step="0.5" {...field} className={inp + " font-mono text-left"} dir="ltr" /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>)} />
                    <FormField control={serviceForm.control} name="units" render={({ field }) => (<FormItem><FormLabel className={lbl}>الوحدات</FormLabel><FormControl><Input type="number" {...field} className={inp} /></FormControl></FormItem>)} />
                    <FormField control={serviceForm.control} name="durationMinutes" render={({ field }) => (<FormItem><FormLabel className={lbl}>المدة المتوقعة (دقائق)</FormLabel><FormControl><Input type="number" {...field} value={field.value || ''} className={inp} /></FormControl></FormItem>)} />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-[10px] border border-[rgba(40,130,220,0.16)] bg-[rgba(6,19,41,0.4)]">
                    <FormField control={serviceForm.control} name="isVisible" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg gap-4"><div className="space-y-0.5"><FormLabel className="text-white text-[12px] font-bold">تفعيل الخدمة</FormLabel><FormDescription className="text-[#8EA2BD] text-[10px]">هل تظهر في قائمة الحجوزات؟</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                    <FormField control={serviceForm.control} name="usesConsumables" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg gap-4"><div className="space-y-0.5"><FormLabel className="text-white text-[12px] font-bold">تستهلك مستلزمات؟</FormLabel><FormDescription className="text-[#8EA2BD] text-[10px]">يتم ربطها مع المخزون لاحقاً</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
                  </div>
                  <div className="pt-4 flex justify-end gap-3 border-t border-[rgba(40,130,220,0.16)]">
                    <Button type="button" variant="ghost" onClick={() => setIsServiceDialogOpen(false)} className="text-[#8EA2BD] hover:text-white border-0 text-[12px]">إلغاء</Button>
                    <Button type="submit" disabled={createService.isPending || updateService.isPending} className="bg-[#00D8D8] text-[#050C1F] text-[12px] h-[38px] px-6 font-bold hover:brightness-110 border-0">{createService.isPending || updateService.isPending ? "جاري الحفظ..." : "حفظ الخدمة"}</Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>

        {/* ─── Group Dialog ─── */}
        <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
          <DialogContent className="sm:max-w-[400px] border-[rgba(139,92,246,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.15)]">
            <div className="bg-[rgba(139,92,246,0.1)] border-b border-[rgba(139,92,246,0.2)] px-6 py-4 flex items-center gap-3"><div className="bg-[#8B5CF6] rounded-full p-1.5 text-white"><Layers className="w-4 h-4" /></div><DialogTitle className="text-white font-extrabold text-[15px]">إضافة مجموعة خدمات</DialogTitle></div>
            <div className="p-6">
              <Form {...groupForm}>
                <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
                  <FormField control={groupForm.control} name="name" render={({ field }) => (<FormItem><FormLabel className={lbl}>اسم المجموعة *</FormLabel><FormControl><Input placeholder="مثال: نقابة المهندسين" {...field} className={inp} /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>)} />
                  <FormField control={groupForm.control} name="type" render={({ field }) => (<FormItem><FormLabel className={lbl}>النوع</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className={inp}><SelectValue /></SelectTrigger></FormControl><SelectContent className={sel}><SelectItem value="private" className="text-[12px]">خاص / مؤسسة خاصة</SelectItem><SelectItem value="insurance" className="text-[12px]">تأمين صحي</SelectItem></SelectContent></Select></FormItem>)} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={groupForm.control} name="validFrom" render={({ field }) => (<FormItem><FormLabel className={lbl}>صالح من</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} className={inp} style={{ colorScheme: "dark" }} /></FormControl></FormItem>)} />
                    <FormField control={groupForm.control} name="validTo" render={({ field }) => (<FormItem><FormLabel className={lbl}>صالح إلى</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} className={inp} style={{ colorScheme: "dark" }} /></FormControl></FormItem>)} />
                  </div>
                  <div className="pt-4 flex justify-end gap-3 mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsGroupDialogOpen(false)} className="text-[#8EA2BD] hover:text-white border-0 text-[12px]">إلغاء</Button>
                    <Button type="submit" disabled={createGroup.isPending} className="bg-[#8B5CF6] text-white text-[12px] h-[38px] px-6 font-bold hover:brightness-110 border-0">حفظ المجموعة</Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}