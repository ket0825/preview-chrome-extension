// content-ui/custom.d.ts

declare module 'child-props' {
  export interface ChildProps {
    text: string;
  }
  // export default ChildProps;
}

declare module 'text-props' {
  export interface TextProps {
    type: 'text' | 'cardBody' | 'box'; // text, cardBody, box    
    color: Color;
    size: Size;
    weight: Weight;
    text: string;
    align: 'text-left' | 'text-center' | 'text-right'; // left, center, right
  }
  // fs: 32, 29, 24, 20, 16, 12

  // gray300, gray800, blue500: 긍정, red500: 부정

  // bold, extra-bold, normal, light, extra-light
}

type Color = 'text-gray-300' | 'text-gray-700' | 'text-gray-800' | 'text-blue-500' | 'text-red-500' | 'text-black' | 'text-gray-card-body';
type Size = "text-xs" | "text-base" | "text-xl" | "text-2xl" | "text-3xl" ; // 12, 16, 20, 24, 30 -> 32, 
type Weight = "font-normal" | "font-bold" | "font-extrabold" ; // 400, 700, 800

declare module 'stack-props' {
  import { TextProps } from 'text-props';

  export interface StackProps {
      textProps: TextProps[],
      gap: 'gap-3'| 'gap-3.5' | 'gap-4' | "";  // 12, 14, 16        
  }
  // export default ComponentArrayProps;
}

declare module 'sticky-right-component-props' {
  import { StackProps } from 'stack-props';

  export interface StickyRightComponentProps {
      stacksProps: StackProps[],
      verticalPadding: 'py-3' | 'py-10', // small and big size box
      horizontalPadding: 'px-6' | 'px-5' | '', // small and big and default size box
      borderRadius: 'rounded-lg' | 'rounded-2xl', // 12, 25 small and big size box 
      borderColor: 'border-gray-300' | 'border-indigo-200',
      borderWidth: 'border' // only 1px
      triggerPosition: number,
      disappearPosition: number,
      height: number,
    }
  // export default StickyRightComponentProps;
}

declare module 'bbox' {
  export interface Bbox {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  // export default Bbox;
}

declare module 'tooltip-props' {
  export interface TooltipProps {
    text: string;
    bbox: Bbox;
    isSelected: boolean;
    onClick: () => void;
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
    bbox: Array;
  };
}

declare module 'fetched-ocr-topic-v1' {
  export type FetchedOCRTopicV1 = OCRTopic[] | null;
  // export default ProductFetch;
}

declare module 'selected-ocr-topic' {
  import { FetchedOCRTopicV1 } from 'fetched-ocr-topic-v1';
  export interface SelectedOCRTopic extends FetchedOCRTopicV1 {
    selected: boolean[];    
  }
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
  };
}

declare module 'fetched-review-topic-v1' {
  export type FetchedReviewTopicV1 = ReviewTopicV1[] | null;
  // export default ProductFetch;
}