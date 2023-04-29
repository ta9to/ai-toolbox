import { useEffect, useState, useRef } from "react";
import { Configuration, OpenAIApi } from "openai";
import { OpenAIExt } from "openai-ext";
import { useStorage } from "./useStorage";
import { saveToStorage } from "./storageUtils.js";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/20/solid'

export default function Chat() {
    const [apiKey, setApiKey] = useStorage("openai_api_key");
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [currentResponse, setCurrentResponse] = useState("");
    const [chatPrompt, setChatPrompt] = useStorage("chat_prompt");
    const [alertVisible, setAlertVisible] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };
    const copyToClipboard = (text) => {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        // 2. copyToClipboard関数が実行されたときに、アラートメッセージを表示するようにします。
        setAlertVisible(true);

        // 3. アラートメッセージが表示されてから一定時間経過したら、自動的に非表示にするようにします。
        setTimeout(() => {
            setAlertVisible(false);
        }, 3000);
    };

    useEffect(scrollToBottom, [messages]);

    const streamConfig = {
        apiKey: apiKey, // Your API key
        handler: {
            // Content contains the string draft, which may be partial. When isFinal is true, the completion is done.
            onContent(content, isFinal, xhr) {
                setCurrentResponse(content);
                if (isFinal) {
                    const gptResponse = { role: "assistant", content: content };
                    setMessages((prevMessages) => [...prevMessages, gptResponse]);
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

    const sendMessage = async () => {
        if (apiKey) {
            const configuration = new Configuration({
                apiKey: apiKey,
            });
            // メッセージを送信
            const systemMessage = { role: "system", content: chatPrompt };
            const userMessage = { role: "user", content: inputMessage };
            setMessages((prevMessages) => [...prevMessages, userMessage]);

            // Make the call and store a reference to the XMLHttpRequest
            const xhr = OpenAIExt.streamClientChatCompletion(
                {
                    model: "gpt-3.5-turbo",
                    messages: [...messages, userMessage, systemMessage],
                },
                streamConfig
            );
            // 入力メッセージをクリア
            setInputMessage("");
        }
    };

    return (
        <>
            {alertVisible && (
                <div className="fixed top-4 right-4 rounded-md bg-green-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">コピーしました</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    type="button"
                                    className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col h-490">
                <div className="flex-grow space-y-4 overflow-auto">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`${
                                message.role === "user" ? "text-right" : "text-left"
                            }`}
                        >
                            <div
                                onClick={() => copyToClipboard(message.content)}
                                className={`${
                                    message.role === "user"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-300 text-gray-800"
                                } inline-block px-4 py-2 rounded-lg`}
                            >
                                <ReactMarkdown
                                    children={message.content}
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        table: ({ node, ...props }) => (
                                            <table {...props} className="min-w-full divide-y divide-gray-300" />
                                        ),
                                        tbody: ({ node, ...props }) => (
                                            <tbody {...props} className="divide-y divide-gray-200" />
                                        ),
                                        th: ({ node, ...props }) => (
                                            <th {...props} className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900" />
                                        ),
                                        td: ({ node, ...props }) => (
                                            <td {...props} className="whitespace-nowrap px-3 py-4 text-sm text-gray-500" />
                                        ),
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    {currentResponse && (
                        <div className="text-left">
                            <div className="bg-gray-200 text-gray-700 inline-block px-4 py-2 rounded-lg">
                                {currentResponse}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef}></div>
                </div>
                <div className="w-full border-t dark:border-white/20 md:border-transparent md:dark:border-transparent pt-2">
                    <div className="mt-6 flex justify-between mx-2">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                        />
                        <button
                            onClick={sendMessage}
                            className="ml-4 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

        </>
    );
}
