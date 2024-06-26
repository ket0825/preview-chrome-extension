import { StackProps } from 'stack-props';
import React from 'react'
import CardBody from '@src/component/cardBody';
import Text from '@src/foundation/text';
import HighlightText from '@src/foundation/highlightText';
import OutlinedButton from '@src/foundation/outlinedButton';

const CustomStack: React.FC<StackProps> = ({stackPropsList, gap}) => {

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
      {stackPropsList.map((stackProp, index) => (
        stackProp.type === 'text' ? (
          <Text 
            key={index}   
            text={stackProp.text}
            color={stackProp.color}
            size={stackProp.size}
            weight={stackProp.weight}
            align={stackProp.align}        
            type='text'
          />
        ) : stackProp.type === 'cardBody' ? (
          <CardBody 
            key={index}   
            text={stackProp.text}
            color={stackProp.color}
            size={stackProp.size}
            weight={stackProp.weight}
            type='cardBody'   
            align={stackProp.align}
          />
        ) : stackProp.type === 'highlightText' ? (
          <HighlightText 
            key={index}   
            text={stackProp.text}
            color={stackProp.color}
            size={stackProp.size}
            weight={stackProp.weight}
            align={stackProp.align}
            type='highlightText'
          />
        ) : stackProp.type == 'outlinedButton' ? (
          <OutlinedButton 
            key={index}   
            text={stackProp.text}
            color={stackProp.color}
            size={stackProp.size}
            weight={stackProp.weight}
            onClick={stackProp.onClick}
            textAlign={stackProp.textAlign}
            buttonJustify={stackProp.buttonJustify}
            type='outlinedButton'
            borderColor={stackProp.borderColor}
            borderWidth={stackProp.borderWidth}
            borderRadius={stackProp.borderRadius}
          />
        ) : null
      ))}
    </div>
  );
}

export default CustomStack;
