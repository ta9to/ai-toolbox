import React, {useState} from "react";
import { Configuration, OpenAIApi } from 'openai';
import { useStorage } from "./useStorage";
import { saveToStorage } from "./storageUtils.js";
import {
    Input,
    Button,
    Image,
    Skeleton,
} from "@nextui-org/react";
import {
    ArrowDownOnSquareIcon,
} from '@heroicons/react/24/outline'

export default function Images() {
    const [apiKey, setApiKey] = useStorage("openai_api_key");
    const [isLoading, setIsLoading] = useState(false);
    const [prompt, setPrompt] = useStorage("image_prompt", false, "A painting of a cat sitting on a chair.");
    const [n, setN] = useState(1);
    const [size, setSize] = useState("256x256");
    const [imageUrls, setImageUrls] = useStorage("image_urls", true, []);
    const generateImage = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (apiKey) {
            const configuration = new Configuration({
                apiKey: apiKey,
            });
            const openai = new OpenAIApi(configuration);
            const createImageRequest = {
                prompt: prompt,
                n: parseInt(n),
                size: size,
            };
            const response = await openai.createImage(createImageRequest);
            const imageUrls = response.data.data.map((imageData) => imageData.url);
            saveToStorage('image_urls', imageUrls, true);
            setImageUrls(imageUrls);
        } else {
            alert('Set the OpenAI API key from the Settings tab.');
        }

        setIsLoading(false);
    };
    const downloadImage = (imageUrl) => {
        const parsedUrl = new URL(imageUrl);
        const queryParams = new URLSearchParams(parsedUrl.search);
        const sig = queryParams.get('sig');
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
    return (
        <>
            <form onSubmit={generateImage}>
                <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-base font-semibold leading-7">Create image</h2>
                    <p className="mt-1 text-sm leading-6">
                        Creates an image given a prompt.
                    </p>
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        <div className="col-span-full">
                            <Input
                                type="text"
                                label="Prompt"
                                placeholder="An Impressionist oil painting of sunflowers in a purple vase…"
                                description="A text description of the desired image(s). The maximum length is 1000 characters."
                                isRequired
                                value={prompt}
                                onChange={(event) => setPrompt(event.target.value)}
                                maxLength="1000"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <Input
                                type="number"
                                label="n"
                                min="1"
                                max="10"
                                defaultValue="1"
                                description="The number of images to generate. Must be between 1 and 10."
                                value={n}
                                onChange={(event) => setN(event.target.value)}
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <Input
                                type="text"
                                label="size"
                                placeholder="256x256"
                                description="The size of the generated images. Must be one of 256x256, 512x512, or 1024x1024."
                                list="size"
                                value={size}
                                onChange={(event) => setSize(event.target.value)}
                            />
                            <datalist id="size">
                                <option value="256x256" />
                                <option value="512x512" />
                                <option value="1024x1024" />
                            </datalist>
                        </div>

                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <Button
                        type="submit"
                        color="primary"
                        isLoading={isLoading}
                    >
                        {isLoading ? 'Generating...' : 'Generate'}
                    </Button>
                </div>

            </form>

            <ul role="list" className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
                {imageUrls.length === 0 && (
                    <>
                        <li className="relative"><Skeleton className="rounded-lg"><div className="h-48 rounded-lg bg-default-300"></div></Skeleton></li>
                        <li className="relative"><Skeleton className="rounded-lg"><div className="h-48 rounded-lg bg-default-300"></div></Skeleton></li>
                        <li className="relative"><Skeleton className="rounded-lg"><div className="h-48 rounded-lg bg-default-300"></div></Skeleton></li>
                    </>
                )}
                {imageUrls.map((url, index) => (
                    <li key={url} className="relative">
                        <Image
                            isZoomed
                            src={url}
                        />
                        <Button
                            isIconOnly
                            size="sm"
                            color="secondary"
                            onClick={() => downloadImage(url)}
                            className="absolute top-0 right-0 m-2 focus:outline-none z-10"
                            aria-label="Download"
                        >
                            <ArrowDownOnSquareIcon className="h-6 w-6" />
                        </Button>
                    </li>
                ))}
            </ul>
        </>
    )
}
