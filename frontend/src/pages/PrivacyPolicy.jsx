import React from 'react';
import { Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const SECTIONS_AR = [
  { title: 'البيانات التي نجمعها', body: 'نجمع المعلومات التي تقدمها عند التسجيل مثل الاسم والبريد الإلكتروني ورقم الهاتف، وبيانات الاستخدام مثل صفحات الزيارة والمنتجات المشاهدة.' },
  { title: 'كيف نستخدم بياناتك', body: 'نستخدم بياناتك لتقديم خدماتنا، وتحسين تجربتك، وإرسال تحديثات الطلبات، وتنبيهات العروض الخاصة (بموافقتك).' },
  { title: 'مشاركة البيانات', body: 'لا نبيع بياناتك الشخصية. نشارك فقط ما هو ضروري مع البائعين لإتمام طلباتك، ومع مزودي الخدمات التقنية بموجب اتفاقيات سرية صارمة.' },
  { title: 'ملفات تعريف الارتباط', body: 'نستخدم ملفات تعريف الارتباط لحفظ إعداداتك وتحليل الاستخدام. يمكنك التحكم في هذه الملفات من إعدادات متصفحك.' },
  { title: 'الأمان', body: 'نحمي بياناتك باستخدام تشفير SSL ومعايير أمان عالية. نراجع أنظمتنا بانتظام للحفاظ على سلامة بياناتك.' },
  { title: 'حقوقك', body: 'يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها في أي وقت. تواصل معنا عبر صفحة الاتصال.' },
  { title: 'التعديلات على السياسة', body: 'قد نحدّث هذه السياسة دورياً. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار داخل المنصة.' },
  { title: 'تواصل معنا', body: 'لأي استفسارات حول سياسة الخصوصية، تواصل معنا على: privacy@jumla.com' },
];

const SECTIONS_EN = [
  { title: 'Data We Collect', body: 'We collect information you provide when registering such as name, email and phone number, and usage data like pages visited and products viewed.' },
  { title: 'How We Use Your Data', body: 'We use your data to provide our services, improve your experience, send order updates, and special offer alerts (with your consent).' },
  { title: 'Data Sharing', body: "We don't sell your personal data. We only share what's necessary with sellers to fulfill your orders, and with technical service providers under strict confidentiality agreements." },
  { title: 'Cookies', body: 'We use cookies to save your settings and analyze usage. You can control these files from your browser settings.' },
  { title: 'Security', body: 'We protect your data using SSL encryption and high security standards. We regularly review our systems to maintain the safety of your data.' },
  { title: 'Your Rights', body: 'You have the right to request access to, correction of, or deletion of your data at any time. Contact us through the contact page.' },
  { title: 'Policy Updates', body: 'We may update this policy periodically. You will be notified of any significant changes via email or an in-platform notification.' },
  { title: 'Contact Us', body: 'For any questions about the privacy policy, contact us at: privacy@jumla.com' },
];

export default function PrivacyPolicy() {
  const { language, dir } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const sections = language === 'ar' ? SECTIONS_AR : SECTIONS_EN;

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">{language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</h1>
        </div>
        <p className="text-sm text-gray-400 mb-8">{language === 'ar' ? 'آخر تحديث: يناير 2025' : 'Last updated: January 2025'}</p>
        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className={`rounded-2xl p-6 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
              <h2 className="font-bold text-lg mb-3 text-red-500">{i + 1}. {s.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">{s.body}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
