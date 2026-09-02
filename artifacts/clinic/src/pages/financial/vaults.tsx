import { useState } from "react";
import { useListVaults, useListVaultTransactions, useCreateVaultTransaction } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet, Lock, Unlock, History, ArrowRightLeft, Activity, CalendarIcon, ArrowDownRight, ArrowUpRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const transactionSchema = z.object({
  type: z.enum(['deposit', 'withdrawal', 'transfer_in', 'transfer_out']),
  amount: z.coerce.number().min(0.01, "المبلغ يجب أن يكون أكبر من صفر"),
  targetVaultId: z.coerce.number().optional(),
  note: z.string().optional()
});

function VaultDetails({ vaultId, vaultName }: { vaultId: number, vaultName: string }) {
  const { data: transactions, isLoading } = useListVaultTransactions(vaultId);

  const getTransactionTypeUI = (type: string) => {
    switch(type) {
      case 'deposit': 
        return <span className="flex items-center gap-1 text-[11px] font-bold text-[#00D8D8] bg-[rgba(0,217,208,0.1)] px-2 py-0.5 rounded-md border border-[rgba(0,217,208,0.2)] w-max"><ArrowDownRight className="w-3 h-3" /> إيداع</span>;
      case 'withdrawal': 
        return <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF4D60] bg-[rgba(255,77,96,0.1)] px-2 py-0.5 rounded-md border border-[rgba(255,77,96,0.2)] w-max"><ArrowUpRight className="w-3 h-3" /> سحب</span>;
      case 'transfer_in': 
        return <span className="flex items-center gap-1 text-[11px] font-bold text-[#0A6CFF] bg-[rgba(10,108,255,0.1)] px-2 py-0.5 rounded-md border border-[rgba(10,108,255,0.2)] w-max"><ArrowDownRight className="w-3 h-3" /> تحويل وارد</span>;
      case 'transfer_out': 
        return <span className="flex items-center gap-1 text-[11px] font-bold text-[#FFC857] bg-[rgba(255,200,87,0.1)] px-2 py-0.5 rounded-md border border-[rgba(255,200,87,0.2)] w-max"><ArrowUpRight className="w-3 h-3" /> تحويل صادر</span>;
      default: 
        return <span className="flex items-center gap-1 text-[11px] font-bold text-[#8EA2BD] bg-[rgba(142,162,189,0.1)] px-2 py-0.5 rounded-md border border-[rgba(142,162,189,0.2)] w-max">{type}</span>;
    }
  };

  return (
    <div className="mt-4">
      <div 
        className="rounded-[14px] overflow-hidden border"
        style={{ background: "#050C1F", borderColor: "rgba(40,130,220,0.16)" }}
      >
        <div className="overflow-auto max-h-[400px]">
          <table className="w-full text-right border-collapse">
            <thead className="sticky top-0 bg-[#050C1F] z-10">
              <tr style={{ background: "rgba(10,108,255,0.04)", borderBottom: "1px solid rgba(40,130,220,0.16)" }}>
                <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">التاريخ</th>
                <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">النوع</th>
                <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">المبلغ</th>
                <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">المستخدم</th>
                <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "rgba(40,130,220,0.08)" }}>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-12 text-[#0A6CFF]"><Activity className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : !Array.isArray(transactions) || transactions.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-[#8EA2BD] text-[13px]">لا يوجد حركات مسجلة</td></tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="transition-colors hover:bg-[rgba(10,108,255,0.02)]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-[12px] text-white" dir="ltr">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#8EA2BD]" />
                        {new Date(t.createdAt).toLocaleString('ar-EG')}
                      </div>
                    </td>
                    <td className="px-5 py-4">{getTransactionTypeUI(t.type)}</td>
                    <td className="px-5 py-4">
                      <span className={`font-bold font-mono text-[13px] ${t.type === 'deposit' || t.type === 'transfer_in' ? 'text-[#00D8D8]' : 'text-[#FF4D60]'}`} dir="ltr">
                        {t.type === 'deposit' || t.type === 'transfer_in' ? '+' : '-'} ₪{t.amount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[12px] text-white">{t.performedBy || '-'}</td>
                    <td className="px-5 py-4 text-[12px] text-[#8EA2BD] max-w-[150px] truncate" title={t.note || "-"}>{t.note || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Vaults() {
  const { data: vaults, isLoading } = useListVaults();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);

  const createTransaction = useCreateVaultTransaction({
    mutation: {
      onSuccess: () => {
        toast({ title: "تمت العملية", description: "تم تسجيل الحركة بنجاح" });
        queryClient.invalidateQueries({ queryKey: ['/api/financial/vaults'] });
        form.reset();
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشلت العملية", variant: "destructive" });
      }
    }
  });

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "deposit",
      amount: 0,
      note: ""
    }
  });

  const onSubmit = (values: z.infer<typeof transactionSchema>) => {
    if (!selectedVaultId) return;
    createTransaction.mutate({ id: selectedVaultId!, data: values });
  };

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        
        {/* ─── Header ─── */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              الخزن المالية
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              إدارة الأرصدة، تسجيل الإيداعات والسحوبات عبر الصناديق المختلفة.
            </p>
          </div>
        </div>

        {/* ─── Vaults Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-20 text-[#0A6CFF]">
              <Activity className="w-8 h-8 animate-spin" />
            </div>
          ) : Array.isArray(vaults) && vaults.map((vault: any) => (
            <div 
              key={vault.id} 
              className="rounded-[14px] flex flex-col relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border"
              style={{
                background: "#050C1F",
                borderColor: vault.balance < 0 ? "rgba(255,77,96,0.3)" : "rgba(40,130,220,0.16)",
                boxShadow: vault.balance < 0 ? "0 10px 30px rgba(255,77,96,0.05)" : "0 10px 30px rgba(0,0,0,0.2)"
              }}
            >
              <div 
                className="absolute top-0 right-0 left-0 h-1" 
                style={{ background: vault.balance < 0 ? "#FF4D60" : "linear-gradient(90deg, #0A6CFF, #00D8D8)" }} 
              />
              
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-[16px] text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[#0A6CFF]" /> {vault.name}
                  </h3>
                  {vault.isLocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#8EA2BD] bg-[rgba(142,162,189,0.1)] px-2 py-1 rounded-md border border-[rgba(142,162,189,0.2)]">
                      <Lock className="w-3 h-3" /> مقفلة
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#00D8D8] bg-[rgba(0,217,208,0.1)] px-2 py-1 rounded-md border border-[rgba(0,217,208,0.2)]">
                      <Unlock className="w-3 h-3" /> نشطة
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[12px] text-[#8EA2BD]">الرصيد الحالي</p>
                  <div className="text-[32px] font-extrabold font-mono tracking-tight flex items-center justify-end" dir="ltr" style={{ color: vault.balance < 0 ? "#FF4D60" : "#FFF" }}>
                    <span className="text-[18px] mr-2 opacity-50">₪</span>
                    {vault.balance.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-[rgba(6,19,41,0.4)] border-t border-[rgba(40,130,220,0.16)] p-4 flex gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <button 
                      onClick={() => setSelectedVaultId(vault.id)} 
                      disabled={vault.isLocked}
                      className="flex-1 flex items-center justify-center gap-1.5 h-[36px] rounded-[8px] text-[12px] font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:brightness-110 border-0"
                      style={{ background: "linear-gradient(135deg, #0A6CFF, #00D8D8)" }}
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" /> حركة جديدة
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px] border-[rgba(0,217,208,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(0,217,208,0.15)]">
                    <div className="bg-[rgba(0,217,208,0.1)] border-b border-[rgba(0,217,208,0.2)] px-6 py-4 flex items-center gap-3">
                      <div className="bg-[#00D8D8] rounded-full p-1.5 text-[#050C1F]"><ArrowRightLeft className="w-4 h-4" /></div>
                      <DialogTitle className="text-white font-extrabold text-[15px]">تسجيل حركة في ({vault.name})</DialogTitle>
                    </div>
                    <div className="p-6">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">نوع الحركة *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                                  <SelectItem value="deposit" className="text-[12px]">إيداع</SelectItem>
                                  <SelectItem value="withdrawal" className="text-[12px]">سحب</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="amount" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">المبلغ (₪) *</FormLabel>
                              <FormControl><Input type="number" step="0.01" {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px] font-mono text-left" dir="ltr" /></FormControl>
                              <FormMessage className="text-[#FF4D60] text-[10px]" />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="note" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">ملاحظات (اختياري)</FormLabel>
                              <FormControl><Textarea className="resize-none bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] min-h-[80px]" {...field} /></FormControl>
                            </FormItem>
                          )} />
                          <div className="pt-4 flex justify-end gap-3 mt-4">
                            <button type="submit" disabled={createTransaction.isPending} className="w-full bg-[#00D8D8] text-[#050C1F] text-[12px] h-[40px] rounded-[10px] font-bold hover:brightness-110 transition-all">
                              {createTransaction.isPending ? "جاري الحفظ..." : "حفظ الحركة"}
                            </button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <button 
                      onClick={() => setSelectedVaultId(vault.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 h-[36px] rounded-[8px] text-[12px] font-bold text-white bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] transition-all hover:bg-[rgba(255,255,255,0.1)]"
                    >
                      <History className="h-3.5 w-3.5" /> سجل الحركات
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] border-[rgba(40,130,220,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <div className="bg-gradient-to-l from-[#0A6CFF] to-[#00D8D8] px-6 py-4 flex items-center justify-between">
                      <DialogTitle className="text-white font-extrabold text-[16px]">التفاصيل المالية ({vault.name})</DialogTitle>
                    </div>
                    <div className="p-6">
                      {selectedVaultId === vault.id && <VaultDetails vaultId={vault.id} vaultName={vault.name} />}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}