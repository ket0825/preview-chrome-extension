// customTooltips.tsx

import { FetchedOCRTopicV1 } from 'fetched-ocr-topic-v1'
import React, { useEffect, useRef, useState } from 'react'
import StickyRightComponent from './stickyRightComponent';
import { TextProps } from 'text-props';
import { StackProps } from 'stack-props';
import { FetchedReviewTopicV1 } from 'fetched-review-topic-v1';
import CustomTooltip from './customTooltip';
import { TooltipProps } from 'tooltip-props';
import { Bbox } from 'bbox';

interface CustomTooltipsProps {
    ocrTopics: FetchedOCRTopicV1;    
}


const CustomTooltips: React.FC<CustomTooltipsProps> = ({ ocrTopics }) => {

    // const bboxs = ocrTopics?.map((ocrTopic) => ocrTopic.bbox);
    const bboxsArray = useRef<[[number, number], [number, number], [number, number], [number, number]][][]>();
    bboxsArray.current = ocrTopics?.map((ocrTopic) => ocrTopic.bbox)
    const newbboxs = useRef<Bbox[]>([]);
  
    const [selectedOCRTopicIdx, setSelectedOCRTopicIdx] = useState<number>(-1);
    const [reviews, setReviews] = useState<FetchedReviewTopicV1>(null);
    const [imgElementsSizes, setImgElementsSizes] = useState<{real2clientRatio:number, extension: string, x:number, y:number, naturalHeight: number}[]>([]);    
    const [ready, setReady] = useState<boolean>(false);

    // bboxsArray를 newbboxs로 정리
    // 1. bboxsArray가 2줄 이상에 걸칠 수 있기에 그런 경우 박스 형태가 여러 개를 한 묶음으로 처리해야 함.
    // 1. bboxsArray 내부에 여러 개의 bboxs가 있고, 만약 그게 2 줄 이상처럼 보이는 기준은 어떻게 하지..?        
    const lineHeightThreshold = 10;
    for (let i = 0; i < bboxsArray.current!.length; i++) {
        const bboxs = bboxsArray.current![i]; 
        // console.log("bboxs.length", bboxs.length)
        if (bboxs.length === 1) { // bboxs 하나
            const x0 = Math.min(bboxs[0][0][0], bboxs[0][3][0])
            const y0 = Math.min(bboxs[0][0][1], bboxs[0][1][1])
            const x1 = Math.max(bboxs[0][1][0], bboxs[0][2][0])
            const y1 = Math.max(bboxs[0][2][1], bboxs[0][3][1])
            const width = x1 - x0;
            const height = y1 - y0;

            newbboxs.current.push({x: x0, y: y0, width: width, height: height});                
        }

        else { // bboxs 여러 개, 혹은 여러 줄을 가장 맨 위의 한 줄로 정리
            let anotherLineIdx = -1;
            let prevY = bboxs[0][2][1];

            for (let b = 0; b < bboxs.length; b++) {
                const curY = Math.max(bboxs[b][2][1], bboxs[b][3][1])
                if (curY - prevY > lineHeightThreshold) {
                    anotherLineIdx = b;
                    break;
                }
                prevY = curY;                
            }
            if (anotherLineIdx === -1 ){ // 다 같은 줄 안에 있으면
                anotherLineIdx = bboxs.length;
            }

            const sliced_bboxs = bboxs.slice(0, anotherLineIdx)            
            // console.log(`sliced_bboxs length: ${sliced_bboxs.length}`)
            
            const y0_array:number[] = []
            const y1_array:number[] = []
            sliced_bboxs.forEach((bbox) => {
                y0_array.push(bbox[0][1], bbox[1][1])
                y1_array.push(bbox[2][1], bbox[3][1])
            });
            const x0 = Math.min(sliced_bboxs[0][0][0], sliced_bboxs[0][3][0])
            const width = Math.max(sliced_bboxs[sliced_bboxs.length-1][1][0], sliced_bboxs[sliced_bboxs.length-1][2][0]) - x0;
            const y0 = Math.min(...y0_array)
            const y1 = Math.max(...y1_array)
            const height = y1 - y0;
            newbboxs.current.push({x: x0, y: y0, width: width, height: height});
        }
    }


    useEffect(() => {
        console.log('CustomTooltips loaded');
        console.log(`ocrTopics at customTooltips: ${ocrTopics}`);
        if (ocrTopics===null || ocrTopics.length === 0) {
            return;
        }
        
        const targetNode = document.body; // 감시할 대상 노드 (body)
        const observerOptions = {
        childList: true, // 자식 노드 추가/제거 감시
        subtree: true, // 하위 트리 변경 사항 감시
        attributes: true, // 속성 변경 감지 추가
        attributeFilter: ['id'] // id 속성만 감시
        };
        
        // MutationObserver를 사용하여 원하는 요소가 추가되면 클릭 코드 실행
        const detailFromBrandObserver = new MutationObserver(function (mutationsList, observer) {
            mutationsList.forEach(mutation => {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                const targetElement = document.getElementById('detailFromBrand');
                
                if (targetElement) {                    
                    // console.log("확인:",targetElement.childNodes)
                    const offsetParent = targetElement.offsetParent as HTMLElement;
                    const parentRect = offsetParent.getBoundingClientRect();
                    const parentX = parseFloat((parentRect.left + window.scrollX).toFixed(2));
                    const parentY = parseFloat((parentRect.top + window.scrollY).toFixed(2));
                    // console.log(`parentX: ${parentX}, parentY: ${parentY}`);

                    let real2clientRatio = 0;
                    setTimeout(() =>    {
                        const imgElementSizesList = Array.from(targetElement.childNodes)
                            .filter((childNode): childNode is HTMLImageElement => childNode instanceof HTMLImageElement)
                            .map((imgElement) => {
                                if (real2clientRatio === 0) {
                                real2clientRatio = parseFloat((imgElement.width / imgElement.naturalWidth).toFixed(2));
                                }                            
                                const extension = imgElement.src.split('.').pop();
                                const x = imgElement.offsetLeft + parentX;
                                const y = imgElement.offsetTop + parentY;
                                const naturalHeight = parseFloat((imgElement.height*(1/real2clientRatio)).toFixed(2));                               
                    
                                return {
                                    real2clientRatio: real2clientRatio,
                                    extension: extension!,
                                    x: x,
                                    y: y,
                                    naturalHeight: naturalHeight
                                };
                            });
                        // console.log(`imgElementSizesList: ${JSON.stringify(imgElementSizesList, null, 2)}`);
                        setImgElementsSizes(imgElementSizesList);
                    }, 500)
                    
                // 안정적이지만 느리고, 계속 처리해줘야 함.

                //     const imgElements = targetElement.getElementsByTagName('img');                
                //     const imgArray = Array.from(imgElements);                    
                //     imgArray.forEach((imgElement) => {
                //         const loadHandler = () => {
                //             console.log('img onload event listener');
                //             const rect = imgElement.getBoundingClientRect();
                //             const x = (rect.left + window.scrollX).toFixed(2);
                //             const y = (rect.top + window.scrollY).toFixed(2);
                            
                //             const real2clientRatio = (imgElement.width / imgElement.naturalWidth).toFixed(2);
                //             const extension = imgElement.src.split('.').pop();
                //             const newImgElementSize = {real2clientRatio: real2clientRatio, extension: extension!, x:x, y:y, naturalHeight:imgElement.naturalHeight};
                            
                        //     setImgElementsSizes(prevSizes => {
                        //         const uniqueSizes = Array.from(new Set(prevSizes.map(size => JSON.stringify(size)))).map(sizeString => JSON.parse(sizeString));
                        //         if (!uniqueSizes.some(size => JSON.stringify(size) === JSON.stringify(newImgElementSize))) {
                        //             return [...uniqueSizes, newImgElementSize];
                        //         }
                        //         return uniqueSizes;
                        // });
                        //     imgElement.removeEventListener('load', loadHandler);
                        // };
                    
                //     imgElement.addEventListener('load', loadHandler);                    
                // });

                observer.disconnect(); // 감시 중지
                console.log('observer at customtooltips disconnected');            
                // setReady(true);
                }
            }
        });
      });
  
        detailFromBrandObserver.observe(targetNode, observerOptions,);

        // 2. bboxsArray가 src 이미지의 크기를 기준으로 되어 있기에, 이미지의 실제 크기를 알아야 함.
        // 3. 이미지의 실제 크기를 알기 위해서는 이미지가 로드되어 있어야 함.
        // 4. 이미지가 jpg, png만 적용되게끔 하고, gif는 제외한 상태의 크기임.
        // 5. 이미지의 실제 크기를 알기 위해서는 이미지가 로드되어 있어야 함.        
    
        // total height와 start 사이에 있는 이미지들만 조정해줌.
        console.log(`newbboxs length: ${newbboxs.current.length}`);
        if (imgElementsSizes.length > 0) {
            let endRange = 0;
            let startRange = 0;
            const updatedBboxs: Bbox[] = [];
          
            imgElementsSizes.forEach((imgElementSize) => {
              if (imgElementSize.extension === 'jpg' || imgElementSize.extension === 'png') {
                const naturalHeight = imgElementSize.naturalHeight;
                endRange += naturalHeight;
          
                newbboxs.current.forEach((bbox) => {
                  const updatedBbox = { ...bbox };
                  if (updatedBbox.y > startRange && updatedBbox.y < endRange) {
                    updatedBbox.y -= startRange;
                    updatedBbox.height = parseInt((imgElementSize.real2clientRatio * updatedBbox.height).toFixed(2));
                    updatedBbox.width = parseInt((imgElementSize.real2clientRatio * updatedBbox.width).toFixed(2));
                    updatedBbox.x = parseInt((imgElementSize.x + imgElementSize.real2clientRatio * updatedBbox.x).toFixed(2));
                    updatedBbox.y = parseInt((imgElementSize.y + imgElementSize.real2clientRatio * updatedBbox.y).toFixed(2));
          
                    // Check if updatedBbox already exists in updatedBboxs array
                    const isDuplicate = updatedBboxs.some(
                      (bbox) =>
                        bbox.x === updatedBbox.x &&
                        bbox.y === updatedBbox.y                        
                    );
          
                    // Add updatedBbox to updatedBboxs array only if it's not a duplicate
                    if (!isDuplicate) {
                      updatedBboxs.push(updatedBbox);
                    }
                  }
                });
          
                newbboxs.current = updatedBboxs;
                startRange += naturalHeight;
              }
            });
          
            console.log(`newbboxs ${JSON.stringify(newbboxs.current, null, 2)}`);
            console.log(`newbboxs length: ${newbboxs.current.length}`);
            
            setReady(true);                
        }

        console.log(`imgElements ${JSON.stringify(imgElementsSizes, null, 2)}`);
        


        if (selectedOCRTopicIdx !== -1 ) {
            chrome.runtime.sendMessage({
                action: 'fetchReview',
                type: 'RT0',
                prid: ocrTopics[0].prid,
                topic_code: ocrTopics[selectedOCRTopicIdx].topic_code,
            }, (response) => {
                if (response.success && response.data.length > 0) {
                    console.log('fetchReview success:', response.data);
                    setReviews(response.data);
                } else {
                    console.log('fetchReview failed:', response.error);
                }
            });
        }    
        
    }, [selectedOCRTopicIdx, ready, imgElementsSizes]);

    const defaultStacksProps:StackProps[] = [{
        textProps: [            
                {
                    text: '스펙을 클릭하고,\n실 사용자의 리뷰를 만나보세요!',
                    color: 'text-gray-700',
                    size: 'text-2xl',
                    weight: 'font-bold',
                    type: 'text',
                    align: 'text-center',        
                }],
        gap: '',
    }];

    console.log(newbboxs.current.length === 0)
    console.log(ready)
    return (
        <>
        {ready ?
                newbboxs.current.map((bbox, idx) => {
                    return (
                        <CustomTooltip key={idx} 
                            text="실사용자 리뷰보기" 
                            bbox={bbox}           
                            isSelected={selectedOCRTopicIdx === idx}                 
                            onClick={() => setSelectedOCRTopicIdx(idx)}/>                                
                    )
                })  : null               
        }
        {ocrTopics === null ? null :
            ocrTopics.length !== 0 && selectedOCRTopicIdx === -1 ? // 선택된 OCRTopic이 없으면 (기본 형태로 보여줌)
                <StickyRightComponent 
                stacksProps={defaultStacksProps} 
                verticalPadding='py-3' 
                horizontalPadding='' 
                borderRadius='rounded-lg' 
                borderColor='border-gray-300' 
                borderWidth='border' 
                triggerPosition={0} 
                disappearPosition={10000}
                height={138}
                 />
                : <StickyRightComponent     // 선택된 OCRTopic이 있으면 (리뷰를 보여줌)
                stacksProps={defaultStacksProps} 
                verticalPadding='py-3' 
                horizontalPadding='px-6' 
                borderRadius='rounded-lg' 
                borderColor='border-gray-300' 
                borderWidth='border' 
                triggerPosition={0} 
                disappearPosition={10000}
                height={697}
                 />
        }
        </>
    )
}


export default CustomTooltips;