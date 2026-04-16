import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../utils/api';

export default function Wishlist() {
  const { t, language, dir } = useLanguage();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [items, setItems]     = useState([]);
  const [ids, setIds]         = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist')
      .then(({ data }) => { setItems(data.items || []); setIds(data.ids || []); })
      .catch(() => toast.error(t('common.error')))
      .finally(() => setLoading(false));
  }, [t]);

  const handleToggle = async (productId) => {
    try {
      const { data } = await api.post(`/wishlist/${productId}`);
      setIds(data.ids || []);
      setItems(prev => prev.filter(p => p.id !== productId));
      toast.success(language === 'ar' ? 'أزيل من المفضلة' : 'Removed from wishlist');
    } catch {}
  };

  const handleAddToCart = (product, qty, isWholesale) => {
    addToCart(product, qty, isWholesale);
    toast.success(language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart');
  };

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" />
          {t('wishlist.title')}
        </h1>

        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <Heart className="w-20 h-20 text-gray-200" />
            <p className="text-xl font-semibold text-gray-400">{t('wishlist.empty')}</p>
            <Link to="/home" className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors">
              {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggle}
                isWishlisted={ids.includes(p.id)}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
