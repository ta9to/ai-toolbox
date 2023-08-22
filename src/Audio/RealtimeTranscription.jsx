import React, { useState, useEffect, useRef } from 'react';
import {
    Switch,
    Button,
    RadioGroup, Radio
} from "@nextui-org/react";

const RealtimeTranscription = () => {
    const [error, setError] = useState(false);
    const [recognizing, setRecognizing] = useState(false);
    const [transcripts, setTranscripts] = useState([]);
    const recognition = useRef(null);
    const [language, setLanguage] = useState('ja-JP');
    // 言語オプション
    const languages = [
        { value: 'ja-JP', label: 'Japanese' },
        { value: 'en-US', label: 'English' },
        // 他の言語を追加
    ];

    useEffect(() => {
        if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
            setError(true);
            return;
        }
        recognition.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.lang = language; // 言語の設定
        recognition.current.onresult = (event) => {
            const updatedTranscripts = [...transcripts];
            for (let i = 0; i < event.results.length; i++) {
                updatedTranscripts[i] = event.results[i];
            }
            setTranscripts(updatedTranscripts);
        };

        recognition.current.onerror = (event) => {
            console.error(event.error);
        };
    }, [language, transcripts]);

    const toggleRecognition = () => {
        if (recognizing) {
            stopRecognition();
        } else {
            startRecognition();
        }
    };

    const startRecognition = () => {
        setRecognizing(true);
        recognition.current.start();
    };

    const stopRecognition = () => {
        setRecognizing(false);
        recognition.current.stop();
        setTranscripts(transcripts.filter((transcript) => transcript.isFinal));
    };

    const copyToClipboard = () => {
        const text = transcripts.map((transcript) => transcript[0].transcript).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            alert('コピーしました！');
        });
    };

    return (
        <div className="border-b border-gray-900/10 pb-12 h-screen relative">
            <h2 className="text-base font-semibold leading-7">Realtime transcription</h2>
            <p className="mt-1 text-sm leading-6">
                Converts speech into text in real time using the speech recognition function.
            </p>
            {error && <div className="text-red-500 mb-4"><p>音声認識機能はこのブラウザでは利用できません。</p></div>}
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="absolute top-0 right-0">
                    <Button color="primary" onClick={copyToClipboard}>Copy</Button>
                </div>

                <div className="col-span-full">
                    <RadioGroup
                        orientation="horizontal"
                        defaultValue={language}
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        {languages.map((language) => (
                            <Radio key={language.value} value={language.value}>
                                {language.label}
                            </Radio>
                        ))}
                    </RadioGroup>
                </div>
                <div className="col-span-full">
                    <Switch
                        className={"mt-4"}
                        value={recognizing}
                        isSelected={recognizing}
                        onChange={(event) => { toggleRecognition(); }}
                    >
                    </Switch>
                </div>

                <div className="col-span-full">
                    {transcripts.map((transcript, index) => (
                        <p key={index} className={`mt-2 text-sm ${transcript.isFinal ? '' : 'text-gray-400'}`}>{transcript[0].transcript}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RealtimeTranscription;
