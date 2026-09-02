import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-transparent" dir="rtl">
      {/* final CTA */}
      <div className="relative max-w-4xl mx-auto px-5 sm:px-8 pt-28 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display font-black text-slate-900 dark:text-white text-4xl sm:text-6xl leading-snug">
            جاهز تبدأ
            <br />
            <span className="bg-gradient-to-l from-[#0068E2] to-[#02D9D9] dark:from-[#19E6D0] dark:to-[#5EA2FF] bg-clip-text text-transparent">
              قصة نجاح عيادتك؟
            </span>
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-serif-text">
            انضم إلى مئات العيادات التي اختارت التميز — إنشاء حسابك لا يستغرق سوى دقيقة واحدة.
          </p>
          <Link href="/login" className="mt-10 inline-block">
            <button className="group relative inline-flex items-center gap-3 rounded-xl bg-[#0068E2] px-10 py-4 text-lg font-bold text-white shadow-[0_18px_45px_-10px_rgba(0,104,226,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0059C6] hover:shadow-[0_22px_55px_-10px_rgba(0,104,226,0.6)] overflow-hidden font-sans-thmanyah">
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              أنشئ حسابك مجاناً
              <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1.5" />
            </button>
          </Link>
        </motion.div>

        <div className="pointer-events-none absolute -top-24 left-1/2 h-[20rem] w-[40rem] -translate-x-1/2 rounded-full bg-[#0068E2]/[0.06] blur-[110px]" />
      </div>

      {/* bottom bar */}
      <div className="relative border-t border-slate-200/80 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/logo.png"
              alt="شعار العيادة"
              className="h-11 w-11 object-contain [filter:drop-shadow(0_4px_10px_rgba(0,104,226,0.25))] dark:[filter:drop-shadow(0_0_14px_rgba(45,212,191,0.35))]"
            />
            <span className="font-display font-bold text-slate-900 dark:text-white">العيادة</span>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 order-last sm:order-none">© {new Date().getFullYear()} جميع الحقوق محفوظة</p>

          <nav className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <a href="#features" className="hover:text-[#0068E2] transition-colors">المميزات</a>
            <a href="#services" className="hover:text-[#0068E2] transition-colors">الخدمات</a>
            <a href="#pricing" className="hover:text-[#0068E2] transition-colors">الأسعار</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
