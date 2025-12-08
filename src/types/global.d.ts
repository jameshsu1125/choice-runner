// src/types/global.d.ts

declare global {
    interface Window {
        version: string;
        appierOpen: () => void;
        APPIER_TriggerStoreView: () => void;
    }
}

// An empty export statement makes this file a module
export { };

