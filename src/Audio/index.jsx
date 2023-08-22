import {Tabs, Tab, Card, CardBody} from "@nextui-org/react";
import Transcription from "./Transcription.jsx";
import RealtimeTranscription from "./RealtimeTranscription.jsx";

export default function AudioIndex() {
    const tabs = [
        {title: 'Transcription', component: <Transcription/>},
        {title: 'Realtime Transcription', component: <RealtimeTranscription/>},
    ];
    return (
        <div className="flex w-full flex-col">
            <Tabs aria-label="Options">
                {tabs.map((tab) => (
                    <Tab key={tab.title} title={tab.title}>
                        {tab.component}
                    </Tab>
                ))}
            </Tabs>
        </div>
    )
}
