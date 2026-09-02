import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { HeroDashboard } from "./hero-dashboard";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative overflow-hidden" dir="rtl">
      {/* ===== clinic environment background (right side, behind the headline) ===== */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[58%]">
        <img
          src="/assets/jtgdorm.png"
          alt="استقبال عيادة طبية حديثة"
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover object-center opacity-[0.45] dark:opacity-[0.4]"
        />
        {/* white integration — fade toward center/left */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/55 to-[#f7fafc] dark:via-[#020817]/60 dark:to-[#020817]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f7fafc] via-transparent to-white/75 dark:from-[#020817] dark:to-[#020817]/75" />
      </div>

      {/* ===== ambient lighting ===== */}
      <div aria-hidden className="absolute inset-0">
        {/* cyan glow behind the dashboard */}
        <div
          className="absolute left-[0%] top-1/2 h-[24rem] w-[24rem] -translate-y-1/2 rounded-full blur-[120px] lg:h-[34rem] lg:w-[34rem]"
          style={{ background: "radial-gradient(circle, rgba(2,217,217,0.14), transparent 65%)" }}
        />
        {/* blue glow behind the heading */}
        <div
          className="absolute right-[4%] top-14 h-[16rem] w-[16rem] rounded-full blur-[110px] sm:h-[24rem] sm:w-[24rem]"
          style={{ background: "radial-gradient(circle, rgba(0,104,226,0.10), transparent 65%)" }}
        />
      </div>

      <div
        className="relative z-10 flex items-center"
        style={{ minHeight: "calc(100vh - 72px)" }}
      >
        <div className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 pt-28 pb-16 sm:pt-32 sm:pb-20 grid lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          {/* ===== right column: marketing content (RTL first) ===== */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease }}
            className="max-w-[620px]"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0068E2]/20 bg-white/80 dark:bg-cyan-400/[0.07] backdrop-blur px-4 py-1.5 text-sm font-medium text-[#0068E2] dark:text-cyan-300 shadow-sm dark:shadow-[0_0_24px_-6px_rgba(2,217,217,0.35)]">
              <Sparkles className="h-4 w-4" />
              نظام إدارة العيادات الأكثر تطوراً
            </div>

            <h1
              className="mt-6 font-sans-thmanyah font-bold text-slate-900 dark:text-white"
              style={{
                fontSize: "clamp(34px, 4.5vw + 16px, 72px)",
                lineHeight: 1.18,
                letterSpacing: 0,
              }}
            >
              أدر عيادتك{" "}
              <span className="hero-word-gradient">باحترافـية</span>
              <br />
              من الاستقبال حتى الميزانية
            </h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.22, ease }}
              className="mt-6 max-w-[620px] text-[17px] sm:text-[19px] leading-[2] text-slate-500 dark:text-slate-400 font-sans-thmanyah font-normal"
            >
              منظومة متكاملة تجمع المرضى والمواعيد والمالية والمخزون والتحليلات في لوحة واحدة،
              مع عزل كامل لبيانات كل عيادة وأمان على مستوى المؤسسات.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.36, ease }}
              className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4"
            >
              <Link href="/login">
                <button className="group relative inline-flex h-[52px] w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-[#0068E2] px-8 text-base leading-none font-bold text-white shadow-[0_14px_35px_-8px_rgba(0,104,226,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0059C6] hover:shadow-[0_18px_45px_-8px_rgba(0,104,226,0.6)] overflow-hidden font-sans-thmanyah active:scale-[0.98]">
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  ابدأ رحلتك مجاناً
                  <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                </button>
              </Link>
              <a
                href="#features"
                className="inline-flex h-[52px] w-full sm:w-auto items-center justify-center rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-white/[0.03] px-7 text-base leading-none font-medium text-slate-800 dark:text-slate-100 shadow-sm dark:shadow-none transition-all duration-300 hover:border-[#0068E2]/50 hover:text-[#0068E2] dark:hover:border-cyan-400/40 dark:hover:text-cyan-300 font-sans-thmanyah active:scale-[0.98]"
              >
                استكشف الميزات
              </a>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400"
            >
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#0068E2]" /> بيانات معزولة لكل عيادة
              </span>
              <span className="hidden sm:inline-block h-4 w-px bg-slate-300 dark:bg-white/[0.18]" />
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-[#0068E2]" /> جاهز خلال دقائق — بدون تثبيت
              </span>
            </motion.div>
          </motion.div>

          {/* ===== left column: floating 3D dashboard ===== */}
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
}
