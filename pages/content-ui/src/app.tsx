import { act, useEffect,  useRef, useState } from 'react';
import { FetchedProductV1 } from 'fetched-product-v1';
import { FetchedOCRTopicV1 } from 'fetched-ocr-topic-v1';
import CustomTooltips from './component/customTooltips';


export default function App() {

  // const [tooltips, setTooltips] = useState<TooltipsProps | null>(null);  
  const [clickedBtnDetailMore, setClickedBtnDetailMore] = useState<boolean>(false); // [1
  const matchNvMid = useRef<string>('');
  const product = useRef<FetchedProductV1>(null);
  const ocr = useRef<FetchedOCRTopicV1>(null);
  const renderingCount = useRef<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true); // [1
  
  
  // const [review, setReview] = useState<FetchedReviewTopicV1>(null); 
  renderingCount.current += 1;
  useEffect(() => {
    console.log('content ui loaded');

    const currentUrl = window.location.href;
    const regex = /^(https:\/\/search\.shopping\.naver\.com\/catalog\/\d+)/;    
    const match = currentUrl.match(regex);
    
    if (match) {
      console.log('Match URL:', match[1]);
      console.log('matchNvMid:', match[1].split('/')[4]);
      matchNvMid.current = match[1].split('/')[4];
    } else {
      console.log('No match');
    }

    if (matchNvMid.current === "") {
      console.log('matchNvMid is empty'); 
      return;
    }
    
    const fetchData = () => {
      
      chrome.runtime.sendMessage({
        action: 'fetchProduct',
        match_nv_mid: matchNvMid.current,
      },
      (response) => {
        console.log(`response.url: ${response.url}`);
        if (response.success && response.data && response.data.length > 0) {
          console.log('DB에 있습니다.');
          product.current = response.data[0];
          chrome.runtime.sendMessage({
            action: 'fetchOCR',
            type: 'OT0',
            prid: product.current?.prid,
          },
          (response) => {
            if (response.data) {
              ocr.current = response.data;             
              console.log("ocr.current?.length:", ocr.current?.length)
              setIsLoading(false);
            } else if (response.error) {
              console.error(response.error, response.url, response.prid);
              console.log('ERROR: OCR 데이터가 없습니다.');
            }
          });        

          
        } else if (response.error) {
          console.error(response.error, response.url);

        } else {
          console.log('DB에 없습니다.');
        }        
      });
    }
          
    fetchData();
  
/** MutationObserver를 사용하여 원하는 요소가 추가되면 클릭 코드 실행 */
     const targetNode = document.body; // 감시할 대상 노드 (body)
     const observerOptions = {
       childList: true, // 자식 노드 추가/제거 감시
       subtree: true // 하위 트리 변경 사항 감시
      };
 
     const observer = new MutationObserver(function(mutationsList, observer) {
       mutationsList.forEach(mutation => {
         if (mutation.type === 'childList') {
           const addedNodes = mutation.addedNodes;
           addedNodes.forEach(node => {
             if (node.nodeType === Node.ELEMENT_NODE) {
               const element = node as HTMLElement;                           
              if (element.matches('[class^="imageSpecInfo_btn_detail_more__"]')) {
                // 추가된 요소가 원하는 요소인 경우 클릭 코드 실행
                element.click();
                console.log('clicked');
                const rect = element.getBoundingClientRect();
                const x = rect.left + window.scrollX;
                const y = rect.top + window.scrollY;
                console.log(`Element position: (${x}, ${y})`);
                setClickedBtnDetailMore(true);
                                
                observer.disconnect(); // 감시 중지
                console.log('observer disconnected');
                return;                          
                }                               
             }             
           });
         }
       });
     });
     observer.observe(targetNode, observerOptions);

     setTimeout(() => {
      observer.disconnect();
      console.log('observer disconnected after 1 minute');
      setClickedBtnDetailMore(true);
    }, 100000);

    
  }, []);

    
  console.log("ocr 결과:", ocr.current);
  console.log("product 결과:", product.current);
  console.log('app.tsx 렌더링 횟수: ', renderingCount.current)
    

  return (
    <>
      {!isLoading ?         
        <CustomTooltips ocrTopics={ocr.current}></CustomTooltips>
      : null}      
    </>
  );
}


