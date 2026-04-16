import React from 'react';
import { Users, Target, Eye, TrendingUp, Shield, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const TEAM = [
  { name: 'أحمد الرشيد / Ahmed Al-Rashid', role: 'CEO & Founder', color: 'from-red-400 to-orange-400' },
  { name: 'سارة محمود / Sara Mahmoud',     role: 'CTO',           color: 'from-blue-400 to-cyan-400' },
  { name: 'خالد عمر / Khalid Omar',         role: 'Head of Product',color: 'from-green-400 to-teal-400' },
  { name: 'ليلى حسن / Layla Hassan',        role: 'Design Lead',   color: 'from-purple-400 to-pink-400' },
];

export default function AboutUs() {
  const { t, language, dir } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-br from-red-600 via-blue-600 to-purple-600 text-white py-20 px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{language === 'ar' ? 'من نحن' : 'About Us'}</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            {language === 'ar'
              ? 'جُمله — منصة الشراء الجماعي الأولى في المنطقة'
              : 'Jumla — The first time-based wholesale platform in the region'}
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Target, title: language === 'ar' ? 'مهمتنا' : 'Our Mission', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20',
                text: language === 'ar'
                  ? 'تمكين كل شخص من الوصول إلى أسعار الجملة بغض النظر عن حجم طلبه، من خلال توحيد الطلبات وتقديم عروض جماعية ذكية.'
                  : 'Empower everyone to access wholesale prices regardless of order size, by unifying orders and offering smart group deals.' },
              { icon: Eye, title: language === 'ar' ? 'رؤيتنا' : 'Our Vision', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20',
                text: language === 'ar'
                  ? 'أن نكون المنصة التجارية الأولى في الشرق الأوسط التي تجمع بين قوة الشراء الجماعي وسهولة التجارة الإلكترونية.'
                  : 'To be the leading commerce platform in the Middle East that combines the power of group buying with the ease of e-commerce.' },
            ].map(({ icon: Icon, title, color, bg, text }) => (
              <div key={title} className={`rounded-2xl p-6 ${bg} ${dark ? '' : ''}`}>
                <Icon className={`w-10 h-10 ${color} mb-4`} />
                <h2 className="text-xl font-bold mb-3">{title}</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className={`rounded-2xl p-8 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
            <h2 className="text-2xl font-bold mb-4">{language === 'ar' ? 'قصتنا' : 'Our Story'}</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {language === 'ar'
                ? 'بدأت جُمله عام 2024 برؤية بسيطة: لماذا يجب أن تكون أسعار الجملة حكراً على الشركات الكبيرة فقط؟ أردنا أن نجعل توفير المال عبر الشراء الجماعي متاحاً للجميع — الأفراد، والعائلات، والشركات الصغيرة.'
                : 'Jumla started in 2024 with a simple vision: why should wholesale prices be exclusive to large corporations? We wanted to make saving money through group buying accessible to everyone — individuals, families, and small businesses.'}
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {language === 'ar'
                ? 'اليوم، نخدم آلاف المستخدمين في المنطقة، ونوفر لهم فرصة الحصول على منتجات عالية الجودة بأسعار لا تُصدق من خلال نظام الشراء الجماعي المرتبط بالزمن.'
                : 'Today, we serve thousands of users across the region, giving them the opportunity to get high-quality products at incredible prices through our time-based group buying system.'}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users,     num: '10K+', label: language === 'ar' ? 'مستخدم نشط' : 'Active Users' },
              { icon: TrendingUp,num: '50K+', label: language === 'ar' ? 'طلب مكتمل'  : 'Orders Completed' },
              { icon: Shield,    num: '100%', label: language === 'ar' ? 'أمان مضمون' : 'Secure Payments' },
              { icon: Globe,     num: '10+',  label: language === 'ar' ? 'دولة'        : 'Countries' },
            ].map(({ icon: Icon, num, label }) => (
              <div key={label} className={`rounded-2xl p-5 text-center ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
                <Icon className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-500">{num}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Team */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">{language === 'ar' ? 'فريقنا' : 'Our Team'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TEAM.map(m => (
                <div key={m.name} className={`rounded-2xl p-5 text-center ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${m.color} mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold`}>
                    {m.name[0]}
                  </div>
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
