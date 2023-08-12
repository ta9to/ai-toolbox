import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import Settings from "./Settings.jsx";
import Images from "./Images";
import Audio from "./Audio";
import Chat from "./Chat";
import Embeddings from "./Embeddings";
import { saveToStorage, getFromStorage } from './storageUtils';

import {
    ChatBubbleLeftEllipsisIcon,
    PhotoIcon,
    TableCellsIcon,
    SpeakerWaveIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline'

export default function App() {
    const [activeTab, setActiveTab] = useState('0');

    useEffect(() => {
        getFromStorage("active_tab").then((value) => {
            if (value != null) setActiveTab(value);
        });
    }, []);

    const handleTabChange = (index) => {
        setActiveTab(index);
        saveToStorage("active_tab", index)
    };

    const tabs = [
        { name: 'Chat', icon: <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />, component: <Chat /> },
        { name: 'Images', icon: <PhotoIcon className="h-6 w-6"/>, component: <Images /> },
        { name: 'Embeddings', icon: <TableCellsIcon className="h-6 w-6"/>, component: <Embeddings /> },
        { name: 'Audio', icon: <SpeakerWaveIcon className="h-6 w-6"/>, component: <Audio /> },
        { name: 'Settings', icon: <Cog6ToothIcon className="h-6 w-6"/>, component: <Settings /> }
    ];

    return (
        <div className="bg-white">
            <main>
                <div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
                    <div className="mx-auto w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
                        <Tabs
                            aria-label="Options"
                            color="primary"
                            variant="underlined"
                            classNames={{
                                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                                cursor: "w-full bg-indigo-500",
                                tab: "max-w-fit px-0 h-12",
                                tabContent: "group-data-[selected=true]:text-[#4F46E5]"
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
                                    <div className="pt-10">{tab.component}</div>
                                </Tab>
                            ))}
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
