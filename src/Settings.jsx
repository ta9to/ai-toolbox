import React from "react";
import {
    Input,
    Button,
    Link,
    Textarea,
} from "@nextui-org/react";
import {
    EyeIcon,
    EyeSlashIcon,
} from '@heroicons/react/24/outline'
import { Fragment, useState } from 'react'
import { useStorage } from "./useStorage";
import { saveToStorage } from './storageUtils';
import ThemeSelector from "./components/ThemeSelector";

export default function Settings({ theme, setTheme }) {
    const [isVisible, setIsVisible] = React.useState(false);
    const toggleVisibility = () => setIsVisible(!isVisible);
    const [openaiApiKey, setOpenaiApiKey] = useStorage("openai_api_key", false, '');
    const [isLoading, setIsLoading] = useState(false);
    const saveOpenaiApiKey = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        await saveToStorage("openai_api_key", openaiApiKey);
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    };

    const [themeIsLoading, setThemeIsLoading] = useState(false);
    // const [theme, setTheme] = useStorage("theme", false, 'light');
    const saveTheme = async (event) => {
        event.preventDefault();
        setThemeIsLoading(true);
        await saveToStorage("theme", theme);
        setTimeout(() => {
            setThemeIsLoading(false);
        }, 500);
    };

    const [chatPrompt, setChatPrompt] = useStorage("chat_prompt", false, '');
    const [chatPromptIsLoading, setChatPromptIsLoading] = useState(false);
    const saveChatPrompt = async (event) => {
        event.preventDefault();
        setChatPromptIsLoading(true);
        await saveToStorage("chat_prompt", chatPrompt);
        setTimeout(() => {
            setChatPromptIsLoading(false);
        }, 500);
    };

    return (
        <>
            <div className="divide-y divide-white/5">

                {/* OpenAI API Key */}
                <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
                    <div>
                        <h2 className="text-base font-semibold leading-7">OpenAI API Key</h2>
                        <p className="mt-1 text-sm leading-6">
                            Please enter your <Link size="sm" href="https://openai.com/blog/openai-api">OpenAI API</Link> Key.
                        </p>
                    </div>

                    <form className="md:col-span-2" onSubmit={saveOpenaiApiKey}>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
                            <div className="col-span-full">
                                <div className="mt-2">
                                    <Input
                                        isRequired
                                        label="Your OpenAI API Key"
                                        variant="bordered"
                                        placeholder="sk-****"
                                        endContent={
                                            <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                                                {isVisible ? (
                                                    <EyeSlashIcon className="w-6 h-6 text-2xl text-default-400 pointer-events-none" />
                                                ) : (
                                                    <EyeIcon className="w-6 h-6 text-2xl text-default-400 pointer-events-none" />
                                                )}
                                            </button>
                                        }
                                        type={isVisible ? "text" : "password"}
                                        value={openaiApiKey}
                                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex">
                            <Button type="submit" color="primary" isLoading={isLoading}>
                                {isLoading ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Theme */}
                <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
                    <div>
                        <h2 className="text-base font-semibold leading-7">Theme</h2>
                        <p className="mt-1 text-sm leading-6">
                            Please choose your theme.
                        </p>
                    </div>

                    <form className="md:col-span-2" onSubmit={saveTheme}>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
                            <div className="col-span-full">
                                <div className="mt-2">
                                    <ThemeSelector theme={theme} setTheme={setTheme} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex">
                            <Button type="submit" color="primary" isLoading={themeIsLoading}>
                                {isLoading ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Chat Prompt */}
                <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
                    <div>
                        <h2 className="text-base font-semibold leading-7">Chat Prompt</h2>
                        <p className="mt-1 text-sm leading-6">
                            Please enter you chat prompt.
                        </p>
                    </div>

                    <form className="md:col-span-2" onSubmit={saveChatPrompt}>
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
                            <div className="col-span-full">
                                <div className="mt-2">
                                    <Textarea
                                        label="Your Chat Prompt"
                                        minRows={6}
                                        value={chatPrompt}
                                        onChange={(e) => setChatPrompt(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex">
                            <Button type="submit" color="primary" isLoading={chatPromptIsLoading}>
                                {chatPromptIsLoading ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </>
    )
}
