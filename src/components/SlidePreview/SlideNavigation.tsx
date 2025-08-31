'use client';

import React from 'react';

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onSlideSelect: (index: number) => void;
}

const SlideNavigation: React.FC<SlideNavigationProps> = ({
  currentSlide,
  totalSlides,
  onSlideSelect
}) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSlides }, (_, index) => (
        <button
          key={index}
          onClick={() => onSlideSelect(index)}
          className={`w-3 h-3 rounded-full transition-colors cursor-pointer ${
            index === currentSlide
              ? 'bg-white'
              : 'bg-white bg-opacity-50 hover:bg-opacity-75'
          }`}
          title={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default SlideNavigation;