import React, { useState } from 'react';

/**
 * StarRating component
 * @param {number} rating - Current rating value (0-5)
 * @param {number} maxRating - Maximum rating (default 5)
 * @param {boolean} interactive - Whether stars are clickable
 * @param {function} onRate - Callback when a star is clicked: (rating) => void
 * @param {'sm'|'md'|'lg'} size - Size variant
 */
const StarRating = ({ rating = 0, maxRating = 5, interactive = false, onRate, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const starSize = sizeClasses[size] || sizeClasses.md;
  const textSize = textSizes[size] || textSizes.md;

  const getStarFill = (index) => {
    const activeRating = hoverRating || rating;
    if (index <= Math.floor(activeRating)) return 'full';
    if (index === Math.ceil(activeRating) && activeRating % 1 >= 0.5) return 'half';
    return 'empty';
  };

  const handleClick = (index) => {
    if (interactive && onRate) {
      onRate(index);
    }
  };

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((index) => {
          const fill = getStarFill(index);
          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(index)}
              onMouseEnter={() => interactive && setHoverRating(index)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`relative ${starSize} flex-shrink-0 ${
                interactive
                  ? 'cursor-pointer transition-transform hover:scale-110'
                  : 'cursor-default'
              }`}
              aria-label={`${index} star${index !== 1 ? 's' : ''}`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`w-full h-full`}
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background empty star */}
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={fill === 'empty' ? 'none' : '#eab308'}
                  stroke="#eab308"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Half star overlay */}
                {fill === 'half' && (
                  <clipPath id={`half-${index}`}>
                    <rect x="0" y="0" width="12" height="24" />
                  </clipPath>
                )}
                {fill === 'half' && (
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="#eab308"
                    clipPath={`url(#half-${index})`}
                  />
                )}
              </svg>
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <span className={`${textSize} font-medium text-gray-600 dark:text-gray-300 ml-1`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
