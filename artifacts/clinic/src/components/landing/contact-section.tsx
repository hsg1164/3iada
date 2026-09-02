import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Send,
  CheckCircle2, Loader2, MessageSquareHeart, ShieldCheck, Sparkles,
} from "lucide-react";

const CONTACT_INFO = [
  {
    Icon: Phone,
    label: "اتصل بنا",
    value: "+966 55 000 0000",
    href: "tel:+966550000000",
    ltr: true,
    hint: "متاحون خلال ساعات العمل",
    glow: "bg-cyan-300",
  },
  {
    Icon: Mail,
    label: "راسلنا",
    value: "hello@drziyad.clinic",
    href: "mailto:hello@drziyad.clinic",
    ltr: true,
    hint: "نرد خلال ٢٤ ساعة كحد أقصى",
    glow: "bg-blue-300",
  },
  {
    Icon: MapPin,
    label: "موقعنا",
    value: "الرياض — حي الياسمين، طريق أنس بن مالك",
    href: undefined,
    ltr: false,
    hint: "مواقف خاصة للمرضى",
    glow: "bg-violet-300",
  },
  {
    Icon: Clock,
    label: "أوقات العمل",
    value: "السبت — الخميس · ٩ صباحاً حتى ٩ مساءً",
    href: undefined,
    ltr: false,
    hint: "الطوارئ على مدار الساعة",
    glow: "bg-emerald-300",
  },
];

const SUBJECTS = ["استفسار عام", "طلب عرض سعر", "تجربة النظام (ديمو)", "دعم فني", "شراكة أو تعاون"];

type FormState = "idle" | "sending" | "success" | "error";

