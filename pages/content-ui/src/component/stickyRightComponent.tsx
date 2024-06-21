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
      //top-[134px] 네이버의 플로팅 탭 크기
      className={`fixed top-[134px] right-0 bg-white transition-opacity duration-300 shadow-md ${verticalPadding} ${horizontalPadding} w-[584px] h-[${height}px] z-[2000] flex flex-col gap-y-4
      ${isVisible ? 'translate-x-0' : 'opacity-0 pointer-events-none'}`
      }
      style={{ 
        border: '1px solid',
        borderColor: `${borderColor === 'border-indigo-200' ? '#C29FFA' : '#CFE2FF'}`,
        borderRadius: `${borderRadius === 'rounded-lg' ? '12px' : '25px'}`,                
      }}
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