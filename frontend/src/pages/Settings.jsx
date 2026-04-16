import React, { useState } from 'react';
import { Palette, Globe, Shield, User, Bell, SlidersHorizontal, Moon, Sun, Check, LogOut, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const TABS = [
  { id: 'appearance', icon: Palette },
  { id: 'language',   icon: Globe },
  { id: 'security',   icon: Shield },
  { id: 'account',    icon: User },
  { id: 'preferences',icon: SlidersHorizontal },
  { id: 'notifications', icon: Bell },
];

const COLORS = [
  { key: 'red',    bg: 'bg-red-500',    label: 'أحمر / Red' },
  { key: 'blue',   bg: 'bg-blue-500',   label: 'أزرق / Blue' },
  { key: 'yellow', bg: 'bg-yellow-500', label: 'أصفر / Yellow' },
  { key: 'green',  bg: 'bg-green-500',  label: 'أخضر / Green' },
];

export default function Settings() {
  const { t, language, setLanguage, dir } = useLanguage();
  const { theme, toggleTheme, themeColor, setThemeColor } = useTheme();
  const { user, updateUser, logout } = useAuth();
  const dark = theme === 'dark';

  const [tab, setTab]           = useState('appearance');
  const [name, setName]         = useState(user?.name || '');
  const [phone, setPhone]       = useState(user?.phone || '');
  const [curPwd, setCurPwd]     = useState('');
  const [newPwd, setNewPwd]     = useState('');
  const [cnfPwd, setCnfPwd]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [notifs, setNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notif_settings') || '{}'); } catch { return {}; }
  });
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');
  const [region, setRegion]     = useState(localStorage.getItem('region') || 'SY');

  const toggleNotif = (key) => {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    localStorage.setItem('notif_settings', JSON.stringify(next));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', { name, phone });
      updateUser(data.user);
      toast.success(t('settings.saved'));
    } catch { toast.error(t('common.error')); }
    finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (newPwd !== cnfPwd) { toast.error(language === 'ar' ? 'كلمتا المرور غير متطابقتان' : 'Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.put('/users/password', { currentPassword: curPwd, newPassword: newPwd });
      setCurPwd(''); setNewPwd(''); setCnfPwd('');
      toast.success(language === 'ar' ? 'تم تغيير كلمة المرور' : 'Password changed');
    } catch (err) { toast.error(err.response?.data?.error || t('common.error')); }
    finally { setSaving(false); }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/users/account');
      logout();
      toast.success(language === 'ar' ? 'تم حذف الحساب' : 'Account deleted');
    } catch { toast.error(t('common.error')); }
  };

  const savePrefs = () => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('region', region);
    toast.success(t('settings.saved'));
  };

  const card = `rounded-2xl p-6 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`;
  const input = `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`;
  const btn = `px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95`;

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar */}
          <aside className={`sm:w-52 flex-shrink-0 flex flex-row sm:flex-col gap-1 overflow-x-auto ${card} h-fit`}>
            {TABS.map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all w-full text-start
                  ${tab === id ? 'bg-red-500 text-white' : dark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {t(`settings.${id}`)}
              </button>
            ))}
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-5">

            {/* Appearance */}
            {tab === 'appearance' && (
              <div className={card}>
                <h2 className="font-bold text-lg mb-5">{t('settings.appearance')}</h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium mb-3 text-gray-500">{language === 'ar' ? 'وضع العرض' : 'Display Mode'}</p>
                    <button onClick={toggleTheme}
                      className={`flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all
                        ${dark ? 'border-red-500 bg-gray-800' : 'border-red-500 bg-red-50'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${dark ? 'bg-gray-700' : 'bg-white shadow'}`}>
                        {dark ? <Moon className="w-6 h-6 text-blue-400" /> : <Sun className="w-6 h-6 text-yellow-500" />}
                      </div>
                      <div className="text-start">
                        <p className="font-semibold">{dark ? t('settings.dark_mode') : t('settings.light_mode')}</p>
                        <p className="text-xs text-gray-400">{language === 'ar' ? 'اضغط للتبديل' : 'Click to toggle'}</p>
                      </div>
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-3 text-gray-500">{language === 'ar' ? 'لون المنصة' : 'Theme Color'}</p>
                    <div className="flex gap-3">
                      {COLORS.map(c => (
                        <button key={c.key} onClick={() => setThemeColor(c.key)}
                          title={c.label}
                          className={`w-10 h-10 rounded-full ${c.bg} flex items-center justify-center transition-transform hover:scale-110 ${themeColor === c.key ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' : ''}`}>
                          {themeColor === c.key && <Check className="w-5 h-5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Language */}
            {tab === 'language' && (
              <div className={card}>
                <h2 className="font-bold text-lg mb-5">{t('settings.language')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[['ar','عربي','🇸🇦'], ['en','English','🇬🇧']].map(([lang, label, flag]) => (
                    <button key={lang} onClick={() => setLanguage(lang)}
                      className={`p-5 rounded-xl border-2 transition-all text-center hover:scale-105
                        ${language === lang ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : dark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}>
                      <p className="text-3xl mb-2">{flag}</p>
                      <p className="font-bold">{label}</p>
                      {language === lang && <span className="text-xs text-red-500 font-medium">{language === 'ar' ? '✓ محدد' : '✓ Selected'}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Security */}
            {tab === 'security' && (
              <div className="space-y-4">
                <div className={card}>
                  <h2 className="font-bold text-lg mb-5">{t('settings.change_password')}</h2>
                  <div className="space-y-3">
                    <input type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} placeholder={language === 'ar' ? 'كلمة المرور الحالية' : 'Current password'} className={input} />
                    <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder={language === 'ar' ? 'كلمة المرور الجديدة' : 'New password'} className={input} />
                    <input type="password" value={cnfPwd} onChange={e => setCnfPwd(e.target.value)} placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm password'} className={input} />
                    <button onClick={savePassword} disabled={saving} className={`${btn} bg-red-500 hover:bg-red-600 text-white disabled:opacity-50`}>
                      {saving ? t('common.loading') : t('settings.save')}
                    </button>
                  </div>
                </div>
                <div className={card}>
                  <h2 className="font-bold text-lg mb-4">{language === 'ar' ? 'الجلسة الحالية' : 'Current Session'}</h2>
                  <p className="text-sm text-gray-500 mb-4">{language === 'ar' ? `مسجل الدخول كـ ${user?.email}` : `Signed in as ${user?.email}`}</p>
                  <button onClick={logout} className={`${btn} bg-gray-100 dark:bg-gray-800 text-red-500 flex items-center gap-2`}>
                    <LogOut className="w-4 h-4" />
                    {t('settings.logout')}
                  </button>
                </div>
              </div>
            )}

            {/* Account */}
            {tab === 'account' && (
              <div className="space-y-4">
                <div className={card}>
                  <h2 className="font-bold text-lg mb-5">{t('settings.edit_profile')}</h2>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold">{user?.name}</p>
                      <p className="text-sm text-gray-400">{user?.email}</p>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">{user?.role}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder={t('auth.name')} className={input} />
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'} className={input} />
                    <button onClick={saveProfile} disabled={saving} className={`${btn} bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 flex items-center gap-2`}>
                      <Save className="w-4 h-4" />
                      {saving ? t('common.loading') : t('common.save_changes')}
                    </button>
                  </div>
                </div>
                <div className={`${card} border-2 border-red-200 dark:border-red-900`}>
                  <h2 className="font-bold text-lg mb-2 text-red-500">{language === 'ar' ? 'منطقة الخطر' : 'Danger Zone'}</h2>
                  <p className="text-sm text-gray-400 mb-4">{language === 'ar' ? 'حذف الحساب نهائي ولا يمكن التراجع عنه.' : 'Deleting your account is permanent and cannot be undone.'}</p>
                  {!showDelete ? (
                    <button onClick={() => setShowDelete(true)} className={`${btn} border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2`}>
                      <Trash2 className="w-4 h-4" />
                      {t('settings.delete_account')}
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={deleteAccount} className={`${btn} bg-red-500 hover:bg-red-600 text-white flex items-center gap-2`}>
                        <Trash2 className="w-4 h-4" />
                        {language === 'ar' ? 'نعم، احذف حسابي' : 'Yes, delete my account'}
                      </button>
                      <button onClick={() => setShowDelete(false)} className={`${btn} ${dark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {t('common.cancel')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preferences */}
            {tab === 'preferences' && (
              <div className={card}>
                <h2 className="font-bold text-lg mb-5">{t('settings.preferences')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">{t('settings.currency')}</label>
                    <select value={currency} onChange={e => setCurrency(e.target.value)} className={input}>
                      <option value="USD">USD ($) — دولار أمريكي</option>
                      <option value="SAR">SAR (ر.س) — ريال سعودي</option>
                      <option value="EUR">EUR (€) — يورو</option>
                      <option value="AED">AED (د.إ) — درهم إماراتي</option>
                      <option value="SYP">SYP (ل.س) — ليرة سورية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">{t('settings.location')}</label>
                    <select value={region} onChange={e => setRegion(e.target.value)} className={input}>
                      <option value="SY">🇸🇾 سوريا / Syria</option>
                      <option value="SA">🇸🇦 السعودية / Saudi Arabia</option>
                      <option value="AE">🇦🇪 الإمارات / UAE</option>
                      <option value="JO">🇯🇴 الأردن / Jordan</option>
                      <option value="LB">🇱🇧 لبنان / Lebanon</option>
                      <option value="IQ">🇮🇶 العراق / Iraq</option>
                    </select>
                  </div>
                  <button onClick={savePrefs} className={`${btn} bg-red-500 hover:bg-red-600 text-white`}>{t('common.save_changes')}</button>
                </div>
              </div>
            )}

            {/* Notifications */}
            {tab === 'notifications' && (
              <div className={card}>
                <h2 className="font-bold text-lg mb-5">{t('settings.notifications')}</h2>
                <div className="space-y-3">
                  {[
                    ['orders',    language === 'ar' ? 'تحديثات الطلبات'       : 'Order updates'],
                    ['wholesale', language === 'ar' ? 'تنبيهات العروض الجملة' : 'Wholesale deal alerts'],
                    ['price',     language === 'ar' ? 'تنبيهات انخفاض الأسعار': 'Price drop alerts'],
                    ['messages',  language === 'ar' ? 'الرسائل الجديدة'       : 'New messages'],
                    ['promo',     language === 'ar' ? 'العروض الترويجية'      : 'Promotional offers'],
                  ].map(([key, label]) => (
                    <div key={key} className={`flex items-center justify-between p-4 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <span className="text-sm font-medium">{label}</span>
                      <button
                        onClick={() => toggleNotif(key)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${notifs[key] ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifs[key] ? (dir === 'rtl' ? 'translate-x-[-26px]' : 'translate-x-6') : (dir === 'rtl' ? 'translate-x-[-4px]' : 'translate-x-0.5')}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
