// customTooltips.tsx

import { FetchedOCRTopicV1 } from 'fetched-ocr-topic-v1';
import React, { useEffect, useRef, useState } from 'react';
import StickyRightComponent from './stickyRightComponent';
import { StackProps } from 'stack-props';
import { FetchedReviewTopicV1 } from 'fetched-review-topic-v1';
import CustomTooltip from './customTooltip';
import { Bbox } from 'bbox';

interface CustomTooltipsProps {
  ocrTopics: FetchedOCRTopicV1;
}

const defaultStacksProps: StackProps[] = [
  {
    stackPropsList: [
      {
        text: '스펙을 클릭하고,\n실 사용자의 리뷰를 만나보세요!',
        color: 'text-gray-700',
        size: 'text-2xl',
        weight: 'font-bold',
        type: 'text',
        align: 'text-center',
      },
    ],
    gap: '',
  },
];

const CustomTooltips: React.FC<CustomTooltipsProps> = ({ ocrTopics }) => {
    
    const [selectedOCRTopicIdx, setSelectedOCRTopicIdx] = useState<number>(-1);
    const [isVisibleStickyRightComponent, setIsVisibleStickyRightComponent] = useState<boolean>(false);
    const [reviews, setReviews] = useState<FetchedReviewTopicV1>(null);
    const [imgElementsSizes, setImgElementsSizes] = useState<{ real2clientRatio: number; extension: string; x: number; y: number; naturalHeight: number, imageNumber:number }[]>([]);    
    const newbboxs = useRef<Bbox[]>([]); // bboxsArray를 newbboxs로 정리
    const [isTooltipReady, setIsTooltipReady] = useState<boolean>(false); // 
    const [stacksProps, setStacksProps] = useState<StackProps[]>(defaultStacksProps);

    // bboxsArray를 newbboxs로 정리
    // 1. bboxsArray가 2줄 이상에 걸칠 수 있기에 그런 경우 박스 형태가 여러 개를 한 묶음으로 처리해야 함.
    // 1. bboxsArray 내부에 여러 개의 bboxs가 있고, 만약 그게 2 줄 이상처럼 보이는 기준은 어떻게 하지..?        
    
    // 사실상 아래는 한번만 발동함. 로직 문제 없음.
    useEffect(() => {
        const lineHeightThreshold = 10;
        for (let i = 0; i < ocrTopics!.length; i++) {
            const bboxs = ocrTopics![i].bbox;
            const imageNumber = ocrTopics![i].image_number; 
            // console.log("bboxs.length", bboxs.length)
            if (bboxs.length === 1) { // bboxs 하나
                const x0 = Math.max(bboxs[0][0][0], bboxs[0][3][0])
                const y0 = Math.max(bboxs[0][0][1], bboxs[0][1][1])
                const x1 = Math.min(bboxs[0][1][0], bboxs[0][2][0])
                const y1 = Math.min(bboxs[0][2][1], bboxs[0][3][1])
                const width = x1 - x0;
                const height = y1 - y0;

                newbboxs.current.push({x: x0, y: y0, width: width, height: height, imageNumber: imageNumber});                
            }

            else { // bboxs 여러 개, 혹은 여러 줄을 가장 맨 위의 한 줄로 정리
                let anotherLineIdx = -1;
                let prevY1 = Math.min(bboxs[0][2][1], bboxs[0][3][1]);

                for (let b = 1; b < bboxs.length; b++) {
                    const curY1 = Math.min(bboxs[b][2][1], bboxs[b][3][1])
                    if (curY1 - prevY1 > lineHeightThreshold) {
                        anotherLineIdx = b;                        
                        break;
                    }
                    prevY1 = curY1;                
                }
                if (anotherLineIdx === -1 ){ // 다 같은 줄 안에 있으면
                    anotherLineIdx = bboxs.length;
                }

                const sliced_bboxs = bboxs.slice(0, anotherLineIdx)            
                // console.log(`sliced_bboxs length: ${sliced_bboxs.length}`) // OK
                // console.log(`sliced_bboxs ${JSON.stringify(sliced_bboxs, null, 2)}`); OK
                const y0_array:number[] = []
                const y1_array:number[] = []
                sliced_bboxs.forEach((bbox: [[number, number], [number, number], [number, number], [number, number]]) => {
                    y0_array.push(bbox[0][1], bbox[1][1])
                    y1_array.push(bbox[2][1], bbox[3][1])
                });
                const x0 = Math.max(sliced_bboxs[0][0][0], sliced_bboxs[0][3][0])
                const width = Math.min(sliced_bboxs[sliced_bboxs.length-1][1][0], sliced_bboxs[sliced_bboxs.length-1][2][0]) - x0;
                const y0 = Math.max(...y0_array)
                const y1 = Math.min(...y1_array)
                const height = y1 - y0;
                // console.log(`x0: ${x0}, y0: ${y0}, width: ${width}, height: ${height}`)
                newbboxs.current.push({x: x0, y: y0, width: width, height: height, imageNumber: imageNumber});
            }
        }
    }, [ocrTopics]);

  useEffect(() => {
    if (ocrTopics === null || ocrTopics.length === 0) {
      return;
    }

    const targetNode = document.body;
    const observerOptions = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['id'],
    };

    // 렌더링 이슈 때문에 확확 아래로 내려야 맞는 위치에 딱 나옴.
    const detailFromBrandObserver = new MutationObserver((mutationsList, observer) => {
      mutationsList.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          const targetElement = document.getElementById('detailFromBrand');

          if (targetElement) {                        
            const offsetParent = targetElement.offsetParent as HTMLElement;
            const parentRect = offsetParent.getBoundingClientRect();
            const parentX = parseFloat((parentRect.left + window.scrollX).toFixed(2));
            const parentY = parseFloat((parentRect.top + window.scrollY).toFixed(2));
            console.log(`parentX: ${parentX}, parentY: ${parentY}`)

            let real2clientRatio = 0;
            setTimeout(() => {
              const imgElementSizesList = Array.from(targetElement.childNodes)
                .filter((childNode): childNode is HTMLImageElement => childNode instanceof HTMLImageElement)
                .filter((imgElement) => imgElement.src.endsWith('.jpg') || imgElement.src.endsWith('.png') || imgElement.src.endsWith('.jpeg'))
                .map((imgElement, idx) => {
                  if (real2clientRatio === 0) {
                    real2clientRatio = parseFloat((imgElement.width / imgElement.naturalWidth).toFixed(2));
                  }                  
                  const extension = imgElement.src.split('.').pop();
                  const x = imgElement.offsetLeft + parentX;
                  const y = imgElement.offsetTop + parentY;
                  const imageNumber = idx;

                  console.log(`x: ${x}, y: ${y}`)

                  const naturalHeight = parseFloat((imgElement.height * (1 / real2clientRatio)).toFixed(2));

                  return {
                    real2clientRatio,
                    extension: extension!,
                    x,
                    y,
                    naturalHeight,
                    imageNumber
                  };
                });
              
              setImgElementsSizes(imgElementSizesList);
            }, 1000);

            observer.disconnect();
          }
        }
      });
    });

    detailFromBrandObserver.observe(targetNode, observerOptions);
    
  }, [ocrTopics]);

  useEffect(() => {
    // console.log("imgElementsSizes UseEffect 진입")

    if (imgElementsSizes.length === 0) {
      return;
    }

    const processedBboxs: Bbox[] = [];

    console.log(`newbboxs.current: ${JSON.stringify(newbboxs.current, null, 2)}`)

    imgElementsSizes.forEach((imgElementSize) => {
      if (imgElementSize.extension === 'jpg' || imgElementSize.extension === 'png' || imgElementSize.extension === 'jpeg') {
        console.log(`imgElementSize: ${JSON.stringify(imgElementSize, null, 2)}`); // OK
        newbboxs.current.forEach((bbox) => {            
            if (bbox.imageNumber === imgElementSize.imageNumber) {
                const minX = bbox.x;
                const maxX = bbox.x + bbox.width;
                const minY = bbox.y;
                const maxY = bbox.y + bbox.height;

                const processedBbox: Bbox = {
                    x: parseInt((imgElementSize.x + imgElementSize.real2clientRatio * minX).toFixed(2)),
                    y: parseInt((imgElementSize.y + imgElementSize.real2clientRatio * minY).toFixed(2)),
                    width: parseInt((imgElementSize.real2clientRatio * bbox.width).toFixed(2)),
                    height: parseInt((imgElementSize.real2clientRatio * bbox.height).toFixed(2)),
                    imageNumber: bbox.imageNumber
                }
                const isDuplicate = newbboxs.current.some(
                    (bbox) => (bbox.x === processedBbox.x && 
                        bbox.y === processedBbox.y && 
                        bbox.width === processedBbox.width && 
                        bbox.height === processedBbox.height &&
                        bbox.imageNumber === processedBbox.imageNumber
                    )
                );

                if (!isDuplicate) {
                    processedBboxs.push(processedBbox);
                }                        
            }
        });            
      }
    });

    newbboxs.current = processedBboxs;
    console.log("newbboxs length:", newbboxs.current.length); //processedBboxs length: 95
    // console.log(`newbboxs ${JSON.stringify(newbboxs, null, 2)}`); 
    
    setIsTooltipReady(true);
    setIsVisibleStickyRightComponent(true);

  }, [imgElementsSizes, ocrTopics]);

  useEffect(() => {

    if (selectedOCRTopicIdx !== -1 && ocrTopics !== null) {
        console.log(selectedOCRTopicIdx, ocrTopics[selectedOCRTopicIdx])
        console.log(`리뷰 불러오기: ${ocrTopics[selectedOCRTopicIdx].topic_code}`)
        console.log("newbboxs 길이: " ,newbboxs.current.length)
        const selectedTopic = ocrTopics[selectedOCRTopicIdx];
      chrome.runtime.sendMessage(
        {
          action: 'fetchReview',
          type: 'RT0',
          prid: selectedTopic.prid,
          topic_code: selectedTopic.topic_code,
        },
        (response) => {
          if (response.success && response.data.length > 0) {
            console.log(`리뷰 데이터 확인 ${JSON.stringify(response.data, null, 2)}`)                        
            setReviews(response.data);            
            // setReviews([]);
          } else if (response.error) {
            console.error(response.error);
          } else if (response.success && response.data.length === 0) {
            console.log('데이터 없음');
            setReviews([]);
          }
        }
      );
    }
  }, [selectedOCRTopicIdx, ocrTopics]);

  useEffect(() => {
    if (reviews === null) {
      return;
    } else if (reviews.length === 0) {
        const stacksProps: StackProps[] = [
            {
              stackPropsList: [
                {   // Head 관련 텍스트 형식
                  text: `${ocrTopics![selectedOCRTopicIdx].text}`,
                  color: 'text-gray-800',
                  size: 'text-3xl',
                  weight: 'font-bold',
                  type: 'text',
                  align: 'text-left',
                },
              ],
              gap: "",
            },
            {
              stackPropsList: [
                    {
                        text: '이 스펙, 실사용자들의 후기를 만나보세요',
                        color: 'text-gray-800',
                        size: 'text-xl',
                        weight: 'font-extrabold',
                        type: 'text',
                        align: 'text-left',
                    },
                    {
                        text: '충분한 리뷰가 없어요ㅠ',
                        color: 'text-gray-700',
                        size: 'text-2xl',
                        weight: 'font-extrabold',
                        type: 'text',
                        align: 'text-left',
                    }
                ],
                gap: 'gap-y-3.5',
            },
            {
              stackPropsList: [
                    {
                        text: '👎 부정적인 리뷰만 모았어요',
                        color: 'text-gray-800',
                        size: 'text-base',
                        weight: 'font-bold',
                        type: 'text',
                        align: 'text-left',
                    },
                    {
                        text: '현재 이 스펙에 대한 리뷰가 없어요ㅠ',
                        color: 'text-gray-card-body',
                        size: 'text-sm',
                        weight: 'font-normal',
                        type: 'cardBody',
                        align: 'text-center',
                    }
                ],
                gap: 'gap-y-2.5',
            },
            {
              stackPropsList: [
                    {
                        text: '👍 긍정적인 리뷰도 있어요',
                        color: 'text-gray-800',
                        size: 'text-base',
                        weight: 'font-bold',
                        type: 'text',
                        align: 'text-left',
                    },
                    {
                        text: '현재 이 스펙에 대한 리뷰가 없어요ㅠ',
                        color: 'text-gray-card-body',
                        size: 'text-sm',
                        weight: 'font-normal',
                        type: 'cardBody',
                        align: 'text-center',
                    }
                ],
                gap: 'gap-y-2.5',
            }, {
              stackPropsList: [
                {
                  type: 'outlinedButton',
                  text: '닫기',
                  color: 'text-red-500',
                  size: 'text-base',
                  weight: 'font-semibold',
                  onClick: () => setIsVisibleStickyRightComponent(false),
                  textAlign: 'text-center',
                  buttonJustify: 'flex justify-end',
                  borderColor: 'border-red-500',
                  borderWidth: 'border',
                  borderRadius: 'rounded-md',                
                }
              ],
              gap: 'gap-y-2.5',
            },
          ];
          setStacksProps(stacksProps);
          return;        
    } else { // 리뷰가 있을 때
        let positiveReviews = [];
        let negativeReviews = [];
        let positiveReviewsCount = 0;
        let negativeReviewsCount = 0;
                
        for (const review of reviews) {
            if (review.positive_yn === 'Y') {
                positiveReviews.push(review);
                positiveReviewsCount += 1;
                } else if (review.positive_yn === 'N'){
                    negativeReviews.push(review);
                    negativeReviewsCount += 1;
                }
        }   
        
        const ratio = positiveReviewsCount > negativeReviewsCount ? 
            positiveReviewsCount/(positiveReviewsCount+negativeReviewsCount)
            : negativeReviewsCount/(positiveReviewsCount+negativeReviewsCount);

        const summaryText = positiveReviewsCount > negativeReviewsCount ?
            [`${(ratio*100).toFixed(0)}%가 `, '긍정적으로 ', '평가했어요']
            : [`${(ratio*100).toFixed(0)}%가 `, '부정적으로 ', '평가했어요']
        const summaryColor = positiveReviewsCount > negativeReviewsCount ? 
            ['text-black','text-blue-500','text-black'] 
            : ['text-black','text-red-500','text-black'];
        const summarySize = ['text-2xl','text-2xl','text-2xl'];            
        const summaryWeight = ['font-extrabold','font-extrabold','font-extrabold']



        positiveReviews.sort((a, b) => b.topic_score - a.topic_score);
        negativeReviews.sort((a, b) => b.topic_score - a.topic_score);   
             
        negativeReviews = negativeReviews.slice(0, 3);
        positiveReviews = positiveReviews.slice(0, 3);
        
        const stacksProps: StackProps[] = [
          {
            stackPropsList: [
              {
                text: `${ocrTopics![selectedOCRTopicIdx].text}`,
                color: 'text-gray-800',
                size: 'text-3xl',
                weight: 'font-bold',
                type: 'text',
                align: 'text-left',
              },
            ],
            gap: "gap-y-4",
          },
          {
            stackPropsList: [
              {
                text: '이 스펙, 실사용자들의 후기를 만나보세요',
                color: 'text-gray-800',
                size: 'text-xl',
                weight: 'font-extrabold',
                type: 'text',
                align: 'text-left',
              },
              {
                text: summaryText,
                color: summaryColor,
                size: summarySize,
                weight: summaryWeight,
                type: 'highlightText',
                align: 'text-left',
              }
            ],
            gap: 'gap-y-3.5',
          },
          {
            stackPropsList: [
              {
                text: '👎 부정적인 리뷰만 모았어요',
                color: 'text-gray-800',
                size: 'text-base',
                weight: 'font-bold',
                type: 'text',
                align: 'text-left',
              },
              ...(negativeReviews.length > 0 ? negativeReviews.map((review) => ({
                text: review.text,
                color: 'text-gray-card-body',
                size: 'text-sm',
                weight: 'font-normal',
                type: 'cardBody',
                align: 'text-left',
              })) : [{ // negativeReviews가 비어있는 경우 대체 메시지
                text: '현재 이 스펙에 대한 리뷰가 없어요ㅠ',
                color: 'text-gray-card-body',
                size: 'text-sm',
                weight: 'font-normal',
                type: 'cardBody',
                align: 'text-center',
              }]),
            ],
            gap: 'gap-y-2.5',
          },
          {
            stackPropsList: [
              {
                text: '👍 긍정적인 리뷰도 있어요',
                color: 'text-gray-800',
                size: 'text-base',
                weight: 'font-bold',
                type: 'text',
                align: 'text-left',
              },
              ...(positiveReviews.length > 0 ? positiveReviews.map((review) => ({
                text: review.text,
                color: 'text-gray-card-body',
                size: 'text-sm',
                weight: 'font-normal',
                type: 'cardBody',
                align: 'text-left',
              })) : [{ // positiveReviews가 비어있는 경우 대체 메시지
                text: '현재 이 스펙에 대한 리뷰가 없어요ㅠ',
                color: 'text-gray-card-body',
                size: 'text-sm',
                weight: 'font-normal',
                type: 'cardBody',
                align: 'text-center',
              }]),
            ],
            gap: 'gap-y-2.5',
          }, {
            stackPropsList: [
              {
                type: 'outlinedButton',
                text: '닫기',
                color: 'text-red-500',
                size: 'text-base',
                weight: 'font-semibold',
                onClick: () => setIsVisibleStickyRightComponent(false),
                textAlign: 'text-center',
                buttonJustify: 'flex justify-end',
                borderColor: 'border-red-500',
                borderWidth: 'border',
                borderRadius: 'rounded-md',                
              }
            ],
            gap: 'gap-y-2.5',
          },
        ];
      
        setStacksProps(stacksProps);
    }
   
  }, [reviews]);    
  
  return (
    <div className="flex">
        {isTooltipReady ?
        newbboxs.current.map((bbox, idx) => (
          <CustomTooltip
            key={idx}
            text="실사용자 리뷰보기"
            bbox={bbox}
            isSelected={selectedOCRTopicIdx === idx}
            onClick={() => {
              setSelectedOCRTopicIdx(idx)
              setIsVisibleStickyRightComponent(true)
            }}
            index={idx}
          />
        )) : null
        }
      <div>
        {ocrTopics !== null && ocrTopics.length != 0 && isTooltipReady && isVisibleStickyRightComponent ? 
        selectedOCRTopicIdx === -1 ? (
          <StickyRightComponent
            stacksProps={stacksProps}
            verticalPadding="py-9"
            horizontalPadding=""
            borderRadius="rounded-lg"
            borderColor="border-blue-100"
            borderWidth="border"
            triggerPosition={imgElementsSizes[0].y-134} // 네이버의 플로팅탭
            // disappearPosition={imgElementsSizes[imgElementsSizes.length-1].y + imgElementsSizes[imgElementsSizes.length-1].naturalHeight * imgElementsSizes[imgElementsSizes.length-1].real2clientRatio}
            disappearPosition={imgElementsSizes[imgElementsSizes.length-1].y + imgElementsSizes[imgElementsSizes.length-1].naturalHeight * imgElementsSizes[imgElementsSizes.length-1].real2clientRatio + 15000}
            visible={true}
          />
        ) : (
          <StickyRightComponent
            stacksProps={stacksProps}
            verticalPadding="py-3"
            horizontalPadding="px-6"
            borderRadius="rounded-lg"
            borderColor="border-indigo-200"
            borderWidth="border"
            triggerPosition={imgElementsSizes[0].y-134} // 네이버의 플로팅탭
            disappearPosition={imgElementsSizes[imgElementsSizes.length-1].y + imgElementsSizes[imgElementsSizes.length-1].naturalHeight * imgElementsSizes[imgElementsSizes.length-1].real2clientRatio + 15000}
            visible={isVisibleStickyRightComponent}
          />
        ) : null
      }
      </div>
    </div>
  );
};

export default CustomTooltips;