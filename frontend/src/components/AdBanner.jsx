import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * AdBanner placeholder component
 * @param {'horizontal'|'vertical'|'square'} size - Banner size/orientation
 * @param {string} className - Additional CSS classes
 */
const AdBanner = ({ size = 'horizontal', className = '' }) => {
  const { language } = useLanguage();

  const sizeClasses = {
    horizontal: 'w-full h-24 md:h-28',
    vertical: 'w-40 h-80',
    square: 'w-64 h-64',
  };

  const label = language === 'ar' ? 'إعلانك هنا' : 'Your Ad Here';
  const sublabel = language === 'ar' ? 'للإعلان تواصل معنا' : 'Contact us to advertise';

  return (
    <div
      className={`
        ${sizeClasses[size] || sizeClasses.horizontal}
        ${className}
        relative flex flex-col items-center justify-center
        border-2 border-dashed border-gray-300 dark:border-gray-600
        bg-gray-50 dark:bg-gray-800/50
        rounded-xl overflow-hidden
        group transition-colors hover:border-red-300 dark:hover:border-red-700
      `}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #9ca3af 0px,
            #9ca3af 1px,
            transparent 1px,
            transparent 10px
          )`,
        }}
      />

      <div className="relative flex flex-col items-center gap-1 text-center px-4">
        {/* Ad icon */}
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-1">
          <span className="text-gray-400 dark:text-gray-500 text-sm font-bold">AD</span>
        </div>

        <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
          {label}
        </p>
        <p className="text-gray-300 dark:text-gray-600 text-xs">
          {sublabel}
        </p>
      </div>
    </div>
  );
};

export default AdBanner;
