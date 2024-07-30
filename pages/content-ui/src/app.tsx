import { useEffect,  useRef, useState } from 'react';
import { FetchedProductV1 } from 'fetched-product-v1';
import { FetchedOCRTopicV1 } from 'fetched-ocr-topic-v1';
import CustomTooltips from './component/customTooltips';
import { ImageInfo } from 'image-info';
import { productStorage } from '@chrome-extension-boilerplate/shared/index';


const INTERVAL_TIME = 1 * 5 * 1000;
const INACTIVE_TIME = 5 * 60 * 1000;

type MouseEventFunction = (...args: MouseEvent[]) => void;

function MouseEventThrottle<T extends MouseEventFunction>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan: number;

  return function(this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}


const timeoutPromise = (ms:number) => new Promise(
  (_, reject) => setTimeout(
    () => reject(new Error('Timeout')), ms));

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
  const positionRef = useRef({ x: 0, y: 0 });
  const intervalRef = useRef<number | null>(null);

  const [imgElementsSizes, setImgElementsSizes] = useState<ImageInfo[]>([]);
  const [productReady, setProductReady] = useState<boolean>(false);
  const [ocrReady, setOcrReady] = useState<boolean>(false);
  
  renderingCount.current += 1;

  const handleMouseMove = MouseEventThrottle((e: MouseEvent) => {        
    if (updateMousePosition(e)) {     
      productStorage.getProductState(product.current!.prid).then((data) => {
        if (data.lastActiveTime === null || data.category === null) {                    
           // write active log    
          chrome.runtime.sendMessage({
            action: 'writeLog',
            event_data: null,
            event_type: 'active',
            link: null,
            product: product.current!.prid,                
          }, (response) => {
            if (response.success) {
              console.log(`active log written`);
            } else {
              console.error(response.error);
            }
          });   
        }
      });

      // storage에 저장 혹은 갱신.
      productStorage.setProductState(product.current!.prid, product.current!.caid)
        .then(() => {
        console.log(`product ${product.current?.name} lastActiveTime renewed`);
        
        if (intervalRef.current === null) {
          console.log('start monitoring...');
          startMonitoring();    
        }                
      });
    }
  }, 5000); // 5초에 한 번만 실행. 이 부분 OK.  

  const updateMousePosition = (e: MouseEvent) => {
        if (e.pageX === positionRef.current.x 
          && e.pageY === positionRef.current.y) {
          return false;
        }
    
        positionRef.current = { x: e.pageX, y: e.pageY };
        return true;
      };

  const startMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    intervalRef.current = setInterval(() => {        
      productStorage.getProductState(product.current!.prid).then((data) => {      
        if (Date.now() - data.lastActiveTime >= INACTIVE_TIME && data.lastActiveTime !== null) {
            chrome.runtime.sendMessage({
              action: 'writeLog',
              event_data: null,
              event_type: 'inactive',
              link: null,
              product: product.current!.prid,                
            }, (response) => {
              if (response.success) {
                console.log('inactive log written');
              } else {
                console.error(response.error);
              }
            });          
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            intervalRef.current = null
          } else {              
            if (data.lastActiveTime !== null) {
              console.log(`NOT REMOVED: time elapsed: ${Date.now() - data?.lastActiveTime}`); // null일 때는 date.now()로 나옴.
            }
          }            
        });
      }, INTERVAL_TIME) // 5초마다 마우스 위치 갱신      
       
  }

  // const handleTabActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
  //   try {
  //     if (product.current && ocr.current) {
  //       productStorage.getProductState(product.current!.prid).then((data) => {
  //         if (!data.lastActiveTime) {
  //           productStorage.setProductState(product.current!.prid).then(() => {
  //             console.log(`product ${product.current?.name} lastActiveTime renewed`);
  //           });
  //           startMonitoring();
  //         } else {
  //           productStorage.setProductState(product.current!.prid).then(() => {
  //             console.log(`product ${product.current?.name} lastActiveTime extended`);
  //           });
  //         }        
  //       });  
  //     }      
  //   } catch (error) {
  //     console.log('Error:', error, "product.current:", product.current, "ocr.current:", ocr.current);
  //   }
    
  // }

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
      if (!productReady && !ocrReady) {

        chrome.runtime.sendMessage({
          action: 'fetchProduct',
          match_nv_mid: matchNvMid.current,
        },
        (response) => {
          console.log(`response.url: ${response.url}`);
          if (response.success 
            && response.data 
            && response.data.length > 0 
            && Array.isArray(response.data)) { // TODO: API improvement required.          
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
                setProductReady(true);
                setOcrReady(true);
                console.log("마지막 ocr 요소:", ocr.current?.[ocr.current?.length - 1]);              
              } else if (response.error) {
                console.error(response.error, response.url, response.prid);
                console.log('ERROR: OCR 데이터가 없습니다.');    
                setProductReady(true);              
              }
            });                  
          } else if (response.error) {
            console.error(response.error, response.url);  
            console.log('DB에 없습니다?');   
          } else {
            console.log('DB에 없습니다.');
          }        
        });
          }
        }
          
    fetchData();
  
    if (!productReady && !ocrReady) {
      console.log('No ocr or product data, rerendering...');
      return;
    } else {
      console.log('ocr and product data detected!');
    }
    
    document.addEventListener('mousemove', handleMouseMove); 

    productStorage.getAllProductStates().then((data) => {
      console.log('product states 확인:', data);    
    });      

    // chrome.tabs.onActivated.addListener(handleTabActivated);

    return () => {
      // chrome.tabs.onActivated.removeListener(handleTabActivated);      
      document.removeEventListener('mousemove', handleMouseMove);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);        
      }
      console.log('App unmounted');
    }
  }, [productReady, ocrReady]);

  // useEffect 부분 분리한 이후로 재렌더링 되지 않고 있음. 원래 재랜더링 되는 부분은 이제 보니 setImgInfo 부분이었던 듯.
  useEffect(() => {

    if (!productReady && !ocrReady) {
      console.log('No ocr or product data: image processing skipped');
      return ;
    } else {
      console.log('ocr detected!: go image processing')
    }             
    
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

  }, [productReady, ocrReady]);
    
  // console.log("ocr 결과:", ocr.current);
  // console.log("product 결과:", product.current);
  console.log('app.tsx 렌더링 횟수: ', renderingCount.current)    

  const isLoading = productReady ? ocrReady ? false : true : true;
  console.log(`isLoading: ${isLoading}, productReady: ${productReady}, ocrReady: ${ocrReady}`);

  return (
    <>
      {!isLoading && ocr.current ?         
        <CustomTooltips ocrTopics={ocr.current} imgElementsSizes={imgElementsSizes}></CustomTooltips>
      : null}      
    </>
  );
}


