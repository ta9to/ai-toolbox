export function saveToStorage(key, value, isJSON = false) {
    if (chrome.storage) {
        chrome.storage.local.set({ [key]: isJSON ? JSON.stringify(value) : value });
    } else {
        localStorage.setItem(key, isJSON ? JSON.stringify(value) : value);
    }
}
