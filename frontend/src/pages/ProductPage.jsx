import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Users, ArrowLeft, ArrowRight, Minus, Plus, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import CountdownTimer from '../components/CountdownTimer';
import StarRating from '../components/StarRating';
import WholesaleSection from '../components/WholesaleSection';
import ProductCard from '../components/ProductCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../utils/api';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language, dir } = useLanguage();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [product, setProduct]           = useState(null);
  const [reviews, setReviews]           = useState([]);
  const [related, setRelated]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [quantity, setQuantity]         = useState(1);
  const [wishlisted, setWishlisted]     = useState(false);
  const [wholesaleExpired, setWholesaleExpired] = useState(false);
  const [myRating, setMyRating]         = useState(5);
  const [myComment, setMyComment]       = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [wishlistIds, setWishlistIds]   = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: pd }, { data: rv }, { data: wl }] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/${id}`),
          api.get('/wishlist'),
        ]);
        setProduct(pd.product);
        setReviews(rv.reviews || []);
        setWishlistIds(wl.ids || []);
        setWishlisted((wl.ids || []).includes(id));
        // related
        if (pd.product?.category) {
          const { data: rel } = await api.get('/products', { params: { category: pd.product.category, limit: 4 } });
          setRelated((rel.products || []).filter(p => p.id !== id).slice(0, 4));
        }
      } catch { toast.error(t('common.error')); }
      finally { setLoading(false); }
    };
    load();
  }, [id, t]);

  const isWholesaleActive = product?.isWholesale && product?.wholesaleDeadline && !wholesaleExpired;

  const handleAddToCart = (isWholesale = false) => {
    addToCart(product, quantity, isWholesale && isWholesaleActive);
    toast.success(language === 'ar' ? 'تمت الإضافة للسلة' : 'Added to cart');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, false);
    navigate('/cart');
  };

  const handleToggleWishlist = async () => {
    try {
      const { data } = await api.post(`/wishlist/${id}`);
      setWishlisted(data.added);
      setWishlistIds(data.ids || []);
      toast.success(data.added
        ? (language === 'ar' ? 'أضيف للمفضلة' : 'Added to wishlist')
        : (language === 'ar' ? 'أزيل من المفضلة' : 'Removed'));
    } catch {}
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/reviews', { productId: id, rating: myRating, comment: myComment });
      setReviews(prev => [data.review, ...prev]);
      setMyComment('');
      toast.success(language === 'ar' ? 'تم إضافة تقييمك' : 'Review submitted');
    } catch (err) {
      toast.error(err.response?.data?.error || t('common.error'));
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-gray-950' : 'bg-gray-50'}`}><LoadingSpinner size="lg" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center"><p>{t('common.not_found')}</p></div>;

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const desc = language === 'ar' ? product.descAr  : product.descEn;
  const savings = isWholesaleActive ? Math.round(((product.price - product.wholesalePrice) / product.price) * 100) : 0;
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/home" className="hover:text-red-500 transition-colors">{t('nav.home')}</Link>
          <span>/</span>
          <span className="text-gray-500">{product.category}</span>
          <span>/</span>
          <span className={`line-clamp-1 ${dark ? 'text-white' : 'text-gray-700'}`}>{name}</span>
        </nav>

        {/* Product detail */}
        <div className={`rounded-2xl p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
          {/* Image */}
          <div className="rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800">
            <img src={product.image} alt={name} className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <span className="text-sm text-blue-500 font-medium">{product.category}</span>
            <h1 className="text-2xl font-bold leading-tight">{name}</h1>

            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} size="md" />
              <span className="text-gray-400 text-sm">({product.reviewCount} {t('product.reviews')})</span>
            </div>

            {/* Price */}
            <div className={`rounded-xl p-4 ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              {isWholesaleActive ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-red-500">
                      {t('common.currency_symbol')} {product.wholesalePrice}
                    </span>
                    <span className="text-gray-400 line-through text-lg">
                      {t('common.currency_symbol')} {product.price}
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-bold">
                      -{savings}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{t('product.wholesale_price')}</p>
                </div>
              ) : (
                <span className="text-3xl font-bold">
                  {t('common.currency_symbol')} {product.price}
                </span>
              )}
            </div>

            {/* Stock */}
            <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {product.stock > 0 ? `✓ ${t('product.in_stock')}` : t('product.out_of_stock')}
            </p>

            {/* Wholesale section */}
            {isWholesaleActive && <WholesaleSection product={product} onExpire={() => setWholesaleExpired(true)} onJoin={() => handleAddToCart(true)} />}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">{t('cart.quantity')}</span>
              <div className={`flex items-center rounded-xl border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:text-red-500 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:text-red-500 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-all active:scale-95 disabled:opacity-50">
                <Zap className="w-4 h-4" />
                {t('product.buy_now')}
              </button>
              <button
                onClick={() => handleAddToCart(isWholesaleActive)}
                disabled={product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 disabled:opacity-50`}>
                <ShoppingCart className="w-4 h-4" />
                {t('product.add_to_cart')}
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all active:scale-95
                  ${wishlisted ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500'}`}>
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Description */}
            <div className={`pt-3 border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className={`rounded-2xl p-6 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
          <h2 className="text-lg font-bold mb-4">{t('product.reviews')}</h2>

          {/* Add review form */}
          <form onSubmit={handleSubmitReview} className={`mb-6 p-4 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className="text-sm font-medium mb-3">{t('product.add_review')}</p>
            <div className="mb-3">
              <StarRating rating={myRating} interactive onRate={setMyRating} size="lg" />
            </div>
            <textarea
              value={myComment}
              onChange={e => setMyComment(e.target.value)}
              rows={3}
              placeholder={language === 'ar' ? 'اكتب تقييمك...' : 'Write your review...'}
              className={`w-full p-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400
                ${dark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200'}`}
            />
            <button type="submit" disabled={submitting}
              className="mt-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {submitting ? t('common.loading') : t('contact.send')}
            </button>
          </form>

          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">{t('common.no_results')}</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className={`p-4 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {r.userName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{r.userName}</p>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    <span className="text-xs text-gray-400 ms-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-500">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related products */}
        {related.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4">{t('product.similar_products')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} onAddToCart={(prod, q, w) => { addToCart(prod, q, w); toast.success(language === 'ar' ? 'تمت الإضافة' : 'Added'); }} onToggleWishlist={handleToggleWishlist} isWishlisted={wishlistIds.includes(p.id)} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
