import { useState, useEffect } from "react";

export function useStorage(key, isJSON = false, initialValue = null) {
    const [data, setData] = useState(initialValue);

    useEffect(() => {
        const fetchData = async () => {
            if (chrome.storage) {
                chrome.storage.local.get(key, (result) => {
                    if (result[key]) {
                        if (isJSON) {
                            setData(JSON.parse(result[key]));
                        } else {
                            setData(result[key]);
                        }
                    }
                });
            } else {
                const storedData = localStorage.getItem(key);
                if (storedData) {
                    if (isJSON) {
                        setData(JSON.parse(storedData));
                    } else {
                        setData(storedData);
                    }
                }
            }
        };
        fetchData();
    }, [key, isJSON]);

    return [data, setData];
}
