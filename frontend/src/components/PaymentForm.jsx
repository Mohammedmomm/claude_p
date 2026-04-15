import React, { useState, useRef } from 'react';
import { CreditCard, Lock, CheckCircle, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

/**
 * PaymentForm component
 * @param {number} total - Total amount to charge
 * @param {function} onSuccess - Callback on successful payment
 * @param {function} onCancel - Callback on cancel
 */
const PaymentForm = ({ total = 0, onSuccess, onCancel }) => {
  const { t, language } = useLanguage();

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const cvvRef = useRef(null);

  // Detect card type
  const getCardType = (num) => {
    const clean = num.replace(/\s/g, '');
    if (/^4/.test(clean)) return 'visa';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'mastercard';
    return 'unknown';
  };

  const cardType = getCardType(cardNumber);

  // Format card number: 1234 5678 9012 3456
  const formatCardNumber = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(.{4})/g, '$1 ').trim();
  };

  // Format expiry: MM/YY
  const formatExpiry = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 2) {
      return clean.slice(0, 2) + '/' + clean.slice(2);
    }
    return clean;
  };

  const validate = () => {
    const newErrors = {};
    const cleanCard = cardNumber.replace(/\s/g, '');

    if (cleanCard.length !== 16) {
      newErrors.cardNumber = language === 'ar' ? 'رقم البطاقة يجب أن يكون 16 رقماً' : 'Card number must be 16 digits';
    }
    if (!cardHolder.trim() || cardHolder.trim().length < 3) {
      newErrors.cardHolder = language === 'ar' ? 'أدخل اسم حامل البطاقة' : 'Enter cardholder name';
    }
    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiry = language === 'ar' ? 'تاريخ انتهاء غير صالح' : 'Invalid expiry date';
    } else {
      const [month, year] = expiry.split('/').map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = language === 'ar' ? 'البطاقة منتهية الصلاحية' : 'Card has expired';
      }
    }
    if (cvv.length < 3) {
      newErrors.cvv = language === 'ar' ? 'رمز CVV يجب أن يكون 3 أرقام على الأقل' : 'CVV must be at least 3 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setProcessing(false);
    setSuccess(true);

    toast.success(t('payment.payment_success'));

    setTimeout(() => {
      if (onSuccess) onSuccess();
    }, 1500);
  };

  // Masked card number for display
  const displayCardNumber = cardNumber || '•••• •••• •••• ••••';
  const maskedNumber = displayCardNumber.padEnd(19, '•');

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-bounce-slow">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t('payment.payment_success')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {language === 'ar' ? 'سيتم تحويلك قريباً...' : 'Redirecting shortly...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {t('payment.title')}
          </h2>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Card Preview */}
      <div className="perspective-1000 h-48 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div
          className="relative w-full h-full transition-all duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between text-white shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5986 50%, #1a2f4e 100%)',
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <div className="w-10 h-7 rounded bg-yellow-400/80 opacity-90" />
              </div>
              {cardType === 'visa' && (
                <span className="text-white font-bold text-xl italic tracking-wider">VISA</span>
              )}
              {cardType === 'mastercard' && (
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-red-500 opacity-90" />
                  <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-80 -ml-3" />
                </div>
              )}
              {cardType === 'unknown' && (
                <CreditCard className="w-8 h-8 text-white/60" />
              )}
            </div>

            <div>
              <p className="font-mono text-lg tracking-widest mb-3">
                {maskedNumber.slice(0, 19)}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-white/50 text-xs uppercase mb-0.5">
                    {language === 'ar' ? 'اسم الحامل' : 'Card Holder'}
                  </p>
                  <p className="font-medium text-sm uppercase tracking-wide truncate max-w-32">
                    {cardHolder || (language === 'ar' ? 'اسمك الكامل' : 'FULL NAME')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-xs uppercase mb-0.5">
                    {language === 'ar' ? 'صالح حتى' : 'Expires'}
                  </p>
                  <p className="font-medium text-sm">
                    {expiry || 'MM/YY'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col justify-center text-white shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5986 50%, #1a2f4e 100%)',
            }}
          >
            <div className="w-full h-10 bg-black/50 mb-6" />
            <div className="px-6 flex items-center justify-end gap-3">
              <div className="flex-1 h-8 bg-white/20 rounded" />
              <div className="bg-white text-gray-800 rounded px-3 py-1 font-mono font-bold text-sm min-w-12 text-center">
                {cvv || '•••'}
              </div>
            </div>
            <p className="text-white/40 text-xs text-center mt-4 px-6">
              {language === 'ar' ? 'انقر لعرض الواجهة الأمامية' : 'Click to flip back'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('payment.card_number')}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={`w-full px-4 py-3 rounded-xl border font-mono text-base
              bg-white dark:bg-gray-700 text-gray-800 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-red-500
              transition-colors
              ${errors.cardNumber ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
            `}
          />
          {errors.cardNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
          )}
        </div>

        {/* Card Holder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('payment.card_holder')}
          </label>
          <input
            type="text"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
            placeholder={language === 'ar' ? 'الاسم كما يظهر على البطاقة' : 'Name as on card'}
            className={`w-full px-4 py-3 rounded-xl border text-base uppercase
              bg-white dark:bg-gray-700 text-gray-800 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-red-500
              transition-colors
              ${errors.cardHolder ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
            `}
          />
          {errors.cardHolder && (
            <p className="text-red-500 text-xs mt-1">{errors.cardHolder}</p>
          )}
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('payment.expiry')}
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              className={`w-full px-4 py-3 rounded-xl border font-mono text-base
                bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-red-500
                transition-colors
                ${errors.expiry ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
              `}
            />
            {errors.expiry && (
              <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('payment.cvv')}
            </label>
            <input
              ref={cvvRef}
              type="text"
              inputMode="numeric"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onFocus={() => setIsFlipped(true)}
              onBlur={() => setIsFlipped(false)}
              placeholder="•••"
              maxLength={4}
              className={`w-full px-4 py-3 rounded-xl border font-mono text-base
                bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-red-500
                transition-colors
                ${errors.cvv ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'}
              `}
            />
            {errors.cvv && (
              <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">
            {t('cart.total')}
          </span>
          <span className="text-2xl font-bold text-red-600 dark:text-red-400">
            {t('common.currency_symbol')} {total.toFixed(2)}
          </span>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={processing}
          className={`w-full py-4 rounded-xl font-bold text-white text-lg
            flex items-center justify-center gap-2
            transition-all duration-200
            ${processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-95 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('payment.processing')}
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              {t('payment.pay_now')} — {t('common.currency_symbol')} {total.toFixed(2)}
            </>
          )}
        </button>

        {/* Security note */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          {language === 'ar' ? 'دفع آمن ومشفر بالكامل' : 'Fully secured & encrypted payment'}
        </p>
      </form>
    </div>
  );
};

export default PaymentForm;
