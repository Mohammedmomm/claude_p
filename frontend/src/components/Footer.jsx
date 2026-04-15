import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const FooterLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-gray-400 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-400 transition-colors text-sm"
  >
    {children}
  </Link>
);

const Footer = () => {
  const { t, language } = useLanguage();
  const year = new Date().getFullYear();

  const infoLinks = [
    { to: '/about', label: language === 'ar' ? 'من نحن' : 'About Us' },
    { to: '/contact', label: language === 'ar' ? 'تواصل معنا' : 'Contact' },
    { to: '/faq', label: language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ' },
    { to: '/privacy', label: language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy' },
    { to: '/terms', label: language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions' },
  ];

  const categories = [
    language === 'ar' ? 'إلكترونيات' : 'Electronics',
    language === 'ar' ? 'ملابس' : 'Clothing',
    language === 'ar' ? 'مواد غذائية' : 'Groceries',
    language === 'ar' ? 'منزل وحديقة' : 'Home & Garden',
    language === 'ar' ? 'أدوات' : 'Tools',
    language === 'ar' ? 'رياضة' : 'Sports',
  ];

  const socialLinks = [
    { label: 'Twitter', icon: '𝕏', href: '#' },
    { label: 'Instagram', icon: '📸', href: '#' },
    { label: 'Facebook', icon: '👤', href: '#' },
    { label: 'WhatsApp', icon: '💬', href: '#' },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-auto">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow group-hover:shadow-md transition-shadow">
                <span className="text-white font-black text-xl leading-none">ج</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-white text-lg">جمله</span>
                <span className="text-xs text-gray-400 tracking-widest">JUMLA</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {language === 'ar'
                ? 'منصة الشراء الجماعي الأولى في المنطقة. اشتروا معاً، ووفّروا معاً.'
                : 'The region\'s first group buying platform. Buy together, save together.'}
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-5">
              {socialLinks.map(({ label, icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 dark:bg-gray-900 hover:bg-red-500 flex items-center justify-center text-base transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Info links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
              {language === 'ar' ? 'روابط مهمة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2.5">
              {infoLinks.map(({ to, label }) => (
                <li key={to}>
                  <FooterLink to={to}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
              {language === 'ar' ? 'الفئات' : 'Categories'}
            </h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/home?category=${encodeURIComponent(cat)}`}
                    className="text-gray-400 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-400 transition-colors text-sm"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Newsletter */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
              {language === 'ar' ? 'تواصل معنا' : 'Contact'}
            </h3>
            <div className="space-y-2.5 text-sm text-gray-400">
              <p>📧 support@jumla.sa</p>
              <p>📞 +966 12 345 6789</p>
              <p>📍 {language === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}</p>
            </div>

            {/* Simple newsletter */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">
                {language === 'ar' ? 'اشترك للحصول على أحدث العروض' : 'Subscribe for latest deals'}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Your email'}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-gray-800 dark:bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-red-500 transition-colors"
                />
                <button className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white text-xs font-semibold transition-colors flex-shrink-0">
                  {language === 'ar' ? 'اشترك' : 'Go'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">
            © {year} جمله | Jumla.{' '}
            {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <div className="flex items-center gap-4">
            <FooterLink to="/privacy">
              {language === 'ar' ? 'الخصوصية' : 'Privacy'}
            </FooterLink>
            <FooterLink to="/terms">
              {language === 'ar' ? 'الشروط' : 'Terms'}
            </FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
