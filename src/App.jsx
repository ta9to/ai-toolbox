import { Fragment, useState } from 'react'
import { Tab } from '@headlessui/react'
import { BuildingOfficeIcon, CreditCardIcon, UserIcon, UsersIcon } from '@heroicons/react/20/solid'
import Settings from "./Settings.jsx";
import Images from "./Images";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function App() {
    return (
        <div className="bg-white">
            <main>
                {/* Product */}
                <div className="lg:grid lg:grid-cols-7 lg:grid-rows-1 lg:gap-x-8 lg:gap-y-10 xl:gap-x-16">
                    <div className="mx-auto w-full max-w-2xl lg:col-span-4 lg:mt-0 lg:max-w-none">
                        <Tab.Group as="div">
                            <div className="border-b border-gray-200">
                                <Tab.List className="-mb-px flex space-x-8">
                                    <Tab
                                        className={({ selected }) =>
                                            classNames(
                                                selected
                                                    ? 'border-indigo-600 text-indigo-600'
                                                    : 'border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800',
                                                'whitespace-nowrap border-b-2 py-6 text-sm font-medium'
                                            )
                                        }
                                    >
                                        Chat
                                    </Tab>
                                    <Tab
                                        className={({ selected }) =>
                                            classNames(
                                                selected
                                                    ? 'border-indigo-600 text-indigo-600'
                                                    : 'border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800',
                                                'whitespace-nowrap border-b-2 py-6 text-sm font-medium'
                                            )
                                        }
                                    >
                                        Images
                                    </Tab>
                                    <Tab
                                        className={({ selected }) =>
                                            classNames(
                                                selected
                                                    ? 'border-indigo-600 text-indigo-600'
                                                    : 'border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800',
                                                'whitespace-nowrap border-b-2 py-6 text-sm font-medium'
                                            )
                                        }
                                    >
                                        Audio
                                    </Tab>
                                    <Tab
                                        className={({ selected }) =>
                                            classNames(
                                                selected
                                                    ? 'border-indigo-600 text-indigo-600'
                                                    : 'border-transparent text-gray-700 hover:border-gray-300 hover:text-gray-800',
                                                'whitespace-nowrap border-b-2 py-6 text-sm font-medium'
                                            )
                                        }
                                    >
                                        Settings
                                    </Tab>
                                </Tab.List>
                            </div>
                            <Tab.Panels as={Fragment}>
                                <Tab.Panel className="pt-10">
                                    hoge
                                </Tab.Panel>
                                <Tab.Panel className="pt-10">
                                    <Images />
                                </Tab.Panel>
                                <Tab.Panel className="pt-10">
                                    hogefuga
                                </Tab.Panel>
                                <Tab.Panel className="pt-10">
                                    <Settings />
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </div>
            </main>
        </div>
    )
}
