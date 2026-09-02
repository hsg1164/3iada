import { useState } from "react";
import { useListTasks, useCreateTask, useUpdateTask, useDeleteTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, CheckCircle2, Circle, ClipboardList, AlertCircle, ArrowUpCircle, Activity } from "lucide-react";

type Priority = "low" | "normal" | "high";
type Task = {
  id: number;
  title: string;
  content?: string | null;
  assignedTo?: string | null;
  priority: Priority;
  isCompleted: boolean;
  dueDate?: string | null;
  branch?: string | null;
  createdAt: string;
  updatedAt: string;
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; Icon: React.ElementType }> = {
  high:   { label: "عالية",  color: "text-[#FF4D60] bg-[rgba(255,77,96,0.1)] border-[rgba(255,77,96,0.2)]",    Icon: AlertCircle },
  normal: { label: "عادية",  color: "text-[#FFC857] bg-[rgba(255,200,87,0.1)] border-[rgba(255,200,87,0.2)]", Icon: ArrowUpCircle },
  low:    { label: "منخفضة", color: "text-[#0A6CFF] bg-[rgba(10,108,255,0.1)] border-[rgba(10,108,255,0.2)]",    Icon: ClipboardList },
};

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function TaskCard({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  const p = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.normal;
  return (
    <div className={`rounded-[14px] p-5 flex flex-col border transition-all duration-300 hover:scale-[1.02] ${task.isCompleted ? "opacity-60 bg-[rgba(6,19,41,0.4)] border-[rgba(40,130,220,0.08)]" : "bg-[#050C1F] border-[rgba(40,130,220,0.16)]"}`}>
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className="mt-0.5 shrink-0 transition-colors text-[#8EA2BD] hover:text-[#0A6CFF]">
          {task.isCompleted ? <CheckCircle2 className="h-5 w-5 text-[#00D8D8]" /> : <Circle className="h-5 w-5" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-bold text-[14px] ${task.isCompleted ? "line-through text-[#8EA2BD]" : "text-white"}`}>
              {task.title}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-[4px] border font-bold ${p.color}`}>
                <p.Icon className="h-3 w-3" />
                {p.label}
              </span>
              <button onClick={onDelete} className="text-[#8EA2BD] hover:text-[#FF4D60] transition-colors p-1 bg-[rgba(255,255,255,0.05)] rounded-md hover:bg-[rgba(255,77,96,0.1)]">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {task.content && (
            <p className="text-[12px] text-[#8EA2BD] mt-2 whitespace-pre-wrap leading-relaxed">{task.content}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-[rgba(40,130,220,0.16)] text-[11px] text-[#8EA2BD]">
            {task.assignedTo && <span>مسؤول: <span className="font-bold text-white">{task.assignedTo}</span></span>}
            {task.dueDate && <span>الموعد: <span className="font-bold text-white">{task.dueDate}</span></span>}
            {task.branch && <span>الفرع: <span className="font-bold text-white">{task.branch}</span></span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTaskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", content: "", assignedTo: "", priority: "normal" as Priority, dueDate: "", branch: "" });
  const createMutation = useCreateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        setForm({ title: "", content: "", assignedTo: "", priority: "normal", dueDate: "", branch: "" });
        onClose();
      }
    }
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[450px] border-[rgba(10,108,255,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(10,108,255,0.15)]">
        <div className="bg-gradient-to-l from-[#0A6CFF] to-[#00D8D8] px-6 py-4 flex items-center justify-between">
          <DialogTitle className="text-white font-extrabold text-[16px]">مهمة / ملاحظة جديدة</DialogTitle>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[#8EA2BD] text-[12px] font-bold">العنوان *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="عنوان المهمة أو الملاحظة" className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[#8EA2BD] text-[12px] font-bold">التفاصيل</Label>
            <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="وصف تفصيلي..." rows={3} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] resize-none min-h-[80px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[#8EA2BD] text-[12px] font-bold">الفرع</Label>
              <Select value={form.branch} onValueChange={v => setForm(f => ({ ...f, branch: v }))}>
                <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]"><SelectValue placeholder="اختر الفرع" /></SelectTrigger>
                <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                  <SelectItem value="غزة" className="text-[12px]">غزة</SelectItem>
                  <SelectItem value="خان يونس" className="text-[12px]">خان يونس</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#8EA2BD] text-[12px] font-bold">المسؤول (اختياري)</Label>
              <Input value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} placeholder="اسم الموظف" className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#8EA2BD] text-[12px] font-bold">الأولوية</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as Priority }))}>
                <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                  <SelectItem value="low" className="text-[12px] text-[#0A6CFF]">منخفضة</SelectItem>
                  <SelectItem value="normal" className="text-[12px] text-[#FFC857]">عادية</SelectItem>
                  <SelectItem value="high" className="text-[12px] text-[#FF4D60]">عالية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[#8EA2BD] text-[12px] font-bold">تاريخ الاستحقاق</Label>
              <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" style={{ colorScheme: "dark" }} />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-[rgba(40,130,220,0.16)]">
            <button type="button" onClick={onClose} className="text-[#8EA2BD] hover:text-white bg-transparent h-[40px] px-5 rounded-[10px] text-[12px] transition-all border-0">إلغاء</button>
            <button 
              onClick={() => { if (form.title.trim()) createMutation.mutate({ data: form }); }}
              disabled={createMutation.isPending || !form.title.trim()} 
              className="bg-[#0A6CFF] text-white text-[12px] h-[40px] px-6 rounded-[10px] font-bold hover:brightness-110 transition-all border-0 disabled:opacity-50"
            >
              {createMutation.isPending ? "جاري الحفظ..." : "حفظ المهمة"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Tasks() {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useListTasks();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const [addOpen, setAddOpen] = useState(false);

  const toggleTask = (t: Task) => {
    updateMutation.mutate(
      { id: t.id, data: { isCompleted: !t.isCompleted } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() }) }
    );
  };

  const deleteTask = (t: Task) => {
    if (!confirm("هل أنت متأكد من حذف المهمة؟")) return;
    deleteMutation.mutate(
      { id: t.id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() }) }
    );
  };

  const sortedTasks = Array.isArray(tasks) ? [...tasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }) : [];

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#00D8D8] tracking-tight flex items-center gap-2" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              <ClipboardList className="h-6 w-6" /> الملاحظات والمهام
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              إدارة مهام الطاقم والملاحظات اليومية.
            </p>
          </div>
          <button 
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 h-[40px] px-6 rounded-[10px] text-[12px] font-bold text-[#050C1F] bg-[#00D8D8] transition-all hover:scale-[1.02] hover:brightness-110 border-0 shadow-[0_4px_15px_rgba(0,217,208,0.25)]"
          >
            <Plus className="h-4 w-4" /> إضافة مهمة
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#00D8D8]"><Activity className="w-8 h-8 animate-spin" /></div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-center py-12 text-[#8EA2BD] text-[13px] bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[14px]">لا توجد مهام حالياً. أضف مهمة جديدة.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedTasks.map(t => (
              <TaskCard 
                key={t.id} 
                task={t} 
                onToggle={() => toggleTask(t)} 
                onDelete={() => deleteTask(t)} 
              />
            ))}
          </div>
        )}

        <AddTaskDialog open={addOpen} onClose={() => setAddOpen(false)} />
      </motion.div>
    </div>
  );
}
