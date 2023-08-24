import { useEffect, useState, useRef } from "react";
import { Configuration } from "openai";
import { OpenAIExt } from "openai-ext";
import { useStorage } from "./useStorage";
import { saveToStorage } from "./storageUtils.js";
import AlertMessage from "./AlertMessage";
import MessageInput from "./MessageInput";
import MessageList from './MessageList';

export default function Chat() {
    const [apiKey, setApiKey] = useStorage("openai_api_key");
    const [messages, setMessages] = useStorage("chat_messages", true, [])
    useEffect(() => {
        if (messages.length > 0) {
            saveToStorage("chat_messages", messages, true);
        }
    }, [messages]);
    const [inputMessage, setInputMessage] = useState("");
    const [currentResponse, setCurrentResponse] = useState("");
    const [chatPrompt, setChatPrompt] = useStorage("chat_prompt", false, '');
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
            const systemMessage = { role: "system", content: `${chatPrompt}`};
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
        } else {
            alert('Set the OpenAI API key from the Settings tab.');
        }
    };

    return (
        <>
            <AlertMessage alertVisible={alertVisible} onClose={handleClose} />
            <div className="flex flex-col h-527">
                <MessageList
                    messages={messages}
                    currentResponse={currentResponse}
                    copyToClipboard={copyToClipboard}
                />
                <MessageInput
                    inputMessage={inputMessage}
                    setInputMessage={setInputMessage}
                    resetMessages={resetMessages}
                    sendMessage={sendMessage}
                />
            </div>
        </>
    );
}
