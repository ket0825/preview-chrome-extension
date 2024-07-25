import 'webextension-polyfill';
import { getAccessToken, getUserId } from './utils/auth';
import { productStorage } from '@chrome-extension-boilerplate/storage/index';



console.log('background loaded');
console.log("Edit 'apps/chrome-extension/lib/background/index.ts' and save to reload.");

interface LogJSONPayload {
  user_id: unknown;
  event_type: string;
  event_data: string | null;
  link: string | null;
  product: string | null;
  category: string | null;
  last_active_time: number | null;
}

async function writeLogEntry(obj: 
  {
    event_type:string, 
    event_data:string | null, 
    link:string | null, 
    product:string | null
  }) {
  try {
    const token = await getAccessToken();
    const userId = await getUserId();    
    const projectId = 'webserver-project-425817';
    const url = `https://logging.googleapis.com/v2/entries:write`;
    
    const jsonPayload:LogJSONPayload = {
      user_id: userId,
      event_type: obj.event_type,
      event_data: obj.event_data,
      link: obj.link,
      product: obj.product,  
      category: null,
      last_active_time: null,    
    }

    if (obj.product !== null) {
      const {category, lastActiveTime} = await productStorage.getProductState(obj.product);    
      jsonPayload['category'] = category;
      jsonPayload['last_active_time'] = lastActiveTime;
    }
    
    const body = JSON.stringify({
      entries: [{
        severity: 'INFO', // 'DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY'        
        jsonPayload: jsonPayload,
        logName: `projects/${projectId}/logs/user_log`,
        resource: {
          type: 'global', // 'global' for not associated with a specific resource. https://cloud.google.com/logging/docs/api/v2/resource-list                    
          // default - labels: {resource.labels.project_id: projectId}          
        },
        labels: {
          extension_id: chrome.runtime.id,          
        },        
      }]
    });       

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${await response.text()}`);      
    }
    const result = await response.json();
    if (result.error) {
      throw new Error(`Error writing log entry: ${result.error.message}`);
    }
  } catch (error) {
    throw new Error(`Error writing log entry: ${error}`);
  }
}


// Example usage
// chrome.runtime.onInstalled.addListener(() => {
//   writeLogEntry({
//     event_type:'install', 
//     event_data: null, 
//     link: null,
//     product: null
//     });
// });

// You can also expose a method for other parts of your extension to use
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'writeLog') {
    writeLogEntry({
      event_data: message.event_data, 
      event_type: message.event_type, 
      link: message.link, 
      product: message.product
    });
    sendResponse({success: true});
  }
  return true;
});

// tab onUpdated.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log(`Tab ${tabId} has completed loading: ${tab.url}`);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(`Tab ${activeInfo.tabId} has been activated`);  
});

chrome.tabs.onRemoved.addListener((tabId) => {
  console.log(`Tab ${tabId} has been removed`);
  // console.log(`Remove Info: ${removeInfo}`); // 창 자체가 닫히는 것을 확인하기 위함. 그 외에는 필요 없음.
});

chrome.tabs.onRemoved,  // 탭이 닫힐 때 실행.
chrome.tabs.onUpdated,  // 탭이 업데이트될 때 실행.
chrome.tabs.onCreated,  // 탭이 생성될 때 실행.
chrome.tabs.onActivated,  // 활성 탭 변경시 실행.
chrome.tabs.onAttached, // 탭이 창 간에 이동될 때 실행, 
chrome.tabs.onDetached, // 탭이 창에서 분리될 때 실행. 창간에 이동될 때 실행.
chrome.tabs.onHighlighted, // 탭이 강조 표시되거나 선택된 탭이 변경되면 실행.
chrome.tabs.onMoved, // 탭 창 내에서 이동할 때.



// https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=ko#event-onRemoved

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchProduct') {
    const match_nv_mid: string = request.match_nv_mid;
    const apiUrl: string = import.meta.env.VITE_API_URL

    let url = `${apiUrl}/api/product`;
    url += `?match_nv_mid=${match_nv_mid}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        sendResponse({ success: true, data: data, url: url });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message, url: url });
      });

    return true;
  }
  return false;
});

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
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message, url: url, prid: prid });
      });
    return true;
  }
  return false;
})


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


