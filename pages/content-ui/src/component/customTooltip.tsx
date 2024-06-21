// customTooltip.tsx

import React, { useState } from 'react';
import { TooltipProps } from 'tooltip-props';

const CustomTooltip: React.FC<TooltipProps> = ({ index, text, bbox, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const tooltipStyle = {
    top: `${bbox.y}px`,
    left: `${bbox.x}px`,
    height: `${bbox.height}px`,
    width: `${bbox.width}px`,
    backgroundColor: isSelected ? '#3D0A91' : '#FFC107',
  };
  

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {    
    console.log('index', index);
    onClick();
    event.stopPropagation();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="absolute opacity-30 text-white z-9999 p-3"
      style={tooltipStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role='presentation'
    >
      {isHovered && (
        <div className="absolute z-10 bg-gray-800 text-white text-sm font-normal rounded p-2 left-full -top-full mt-16 ml-1 whitespace-nowrap min-w-[123px] max-w-[123px]">
          {text}
        </div>
      )}
    </div>
  );
};

export default CustomTooltip;