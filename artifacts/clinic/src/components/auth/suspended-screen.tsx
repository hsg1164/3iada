import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Lock, LogOut, PhoneCall, ShieldAlert, CalendarClock, Building2, UserX, AtSign } from "lucide-react";

/**
 * Full-screen suspension screen. Rendered by SuspensionProvider the instant
 * a clinic's subscription OR an individual account is suspended — covers and
 * blocks everything.
 */

export type SuspensionKind = "clinic" | "account";

const COPY: Record<SuspensionKind, { title: string; message: string; label: string }> = {
  clinic: {
    title: "تم تعليق الاشتراك",
    message:
      "تم إيقاف وصول مستخدمي هذه العيادة إلى النظام مؤقتاً من قبل إدارة المنصة، ولن يتمكن أحد من الدخول أو العمل على الحساب حتى إعادة تفعيل الاشتراك.",
    label: "العيادة",
  },
  account: {
    title: "تم إيقاف الحساب",
    message:
      "تم إيقاف هذا الحساب بشكل مؤقت من قبل إدارة المنصة، ولا يمكنك الدخول أو العمل عليه حتى إعادة تفعيله. باقي حسابات العيادة تعمل كالمعتاد.",
    label: "الحساب",
  },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const cardIn = {
  hidden: { opacity: 0, scale: 0.85, y: 40 },
  show: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring" as const, stiffness: 160, damping: 18 },
  },
  exit: { opacity: 0, scale: 0.9, y: -30, transition: { duration: 0.25 } },
};

export function SuspendedScreen({
  kind = "clinic",
  clinicName,
  accountName,
  username,
}: {
  kind?: SuspensionKind;
  clinicName?: string | null;
  accountName?: string | null;
  username?: string | null;
}) {
  const [, setLocation] = useLocation();
  const [now, setNow] = useState(new Date());
  const [loggingOut, setLoggingOut] = useState(false);
  const copy = COPY[kind];
  const entityValue = kind === "account" ? (accountName || username || "—") : (clinicName || "—");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    window.dispatchEvent(new Event("suspension:logout"));
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    setLocation("/login");
    // hard reload so every cache/query resets
    setTimeout(() => window.location.reload(), 350);
  };

  return (
    <motion.div
      dir="rtl"
      variants={container}
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950 flex items-center justify-center p-4"
    >
      {/* animated background glows */}
      <motion.div
        className="absolute -top-40 -right-40 w-[34rem] h-[34rem] rounded-full bg-red-600/25 blur-3xl"
        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-48 -left-32 w-[38rem] h-[38rem] rounded-full bg-orange-600/20 blur-3xl"
        animate={{ scale: [1.15, 1, 1.15], opacity: [0.6, 0.35, 0.6] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 left-1/2 w-96 h-96 -translate-x-1/2 rounded-full bg-rose-500/10 blur-3xl"
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(248,113,113,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(248,113,113,.35) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      {/* floating lock particles */}
      {[...Array(9)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-red-400/25"
          style={{ top: `${12 + ((i * 37) % 70)}%`, left: `${6 + ((i * 53) % 88)}%` }}
          animate={{ y: [0, -26, 0], rotate: [0, i % 2 ? 14 : -14, 0], opacity: [0.15, 0.45, 0.15] }}
          transition={{ duration: 5 + (i % 5), repeat: Infinity, delay: i * 0.55 }}
        >
          <Lock className={i % 3 === 0 ? "w-6 h-6" : "w-4 h-4"} />
        </motion.div>
      ))}

      {/* main card */}
      <motion.div
        variants={cardIn}
        initial="hidden"
        animate="show"
        exit="exit"
        className="relative z-10 w-full max-w-md"
      >
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: [0, -10, 10, -6, 6, 0] }}
          transition={{ duration: 0.55, delay: 0.25 }}
          className="relative rounded-3xl border border-red-500/25 bg-slate-900/80 backdrop-blur-2xl shadow-[0_0_80px_-15px_rgba(239,68,68,0.45)] overflow-hidden"
        >
          {/* top shimmer line */}
          <motion.div
            className="h-1 w-full bg-gradient-to-l from-transparent via-red-500 to-transparent"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />

          <div className="p-8 sm:p-10 text-center">
            {/* pulsing lock badge */}
            <div className="relative mx-auto mb-7 w-24 h-24">
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-red-500/50"
                  animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 1.1, ease: "easeOut" }}
                />
              ))}
              <motion.div
                className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-rose-700 shadow-lg shadow-red-900/50 flex items-center justify-center"
                animate={{ rotate: [0, -4, 4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {kind === "account" ? (
                  <UserX className="w-11 h-11 text-white drop-shadow" />
                ) : (
                  <Lock className="w-11 h-11 text-white drop-shadow" />
                )}
              </motion.div>
              <motion.span
                className="absolute -top-1 -left-1"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              >
                <ShieldAlert className="w-7 h-7 text-amber-400 drop-shadow" />
              </motion.span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-3xl font-black tracking-tight bg-gradient-to-l from-red-300 via-rose-200 to-red-300 bg-clip-text text-transparent pb-1"
            >
              {copy.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-3 text-slate-300 leading-relaxed text-[15px]"
            >
              {copy.message}
            </motion.p>

            {/* details */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-7 space-y-2.5 text-right"
            >
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3">
                {kind === "account" ? (
                  <AtSign className="w-4.5 h-4.5 text-red-300 shrink-0" />
                ) : (
                  <Building2 className="w-4.5 h-4.5 text-red-300 shrink-0" />
                )}
                <span className="text-sm text-slate-400">{copy.label}</span>
                <span className="mr-auto text-sm font-bold text-slate-100">{entityValue}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3">
                <CalendarClock className="w-4.5 h-4.5 text-red-300 shrink-0" />
                <span className="text-sm text-slate-400">حالة الوصول</span>
                <span className="mr-auto inline-flex items-center gap-2 text-sm font-bold text-red-300">
                  <motion.span
                    className="inline-block w-2 h-2 rounded-full bg-red-400"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                  />
                  موقوف الآن
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3">
                <PhoneCall className="w-4.5 h-4.5 text-emerald-300 shrink-0" />
                <span className="text-sm text-slate-400">إعادة التفعيل</span>
                <span className="mr-auto text-sm font-medium text-slate-200">تواصل مع إدارة المنصة</span>
              </div>
            </motion.div>

            {/* shimmer progress bar */}
            <div className="relative mt-7 h-1.5 rounded-full overflow-hidden bg-white/[0.06]">
              <motion.div
                className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-l from-transparent via-red-400/80 to-transparent"
                animate={{ right: ["-33%", "133%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="mt-5 text-xs text-slate-500 tabular-nums"
            >
              آخر فحص: {now.toLocaleTimeString("ar", { hour12: false })} — يُفحص حالة الاشتراك تلقائياً كل ثوانٍ
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3.5 shadow-lg shadow-red-950/60 transition-colors disabled:opacity-60"
            >
              <LogOut className="w-5 h-5" />
              {loggingOut ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
