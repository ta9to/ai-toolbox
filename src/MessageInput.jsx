import React from "react";
import {
    XCircleIcon,
    UserCircleIcon,
} from '@heroicons/react/20/solid'
import MoodSelector from "./MoodSelector";

const MessageInput = ({ inputMessage, setInputMessage, resetMessages, sendMessage, selected, setSelected, moods }) => {
    return (
        <div className="mt-6 flex gap-x-3">
            <UserCircleIcon className="h-6 w-6 flex-none rounded-full bg-gray-50" aria-hidden="true" />
            <form action="#" className="relative flex-auto">
                <div className="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                    <label htmlFor="comment" className="sr-only">
                        Add your comment
                    </label>
                    <textarea
                        rows={2}
                        className="!outline-none px-3 block w-full resize-none border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="Add your message..."
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
                        <div className="flex items-center">
                            <MoodSelector selected={selected} setSelected={setSelected} moods={moods} />
                        </div>
                    </div>
                    <button
                        onClick={sendMessage}
                        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MessageInput;
