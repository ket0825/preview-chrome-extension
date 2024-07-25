import { BaseStorage, createStorage, StorageType } from './base';

export interface ProductData {
    category: string;
    lastActiveTime: number;
  }
  
export interface ProductStateMap {
    [product: string]: ProductData;
  }
  
class SharedStateManager {
    private storage: BaseStorage<ProductStateMap>;
  
    constructor() {
      this.storage = createStorage<ProductStateMap>(
        'productStates',
        {},
        {
          storageType: StorageType.Sync,
          liveUpdate: true,
        }
      );
    }
  
    async getProductState(product: string): Promise<ProductData> {
      const state = await this.storage.get();
      return state[product] || {category: null, lastActiveTime: null};
    }
  
    async getAllProductStates(): Promise<ProductStateMap> {
      return await this.storage.get();
    }
  
    async setProductState(product: string, data: Partial<ProductData>): Promise<void> {
      await this.storage.set((prevState) => ({
        ...prevState,
        [product]: {
          ...prevState[product],
          ...data,
          lastActiveTime: Date.now(),
        },
      }));
    }

    async removeProduct(product: string): Promise<void> {
        await this.storage.set((prevState) => {
          const newState = { ...prevState };
          delete newState[product];
          return newState;
        });
      }

    async removeAllProducts(callback:(obj:object) => void): Promise<void> {
      for (const product in await this.getAllProductStates()) {
        callback({
          
        })
        await this.removeProduct(product);
      }
    }
  
    subscribeToChanges(callback: () => void): () => void {        
      return this.storage.subscribe(callback);
    }
  
    getSnapshot(): ProductStateMap | null {
      return this.storage.getSnapshot();
    }


  }
  
  // 사용 예시
//   const sharedState = new SharedStateManager();
  
//   // 특정 제품의 상태 가져오기
//   sharedState.getProductState('productA').then((state) => {
//     console.log('Product A state:', state);
//   });
  
//   // 제품 상태 업데이트
//   sharedState.setProductState('productA', { category: 'Electronics' });
  
//   // 모든 제품 상태 가져오기
//   sharedState.getAllProductStates().then((states) => {
//     console.log('All product states:', states);
//   });
  
//   // 변경 구독
//   const unsubscribe = sharedState.subscribeToChanges(() => {
//     console.log('States changed:', sharedState.getSnapshot());
//   });
  
  // 나중에 구독 해제
//   unsubscribe();

// interface productStateMap{
//     [product: string] : {category: string, lastActiveTime: number}
// }

// const storage = createStorage<productStateMap>('product-storage-key', {}, {
//     storageType: StorageType.Local,
//     liveUpdate: true,
//     });

// export const productStorage: BaseStorage<productStateMap> & {
//     setStorage:(product, data)=>Promise<void>, 
//     getStorage:()=>Promise<productStateMap>,
// } = {
//     ...storage,
//     setStorage: async (product: string, data: {category: string, lastActiveTime: number}) => {
//         await storage.set((prevState) => ({
//             ...prevState,
//             [product]: {
//                 ...prevState[product],
//                 ...data,
//                 lastActiveTime: Date.now(),
//             },
//         }));
//     },
//     getStorage: async () => {
//         return await storage.get();
//     }

// }

export const productStorage = new SharedStateManager();