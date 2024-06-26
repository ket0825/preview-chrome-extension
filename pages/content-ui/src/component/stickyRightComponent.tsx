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
  visible,
  }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition >= triggerPosition && scrollPosition < disappearPosition && visible) {
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

  useEffect(() => {    
    if (visible) {
      setIsVisible(true);
      console.log('visible:', visible);
    } else {
      setIsVisible(false);
      console.log('visible:', visible);
    }
  }, [visible]);  

  return (
    <div
      //top-[134px] 네이버의 플로팅 탭 크기
      className={`fixed top-[134px] right-0 bg-white transition-opacity ease-in-out duration-300 shadow-md ${verticalPadding} ${horizontalPadding} w-[586px] z-[2000] flex flex-col gap-y-4
      ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`      
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
          stackPropsList={stackProps.stackPropsList} 
          gap={stackProps.gap} />
        ))
      }

    </div>
  );
};

export default StickyRightComponent;