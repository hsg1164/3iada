import { motion } from "framer-motion";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const PLANS = [
  {
    name: "الأساسية",
    tagline: "للعيادات الناشئة",
    price: "$29",
    period: "/شهرياً",
    features: ["حتى ٣ مستخدمين", "ملف مريض ذكي كامل", "مواعيد وطوابير حية", "تقارير مالية أساسية", "دعم عبر البريد"],
    featured: false,
  },
  {
    name: "الاحترافية",
    tagline: "الأكثر اختياراً للعيادات النشطة",
    price: "$89",
    period: "/شهرياً",
    features: [
      "حتى ١٠ مستخدمين",
      "خزائن متعددة ومصروفات دورية",
      "مخزون ومنتجات خاصة بالعيادة",
      "تحليلات تفاعلية + تصدير PDF/Excel",
      "صلاحيات وأدوار مخصصة",
      "أولوية في الدعم الفني",
    ],
    featured: true,
  },
  {
    name: "المؤسسية",
    tagline: "لسلاسل العيادات والمجموعات الطبية",
    price: null,
    period: "",
    features: ["مستخدمون وفروع غير محدودة", "عزل مؤسسي موسّع", "تكاملات أنظمة خارجية", "تطوير نظم خلفية حسب الطلب", "اتفاقية مستوى خدمة SLA"],
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32" dir="rtl">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-sm font-bold tracking-wide text-[#0068E2]">الأسعار</span>
          <h2 className="mt-3 font-display font-black text-slate-900 dark:text-white text-4xl sm:text-5xl leading-snug">
            خطط واضحة
            <br />
            <span className="bg-gradient-to-l from-[#0068E2] to-[#02D9D9] dark:from-[#19E6D0] dark:to-[#5EA2FF] bg-clip-text text-transparent">
              بلا مفاجآت
            </span>
          </h2>
          <p className="mt-5 text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-serif-text">
            ابدأ بما يناسب حجم عيادتك اليوم — وطوّر خطتك متى ما كبرت.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3 items-stretch pt-4 lg:pt-0">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.13 }}
              whileHover={{ y: -8 }}
              className={`relative flex flex-col rounded-[2rem] border p-8 transition-all duration-300 ${
                plan.featured
                  ? "border-[#0068E2]/35 bg-white dark:bg-white/[0.03] ring-2 ring-[#0068E2]/15 shadow-[0_30px_70px_-20px_rgba(0,104,226,0.28)] lg:-my-4 lg:py-12"
                  : "border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] shadow-[0_1px_3px_rgba(15,40,80,0.05)] border-slate-300 dark:border-white/[0.12] hover:shadow-[0_18px_40px_-16px_rgba(15,40,80,0.14)]"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-4 right-1/2 translate-x-1/2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-l from-[#0068E2] to-[#02BBD3] px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-[#0068E2]/35">
                  <Sparkles className="h-3.5 w-3.5" />
                  الخيار الأذكى
                </span>
              )}

              <h3 className="font-display font-bold text-slate-900 dark:text-white text-2xl">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plan.tagline}</p>

              <div className="mt-6 flex items-end gap-1.5">
                {plan.price ? (
                  <>
                    <span className="font-display font-black text-slate-900 dark:text-white text-5xl leading-none tabular-nums">{plan.price}</span>
                    <span className="pb-0.5 text-slate-500 dark:text-slate-400 text-sm">{plan.period}</span>
                  </>
                ) : (
                  <span className="font-display font-black bg-gradient-to-l from-[#0068E2] to-[#02D9D9] dark:from-[#19E6D0] dark:to-[#5EA2FF] bg-clip-text text-transparent text-4xl">
                    تواصل معنا
                  </span>
                )}
              </div>

              <ul className="mt-8 space-y-3.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300 text-[15px]">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      plan.featured ? "bg-blue-50 dark:bg-[#0068E2]/12 border border-[#0068E2]/25" : "bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.07]"
                    }`}>
                      <Check className={`h-3 w-3 ${plan.featured ? "text-[#0068E2]" : "text-slate-500 dark:text-slate-400"}`} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/login" className="mt-9 block">
                <button
                  className={`group w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold transition-all duration-300 hover:-translate-y-0.5 font-sans-thmanyah overflow-hidden relative ${
                    plan.featured
                      ? "bg-[#0068E2] text-white shadow-lg shadow-[#0068E2]/30 hover:bg-[#0059C6]"
                      : "border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-white/[0.03] text-slate-800 dark:text-slate-100 hover:border-[#0068E2]/50 hover:text-[#0068E2]"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  )}
                  {plan.price ? "ابدأ الآن" : "اطلب عرضاً"}
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
