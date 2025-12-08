export function openUrl() {
    try {
        window.appierOpen();
    } catch (error) {
        console.error("Error opening URL:", error);
    }
}

export function openStoreUrl() {
    try {
        window.APPIER_TriggerStoreView();
    } catch (error) {
        console.error("Error opening store URL:", error);
    }
}
