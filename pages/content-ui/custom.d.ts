// content-ui/custom.d.ts

declare module 'child-props' {
  export interface ChildProps {
    text: string;
  }
  // export default ChildProps;
}

declare module 'text-props' {
  export interface TextProps {
    type: 'text' | 'cardBody' | string; // text, cardBody, box    
    color: Color | Color[] | string;
    size: Size | string;
    weight: Weight | string;
    text: string | string;
    align: 'text-left' | 'text-center' | 'text-right' | "" | string; // left, center, right
  }
  // fs: 32, 29, 24, 20, 16, 12

  // gray300, gray800, blue500: 긍정, red500: 부정

  // bold, extra-bold, normal, light, extra-light
}

declare module 'highlight-text-props' {
  export interface HighlightTextProps {
    type: 'highlightText' | string; 
    text: string[];
    color: Color[] | string[];
    size: Size[] | string[];
    weight: Weight[] | string[];
    align: 'text-left' | 'text-center' | 'text-right' | "" | string; // left, center, right
  }
  // fs: 32, 29, 24, 20, 16, 12

  // gray300, gray800, blue500: 긍정, red500: 부정

  // bold, extra-bold, normal, light, extra-light
}

declare module 'button-props' {
  export interface ButtonProps {
    type: 'outlinedButton' | string;
    text: string;
    color: Color;
    size: Size;
    weight: Weight;
    onClick: () => void;
    textAlign: 'text-left' | 'text-center' | 'text-right' | "" | string; // left, center, right
    buttonJustify: 'flex justify-end' | 'flex justify-center' | 'flex justify-end' | "" | string; // left, center, right
  }

  export interface OutlinedButtonProps extends ButtonProps {
    borderColor: 'border-red-500';
    borderWidth: 'border' // only 1px
    borderRadius: 'rounded-md' | 'rounded-lg' | 'rounded-2xl', // 6, 12, 25 button, small and big size box
  }
}




type Color = 'text-gray-300' | 'text-gray-700' | 'text-gray-800' | 'text-blue-500' | 'text-red-500' | 'text-black' | 'text-gray-card-body';
type Size = "text-xs" | "text-sm" | "text-base" | "text-xl" | "text-2xl" | "text-3xl" ; // 12, 16, 20, 24, 30 -> 32, 
type Weight = "font-normal" | "font-semibold" |  "font-bold" | "font-extrabold" ; // 400, 600, 700, 800

declare module 'stack-props' {
  import { TextProps } from 'text-props';

  export interface StackProps {
      stackPropsList: (TextProps | HighlightTextProps | ButtonProps)[],
      gap: 'gap-y-2.5' | 'gap-y-3'| 'gap-y-3.5' | 'gap-y-4' | "";  // 10, 12, 14, 16 -> 18        
  }  
}

declare module 'sticky-right-component-props' {
  import { StackProps } from 'stack-props';

  export interface StickyRightComponentProps {
      stacksProps: StackProps[],
      verticalPadding: 'py-3' | 'py-9' | "", // small and big size box
      horizontalPadding: 'px-6' | 'px-5' | '', // small and big and default size box
      borderRadius: 'rounded-lg' | 'rounded-2xl', // 12, 25 small and big size box 
      borderColor: 'border-indigo-200' | "border-blue-100",
      borderWidth: 'border' // only 1px
      triggerPosition: number,
      disappearPosition: number,
      visible: boolean,
    }
  // export default StickyRightComponentProps;
}

declare module 'bbox' {
  export interface Bbox {
    x: number;
    y: number;
    width: number;
    height: number;
    imageNumber: number;
  }
  // export default Bbox;
}

declare module 'tooltip-props' {
  export interface TooltipProps {
    text: string;
    bbox: Bbox;
    isSelected: boolean;
    onClick: () => void;
    index: number;
  }
  // export default TooltipProps;
}

declare module 'fetched-product-v1' {
  export type FetchedProductV1 = {    
    brand: string
    caid: string
    detail_image_urls: null | Array | object
    grade: number
    id: number
    lowest_price: number
    maker: string
    match_nv_mid: string | null
    name: string
    naver_spec: null | Array | object
    prid: string
    review_count: number
    seller_spec: Array
    url: "https://search.shopping.naver.com/catalog/31354627620"
  } | null;
  // export default ProductFetch;
}

declare module 'ocr-topic-v1' {
  export type OCRTopicV1 = { 
    id: number;
    type: string;
    tpid: null;
    prid: string;
    reid: null;
    text : string;
    topic_code: string;
    topic_name: string;
    topic_score: null;
    start_pos: number;
    end_pos: number;
    positive_yn: null;
    sentiment_scale: null;    
    bbox: [[number, number], [number, number], [number, number], [number, number]][];
    image_number: number;
  };
}

declare module 'fetched-ocr-topic-v1' {
  export type FetchedOCRTopicV1 = OCRTopic[] | null;
}

declare module 'review-topic-v1' {
  export type ReviewTopicV1 = { 
    id: number;
    type: string;
    tpid: null;
    prid: null;
    reid: string;
    text : string;
    topic_code: string;
    topic_name: string;
    topic_score: number;
    start_pos: number;
    end_pos: number;
    positive_yn: "Y" | "N";
    sentiment_scale: number;     
    bbox: null;
    image_number: null;  
  };
}

declare module 'fetched-review-topic-v1' {
  export type FetchedReviewTopicV1 = ReviewTopicV1[] | null;
  // export default ProductFetch;
}

declare module 'image-info' {
  export interface ImageInfo {
    real2clientRatio: number;
    extension: string;
    x: number;
    y: number;
    naturalHeight: number;
    imageNumber: number;
  }
}

declare module 'custom-tooltips-props' {
  export interface CustomTooltipsProps {
    ocrTopics: FetchedOCRTopicV1;
    imgElementsSizes: ImageInfo[];
  }
}