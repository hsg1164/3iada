import { motion } from "framer-motion";
import {
  Users, CalendarClock, Wallet, Boxes, LineChart, UserCog,
} from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "ملف المريض الذكي",
    desc: "أرشيف كامل لكل مريض: بياناته وزياراته وجلساته وصوره الطبية، مع أكواد محلية تُدار تلقائياً لكل عيادة على حدة.",
    span: "lg:col-span-2",
    tile: "bg-sky-50 dark:bg-sky-400/10 border-sky-100 dark:border-sky-400/25 text-sky-600 dark:text-sky-300",
    glow: "bg-sky-300",
  },
  {
    icon: CalendarClock,
    title: "المواعيد والطوابير الحية",
    desc: "حالة كل موعد لحظة بلحظة من الاستقبال حتى الكاشير، مع طابور ذكي للعيادة والطبيب.",
    span: "",
    tile: "bg-violet-50 dark:bg-violet-400/10 border-violet-100 dark:border-violet-400/25 text-violet-600 dark:text-violet-300",
    glow: "bg-violet-300",
  },
  {
    icon: Wallet,
    title: "مالية وخزائن متعددة",
    desc: "خزائن نقدية، مصروفات عادية ودورية، مستحقات المزودين، وتسوية يومية دقيقة بلا فوارق.",
    span: "",
    tile: "bg-emerald-50 dark:bg-emerald-400/10 border-emerald-100 dark:border-emerald-400/25 text-emerald-600 dark:text-emerald-300",
    glow: "bg-emerald-300",
  },
  {
    icon: Boxes,
    title: "مخزون ومنتجات خاصة",
    desc: "كتالوج خدمات ومستلزمات لكل عيادة بشكل مستقل، حركات مخزون، وحد أدنى للمخزون مع تنبيهات ذكية.",
    span: "",
    tile: "bg-amber-50 dark:bg-amber-400/10 border-amber-100 dark:border-amber-400/25 text-amber-600 dark:text-amber-300",
    glow: "bg-amber-300",
  },
  {
    icon: LineChart,
    title: "تحليلات تفاعلية",
    desc: "لوحات مؤشرات فورية للإيرادات والأداء والمواعيد، تصدير PDF وExcel بضغطة واحدة.",
    span: "",
    tile: "bg-cyan-50 dark:bg-cyan-400/10 border-cyan-100 dark:border-cyan-400/25 text-cyan-600 dark:text-cyan-300",
    glow: "bg-cyan-300",
  },
  {
    icon: UserCog,
    title: "صلاحيات وأدوار مرنة",
    desc: "أنشئ أدوارك الخاصة بصلاحيات دقيقة لكل شاشة، وسجل نشاط كامل يرصد كل عملية في النظام.",
    span: "lg:col-span-2",
    tile: "bg-rose-50 dark:bg-rose-400/10 border-rose-100 dark:border-rose-400/25 text-rose-600 dark:text-rose-300",
    glow: "bg-rose-300",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32" dir="rtl">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-sm font-bold tracking-wide text-[#0068E2] dark:text-cyan-300">المميزات</span>
          <h2 className="mt-3 font-display font-black text-slate-900 dark:text-white text-4xl sm:text-5xl leading-snug">
            كل ما تحتاجه عيادتك
            <br />
            <span className="bg-gradient-to-l from-[#0068E2] to-[#02D9D9] dark:from-[#19E6D0] dark:to-[#5EA2FF] bg-clip-text text-transparent">
              في مكان واحد
            </span>
          </h2>
          <p className="mt-5 text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-serif-text">
            بنينا المنصة لتغطي دورة العمل الكاملة داخل العيادة، بأدوات صُممت للاستخدام اليومي السريع.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: (i % 4) * 0.09 }}
              whileHover={{ y: -6 }}
              className={`group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-7 shadow-[0_1px_3px_rgba(15,40,80,0.05)] transition-all duration-300 hover:border-blue-200 hover:shadow-[0_18px_40px_-14px_rgba(0,104,226,0.18)] ${f.span}`}
            >
              <div className={`pointer-events-none absolute -top-16 -left-16 h-40 w-40 rounded-full ${f.glow} opacity-[0.10] blur-2xl transition-opacity duration-500 group-hover:opacity-[0.22]`} />
              <span className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border mb-5 ${f.tile}`}>
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="relative font-display font-bold text-slate-900 dark:text-white text-xl">{f.title}</h3>
              <p className="relative mt-2.5 text-slate-500 dark:text-slate-400 leading-relaxed font-serif-text">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
