import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import AdBanner from '../components/AdBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import CountdownTimer from '../components/CountdownTimer';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../utils/api';

const CATEGORIES_EN = ['All', 'Electronics', 'Clothing', 'Food', 'Home', 'Sports', 'Books', 'Beauty'];
const CATEGORIES_AR = ['الكل', 'إلكترونيات', 'ملابس', 'طعام', 'منزل', 'رياضة', 'كتب', 'جمال'];

export default function Home() {
  const { t, language, dir } = useLanguage();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Read initial filters from URL params
  const urlParams = new URLSearchParams(location.search);

  const [products, setProducts]         = useState([]);
  const [wholesale, setWholesale]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [wishlistIds, setWishlistIds]   = useState([]);
  const [search, setSearch]             = useState(urlParams.get('search') || '');
  const [category, setCategory]         = useState(urlParams.get('category') || 'All');
  const [sellerId, setSellerId]         = useState(urlParams.get('sellerId') || '');
  const [sort, setSort]                 = useState('newest');
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);

  const dark = theme === 'dark';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (category !== 'All') params.category = category;
      if (search.trim()) params.search = search.trim();
      if (sellerId) params.sellerId = sellerId;
      const { data } = await api.get('/products', { params });
      let items = data.products || [];
      if (sort === 'price_low')  items = [...items].sort((a, b) => a.price - b.price);
      if (sort === 'price_high') items = [...items].sort((a, b) => b.price - a.price);
      if (sort === 'rating')     items = [...items].sort((a, b) => b.rating - a.rating);
      setProducts(items);
      setTotalPages(data.pages || 1);
    } catch { toast.error(t('common.error')); }
    finally { setLoading(false); }
  }, [page, category, search, sellerId, sort, t]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    api.get('/products', { params: { featured: true, limit: 6 } })
      .then(({ data }) => setWholesale((data.products || []).filter(p => p.isWholesale)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/wishlist').then(({ data }) => setWishlistIds(data.ids || [])).catch(() => {});
  }, []);

  const handleAddToCart = (product, qty, isWholesale) => {
    addToCart(product, qty, isWholesale);
    toast.success(language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart');
  };

  const handleToggleWishlist = async (productId) => {
    try {
      const { data } = await api.post(`/wishlist/${productId}`);
      setWishlistIds(data.ids || []);
      toast.success(data.added
        ? (language === 'ar' ? 'أضيف للمفضلة' : 'Added to wishlist')
        : (language === 'ar' ? 'أزيل من المفضلة' : 'Removed from wishlist'));
    } catch { toast.error(t('common.error')); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchProducts(); };

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-8">

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('common.search_placeholder')}
              className={`w-full ps-10 pe-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-400
                ${dark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200'}`}
            />
          </div>
          <button type="submit" className="px-5 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors">
            {t('nav.search')}
          </button>
        </form>

        {/* Wholesale Deals */}
        {wholesale.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-red-500 rounded-full inline-block" />
                {t('home.featured_deals')}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wholesale.slice(0, 3).map(p => (
                <div key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className={`rounded-2xl overflow-hidden cursor-pointer border transition-transform hover:-translate-y-1
                    ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <div className="h-36 relative overflow-hidden">
                    <img src={p.image} alt={language === 'ar' ? p.nameAr : p.nameEn}
                      className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 start-3 end-3">
                      <p className="text-white font-bold text-sm line-clamp-1">
                        {language === 'ar' ? p.nameAr : p.nameEn}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <span className="text-red-500 font-bold">
                        {t('common.currency_symbol')} {p.wholesalePrice}
                      </span>
                      <span className="text-gray-400 line-through text-xs ms-2">
                        {t('common.currency_symbol')} {p.price}
                      </span>
                    </div>
                    <CountdownTimer deadline={p.wholesaleDeadline} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <AdBanner size="horizontal" />

        {/* Category + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
            {CATEGORIES_EN.map((cat, i) => {
              const label = language === 'ar' ? CATEGORIES_AR[i] : cat;
              const active = category === cat;
              return (
                <button key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all
                    ${active
                      ? 'bg-red-500 text-white shadow'
                      : dark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                  {label}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className={`appearance-none pe-8 ps-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-red-400
                ${dark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'}`}>
              <option value="newest">{t('home.newest')}</option>
              <option value="price_low">{t('home.price_low')}</option>
              <option value="price_high">{t('home.price_high')}</option>
              <option value="rating">{t('home.rating')}</option>
            </select>
            <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium">{t('common.no_results')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p, i) => (
                <React.Fragment key={p.id}>
                  <ProductCard
                    product={p}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlistIds.includes(p.id)}
                  />
                  {(i + 1) % 12 === 0 && <div className="col-span-2 sm:col-span-3 lg:col-span-4"><AdBanner size="horizontal" /></div>}
                </React.Fragment>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                      ${n === page
                        ? 'bg-red-500 text-white'
                        : dark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 border'}`}>
                    {n}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
