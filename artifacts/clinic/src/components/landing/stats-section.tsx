import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, HeartHandshake, Building2, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Stat = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  icon: LucideIcon;
};

const STATS: Stat[] = [
  { value: 12000, prefix: "+", label: "مريض تم تسجيله", icon: Users },
  { value: 98, suffix: "%", label: "رضا العملاء", icon: HeartHandshake },
  { value: 40, suffix: "+", label: "عيادة تعتمد على النظام", icon: Building2 },
  { value: 10, suffix: "x", label: "أسرع في إدارة العيادة", icon: Zap },
];

function Counter({ target }: { target: number }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let raf = 0;
    let timer = 0;
    const dur = 1500;
    const run = () => {
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(target * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    timer = window.setTimeout(run, 350);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target]);

  return <span className="tabular-nums">{val.toLocaleString("en-US")}</span>;
}

export function StatsSection() {
  return (
    <section id="clients" className="relative border-y border-slate-200/80 dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.02] backdrop-blur-sm" dir="rtl">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-9 gap-x-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`flex flex-col items-center text-center px-2 ${
                i > 0 ? "lg:border-l border-slate-200 dark:border-white/[0.07]" : ""
              }`}
            >
              <p className="font-display font-black bg-gradient-to-l from-[#0068E2] to-[#02D9D9] dark:from-[#19E6D0] dark:to-[#5EA2FF] bg-clip-text text-transparent text-[2rem] sm:text-4xl leading-none" dir="ltr">
                {s.prefix && <span>{s.prefix}</span>}
                <Counter target={s.value} />
                {s.suffix && <span>{s.suffix}</span>}
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] sm:text-sm font-medium text-[#94A3B8]">
                <s.icon className="h-3.5 w-3.5 text-[#00D4B8]/80 shrink-0" />
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
