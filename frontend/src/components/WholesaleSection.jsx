import React from 'react';
import { Users, TrendingDown, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import CountdownTimer from './CountdownTimer';
import toast from 'react-hot-toast';

/**
 * WholesaleSection component
 * @param {object} product - Product object with wholesale info
 */
const WholesaleSection = ({ product }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();

  if (!product) return null;

  const {
    wholesalePrice,
    price,
    wholesaleDeadline,
    wholesaleMinParticipants = 10,
    wholesaleCurrentParticipants = 0,
  } = product;

  const savings = price && wholesalePrice ? price - wholesalePrice : 0;
  const savingsPercent = price ? Math.round((savings / price) * 100) : 0;
  const progress = Math.min(
    (wholesaleCurrentParticipants / wholesaleMinParticipants) * 100,
    100
  );

  const handleJoin = () => {
    addToCart(product, 1, true);
    toast.success(
      language === 'ar'
        ? 'تمت إضافتك إلى الشراء الجماعي!'
        : 'You joined the group buy!'
    );
  };

  const handleExpire = () => {
    // Parent should handle state update; this is a visual cue
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg">
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          <h3 className="text-lg font-bold">
            {language === 'ar' ? 'صفقة الشراء الجماعي' : 'Group Buy Deal'}
          </h3>
        </div>
        <p className="text-blue-100 text-sm">
          {language === 'ar'
            ? 'انضم للمجموعة واحصل على سعر الجملة'
            : 'Join the group and get wholesale pricing'}
        </p>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 p-5 space-y-5">
        {/* Price comparison */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              {t('product.regular_price')}
            </p>
            <p className="text-gray-400 dark:text-gray-500 line-through text-base">
              {t('common.currency_symbol')} {price?.toFixed(2)}
            </p>
          </div>

          <div className="text-center">
            {savingsPercent > 0 && (
              <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">
                <TrendingDown className="w-3 h-3" />
                {language === 'ar' ? `وفر ${savingsPercent}%` : `Save ${savingsPercent}%`}
              </span>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              {t('product.wholesale_price')}
            </p>
            <p className="text-red-600 dark:text-red-400 font-bold text-2xl">
              {t('common.currency_symbol')} {wholesalePrice?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Participants progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <Users className="w-4 h-4" />
              <span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {wholesaleCurrentParticipants}
                </span>
                <span className="text-gray-400">
                  {' '}/{' '}{wholesaleMinParticipants}
                </span>{' '}
                {t('product.participants')}
              </span>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ef4444)',
              }}
            />
          </div>
        </div>

        {/* Countdown timer */}
        {wholesaleDeadline && (
          <div className="flex flex-col items-center gap-2 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('product.time_left')}
            </p>
            <CountdownTimer
              deadline={wholesaleDeadline}
              onExpire={handleExpire}
              size="md"
            />
          </div>
        )}

        {/* Join button */}
        <button
          onClick={handleJoin}
          className="w-full py-3 px-6 rounded-xl font-bold text-white text-base
            bg-gradient-to-r from-blue-600 to-red-500
            hover:from-blue-700 hover:to-red-600
            active:scale-95
            transition-all duration-200
            shadow-md hover:shadow-lg
            flex items-center justify-center gap-2"
        >
          <Users className="w-5 h-5" />
          {language === 'ar' ? 'انضم الآن' : 'Join Now'}
        </button>
      </div>
    </div>
  );
};

export default WholesaleSection;
