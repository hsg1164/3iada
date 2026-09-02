import { useState } from "react";
import { 
  useListInventoryItems, useCreateInventoryItem, 
  useInventoryTransaction, useListSupplierDebts 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Package, AlertTriangle, ArrowRightLeft, Clock, Factory, Activity, Box, RefreshCw } from "lucide-react";

/* ─── Schemas ─── */
const itemSchema = z.object({
  barcode: z.string().optional(),
  branch: z.string().min(1, "الفرع مطلوب"),
  name: z.string().min(2, "الاسم مطلوب"),
  categoryId: z.coerce.number().optional().nullable(),
  quantity: z.coerce.number().min(0, "الكمية لا يمكن أن تكون سالبة"),
  unit: z.string().min(1, "الوحدة مطلوبة (مثل: علبة، حبة)"),
  lowStockThreshold: z.coerce.number().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  supplierName: z.string().optional(),
  supplierContact: z.string().optional(),
  supplierAddress: z.string().optional(),
  notifyLowStock: z.boolean().default(true),
  notifyExpiry: z.boolean().default(true)
});

const txSchema = z.object({
  type: z.enum(['add', 'withdraw']),
  quantity: z.coerce.number().min(0.01, "الكمية يجب أن تكون أكبر من 0"),
  note: z.string().optional(),
  cost: z.coerce.number().optional().nullable()
});

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Inventory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: items, isLoading: itemsLoading } = useListInventoryItems({});
  const { data: debts, isLoading: debtsLoading } = useListSupplierDebts();

  const createItem = useCreateInventoryItem({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم الحفظ", description: "تم إضافة المادة للمخزون بنجاح" });
        queryClient.invalidateQueries();
        setIsItemDialogOpen(false);
        itemForm.reset();
      }
    }
  });

  const processTransaction = useInventoryTransaction({
    mutation: {
      onSuccess: () => {
        toast({ title: "تمت العملية", description: "تم تسجيل حركة المخزون بنجاح" });
        queryClient.invalidateQueries();
        setSelectedItemId(null);
        txForm.reset();
      },
      onError: (err: any) => {
        toast({ title: "خطأ", description: err.message || "فشلت الحركة", variant: "destructive" });
      }
    }
  });

  const itemForm = useForm<z.infer<typeof itemSchema>>({
    resolver: zodResolver(itemSchema),
    defaultValues: { branch: "غزة", unit: "حبة", quantity: 0, notifyLowStock: true, notifyExpiry: true }
  });

  const txForm = useForm<z.infer<typeof txSchema>>({
    resolver: zodResolver(txSchema),
    defaultValues: { type: "withdraw", quantity: 1 }
  });

  const onItemSubmit = (values: z.infer<typeof itemSchema>) => {
    createItem.mutate({ data: values });
  };

  const onTxSubmit = (values: z.infer<typeof txSchema>) => {
    if (!selectedItemId) return;
    processTransaction.mutate({ id: selectedItemId!, data: values });
  };

  const filteredItems = Array.isArray(items) 
    ? items.filter(i => !searchTerm || i.name.includes(searchTerm) || (i.barcode && i.barcode.includes(searchTerm)))
    : [];

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              إدارة المخزون
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              مراقبة المواد الطبية، تتبع النواقص والكميات، وإدارة ديون الموردين.
            </p>
          </div>
        </div>

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 max-w-sm bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[10px] h-[48px] p-1">
            <TabsTrigger value="inventory" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD] transition-all">
              <Box className="h-4 w-4 ml-2" /> المخزون
            </TabsTrigger>
            <TabsTrigger value="debts" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD] transition-all">
              <Factory className="h-4 w-4 ml-2" /> ديون الموردين
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB 1: INVENTORY ─── */}
          <TabsContent value="inventory" className="space-y-4">
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <input
                type="text"
                placeholder="بحث بالاسم أو الباركود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-[40px] w-full md:w-[350px] rounded-[10px] px-4 text-[12px] text-white outline-none transition-all duration-300 bg-[rgba(6,19,41,.6)] border border-[rgba(40,130,220,0.16)] focus:border-[#0A6CFF]"
              />
              <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 h-[40px] px-6 rounded-[10px] text-[12px] font-bold text-white transition-all hover:scale-[1.02] border-0 shrink-0 w-full md:w-auto justify-center" style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)", boxShadow: "0 4px 15px rgba(10,108,255,0.25)" }}>
                    <Plus className="h-4 w-4" /> إضافة مادة للمخزون
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-[rgba(0,217,208,0.3)] bg-[#050C1F] p-0 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                  <div className="bg-gradient-to-l from-[#0A6CFF] to-[#00D8D8] px-6 py-4 flex items-center justify-between">
                    <DialogTitle className="text-white font-extrabold text-[16px]">إضافة مادة جديدة</DialogTitle>
                  </div>
                  <div className="p-6">
                    <Form {...itemForm}>
                      <form onSubmit={itemForm.handleSubmit(onItemSubmit)} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FormField control={itemForm.control} name="name" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">اسم المادة *</FormLabel><FormControl><Input {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" /></FormControl><FormMessage className="text-[#FF4D60] text-[10px]" /></FormItem>
                          )} />
                          
                          <FormField control={itemForm.control} name="branch" render={({ field }) => (
                            <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الفرع *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                                  <SelectItem value="غزة" className="text-[12px]">فرع غزة</SelectItem>
                                  <SelectItem value="خان يونس" className="text-[12px]">فرع خان يونس</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )} />

                          <FormField control={itemForm.control} name="barcode" render={({ field }) => (
                            <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الباركود</FormLabel><FormControl><Input dir="ltr" {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" /></FormControl></FormItem>
                          )} />

                          <FormField control={itemForm.control} name="quantity" render={({ field }) => (
                            <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الكمية الافتتاحية *</FormLabel><FormControl><Input type="number" step="any" {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px] font-mono text-left" dir="ltr" /></FormControl></FormItem>
                          )} />

                          <FormField control={itemForm.control} name="unit" render={({ field }) => (
                            <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">وحدة القياس *</FormLabel><FormControl><Input placeholder="علبة، حبة، مل" {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" /></FormControl></FormItem>
                          )} />

                          <FormField control={itemForm.control} name="lowStockThreshold" render={({ field }) => (
                            <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">حد النقصان (تنبيه) *</FormLabel><FormControl><Input type="number" step="any" {...field} value={field.value || ''} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px] font-mono text-left" dir="ltr" /></FormControl></FormItem>
                          )} />

                          <FormField control={itemForm.control} name="expiryDate" render={({ field }) => (
                            <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">تاريخ الانتهاء</FormLabel><FormControl><Input type="date" {...field} value={field.value || ''} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" style={{ colorScheme: "dark" }} /></FormControl></FormItem>
                          )} />
                        </div>

                        <div className="rounded-[10px] border border-[rgba(40,130,220,0.16)] bg-[rgba(6,19,41,0.4)] p-4 space-y-4">
                          <h4 className="font-bold text-[13px] text-white flex items-center gap-2"><Factory className="w-4 h-4 text-[#8EA2BD]" /> بيانات المورد (اختياري)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={itemForm.control} name="supplierName" render={({ field }) => (
                              <FormItem><FormLabel className="text-[#8EA2BD] text-[11px] font-bold">اسم المورد</FormLabel><FormControl><Input {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[36px]" /></FormControl></FormItem>
                            )} />
                            <FormField control={itemForm.control} name="supplierContact" render={({ field }) => (
                              <FormItem><FormLabel className="text-[#8EA2BD] text-[11px] font-bold">رقم التواصل</FormLabel><FormControl><Input {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[36px]" /></FormControl></FormItem>
                            )} />
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-[rgba(40,130,220,0.16)]">
                          <button type="button" onClick={() => setIsItemDialogOpen(false)} className="text-[#8EA2BD] hover:text-white bg-transparent h-[40px] px-5 rounded-[10px] text-[12px] transition-all">إلغاء</button>
                          <button type="submit" disabled={createItem.isPending} className="bg-[#00D8D8] text-[#050C1F] text-[12px] h-[40px] px-6 rounded-[10px] font-bold hover:brightness-110 transition-all border-0">{createItem.isPending ? "جاري الحفظ..." : "حفظ المادة"}</button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Inventory Table */}
            {itemsLoading ? (
               <div className="flex items-center justify-center py-20 text-[#00D8D8]"><Activity className="w-8 h-8 animate-spin" /></div>
            ) : (
              <div className="rounded-[14px] overflow-hidden" style={{ background: "#050C1F", border: "1px solid rgba(40,130,220,0.16)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr style={{ background: "rgba(10,108,255,0.04)", borderBottom: "1px solid rgba(40,130,220,0.16)" }}>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الباركود</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">المادة</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الفرع</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">الكمية المتوفرة</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">تاريخ الصلاحية</th>
                        <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD] text-left">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "rgba(40,130,220,0.08)" }}>
                      {filteredItems.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-12 text-[#8EA2BD] text-[13px]">لا يوجد مواد في المخزون</td></tr>
                      ) : (
                        filteredItems.map((item: any) => {
                          const isLowStock = item.lowStockThreshold && item.quantity <= item.lowStockThreshold;
                          const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
                          
                          return (
                            <tr key={item.id} className="transition-colors hover:bg-[rgba(10,108,255,0.02)]">
                              <td className="px-5 py-4 font-mono text-[11px] text-[#8EA2BD]" dir="ltr">{item.barcode || "-"}</td>
                              <td className="px-5 py-4 font-bold text-[13px] text-white">{item.name}</td>
                              <td className="px-5 py-4 text-[12px] text-[#8EA2BD]">{item.branch}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono font-bold text-[14px] ${isLowStock ? 'text-[#FF4D60]' : 'text-white'}`}>{item.quantity}</span>
                                  <span className="text-[11px] text-[#8EA2BD]">{item.unit}</span>
                                  {isLowStock && <span className="bg-[rgba(255,77,96,0.1)] text-[#FF4D60] px-2 py-0.5 rounded-[4px] border border-[rgba(255,77,96,0.2)] text-[10px] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> نقص بالكمية</span>}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-[12px]">
                                {item.expiryDate ? (
                                  <span className={isExpired ? "text-[#FF4D60] flex items-center gap-1 font-bold" : "text-[#8EA2BD]"}>
                                    {isExpired && <Clock className="w-3 h-3" />}
                                    {new Date(item.expiryDate).toLocaleDateString('ar-EG')}
                                    {isExpired && " (منتهي)"}
                                  </span>
                                ) : <span className="text-[#8EA2BD]">-</span>}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex justify-end">
                                  <Dialog open={selectedItemId === item.id} onOpenChange={(o) => { if(!o) setSelectedItemId(null); }}>
                                    <DialogTrigger asChild>
                                      <button onClick={() => setSelectedItemId(item.id)} className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-[6px] text-[11px] font-bold bg-[rgba(10,108,255,0.1)] text-[#0A6CFF] border border-[rgba(10,108,255,0.2)] hover:bg-[#0A6CFF] hover:text-white transition-all">
                                        <ArrowRightLeft className="w-3.5 h-3.5" /> حركة كمية
                                      </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[400px] border-[rgba(10,108,255,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(10,108,255,0.15)]">
                                      <div className="bg-[rgba(10,108,255,0.1)] border-b border-[rgba(10,108,255,0.2)] px-6 py-4 flex items-center gap-3">
                                        <div className="bg-[#0A6CFF] rounded-full p-1.5 text-white"><ArrowRightLeft className="w-4 h-4" /></div>
                                        <DialogTitle className="text-white font-extrabold text-[15px]">تسجيل حركة: {item.name}</DialogTitle>
                                      </div>
                                      <div className="p-6">
                                        <Form {...txForm}>
                                          <form onSubmit={txForm.handleSubmit(onTxSubmit)} className="space-y-4">
                                            <FormField control={txForm.control} name="type" render={({ field }) => (
                                              <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">نوع الحركة *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                  <FormControl><SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]"><SelectValue /></SelectTrigger></FormControl>
                                                  <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                                                    <SelectItem value="add" className="text-[12px] text-[#00D8D8]">إضافة للمخزون (+)</SelectItem>
                                                    <SelectItem value="withdraw" className="text-[12px] text-[#FF4D60]">سحب من المخزون (-)</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </FormItem>
                                            )} />
                                            <div className="grid grid-cols-2 gap-4">
                                              <FormField control={txForm.control} name="quantity" render={({ field }) => (
                                                <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الكمية *</FormLabel><FormControl><Input type="number" step="any" {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px] font-mono text-left" dir="ltr" /></FormControl></FormItem>
                                              )} />
                                              <FormField control={txForm.control} name="cost" render={({ field }) => (
                                                <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">التكلفة (إن وجدت)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value || ''} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px] font-mono text-left" dir="ltr" /></FormControl></FormItem>
                                              )} />
                                            </div>
                                            <FormField control={txForm.control} name="note" render={({ field }) => (
                                              <FormItem><FormLabel className="text-[#8EA2BD] text-[12px] font-bold">ملاحظات / السبب</FormLabel><FormControl><Input {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" /></FormControl></FormItem>
                                            )} />
                                            <div className="pt-4 mt-4 border-t border-[rgba(40,130,220,0.16)] flex justify-end gap-3">
                                              <button type="button" onClick={() => setSelectedItemId(null)} className="text-[#8EA2BD] hover:text-white bg-transparent h-[38px] px-5 rounded-[10px] text-[12px] transition-all">إلغاء</button>
                                              <button type="submit" disabled={processTransaction.isPending} className="bg-[#0A6CFF] text-white text-[12px] h-[38px] px-6 rounded-[10px] font-bold hover:brightness-110 transition-all border-0">حفظ الحركة</button>
                                            </div>
                                          </form>
                                        </Form>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
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
          </TabsContent>

          {/* ─── TAB 2: DEBTS ─── */}
          <TabsContent value="debts">
            {debtsLoading ? (
               <div className="flex items-center justify-center py-20 text-[#00D8D8]"><Activity className="w-8 h-8 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {!Array.isArray(debts) || debts.length === 0 ? (
                  <div className="col-span-3 text-center py-12 text-[#8EA2BD] text-[13px] bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[14px]">لا توجد ديون مسجلة للموردين</div>
                ) : (
                  debts.map((debt: any, idx: number) => (
                    <div key={idx} className="rounded-[14px] p-5 flex flex-col relative overflow-hidden transition-all duration-300 border border-[rgba(40,130,220,0.16)] bg-[#050C1F]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-[15px] text-white flex items-center gap-2"><Factory className="w-4 h-4 text-[#8EA2BD]" /> {debt.supplierName}</h3>
                      </div>
                      <div className="my-2">
                        <p className="text-[11px] text-[#8EA2BD] mb-1">إجمالي المبالغ المستحقة</p>
                        <div className="text-[28px] font-extrabold font-mono tracking-tight text-[#FFC857]" dir="ltr">₪ {debt.totalDebt}</div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-[rgba(40,130,220,0.16)] text-[11px] text-[#8EA2BD]">
                        يمثل هذا الرصيد إجمالي التكاليف المسجلة في حركات إضافة المخزون المرتبطة بهذا المورد. يجب تسجيل سداد الدفعات في قسم المالية.
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>

        </Tabs>
      </motion.div>
    </div>
  );
}