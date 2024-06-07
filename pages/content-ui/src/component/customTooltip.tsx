// customTooltip.tsx

import React, { useState } from 'react';
import { TooltipProps } from 'tooltip-props';

const CustomTooltip:React.FC<TooltipProps> = ({ text, bbox, isSelected, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  // console.log('여기는 customTooltip.tsx 입니다. bbox: ', bbox)
  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const className = `absolute top-[${bbox.y}px] left-[${bbox.x}px] bg-gray-300 opacity-30 text-white z-9999 h-[${bbox.height}px] w-[${bbox.width}] p-5`;
  // const newElement = document.createElement("div");
  // newElement.className= className;
  // newElement.textContent = "새로운 요소";
  // document.body.appendChild(newElement);
  // const rect = imgElement.getBoundingClientRect();
  // const x = rect.left + window.scrollX;
  // const y = rect.top + window.scrollY;
  // const newElement = document.createElement("div");
  // newElement.textContent = "새로운 요소";
  // newElement.style.position = "absolute";
  // newElement.style.top = ${y}px;
  // newElement.style.left = ${x}px;
  // newElement.style.backgroundColor = "#CED4DA";
  // newElement.style.opacity = "0.3";
  // newElement.style.color = "white";
  // newElement.style.zIndex = "9999";
  // newElement.style.height = "200px";
  // newElement.style.width = "200px";
  // newElement.style.padding = "5px";
  // document.body.appendChild(newElement);
  // console.log(img 위치: (${x}, ${y}));

  return (
    <div className={className}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />      
      {isVisible && (
        <div className="absolute z-10 bg-gray-800 text-white text-sm font-normal rounded p-2 left-full -top-full mt-16 ml-1 whitespace-nowrap min-w-[123px] max-w-[123px]">
          {text}
        </div>
      )}
    </div>
  );
};

export default CustomTooltip;