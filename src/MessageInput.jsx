import React from "react";
import {
    Textarea,
    Button,
} from "@nextui-org/react";
import {
    XCircleIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/outline'

const MessageInput = ({ inputMessage, setInputMessage, resetMessages, sendMessage }) => {
    return (
        <div className="mt-6 flex gap-x-3">
            <form action="#" className="relative flex-auto">
                <div className="overflow-hidden rounded-lg pb-12">
                    <Textarea
                        rows={2}
                        className="px-3 block py-1.5 sm:text-sm sm:leading-6"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                    />
                </div>

                <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                    <div className="flex items-center space-x-5">
                        <div className="flex items-center">
                            <button
                                type="button"
                                onClick={resetMessages}
                                className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                            >
                                <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                                <span className="sr-only">Reset messages</span>
                            </button>
                        </div>
                        {/*<div className="flex items-center"></div>*/}
                        {/*<div className="flex items-center"></div>*/}
                    </div>
                    <Button
                        isIconOnly
                        color="primary"
                        aria-label="Send"
                        className="mr-1"
                        onClick={sendMessage}
                    >
                        <PaperAirplaneIcon className="h-6 w-6" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default MessageInput;
