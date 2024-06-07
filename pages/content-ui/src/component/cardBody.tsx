import React from 'react'
import { TextProps } from 'text-props'

const CardBody:React.FC<TextProps> = ({text, align}) => {
      
  const className = `rounded-lg border border-gray-300 py-3 px-6 ${align}`
  return (
    <div className={className}>
      {text}      
    </div>    
  );
}

export default CardBody
