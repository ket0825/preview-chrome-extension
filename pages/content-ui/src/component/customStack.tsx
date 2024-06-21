import { StackProps } from 'stack-props';
import React from 'react'
import CardBody from '@src/component/cardBody';
import Text from '@src/foundation/text';
import HighlightText from '@src/foundation/highlightText';

const CustomStack: React.FC<StackProps> = ({textProps, gap}) => {

  // for tailwind css dynamically
  const gapsVariant = {
    'gap-y-2.5': 'gap-y-2.5',
    'gap-y-3': 'gap-y-3',
    'gap-y-3.5': 'gap-y-3.5',
    'gap-y-4': 'gap-y-4',
    "" : ""
  }

  return (    
    <div className={`${gapsVariant[gap]}`}
      style={{
        display: 'flex', 
        flexDirection: 'column',
        rowGap: gap === 'gap-y-2.5' ? '0.625rem' : gap === 'gap-y-3.5' ? '0.875rem' : gap === 'gap-y-4' ? '1rem' : gap === 'gap-y-3' ? '0.75rem' : '0rem'
      }}
    >
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
        ) : textProp.type === 'highlightText' ? (
          <HighlightText 
            key={index}   
            text={textProp.text}
            color={textProp.color}
            size={textProp.size}
            weight={textProp.weight}
            align={textProp.align}
            type='highlightText'
          />
        ) : null
      ))}
    </div>
  );
}

export default CustomStack;
