import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Users, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import StarRating from './StarRating';
import CountdownTimer from './CountdownTimer';

/**
 * ProductCard component
 * @param {object} product - Product data object
 * @param {function} onAddToCart - Callback to add product to cart
 * @param {function} onToggleWishlist - Callback to toggle wishlist
 * @param {boolean} isWishlisted - Whether product is in wishlist
 */
const ProductCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted = false }) => {
  const { t, language } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const [wholesaleExpired, setWholesaleExpired] = useState(false);

  if (!product) return null;

  const {
    _id,
    nameAr,
    nameEn,
    image,
    images,
    price = 0,
    wholesalePrice,
    category,
    rating = 0,
    reviewCount = 0,
    wholesaleDeadline,
    wholesaleCurrentParticipants = 0,
    wholesaleMinParticipants = 10,
    stock = 0,
  } = product;

  const isWholesaleActive = wholesalePrice && wholesaleDeadline && !wholesaleExpired;
  const displayName = language === 'ar' ? (nameAr || nameEn) : (nameEn || nameAr);
  const productImage = image || (images && images[0]) || null;
  const inStock = stock > 0;
  const savings = isWholesaleActive ? Math.round(((price - wholesalePrice) / price) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product, 1, isWholesaleActive);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) onToggleWishlist(product._id);
  };

  return (
    <Link
      to={`/product/${_id}`}
      className="block group"
    >
      <div className="card-hover bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-200 h-full flex flex-col">
        {/* Image container */}
        <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-700 aspect-square">
          {!imgError && productImage ? (
            <img
              src={productImage}
              alt={displayName}
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
              <div className="text-4xl text-gray-300 dark:text-gray-500">📦</div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 start-2 flex flex-col gap-1">
            {isWholesaleActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-red-500 shadow">
                <Users className="w-3 h-3" />
                {language === 'ar' ? 'جملة' : 'Wholesale'}
              </span>
            )}
            {savings > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white bg-red-500 shadow">
                -{savings}%
              </span>
            )}
            {!inStock && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gray-500 shadow">
                {t('product.out_of_stock')}
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 end-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200
              ${isWishlisted
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white dark:bg-gray-700 text-gray-400 hover:text-red-500 hover:scale-110'
              }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1 gap-2">
          {/* Category */}
          {category && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">
              {category}
            </span>
          )}

          {/* Product name */}
          <h3 className="font-semibold text-gray-800 dark:text-white text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
            {displayName || (language === 'ar' ? 'منتج' : 'Product')}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <StarRating rating={rating} size="sm" />
            {reviewCount > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ({reviewCount})
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-end gap-2 flex-wrap">
            {isWholesaleActive ? (
              <>
                <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                  {t('common.currency_symbol')} {wholesalePrice?.toFixed(2)}
                </span>
                <span className="text-gray-400 line-through text-sm">
                  {t('common.currency_symbol')} {price?.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-gray-800 dark:text-white font-bold text-lg">
                {t('common.currency_symbol')} {price?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Wholesale participants */}
          {isWholesaleActive && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Users className="w-3 h-3" />
              <span>
                {wholesaleCurrentParticipants}/{wholesaleMinParticipants} {t('product.participants')}
              </span>
            </div>
          )}

          {/* Countdown timer */}
          {isWholesaleActive && wholesaleDeadline && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-red-500 flex-shrink-0" />
              <CountdownTimer
                deadline={wholesaleDeadline}
                onExpire={() => setWholesaleExpired(true)}
                size="sm"
              />
            </div>
          )}

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`mt-auto w-full py-2 rounded-xl font-semibold text-sm
              flex items-center justify-center gap-2
              transition-all duration-200 active:scale-95
              ${inStock
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {inStock ? t('product.add_to_cart') : t('product.out_of_stock')}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
