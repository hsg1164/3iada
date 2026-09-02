import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col font-sans-thmanyah" dir="rtl">
      <LandingNavbar />
      
      <main className="flex-grow container mx-auto px-4 py-32 max-w-4xl">
        <div className="bg-white dark:bg-slate-900/70 rounded-3xl shadow-sm dark:shadow-none border border-slate-200/90 dark:border-white/[0.08] p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-8 font-display">سياسة الخصوصية</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">تاريخ آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>

          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-a:text-[#0068E2] dark:prose-a:text-emerald-400">
            <p>
              نحن في منصة <strong>"العيادة"</strong> نلتزم التزاماً كاملاً بحماية خصوصية بيانات عملائنا (العيادات والأطباء) وبيانات مرضاهم. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات الشخصية والطبية عبر نظامنا.
            </p>

            <h2>1. جمع المعلومات</h2>
            <p>نقوم بجمع الأنواع التالية من المعلومات:</p>
            <ul>
              <li><strong>معلومات العيادة:</strong> اسم العيادة، العنوان، بيانات التواصل، والتراخيص الطبية.</li>
              <li><strong>بيانات المستخدمين:</strong> أسماء الأطباء والموظفين، البريد الإلكتروني، وصلاحيات الدخول.</li>
              <li><strong>البيانات الطبية للمرضى:</strong> التي يتم إدخالها من قبل العيادات (التاريخ الطبي، التشخيص، الوصفات). <em>نحن نعالج هذه البيانات كمزود خدمة ولا نملكها.</em></li>
            </ul>

            <h2>2. استخدام المعلومات</h2>
            <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
            <ul>
              <li>تقديم وتشغيل خدمات المنصة بشكل مستقر.</li>
              <li>تأمين الحسابات ومنع الوصول غير المصرح به.</li>
              <li>تقديم الدعم الفني وتحديثات النظام.</li>
              <li>لا نقوم <strong>مطلقاً</strong> ببيع أو مشاركة أو استغلال السجلات الطبية للمرضى لأي أغراض تسويقية أو بحثية.</li>
            </ul>

            <h2>3. حماية البيانات والأمان</h2>
            <p>
              نطبق معايير أمنية صارمة تتماشى مع معايير قطاع الرعاية الصحية، تشمل:
            </p>
            <ul>
              <li>تشفير البيانات أثناء النقل (SSL/TLS) وأثناء التخزين (AES-256).</li>
              <li>فصل قواعد البيانات (Data Isolation) لمنع تداخل بيانات العيادات.</li>
              <li>نسخ احتياطي يومي ومشفر.</li>
            </ul>

            <h2>4. حقوق العيادات (العملاء)</h2>
            <p>
              بصفتك مالك العيادة، أنت تمتلك السيطرة الكاملة على بيانات عيادتك ومرضاك. يمكنك في أي وقت طلب استخراج نسخة كاملة من بياناتك أو طلب حذفها نهائياً عند إلغاء الاشتراك.
            </p>

            <h2>5. التعديلات على سياسة الخصوصية</h2>
            <p>
              نحتفظ بالحق في تحديث سياسة الخصوصية هذه في أي وقت. سيتم إشعار جميع العيادات المشتركة بأي تغييرات جوهرية قبل تطبيقها.
            </p>

            <h2>6. التواصل معنا</h2>
            <p>
              إذا كان لديك أي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني: <a href="mailto:privacy@aleyada.com">privacy@aleyada.com</a>
            </p>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
