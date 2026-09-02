import { useState } from "react";
import { 
  useListExpenses, useCreateExpense, 
  useListExpenseCategories, useCreateExpenseCategory, useUpdateExpenseCategory, useDeleteExpenseCategory,
  useListRoutineExpenses, useCreateRoutineExpense, useUpdateRoutineExpense, useDeleteRoutineExpense,
  useListVaults
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, TrendingDown, Filter, FileText, Tag, RepeatIcon, Edit, Trash2, Activity, CalendarIcon } from "lucide-react";

/* ─── Schemas ─── */
const expenseSchema = z.object({
  categoryId: z.coerce.number().min(1, "اختر الفئة"),
  amount: z.coerce.number().min(0.01, "المبلغ يجب أن يكون أكبر من صفر"),
  vaultId: z.coerce.number().min(1, "اختر الخزنة للصرف منها"),
  note: z.string().optional()
});

const categorySchema = z.object({
  name: z.string().min(2, "اسم الفئة مطلوب"),
  description: z.string().optional()
});

const routineSchema = z.object({
  categoryId: z.coerce.number().min(1, "اختر الفئة"),
  title: z.string().min(2, "عنوان المصروف مطلوب"),
  amount: z.coerce.number().min(0, "المبلغ يجب أن يكون أكبر من صفر"),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  branch: z.string().optional(),
  note: z.string().optional(),
  isActive: z.boolean().default(true)
});

