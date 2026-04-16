import React, { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../utils/api';

const STATUS_STYLES = {
  processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  shipped:    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  delivered:  'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  cancelled:  'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function Orders() {
  const { t, language, dir } = useLanguage();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => toast.error(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  const statusLabel = (s) => ({
    processing: t('orders.processing'),
    shipped:    t('orders.shipped'),
    delivered:  t('orders.delivered'),
    cancelled:  t('orders.cancelled'),
  }[s] || s);

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-red-500" />
          {t('orders.title')}
        </h1>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <Package className="w-20 h-20 text-gray-200" />
            <p className="text-xl font-semibold text-gray-400">{t('orders.empty')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className={`rounded-2xl overflow-hidden ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
                {/* Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || ''}`}>
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-end">
                      <p className="font-bold text-red-500">{t('common.currency_symbol')} {order.total}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    {expanded === order.id
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded */}
                {expanded === order.id && (
                  <div className={`border-t px-4 pb-4 pt-3 space-y-3 ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
                    {(order.items || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={item.image} alt={language === 'ar' ? item.nameAr : item.nameEn}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{language === 'ar' ? item.nameAr : item.nameEn}</p>
                          <p className="text-xs text-gray-400">{t('cart.quantity')}: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold">{t('common.currency_symbol')} {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.estimatedDelivery && (
                      <p className="text-xs text-gray-400 pt-2">
                        {language === 'ar' ? 'التسليم المتوقع:' : 'Est. delivery:'} {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
