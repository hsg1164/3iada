import { motion } from "framer-motion";
import { ChevronLeft, ClipboardList, Stethoscope } from "lucide-react";
import { useLocation } from "wouter";

function QuickPanel({
  title,
  desc,
  icon: Icon,
  gradient,
  onClick,
  ecgColor,
}: {
  title: string;
  desc: string;
  icon: React.ElementType;
  gradient: string;
  onClick: () => void;
  ecgColor: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] as const }}
      className="group relative overflow-hidden rounded-[14px] p-6 text-right text-white transition-all duration-200 hover:shadow-[0_10px_35px_rgba(0,0,0,0.25)]"
      style={{
        background: gradient,
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-300"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        style={{ direction: "ltr" }}
      >
        <path
          d="M0 50 L40 50 L50 20 L60 80 L70 30 L80 70 L90 50 L160 50 L170 20 L180 80 L190 30 L200 70 L210 50 L280 50 L290 20 L300 80 L310 30 L320 70 L330 50 L400 50"
          fill="none"
          stroke={ecgColor}
          strokeWidth="1.5"
          className="animate-pulse"
        />
      </svg>
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.05] blur-2xl" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/[0.04] blur-2xl" />

      <div className="relative">
        <Icon className="h-[36px] w-[36px] mb-4 opacity-90" strokeWidth={1.7} />
        <h3 className="text-[18px] font-bold mb-1.5">{title}</h3>
        <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          {desc}
        </p>
        <span
          className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[13px] font-bold transition-all duration-200 group-hover:translate-x-[2px]"
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          الدخول
          <ChevronLeft className="h-4 w-4" />
        </span>
      </div>
    </motion.button>
  );
}

export function QuickAccess({
  showSecretary,
  showDoctor,
}: {
  showSecretary: boolean;
  showDoctor: boolean;
}) {
  const [, setLocation] = useLocation();
  if (!showSecretary && !showDoctor) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {showDoctor && (
        <QuickPanel
          title="لوحة الطبيب"
          desc="قائمة المرضى، الكشف التجميلي، سجل الحقن والليزر"
          icon={Stethoscope}
          gradient="linear-gradient(135deg, #021822, #008C91, #00C9C9)"
          onClick={() => setLocation("/doctor")}
          ecgColor="#00C9C9"
        />
      )}
      {showSecretary && (
        <QuickPanel
          title="لوحة السكرتير"
          desc="إدارة الطابور، تسجيل مرضى جدد، الفواتير والمدفوعات"
          icon={ClipboardList}
          gradient="linear-gradient(135deg, #031022, #0A6CFF, #0A2463)"
          onClick={() => setLocation("/reception")}
          ecgColor="#0A6CFF"
        />
      )}
    </div>
  );
}
