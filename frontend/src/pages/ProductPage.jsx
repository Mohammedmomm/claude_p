import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart, Heart, Star, Users, ArrowLeft, ArrowRight,
  Minus, Plus, Zap, Phone, PhoneCall, MessageCircle, Eye,
  Share2, Flag, Shield, ChevronRight, ChevronLeft, Store,
} from 'lucide-react';
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
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language, dir } = useLanguage();
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const { user } = useAuth();
  const dark = theme === 'dark';
  const ar = language === 'ar';

  const [product, setProduct]           = useState(null);
  const [reviews, setReviews]           = useState([]);
  const [related, setRelated]           = useState([]);
  const [sellerListings, setSellerListings] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [quantity, setQuantity]         = useState(1);
  const [wishlisted, setWishlisted]     = useState(false);
  const [wholesaleExpired, setWholesaleExpired] = useState(false);
  const [myRating, setMyRating]         = useState(5);
  const [myComment, setMyComment]       = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [wishlistIds, setWishlistIds]   = useState([]);

  // Phone reveal state
  const [revealedPhone, setRevealedPhone] = useState(null);
  const [revealLoading, setRevealLoading] = useState(false);

  // Image gallery (multiple images simulated with same image)
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setRevealedPhone(null);
      setActiveImg(0);
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

        if (pd.product?.category) {
          const { data: rel } = await api.get('/products', { params: { category: pd.product.category, limit: 5 } });
          setRelated((rel.products || []).filter(p => p.id !== id).slice(0, 4));
        }
        if (pd.product?.sellerId) {
          const { data: sl } = await api.get('/products', { params: { sellerId: pd.product.sellerId, limit: 4 } });
          setSellerListings((sl.products || []).filter(p => p.id !== id).slice(0, 3));
        }
      } catch { toast.error(t('common.error')); }
      finally { setLoading(false); }
    };
    load();
  }, [id, t]);

  const isWholesaleActive = product?.isWholesale && product?.wholesaleDeadline && !wholesaleExpired;
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const handleAddToCart = (isWholesale = false) => {
    addToCart(product, quantity, isWholesale && isWholesaleActive);
    toast.success(ar ? 'تمت الإضافة للسلة' : 'Added to cart');
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
        ? (ar ? 'أضيف للمفضلة' : 'Added to wishlist')
        : (ar ? 'أزيل من المفضلة' : 'Removed'));
    } catch {}
  };

  const handleRevealPhone = async () => {
    setRevealLoading(true);
    try {
      const { data } = await api.post(`/products/${id}/reveal-phone`);
      setRevealedPhone(data.phone);
      toast.success(ar ? 'تم الكشف عن رقم الهاتف' : 'Phone number revealed');
    } catch {
      toast.error(t('common.error'));
    } finally { setRevealLoading(false); }
  };

  const handleChatWithSeller = () => {
    if (!product?.sellerId) return;
    navigate(`/chat/${product.sellerId}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.nameEn, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success(ar ? 'تم نسخ الرابط' : 'Link copied');
      });
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/reviews', { productId: id, rating: myRating, comment: myComment });
      setReviews(prev => [data.review, ...prev]);
      setMyComment('');
      toast.success(ar ? 'تم إضافة تقييمك' : 'Review submitted');
    } catch (err) {
      toast.error(err.response?.data?.error || t('common.error'));
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <LoadingSpinner size="lg" />
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <p>{t('common.not_found')}</p>
    </div>
  );

  const name = ar ? product.nameAr : product.nameEn;
  const desc = ar ? product.descAr  : product.descEn;
  const savings = isWholesaleActive ? Math.round(((product.price - product.wholesalePrice) / product.price) * 100) : 0;
  const seller = product.seller;
  const isMySelfListing = user?.id === product.sellerId;

  // Simulated gallery: same image × 3 thumbnails
  const galleryImgs = [product.image, product.image, product.image];

  return (
    <div dir={dir} className={`min-h-screen flex flex-col ${dark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
          <Link to="/home" className="hover:text-red-500 transition-colors">{t('nav.home')}</Link>
          <span>/</span>
          <span className="hover:text-red-500 cursor-pointer transition-colors" onClick={() => navigate(`/home?category=${product.category}`)}>
            {product.category}
          </span>
          <span>/</span>
          <span className={`line-clamp-1 ${dark ? 'text-white' : 'text-gray-700'}`}>{name}</span>
        </nav>

        {/* Main product section */}
        <div className={`rounded-2xl p-5 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>

          {/* Left: Image gallery */}
          <div className="flex flex-col gap-3">
            <div className="rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800 relative group">
              <img src={galleryImgs[activeImg]} alt={name} className="w-full h-full object-cover" />
              {/* Share button overlay */}
              <button onClick={handleShare}
                className="absolute top-3 end-3 p-2 rounded-xl bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-300 shadow hover:shadow-md transition-all opacity-0 group-hover:opacity-100">
                <Share2 className="w-4 h-4" />
              </button>
              {product.featured && (
                <div className="absolute top-3 start-3 px-2 py-1 bg-amber-400 text-white text-xs font-bold rounded-lg shadow">
                  {ar ? 'مميز' : 'Featured'}
                </div>
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2">
              {galleryImgs.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0
                    ${activeImg === i ? 'border-red-500' : dark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="inline-block text-xs font-medium text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full mb-2">
                  {product.category}
                </span>
                <h1 className="text-2xl font-bold leading-tight">{name}</h1>
              </div>
              <button onClick={handleToggleWishlist}
                className={`p-2 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0
                  ${wishlisted ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-red-500 hover:text-red-500'}`}>
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={product.rating} size="md" />
              <span className="text-gray-400 text-sm">({product.reviewCount} {t('product.reviews')})</span>
            </div>

            {/* Price */}
            <div className={`rounded-xl p-4 ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              {isWholesaleActive ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3 flex-wrap">
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
              {product.stock > 0 ? `✓ ${t('product.in_stock')} (${product.stock})` : t('product.out_of_stock')}
            </p>

            {/* Wholesale section */}
            {isWholesaleActive && (
              <WholesaleSection product={product} onExpire={() => setWholesaleExpired(true)} onJoin={() => handleAddToCart(true)} />
            )}

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
            {!isMySelfListing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button onClick={handleBuyNow} disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-all active:scale-95 disabled:opacity-50 text-sm">
                    <Zap className="w-4 h-4" />
                    {t('product.buy_now')}
                  </button>
                  <button onClick={() => handleAddToCart(isWholesaleActive)} disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 disabled:opacity-50 text-sm">
                    <ShoppingCart className="w-4 h-4" />
                    {t('product.add_to_cart')}
                  </button>
                </div>

                {/* Contact seller row */}
                <div className="flex gap-2">
                  {revealedPhone ? (
                    <>
                      <a href={`tel:${revealedPhone}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
                        <PhoneCall className="w-4 h-4" />
                        {revealedPhone}
                      </a>
                    </>
                  ) : (
                    <button onClick={handleRevealPhone} disabled={revealLoading}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors border-2 disabled:opacity-50
                        ${dark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}>
                      {revealLoading
                        ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        : <Eye className="w-4 h-4" />
                      }
                      {ar ? 'إظهار رقم الهاتف' : 'Show Phone Number'}
                    </button>
                  )}

                  <button onClick={handleChatWithSeller}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors border-2
                      ${dark ? 'border-gray-700 hover:bg-gray-800 text-gray-300' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}>
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    {ar ? 'راسل البائع' : 'Message Seller'}
                  </button>
                </div>
              </div>
            ) : (
              <div className={`p-4 rounded-xl text-sm text-center ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {ar ? 'هذا إعلانك' : 'This is your listing'}
                <Link to="/sell" className="block mt-2 text-red-500 hover:underline font-medium">
                  {ar ? 'تعديل الإعلان' : 'Edit Listing'}
                </Link>
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map(tag => (
                  <span key={tag} className={`text-xs px-2.5 py-1 rounded-full ${dark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className={`pt-3 border-t ${dark ? 'border-gray-800' : 'border-gray-100'}`}>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>

            {/* Safety banner */}
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${dark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
              <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
              {ar ? 'التواصل داخل المنصة يضمن حماية حقوقك' : 'Communicating within the platform protects your rights'}
            </div>
          </div>
        </div>

        {/* Seller profile card */}
        {seller && (
          <div className={`rounded-2xl p-5 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-red-500" />
              {ar ? 'عن البائع' : 'About the Seller'}
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-red-400 flex items-center justify-center text-white font-black text-xl flex-shrink-0">
                {seller.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg">{seller.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                    {ar ? 'بائع موثق' : 'Verified Seller'}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                    4.8
                  </span>
                  <span className="text-xs text-gray-400">
                    ({sellerListings.length + 1} {ar ? 'إعلان' : 'listings'})
                  </span>
                </div>
              </div>
              {!isMySelfListing && (
                <div className="flex gap-2">
                  {revealedPhone && (
                    <a href={`tel:${revealedPhone}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors">
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={handleChatWithSeller}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {ar ? 'تواصل' : 'Contact'}
                  </button>
                </div>
              )}
            </div>

            {/* Seller's other listings */}
            {sellerListings.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-500">
                    {ar ? 'إعلانات أخرى لهذا البائع' : 'Other listings from this seller'}
                  </p>
                  <button onClick={() => navigate(`/home?sellerId=${product.sellerId}`)}
                    className="text-xs text-red-500 hover:underline font-medium">
                    {t('common.view_all')}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {sellerListings.map(p => {
                    const pname = ar ? p.nameAr : p.nameEn;
                    return (
                      <Link key={p.id} to={`/product/${p.id}`}
                        className={`rounded-xl overflow-hidden border transition-shadow hover:shadow-md ${dark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                          <img src={p.image} alt={pname} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium line-clamp-1">{pname}</p>
                          <p className="text-xs text-red-500 font-bold mt-0.5">{t('common.currency_symbol')} {p.price}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        <section className={`rounded-2xl p-5 ${dark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            {t('product.reviews')}
            <span className="text-sm font-normal text-gray-400">({reviews.length})</span>
          </h2>

          {/* Add review */}
          <form onSubmit={handleSubmitReview} className={`mb-6 p-4 rounded-xl ${dark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className="text-sm font-medium mb-3">{t('product.add_review')}</p>
            <div className="mb-3">
              <StarRating rating={myRating} interactive onRate={setMyRating} size="lg" />
            </div>
            <textarea
              value={myComment}
              onChange={e => setMyComment(e.target.value)}
              rows={3}
              placeholder={ar ? 'اكتب تقييمك...' : 'Write your review...'}
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
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={(prod, q, w) => { addToCart(prod, q, w); toast.success(ar ? 'تمت الإضافة' : 'Added'); }}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlistIds.includes(p.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Report link */}
        <div className="text-center pb-4">
          <button className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors">
            <Flag className="w-3.5 h-3.5" />
            {ar ? 'الإبلاغ عن هذا الإعلان' : 'Report this listing'}
          </button>
        </div>

      </main>
      <Footer />
    </div>
  );
}
