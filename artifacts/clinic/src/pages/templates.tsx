import { useState } from "react";
import { 
  useListPrescriptionTemplates, useCreatePrescriptionTemplate, 
  useUpdatePrescriptionTemplate, useDeletePrescriptionTemplate,
  useListInvestigationTemplates, useCreateInvestigationTemplate 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, FileText, Pill, Microscope, Activity } from "lucide-react";

const rxSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  content: z.string().min(5, "محتوى الوصفة مطلوب"),
  category: z.string().optional()
});

const invSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  type: z.enum(['labs', 'imaging', 'endoscopy', 'pathology']),
  testInput: z.string().optional()
});

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Templates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRxDialogOpen, setIsRxDialogOpen] = useState(false);
  const [isInvDialogOpen, setIsInvDialogOpen] = useState(false);
  const [editingRxId, setEditingRxId] = useState<number | null>(null);
  const [invTests, setInvTests] = useState<string[]>([]);

  const { data: rxTemplates, isLoading: rxLoading } = useListPrescriptionTemplates();
  const { data: invTemplates, isLoading: invLoading } = useListInvestigationTemplates();

  const createRx = useCreatePrescriptionTemplate({
    mutation: {
      onSuccess: () => { toast({ title: "تم الحفظ", description: "تم إضافة قالب الوصفة بنجاح" }); queryClient.invalidateQueries(); setIsRxDialogOpen(false); rxForm.reset(); }
    }
  });

  const updateRx = useUpdatePrescriptionTemplate({
    mutation: {
      onSuccess: () => { toast({ title: "تم التعديل", description: "تم تحديث القالب بنجاح" }); queryClient.invalidateQueries(); setIsRxDialogOpen(false); setEditingRxId(null); }
    }
  });

  const deleteRx = useDeletePrescriptionTemplate({
    mutation: {
      onSuccess: () => { toast({ title: "تم الحذف", description: "تم حذف قالب الوصفة بنجاح" }); queryClient.invalidateQueries(); }
    }
  });

  const createInv = useCreateInvestigationTemplate({
    mutation: {
      onSuccess: () => { toast({ title: "تم الحفظ", description: "تم إضافة قالب الطلبات بنجاح" }); queryClient.invalidateQueries(); setIsInvDialogOpen(false); invForm.reset(); setInvTests([]); }
    }
  });

  const rxForm = useForm<z.infer<typeof rxSchema>>({ resolver: zodResolver(rxSchema), defaultValues: { name: "", content: "", category: "" } });
  const invForm = useForm<z.infer<typeof invSchema>>({ resolver: zodResolver(invSchema), defaultValues: { name: "", type: "labs", testInput: "" } });

  const onRxSubmit = (values: z.infer<typeof rxSchema>) => {
    if (editingRxId) updateRx.mutate({ id: editingRxId, data: values });
    else createRx.mutate({ data: values });
  };

  const onInvSubmit = (values: z.infer<typeof invSchema>) => {
    if (invTests.length === 0) {
      toast({ title: "خطأ", description: "يجب إضافة فحص واحد على الأقل", variant: "destructive" });
      return;
    }
    createInv.mutate({ data: { name: values.name, type: values.type, tests: invTests } });
  };

  const openEditRx = (rx: any) => {
    setEditingRxId(rx.id);
    rxForm.reset({ name: rx.name, content: rx.content, category: rx.category || "" });
    setIsRxDialogOpen(true);
  };

  const inp = "bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]";
  const sel = "bg-[#061329] border-[rgba(40,130,220,0.16)] text-white";
  const lbl = "text-[#8EA2BD] text-[12px] font-bold";

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              <FileText className="h-6 w-6 text-[#0A6CFF]" /> القوالب الطبية
            </h1>
            <p className="text-[13px] mt-2 font-medium text-[#8EA2BD]">
              إدارة النماذج الجاهزة للوصفات والطلبات لتسريع العمل.
            </p>
          </div>
        </div>

        <Tabs defaultValue="prescriptions" className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 max-w-md bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[10px] h-[48px] p-1">
            <TabsTrigger value="prescriptions" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD]"><Pill className="h-4 w-4 ml-2" /> الوصفات الطبية</TabsTrigger>
            <TabsTrigger value="investigations" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD]"><Microscope className="h-4 w-4 ml-2" /> طلبات الفحص</TabsTrigger>
          </TabsList>

          {/* PRESCRIPTIONS TAB */}
          <TabsContent value="prescriptions" className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => { setEditingRxId(null); rxForm.reset(); setIsRxDialogOpen(true); }} className="flex items-center gap-2 h-[40px] px-6 rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] border-0 shadow-[0_4px_15px_rgba(10,108,255,0.25)]" style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)" }}>
                <Plus className="h-4 w-4" /> قالب وصفة جديد
              </button>
            </div>
            
            {rxLoading ? (
              <div className="flex items-center justify-center py-20 text-[#00D8D8]"><Activity className="w-8 h-8 animate-spin" /></div>
            ) : !Array.isArray(rxTemplates) || rxTemplates.length === 0 ? (
              <div className="text-center py-12 text-[#8EA2BD] text-[13px] bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[14px]">لا يوجد قوالب مضافة</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rxTemplates.map((rx: any) => (
                  <div key={rx.id} className="rounded-[14px] p-5 flex flex-col border border-[rgba(40,130,220,0.16)] bg-[#050C1F] transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-[15px] text-white flex items-center gap-2"><Pill className="h-4 w-4 text-[#00D8D8]" /> {rx.name}</h3>
                        {rx.category && <span className="bg-[rgba(10,108,255,0.1)] text-[#0A6CFF] px-2 py-0.5 rounded-[4px] border border-[rgba(10,108,255,0.2)] text-[10px] mt-2 inline-block font-bold">{rx.category}</span>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEditRx(rx)} className="h-7 w-7 rounded flex items-center justify-center text-[#8EA2BD] hover:text-[#00D8D8] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(0,217,208,0.1)] transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><button className="h-7 w-7 rounded flex items-center justify-center text-[#8EA2BD] hover:text-[#FF4D60] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,77,96,0.1)] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button></AlertDialogTrigger>
                          <AlertDialogContent className="sm:max-w-[400px] border-[rgba(255,77,96,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(255,77,96,0.15)]">
                            <div className="bg-[rgba(255,77,96,0.1)] border-b border-[rgba(255,77,96,0.2)] px-6 py-4"><AlertDialogTitle className="text-white font-extrabold text-[15px]">حذف القالب</AlertDialogTitle></div>
                            <div className="p-6">
                              <AlertDialogDescription className="text-[#8EA2BD] text-[13px] mb-6">هل أنت متأكد من حذف قالب ({rx.name})؟</AlertDialogDescription>
                              <div className="flex justify-end gap-3"><AlertDialogCancel className="bg-transparent text-[#8EA2BD] border-0 hover:text-white h-[38px] px-5">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => deleteRx.mutate({ id: rx.id })} className="bg-[#FF4D60] text-white h-[38px] px-6 font-bold border-0">نعم، احذف</AlertDialogAction></div>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="text-[12px] text-[#8EA2BD] whitespace-pre-wrap flex-1 bg-[rgba(6,19,41,0.4)] p-3 rounded-lg border border-[rgba(40,130,220,0.08)] leading-relaxed">
                      {rx.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* INVESTIGATIONS TAB */}
          <TabsContent value="investigations" className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => { invForm.reset(); setInvTests([]); setIsInvDialogOpen(true); }} className="flex items-center gap-2 h-[40px] px-6 rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] border-0 shadow-[0_4px_15px_rgba(139,92,246,0.25)]" style={{ background: "linear-gradient(135deg, #8B5CF6, #0A6CFF)" }}>
                <Plus className="h-4 w-4" /> قالب فحوصات جديد
              </button>
            </div>
            
            {invLoading ? (
              <div className="flex items-center justify-center py-20 text-[#8B5CF6]"><Activity className="w-8 h-8 animate-spin" /></div>
            ) : !Array.isArray(invTemplates) || invTemplates.length === 0 ? (
              <div className="text-center py-12 text-[#8EA2BD] text-[13px] bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[14px]">لا يوجد قوالب مضافة</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invTemplates.map((inv: any) => (
                  <div key={inv.id} className="rounded-[14px] p-5 flex flex-col border border-[rgba(40,130,220,0.16)] bg-[#050C1F] transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-[15px] text-white flex items-center gap-2"><Microscope className="h-4 w-4 text-[#8B5CF6]" /> {inv.name}</h3>
                        <span className="bg-[rgba(139,92,246,0.1)] text-[#8B5CF6] px-2 py-0.5 rounded-[4px] border border-[rgba(139,92,246,0.2)] text-[10px] mt-2 inline-block font-bold">
                          {inv.type === 'labs' ? 'تحاليل مخبرية' : inv.type === 'imaging' ? 'تصوير طبي' : inv.type === 'endoscopy' ? 'مناظير' : 'فحص أنسجة'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.isArray(inv.tests) && inv.tests.map((test: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-[rgba(6,19,41,0.6)] border border-[rgba(40,130,220,0.16)] text-[#8EA2BD] text-[11px] rounded-md font-mono" dir="ltr">{test}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={isRxDialogOpen} onOpenChange={setIsRxDialogOpen}>
          <DialogContent className="sm:max-w-[500px] border-[rgba(0,217,208,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <div className="bg-gradient-to-l from-[#0A6CFF] to-[#00D8D8] px-6 py-4"><DialogTitle className="text-white font-extrabold text-[16px]">{editingRxId ? 'تعديل قالب الوصفة' : 'إضافة قالب وصفة جديد'}</DialogTitle></div>
            <div className="p-6">
              <Form {...rxForm}>
                <form onSubmit={rxForm.handleSubmit(onRxSubmit)} className="space-y-4">
                  <FormField control={rxForm.control} name="name" render={({ field }) => (<FormItem><FormLabel className={lbl}>اسم القالب *</FormLabel><FormControl><Input {...field} className={inp} placeholder="مثال: التهاب لوزتين حاد" /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>)} />
                  <FormField control={rxForm.control} name="category" render={({ field }) => (<FormItem><FormLabel className={lbl}>التصنيف</FormLabel><FormControl><Input {...field} className={inp} placeholder="مثال: أطفال، باطنة" /></FormControl></FormItem>)} />
                  <FormField control={rxForm.control} name="content" render={({ field }) => (<FormItem><FormLabel className={lbl}>محتوى الوصفة (الأدوية) *</FormLabel><FormControl><Textarea {...field} className={`${inp} min-h-[120px] resize-none leading-relaxed font-mono text-left`} dir="ltr" placeholder="1. Amoxicillin 500mg (1x3)&#10;2. Paracetamol 500mg PRN" /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>)} />
                  <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-[rgba(40,130,220,0.16)]">
                    <button type="button" onClick={() => setIsRxDialogOpen(false)} className="text-[#8EA2BD] hover:text-white bg-transparent h-[40px] px-5 rounded-[10px] text-[12px] transition-all border-0">إلغاء</button>
                    <button type="submit" disabled={createRx.isPending || updateRx.isPending} className="bg-[#00D8D8] text-[#050C1F] text-[12px] h-[40px] px-6 rounded-[10px] font-bold hover:brightness-110 transition-all border-0">{createRx.isPending || updateRx.isPending ? "جاري الحفظ..." : "حفظ القالب"}</button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isInvDialogOpen} onOpenChange={setIsInvDialogOpen}>
          <DialogContent className="sm:max-w-[500px] border-[rgba(139,92,246,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.15)]">
            <div className="bg-[rgba(139,92,246,0.1)] border-b border-[rgba(139,92,246,0.2)] px-6 py-4 flex items-center gap-3"><div className="bg-[#8B5CF6] rounded-full p-1.5 text-white"><Microscope className="w-4 h-4" /></div><DialogTitle className="text-white font-extrabold text-[15px]">إضافة قالب فحوصات</DialogTitle></div>
            <div className="p-6">
              <Form {...invForm}>
                <form onSubmit={invForm.handleSubmit(onInvSubmit)} className="space-y-4">
                  <FormField control={invForm.control} name="name" render={({ field }) => (<FormItem><FormLabel className={lbl}>اسم القالب *</FormLabel><FormControl><Input {...field} className={inp} placeholder="مثال: فحص شامل" /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>)} />
                  <FormField control={invForm.control} name="type" render={({ field }) => (<FormItem><FormLabel className={lbl}>نوع الطلب</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className={inp}><SelectValue /></SelectTrigger></FormControl><SelectContent className={sel}><SelectItem value="labs" className="text-[12px]">تحاليل مخبرية (Labs)</SelectItem><SelectItem value="imaging" className="text-[12px]">تصوير طبي (Imaging)</SelectItem><SelectItem value="endoscopy" className="text-[12px]">مناظير (Endoscopy)</SelectItem><SelectItem value="pathology" className="text-[12px]">أنسجة (Pathology)</SelectItem></SelectContent></Select></FormItem>)} />
                  <FormField control={invForm.control} name="testInput" render={({ field }) => (
                    <FormItem>
                      <FormLabel className={lbl}>الفحوصات المشمولة *</FormLabel>
                      <div className="flex gap-2">
                        <FormControl><Input {...field} className={inp + " font-mono text-left"} dir="ltr" placeholder="CBC, Lipid Profile..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const val = field.value?.trim(); if (val && !invTests.includes(val)) { setInvTests([...invTests, val]); field.onChange(""); } } }} /></FormControl>
                        <button type="button" onClick={() => { const val = invForm.getValues("testInput")?.trim(); if (val && !invTests.includes(val)) { setInvTests([...invTests, val]); invForm.setValue("testInput", ""); } }} className="h-[40px] px-4 rounded-[10px] bg-[rgba(255,255,255,0.1)] text-white text-[12px] font-bold border-0 hover:bg-[rgba(255,255,255,0.2)] transition-all">إضافة</button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {invTests.map(test => (
                          <span key={test} className="flex items-center gap-1.5 px-3 py-1 bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-[#8B5CF6] text-[11px] rounded-md font-mono" dir="ltr">
                            {test} <button type="button" onClick={() => setInvTests(invTests.filter(t => t !== test))} className="text-[#8B5CF6] hover:text-[#FF4D60]"><Trash2 className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    </FormItem>
                  )} />
                  <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-[rgba(40,130,220,0.16)]">
                    <button type="button" onClick={() => setIsInvDialogOpen(false)} className="text-[#8EA2BD] hover:text-white bg-transparent h-[40px] px-5 rounded-[10px] text-[12px] transition-all border-0">إلغاء</button>
                    <button type="submit" disabled={createInv.isPending} className="bg-[#8B5CF6] text-white text-[12px] h-[40px] px-6 rounded-[10px] font-bold hover:brightness-110 transition-all border-0">حفظ القالب</button>
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