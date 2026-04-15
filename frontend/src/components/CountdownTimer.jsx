import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * CountdownTimer component
 * @param {string|Date} deadline - Target datetime
 * @param {function} onExpire - Called when timer reaches zero
 * @param {'sm'|'md'|'lg'} size - Display size
 */
const CountdownTimer = ({ deadline, onExpire, size = 'md' }) => {
  const { language } = useLanguage();

  const calculateTimeLeft = useCallback(() => {
    const target = new Date(deadline).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  }, [deadline]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
  const [expired, setExpired] = useState(() => !calculateTimeLeft());

  useEffect(() => {
    if (expired) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (!remaining) {
        setExpired(true);
        setTimeLeft(null);
        clearInterval(interval);
        if (onExpire) onExpire();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft, expired, onExpire]);

  const sizeConfig = {
    sm: {
      box: 'w-10 h-10 text-sm',
      label: 'text-xs',
      gap: 'gap-1',
      separator: 'text-lg',
    },
    md: {
      box: 'w-14 h-14 text-xl',
      label: 'text-xs',
      gap: 'gap-2',
      separator: 'text-2xl',
    },
    lg: {
      box: 'w-20 h-20 text-3xl',
      label: 'text-sm',
      gap: 'gap-3',
      separator: 'text-3xl',
    },
  };

  const cfg = sizeConfig[size] || sizeConfig.md;

  if (expired) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm font-medium">
        <span className="animate-pulse">●</span>
        <span>{language === 'ar' ? 'انتهى العرض' : 'Offer Ended'}</span>
      </div>
    );
  }

  const pad = (n) => String(n).padStart(2, '0');

  const units = [
    { value: timeLeft?.hours ?? 0, label: language === 'ar' ? 'س' : 'H' },
    { value: timeLeft?.minutes ?? 0, label: language === 'ar' ? 'د' : 'M' },
    { value: timeLeft?.seconds ?? 0, label: language === 'ar' ? 'ث' : 'S' },
  ];

  return (
    <div className={`inline-flex items-center ${cfg.gap}`}>
      {units.map((unit, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div
              className={`${cfg.box} flex items-center justify-center rounded-lg font-bold text-white`}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                boxShadow: '0 0 12px rgba(239,68,68,0.4)',
              }}
            >
              {pad(unit.value)}
            </div>
            <span className={`${cfg.label} text-gray-500 dark:text-gray-400 mt-0.5`}>
              {unit.label}
            </span>
          </div>
          {i < 2 && (
            <span className={`${cfg.separator} font-bold text-red-500 dark:text-red-400 -mt-4 select-none`}>
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CountdownTimer;
