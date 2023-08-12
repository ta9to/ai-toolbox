import {useEffect, useState} from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { useStorage } from "./useStorage";
import { saveToStorage } from "./storageUtils.js";
class CustomFormData extends FormData {
    getHeaders() {
        return {}
    }
}
function getSigValue(url) {
    const parsedUrl = new URL(url);
    const queryParams = new URLSearchParams(parsedUrl.search);
    return queryParams.get('sig');
}

export default function Images() {
    const [apiKey, setApiKey] = useStorage("openai_api_key");
    const [images, setImages] = useStorage("image_urls", true, []);
    const [prompt, setPrompt] = useStorage("image_prompt", false, "A painting of a cat sitting on a chair.");
    const [isLoading, setIsLoading] = useState(false);

    const handlePromptChange = (e) => {
        saveToStorage('image_prompt', e.target.value);
        setPrompt(e.target.value);
    };
    const downloadImage = (imageUrl) => {
        const sig = getSigValue(imageUrl)
        const filename = `image-${sig}.png`;
        if (chrome.downloads) {
            chrome.downloads.download({
                url: imageUrl,
                filename: filename,
            });
        } else {
            console.log(filename);
        }
    };
    const exec = async (event) => {
        event.preventDefault();
        if (!prompt) {
            alert('プロンプトを入力してください。');
            return;
        }
        const configuration = new Configuration({
            apiKey: apiKey,
            formDataCtor: CustomFormData
        });
        const openai = new OpenAIApi(configuration);
        const createImageRequest = {
            'prompt': prompt,
            'n': 3,
        };
        setIsLoading(true);
        try {
            const response = await openai.createImage(createImageRequest);
            const imageUrls = response.data.data.map((imageData) => imageData.url);
            saveToStorage('image_urls', imageUrls, true);
            setImages(imageUrls);
        } catch (error) {
            console.error('エラーが発生しました: ', error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="pb-12 mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl">
                <form>
                    <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12">
                            <h2 className="text-base font-semibold leading-7 text-gray-900">Images - Create image</h2>
                            <p className="mt-1 text-sm leading-6 text-gray-600">テキストから画像生成するやつ</p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-4">
                                    <label htmlFor="prompt" className="block text-sm font-medium leading-6 text-gray-900">
                                        Prompt
                                    </label>
                                    <div className="mt-2">
                                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                                            <input
                                                type="text"
                                                name="prompt"
                                                id="prompt"
                                                value={prompt}
                                                onChange={handlePromptChange}
                                                className="!outline-none block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 px-3 sm:py-1.5 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={exec}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            実行
                        </button>
                    </div>

                </form>
                {isLoading && (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500 mx-auto mt-4"></div>
                )}
                <div className="col-span-full mt-2">
                    <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                        {images.map((url, index) => (
                            <li key={index} className="relative">
                                <div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                                    <img src={url} alt="" className="pointer-events-none object-cover group-hover:opacity-75" />
                                </div>
                                <button onClick={() => downloadImage(url, index)} type="button" className="mt-1 w-full rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Download</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
