import { motion } from "framer-motion";
import {
  Server, MonitorSmartphone, PlugZap, DatabaseBackup, ArrowLeft,
} from "lucide-react";

/**
 * خدمات التطوير — تلي احتياج العيادات الكبرى والشركات التي تحتاج توسعات خاصة:
 * البنية الخلفية أولاً ثم الواجهات ثم التكاملات.
 */
const DEV_SERVICES = [
  {
    icon: Server,
    num: "٠١",
    title: "تطوير نظم خلفية",
    desc: "بناء واجهات برمجية قوية (APIs) وقواعد بيانات مصممة للنمو، تعالج آلاف العمليات يومياً بأمان وموثوقية عالية.",
    tile: "bg-blue-50 dark:bg-[#0068E2]/12 border-blue-100 dark:border-[#0068E2]/25 text-[#0068E2] dark:text-cyan-300",
    featured: true,
  },
  {
    icon: MonitorSmartphone,
    num: "٠٢",
    title: "واجهات استخدام حديثة",
    desc: "تصميم وتنفيذ شاشات سريعة وجميلة تعمل على الحاسوب والجوال، مبنية على أحدث التقنيات.",
    tile: "bg-sky-50 dark:bg-sky-400/10 border-sky-100 dark:border-sky-400/25 text-sky-600 dark:text-sky-300",
    featured: false,
  },
  {
    icon: PlugZap,
    num: "٠٣",
    title: "تكاملات وأنظمة خارجية",
    desc: "ربط المنصة بأنظمة التأمين والمختبرات وبوابات الدفع وأي خدمة خارجية تحتاجها عيادتك.",
    tile: "bg-violet-50 dark:bg-violet-400/10 border-violet-100 dark:border-violet-400/25 text-violet-600 dark:text-violet-300",
    featured: false,
  },
  {
    icon: DatabaseBackup,
    num: "٠٤",
    title: "نسخ احتياطي واستمرارية",
    desc: "حماية بياناتك بنسخ دورية مجدولة واستعادة سريعة عند أي طارئ — بياناتك لا تضيع أبداً.",
    tile: "bg-amber-50 dark:bg-amber-400/10 border-amber-100 dark:border-amber-400/25 text-amber-600 dark:text-amber-300",
    featured: false,
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="relative py-24 sm:py-32 overflow-hidden" dir="rtl">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[30rem] w-[52rem] rounded-full bg-[#0068E2]/[0.05] blur-[130px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-sm font-bold tracking-wide text-[#0068E2] dark:text-cyan-300">خدمات التطوير</span>
          <h2 className="mt-3 font-display font-black text-slate-900 dark:text-white text-4xl sm:text-5xl leading-snug">
            أبعد من جاهزية النظام
            <br />
            <span className="bg-gradient-to-l from-[#0068E2] to-[#02D9D9] dark:from-[#19E6D0] dark:to-[#5EA2FF] bg-clip-text text-transparent">
              نبني ما تحتاجه عيادتك
            </span>
          </h2>
          <p className="mt-5 text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-serif-text">
            فريقنا الهندسي يوسع المنصة لتناسب أحجام العيادات المختلفة — من البنية الخلفية إلى آخر تفصيلة في الشاشة.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {DEV_SERVICES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: i * 0.1 }}
              whileHover={{ y: -7 }}
              className={`group relative flex flex-col rounded-3xl border bg-white dark:bg-white/[0.03] p-7 transition-all duration-300 ${
                s.featured
                  ? "border-[#0068E2]/30 dark:border-cyan-400/25 ring-1 ring-[#0068E2]/10 dark:ring-cyan-400/15 shadow-[0_18px_45px_-14px_rgba(0,104,226,0.22)] dark:shadow-[0_18px_45px_-14px_rgba(2,217,217,0.13)]"
                  : "border-slate-200/90 dark:border-white/[0.08] shadow-[0_1px_3px_rgba(15,40,80,0.05)] hover:border-blue-200 dark:hover:border-white/[0.14] hover:shadow-[0_18px_40px_-14px_rgba(0,104,226,0.16)]"
              }`}
            >
              {s.featured && (
                <span className="absolute top-5 left-5 rounded-full bg-blue-50 dark:bg-[#0068E2]/12 border border-blue-100 dark:border-[#0068E2]/30 px-3 py-1 text-[11px] font-bold text-[#0068E2]">
                  الأكثر طلباً
                </span>
              )}

              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border mb-6 ${s.tile}`}>
                <s.icon className="h-6 w-6" />
              </span>

              <span className="font-display font-black text-slate-900/[0.07] dark:text-white/[0.05] text-4xl leading-none mb-2">{s.num}</span>
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-xl">{s.title}</h3>
              <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-serif-text flex-1">{s.desc}</p>

              <a
                href="#pricing"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#0068E2] transition-all duration-300 group-hover:gap-3"
              >
                اعرف أكثر
                <ArrowLeft className="h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
