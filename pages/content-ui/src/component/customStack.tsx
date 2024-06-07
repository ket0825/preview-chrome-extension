import { StackProps } from 'stack-props';
import React from 'react'
import CardBody from '@src/component/cardBody';
import Text from '@src/foundation/text';

const CustomStack: React.FC<StackProps> = ({textProps, gap}) => {
  

  return (    
<div className={`${gap}`}>
  {textProps.map((textProp, index) => (
    textProp.type === 'text' ? (
      <Text 
        key={index}   
        text={textProp.text}
        color={textProp.color}
        size={textProp.size}
        weight={textProp.weight}
        align={textProp.align}        
        type='text'
       />
    ) : textProp.type === 'cardBody' ? (
      <CardBody 
        key={index}   
        text={textProp.text}
        color={textProp.color}
        size={textProp.size}
        weight={textProp.weight}
        type='cardBody'   
        align={textProp.align}
      />
    ) : (
      <div key={index}>error</div>
    )
  ))}
</div>
  )
}

export default CustomStack;
