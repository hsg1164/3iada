import { useState } from "react";
import { useGetPatientsAnalytics, useGetAppointmentsAnalytics, useGetClinicalAnalytics } from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Users, Calendar, Stethoscope, BarChart2, PieChart as PieChartIcon, Activity } from "lucide-react";

const COLORS = ['#0A6CFF', '#00D8D8', '#8B5CF6', '#FFC857', '#FF4D60', '#14b8a6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#061329] border border-[rgba(40,130,220,0.16)] p-3 rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <p className="font-bold text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-[12px] text-[#8EA2BD]">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.name}: <span className="font-bold text-white">{entry.value}</span></span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Analytics() {
  const [period, setPeriod] = useState("month");
  
  const { data: patientStats, isLoading: patientsLoading } = useGetPatientsAnalytics({ period });
  const { data: apptStats, isLoading: apptsLoading } = useGetAppointmentsAnalytics({ period });
  const { data: clinicalStats, isLoading: clinicalLoading } = useGetClinicalAnalytics({ period });

  const genderData = patientStats?.genderStats ? [
    { name: 'ذكور', value: patientStats.genderStats.male || 0 },
    { name: 'إناث', value: patientStats.genderStats.female || 0 }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#00D8D8] tracking-tight flex items-center gap-2" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              <BarChart2 className="h-6 w-6" /> التحليلات والتقارير
            </h1>
            <p className="text-[13px] mt-2 font-medium" style={{ color: "#8EA2BD" }}>
              إحصائيات شاملة للمرضى، المواعيد، والأداء الطبي
            </p>
          </div>
          <div className="flex bg-[rgba(6,19,41,0.6)] border border-[rgba(40,130,220,0.16)] rounded-[10px] p-1">
            <button onClick={() => setPeriod("week")} className={`px-4 py-1.5 text-[12px] font-bold rounded-[8px] transition-all ${period === "week" ? "bg-[rgba(10,108,255,0.1)] text-[#0A6CFF]" : "text-[#8EA2BD] hover:text-white"}`}>أسبوع</button>
            <button onClick={() => setPeriod("month")} className={`px-4 py-1.5 text-[12px] font-bold rounded-[8px] transition-all ${period === "month" ? "bg-[rgba(10,108,255,0.1)] text-[#0A6CFF]" : "text-[#8EA2BD] hover:text-white"}`}>شهر</button>
            <button onClick={() => setPeriod("year")} className={`px-4 py-1.5 text-[12px] font-bold rounded-[8px] transition-all ${period === "year" ? "bg-[rgba(10,108,255,0.1)] text-[#0A6CFF]" : "text-[#8EA2BD] hover:text-white"}`}>سنة</button>
          </div>
        </div>

        <Tabs defaultValue="patients" className="w-full">
          <TabsList className="mb-6 grid grid-cols-3 max-w-2xl bg-[#050C1F] border border-[rgba(40,130,220,0.16)] rounded-[10px] h-[48px] p-1">
            <TabsTrigger value="patients" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD]"><Users className="h-4 w-4 ml-2" /> إحصائيات المرضى</TabsTrigger>
            <TabsTrigger value="appointments" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD]"><Calendar className="h-4 w-4 ml-2" /> أداء الحجوزات</TabsTrigger>
            <TabsTrigger value="clinical" className="text-[12px] font-bold rounded-[8px] data-[state=active]:bg-[rgba(10,108,255,0.1)] data-[state=active]:text-[#0A6CFF] text-[#8EA2BD]"><Stethoscope className="h-4 w-4 ml-2" /> الأداء الطبي</TabsTrigger>
          </TabsList>

          {/* PATIENTS TAB */}
          <TabsContent value="patients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
                <div className="bg-[rgba(10,108,255,0.04)] border-b border-[rgba(40,130,220,0.16)] p-4 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-[#0A6CFF]" />
                  <h2 className="font-bold text-[14px] text-white">التوزيع العمري</h2>
                </div>
                <div className="p-5 h-[300px]">
                  {patientsLoading ? <div className="flex items-center justify-center h-full text-[#0A6CFF]"><Activity className="w-8 h-8 animate-spin" /></div> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={patientStats?.ageDistribution || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(40,130,220,0.1)" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8EA2BD' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8EA2BD' }} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10,108,255,0.05)' }} />
                        <Bar dataKey="count" name="عدد المرضى" fill="#0A6CFF" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
                <div className="bg-[rgba(0,217,208,0.04)] border-b border-[rgba(40,130,220,0.16)] p-4 flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-[#00D8D8]" />
                  <h2 className="font-bold text-[14px] text-white">التوزيع حسب الجنس</h2>
                </div>
                <div className="p-5 h-[300px]">
                  {patientsLoading ? <div className="flex items-center justify-center h-full text-[#00D8D8]"><Activity className="w-8 h-8 animate-spin" /></div> : genderData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[#8EA2BD] text-[13px]">لا توجد بيانات</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                          {genderData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#8EA2BD' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden lg:col-span-2">
                <div className="bg-[rgba(139,92,246,0.04)] border-b border-[rgba(40,130,220,0.16)] p-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#8B5CF6]" />
                  <h2 className="font-bold text-[14px] text-white">توزيع المحافظات والمناطق</h2>
                </div>
                <div className="p-6">
                  {patientsLoading ? <div className="flex items-center justify-center py-10 text-[#8B5CF6]"><Activity className="w-8 h-8 animate-spin" /></div> : (
                    <div className="space-y-5">
                      {patientStats?.governorateStats?.map((gov, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[12px] mb-2">
                            <span className="font-bold text-white">{gov.label || 'غير محدد'}</span>
                            <span className="text-[#8EA2BD]">{gov.count} مريض ({gov.percentage}%)</span>
                          </div>
                          <div className="h-2 w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]">
                            <div className="h-full bg-gradient-to-l from-[#8B5CF6] to-[#0A6CFF] rounded-full" style={{ width: `${gov.percentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                      {!patientStats?.governorateStats?.length && <div className="text-center py-4 text-[#8EA2BD] text-[13px]">لا توجد بيانات</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* APPOINTMENTS TAB */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden lg:col-span-2">
                <div className="bg-[rgba(10,108,255,0.04)] border-b border-[rgba(40,130,220,0.16)] p-4">
                  <h2 className="font-bold text-[14px] text-white">أعلى الخدمات طلباً</h2>
                  <p className="text-[11px] text-[#8EA2BD] mt-0.5">أكثر الخدمات الطبية التي تم حجزها خلال الفترة المحددة</p>
                </div>
                <div className="p-5 h-[350px]">
                  {apptsLoading ? <div className="flex items-center justify-center h-full text-[#0A6CFF]"><Activity className="w-8 h-8 animate-spin" /></div> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={apptStats?.topServices || []} margin={{ top: 10, right: 30, left: 100, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(40,130,220,0.1)" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8EA2BD' }} />
                        <YAxis dataKey="serviceName" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 12, fill: '#white', fontWeight: 'bold' }} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10,108,255,0.05)' }} />
                        <Bar dataKey="count" name="عدد الطلبات" fill="#00D8D8" radius={[0, 4, 4, 0]} maxBarSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
                <div className="bg-[rgba(255,200,87,0.04)] border-b border-[rgba(40,130,220,0.16)] p-4">
                  <h2 className="font-bold text-[14px] text-white">حالات الحجوزات</h2>
                </div>
                <div className="p-5 h-[300px]">
                  {apptsLoading ? <div className="flex items-center justify-center h-full text-[#FFC857]"><Activity className="w-8 h-8 animate-spin" /></div> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={apptStats?.statusBreakdown?.map(s => ({ name: s.status, value: s.count, percentage: s.percentage })) || []} 
                             cx="50%" cy="50%" outerRadius={100} dataKey="value" stroke="none"
                             label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                             labelLine={{ stroke: '#8EA2BD', strokeWidth: 1 }}
                        >
                          {(apptStats?.statusBreakdown || []).map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              
              <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
                <div className="bg-[rgba(255,77,96,0.04)] border-b border-[rgba(40,130,220,0.16)] p-4">
                  <h2 className="font-bold text-[14px] text-white">إنتاجية الطاقم</h2>
                </div>
                <div className="p-6">
                  {apptsLoading ? <div className="flex items-center justify-center py-10 text-[#FF4D60]"><Activity className="w-8 h-8 animate-spin" /></div> : (
                    <div className="space-y-4">
                      {apptStats?.byStaff?.map((staff, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-[rgba(40,130,220,0.08)] rounded-[12px] bg-[rgba(6,19,41,0.4)] transition-colors hover:bg-[rgba(10,108,255,0.05)]">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-[rgba(10,108,255,0.1)] flex items-center justify-center text-[#0A6CFF] font-bold text-[14px]">
                              {staff.staffName.charAt(0)}
                            </div>
                            <span className="font-bold text-[14px] text-white">{staff.staffName}</span>
                          </div>
                          <div className="text-[18px] font-bold font-mono text-[#00D8D8]">{staff.count} <span className="text-[11px] text-[#8EA2BD] font-sans font-normal">حجز</span></div>
                        </div>
                      ))}
                      {!apptStats?.byStaff?.length && <div className="text-center py-8 text-[#8EA2BD] text-[13px]">لا توجد بيانات</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* CLINICAL TAB */}
          <TabsContent value="clinical" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
                <div className="bg-[rgba(255,77,96,0.04)] border-b border-[rgba(40,130,220,0.16)] p-4">
                  <h2 className="font-bold text-[14px] text-white">أكثر التشخيصات شيوعاً</h2>
                </div>
                <div className="p-6">
                  {clinicalLoading ? <div className="flex items-center justify-center py-10 text-[#FF4D60]"><Activity className="w-8 h-8 animate-spin" /></div> : (
                    <div className="space-y-5">
                      {clinicalStats?.topDiagnoses?.map((diag, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[12px] mb-2">
                            <span className="font-bold text-white">{diag.diagnosis}</span>
                            <span className="text-[#8EA2BD]">{diag.count} حالة ({diag.percentage}%)</span>
                          </div>
                          <div className="h-2 w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]">
                            <div className="h-full bg-gradient-to-l from-[#FF4D60] to-[#FFC857] rounded-full" style={{ width: `${diag.percentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                      {!clinicalStats?.topDiagnoses?.length && <div className="text-center py-4 text-[#8EA2BD] text-[13px]">لا توجد بيانات</div>}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden">
                <div className="bg-[rgba(10,108,255,0.04)] border-b border-[rgba(40,130,220,0.16)] p-4">
                  <h2 className="font-bold text-[14px] text-white">الأدوية الأكثر وصفاً</h2>
                </div>
                <div className="p-6">
                  {clinicalLoading ? <div className="flex items-center justify-center py-10 text-[#0A6CFF]"><Activity className="w-8 h-8 animate-spin" /></div> : (
                    <div className="space-y-5">
                      {clinicalStats?.topMedications?.map((med, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[12px] mb-2">
                            <span className="font-bold text-white" dir="ltr">{med.medication}</span>
                            <span className="text-[#8EA2BD]">{med.count} وصفة ({med.percentage}%)</span>
                          </div>
                          <div className="h-2 w-full bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]">
                            <div className="h-full bg-gradient-to-l from-[#0A6CFF] to-[#00D8D8] rounded-full" style={{ width: `${med.percentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                      {!clinicalStats?.topMedications?.length && <div className="text-center py-4 text-[#8EA2BD] text-[13px]">لا توجد بيانات</div>}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[14px] border border-[rgba(40,130,220,0.16)] bg-[#050C1F] overflow-hidden md:col-span-2">
                <div className="bg-[rgba(139,92,246,0.04)] border-b border-[rgba(40,130,220,0.16)] p-4">
                  <h2 className="font-bold text-[14px] text-white">مصادر الإحالة (العيادات الخارجية / الأطباء)</h2>
                </div>
                <div className="p-6 h-[280px]">
                  {clinicalLoading ? <div className="flex items-center justify-center h-full text-[#8B5CF6]"><Activity className="w-8 h-8 animate-spin" /></div> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={clinicalStats?.referralStats || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(40,130,220,0.1)" />
                        <XAxis dataKey="provider" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8EA2BD' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8EA2BD' }} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(10,108,255,0.05)' }} />
                        <Bar dataKey="count" name="عدد الإحالات" fill="#8B5CF6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}