import { useEffect,  useRef, useState } from 'react';
import { FetchedProductV1 } from 'fetched-product-v1';
import { FetchedOCRTopicV1 } from 'fetched-ocr-topic-v1';
import CustomTooltips from './component/customTooltips';
import { ImageInfo } from 'image-info';


const useLoadingComplete = (ocr: React.MutableRefObject<FetchedOCRTopicV1>, imgElementsSizes: ImageInfo[]) => {
  
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (ocr.current && imgElementsSizes.length > 0) {
      console.log('loading complete');
      setIsLoading(false);        
    }
  }, [ocr, imgElementsSizes]);

  return isLoading;
}

const useMousePosition = () => {
    const positionRef = useRef({ x: 0, y: 0 });
    const updateMousePosition = (e: MouseEvent) => { 
      positionRef.current = { x: e.pageX, y: e.pageY };
    };

    window.addEventListener('mousemove', updateMousePosition);

    const interval = setInterval(() => {
      console.log('Mouse position:', positionRef.current);
    }, 1000);
  
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      clearInterval(interval);
    };
}

const timeoutPromise = (ms:number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));

const handleButtonDetailClick = (buttonElement: HTMLElement) => {
  buttonElement.click();
  console.log('button clicked');
};

// 시간 안에 찾지 못하면 없다고 판단.
const queryElementWithTimeout = async (selector:string, timeout:number) => {
  try {
    await Promise.race([
      new Promise(resolve => {
        const checkElement = () => {
          const element = document.querySelector(selector);
          if (element) {
            if (element instanceof HTMLElement && selector.indexOf('btn') > -1){
              handleButtonDetailClick(element);
            }
            resolve(element);
          }
          else setTimeout(checkElement, 100); // 100ms마다 재확인
        };
        checkElement();
      }),
      timeoutPromise(timeout)
    ]);
    console.log(`${selector} detected`);
    return true;
  } catch (error) {
    console.log(`${selector} not found within ${timeout}ms`);
    return false;
  }
};



export default function App() {
  
  const matchNvMid = useRef<string>('');
  const product = useRef<FetchedProductV1>(null);
  const ocr = useRef<FetchedOCRTopicV1>(null);
  const renderingCount = useRef<number>(0);  

  const [imgElementsSizes, setImgElementsSizes] = useState<ImageInfo[]>([]);
  
  const isLoading = useLoadingComplete(ocr, imgElementsSizes);
  renderingCount.current += 1;

  const processImage = (imgElement: HTMLImageElement, imageNumber:number) => {      
    return new Promise<ImageInfo>((resolve) => {
      imgElement.loading = 'eager';  
      if (imgElement.complete && imgElement.naturalWidth !== 0) {
        // 이미지가 이미 로드되었다면 바로 처리
        const res = processImageData(imgElement, imageNumber);
        resolve(res);
      } else {
        // 이미지 로드 완료를 기다림
        imgElement.onload = () => {
          const res = processImageData(imgElement, imageNumber);
          resolve(res);
        };
      }
    });
  };

  const processImageData = (imgElement: HTMLImageElement, imageNumber:number): ImageInfo => {
    // console.log('imgElement:', imgElement)
    // console.log('imgElement.width:', imgElement.width)
    // console.log('imgElement.naturalWidth:', imgElement.naturalWidth)
    const real2clientRatio = parseFloat((imgElement.width / imgElement.naturalWidth).toFixed(2));
    const extension = imgElement.src.split('.').pop()!;

    const rect = imgElement.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    // console.log("window.scrollX", window.scrollX, "window.scrollY", window.scrollY, "document.documentElement.scrollLeft", document.documentElement.scrollLeft, "document.documentElement.scrollTop", document.documentElement.scrollTop)

    const x = rect.left + scrollLeft;
    const y = rect.top + scrollTop;
    
    // console.log("imgElement x:", x, "imgElement y:", y)
    // console.log("imgElement.height", imgElement.height)
    const naturalHeight = parseFloat((imgElement.height * (1 / real2clientRatio)).toFixed(2));

    return {
      real2clientRatio,
      extension,
      x,
      y,
      naturalHeight,
      imageNumber: imageNumber
    };
  };

  const processImages = async (parentElement: HTMLElement) => {
    const imageElements = Array.from(parentElement.querySelectorAll('img'));      
    // const offsetParent = parentElement.offsetParent as HTMLElement;
    // console.log('offsetParent:', offsetParent)
    // const parentRect = offsetParent.getBoundingClientRect();        
    // console.log('parentRect:', parentRect)
    // const parentX = parseFloat((parentRect.left + window.scrollX).toFixed(2));
    // console.log('parentX:', parentX)
    // const parentY = parseFloat((parentRect.top + window.scrollY).toFixed(2));
    // console.log('parentY:', parentY)        
    // console.log('imageElements:', imageElements);
    const results:ImageInfo[] = [];

    for (let i = 0; i < imageElements.length; i++) {
      const imgElement = imageElements[i];
      const result = await processImage(imgElement as HTMLImageElement, i);      
      results.push(result);
    }
    setImgElementsSizes(prev => [...prev, ...results]);
    // checkLoadingComplete();                  
  }  

  // useMousePosition();

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
              // checkLoadingComplete();
              console.log("마지막 ocr 요소:", ocr.current?.[ocr.current?.length - 1]);
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
    
    const handleDetailFromBrand = async (detailFromBrand:HTMLElement) => {
        console.log('detailFromBrand detected');                                

        await Promise.all([
          queryElementWithTimeout('[class^="brandContent_export_atc__"]', 1000),
          queryElementWithTimeout('[class^="imageSpecInfo_btn_detail_more__"]', 1000)                  
        ]);     
                                      
        processImages(detailFromBrand);                
    }

    // 이미지 처리
  
    const initialDetailFromBrand = document.querySelector('[id^="detailFromBrand"]');
    // 이미 나타나있는 경우, observer 없이 바로 처리
    if (initialDetailFromBrand instanceof HTMLElement && ocr.current && product.current) {
      console.log('Already detailFromBrand detected');
      handleDetailFromBrand(initialDetailFromBrand);
    } else {
      // 나타나지 않은 경우, 나타날 때까지 감시
      console.log('init observer') // 주의: Observer가 생성되는 동안 initialDetailFromBrand가 나타나면 작동 안함.
      const targetNode = document.body; // 감시할 대상 노드 (body)
      const imageObserver = new MutationObserver(async (mutationsList, observer) => {      
        for (const mutation of mutationsList){        
          if (mutation.type === 'childList' || mutation.type === 'attributes') {          
            for (const node of Array.from(mutation.addedNodes)) {
              if (node instanceof HTMLElement) {              
                const detailFromBrand = node.querySelector('[id^="detailFromBrand"]')
                if (detailFromBrand instanceof HTMLElement) {
                  await handleDetailFromBrand(detailFromBrand);
                  observer.disconnect();
                }              
              }
            }
          }
        }
      });
  
      imageObserver.observe(targetNode, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['id'] 
      }); 
    
      return () => {
        imageObserver.disconnect();      
      };    
    }


    return () => {     
      console.log('App unmounted');
    };

  }, []);
    
  console.log("ocr 결과:", ocr.current);
  console.log("product 결과:", product.current);
  console.log('app.tsx 렌더링 횟수: ', renderingCount.current)    

  return (
    <>
      {!isLoading && ocr.current ?         
        <CustomTooltips ocrTopics={ocr.current} imgElementsSizes={imgElementsSizes}></CustomTooltips>
      : null}      
    </>
  );
}


