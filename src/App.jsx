import React, {useEffect, useState} from "react";
import { Tabs, Tab } from "@nextui-org/react";
import Settings from "./Settings.jsx";
import Images from "./Images";
import Audio from "./Audio";
import AudioIndex from "./Audio/index.jsx";
import Chat from "./Chat";
import Embeddings from "./Embeddings";
import { saveToStorage } from './storageUtils';
import { useStorage } from "./useStorage";

import {
    ChatBubbleLeftEllipsisIcon,
    PhotoIcon,
    TableCellsIcon,
    SpeakerWaveIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline'

export default function App() {
    const [activeTab, setActiveTab] = useStorage('active_tab', false, '0');

    const handleTabChange = (index) => {
        setActiveTab(index);
        saveToStorage("active_tab", index)
    };

    const [theme, setTheme] = useStorage("theme", false, 'light');
    const [mainClass, setMainClass] = useState('light');
    const tabs = [
        { name: 'Chat', icon: <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />, component: <Chat /> },
        { name: 'Images', icon: <PhotoIcon className="h-6 w-6"/>, component: <Images /> },
        { name: 'Embeddings', icon: <TableCellsIcon className="h-6 w-6"/>, component: <Embeddings /> },
        { name: 'Audio', icon: <SpeakerWaveIcon className="h-6 w-6"/>, component: <AudioIndex /> },
        { name: 'Settings', icon: <Cog6ToothIcon className="h-6 w-6"/>, component: <Settings  theme={theme} setTheme={setTheme} /> }
    ];
    useEffect(() => {
        if (theme.includes('dark')) {
            setMainClass(`${theme} text-foreground bg-background`);
        } else {
            setMainClass(theme);
        }
    }, [theme]);

    return (
        <main className={mainClass}>
            <div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
                <div className="mx-auto w-full max-w-3xl lg:col-span-4 lg:mt-0 lg:max-w-none">
                    <Tabs
                        aria-label="Options"
                        color="primary"
                        variant="underlined"
                        classNames={{
                            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                            cursor: "w-full",
                            tab: "max-w-fit px-0 h-12",
                        }}
                        selectedKey={activeTab}
                        onSelectionChange={handleTabChange}
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={index}
                                title={
                                    <div className="flex items-center space-x-2">
                                        {tab.icon}
                                        <span className="pr-2">{tab.name}</span>
                                    </div>
                                }
                            >
                                {tab.component}
                            </Tab>
                        ))}
                    </Tabs>
                </div>
            </div>
        </main>
    );
}
