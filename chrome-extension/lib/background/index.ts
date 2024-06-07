import 'webextension-polyfill';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';


exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded');
console.log("Edit 'apps/chrome-extension/lib/background/index.ts' and save to reload.");
  
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchProduct') {
    const match_nv_mid: string = request.match_nv_mid;
    const apiUrl:string = import.meta.env.VITE_API_URL

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
  if (request.action === 'fetchOCR'){
    const type:string = request.type // 'OT0'
    const prid:string = request.prid
    const apiUrl:string = import.meta.env.VITE_API_URL
    let url = `${apiUrl}/api/topic`
    url += `?type=${type}&prid=${prid}`
      
    fetch(url)
    .then(response => response.json())
    .then(data => {
      sendResponse({ success: true, data: data, url: url, prid: prid });
    })
    .catch(error => {
      sendResponse({ success: false, error: error.message, url: url, prid: prid});
    });    
      return true;    
    }
    return false;
  })

  

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchReview'){
    const type:string = request.type // 'OT0'
    const prid:string = request.prid
    const apiUrl:string = import.meta.env.VITE_API_URL
    let url = `${apiUrl}/api/topic`
    url += `?type=${type}&prid=${prid}`
      
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
