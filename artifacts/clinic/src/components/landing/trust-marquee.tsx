import { ShieldCheck, Zap, Headphones, RefreshCw, Fingerprint, LineChart } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, label: "عزل كامل لكل عيادة" },
  { icon: Zap, label: "أداء فائق السرعة" },
  { icon: RefreshCw, label: "مزامنة لحظية" },
  { icon: Headphones, label: "دعم ٢٤/٧" },
  { icon: Fingerprint, label: "صلاحيات دقيقة" },
  { icon: LineChart, label: "تحليلات ذكية" },
];

/** شريط ثقة متحرك — يظهر على الجوال فقط */
export function TrustMarquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="lg:hidden relative border-y border-slate-200/80 dark:border-white/[0.06] bg-white/70 dark:bg-white/[0.02] py-4 overflow-hidden marquee-mask" dir="ltr">
      <div className="animate-marquee flex w-max items-center gap-3 px-3">
        {row.map((item, i) => (
          <span
            key={i}
            dir="rtl"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm dark:shadow-none"
          >
            <item.icon className="h-3.5 w-3.5 text-[#0068E2]" />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
