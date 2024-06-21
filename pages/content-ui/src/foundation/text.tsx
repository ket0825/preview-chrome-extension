import React from 'react'
import { TextProps } from 'text-props'

const Text:React.FC<TextProps> = ({text, color, size, weight, align}) => {
    
    const className = `${size} ${weight} ${color} ${align} font-Inter whitespace-pre-line`
    return (
        <div className={className}>
            {text}
        </div>
    )
}

export default Text

// fs: 32, 29, 24, 20, 16, 12

// gray300 #68717A, gray800  #343A40, blue500: 긍정, red500: 부정

// bold, extra-bold, normal, light, extra-light