const frequencyLabel = { daily: "يومي", weekly: "أسبوعي", monthly: "شهري" };

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Expenses() {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [categoryIdFilter, setCategoryIdFilter] = useState<string>("all");
  const [appliedFilters, setAppliedFilters] = useState({ dateFrom: "", dateTo: "", categoryId: "" });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [isRoutineDialogOpen, setIsRoutineDialogOpen] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: expensesList, isLoading } = useListExpenses({
    dateFrom: appliedFilters.dateFrom || undefined,
    dateTo: appliedFilters.dateTo || undefined,
    categoryId: appliedFilters.categoryId && appliedFilters.categoryId !== "all" ? parseInt(appliedFilters.categoryId) : undefined
  });
  const { data: categories, isLoading: catsLoading } = useListExpenseCategories();
  const { data: vaults } = useListVaults();
  const { data: routineExpenses, isLoading: routineLoading } = useListRoutineExpenses();

  const expForm = useForm<z.infer<typeof expenseSchema>>({ resolver: zodResolver(expenseSchema), defaultValues: { amount: 0, note: "" } });
  const catForm = useForm<z.infer<typeof categorySchema>>({ resolver: zodResolver(categorySchema), defaultValues: { name: "", description: "" } });
  const routineForm = useForm<z.infer<typeof routineSchema>>({ resolver: zodResolver(routineSchema), defaultValues: { frequency: "monthly", isActive: true, amount: 0 } });

  const createExpense = useCreateExpense({
    mutation: {
      onSuccess: () => { toast({ title: "تم الإضافة", description: "تم تسجيل المصروف بنجاح" }); queryClient.invalidateQueries(); setIsDialogOpen(false); expForm.reset(); },
      onError: () => { toast({ title: "خطأ", description: "فشلت عملية التسجيل", variant: "destructive" }); }
    }
  });

  const createCat = useCreateExpenseCategory({ mutation: { onSuccess: () => { toast({ title: "تم الإضافة" }); queryClient.invalidateQueries(); setIsCatDialogOpen(false); catForm.reset(); } } });
  const updateCat = useUpdateExpenseCategory({ mutation: { onSuccess: () => { toast({ title: "تم التعديل" }); queryClient.invalidateQueries(); setIsCatDialogOpen(false); setEditingCatId(null); catForm.reset(); } } });
  const deleteCat = useDeleteExpenseCategory({ mutation: { onSuccess: () => { toast({ title: "تم الحذف" }); queryClient.invalidateQueries(); } } });

  const openEditCat = (cat: { id: number; name: string; description?: string | null }) => {
    setEditingCatId(cat.id);
    catForm.setValue("name", cat.name);
    catForm.setValue("description", cat.description ?? "");
    setIsCatDialogOpen(true);
  };

  const onCatSubmit = (data: z.infer<typeof categorySchema>) => {
    if (editingCatId) updateCat.mutate({ id: editingCatId, data });
    else createCat.mutate({ data });
  };

  const createRoutine = useCreateRoutineExpense({ mutation: { onSuccess: () => { toast({ title: "تم الإضافة" }); queryClient.invalidateQueries(); setIsRoutineDialogOpen(false); routineForm.reset(); } } });
  const updateRoutine = useUpdateRoutineExpense({ mutation: { onSuccess: () => { toast({ title: "تم التعديل" }); queryClient.invalidateQueries(); setIsRoutineDialogOpen(false); setEditingRoutineId(null); routineForm.reset(); } } });
  const deleteRoutine = useDeleteRoutineExpense({ mutation: { onSuccess: () => { toast({ title: "تم الحذف" }); queryClient.invalidateQueries(); } } });

  const openEditRoutine = (r: any) => {
    setEditingRoutineId(r.id);
    routineForm.reset({ categoryId: r.categoryId, title: r.title, amount: r.amount, frequency: r.frequency, branch: r.branch ?? "", note: r.note ?? "", isActive: r.isActive });
    setIsRoutineDialogOpen(true);
  };

  const onRoutineSubmit = (data: z.infer<typeof routineSchema>) => {
    const payload = { ...data, branch: (!data.branch || data.branch === "__all__") ? null : data.branch };
    if (editingRoutineId) updateRoutine.mutate({ id: editingRoutineId, data: payload });
    else createRoutine.mutate({ data: payload });
  };

  const handleFilter = () => setAppliedFilters({ dateFrom, dateTo, categoryId: categoryIdFilter });
  const totalAmount = Array.isArray(expensesList) ? expensesList.reduce((sum, exp) => sum + exp.amount, 0) : 0;

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#FF4D60] tracking-tight" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              إدارة المصروفات
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              سجل النفقات، المصروفات الدورية، وتصنيفات الصرف من الخزنة.
            </p>
          </div>
        </div>

        <Tabs defaultValue="log" className="w-full">
          <TabsList className="mb-6 grid grid-cols-3 max-w-xl bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[10px] h-[48px] p-1">
            <TabsTrigger value="log" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD] transition-all"><FileText className="h-4 w-4 ml-2" /> سجل المصروفات</TabsTrigger>
            <TabsTrigger value="routine" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD] transition-all"><RepeatIcon className="h-4 w-4 ml-2" /> المصروفات الدورية</TabsTrigger>
            <TabsTrigger value="categories" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD] transition-all"><Tag className="h-4 w-4 ml-2" /> أقسام الصرف</TabsTrigger>
          </TabsList>

          {/* ─── TAB 1: Expense Log ─── */}
          <TabsContent value="log">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-2 h-[40px] px-6 rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] border-0"
                style={{
                  background: "linear-gradient(135deg, #FF4D60, #FFC857)",
                  boxShadow: "0 4px 15px rgba(255,77,96,0.25)",
                }}
              >
                <Plus className="h-4 w-4" /> إضافة مصروف جديد
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1 space-y-6">
                
                {/* Total Expense Card */}
                <div 
                  className="rounded-[14px] p-6 border relative overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, rgba(255,77,96,0.1), rgba(255,77,96,0.02))",
                    borderColor: "rgba(255,77,96,0.2)"
                  }}
                >
                  <div className="absolute -left-6 -top-6 w-24 h-24 bg-[#FF4D60] rounded-full blur-[50px] opacity-20 pointer-events-none" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#FF4D60] rounded-full p-2 text-white shadow-[0_0_15px_rgba(255,77,96,0.3)]">
                      <TrendingDown className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-[#FF4D60] text-[14px]">إجمالي المصروفات</h3>
                  </div>
                  <div className="text-[32px] font-extrabold font-mono tracking-tight text-white mt-2 flex items-center justify-end" dir="ltr">
                    <span className="text-[#FF4D60] text-[20px] mr-2">₪</span>
                    {totalAmount.toLocaleString()}
                  </div>
                  <p className="text-[#8EA2BD] text-[11px] mt-2 text-left">حسب التصفيات المحددة</p>
                </div>

                {/* Filter */}
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
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#8EA2BD]">الفئة</label>
                      <Select value={categoryIdFilter} onValueChange={setCategoryIdFilter}>
                        <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]">
                          <SelectValue placeholder="الكل" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                          <SelectItem value="all" className="text-[12px]">جميع الفئات</SelectItem>
                          {Array.isArray(categories) && categories.map(c => <SelectItem key={c.id} value={c.id.toString()} className="text-[12px]">{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#8EA2BD]">من تاريخ</label>
                      <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" style={{ colorScheme: "dark" }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#8EA2BD]">إلى تاريخ</label>
                      <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" style={{ colorScheme: "dark" }} />
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

              {/* Table */}
              <div className="md:col-span-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20 text-[#FF4D60]">
                    <Activity className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <div
                    className="rounded-[14px] overflow-hidden h-full"
                    style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr style={{ background: "rgba(10,108,255,0.04)", borderBottom: "1px solid rgba(40,130,220,0.16)" }}>
                            <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">رقم الإيصال</th>
                            <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">التاريخ</th>
                            <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الفئة</th>
                            <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الخزنة</th>
                            <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">البيان</th>
                            <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">المبلغ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: "rgba(40,130,220,0.08)" }}>
                          {!Array.isArray(expensesList) || expensesList.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-12 text-[#8EA2BD] text-[13px]">لا توجد مصروفات مسجلة</td></tr>
                          ) : (
                            expensesList.map((exp: any) => (
                              <tr key={exp.id} className="transition-colors hover:bg-[rgba(255,77,96,0.03)]">
                                <td className="px-5 py-4 font-mono text-[11px] text-[#FFC857]">{exp.receiptNumber}</td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2 text-[12px] text-[#8EA2BD]" dir="ltr">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    {new Date(exp.expenseDate).toLocaleDateString('ar-EG')}
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-[12px] text-white">
                                  <span className="bg-[rgba(10,108,255,0.1)] text-[#0A6CFF] px-2 py-0.5 rounded-[4px] border border-[rgba(10,108,255,0.2)] text-[10px]">
                                    {exp.categoryName || "غير محدد"}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-[12px] text-[#8EA2BD]">{exp.vaultName || "-"}</td>
                                <td className="px-5 py-4 text-[12px] text-white max-w-[200px] truncate" title={exp.note || "-"}>{exp.note || "-"}</td>
                                <td className="px-5 py-4">
                                  <span className="font-extrabold text-[14px] font-mono text-[#FF4D60]" dir="ltr">
                                    ₪ {exp.amount}
                                  </span>
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
          </TabsContent>

          {/* ─── TAB 2: Routine Expenses ─── */}
          <TabsContent value="routine">
            <div className="flex justify-end mb-4">
              <button onClick={() => { setEditingRoutineId(null); routineForm.reset(); setIsRoutineDialogOpen(true); }} className="flex items-center gap-2 h-[40px] px-6 rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] border-0" style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)", boxShadow: "0 4px 15px rgba(10,108,255,0.25)" }}>
                <Plus className="h-4 w-4" /> إضافة التزام دوري
              </button>
            </div>
            {routineLoading ? (
               <div className="flex items-center justify-center py-20 text-[#00D8D8]"><Activity className="w-8 h-8 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {!Array.isArray(routineExpenses) || routineExpenses.length === 0 ? (
                  <div className="col-span-3 text-center py-12 text-[#8EA2BD] text-[13px] bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[14px]">لا توجد التزامات دورية مسجلة</div>
                ) : (
                  routineExpenses.map((r: any) => (
                    <div key={r.id} className="rounded-[14px] p-5 flex flex-col relative overflow-hidden group border transition-colors" style={{ background: "#050C1F", borderColor: r.isActive ? "rgba(0,217,208,0.3)" : "rgba(142,162,189,0.2)" }}>
                      <div className="absolute top-0 right-0 left-0 h-1" style={{ background: r.isActive ? "#00D8D8" : "#8EA2BD" }} />
                      <div className="flex justify-between items-start mt-2">
                        <div>
                          <h3 className="font-bold text-[15px] text-white">{r.title}</h3>
                          <span className="bg-[rgba(10,108,255,0.1)] text-[#0A6CFF] px-2 py-0.5 rounded-[4px] border border-[rgba(10,108,255,0.2)] text-[10px] mt-1 inline-block">{r.categoryName || "-"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditRoutine(r)} className="h-7 w-7 rounded-md flex items-center justify-center transition-colors text-[#8EA2BD] hover:bg-[rgba(10,108,255,0.1)] hover:text-[#0A6CFF]"><Edit className="h-3.5 w-3.5" /></button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><button className="h-7 w-7 rounded-md flex items-center justify-center transition-colors text-[#8EA2BD] hover:bg-[rgba(255,77,96,0.1)] hover:text-[#FF4D60]"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-[400px] border-[rgba(255,77,96,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(255,77,96,0.15)]">
                              <div className="bg-[rgba(255,77,96,0.1)] border-b border-[rgba(255,77,96,0.2)] px-6 py-4"><AlertDialogTitle className="text-white font-extrabold text-[15px]">حذف الالتزام</AlertDialogTitle></div>
                              <div className="p-6">
                                <AlertDialogDescription className="text-[#8EA2BD] text-[13px] mb-6">هل أنت متأكد من حذف الالتزام ({r.title})؟</AlertDialogDescription>
                                <div className="flex justify-end gap-3"><AlertDialogCancel className="bg-transparent text-[#8EA2BD] border-0 hover:text-white h-[38px] px-5">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => deleteRoutine.mutate({ id: r.id })} className="bg-[#FF4D60] text-white h-[38px] px-6 font-bold border-0">نعم، احذف</AlertDialogAction></div>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="my-4 pt-4 border-t border-[rgba(40,130,220,0.16)] flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="text-[#8EA2BD]">المبلغ المطلوب:</span>
                          <span className="font-bold text-[#FFC857] font-mono" dir="ltr">₪ {r.amount}</span>
                        </div>
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="text-[#8EA2BD]">التكرار:</span>
                          <span className="text-white">{frequencyLabel[r.frequency as keyof typeof frequencyLabel]}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* ─── TAB 3: Categories ─── */}
          <TabsContent value="categories">
            <div className="flex justify-end mb-4">
              <button onClick={() => { setEditingCatId(null); catForm.reset(); setIsCatDialogOpen(true); }} className="flex items-center gap-2 h-[40px] px-6 rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] border-0" style={{ background: "linear-gradient(135deg, #8B5CF6, #0A6CFF)", boxShadow: "0 4px 15px rgba(139,92,246,0.25)" }}>
                <Plus className="h-4 w-4" /> إضافة فئة جديدة
              </button>
            </div>
            {catsLoading ? (
              <div className="flex items-center justify-center py-20 text-[#8B5CF6]"><Activity className="w-8 h-8 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {!Array.isArray(categories) || categories.length === 0 ? (
                  <div className="col-span-4 text-center py-12 text-[#8EA2BD] text-[13px] bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[14px]">لا توجد فئات مسجلة</div>
                ) : (
                  categories.map((c: any) => (
                    <div key={c.id} className="rounded-[14px] p-5 flex flex-col border border-[rgba(40,130,220,0.16)] bg-[#050C1F]">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-[14px] text-white flex items-center gap-2"><Tag className="w-3.5 h-3.5 text-[#8B5CF6]" /> {c.name}</h3>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditCat(c)} className="h-6 w-6 rounded flex items-center justify-center text-[#8EA2BD] hover:bg-[rgba(10,108,255,0.1)] hover:text-[#0A6CFF]"><Edit className="w-3 h-3" /></button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild><button className="h-6 w-6 rounded flex items-center justify-center text-[#8EA2BD] hover:bg-[rgba(255,77,96,0.1)] hover:text-[#FF4D60]"><Trash2 className="w-3 h-3" /></button></AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-[400px] border-[rgba(255,77,96,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(255,77,96,0.15)]">
                              <div className="bg-[rgba(255,77,96,0.1)] border-b border-[rgba(255,77,96,0.2)] px-6 py-4"><AlertDialogTitle className="text-white font-extrabold text-[15px]">حذف الفئة</AlertDialogTitle></div>
                              <div className="p-6">
                                <AlertDialogDescription className="text-[#8EA2BD] text-[13px] mb-6">هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع.</AlertDialogDescription>
                                <div className="flex justify-end gap-3"><AlertDialogCancel className="bg-transparent text-[#8EA2BD] border-0 hover:text-white h-[38px] px-5">إلغاء</AlertDialogCancel><AlertDialogAction onClick={() => deleteCat.mutate({ id: c.id })} className="bg-[#FF4D60] text-white h-[38px] px-6 font-bold border-0">نعم، احذف</AlertDialogAction></div>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#8EA2BD] leading-relaxed">{c.description || "لا يوجد وصف"}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ─── Expense Dialog ─── */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[400px] border-[rgba(255,77,96,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(255,77,96,0.15)]">
            <div className="bg-gradient-to-l from-[#FF4D60] to-[#FFC857] px-6 py-4 flex items-center justify-between">
              <DialogTitle className="text-white font-extrabold text-[16px]">تسجيل مصروف جديد</DialogTitle>
            </div>
            <div className="p-6">
              <Form {...expForm}>
                <form onSubmit={expForm.handleSubmit(data => createExpense.mutate({ data }))} className="space-y-4">
                  <FormField control={expForm.control} name="categoryId" render={({ field }) => (
                    <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">فئة المصروف *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value?.toString()}>
                        <FormControl><SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]"><SelectValue placeholder="اختر الفئة..." /></SelectTrigger></FormControl>
                        <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">{Array.isArray(categories) && categories.map(c => <SelectItem key={c.id} value={c.id.toString()} className="text-[12px]">{c.name}</SelectItem>)}</SelectContent>
                      </Select><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>
                  )} />
                  <FormField control={expForm.control} name="amount" render={({ field }) => (
                    <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">المبلغ (₪) *</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px] font-mono text-left" dir="ltr" /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>
                  )} />
                  <FormField control={expForm.control} name="vaultId" render={({ field }) => (
                    <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">سحب من خزنة *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value?.toString()}>
                        <FormControl><SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]"><SelectValue placeholder="اختر الخزنة..." /></SelectTrigger></FormControl>
                        <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">{vaults?.filter(v => !v.isLocked).map(v => <SelectItem key={v.id} value={v.id.toString()} className="text-[12px]">{v.name} (رصيد: {v.balance})</SelectItem>)}</SelectContent>
                      </Select><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>
                  )} />
                  <FormField control={expForm.control} name="note" render={({ field }) => (
                    <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">البيان / ملاحظات</FormLabel>
                      <FormControl><Textarea className="resize-none bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] min-h-[80px]" {...field} /></FormControl></FormItem>
                  )} />
                  <div className="pt-4 flex justify-end gap-3 border-t border-[rgba(40,130,220,0.16)] mt-6">
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-[#8EA2BD] hover:text-white hover:bg-[rgba(255,255,255,0.05)] text-[12px] h-[38px] px-5 border-0">إلغاء</Button>
                    <Button type="submit" disabled={createExpense.isPending} className="bg-[#FF4D60] text-white text-[12px] h-[38px] px-6 font-bold hover:brightness-110 border-0">حفظ المصروف</Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>

        {/* ─── Category Dialog ─── */}
        <Dialog open={isCatDialogOpen} onOpenChange={setIsCatDialogOpen}>
          <DialogContent className="sm:max-w-[400px] border-[rgba(139,92,246,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(139,92,246,0.15)]">
            <div className="bg-[rgba(139,92,246,0.1)] border-b border-[rgba(139,92,246,0.2)] px-6 py-4 flex items-center gap-3">
              <div className="bg-[#8B5CF6] rounded-full p-1.5 text-white"><Tag className="w-4 h-4" /></div>
              <DialogTitle className="text-white font-extrabold text-[15px]">{editingCatId ? "تعديل الفئة" : "إضافة فئة جديدة"}</DialogTitle>
            </div>
            <div className="p-6">
              <Form {...catForm}>
                <form onSubmit={catForm.handleSubmit(onCatSubmit)} className="space-y-4">
                  <FormField control={catForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الاسم *</FormLabel>
                      <FormControl><Input {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>
                  )} />
                  <FormField control={catForm.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الوصف</FormLabel>
                      <FormControl><Textarea className="resize-none bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] min-h-[80px]" {...field} /></FormControl></FormItem>
                  )} />
                  <div className="pt-4 flex justify-end gap-3 mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsCatDialogOpen(false)} className="text-[#8EA2BD] hover:text-white border-0 text-[12px]">إلغاء</Button>
                    <Button type="submit" disabled={createCat.isPending || updateCat.isPending} className="bg-[#8B5CF6] text-white text-[12px] h-[38px] px-6 font-bold hover:brightness-110 border-0">{editingCatId ? "حفظ التعديلات" : "إضافة الفئة"}</Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>

        {/* ─── Routine Dialog ─── */}
        <Dialog open={isRoutineDialogOpen} onOpenChange={setIsRoutineDialogOpen}>
          <DialogContent className="sm:max-w-[400px] border-[rgba(0,217,208,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(0,217,208,0.15)]">
            <div className="bg-[rgba(0,217,208,0.1)] border-b border-[rgba(0,217,208,0.2)] px-6 py-4 flex items-center gap-3">
              <div className="bg-[#00D8D8] rounded-full p-1.5 text-[#050C1F]"><RepeatIcon className="w-4 h-4" /></div>
              <DialogTitle className="text-white font-extrabold text-[15px]">{editingRoutineId ? "تعديل الالتزام" : "التزام دوري جديد"}</DialogTitle>
            </div>
            <div className="p-6">
              <Form {...routineForm}>
                <form onSubmit={routineForm.handleSubmit(onRoutineSubmit)} className="space-y-4">
                  <FormField control={routineForm.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">العنوان *</FormLabel><FormControl><Input {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>
                  )} />
                  <FormField control={routineForm.control} name="categoryId" render={({ field }) => (
                    <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الفئة *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value?.toString()}>
                        <FormControl><SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]"><SelectValue placeholder="اختر الفئة..." /></SelectTrigger></FormControl>
                        <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">{Array.isArray(categories) && categories.map(c => <SelectItem key={c.id} value={c.id.toString()} className="text-[12px]">{c.name}</SelectItem>)}</SelectContent>
                      </Select><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={routineForm.control} name="amount" render={({ field }) => (
                      <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">المبلغ الثابت (₪)</FormLabel><FormControl><Input type="number" step="0.01" {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px] font-mono text-left" dir="ltr" /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>
                    )} />
                    <FormField control={routineForm.control} name="frequency" render={({ field }) => (
                      <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">التكرار *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white"><SelectItem value="daily" className="text-[12px]">يومي</SelectItem><SelectItem value="weekly" className="text-[12px]">أسبوعي</SelectItem><SelectItem value="monthly" className="text-[12px]">شهري</SelectItem></SelectContent>
                        </Select><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>
                    )} />
                  </div>
                  <FormField control={routineForm.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-[10px] border border-[rgba(40,130,220,0.16)] bg-[rgba(6,19,41,0.6)] p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-white text-[12px] font-bold">تفعيل الالتزام</FormLabel>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <div className="pt-4 flex justify-end gap-3 mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsRoutineDialogOpen(false)} className="text-[#8EA2BD] hover:text-white border-0 text-[12px]">إلغاء</Button>
                    <Button type="submit" disabled={createRoutine.isPending || updateRoutine.isPending} className="bg-[#00D8D8] text-[#050C1F] text-[12px] h-[38px] px-6 font-bold hover:brightness-110 border-0">{editingRoutineId ? "حفظ التعديلات" : "إضافة الالتزام"}</Button>
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
