import { useState } from "react";
import { useLocation } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  useGetNextPatientCode, 
  useCreatePatient, 
  useListReferralProviders 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Plus, Trash2, User, Phone, MapPin, Briefcase, FileText, Share2, Activity, UserPlus } from "lucide-react";

/* ─── Schema ─── */
const patientSchema = z.object({
  localCode: z.coerce.number().optional(),
  nameAr: z.string().min(2, "الاسم مطلوب"),
  nameEn: z.string().optional(),
  gender: z.enum(["male", "female"]),
  dateOfBirth: z.string().optional(),
  idNumber: z.string().optional(),
  phones: z.array(z.object({
    number: z.string().min(5, "رقم الهاتف مطلوب"),
    owner: z.string().optional()
  })).optional(),
  homePhone: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  governorate: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  birthPlace: z.string().optional(),
  occupation: z.string().optional(),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal("")),
  insuranceStatus: z.string().optional(),
  referredBy: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional()
});

/* ─── Lists ─── */
const phoneOwnerOptions = ["شخصي", "الأب", "الأم", "الزوج/الزوجة", "الابن/الابنة", "أخ/أخت", "أخرى"];
const maritalOptions = ["أعزب/عزباء", "متزوج/متزوجة", "مطلق/مطلقة", "أرمل/أرملة", "غير محدد"];
const insuranceOptions = ["بدون تأمين", "تأمين حكومي", "تأمين وكالة", "تأمين خاص", "تأمين نقابة", "أخرى"];
const sourceOptions = ["زيارة سابقة", "فيسبوك", "انستغرام", "جوجل", "صديق/قريب", "إعلان", "أخرى"];
const governorateList = ["غزة", "شمال غزة", "الوسطى", "خانيونس", "رفح", "القدس", "الضفة الغربية", "أخرى"];

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function NewPatient() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: codeData } = useGetNextPatientCode();
  const { data: providersData } = useListReferralProviders();
  
  const createPatient = useCreatePatient({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم بنجاح", description: "تم تسجيل المريض بنجاح" });
        queryClient.invalidateQueries();
        setLocation("/patients");
      },
      onError: () => {
        toast({ title: "خطأ", description: "حدث خطأ أثناء التسجيل", variant: "destructive" });
      }
    }
  });

  const form = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: "male",
      phones: [{ number: "", owner: "شخصي" }],
      nameAr: "",
      nameEn: "",
      dateOfBirth: "",
      homePhone: "",
      maritalStatus: "",
      nationality: "",
      address: "",
      governorate: "",
      birthPlace: "",
      occupation: "",
      email: "",
      insuranceStatus: "",
      referredBy: "",
      notes: ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "phones"
  });

  if (codeData?.nextCode && !form.getValues("localCode")) {
    form.setValue("localCode", codeData.nextCode);
  }

  const onSubmit = (values: z.infer<typeof patientSchema>) => {
    const filteredPhones = values.phones?.filter(p => p.number.trim() !== "");
    createPatient.mutate({ data: { ...values, phones: filteredPhones } });
  };

  return (
    <div className="min-h-full" dir="rtl">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-6">
        
        {/* ─── Header ─── */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setLocation("/patients")}
            className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-[rgba(6,19,41,0.6)] border border-[rgba(40,130,220,0.16)] text-[#8EA2BD] transition-all hover:bg-[rgba(10,108,255,0.1)] hover:text-white"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[28px] font-extrabold text-white tracking-tight" style={{ fontFamily: '"Thmanyah Sans", sans-serif' }}>
              تسجيل مريض جديد
            </h1>
            <p className="text-[13px] mt-1 font-medium text-[#8EA2BD]">إضافة ملف طبي وحساب جديد للمريض في العيادة.</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ─── Main Content ─── */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Basic Info */}
                <div className="rounded-[14px] p-6 bg-[#050C1F] border border-[rgba(40,130,220,0.16)]">
                  <h3 className="text-[15px] font-bold text-white mb-5 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0A6CFF]" /> المعلومات الأساسية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="localCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">كود المريض</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ""} onChange={e => field.onChange(e.target.valueAsNumber)} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]" />
                        </FormControl>
                        <FormMessage className="text-[#FF4D60] text-[10px]" />
                      </FormItem>
                    )} />
                    <div className="hidden md:block" />
                    
                    <FormField control={form.control} name="nameAr" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الاسم (عربي) *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="الاسم ثلاثي" className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]" />
                        </FormControl>
                        <FormMessage className="text-[#FF4D60] text-[10px]" />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="nameEn" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الاسم (إنجليزي)</FormLabel>
                        <FormControl>
                          <Input {...field} dir="ltr" className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]" />
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="gender" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الجنس *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]">
                              <SelectValue placeholder="اختر..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                            <SelectItem value="male" className="text-[12px]">ذكر</SelectItem>
                            <SelectItem value="female" className="text-[12px]">أنثى</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">تاريخ الميلاد</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]" style={{ colorScheme: "dark" }} />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="rounded-[14px] p-6 bg-[#050C1F] border border-[rgba(40,130,220,0.16)]">
                  <h3 className="text-[15px] font-bold text-white mb-5 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#0A6CFF]" /> أرقام التواصل
                  </h3>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex flex-col md:flex-row gap-3 items-end">
                        <FormField control={form.control} name={`phones.${index}.number`} render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">رقم الجوال {index + 1}</FormLabel>
                            <FormControl>
                              <Input {...field} dir="ltr" placeholder="05XXXXXXXX" className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]" />
                            </FormControl>
                            <FormMessage className="text-[#FF4D60] text-[10px]" />
                          </FormItem>
                        )} />
                        
                        <FormField control={form.control} name={`phones.${index}.owner`} render={({ field }) => (
                          <FormItem className="w-full md:w-[150px]">
                            <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">المالك</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                                {phoneOwnerOptions.map(o => <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        
                        {index > 0 && (
                          <button 
                            type="button" 
                            onClick={() => remove(index)}
                            className="h-[42px] w-[42px] rounded-[10px] flex items-center justify-center text-[#FF4D60] bg-[rgba(255,77,96,0.1)] hover:bg-[#FF4D60] hover:text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => append({ number: "", owner: "شخصي" })}
                      className="flex items-center gap-2 text-[12px] font-bold text-[#0A6CFF] hover:text-[#00D8D8] transition-colors mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" /> أضف رقم آخر
                    </button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="rounded-[14px] p-6 bg-[#050C1F] border border-[rgba(40,130,220,0.16)]">
                  <h3 className="text-[15px] font-bold text-white mb-5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0A6CFF]" /> معلومات السكن والعمل
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="governorate" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">المحافظة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]">
                              <SelectValue placeholder="اختر المحافظة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                            {governorateList.map(g => <SelectItem key={g} value={g} className="text-[12px]">{g}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">العنوان المكتوب (مفصل)</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]" />
                        </FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="occupation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">المهنة</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]" />
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">الحالة الاجتماعية</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]">
                              <SelectValue placeholder="اختر..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                            {maritalOptions.map(o => <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                </div>

              </div>

              {/* ─── Sidebar Content ─── */}
              <div className="space-y-6">
                <div className="rounded-[14px] p-6 bg-[#050C1F] border border-[rgba(40,130,220,0.16)] sticky top-6">
                  <h3 className="text-[15px] font-bold text-white mb-5 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0A6CFF]" /> معلومات إضافية
                  </h3>
                  
                  <div className="space-y-5">
                    <FormField control={form.control} name="insuranceStatus" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">حالة التأمين</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]">
                              <SelectValue placeholder="اختر..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                            {insuranceOptions.map(o => <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="source" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">مصدر المعرفة بالعيادة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] h-[42px]">
                              <SelectValue placeholder="اختر..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#061329] border-[rgba(40,130,220,0.16)] text-white">
                            {sourceOptions.map(o => <SelectItem key={o} value={o} className="text-[12px]">{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#8EA2BD] text-[12px] font-bold">ملاحظات عامة</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="bg-[rgba(6,19,41,0.6)] border-[rgba(40,130,220,0.16)] text-white text-[12px] min-h-[100px] resize-none" />
                        </FormControl>
                      </FormItem>
                    )} />
                    
                    <div className="pt-4 mt-4 border-t border-[rgba(40,130,220,0.16)]">
                      <Button 
                        type="submit" 
                        disabled={createPatient.isPending} 
                        className="w-full h-[46px] rounded-[10px] text-[14px] font-bold text-white transition-all hover:scale-[1.02] border-0"
                        style={{
                          background: "linear-gradient(135deg, #0A6CFF, #00D8D8)",
                          boxShadow: "0 4px 15px rgba(10,108,255,0.25)",
                        }}
                      >
                        {createPatient.isPending ? (
                          <Activity className="w-5 h-5 animate-spin" />
                        ) : (
                          "حفظ بيانات المريض"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
