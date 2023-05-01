import {useEffect, useState} from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { useStorage } from "./useStorage";
import { saveToStorage } from './storageUtils';
import AlertMessage from "./AlertMessage";
import { readString } from "react-papaparse";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

class CustomFormData extends FormData {
    getHeaders() {
        return {}
    }
}

export default function Audio() {
    const [apiKey, setApiKey] = useStorage("openai_api_key");
    const [embeddings, setEmbeddings] = useStorage("embeddings_index", true, []);
    useEffect(() => {
        if (embeddings.length > 0) {
            saveToStorage("embeddings_index", embeddings, true);
        }
    }, [embeddings]);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };
    const [alertVisible, setAlertVisible] = useState(false);
    const handleClose = () => {
        setAlertVisible(false);
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

            const configuration = new Configuration({
                apiKey: apiKey,
                formDataCtor: CustomFormData,
            });
            const openai = new OpenAIApi(configuration);
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
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <form>
                        <div className="space-y-12">
                            <div className="border-b border-gray-900/10 pb-12">
                                <h2 className="text-base font-semibold leading-7 text-gray-900">Embeddings - Create embeddings</h2>
                                <p className="mt-1 text-sm leading-6 text-gray-600">
                                    ここで登録した情報はChat機能で活用されます
                                </p>

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
