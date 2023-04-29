import { useEffect, useState, useRef } from "react";
import { Configuration, OpenAIApi } from "openai";
import { OpenAIExt } from "openai-ext";
import { useStorage } from "./useStorage";
import { saveToStorage } from "./storageUtils.js";

export default function Chat() {
    const [apiKey, setApiKey] = useStorage("openai_api_key");
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [currentResponse, setCurrentResponse] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    useEffect(scrollToBottom, [messages]);

    const streamConfig = {
        apiKey: apiKey, // Your API key
        handler: {
            // Content contains the string draft, which may be partial. When isFinal is true, the completion is done.
            onContent(content, isFinal, xhr) {
                console.log(content, "isFinal?", isFinal);
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
            const userMessage = { role: "user", content: inputMessage };
            setMessages((prevMessages) => [...prevMessages, userMessage]);

            // Make the call and store a reference to the XMLHttpRequest
            const xhr = OpenAIExt.streamClientChatCompletion(
                {
                    model: "gpt-3.5-turbo",
                    messages: [...messages, userMessage],
                },
                streamConfig
            );
            // 入力メッセージをクリア
            setInputMessage("");
        }
    };

    return (
        <>
            <div className="space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`${
                            message.role === "user" ? "text-right" : "text-left"
                        }`}
                    >
                        <div
                            className={`${
                                message.role === "user"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-300 text-gray-800"
                            } inline-block px-4 py-2 rounded-lg`}
                        >
                            {message.content}
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
            <div className="mt-6 flex justify-between">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                />
                <button
                    onClick={sendMessage}
                    className="ml-4 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </div>
        </>
    );
}
