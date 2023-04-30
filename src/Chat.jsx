import { useEffect, useState, useRef } from "react";
import { Configuration } from "openai";
import { OpenAIExt } from "openai-ext";
import { useStorage } from "./useStorage";
import { saveToStorage } from "./storageUtils.js";
import AlertMessage from "./AlertMessage";
import {
    FaceFrownIcon,
    FaceSmileIcon,
    FireIcon,
    HandThumbUpIcon,
    HeartIcon,
    XMarkIcon,
} from '@heroicons/react/20/solid'
import MessageInput from "./MessageInput";
import MessageList from './MessageList';

const moods = [
    { name: 'Excited', value: 'excited', icon: FireIcon, iconColor: 'text-white', bgColor: 'bg-red-500' },
    { name: 'Loved', value: 'loved', icon: HeartIcon, iconColor: 'text-white', bgColor: 'bg-pink-400' },
    { name: 'Happy', value: 'happy', icon: FaceSmileIcon, iconColor: 'text-white', bgColor: 'bg-green-400' },
    { name: 'Sad', value: 'sad', icon: FaceFrownIcon, iconColor: 'text-white', bgColor: 'bg-yellow-400' },
    { name: 'Thumbsy', value: 'thumbsy', icon: HandThumbUpIcon, iconColor: 'text-white', bgColor: 'bg-blue-500' },
    { name: 'I feel nothing', value: null, icon: XMarkIcon, iconColor: 'text-gray-400', bgColor: 'bg-transparent' },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Chat() {
    const [selected, setSelected] = useState(moods[5])
    const [apiKey, setApiKey] = useStorage("openai_api_key");
    const [messages, setMessages] = useStorage("chat_messages", true, [])
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
            saveToStorage("chat_messages", messages, true);
        }
    }, [messages]);
    const [inputMessage, setInputMessage] = useState("");
    const [currentResponse, setCurrentResponse] = useState("");
    const [chatPrompt, setChatPrompt] = useStorage("chat_prompt", false, '');
    const messagesEndRef = useRef(null);
    useEffect(() => {
        scrollToBottom();
    }, [currentResponse]);

    const scrollToBottom = () => {
        console.log("Scrolling to bottom...");
        console.log(messagesEndRef.current)
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
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
    const resetMessages = () => {
        // ユーザーに会話履歴のリセットを確認するアラートを表示
        const confirmReset = window.confirm("会話の履歴をリセットしてもよろしいですか？");

        // ユーザーが [OK] をクリックした場合、処理を実行
        if (confirmReset) {
            setMessages([]);
            saveToStorage("chat_messages", [], true);
        }
    };

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

    const sendMessage = async (event) => {
        event.preventDefault();
        if (inputMessage === '') {
            return;
        }
        if (apiKey) {
            const configuration = new Configuration({
                apiKey: apiKey,
            });
            // メッセージを送信
            const userMood = selected.value !== null ? selected.value : 'usually';
            const systemMessage = { role: "system", content: `${chatPrompt} User mood is ${userMood}`};
            const userMessage = { role: "user", content: inputMessage };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            // Make the call and store a reference to the XMLHttpRequest
            const xhr = OpenAIExt.streamClientChatCompletion(
                {
                    model: "gpt-3.5-turbo",
                    messages: [systemMessage, ...messages, userMessage],
                },
                streamConfig
            );
            // 入力メッセージをクリア
            setInputMessage("");
        }
    };

    return (
        <>
            <AlertMessage alertVisible={alertVisible} onClose={handleClose} />
            <div className="flex flex-col h-470">
                <MessageList
                    messages={messages}
                    currentResponse={currentResponse}
                    copyToClipboard={copyToClipboard}
                    messagesEndRef={messagesEndRef}
                />
                <MessageInput
                    inputMessage={inputMessage}
                    setInputMessage={setInputMessage}
                    resetMessages={resetMessages}
                    sendMessage={sendMessage}
                    selected={selected}
                    setSelected={setSelected}
                    moods={moods}
                />
            </div>
        </>
    );
}
