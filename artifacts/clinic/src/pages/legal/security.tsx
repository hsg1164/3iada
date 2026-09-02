import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Shield, Lock, Server, Users, KeySquare, EyeOff } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col font-sans-thmanyah" dir="rtl">
      <LandingNavbar />
      
      <main className="flex-grow py-32">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-emerald-400/10 text-emerald-400 border border-emerald-400/25 flex items-center justify-center rounded-2xl mx-auto mb-6">
              <Shield className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 font-display">الأمان والموثوقية</h1>
            <p className="text-xl text-slate-400 dark:text-slate-500 max-w-2xl mx-auto">
              نلتزم في منصة "العيادة" بتوفير بيئة رقمية آمنة ومحصنة تتوافق مع أعلى المعايير العالمية لحماية السجلات الصحية.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Card 1 */}
            <div className="bg-slate-900/60 p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-200/90 dark:border-white/[0.08] backdrop-blur-sm transition-colors hover:border-white/[0.15]">
              <Lock className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white font-display">تشفير متقدم (Encryption)</h3>
              <p className="text-slate-400 dark:text-slate-500 leading-relaxed">
                جميع البيانات يتم تشفيرها أثناء النقل باستخدام بروتوكولات (TLS 1.3)، وأثناء التخزين (Data at Rest) باستخدام خوارزميات AES-256 القياسية في القطاع المصرفي.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900/60 p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-200/90 dark:border-white/[0.08] backdrop-blur-sm transition-colors hover:border-white/[0.15]">
              <Server className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white font-display">بنية تحتية معزولة (Multi-Tenant)</h3>
              <p className="text-slate-400 dark:text-slate-500 leading-relaxed">
                نستخدم معمارية عزل منطقي متقدمة تضمن فصل بيانات عيادتك بالكامل عن العيادات الأخرى في قاعدة البيانات، مما يمنع أي تداخل أو تسريب عَرَضي للبيانات.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-900/60 p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-200/90 dark:border-white/[0.08] backdrop-blur-sm transition-colors hover:border-white/[0.15]">
              <EyeOff className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white font-display">الامتثال الطبي (Compliance)</h3>
              <p className="text-slate-400 dark:text-slate-500 leading-relaxed">
                تم تصميم إجراءات الأمان لدينا لتكون متوافقة مع متطلبات HIPAA العالمية وقوانين حماية البيانات الشخصية والصحية المعمول بها.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-900/60 p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-200/90 dark:border-white/[0.08] backdrop-blur-sm transition-colors hover:border-white/[0.15]">
              <KeySquare className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white font-display">سجلات التدقيق (Audit Trails)</h3>
              <p className="text-slate-400 dark:text-slate-500 leading-relaxed">
                يحتفظ النظام بسجل غير قابل للتعديل لكل حركة (من قام بالدخول، ماذا قرأ، ماذا عدّل، ومتى). هذا يضمن الشفافية والقدرة على تتبع أي سلوك غير مصرح به.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-slate-900/60 p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-200/90 dark:border-white/[0.08] backdrop-blur-sm transition-colors hover:border-white/[0.15]">
              <Users className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white font-display">تحكم دقيق بالصلاحيات (RBAC)</h3>
              <p className="text-slate-400 dark:text-slate-500 leading-relaxed">
                يمكن لمدير العيادة تحديد صلاحيات مخصصة لكل موظف. لا يمكن للسكرتير الاطلاع على التشخيص الطبي، ولا يمكن للطبيب العادي الوصول للحسابات المالية.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-slate-900/60 p-8 rounded-3xl shadow-sm dark:shadow-none border border-slate-200/90 dark:border-white/[0.08] backdrop-blur-sm transition-colors hover:border-white/[0.15]">
              <Shield className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white font-display">النسخ الاحتياطي والحماية</h3>
              <p className="text-slate-400 dark:text-slate-500 leading-relaxed">
                نسخ احتياطي يومي مشفر تلقائي وموزع جغرافياً. بالإضافة لجدران حماية تطبيقية (WAF) للتصدي للهجمات السيبرانية وبرمجيات طلب الفدية.
              </p>
            </div>
          </div>

          <div className="rounded-3xl p-8 md:p-12 text-center bg-gradient-to-b from-emerald-500/[0.10] to-transparent border border-emerald-400/20">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white font-display">هل لديك استفسارات فنية حول الأمان؟</h2>
            <p className="text-slate-400 dark:text-slate-500 mb-8 max-w-xl mx-auto">
              فريق الأمن السيبراني لدينا مستعد للإجابة على كافة تساؤلاتك ومناقشة متطلبات الامتثال الخاصة بمؤسستك الطبية.
            </p>
            <a href="/#contact" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-gradient-to-l from-emerald-500 to-teal-500 text-slate-900 dark:text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40 transition-shadow">
              تواصل مع فريق الدعم
            </a>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
