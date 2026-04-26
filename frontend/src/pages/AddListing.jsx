import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, X, Plus, Tag, Package, DollarSign, Users,
  Clock, ChevronDown, ArrowLeft, ArrowRight, Zap, Image,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Home', 'Sports', 'Books', 'Beauty'];
const DURATIONS = [
  { value: '4h',  labelAr: '4 ساعات',  labelEn: '4 Hours' },
  { value: '1d',  labelAr: 'يوم واحد', labelEn: '1 Day' },
  { value: '2d',  labelAr: 'يومان',    labelEn: '2 Days' },
  { value: '1w',  labelAr: 'أسبوع',    labelEn: '1 Week' },
];

export default function AddListing() {
  const { language, dir, t } = useLanguage();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dark = theme === 'dark';
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    nameEn: '', nameAr: '',
    descEn: '', descAr: '',
    category: 'Electronics',
    price: '',
    stock: '',
    isWholesale: false,
    wholesalePrice: '',
    wholesaleMinParticipants: '',
    wholesaleDuration: '1d',
    tags: '',
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const ar = language === 'ar';
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error(ar ? 'الملف يجب أن يكون صورة' : 'File must be an image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(ar ? 'الصورة كبيرة جداً (الحد 5MB)' : 'Image too large (5MB max)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      set('image', e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nameEn.trim()) {
      toast.error(ar ? 'الاسم بالإنجليزية مطلوب' : 'English name is required');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error(ar ? 'السعر غير صحيح' : 'Invalid price');
      return;
    }
    if (form.isWholesale && (!form.wholesalePrice || Number(form.wholesalePrice) >= Number(form.price))) {
      toast.error(ar ? 'سعر الجملة يجب أن يكون أقل من السعر العادي' : 'Wholesale price must be less than regular price');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nameEn: form.nameEn.trim(),
        nameAr: form.nameAr.trim() || form.nameEn.trim(),
        descEn: form.descEn.trim(),
        descAr: form.descAr.trim() || form.descEn.trim(),
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock) || 10,
        isWholesale: form.isWholesale,
        wholesalePrice: form.isWholesale ? Number(form.wholesalePrice) : null,
        wholesaleMinParticipants: form.isWholesale ? Number(form.wholesaleMinParticipants) || 10 : null,
        wholesaleDuration: form.wholesaleDuration,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        image: form.image || null,
      };

      const { data } = await api.post('/products', payload);
      toast.success(ar ? 'تم نشر الإعلان بنجاح!' : 'Listing published!');
      navigate(`/product/${data.product.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'seller') {
    return (
      <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold mb-2">
              {ar ? 'هذه الصفحة للبائعين فقط' : 'This page is for sellers only'}
            </h2>
            <p className="text-gray-400 mb-6">
              {ar ? 'سجّل كبائع للبدء في نشر إعلاناتك' : 'Register as a seller to start posting listings'}
            </p>
            <button onClick={() => navigate('/home')}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors">
              {ar ? 'العودة للرئيسية' : 'Go Home'}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)}
            className={`p-2 rounded-xl transition-colors ${dark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <BackIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{ar ? 'أضف إعلانك' : 'Post a Listing'}</h1>
            <p className="text-sm text-gray-400">{ar ? 'بيع منتجاتك بسهولة' : 'Sell your products easily'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Photo upload */}
          <div className={`rounded-2xl p-5 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Image className="w-4 h-4 text-red-500" />
              {ar ? 'صورة المنتج' : 'Product Photo'}
            </h2>

            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="preview" className="w-48 h-48 object-cover rounded-xl border-2 border-red-400" />
                <button type="button"
                  onClick={() => { setPreview(null); set('image', null); }}
                  className="absolute -top-2 -end-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
                <button type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-2 end-2 px-3 py-1 bg-black/60 text-white text-xs rounded-lg hover:bg-black/80 transition-colors">
                  {ar ? 'تغيير' : 'Change'}
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                  ${dragOver
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                    : dark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <Camera className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">
                  {ar ? 'اضغط أو اسحب صورة هنا' : 'Click or drag an image here'}
                </p>
                <p className="text-xs text-gray-400 mt-1">{ar ? 'الحد الأقصى 5MB' : 'Max 5MB'}</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => handleImage(e.target.files[0])} />
            <p className="text-xs text-gray-400 mt-2">
              {ar ? '* إذا لم تختر صورة، سيتم إنشاء صورة تلقائية' : '* If no image is selected, one will be auto-generated'}
            </p>
          </div>

          {/* Basic info */}
          <div className={`rounded-2xl p-5 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-red-500" />
              {ar ? 'معلومات المنتج' : 'Product Info'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                    {ar ? 'الاسم بالإنجليزية *' : 'Name in English *'}
                  </label>
                  <input type="text" value={form.nameEn} onChange={e => set('nameEn', e.target.value)}
                    placeholder="e.g. Wireless Headphones"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-400
                      ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                    {ar ? 'الاسم بالعربية' : 'Name in Arabic'}
                  </label>
                  <input type="text" dir="rtl" value={form.nameAr} onChange={e => set('nameAr', e.target.value)}
                    placeholder="مثال: سماعات لاسلكية"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-400
                      ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                  {ar ? 'الفئة' : 'Category'}
                </label>
                <div className="relative">
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-400 appearance-none
                      ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                    {ar ? 'الوصف بالإنجليزية' : 'Description in English'}
                  </label>
                  <textarea value={form.descEn} onChange={e => set('descEn', e.target.value)}
                    rows={3} placeholder="Describe your product..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400
                      ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                    {ar ? 'الوصف بالعربية' : 'Description in Arabic'}
                  </label>
                  <textarea value={form.descAr} onChange={e => set('descAr', e.target.value)}
                    dir="rtl" rows={3} placeholder="اوصف منتجك..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400
                      ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className={`rounded-2xl p-5 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-red-500" />
              {ar ? 'السعر والمخزون' : 'Price & Stock'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                  {ar ? 'السعر *' : 'Price *'}
                </label>
                <div className="relative">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    {t('common.currency_symbol')}
                  </span>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)}
                    placeholder="0.00"
                    className={`w-full ps-10 pe-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-400
                      ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                  {ar ? 'المخزون' : 'Stock'}
                </label>
                <input type="number" min="1" value={form.stock} onChange={e => set('stock', e.target.value)}
                  placeholder="10"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-400
                    ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
              </div>
            </div>
          </div>

          {/* Wholesale */}
          <div className={`rounded-2xl p-5 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" />
                {ar ? 'الشراء الجماعي' : 'Group Buying (Wholesale)'}
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.isWholesale} onChange={e => set('isWholesale', e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
              </label>
            </div>

            {form.isWholesale && (
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                      {ar ? 'سعر الجملة' : 'Wholesale Price'}
                    </label>
                    <div className="relative">
                      <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        {t('common.currency_symbol')}
                      </span>
                      <input type="number" min="0" step="0.01" value={form.wholesalePrice} onChange={e => set('wholesalePrice', e.target.value)}
                        placeholder="0.00"
                        className={`w-full ps-10 pe-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-400
                          ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                      {ar ? 'الحد الأدنى للمشتركين' : 'Min. Participants'}
                    </label>
                    <input type="number" min="2" value={form.wholesaleMinParticipants} onChange={e => set('wholesaleMinParticipants', e.target.value)}
                      placeholder="10"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-400
                        ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-600 dark:text-gray-400">
                    <Clock className="inline w-3.5 h-3.5 me-1" />
                    {ar ? 'مدة العرض' : 'Offer Duration'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DURATIONS.map(d => (
                      <button key={d.value} type="button" onClick={() => set('wholesaleDuration', d.value)}
                        className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors
                          ${form.wholesaleDuration === d.value
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500'
                            : dark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                        {ar ? d.labelAr : d.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className={`rounded-2xl p-5 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-red-500" />
              {ar ? 'الوسوم (اختياري)' : 'Tags (Optional)'}
            </h2>
            <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
              placeholder={ar ? 'مثال: لاسلكي، جيمنج، أصلي' : 'e.g. wireless, gaming, original'}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-400
                ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200'}`} />
            <p className="text-xs text-gray-400 mt-1.5">
              {ar ? 'افصل الوسوم بفاصلة' : 'Separate tags with commas'}
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pb-6">
            <button type="button" onClick={() => navigate(-1)}
              className={`flex-1 py-3.5 rounded-xl border text-sm font-semibold transition-colors
                ${dark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{ar ? 'جارٍ النشر...' : 'Publishing...'}</>
              ) : (
                <><Zap className="w-4 h-4" />{ar ? 'نشر الإعلان' : 'Publish Listing'}</>
              )}
            </button>
          </div>

        </form>
      </main>
      <Footer />
    </div>
  );
}
