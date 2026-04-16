import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PaymentForm from '../components/PaymentForm';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../utils/api';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { t, language, dir } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const dark = theme === 'dark';
  const [showPayment, setShowPayment] = useState(false);

  const shipping = total > 100 ? 0 : 9.99;
  const grandTotal = total + shipping;

  const handlePaymentSuccess = async (paymentData) => {
    try {
      await api.post('/orders', {
        paymentMethod: 'card',
        cardName: paymentData.cardHolder,
        shippingAddress: { country: 'Syria' },
      });
      clearCart();
      setShowPayment(false);
      toast.success(language === 'ar' ? 'تم الطلب بنجاح! 🎉' : 'Order placed successfully! 🎉');
      navigate('/orders');
    } catch {
      toast.error(t('common.error'));
    }
  };

  if (items.length === 0) return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBag className="w-20 h-20 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-400">{t('cart.empty')}</h2>
        <Link to="/home" className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors">
          {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
        </Link>
      </main>
      <Footer />
    </div>
  );

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t('cart.title')}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const p = item.product;
              if (!p) return null;
              const name = language === 'ar' ? p.nameAr : p.nameEn;
              const price = item.isWholesale && p.wholesalePrice ? p.wholesalePrice : p.price;
              return (
                <div key={item.productId} className={`flex gap-4 p-4 rounded-2xl ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
                  <img src={p.image} alt={name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm line-clamp-2">{name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
                        {item.isWholesale && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                            {t('cart.wholesale_item')}
                          </span>
                        )}
                      </div>
                      <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className={`flex items-center rounded-lg border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:text-red-500 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:text-red-500 transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-red-500">
                        {t('common.currency_symbol')} {(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className={`h-fit rounded-2xl p-6 space-y-4 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
            <h2 className="text-lg font-bold border-b pb-3 ${dark ? 'border-gray-800' : 'border-gray-100'}">
              {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span>{t('common.currency_symbol')} {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{language === 'ar' ? 'الشحن' : 'Shipping'}</span>
                <span className={shipping === 0 ? 'text-green-500 font-medium' : ''}>
                  {shipping === 0 ? (language === 'ar' ? 'مجاني' : 'Free') : `${t('common.currency_symbol')} ${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">
                  {language === 'ar' ? `أضف ${t('common.currency_symbol')} ${(100 - total).toFixed(2)} للشحن المجاني` : `Add ${t('common.currency_symbol')} ${(100 - total).toFixed(2)} for free shipping`}
                </p>
              )}
            </div>
            <div className={`flex justify-between font-bold text-lg pt-3 border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              <span>{t('cart.total')}</span>
              <span className="text-red-500">{t('common.currency_symbol')} {grandTotal.toFixed(2)}</span>
            </div>
            <button onClick={() => setShowPayment(true)}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
              {t('cart.checkout')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md">
            <PaymentForm
              total={grandTotal}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPayment(false)}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
