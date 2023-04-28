import {useEffect, Fragment, useState} from 'react';
import { Configuration, OpenAIApi } from 'openai';
class CustomFormData extends FormData {
    getHeaders() {
        return {}
    }
}

import { CheckCircleIcon } from '@heroicons/react/24/solid'
import {
    FaceFrownIcon,
    FaceSmileIcon,
    FireIcon,
    HandThumbUpIcon,
    HeartIcon,
    PaperClipIcon, UserCircleIcon,
    XMarkIcon,
} from '@heroicons/react/20/solid'
import { Listbox, Transition } from '@headlessui/react'

const activity = [
    {
        id: 1,
        type: 'commented',
        person: {
            name: 'Chelsea Hagon',
            imageUrl:
                'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
        comment: 'Called client, they reassured me the invoice would be paid by the 25th.',
        date: '3d ago',
        dateTime: '2023-01-23T15:56',
    },
]
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
    const [apiKey, setApiKey] = useState('');
    useEffect(() => {
        if (chrome.storage) {
            chrome.storage.local.get('openai_api_key', (data) => {
                if (data.openai_api_key) {
                    setApiKey(data.openai_api_key)
                }
            });
        } else {
            const storedApiKey = localStorage.getItem('openai_api_key');
            if (storedApiKey) {
                setApiKey(storedApiKey)
            }
        }
    }, []);
    const [prompt, setPrompt] = useState('');
    const [comment, setComment] = useState('');
    const [messages, setMessages] = useState([]);
    const handlePromptChange = (e) => {
        setPrompt(e.target.value);
    };
    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };
    const exec = async (event) => {
        event.preventDefault();
        if (!comment) {
            alert('コメントを入力してください。');
            return;
        }
        const newMessage = {
            id: messages.length,
            type: 'commented',
            person: {
                name: 'user',
                imageUrl:
                    'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            },
            comment: comment,
            date: '3d ago',
            dateTime: '2023-01-23T15:56',
        };
        console.log(newMessage)
        messages.push(newMessage);
        setMessages(messages);
        const configuration = new Configuration({
            apiKey: apiKey,
            formDataCtor: CustomFormData
        });
        const openai = new OpenAIApi(configuration);
        try {
            const _messages = messages.map((message) => {
                return {
                    'role': message.person.name,
                    'content': message.comment,
                }
            });
            const response = await openai.createChatCompletion({
                'model': 'gpt-3.5-turbo',
                'messages': _messages,
            });
            const message = response.data.choices[0].message
            const newMessage = {
                id: messages.length+1,
                type: 'commented',
                person: {
                    name: message.role,
                    imageUrl:
                        'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                },
                comment: message.content,
                date: '3d ago',
                dateTime: '2023-01-23T15:56',
            }
            messages.push(newMessage);
            setMessages(messages);
            // streamで返ってくるので、response.dataで取得する
        } catch (error) {
            console.error('エラーが発生しました: ', error);
        } finally {
            document.getElementById('comment').value = '';
            setComment('')
        }
    };
    return (
        <>
            <ul role="list" className="space-y-6">
                {messages.map((activityItem, activityItemIdx) => (
                    <li key={activityItem.id} className="relative flex gap-x-4">
                        <div
                            className={classNames(
                                activityItemIdx === activity.length - 1 ? 'h-6' : '-bottom-6',
                                'absolute left-0 top-0 flex w-6 justify-center'
                            )}
                        >
                            <div className="w-px bg-gray-200" />
                        </div>
                        {activityItem.type === 'commented' ? (
                            <>
                                <img
                                    src={activityItem.person.imageUrl}
                                    alt=""
                                    className="relative mt-3 h-6 w-6 flex-none rounded-full bg-gray-50"
                                />
                                <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-gray-200">
                                    <div className="flex justify-between gap-x-4">
                                        <div className="py-0.5 text-xs leading-5 text-gray-500">
                                            <span className="font-medium text-gray-900">{activityItem.person.name}</span> commented
                                        </div>
                                        <time dateTime={activityItem.dateTime} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                                            {activityItem.date}
                                        </time>
                                    </div>
                                    <p className="text-sm leading-6 text-gray-500">{activityItem.comment}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                                    {activityItem.type === 'paid' ? (
                                        <CheckCircleIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                                    ) : (
                                        <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300" />
                                    )}
                                </div>
                                <p className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                                    <span className="font-medium text-gray-900">{activityItem.person.name}</span> {activityItem.type} the
                                    invoice.
                                </p>
                                <time dateTime={activityItem.dateTime} className="flex-none py-0.5 text-xs leading-5 text-gray-500">
                                    {activityItem.date}
                                </time>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            {/* New comment form */}
            <div className="mt-6 flex gap-x-3">
                <UserCircleIcon className="h-6 w-6 flex-none rounded-full bg-gray-50" />
                <form action="#" className="relative flex-auto">
                    <div className="overflow-hidden rounded-lg pb-12 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                        <label htmlFor="comment" className="sr-only">
                            Add your comment
                        </label>
                        <textarea
                            rows={2}
                            name="comment"
                            id="comment"
                            onChange={handleCommentChange}
                            className="!outline-none block w-full resize-none border-0 bg-transparent px-3 py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            placeholder="Add your comment..."
                            defaultValue={''}
                        />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                        <div className="flex items-center space-x-5">
                            {/*<div className="flex items-center">*/}
                            {/*    <button*/}
                            {/*        type="button"*/}
                            {/*        className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"*/}
                            {/*    >*/}
                            {/*        <PaperClipIcon className="h-5 w-5" aria-hidden="true" />*/}
                            {/*        <span className="sr-only">Attach a file</span>*/}
                            {/*    </button>*/}
                            {/*</div>*/}
                            <div className="flex items-center">
                                <Listbox value={selected} onChange={setSelected}>
                                    {({ open }) => (
                                        <>
                                            <Listbox.Label className="sr-only"> Your mood </Listbox.Label>
                                            <div className="relative">
                                                <Listbox.Button className="relative -m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
                          <span className="flex items-center justify-center">
                            {selected.value === null ? (
                                <span>
                                <FaceSmileIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                                <span className="sr-only"> Add your mood </span>
                              </span>
                            ) : (
                                <span>
                                <span
                                    className={classNames(
                                        selected.bgColor,
                                        'flex h-8 w-8 items-center justify-center rounded-full'
                                    )}
                                >
                                  <selected.icon className="h-5 w-5 flex-shrink-0 text-white" aria-hidden="true" />
                                </span>
                                <span className="sr-only">{selected.name}</span>
                              </span>
                            )}
                          </span>
                                                </Listbox.Button>

                                                <Transition
                                                    show={open}
                                                    as={Fragment}
                                                    leave="transition ease-in duration-100"
                                                    leaveFrom="opacity-100"
                                                    leaveTo="opacity-0"
                                                >
                                                    <Listbox.Options className="absolute bottom-10 z-10 -ml-6 w-60 rounded-lg bg-white py-3 text-base shadow ring-1 ring-black ring-opacity-5 focus:outline-none sm:ml-auto sm:w-64 sm:text-sm">
                                                        {moods.map((mood) => (
                                                            <Listbox.Option
                                                                key={mood.value}
                                                                className={({ active }) =>
                                                                    classNames(
                                                                        active ? 'bg-gray-100' : 'bg-white',
                                                                        'relative cursor-default select-none px-3 py-2'
                                                                    )
                                                                }
                                                                value={mood}
                                                            >
                                                                <div className="flex items-center">
                                                                    <div
                                                                        className={classNames(
                                                                            mood.bgColor,
                                                                            'flex h-8 w-8 items-center justify-center rounded-full'
                                                                        )}
                                                                    >
                                                                        <mood.icon
                                                                            className={classNames(mood.iconColor, 'h-5 w-5 flex-shrink-0')}
                                                                            aria-hidden="true"
                                                                        />
                                                                    </div>
                                                                    <span className="ml-3 block truncate font-medium">{mood.name}</span>
                                                                </div>
                                                            </Listbox.Option>
                                                        ))}
                                                    </Listbox.Options>
                                                </Transition>
                                            </div>
                                        </>
                                    )}
                                </Listbox>
                            </div>
                        </div>
                        <button
                            type="submit"
                            onClick={exec}
                            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Comment
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}
