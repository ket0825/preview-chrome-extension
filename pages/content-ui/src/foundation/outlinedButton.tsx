import { OutlinedButtonProps } from 'button-props'
import React from 'react'

const OutlinedButton:React.FC<OutlinedButtonProps> = ({
    text, color, size, weight, onClick, textAlign, buttonJustify, 
    borderColor, borderWidth, borderRadius
}) => {
    // 색상 클래스 매핑
    const colorClasses: {[key:string]: string} = {
        "text-red-500": 'text-red-500 hover:text-white',        
        // 필요한 다른 색상들 추가
      };
    
      // 크기 클래스 매핑
      const sizeClasses: {[key:string]: string} = {        
        "text-base": 'text-base',
      };
    
      // 폰트 두께 클래스 매핑
      const weightClasses: {[key:string]: string} = {
        'font-normal': 'font-normal',
        'font-semibold': 'font-semibold',
        'font-bold': 'font-bold',
      };

      const textAlignClass = textAlign === 'text-center' ? 'text-center' :
                        textAlign === 'text-right' ? 'text-right' : 'text-left';
    
      // 버튼 정렬 클래스
      const buttonJustifyClass = buttonJustify === 'flex justify-center' ? 'flex justify-center' : 
                              buttonJustify === 'flex justify-end' ? 'flex justify-end' : 'flex justify-start';
      
      const backgroundColorClass = color === 'text-red-500' ? 'bg-transparent hover:bg-red-500 ' : 'bg-transparent';                               
      const borderColorClass = borderColor === 'border-red-500' ? 'border-red-500' : 'border-blue-500';
      const borderWidthClass = 'border border-solid';
      const borderRadiusClass = borderRadius == 'rounded-md'? 'rounded-md' : 
                            borderRadius == 'rounded-lg' ? 'rounded-lg' : 'rounded-2xl';

      return (
        <div 
          className={`
            ${buttonJustifyClass}
        `}
        >
        <button
          onClick={onClick}
          className={`
            ${colorClasses[color]}
            ${sizeClasses[size]}
            ${weightClasses[weight]}
            ${backgroundColorClass}
            ${textAlignClass}
            ${borderColorClass}
            ${borderWidthClass}
            ${borderRadiusClass}
            px-5 py-3
            inline-flex items-center justify-center
          `}
        >
          {text}
        </button>
        </div>
      );
    };
    
    export default OutlinedButton;