import { useState, useEffect } from 'react';

const Settings = () => {
    const [apiKey, setApiKey] = useState('');
    useEffect(() => {
        if (chrome.storage) {
            chrome.storage.local.get('openai_api_key', (data) => {
                if (data.openai_api_key) {
                    setApiKey(data.openai_api_key);
                }
            });
        } else {
            const storedApiKey = localStorage.getItem('openai_api_key');
            if (storedApiKey) {
                setApiKey(storedApiKey);
            }
        }
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (chrome.storage) {
            chrome.storage.local.set({ openai_api_key: apiKey }, () => {
                alert('APIキーを保存しました');
            });
        } else {
            localStorage.setItem('openai_api_key', apiKey);
            alert('APIキーが保存されました')
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Set your API key</h3>
                <form className="mt-5 sm:flex sm:items-center" onSubmit={handleSubmit}>
                    <div className="w-full sm:max-w-xs">
                        <label htmlFor="apiKey" className="sr-only">
                            OpenAI API Key
                        </label>
                        <input
                            id="apiKey"
                            type="text"
                            value={apiKey}
                            className="!outline-none block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="sk-xxxxxxxx"
                            onChange={(event) => setApiKey(event.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
                    >
                        Save
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
