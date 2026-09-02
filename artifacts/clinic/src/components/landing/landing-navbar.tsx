import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./landing-theme";

const LINKS = [
  { href: "#top", label: "الرئيسية" },
  { href: "#features", label: "الميزات" },
  { href: "#services", label: "خدمات" },
  { href: "#security", label: "الأمان" },
  { href: "#pricing", label: "الأسعار" },
  { href: "#contact", label: "تواصل" },
];

const SECTION_IDS = LINKS.map((l) => l.href.slice(1));

function Brand() {
  return (
    <a href="#top" className="flex items-center gap-3 group shrink-0">
      <img
        src="/assets/logo.png"
        alt="شعار العيادة"
        className="h-10 w-10 sm:h-11 sm:w-11 object-contain transition-all duration-300 group-hover:scale-105 group-hover:-rotate-2 [filter:drop-shadow(0_4px_10px_rgba(0,104,226,0.28))] dark:[filter:drop-shadow(0_0_14px_rgba(45,212,191,0.35))]"
      />
      <span className="flex flex-col leading-tight">
        <span className="font-sans-thmanyah font-bold text-slate-900 dark:text-white text-base sm:text-lg">
          العيادة
        </span>
        <span className="text-[9px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400">
          نظام إدارة العيادات
        </span>
      </span>
    </a>
  );
}

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#top");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* scroll-spy: highlight the section currently in view */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 150;
      let current = "#top";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) current = "#" + id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/85 dark:bg-[#020817]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.06] shadow-[0_4px_24px_rgba(15,40,80,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.45)]"
          : "bg-white/55 dark:bg-[#020817]/60 backdrop-blur-xl border-b border-transparent"
      }`}
      dir="rtl"
    >
      <nav
        className={`max-w-[1400px] mx-auto px-5 sm:px-8 flex items-center justify-between transition-all duration-500 ${
          scrolled ? "h-[68px]" : "h-[76px]"
        }`}
      >
        <Brand />

        {/* center nav — sliding glowing indicator */}
        <div className="hidden lg:flex items-center gap-8">
          {LINKS.map((l) => {
            const isActive = active === l.href;
            return (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setActive(l.href)}
                className="relative flex flex-col items-center gap-1.5 py-1 group"
              >
                <span
                  className={`text-sm transition-colors duration-300 ${
                    isActive
                      ? "font-bold text-[#0068E2] dark:text-cyan-300"
                      : "font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {l.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 h-[3px] w-7 rounded-full bg-gradient-to-l from-[#02D9D9] to-[#0068E2] shadow-[0_0_12px_rgba(2,217,217,0.65)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                {!isActive && (
                  <span className="absolute -bottom-1 h-px w-0 group-hover:w-5 rounded-full bg-[#0068E2]/50 dark:bg-cyan-300/40 transition-all duration-300" />
                )}
              </a>
            );
          })}
        </div>

        {/* actions */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <Link href="/login">
            <button className="rounded-xl border border-slate-200 dark:border-white/[0.09] bg-white dark:bg-white/[0.04] px-4 py-2 text-[15px] leading-none font-medium text-slate-700 dark:text-slate-200 shadow-sm dark:shadow-none transition-all duration-300 hover:border-[#0068E2]/40 hover:text-[#0068E2] dark:hover:border-cyan-400/40 dark:hover:text-cyan-300 hover:shadow-md dark:hover:shadow-[0_6px_24px_-8px_rgba(2,217,217,0.25)] font-sans-thmanyah">
              تسجيل الدخول
            </button>
          </Link>
          <Link href="/login">
            <button className="rounded-xl bg-[#0068E2] px-5 py-2 text-[15px] leading-none font-bold text-white shadow-lg shadow-[#0068E2]/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0059C6] hover:shadow-[#0068E2]/45 font-sans-thmanyah">
              تجربة مجانية
            </button>
          </Link>
        </div>

        <div className="lg:hidden flex items-center gap-2.5">
          <ThemeToggle />
          <button
            className="text-slate-700 dark:text-slate-200 p-2"
            onClick={() => setOpen(!open)}
            aria-label="القائمة"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="lg:hidden border-t border-slate-200/80 dark:border-white/[0.06] bg-white/95 dark:bg-[#020817]/95 backdrop-blur-2xl px-6 py-4 space-y-1.5 overflow-hidden shadow-[0_20px_40px_rgba(15,40,80,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
        >
          {LINKS.map((l, i) => (
            <motion.a
              key={l.href}
              href={l.href}
              onClick={() => {
                setActive(l.href);
                setOpen(false);
              }}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-[15px] transition-colors ${
                active === l.href
                  ? "font-bold text-[#0068E2] dark:text-cyan-300 bg-blue-50/80 dark:bg-cyan-400/[0.08]"
                  : "font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white active:bg-slate-100 dark:active:bg-white/[0.06]"
              }`}
            >
              {l.label}
              {active === l.href && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#02D9D9] shadow-[0_0_8px_rgba(2,217,217,0.8)]" />
              )}
            </motion.a>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.45 }}
            className="grid grid-cols-2 gap-3 pt-3"
          >
            <Link href="/login" className="block">
              <button className="w-full rounded-xl border border-slate-200 dark:border-white/[0.09] bg-white dark:bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm dark:shadow-none active:scale-[0.98] transition-transform font-sans-thmanyah">
                تسجيل الدخول
              </button>
            </Link>
            <Link href="/login" className="block">
              <button className="w-full rounded-xl bg-[#0068E2] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#0068E2]/30 active:scale-[0.98] transition-transform font-sans-thmanyah">
                تجربة مجانية
              </button>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </motion.header>
  );
}
