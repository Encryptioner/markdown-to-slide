'use client';

import React from 'react';
import { trackEvent } from '@/lib/googleAnalytics';

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
  const handleDotClick = (index: number) => {
    onSlideSelect(index);
    trackEvent({ name: "slide_navigated", params: { method: "dot", slide_index: index } });
  };

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSlides }, (_, index) => (
        <button
          key={index}
          onClick={() => handleDotClick(index)}
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