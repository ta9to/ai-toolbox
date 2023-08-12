import {useEffect, useState} from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { useStorage } from "./useStorage";
import { saveToStorage } from './storageUtils';
import AlertMessage from "./AlertMessage";
import { readString } from "react-papaparse";
import * as math from 'mathjs';
import {
    FaceFrownIcon,
    FaceSmileIcon,
    FireIcon,
    HandThumbUpIcon,
    HeartIcon,
    XMarkIcon
} from "@heroicons/react/20/solid/index.js";
import {OpenAIExt} from "openai-ext";

function cosineSimilarity(a, b) {
    return math.dot(a, b) / (math.norm(a) * math.norm(b));
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

class CustomFormData extends FormData {
    getHeaders() {
        return {}
    }
}

export default function Audio() {
    const [currentResponse, setCurrentResponse] = useState("");
    const [chatPrompt, setChatPrompt] = useStorage("chat_prompt", false, '');
    const [query, setQuery] = useState("");
    const [apiKey, setApiKey] = useStorage("openai_api_key");
    const [embeddings, setEmbeddings] = useStorage("embeddings_index", true, []);
    const [faqs, setFaqs] = useStorage("embeddings_faqs", true, []);
    useEffect(() => {
        if (embeddings.length > 0) {
            saveToStorage("embeddings_index", embeddings, true);
        }
    }, [embeddings]);
    useEffect(() => {
        if (faqs.length > 0) {
            saveToStorage("embeddings_faqs", faqs, true);
        }
    }, [faqs]);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    const [alertVisible, setAlertVisible] = useState(false);
    const handleClose = () => {
        setAlertVisible(false);
    };
    const configuration = new Configuration({
        apiKey: apiKey,
        formDataCtor: CustomFormData,
    });
    const openai = new OpenAIApi(configuration);
    const streamConfig = {
        apiKey: apiKey, // Your API key
        handler: {
            // Content contains the string draft, which may be partial. When isFinal is true, the completion is done.
            onContent(content, isFinal, xhr) {
                setCurrentResponse(content);
                if (isFinal) {
                    const response = {'question': query, 'answer': content};
                    setFaqs([response, ...faqs]);
                    setQuery("")
                    setCurrentResponse("");
                }
            },
            onDone(xhr) {
                console.log("Done!");
            },
            onError(error, status, xhr) {
                console.error(error);
            },
        },
    };
    const handleSearch = async (event) => {
        event.preventDefault();
        if (query.trim() === "") {
            alert("質問を入力してください。");
            return;
        }
        try {
            setIsLoading(true);
            // 入力された質問のベクトルを取得
            const questionEmbeddingResponse = await openai.createEmbedding({
                model: "text-embedding-ada-002",
                input: query,
            });
            const questionEmbedding = questionEmbeddingResponse.data.data[0].embedding;

            // 類似度を計算し、最も類似度が高いrowを見つける
            let bestSimilarity = -1;
            let bestMatchIndex = -1;
            embeddings.forEach((embedding, index) => {
                const similarity = cosineSimilarity(embedding.embedding, questionEmbedding);
                if (similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    bestMatchIndex = index;
                }
            });
            console.log("bestMatchIndex: ", embeddings[bestMatchIndex].originalRow);
            const userContent = `Use the below article to answer the subsequent question. If the answer cannot be found, write "I don't know."

Article:
\"\"\"
${embeddings[bestMatchIndex].originalRow.join(' ')}
\"\"\"

Question: ${query}
`;
            const systemMessage = { role: "system", content: chatPrompt};
            const userMessage = { role: "user", content: userContent};
            const xhr = OpenAIExt.streamClientChatCompletion(
                {
                    model: "gpt-3.5-turbo",
                    messages: [systemMessage, userMessage],
                },
                streamConfig
            );
        } catch (error) {
            console.error("エラーが発生しました: ", error);
        } finally {
            setIsLoading(false);
        }
    };
    const copyToClipboard = (text) => {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setAlertVisible(true);
        setTimeout(() => {
            setAlertVisible(false);
        }, 3000);
    };
    function truncateString(str, maxLength) {
        if (str.length > maxLength) {
            return str.slice(0, maxLength) + '...';
        } else {
            return str;
        }
    }
    const handleReset = () => {
        const confirmReset = window.confirm("FAQの履歴をリセットしてもよろしいですか？");
        if (confirmReset) {
            setFaqs([]);
            saveToStorage("embeddings_faqs", [], true);
        }
    };
    const exec = async () => {
        if (!file) {
            alert('ファイルを選択してください。');
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
            const parsedCSV = readString(content, { header: false });
            if (parsedCSV.errors.length > 0) {
                alert("CSVファイルの読み込みに失敗しました。");
                return;
            }
            const combinedTexts = parsedCSV.data.map((row) => row.join(" "));
            try {
                setIsLoading(true);
                const createEmbeddingRequest = {
                    model: "text-embedding-ada-002",
                    input: combinedTexts,
                };
                const response = await openai.createEmbedding(createEmbeddingRequest);
                const mergedData = response.data.data.map((embedding, index) => ({
                    ...embedding,
                    originalRow: parsedCSV.data[index],
                }));
                setEmbeddings(mergedData);
            } catch (error) {
                console.error("エラーが発生しました: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
    };
    return (
        <>
            <AlertMessage alertVisible={alertVisible} onClose={handleClose} />
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto max-w-3xl">
                    <form>
                        <div className="space-y-12">
                            <div className="border-b border-gray-900/10 pb-12">
                                <h2 className="text-base font-semibold leading-7 text-gray-900">Embeddings - Create embeddings</h2>
                                <p className="flex mt-1 text-sm leading-6 text-gray-600">
                                    Question answering using embeddings-based search
                                </p>

                                {embeddings.length > 0 && (
                                    <div>
                                        <div>
                                            <div className="mt-6 flex">
                                                <input
                                                    className="!outline-none px-3 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                    placeholder="Query"
                                                    value={query}
                                                    onChange={(e) => setQuery(e.target.value)}
                                                />
                                                <button
                                                    className="ml-4 flex-shrink-0 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                    onClick={handleSearch}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-10">
                                            <dl className="space-y-10">
                                                {currentResponse && (
                                                    <div>
                                                        <dt className="text-base font-semibold leading-7 text-gray-900">{query}</dt>
                                                        <dd className="mt-2 text-base leading-7 text-gray-600">{currentResponse}</dd>
                                                    </div>
                                                )}
                                                {faqs.map((faq, index) => (
                                                    <div key={index}>
                                                        <dt className="text-base font-semibold leading-7 text-gray-900">{faq.question}</dt>
                                                        <dd className="mt-2 text-base leading-7 text-gray-600">{faq.answer}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                                    <div className="col-span-full">
                                        <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900">
                                            CSV
                                        </label>
                                        <div className="mt-2 flex items-center gap-x-3">
                                            <input type="file" onChange={handleFileChange} multiple={true} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-x-6">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                FAQリセット
                            </button>
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
                    <div className="col-span-full pb-12">
                        <label htmlFor="result" className="block text-sm font-medium leading-6 text-gray-900">
                            Result
                        </label>
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">#</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">raw</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">vector</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {embeddings.map((embedding, index) => (
                                <tr key={index}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0"> {index} </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {truncateString(embedding.originalRow.join(", "), 20)} {/* 元のCSVデータを表示 */}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {truncateString(embedding.embedding.join(", "), 20)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}
