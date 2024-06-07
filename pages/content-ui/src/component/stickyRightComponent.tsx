import { StickyRightComponentProps } from 'sticky-right-component-props';
import React, { useEffect, useState } from 'react';
import CustomStack from '@src/component/customStack';

const StickyRightComponent: React.FC<StickyRightComponentProps> = ({ 
  stacksProps,
  verticalPadding,
  horizontalPadding,
  borderRadius,
  borderColor,
  borderWidth,
  triggerPosition,
  disappearPosition, 
  height
  }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
   
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition >= triggerPosition && scrollPosition < disappearPosition) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed top-1/4 w-[626px] h-[${height}px] bg-white shadow-md transition-opacity duration-300 gap-4.5
      ${isVisible ? 'translate-x-0' : 'opacity-0 pointer-events-none'}
      ${verticalPadding} ${horizontalPadding} ${borderWidth} ${borderRadius} ${borderColor}`
      }
    >      
      {
        stacksProps.map((stackProps, index) => (
          <CustomStack key={index} 
          textProps={stackProps.textProps} 
          gap={stackProps.gap} />
        ))
      }

    </div>
  );
};

export default StickyRightComponent;