import {useEffect, useState} from 'react';
import { Configuration, OpenAIApi } from 'openai';
class CustomFormData extends FormData {
    getHeaders() {
        return {}
    }
}

export default function Audio() {
    const [apiKey, setApiKey] = useState('');
    useEffect(() => {
        if (chrome.storage) {
            chrome.storage.local.get('openai_api_key', (data) => {
                if (data.openai_api_key) {
                    setApiKey(data.openai_api_key)
                }
            });
            chrome.storage.local.get('translated_text', (data) => {
                if (data.translated_text) {
                    setTranscription(data.translated_text)
                }
            });
        } else {
            const storedApiKey = localStorage.getItem('openai_api_key');
            if (storedApiKey) {
                setApiKey(storedApiKey)
            }
            const translatedText = localStorage.getItem('translated_text');
            if (translatedText) {
                setTranscription(translatedText)
            }
        }
    }, []);
    const [file, setFile] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [transcription, setTranscription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };
    const transcribeAudio = async () => {
        if (!file) {
            alert('ファイルを選択してください。');
            return;
        }
        const configuration = new Configuration({
            apiKey: apiKey,
            formDataCtor: CustomFormData
        });
        const openai = new OpenAIApi(configuration);
        setIsLoading(true);
        try {
            const response = await openai.createTranscription(file, 'whisper-1', prompt);
            if (chrome.storage) {
                chrome.storage.local.set({ translated_text: response.data.text });
            } else {
                localStorage.setItem('translated_text', response.data.text);
            }
            setTranscription(response.data.text);
        } catch (error) {
            console.error('エラーが発生しました: ', error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <form>
                    <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12">
                            <h2 className="text-base font-semibold leading-7 text-gray-900">Audio - Create transcription</h2>
                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                音声ファイルを文字起こしするやつ
                            </p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                                <div className="col-span-full">
                                    <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900">
                                        File
                                    </label>
                                    <div className="mt-2 flex items-center gap-x-3">
                                        <input type="file" onChange={handleFileChange} />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={transcribeAudio}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            文字起こし実行
                        </button>
                    </div>

                </form>
                {isLoading && (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500 mx-auto mt-4"></div>
                )}
                <div className="col-span-full pb-12">
                    <label htmlFor="result" className="block text-sm font-medium leading-6 text-gray-900">
                        Result
                    </label>
                    <div className="mt-2">
                <textarea
                    id="result"
                    name="result"
                    rows={10}
                    className="!outline-none block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:py-1.5 px-3 sm:text-sm sm:leading-6"
                    value={transcription}
                    readOnly
                />
                    </div>
                </div>
            </div>
        </div>
    )
}
