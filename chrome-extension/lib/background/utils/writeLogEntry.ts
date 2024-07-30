import { productStorage } from '@chrome-extension-boilerplate/storage/index';
import { getAccessToken, getUserId } from './auth';

interface LogJSONPayload {
    user_id: unknown;
    event_type: string;
    event_data: string | null;
    link: string | null;
    product: string | null;
    category: string | null;
    last_active_time: number | string | null;
  }

function utcToKst(utc: number): Date {
  const kstDate = new Date(utc + (9 * 60 * 60 * 1000));
  return kstDate;
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
        jsonPayload['last_active_time'] = new Date(lastActiveTime).toLocaleString();
      } else {
        jsonPayload['last_active_time'] = new Date().toLocaleString(); // If installed, log the time of installation
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
        console.log(`HTTP error! status: ${response.status}, body: ${await response.text()}`);
        throw new Error(`HTTP error! status: ${response.status}, body: ${await response.text()}`);      
      }
      const result = await response.json();
      if (result.error) {
        console.log(`Error writing log entry: ${result.error.message}`);
        throw new Error(`Error writing log entry: ${result.error.message}`);
      }      
      return result;

    } catch (error) {
      console.log(`Error writing log entry: ${error}`);
      throw new Error(`Error writing log entry: ${error}`);
    }    
  }
  
export { writeLogEntry };