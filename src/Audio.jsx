import {useEffect, useState} from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { useStorage } from "./useStorage";
import { saveToStorage } from './storageUtils';
import AlertMessage from "./AlertMessage";
import { Switch } from '@headlessui/react'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

class CustomFormData extends FormData {
    getHeaders() {
        return {}
    }
}

export default function Audio() {
    const [enabled, setEnabled] = useStorage('audio_enabled', true)
    const [apiKey, setApiKey] = useStorage("openai_api_key");
    const [transcriptions, setTranscriptions] = useStorage("audio_transcriptions", true, {});
    useEffect(() => {
        if (Object.entries(transcriptions).length > 0) {
            saveToStorage("audio_transcriptions", transcriptions, true);
        }
    }, [transcriptions]);
    useEffect(() => {
        if (enabled !== null) {
            saveToStorage("audio_enabled", enabled, true)
        }
    }, [enabled]);
    const [files, setFiles] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };
    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
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
    const transcribeAudio = async () => {
        if (!files) {
            alert('ファイルを選択してください。');
            return;
        }
        const configuration = new Configuration({
            apiKey: apiKey,
            formDataCtor: CustomFormData
        });
        const openai = new OpenAIApi(configuration);
        const processFile = async (file, promptText) => {
            try {
                setIsLoading(true);
                const response = await openai.createTranscription(file, "whisper-1", promptText);
                setTranscriptions((prevTranscriptions) => ({
                    ...prevTranscriptions,
                    [file.name]: response.data.text,
                }));
                return response.data.text;
            } catch (error) {
                console.error("エラーが発生しました: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (enabled) {
            // スピード重視モード (並列処理)
            await Promise.all(Array.from(files).map(file => processFile(file, prompt)));
        } else {
            // 品質重視モード (順次処理)
            let currentPrompt = prompt;
            for (const file of files) {
                currentPrompt = await processFile(file, currentPrompt);
            }
        }
    };
    return (
        <>
            <AlertMessage alertVisible={alertVisible} onClose={handleClose} />
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
                                            <input type="file" onChange={handleFileChange} multiple={true} />
                                        </div>
                                    </div>
                                    <div className="col-span-full">
                                        <Switch.Group as="div" className="flex items-center justify-between">
                                            <span className="flex flex-grow flex-col">
                                                <Switch.Label as="span" className="text-sm font-medium leading-6 text-gray-900" passive>Performance Mode</Switch.Label>
                                                <Switch.Description as="span" className="text-sm text-gray-500">
                                                    <p>ON：スピード重視モードです。選択したファイルを並列処理します。</p>
                                                    <p>OFF：品質重視モードです。選択したファイルを順番に処理します。</p>
                                                </Switch.Description>
                                            </span>
                                            <Switch
                                                checked={enabled}
                                                onChange={setEnabled}
                                                className={classNames(
                                                    enabled ? 'bg-indigo-600' : 'bg-gray-200',
                                                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
                                                )}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className={classNames(
                                                enabled ? 'translate-x-5' : 'translate-x-0',
                                                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                                                    )}
                                                />
                                            </Switch>
                                        </Switch.Group>
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
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                    ファイル名
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    文字起こし結果
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {Object.entries(transcriptions).map(([fileName, text]) => (
                                <tr key={fileName}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                        {fileName}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{truncateString(text, 30)}</td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                        <button onClick={() => copyToClipboard(text)} className="text-indigo-600 hover:text-indigo-900">
                                            Copy
                                        </button>
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
