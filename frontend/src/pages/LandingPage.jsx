import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Shield, TrendingDown, ArrowRight, Star, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();

  const benefits = [
    {
      icon: Users,
      title: t('landing.benefit1_title'),
      desc: t('landing.benefit1_desc'),
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Clock,
      title: t('landing.benefit2_title'),
      desc: t('landing.benefit2_desc'),
      color: 'from-red-500 to-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      icon: Shield,
      title: t('landing.benefit3_title'),
      desc: t('landing.benefit3_desc'),
      color: 'from-green-500 to-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  const stats = [
    { value: '50K+', label: language === 'ar' ? 'مستخدم' : 'Users' },
    { value: '10K+', label: language === 'ar' ? 'منتج' : 'Products' },
    { value: '35%', label: language === 'ar' ? 'متوسط التوفير' : 'Avg. Savings' },
    { value: '98%', label: language === 'ar' ? 'رضا العملاء' : 'Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Navbar />

      {/* Hero section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" />

        {/* Decorative circles */}
        <div className="absolute top-20 start-1/4 w-64 h-64 bg-red-200 dark:bg-red-900/20 rounded-full filter blur-3xl opacity-30 animate-pulse-slow" />
        <div className="absolute bottom-10 end-1/4 w-48 h-48 bg-blue-200 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-30 animate-pulse-slow" />

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold mb-6 animate-fade-in">
            <Zap className="w-4 h-4 fill-current" />
            {language === 'ar' ? 'الأول في المنطقة' : 'First in the Region'}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-tight mb-6 animate-slide-up">
            {t('landing.hero_title')
              .split('،')
              .map((part, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-red-500">،</span>}
                  {i === 1 ? (
                    <span className="gradient-text">{part}</span>
                  ) : (
                    part
                  )}
                </React.Fragment>
              ))}
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            {t('landing.hero_subtitle')}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link
              to="/register"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              {t('landing.cta_register')}
              <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180' : ''}`} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold text-lg hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
            >
              {t('landing.cta_login')}
            </Link>
          </div>

          {/* Star rating social proof */}
          <div className="flex items-center justify-center gap-2 mt-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
            </div>
            <span>{language === 'ar' ? '4.9 — أكثر من 2,000 تقييم' : '4.9 — 2,000+ reviews'}</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl md:text-4xl font-black text-red-500 dark:text-red-400">
                  {value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              {t('landing.features')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {language === 'ar'
                ? 'كل ما تحتاجه للتسوق الذكي في مكان واحد'
                : 'Everything you need for smart shopping in one place'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className={`${bg} rounded-2xl p-8 text-center group hover:shadow-lg transition-all duration-200`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
              {language === 'ar' ? 'كيف يعمل جمله؟' : 'How Jumla Works?'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: language === 'ar' ? 'اختر منتجك' : 'Choose Your Product',
                desc: language === 'ar' ? 'تصفح آلاف المنتجات واختر ما يناسبك' : 'Browse thousands of products',
              },
              {
                step: '2',
                title: language === 'ar' ? 'انضم للمجموعة' : 'Join the Group',
                desc: language === 'ar' ? 'انضم لصفقة الشراء الجماعي قبل انتهاء المهلة' : 'Join a group buy before the deadline',
              },
              {
                step: '3',
                title: language === 'ar' ? 'استمتع بالتوفير' : 'Enjoy Savings',
                desc: language === 'ar' ? 'احصل على سعر الجملة المخفض وتوفير حقيقي' : 'Get wholesale pricing and real savings',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white font-black text-xl flex items-center justify-center mb-4 shadow-lg">
                  {step}
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl p-10 md:p-16 text-white shadow-2xl">
            <TrendingDown className="w-14 h-14 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              {language === 'ar' ? 'ابدأ التوفير اليوم' : 'Start Saving Today'}
            </h2>
            <p className="text-red-100 mb-8 text-lg">
              {language === 'ar'
                ? 'انضم إلى آلاف المتسوقين الذكيين وابدأ في توفير المال'
                : 'Join thousands of smart shoppers and start saving money'}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-red-600 font-bold text-lg hover:bg-red-50 transition-colors shadow-lg"
            >
              {t('landing.cta_register')}
              <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
