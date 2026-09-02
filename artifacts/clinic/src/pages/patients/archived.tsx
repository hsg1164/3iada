import { useListDeletedPatients, useRestorePatient, usePermanentDeletePatient } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, RefreshCw, Trash2, ArrowRight, User, Phone, Activity } from "lucide-react";
import { Link } from "wouter";

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ArchivedPatients() {
  const { data: patients, isLoading } = useListDeletedPatients();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const restorePatient = useRestorePatient({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم الاستعادة", description: "تم استعادة المريض بنجاح" });
        queryClient.invalidateQueries();
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشلت عملية الاستعادة", variant: "destructive" });
      }
    }
  });

  const permanentDeletePatient = usePermanentDeletePatient({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم الحذف", description: "تم حذف المريض نهائياً" });
        queryClient.invalidateQueries();
      },
      onError: () => {
        toast({ title: "خطأ", description: "فشلت عملية الحذف النهائي", variant: "destructive" });
      }
    }
  });

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        
        {/* ─── Header ─── */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/patients">
            <button className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-[rgba(6,19,41,0.6)] border border-[rgba(40,130,220,0.16)] text-[#8EA2BD] transition-all hover:bg-[rgba(10,108,255,0.1)] hover:text-white">
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-[28px] font-extrabold text-[#FFC857] tracking-tight" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              أرشيف المرضى (المحذوفين)
            </h1>
            <p className="text-[13px] mt-1 font-medium text-[#8EA2BD]">إدارة ملفات المرضى المؤرشفة مع إمكانية استعادتها أو حذفها نهائياً.</p>
          </div>
        </div>

        {/* ─── Warning Banner ─── */}
        <div 
          className="rounded-[14px] p-5 flex items-start gap-4 border"
          style={{
            background: "linear-gradient(145deg, rgba(255,200,87,0.1), rgba(255,200,87,0.02))",
            borderColor: "rgba(255,200,87,0.2)"
          }}
        >
          <div className="bg-[#FFC857] rounded-full p-2 mt-0.5 text-[#050C1F] shadow-[0_0_15px_rgba(255,200,87,0.3)]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#FFC857] text-[15px]">انتبه: هؤلاء المرضى محذوفون</h3>
            <p className="text-[#8EA2BD] text-[13px] mt-1.5 leading-relaxed">
              يمكنك استعادة ملفاتهم للعمل عليها مجدداً، أو حذفها نهائياً مما سيؤدي إلى مسح كافة بياناتهم من النظام ولا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
        </div>

        {/* ─── Archived Table ─── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#FFC857]">
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
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD]">تاريخ الأرشفة</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#8EA2BD] text-left">أدوات</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "rgba(40,130,220,0.08)" }}>
                  {!Array.isArray(patients) || patients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-[#8EA2BD] text-[13px]">
                        لا يوجد مرضى في الأرشيف
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient: any, index: number) => (
                      <tr key={patient.id} className="transition-colors hover:bg-[rgba(255,200,87,0.03)]">
                        <td className="px-5 py-4 text-[12px] text-[#8EA2BD]">{index + 1}</td>
                        <td className="px-5 py-4 font-mono text-[11px] text-[#FFC857] bg-[rgba(255,200,87,0.05)] rounded-md inline-block mt-3 ml-2">
                          {patient.localCode}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold text-[#050C1F] shrink-0"
                              style={{ background: "#FFC857" }}
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
                          <div className="flex items-center gap-2 text-[11px] text-white" dir="ltr">
                            <Phone className="w-3 h-3 text-[#8EA2BD]" /> 
                            {patient.phones?.[0]?.number || "-"}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[11px] text-[#8EA2BD]">
                          {new Date().toLocaleDateString("ar-EG")}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            
                            {/* Restore Button */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="flex items-center gap-1.5 h-8 px-3 rounded-[6px] text-[11px] font-bold bg-[rgba(0,217,208,0.1)] text-[#00D8D8] border border-[rgba(0,217,208,0.2)] hover:bg-[#00D8D8] hover:text-[#050C1F] transition-all">
                                  <RefreshCw className="w-3.5 h-3.5" /> استعادة
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="sm:max-w-[400px] border-[rgba(0,217,208,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(0,217,208,0.15)]">
                                <div className="bg-[rgba(0,217,208,0.1)] border-b border-[rgba(0,217,208,0.2)] px-6 py-4 flex items-center gap-3">
                                  <div className="bg-[#00D8D8] rounded-full p-1.5 text-[#050C1F]">
                                    <RefreshCw className="w-4 h-4" />
                                  </div>
                                  <AlertDialogTitle className="text-white font-extrabold text-[15px]">استعادة ملف المريض</AlertDialogTitle>
                                </div>
                                <div className="p-6">
                                  <AlertDialogDescription className="text-[#8EA2BD] text-[13px] leading-relaxed">
                                    هل أنت متأكد من رغبتك في استعادة ملف المريض <strong className="text-white">{patient.nameAr}</strong>؟ سيتمكن من الظهور في قائمة المرضى النشطين.
                                  </AlertDialogDescription>
                                  <div className="pt-4 flex justify-end gap-3 mt-6">
                                    <AlertDialogCancel className="bg-transparent text-[#8EA2BD] hover:text-white hover:bg-[rgba(255,255,255,0.05)] border-0 text-[12px] h-[38px] px-5 m-0">إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => restorePatient.mutate({ id: patient.id })} className="bg-[#00D8D8] text-[#050C1F] text-[12px] h-[38px] px-6 font-bold hover:brightness-110 border-0 m-0">نعم، استعادة</AlertDialogAction>
                                  </div>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>

                            {/* Delete Button */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="flex items-center gap-1.5 h-8 px-3 rounded-[6px] text-[11px] font-bold bg-[rgba(255,77,96,0.1)] text-[#FF4D60] border border-[rgba(255,77,96,0.2)] hover:bg-[#FF4D60] hover:text-white transition-all">
                                  <Trash2 className="w-3.5 h-3.5" /> حذف نهائي
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="sm:max-w-[400px] border-[rgba(255,77,96,0.3)] bg-[#050C1F] p-0 overflow-hidden shadow-[0_0_40px_rgba(255,77,96,0.15)]">
                                <div className="bg-[rgba(255,77,96,0.1)] border-b border-[rgba(255,77,96,0.2)] px-6 py-4 flex items-center gap-3">
                                  <div className="bg-[#FF4D60] rounded-full p-1.5 text-white">
                                    <Trash2 className="w-4 h-4" />
                                  </div>
                                  <AlertDialogTitle className="text-white font-extrabold text-[15px]">حذف نهائي للمريض</AlertDialogTitle>
                                </div>
                                <div className="p-6">
                                  <AlertDialogDescription className="text-[#8EA2BD] text-[13px] leading-relaxed">
                                    هل أنت متأكد من الحذف النهائي لملف <strong className="text-[#FF4D60]">{patient.nameAr}</strong>؟ هذا الإجراء سيقوم بمسح كافة بياناته وزياراته من النظام ولا يمكن التراجع عنه.
                                  </AlertDialogDescription>
                                  <div className="pt-4 flex justify-end gap-3 mt-6">
                                    <AlertDialogCancel className="bg-transparent text-[#8EA2BD] hover:text-white hover:bg-[rgba(255,255,255,0.05)] border-0 text-[12px] h-[38px] px-5 m-0">إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => permanentDeletePatient.mutate({ id: patient.id })} className="bg-[#FF4D60] text-white text-[12px] h-[38px] px-6 font-bold hover:brightness-110 border-0 m-0">نعم، حذف نهائي</AlertDialogAction>
                                  </div>
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
      </motion.div>
    </div>
  );
}