import React from 'react';
import { FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const TERMS_AR = [
  { title: 'قبول الشروط', body: 'باستخدامك لمنصة جُمله، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.' },
  { title: 'التسجيل والحسابات', body: 'يجب أن تكون مسؤولاً عن الحفاظ على سرية كلمة مرورك وأمان حسابك. تقع على عاتقك مسؤولية جميع الأنشطة التي تتم تحت حسابك.' },
  { title: 'قواعد الشراء الجماعي', body: 'تنطبق أسعار الجملة فقط عند اكتمال العدد المطلوب من المشاركين خلال المدة المحددة. تحتفظ المنصة بالحق في تعديل أو إلغاء أي صفقة جملة دون إشعار مسبق.' },
  { title: 'المدفوعات والأسعار', body: 'جميع الأسعار بالعملة المحددة وتشمل الضرائب المعمول بها. نحتفظ بالحق في تغيير الأسعار في أي وقت. يتم تأكيد السعر عند إتمام الطلب.' },
  { title: 'الشحن والتسليم', body: 'مواعيد التسليم تقديرية وغير مضمونة. لسنا مسؤولين عن التأخيرات الناتجة عن ظروف خارجة عن سيطرتنا كالكوارث الطبيعية أو الإضرابات.' },
  { title: 'الإرجاع والاسترداد', body: 'يقبل الإرجاع خلال 14 يوماً من الاستلام للمنتجات غير المستخدمة بحالتها الأصلية. بعض الفئات كالمواد الغذائية والمستحضرات غير قابلة للإرجاع.' },
  { title: 'سلوك المستخدم', body: 'يُحظر استخدام المنصة لأي نشاط غير قانوني أو الاحتيال أو انتحال الشخصية أو التلاعب بنظام الشراء الجماعي. يؤدي ذلك إلى إيقاف الحساب فوراً.' },
  { title: 'المسؤولية', body: 'لا تتحمل جُمله مسؤولية الأضرار غير المباشرة أو التبعية. مسؤوليتنا القصوى محدودة بقيمة آخر طلب قمت به.' },
  { title: 'الملكية الفكرية', body: 'جميع المحتويات على المنصة محمية بحقوق الملكية الفكرية. لا يجوز نسخ أو توزيع أي محتوى دون إذن خطي مسبق.' },
  { title: 'التعديلات', body: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرارك في استخدام المنصة بعد نشر التعديلات يعني موافقتك عليها.' },
];

const TERMS_EN = [
  { title: 'Acceptance of Terms', body: 'By using the Jumla platform, you agree to be bound by these terms and conditions. If you do not agree to any of these terms, please do not use the platform.' },
  { title: 'Registration and Accounts', body: 'You are responsible for maintaining the confidentiality of your password and account security. You bear responsibility for all activities that occur under your account.' },
  { title: 'Group Buying Rules', body: 'Wholesale prices apply only when the required number of participants is completed within the specified period. The platform reserves the right to modify or cancel any wholesale deal without prior notice.' },
  { title: 'Payments and Prices', body: 'All prices are in the specified currency and include applicable taxes. We reserve the right to change prices at any time. The price is confirmed upon order completion.' },
  { title: 'Shipping and Delivery', body: 'Delivery dates are estimates and not guaranteed. We are not responsible for delays resulting from circumstances beyond our control such as natural disasters or strikes.' },
  { title: 'Returns and Refunds', body: 'Returns are accepted within 14 days of receipt for unused products in original condition. Some categories such as food and cosmetics are non-returnable.' },
  { title: 'User Conduct', body: 'Using the platform for any illegal activity, fraud, impersonation, or manipulation of the group buying system is prohibited. This results in immediate account suspension.' },
  { title: 'Liability', body: 'Jumla is not responsible for indirect or consequential damages. Our maximum liability is limited to the value of your last order.' },
  { title: 'Intellectual Property', body: 'All content on the platform is protected by intellectual property rights. No content may be copied or distributed without prior written permission.' },
  { title: 'Modifications', body: 'We reserve the right to modify these terms at any time. Your continued use of the platform after changes are posted constitutes your acceptance of them.' },
];

export default function Terms() {
  const { language, dir } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const terms = language === 'ar' ? TERMS_AR : TERMS_EN;

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">{language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}</h1>
        </div>
        <p className="text-sm text-gray-400 mb-8">{language === 'ar' ? 'آخر تحديث: يناير 2025' : 'Last updated: January 2025'}</p>
        <div className="space-y-4">
          {terms.map((s, i) => (
            <div key={i} className={`rounded-2xl p-6 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
              <h2 className="font-bold mb-2">{i + 1}. {s.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{s.body}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
