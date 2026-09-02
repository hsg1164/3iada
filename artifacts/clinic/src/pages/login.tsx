import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/components/auth/auth-provider";
import { useLogin } from "@workspace/api-client-react";
import {
  Loader2, ArrowRight, ShieldCheck, Mail, Lock, UserX, Eye, EyeOff,
  CalendarCheck2, Users, Wallet, Sparkles, Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, refetch } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [suspendedInfo, setSuspendedInfo] = useState<string | null>(null);
  const [accountSuspended, setAccountSuspended] = useState<{ name?: string | null } | null>(null);

  const { mutate: login, isPending } = useLogin({
    mutation: {
      onSuccess: async (data: any) => {
        // Wait for the session query to reflect the new user BEFORE navigating,
        // otherwise guards may see "no user" and bounce us to the wrong panel
        await refetch();
        // Platform admins go to the platform panel; everyone else to their clinic
        if (data?.isSuperadmin) {
          setLocation("/superadmin");
        } else {
          setLocation("/dashboard");
        }
      },
      onError: (err: any) => {
        const code = err?.data?.error || err?.error;
        if (code === "CLINIC_SUSPENDED") {
          setSuspendedInfo(err?.data?.clinicName ?? err?.clinicName ?? null);
          return;
        }
        if (code === "ACCOUNT_SUSPENDED") {
          setAccountSuspended({ name: err?.data?.accountName ?? err?.data?.username ?? null });
          return;
        }
        setErrorMsg(err?.data?.error || err?.message || "حدث خطأ أثناء تسجيل الدخول. يرجى التأكد من اسم المستخدم وكلمة المرور.");
      }
    }
  });

  if (user) {
    setLocation(user?.isSuperadmin ? "/superadmin" : "/dashboard");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!username || !password) {
      setErrorMsg("الرجاء إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    login({ data: { username, password } });
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans-thmanyah" dir="rtl">
      {/* ===== ambient background ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-48 right-[15%] h-[19rem] w-[19rem] sm:h-[34rem] sm:w-[34rem] rounded-full bg-emerald-500/[0.14] blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10rem] left-[8%] h-60 w-60 sm:h-[30rem] sm:w-[30rem] rounded-full bg-teal-500/[0.12] blur-[110px]"
          animate={{ scale: [1.15, 1, 1.15], opacity: [0.6, 0.35, 0.6] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 left-[40%] h-48 w-48 sm:h-[22rem] sm:w-[22rem] rounded-full bg-cyan-400/[0.07] blur-[100px]"
          animate={{ y: [0, -45, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.35) 1px, transparent 1px)",
            backgroundSize: "54px 54px",
            maskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 25%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 50%, black 25%, transparent 80%)",
          }}
        />
      </div>

      {/* back link */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.9, ease }}
        className="absolute top-6 right-6 sm:right-8 z-20"
      >
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 backdrop-blur-md transition-all hover:border-emerald-300/40 hover:text-white"
        >
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          العودة للرئيسية
        </Link>
      </motion.div>

      <div className="relative z-10 min-h-screen flex">
        {/* ==================== form side ==================== */}
        <div className="w-full lg:w-[46%] flex flex-col items-center justify-center px-6 py-16 sm:px-12">
          <div className="w-full max-w-sm">
            {/* logo */}
            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="flex items-center gap-3 mb-10"
            >
              <motion.img
                src="/assets/logo.png"
                alt="شعار العيادة"
                whileHover={{ rotate: -6, scale: 1.1 }}
                className="h-16 w-16 object-contain"
                style={{ filter: "drop-shadow(0 0 16px rgba(52,211,153,.5))" }}
              />
              <span className="font-display font-bold text-white text-2xl tracking-tight">العيادة</span>
            </motion.div>

            {/* ==================== mobile showcase — فوق الفورم ==================== */}
            <div className="mb-12 lg:hidden">
              {/* divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.6, ease }}
                className="mx-auto mb-10 h-px w-3/4 bg-gradient-to-l from-transparent via-white/[0.12] to-transparent"
              />

              {/* orbiting shield */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.58, ease }}
                className="relative mx-auto mb-8 h-36 w-36"
              >
                {[0, 1].map((i) => (
                  <motion.span
                    key={i}
                    className="absolute inset-0 rounded-full border border-emerald-400/20"
                    animate={{ scale: [1, 1.4], opacity: [0.55, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, delay: i * 1.4, ease: "easeOut" }}
                  />
                ))}
                <motion.div
                  className="absolute inset-2 rounded-full border border-dashed border-white/[0.12]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                >
                  <span className="absolute -top-2 right-1/2 flex h-7 w-7 translate-x-1/2 items-center justify-center rounded-full border border-emerald-400/30 bg-slate-900 shadow-lg">
                    <CalendarCheck2 className="h-3.5 w-3.5 text-emerald-300" />
                  </span>
                  <span className="absolute -bottom-2 right-[15%] flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/30 bg-slate-900 shadow-lg">
                    <Users className="h-3.5 w-3.5 text-cyan-300" />
                  </span>
                  <span className="absolute -bottom-2 right-[70%] flex h-7 w-7 translate-x-1/2 items-center justify-center rounded-full border border-teal-400/30 bg-slate-900 shadow-lg">
                    <Wallet className="h-3.5 w-3.5 text-teal-300" />
                  </span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.4rem] border border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 backdrop-blur-xl shadow-xl shadow-emerald-500/25">
                    <ShieldCheck className="h-9 w-9 text-emerald-300" />
                  </span>
                </motion.div>
              </motion.div>

              {/* live chips — مضغوطة للهاتف */}
              <div className="mx-auto mb-8 flex max-w-[22rem] flex-wrap items-stretch justify-center gap-2">
                <motion.div
                  initial={{ opacity: 0, x: 26 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, delay: 0.82, ease }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-slate-900/80 p-2 backdrop-blur shadow-lg"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15">
                    <Users className="h-3 w-3 text-emerald-300" />
                  </span>
                  <span className="text-right leading-tight">
                    <span className="block whitespace-nowrap text-[10px] font-bold text-white">مريض جديد سجّل الآن</span>
                    <span className="block text-[9px] text-slate-500">قبل دقيقتين</span>
                  </span>
                  <span className="relative mr-0.5 flex h-1.5 w-1.5 shrink-0 self-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -26 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, delay: 0.94, ease }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-slate-900/80 p-2 backdrop-blur shadow-lg"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-400/15">
                    <Wallet className="h-3 w-3 text-teal-300" />
                  </span>
                  <span className="text-right leading-tight">
                    <span className="block whitespace-nowrap text-[10px] font-bold text-white">دفعة مستلمة</span>
                    <span className="block whitespace-nowrap text-[9px] text-slate-500">١٥٠٬٠٠٠ ر.s — الكاشير</span>
                  </span>
                </motion.div>

                <motion.span
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 1.06, ease }}
                  className="flex basis-full items-center justify-center gap-1.5 pt-1 text-[10px] font-medium text-slate-500"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  مزامنة لحظية عبر كل الأجهزة
                </motion.span>
              </div>

              {/* headline */}
              <motion.h2
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.18, ease }}
                className="text-center font-display text-[1.7rem] font-black leading-snug text-white"
              >
                النظام الأذكى
                <br />
                <span className="bg-gradient-to-l from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  لإدارة عيادتك
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 1.3, ease }}
                className="mx-auto mt-3.5 max-w-xs text-center leading-relaxed text-slate-400 font-serif-text"
              >
                منظومة متكاملة تجمع المرضى والمواعيد والمالية في لوحة واحدة، بعزل أمني كامل.
              </motion.p>

              {/* trust row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.45 }}
                className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-slate-500"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> تشفير كامل
                </span>
                <span className="h-3.5 w-px bg-white/10" />
                <span>نسخ احتياطي يومي</span>
                <span className="h-3.5 w-px bg-white/10" />
                <span>مراقبة ٢٤/٧</span>
              </motion.div>

              {/* divider bottom */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.5, duration: 0.6, ease }}
                className="mx-auto mt-10 h-px w-3/4 bg-gradient-to-l from-transparent via-white/[0.12] to-transparent"
              />
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease }}
              className="font-display font-black text-white text-3xl sm:text-4xl leading-snug"
            >
              أهلاً بعودتك
              <span className="bg-gradient-to-l from-emerald-300 to-teal-300 bg-clip-text text-transparent"> 👋</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease }}
              className="mt-2.5 text-slate-400 font-serif-text"
            >
              سجّل دخولك للوصول إلى لوحة تحكم عيادتك
            </motion.p>

            {/* mobile trust chips */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease }}
              className="mt-4 flex lg:hidden flex-wrap gap-2"
            >
              {[
                { icon: ShieldCheck, label: "تشفير كامل" },
                { icon: Activity, label: "مزامنة لحظية" },
                { icon: Sparkles, label: "مراقبة ٢٤/٧" },
              ].map((chip, i) => (
                <motion.span
                  key={chip.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-bold text-slate-300"
                >
                  <chip.icon className="h-3 w-3 text-emerald-400" />
                  {chip.label}
                </motion.span>
              ))}
            </motion.div>

            {/* ===== card with animated gradient border ===== */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24, ease }}
              className="relative mt-8"
            >
              {/* rotating conic border glow */}
              <div className="absolute -inset-px rounded-[1.65rem] overflow-hidden" aria-hidden>
                <motion.div
                  className="absolute inset-[-60%] opacity-60"
                  style={{
                    background:
                      "conic-gradient(from 90deg, transparent 0deg, rgba(52,211,153,.55) 60deg, transparent 120deg, rgba(45,212,191,.4) 220deg, transparent 300deg)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                />
              </div>

              <div className="relative rounded-[1.6rem] border border-white/[0.08] bg-slate-900/70 backdrop-blur-xl p-7 shadow-2xl shadow-black/40 space-y-5">
                {/* --- account suspended --- */}
                <AnimatePresence>
                  {accountSuspended && (
                    <motion.div
                      key="acct-susp"
                      initial={{ opacity: 0, height: 0, scale: 0.96 }}
                      animate={{ opacity: 1, height: "auto", scale: 1, x: [0, -8, 8, -5, 5, 0] }}
                      exit={{ opacity: 0, height: 0, scale: 0.96 }}
                      transition={{ duration: 0.55 }}
                      className="relative overflow-hidden rounded-2xl border border-orange-400/25 bg-orange-500/[0.08] p-4"
                    >
                      <motion.span
                        className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-orange-400 to-transparent"
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                      <div className="flex items-start gap-3">
                        <motion.span
                          animate={{ rotate: [0, -8, 8, 0] }}
                          transition={{ duration: 2.4, repeat: Infinity }}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/25"
                        >
                          <UserX className="h-5 w-5 text-white" />
                        </motion.span>
                        <div>
                          <p className="font-bold text-orange-300">تم إيقاف هذا الحساب</p>
                          <p className="mt-1 text-sm leading-relaxed text-orange-200/75">
                            {accountSuspended.name ? `الحساب «${accountSuspended.name}» موقوف حالياً من قبل إدارة المنصة.` : "هذا الحساب موقوف حالياً من قبل إدارة المنصة."}
                            {" "}باقي حسابات العيادة تعمل كالمعتاد.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* --- clinic subscription suspended --- */}
                  {suspendedInfo !== null && (
                    <motion.div
                      key="clinic-susp"
                      initial={{ opacity: 0, height: 0, scale: 0.96 }}
                      animate={{ opacity: 1, height: "auto", scale: 1, x: [0, -8, 8, -5, 5, 0] }}
                      exit={{ opacity: 0, height: 0, scale: 0.96 }}
                      transition={{ duration: 0.55 }}
                      className="relative overflow-hidden rounded-2xl border border-red-400/25 bg-red-500/[0.08] p-4"
                    >
                      <motion.span
                        className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-red-400 to-transparent"
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                      <div className="flex items-start gap-3">
                        <motion.span
                          animate={{ rotate: [0, -8, 8, 0] }}
                          transition={{ duration: 2.4, repeat: Infinity }}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25"
                        >
                          <Lock className="h-5 w-5 text-white" />
                        </motion.span>
                        <div>
                          <p className="font-bold text-red-300">تم تعليق اشتراك العيادة</p>
                          <p className="mt-1 text-sm leading-relaxed text-red-200/75">
                            {suspendedInfo ? `لا يمكن الدخول إلى حساب «${suspendedInfo}» حالياً.` : "لا يمكن الدخول إلى هذا الحساب حالياً."}
                            {" "}يرجى التواصل مع إدارة المنصة لإعادة تفعيل الاشتراك.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* --- generic error --- */}
                  {errorMsg && (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0, x: [0, -7, 7, -4, 4, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="rounded-xl border border-red-400/25 bg-red-500/[0.08] px-4 py-3 text-sm font-medium text-red-300 flex items-center gap-2"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400/20">
                        <Lock className="h-3 w-3" />
                      </span>
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* username */}
                <div>
                  <label htmlFor="username" className="mb-2 block text-sm font-bold text-slate-300">
                    اسم المستخدم
                  </label>
                  <div className="group relative">
                    <Mail className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-emerald-400" />
                    <input
                      id="username"
                      type="text"
                      placeholder="أدخل اسم المستخدم"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isPending}
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pr-11 pl-4 text-base text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-300 focus:border-emerald-400/50 focus:bg-emerald-400/[0.04] focus:shadow-[0_0_0_4px_rgba(52,211,153,0.08)] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-bold text-slate-300">كلمة المرور</label>
                    <a href="#" className="text-xs font-medium text-emerald-400/90 transition-colors hover:text-emerald-300">
                      نسيت كلمة المرور؟
                    </a>
                  </div>
                  <div className="group relative">
                    <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-emerald-400" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isPending}
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pr-11 pl-11 text-left text-base text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-300 focus:border-emerald-400/50 focus:bg-emerald-400/[0.04] focus:shadow-[0_0_0_4px_rgba(52,211,153,0.08)] disabled:opacity-50"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* submit */}
                <motion.button
                  type="submit"
                  disabled={isPending}
                  whileHover={{ scale: isPending ? 1 : 1.02 }}
                  whileTap={{ scale: isPending ? 1 : 0.98 }}
                  className="group relative mt-1 h-[3.25rem] w-full overflow-hidden rounded-xl bg-gradient-to-l from-emerald-500 to-teal-500 font-black text-base text-white shadow-xl shadow-emerald-500/30 transition-shadow duration-300 hover:shadow-emerald-400/45 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {!isPending && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  )}
                  <span className="relative inline-flex items-center justify-center gap-2">
                    {isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري التحقق...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        تسجيل الدخول
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </motion.form>

            {/* register hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-7 text-center text-sm text-slate-500"
            >
              ليس لديك حساب عيادة؟{" "}
              <Link href="/#contact" className="font-bold text-emerald-400 transition-colors hover:text-emerald-300">
                تواصل معنا للتسجيل
              </Link>
            </motion.p>
          </div>
        </div>

        {/* ==================== showcase side ==================== */}
        <div className="relative hidden lg:flex lg:w-[54%] items-center justify-center overflow-hidden">
          {/* divider line */}
          <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />

          <div className="relative max-w-xl px-12 py-16 text-center">
            {/* orbiting shield */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease }}
              className="relative mx-auto mb-10 h-44 w-44"
            >
              {/* pulse rings */}
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border border-emerald-400/20"
                  animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 1.5, ease: "easeOut" }}
                />
              ))}
              {/* orbit path */}
              <motion.div
                className="absolute inset-3 rounded-full border border-dashed border-white/[0.12]"
                animate={{ rotate: 360 }}
                transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
              >
                <span className="absolute -top-2 right-1/2 flex h-8 w-8 translate-x-1/2 items-center justify-center rounded-full border border-emerald-400/30 bg-slate-900 shadow-lg shadow-emerald-500/10">
                  <CalendarCheck2 className="h-4 w-4 text-emerald-300" />
                </span>
                <span className="absolute -bottom-2 right-1/4 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/30 bg-slate-900 shadow-lg">
                  <Users className="h-4 w-4 text-cyan-300" />
                </span>
                <span className="absolute -bottom-2 right-3/4 flex h-8 w-8 translate-x-1/2 items-center justify-center rounded-full border border-teal-400/30 bg-slate-900 shadow-lg">
                  <Wallet className="h-4 w-4 text-teal-300" />
                </span>
              </motion.div>
              {/* core shield */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="flex h-24 w-24 items-center justify-center rounded-[1.8rem] border border-emerald-300/30 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 backdrop-blur-xl shadow-2xl shadow-emerald-500/25">
                  <ShieldCheck className="h-12 w-12 text-emerald-300" />
                </span>
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease }}
              className="font-display font-black text-white text-4xl xl:text-5xl leading-snug"
            >
              النظام الأذكى
              <br />
              <span className="bg-gradient-to-l from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                لإدارة عيادتك
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease }}
              className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-slate-400 font-serif-text"
            >
              منظومة متكاملة تجمع المرضى والمواعيد والمالية والمخزون في لوحة واحدة،
              بعزل أمني كامل لكل عيادة.
            </motion.p>

            {/* floating live chips */}
            <div className="relative mx-auto mt-12 h-28 max-w-md">
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0, y: [0, -9, 0] }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.75 },
                  x: { duration: 0.6, delay: 0.75, ease },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.35 },
                }}
                className="absolute right-0 top-0 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-slate-900/80 px-4 py-3 backdrop-blur-xl shadow-xl"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/15">
                  <Users className="h-4 w-4 text-emerald-300" />
                </span>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">مريض جديد سجّل الآن</p>
                  <p className="text-[11px] text-slate-500">قبل دقيقتين</p>
                </div>
                <span className="relative mr-1 flex h-2 w-2 shrink-0 self-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0, y: [0, 9, 0] }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.95 },
                  x: { duration: 0.6, delay: 0.95, ease },
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.6 },
                }}
                className="absolute left-0 bottom-0 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-slate-900/80 px-4 py-3 backdrop-blur-xl shadow-xl"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/15">
                  <Wallet className="h-4 w-4 text-teal-300" />
                </span>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">دفعة مستلمة</p>
                  <p className="text-[11px] text-slate-500">١٥٠٬٠٠٠ ر.s — الكاشير</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.15, ease }}
                className="absolute right-1/2 translate-x-1/2 bottom-2 rounded-full border border-white/[0.08] bg-slate-900/80 px-4 py-2 text-[11px] font-bold text-slate-300 backdrop-blur-xl"
              >
                مزامنة لحظية عبر كل الأجهزة
              </motion.div>
            </div>

            {/* trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.3 }}
              className="mt-10 flex items-center justify-center gap-6 text-xs text-slate-500"
            >
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> تشفير كامل
              </span>
              <span className="h-4 w-px bg-white/10" />
              <span>نسخ احتياطي يومي</span>
              <span className="h-4 w-px bg-white/10" />
              <span>مراقبة ٢٤/٧</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
