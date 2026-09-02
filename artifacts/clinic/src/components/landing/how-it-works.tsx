import { motion } from "framer-motion";
import { UserPlus, Settings2, Rocket, ArrowLeft } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    num: "١",
    title: "أنشئ عيادتك",
    desc: "سجّل بيانات عيادتك خلال دقيقة، واحصل على نسخة معزولة بالكامل خاصة بك.",
  },
  {
    icon: Settings2,
    num: "٢",
    title: "خصّص نظامك",
    desc: "أضف خدماتك ومنتجاتك وأطباءك وخزائنك — النظام يتشكل على مقاس عملك أنت، لا العكس.",
  },
  {
    icon: Rocket,
    num: "٣",
    title: "انطلق وشاهد الفرق",
    desc: "ابدأ الاستقبال فوراً وتابع مؤشرات عيادتك تنمو أمام عينيك لحظة بلحظة.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="relative py-24 sm:py-32" dir="rtl">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-sm font-bold tracking-wide text-[#0068E2] dark:text-cyan-300">كيف يعمل</span>
          <h2 className="mt-3 font-display font-black text-slate-900 dark:text-white text-4xl sm:text-5xl leading-snug">
            ثلاث خطوات فقط
            <br />
            <span className="bg-gradient-to-l from-[#0068E2] to-[#02D9D9] dark:from-[#19E6D0] dark:to-[#5EA2FF] bg-clip-text text-transparent">
              وتصبح جاهزاً
            </span>
          </h2>
        </motion.div>

        {/* timeline */}
        <div className="relative mt-20">
          <div className="absolute top-[3.25rem] right-[16%] left-[16%] hidden lg:block">
            <motion.div
              className="h-px bg-gradient-to-l from-[#0068E2]/50 via-[#02D9D9]/40 to-[#0068E2]/50 origin-right"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="grid gap-12 md:grid-cols-3 relative">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.18 }}
                className="relative text-center"
              >
                <div className="relative inline-flex">
                  <span className="flex h-[6.5rem] w-[6.5rem] items-center justify-center rounded-full border border-slate-200 dark:border-[#02D9D9]/35 bg-white dark:bg-gradient-to-br dark:from-[#0a2c66] dark:via-[#08234f] dark:to-[#051a3d] shadow-[0_14px_35px_-12px_rgba(15,40,80,0.15)] dark:shadow-[0_0_50px_-10px_rgba(2,217,217,0.55),inset_0_1px_0_rgba(255,255,255,0.15)] dark:ring-1 dark:ring-[#02D9D9]/20 transition-shadow duration-500">
                    <s.icon className="h-9 w-9 text-[#0068E2] dark:text-[#19E6D0]" />
                  </span>
                  <span className="absolute -top-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0068E2] to-[#02BBD3] font-display font-black text-white text-lg shadow-lg shadow-[#0068E2]/40 dark:shadow-[0_0_18px_rgba(2,217,217,0.55)]">
                    {s.num}
                  </span>
                </div>
                <h3 className="mt-7 font-display font-bold text-slate-900 dark:text-white text-2xl">{s.title}</h3>
                <p className="mt-3 max-w-sm mx-auto text-slate-500 dark:text-slate-400 leading-relaxed font-serif-text">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <a
            href="#pricing"
            className="group inline-flex items-center gap-2 text-[#0068E2] font-bold hover:text-[#0059C6] transition-colors"
          >
            ابدأ خطوتك الأولى الآن
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
