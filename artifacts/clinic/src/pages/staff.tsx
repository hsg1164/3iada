import { useState } from "react";
import { useListStaff, useUpdateStaffDetails, useCreateStaffDetails, getListStaffQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserCircle, Clock, DollarSign, Briefcase, Phone, Calendar, Edit2, Users, Activity } from "lucide-react";

const WORK_DAYS = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

type StaffMember = {
  id: number;
  userId: number;
  name: string;
  username: string;
  email?: string | null;
  roleId: number;
  roleName: string;
  branch?: string | null;
  isFrozen: boolean;
  position?: string | null;
  specialty?: string | null;
  phone?: string | null;
  salary?: number | null;
  joiningDate?: string | null;
  workDays: string[];
  shiftStart?: string | null;
  shiftEnd?: string | null;
  notes?: string | null;
  createdAt: string;
};

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Staff() {
  const queryClient = useQueryClient();
  const { data: staff, isLoading } = useListStaff();
  const updateStaff = useUpdateStaffDetails();
  
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (m: StaffMember) => {
    setSelectedStaff(m);
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStaff) return;
    const fd = new FormData(e.currentTarget);
    const data = {
      position: fd.get("position") as string || undefined,
      specialty: fd.get("specialty") as string || undefined,
      phone: fd.get("phone") as string || undefined,
      salary: fd.get("salary") ? Number(fd.get("salary")) : undefined,
      joiningDate: fd.get("joiningDate") as string || undefined,
      shiftStart: fd.get("shiftStart") as string || undefined,
      shiftEnd: fd.get("shiftEnd") as string || undefined,
      notes: fd.get("notes") as string || undefined,
      workDays: fd.getAll("workDays") as string[],
    };
    updateStaff.mutate(
      { id: selectedStaff.id, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStaffQueryKey() });
          setIsDialogOpen(false);
          setSelectedStaff(null);
        }
      }
    );
  };

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#0A6CFF] tracking-tight flex items-center gap-2" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              <Users className="h-6 w-6" /> شؤون الموظفين
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              إدارة بيانات الأطباء والموظفين ومواعيد الدوام.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#0A6CFF]"><Activity className="w-8 h-8 animate-spin" /></div>
        ) : !Array.isArray(staff) || staff.length === 0 ? (
          <div className="text-center py-12 text-[#8EA2BD] text-[13px] bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[14px]">لا يوجد موظفين مسجلين</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map(member => (
              <div 
                key={member.id} 
                className={`rounded-[14px] p-5 flex flex-col relative overflow-hidden transition-all duration-300 hover:scale-[1.02] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] ${member.isFrozen ? "opacity-60 grayscale" : ""}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[rgba(10,108,255,0.1)] rounded-full p-2 text-[#0A6CFF]">
                      <UserCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[15px] text-white">{member.name}</h3>
                      <p className="text-[11px] text-[#8EA2BD] mt-0.5">{member.position || member.roleName}</p>
                      {member.specialty && <p className="text-[10px] text-[#8B5CF6] mt-0.5">{member.specialty}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2 py-0.5 rounded-[4px] border text-[10px] font-bold ${member.isFrozen ? 'bg-[rgba(255,77,96,0.1)] text-[#FF4D60] border-[rgba(255,77,96,0.2)]' : 'bg-[rgba(0,217,208,0.1)] text-[#00D8D8] border-[rgba(0,217,208,0.2)]'}`}>
                      {member.isFrozen ? "موقوف" : "نشط"}
                    </span>
                    <span className="px-2 py-0.5 rounded-[4px] border border-[rgba(142,162,189,0.2)] text-[10px] text-[#8EA2BD] bg-[rgba(142,162,189,0.05)]">
                      {member.roleName}
                    </span>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-3 text-[12px]">
                  {member.phone && (
                    <div className="flex items-center gap-1.5 text-white">
                      <Phone className="h-3.5 w-3.5 text-[#8EA2BD]" /> {member.phone}
                    </div>
                  )}
                  {member.branch && (
                    <div className="flex items-center gap-1.5 text-white">
                      <Briefcase className="h-3.5 w-3.5 text-[#8EA2BD]" /> {member.branch}
                    </div>
                  )}
                  {member.salary != null && (
                    <div className="flex items-center gap-1.5 font-mono text-[#00D8D8]">
                      <DollarSign className="h-3.5 w-3.5 text-[#8EA2BD]" /> ₪{member.salary.toLocaleString("ar-EG")}
                    </div>
                  )}
                  {member.joiningDate && (
                    <div className="flex items-center gap-1.5 text-white">
                      <Calendar className="h-3.5 w-3.5 text-[#8EA2BD]" /> {member.joiningDate}
                    </div>
                  )}
                  {(member.shiftStart || member.shiftEnd) && (
                    <div className="flex items-center gap-1.5 text-white col-span-2">
                      <Clock className="h-3.5 w-3.5 text-[#8EA2BD]" /> {member.shiftStart} - {member.shiftEnd}
                    </div>
                  )}
                </div>

                {member.workDays.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[rgba(40,130,220,0.16)] flex flex-wrap gap-1.5">
                    {member.workDays.map(d => (
                      <span key={d} className="px-2 py-0.5 rounded-[4px] bg-[rgba(10,108,255,0.1)] text-[#0A6CFF] border border-[rgba(10,108,255,0.2)] text-[10px] font-bold">{d}</span>
                    ))}
                  </div>
                )}
                
                <button 
                  onClick={() => handleEdit(member)}
                  className="mt-4 w-full h-[36px] flex items-center justify-center gap-2 rounded-[8px] bg-[rgba(255,255,255,0.05)] text-white text-[12px] font-bold transition-all hover:bg-[rgba(10,108,255,0.1)] hover:text-[#0A6CFF]"
                >
                  <Edit2 className="w-3.5 h-3.5" /> تعديل البيانات
                </button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-[rgba(10,108,255,0.3)] bg-[#050C1F] p-0 shadow-[0_0_40px_rgba(10,108,255,0.15)]">
            <div className="bg-gradient-to-l from-[#0A6CFF] to-[#00D8D8] px-6 py-4 flex items-center justify-between">
              <DialogTitle className="text-white font-extrabold text-[16px]">تعديل بيانات: {selectedStaff?.name}</DialogTitle>
            </div>
            <div className="p-6">
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[#8EA2BD] text-[12px] font-bold">المسمى الوظيفي</Label>
                    <Input name="position" defaultValue={selectedStaff?.position || ""} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#8EA2BD] text-[12px] font-bold">التخصص</Label>
                    <Input name="specialty" defaultValue={selectedStaff?.specialty || ""} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#8EA2BD] text-[12px] font-bold">رقم الهاتف</Label>
                    <Input name="phone" defaultValue={selectedStaff?.phone || ""} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#8EA2BD] text-[12px] font-bold">الراتب المتفق عليه (₪)</Label>
                    <Input name="salary" type="number" defaultValue={selectedStaff?.salary || ""} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px] font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#8EA2BD] text-[12px] font-bold">تاريخ الانضمام</Label>
                    <Input name="joiningDate" type="date" defaultValue={selectedStaff?.joiningDate || ""} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" style={{ colorScheme: "dark" }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#8EA2BD] text-[12px] font-bold">الدوام من / إلى</Label>
                    <div className="flex gap-2">
                      <Input name="shiftStart" type="time" defaultValue={selectedStaff?.shiftStart || ""} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" style={{ colorScheme: "dark" }} />
                      <Input name="shiftEnd" type="time" defaultValue={selectedStaff?.shiftEnd || ""} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[40px]" style={{ colorScheme: "dark" }} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#8EA2BD] text-[12px] font-bold">أيام العمل</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {WORK_DAYS.map(day => (
                      <label key={day} className="flex items-center gap-1.5 text-[12px] text-white">
                        <input type="checkbox" name="workDays" value={day} defaultChecked={selectedStaff?.workDays?.includes(day)} className="rounded border-[rgba(40,130,220,0.16)] bg-[rgba(6,19,41,0.6)]" />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-[rgba(40,130,220,0.16)]">
                  <button type="button" onClick={() => setIsDialogOpen(false)} className="text-[#8EA2BD] hover:text-white bg-transparent h-[40px] px-5 rounded-[10px] text-[12px] transition-all border-0">إلغاء</button>
                  <button type="submit" disabled={updateStaff.isPending} className="bg-[#0A6CFF] text-white text-[12px] h-[40px] px-6 rounded-[10px] font-bold hover:brightness-110 transition-all border-0">حفظ التغييرات</button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>

      </motion.div>
    </div>
  );
}
