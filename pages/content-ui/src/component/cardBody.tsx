// cardBody.tsx
import React from 'react'
import { TextProps } from 'text-props'

const CardBody:React.FC<TextProps> = ({text, align}) => {
      
  const className = `py-3 px-6 ${align} font-Inter line-clamp-2`
  return (
    <div 
      className={className}
      style={{
        border: '1px solid',
        borderColor: '#DEE2E6',
        borderRadius: '12px',
      }}
      

    >
      {text}      
    </div>    
  );
}

export default CardBody
