import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const FAQS_AR = [
  { q: 'ما هو نظام الشراء الجماعي؟', a: 'نظام الشراء الجماعي يتيح لعدة مشترين الاتحاد لشراء نفس المنتج بكميات كبيرة والحصول على سعر الجملة، حتى لو كان طلب الفرد صغيراً.' },
  { q: 'كيف أنضم إلى صفقة شراء جماعي؟', a: 'افتح صفحة المنتج، ستجد قسم "الشراء الجماعي" يعرض العداد الزمني وعدد المشاركين. اضغط على "انضم للشراء الجماعي" ثم أضف المنتج للسلة.' },
  { q: 'ماذا يحدث إذا انتهى وقت العرض قبل اكتمال العدد المطلوب؟', a: 'إذا لم يكتمل العدد المطلوب في الوقت المحدد، سيتم تطبيق السعر العادي أو إلغاء الصفقة وفقاً لشروط كل عرض.' },
  { q: 'ما الفرق بين "شراء فوري" و"انضم للشراء الجماعي"؟', a: '"شراء فوري" يتجاوز نظام الجملة ويطبق خصماً عادياً فورياً. "انضم للشراء الجماعي" يسجلك في صفقة الجملة للحصول على السعر الأفضل عند اكتمال المجموعة.' },
  { q: 'هل الدفع آمن؟', a: 'نعم، جميع المعاملات تتم عبر نظام دفع مشفر وآمن بالكامل. بياناتك محمية ولا يتم مشاركتها مع أي طرف ثالث.' },
  { q: 'كيف يمكنني التواصل مع البائع؟', a: 'من خلال نظام المحادثة المدمج في المنصة. افتح الرسائل وسيظهر لك البائع كجهة اتصال مباشرة.' },
  { q: 'هل يمكنني إلغاء طلبي؟', a: 'يمكن إلغاء الطلبات خلال ساعة من تقديمها قبل الشحن. تواصل مع خدمة العملاء أو راسل البائع مباشرة.' },
  { q: 'ما سياسة الإرجاع؟', a: 'نقبل الإرجاع خلال 14 يوماً من استلام المنتج بشرط أن يكون في حالته الأصلية مع الملحقات والتغليف.' },
  { q: 'هل الشحن متاح لجميع المناطق؟', a: 'نوفر الشحن لجميع المحافظات السورية ودول عربية عدة. وقت التوصيل يتراوح بين 3-7 أيام عمل.' },
  { q: 'كيف أصبح بائعاً على المنصة؟', a: 'سجّل حساب بائع، ثم تواصل مع فريق الإدارة عبر صفحة "اتصل بنا" لإتمام عملية التحقق ورفع منتجاتك.' },
];

const FAQS_EN = [
  { q: 'What is the group buying system?', a: 'Group buying lets multiple buyers unite to purchase the same product in bulk and get wholesale prices, even if your individual order is small.' },
  { q: 'How do I join a group buy deal?', a: 'Open the product page, find the "Wholesale Deal" section showing the countdown timer and participant count. Click "Join Group Buy" then add the product to your cart.' },
  { q: 'What happens if the timer expires before reaching the required number?', a: 'If the required count is not reached in time, the regular price will be applied or the deal cancelled, according to each offer\'s terms.' },
  { q: 'What\'s the difference between "Buy Now" and "Join Group Buy"?', a: '"Buy Now" bypasses the wholesale system and applies a regular instant discount. "Join Group Buy" registers you in the wholesale deal for the best price when the group is complete.' },
  { q: 'Is payment secure?', a: 'Yes, all transactions go through a fully encrypted payment system. Your data is protected and never shared with third parties.' },
  { q: 'How can I contact a seller?', a: 'Use the built-in chat system. Open Messages and the seller will appear as a direct contact.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled within one hour of placement before shipping. Contact customer support or message the seller directly.' },
  { q: 'What is the return policy?', a: 'We accept returns within 14 days of receiving the product, provided it is in original condition with all accessories and packaging.' },
  { q: 'Is shipping available to all regions?', a: 'We ship to all Syrian governorates and several Arab countries. Delivery time is 3-7 business days.' },
  { q: 'How do I become a seller on the platform?', a: 'Register a seller account, then contact the admin team via the "Contact Us" page to complete verification and list your products.' },
];

export default function FAQ() {
  const { language, dir, t } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [open, setOpen]       = useState(null);
  const [search, setSearch]   = useState('');

  const faqs = language === 'ar' ? FAQS_AR : FAQS_EN;
  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-8">
          <HelpCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold">{t('faq.title')}</h1>
        </div>

        <div className="relative mb-8">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث في الأسئلة...' : 'Search FAQs...'}
            className={`w-full ps-12 pe-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-400 ${dark ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200'}`} />
        </div>

        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <div key={i} className={`rounded-2xl overflow-hidden ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-start gap-4">
                <span className="font-semibold text-sm">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className={`px-5 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
                  <p className="pt-4">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8">{t('common.no_results')}</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
