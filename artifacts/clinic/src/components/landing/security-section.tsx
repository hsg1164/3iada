import { motion } from "framer-motion";
import { ShieldCheck, Lock, EyeOff, ServerOff, Fingerprint } from "lucide-react";

const PILLARS = [
  {
    icon: Lock,
    title: "عزل صارم لكل عيادة",
    desc: "بيانات كل عيادة محمية بطبقة عزل على مستوى قاعدة البيانات — لا يمكن لأي جهة أخرى الوصول إليها حتى لو حاولت.",
  },
  {
    icon: Fingerprint,
    title: "صلاحيات دقيقة",
    desc: "لكل موظف دور وصلاحيات مضبوطة، مع سجل نشاط كامل يوثق كل عملية في النظام.",
  },
  {
    icon: EyeOff,
    title: "خصوصية المرضى أولاً",
    desc: "صور ومستندات المرضى تُشارك عبر روابط مؤقتة مشفرة قابلة للإلغاء، ولا تُفهرس أبداً.",
  },
  {
    icon: ServerOff,
    title: "مفاتيح لا تغادر السيرفر",
    desc: "مفاتيح قاعدة البيانات لا تلمس المتصفح إطلاقاً — كل استعلام يمر عبر طبقة حماية مركزية.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="relative py-24 sm:py-32 overflow-hidden" dir="rtl">
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[34rem] w-[34rem] rounded-full bg-[#02D9D9]/[0.07] blur-[120px]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-16 items-center">
        {/* copy + shield visual */}
        <div className="relative order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            className="relative mx-auto max-w-sm"
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-[2.5rem] border border-[#0068E2]/15 bg-white/80 dark:bg-white/[0.05] backdrop-blur p-10 shadow-[0_25px_60px_-20px_rgba(0,104,226,0.18)]"
            >
              <span className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#0068E2]/10 to-[#02D9D9]/15 border border-[#0068E2]/20 shadow-[0_18px_40px_-12px_rgba(0,104,226,0.3)]">
                <ShieldCheck className="h-14 w-14 text-[#0068E2]" />
              </span>
              <p className="mt-7 text-center font-display font-bold text-slate-900 dark:text-white text-xl leading-relaxed">
                «المفتاح الذي يفتح بياناتك
                <br />
                لا يغادر السيرفر أبداً»
              </p>
            </motion.div>
          </motion.div>
        </div>

        <div className="order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75 }}
          >
            <span className="text-sm font-bold tracking-wide text-[#0068E2] dark:text-cyan-300">الأمان</span>
            <h2 className="mt-3 font-display font-black text-slate-900 dark:text-white text-4xl sm:text-5xl leading-snug">
              بياناتك بحصانة
              <br />
              <span className="bg-gradient-to-l from-[#0068E2] to-[#02D9D9] dark:from-[#19E6D0] dark:to-[#5EA2FF] bg-clip-text text-transparent">
                على مستوى المؤسسات
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-serif-text">
              بنينا الأمان في أساس المنصة منذ أول سطر برمجي، لا كطبقة مضافة لاحقاً.
            </p>
          </motion.div>

          <div className="mt-10 space-y-4">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.09 }}
                whileHover={{ x: -6 }}
                className="flex gap-4 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-4 shadow-[0_1px_3px_rgba(15,40,80,0.04)] transition-all duration-300 hover:border-[#0068E2]/30 hover:shadow-[0_12px_30px_-12px_rgba(0,104,226,0.18)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-[#0068E2]/12 border border-blue-100 dark:border-[#0068E2]/25">
                  <p.icon className="h-5 w-5 text-[#0068E2] dark:text-cyan-300" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-serif-text">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
