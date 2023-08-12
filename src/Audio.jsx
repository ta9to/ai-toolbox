import React, {useEffect, useState} from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { useStorage } from "./useStorage";
import { saveToStorage } from './storageUtils';
class CustomFormData extends FormData {
    getHeaders() {
        return {}
    }
}
import {
    Button,
    Input,
    Textarea,
    Switch,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Progress,
} from "@nextui-org/react";
import {
    ClipboardIcon,
} from '@heroicons/react/24/outline'

export default function Audio() {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [enabled, setEnabled] = useStorage('audio_enabled')
    const [apiKey, setApiKey] = useStorage("openai_api_key");
    const [transcriptions, setTranscriptions] = useStorage("audio_transcriptions", true, {});
    const [files, setFiles] = useState({});
    const [prompt, setPrompt] = useState('');
    useEffect(() => {
        if (Object.entries(transcriptions).length > 0) {
            saveToStorage("audio_transcriptions", transcriptions, true);
        }
    }, [transcriptions]);
    useEffect(() => {
        if (enabled !== null) {
            saveToStorage("audio_enabled", enabled)
        }
    }, [enabled]);
    const truncateString = (str, maxLength) => {
        if (str.length > maxLength) {
            return str.slice(0, maxLength) + '...';
        } else {
            return str;
        }
    }
    const copyToClipboard = (text) => {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    };
    const transcribeAudio = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setProgress(0);
        setTranscriptions([]);

        const configuration = new Configuration({
            apiKey: apiKey,
            formDataCtor: CustomFormData
        });
        const openai = new OpenAIApi(configuration);
        const totalFiles = files.length;
        const progressStep = 100 / totalFiles;
        const processFile = async (file, promptText) => {
            try {
                const response = await openai.createTranscription(file, "whisper-1", promptText);
                setTranscriptions((prevTranscriptions) => ({
                    ...prevTranscriptions,
                    [file.name]: response.data.text,
                }));
                setProgress((prevProgress) => prevProgress + progressStep);
                return response.data.text;
            } catch (error) {
                console.error("エラーが発生しました: ", error);
            } finally {
            }
        };
        if (enabled === 'enable') {
            await Promise.all(Array.from(files).map(file => processFile(file, prompt)));
        } else {
            let currentPrompt = prompt;
            for (const file of files) {
                currentPrompt = await processFile(file, currentPrompt);
            }
        }
        setIsLoading(false);
    };
    return (
        <>
            <form onSubmit={transcribeAudio}>
                <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-base font-semibold leading-7">Create transcription</h2>
                    <p className="mt-1 text-sm leading-6">
                        Transcribes audio into the input language.
                    </p>
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        <div className="col-span-full">
                            <Switch
                                value={enabled}
                                isSelected={enabled === 'enable'}
                                onChange={(event) => { setEnabled(event.target.checked ? 'enable' : 'disable') }}
                            >
                                Performance Mode<div className="text-tiny text-foreground-400">Parallel processing of selected files.</div>
                            </Switch>
                        </div>

                        <div className="sm:col-span-3">
                            <Input
                                classNames={{input: "text-tiny"}}
                                type="file"
                                label="File"
                                placeholder="file"
                                description="The audio file object (not file name) to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm."
                                isRequired
                                multiple={true}
                                accept="audio/*"
                                onChange={(event) => { setFiles(event.target.files) }}
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <Input
                                isReadOnly
                                isRequired
                                type="text"
                                label="Model"
                                defaultValue="whisper-1"
                                description="ID of the model to use. Only whisper-1 is currently available."
                            />
                        </div>

                        <div className="col-span-full">
                            <Textarea
                                label="Prompt"
                                description="An optional text to guide the model's style or continue a previous audio segment. The prompt should match the audio language."
                                value={prompt}
                                onChange={(event) => { setPrompt(event.target.value) }}
                            />
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

                <Progress aria-label="Loading..." value={progress} className="mt-6"/>

            </form>

            <Table className="mt-6" aria-label="Example static collection table">
                <TableHeader>
                    <TableColumn>FILE NAME</TableColumn>
                    <TableColumn>RESULT</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                { Object.entries(transcriptions).length === 0 && (
                    <TableBody emptyContent={"No rows to display."}>{[]}</TableBody>
                )}
                { Object.entries(transcriptions).length > 0 && (
                    <TableBody>
                        {Object.entries(transcriptions).map(([fileName, text]) => (
                            <TableRow key={fileName}>
                                <TableCell>{fileName}</TableCell>
                                <TableCell>{truncateString(text, 30)}</TableCell>
                                <TableCell>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        color="secondary"
                                        onClick={() => copyToClipboard(text)}
                                        className="absolute top-0 right-0 m-2 focus:outline-none z-10"
                                        aria-label="Copy"
                                    >
                                        <ClipboardIcon className="h-6 w-6" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                )}
            </Table>
        </>
    )
}