const inputCls =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0068E2]/60 focus:ring-4 focus:ring-[#0068E2]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400/50 dark:focus:ring-cyan-400/10";

const labelCls = "text-sm font-semibold text-slate-700 dark:text-slate-200";

export function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: SUBJECTS[0], message: "" });
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "تعذر إرسال الرسالة");
      }
      setState("success");
      setForm({ name: "", phone: "", email: "", subject: SUBJECTS[0], message: "" });
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "تعذر إرسال الرسالة، حاول لاحقاً");
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-32" dir="rtl">
      {/* خلفيات زخرفية */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0068E2]/[0.03] to-transparent dark:via-cyan-400/[0.04]" />
        <div className="absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-[#02D9D9]/15 blur-[130px]" />
        <div className="absolute bottom-0 left-1/5 h-80 w-80 rounded-full bg-[#0068E2]/15 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-[#0068E2] dark:text-cyan-300">
            <MessageSquareHeart className="h-4 w-4" />
            تواصل معنا
          </span>
          <h2 className="mt-3 font-display text-4xl font-black leading-snug text-slate-900 dark:text-white sm:text-5xl">
            جاهزون نسمع منكم
            <br />
            <span className="bg-gradient-to-l from-[#0068E2] to-[#02D9D9] bg-clip-text text-transparent dark:from-[#19E6D0] dark:to-[#5EA2FF]">
              في أي وقت
            </span>
          </h2>
          <p className="mt-5 font-serif-text text-lg leading-relaxed text-slate-500 dark:text-slate-400">
            سؤال عن النظام؟ تجربة مجانية؟ أو عرض سعر خاص لعيادتكم؟ اكتبوا لنا
            وسيرد عليكم الفريق خلال يوم عمل واحد.
          </p>
        </motion.div>

        <div className="mt-16 grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* ------------------------- بطاقات المعلومات ------------------------ */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="space-y-4"
          >
            {CONTACT_INFO.map(({ Icon, label, value, href, hint, ltr, glow }, i) => {
              const Wrapper = href ? motion.a : motion.div;
              return (
                <Wrapper
                  key={label}
                  {...(href ? { href } : {})}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: 0.08 * i }}
                  whileHover={href ? { y: -4 } : undefined}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(15,40,80,0.05)] transition-all duration-300 hover:border-cyan-200 hover:shadow-[0_16px_36px_-14px_rgba(0,104,226,0.18)] dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-cyan-400/30"
                >
                  <div className={`pointer-events-none absolute -top-12 -left-12 h-28 w-28 rounded-full ${glow} opacity-[0.08] blur-2xl transition-opacity duration-500 group-hover:opacity-[0.2]`} />
                  <span className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0068E2] to-[#02D9D9] p-3 text-white shadow-lg shadow-[#0068E2]/25 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1 relative">
                    <span className="block text-xs font-bold tracking-wide text-slate-400 dark:text-slate-500">{label}</span>
                    <span
                      className="block truncate text-[15px] font-bold text-slate-900 dark:text-white"
                      dir={ltr ? "ltr" : undefined}
                      style={ltr ? { textAlign: "right" } : undefined}
                    >
                      {value}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400 dark:text-slate-500">{hint}</span>
                  </span>
                </Wrapper>
              );
            })}

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.35 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2.5 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-5 py-4 dark:border-cyan-400/15 dark:bg-cyan-400/[0.06]"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-[#0068E2] dark:text-cyan-300" />
                بياناتكم مشفّرة وآمنة
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Sparkles className="h-4 w-4 text-[#0068E2] dark:text-cyan-300" />
                رد بشري حقيقي، لا ردود آلية
              </span>
            </motion.div>
          </motion.div>

          {/* --------------------------- النموذج --------------------------- */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div
              aria-hidden
              className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-[#0068E2]/20 via-[#02D9D9]/20 to-transparent opacity-70 blur-xl dark:opacity-30"
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white p-6 shadow-[0_24px_60px_-20px_rgba(0,104,226,0.25)] sm:p-8 dark:border-white/10 dark:bg-[#0c1629]">
              {state === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="flex min-h-[480px] flex-col items-center justify-center gap-5 text-center"
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 14 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-xl shadow-emerald-500/30"
                  >
                    <CheckCircle2 className="h-10 w-10" />
                  </motion.span>
                  <h3 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                    وصلت رسالتكم بنجاح 🎉
                  </h3>
                  <p className="max-w-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    شكراً لثقتكم بالعيادة. سيتواصل معكم فريقنا خلال ٢٤ ساعة
                    كحد أقصى على الرقم أو البريد الذي تركتموه.
                  </p>
                  <button
                    onClick={() => setState("idle")}
                    className="group mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0068E2] to-[#02D9D9] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#0068E2]/30 transition-transform hover:scale-105 active:scale-95"
                  >
                    إرسال رسالة أخرى
                    <Send className="h-4 w-4 -scale-x-100 transition-transform group-hover:-translate-x-1" />
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0068E2] to-[#02D9D9] text-white shadow-lg shadow-[#0068E2]/25">
                      <Send className="h-5 w-5 -scale-x-100" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">أرسلوا لنا رسالة</h3>
                      <p className="text-sm text-slate-400 dark:text-slate-500">الحقول المعلَّمة بـ * مطلوبة</p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="ct-name" className={labelCls}>
                        الاسم الكامل *
                      </label>
                      <input
                        id="ct-name"
                        required
                        minLength={2}
                        maxLength={120}
                        value={form.name}
                        onChange={update("name")}
                        placeholder="مثال: د. سارة العتيبي"
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="ct-phone" className={labelCls}>
                        رقم الجوال *
                      </label>
                      <input
                        id="ct-phone"
                        required
                        dir="ltr"
                        inputMode="tel"
                        pattern="[+\d][\d\s\-]{6,}"
                        maxLength={20}
                        value={form.phone}
                        onChange={update("phone")}
                        placeholder="+966 5X XXX XXXX"
                        className={`${inputCls} text-left`}
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="ct-email" className={labelCls}>
                        البريد الإلكتروني
                      </label>
                      <input
                        id="ct-email"
                        type="email"
                        dir="ltr"
                        maxLength={160}
                        value={form.email}
                        onChange={update("email")}
                        placeholder="you@example.com"
                        className={`${inputCls} text-left`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="ct-subject" className={labelCls}>
                        موضوع الرسالة
                      </label>
                      <select
                        id="ct-subject"
                        value={form.subject}
                        onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                        className={`${inputCls} appearance-none [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0c1629] dark:[&>option]:text-white`}
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ct-message" className={labelCls}>
                      تفاصيل الرسالة *
                    </label>
                    <textarea
                      id="ct-message"
                      required
                      minLength={5}
                      maxLength={4000}
                      rows={5}
                      value={form.message}
                      onChange={update("message")}
                      placeholder="اكتبوا لنا تفاصيل استفساركم أو احتياج عيادتكم هنا…"
                      className={`${inputCls} h-auto resize-none py-3 leading-relaxed`}
                    />
                  </div>

                  {state === "error" && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                    >
                      {errorMsg}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={state === "sending"}
                    className="group relative inline-flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#0068E2] to-[#02D9D9] py-3.5 text-base font-bold text-white shadow-lg shadow-[#0068E2]/30 transition-all hover:shadow-xl hover:shadow-[#0068E2]/45 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:-translate-x-full"
                    />
                    {state === "sending" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جارٍ الإرسال…
                      </>
                    ) : (
                      <>
                        إرسال الرسالة
                        <Send className="relative h-4 w-4 -scale-x-100 transition-transform group-hover:-translate-x-1" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                    بإرسال الرسالة أنت توافق على أن نتواصل معكم بخصوص طلبكم فقط.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
