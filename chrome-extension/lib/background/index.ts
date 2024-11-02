import 'webextension-polyfill';
import { productStorage } from '@chrome-extension-boilerplate/storage/index';
import { writeLogEntry } from './utils/writeLogEntry';

console.log('background loaded');

// Storage 초기화 함수
const clearProductStorage = async () => {
  try {
    const states = await productStorage.getAllProductStates();
    for (const product in states) {
      // inactive 로그 기록
      await writeLogEntry({
        event_type: 'inactive',
        event_data: null,
        link: null,
        product: product
      });
    }

    productStorage.removeAllProducts(writeLogEntry).then(() => {
      console.log('Product storage has been cleared');
    });

  } catch (error) {
    console.error('Error while clearing product storage:', error);
  }
};

// 설치 시, 로그 기록
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('onInstalled', details.reason);
  switch (details.reason) {
    case 'install':
      // 신규 설치 시
      await writeLogEntry({
        event_type: 'install',
        event_data: null,
        link: null,
        product: null
      });
      break;

    case 'update':
      // 업데이트 시
      await writeLogEntry({
        event_type: 'update',
        event_data: null,
        link: null,
        product: null
      });
      await clearProductStorage();
      break;

    case 'chrome_update':
    case 'shared_module_update':
      // 크롬 업데이트나 공유 모듈 업데이트 시
      break;

    default:
      // reload 등 기타 경우
      console.log('Clearing product storage due to extension reload/restart');
      await clearProductStorage();
  }
});

// writeLog listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'writeLog') {
    writeLogEntry({
      event_data: message.event_data,
      event_type: message.event_type,
      link: message.link,
      product: message.product
    }).then((result) => {

      console.log(`result: ${result}`);
      if (message.event_type === 'inactive') {
        productStorage.removeProduct(message.product);
      }
    });
    sendResponse({ success: true });
  }
  return true;
});

// Extension suspend 시, 모든 product 삭제 및 로그 기록
chrome.runtime.onSuspend.addListener(() => {
  console.log('The extension has been suspended');
  productStorage.removeAllProducts(writeLogEntry).then(() => {
    console.log('All products have been removed');
  }
  );
});

// FetchProduct request listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchProduct') {
    const match_nv_mid: string = request.match_nv_mid;
    const apiUrl: string = import.meta.env.VITE_API_URL

    let url = `${apiUrl}/api/product`;
    url += `?match_nv_mid=${match_nv_mid}`;

    fetch(url)
      .then(response => response.json())
      .catch(error => {
        console.log(`error case_ JSON이 아닌 text/html인 경우: ${JSON.stringify(error)}, ${JSON.stringify(typeof error)}`)
        sendResponse({ success: false, error: error.message, url: url });
      })
      .then(data => {
        // console.log(`data: ${JSON.stringify(data)}, ${JSON.stringify(typeof data)}`)
        sendResponse({ success: true, data: data, url: url });
        // TODO: API improvement by status code 204.
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message, url: url });
      });

    return true;
  }
  return false;
});

// FetchOCR request listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchOCR') {
    const type: string = request.type // 'OT0'
    const prid: string = request.prid
    const apiUrl: string = import.meta.env.VITE_API_URL
    let url = `${apiUrl}/api/topic`
    url += `?type=${type}&prid=${prid}`

    fetch(url)
      .then(response => response.json())
      .then(data => {
        sendResponse({ success: true, data: data, url: url, prid: prid });
        console.log(`data: ${JSON.stringify(data)}, ${JSON.stringify(typeof data)}`)
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message, url: url, prid: prid });
      });
    return true;
  }
  return false;
})

// FetchReview request listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchReview') {
    const type: string = request.type // 'RT0'
    const prid: string = request.prid
    const topic_code: string = request.topic_code
    const apiUrl: string = import.meta.env.VITE_API_URL
    let url = `${apiUrl}/api/topic`
    url += `?type=${type}&prid=${prid}&topic_code=${topic_code}`

    fetch(url)
      .then(response => response.json())
      .then(data => {
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  return false;
})


