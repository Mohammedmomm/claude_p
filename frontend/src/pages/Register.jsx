import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const Register = () => {
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = language === 'ar' ? 'الاسم يجب أن يكون حرفين على الأقل' : 'Name must be at least 2 characters';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = language === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email address';
    }
    if (password.length < 6) {
      errs.password = language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
    }
    if (!termsAccepted) {
      errs.terms = language === 'ar' ? 'يجب الموافقة على الشروط والأحكام' : 'You must accept the terms';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email, password, role);
      toast.success(language === 'ar' ? 'تم إنشاء حسابك بنجاح!' : 'Account created successfully!');
      navigate('/home');
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(msg || (language === 'ar' ? 'فشل إنشاء الحساب' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) => `
    w-full ps-10 pe-4 py-3 rounded-xl border text-base
    bg-white dark:bg-gray-800
    text-gray-800 dark:text-white
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-red-400
    transition-colors
    ${hasError ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
  `;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">ج</span>
            </div>
            <div className="text-start">
              <div className="font-black text-gray-800 dark:text-white text-xl">جمله</div>
              <div className="text-xs text-gray-400 tracking-widest">JUMLA</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
            {t('auth.register_title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            {language === 'ar' ? 'انضم مجاناً وابدأ التوفير 🎉' : 'Join for free and start saving 🎉'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('auth.name')}
              </label>
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'ar' ? 'محمد أحمد' : 'John Smith'}
                  className={inputClass(errors.name)}
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass(errors.email)}
                  autoComplete="email"
                  dir="ltr"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass(errors.password)} pe-12`}
                  autoComplete="new-password"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t('auth.confirm_password')}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass(errors.confirmPassword)}
                  autoComplete="new-password"
                  dir="ltr"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === 'ar' ? 'أنا...' : 'I am a...'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'buyer', label: t('auth.role_buyer'), emoji: '🛒' },
                  { value: 'seller', label: t('auth.role_seller'), emoji: '🏪' },
                ].map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all
                      flex items-center justify-center gap-2
                      ${role === value
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                      }`}
                  >
                    <span>{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded accent-red-500 flex-shrink-0"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {language === 'ar' ? 'أوافق على ' : 'I agree to the '}
                <Link to="/terms" className="text-red-500 hover:text-red-600 font-medium">
                  {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
                </Link>
                {language === 'ar' ? ' و' : ' and '}
                <Link to="/privacy" className="text-red-500 hover:text-red-600 font-medium">
                  {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </Link>
              </span>
            </label>
            {errors.terms && <p className="text-red-500 text-xs">{errors.terms}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white text-base
                flex items-center justify-center gap-2
                transition-all duration-200 active:scale-95
                ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl'
                }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {t('auth.register_title')}
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
            <span className="text-xs text-gray-400">{language === 'ar' ? 'أو' : 'or'}</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-red-500 hover:text-red-600 font-semibold transition-colors">
              {t('auth.login_title')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
