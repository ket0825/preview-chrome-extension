import React from 'react'
import { HighlightTextProps } from 'highlight-text-props'

const HighlightText:React.FC<HighlightTextProps> = ({text, color, size, weight, align}) => {
    
    const className = `${align} font-Inter whitespace-pre-line`
    return (
        <div className={className}>
            {text.map((t, index) => (
                <span key={index} className={`${size[index]} ${weight[index]} ${color[index]}`}>
                    {t}
                </span>
            ))}
        </div>        
    )
}

export default HighlightText
