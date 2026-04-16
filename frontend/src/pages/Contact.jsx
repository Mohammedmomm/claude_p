import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Contact() {
  const { t, language, dir } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success(t('contact.success'));
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  const input = `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`;

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold mb-2 text-center">{t('contact.title')}</h1>
        <p className="text-gray-400 text-center mb-10">
          {language === 'ar' ? 'نحن هنا لمساعدتك. تواصل معنا.' : "We're here to help. Get in touch."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info cards */}
          <div className="space-y-4">
            {[
              { icon: Mail,    label: language === 'ar' ? 'البريد الإلكتروني' : 'Email', value: 'support@jumla.com' },
              { icon: Phone,   label: language === 'ar' ? 'الهاتف' : 'Phone',  value: '+963-11-123-4567' },
              { icon: MapPin,  label: language === 'ar' ? 'العنوان' : 'Address',value: language === 'ar' ? 'دمشق، سوريا' : 'Damascus, Syria' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className={`rounded-2xl p-5 flex items-start gap-4 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-medium text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className={`md:col-span-2 rounded-2xl p-6 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={t('contact.name')} required className={input} />
                <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" placeholder={t('contact.email')} required className={input} />
              </div>
              <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder={language === 'ar' ? 'الموضوع' : 'Subject'} required className={input} />
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder={t('contact.message')} required rows={5} className={`${input} resize-none`} />
              <button type="submit" disabled={sending}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70">
                {sending ? t('common.loading') : <><Send className="w-4 h-4" />{t('contact.send')}</>}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
