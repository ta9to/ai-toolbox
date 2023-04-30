import { Fragment } from "react";
import { Listbox, Transition } from '@headlessui/react';
import { classNames } from './utils';
import { FaceSmileIcon } from '@heroicons/react/20/solid'

export default function MoodSelector({ selected, setSelected, moods }) {
    return (
        <Listbox value={selected} onChange={setSelected}>
            {({ open }) => (
                <>
                    <Listbox.Label className="sr-only">Your mood</Listbox.Label>
                    <div className="relative">
                        <Listbox.Button className="relative -m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500">
              <span className="flex items-center justify-center">
                {selected.value === null ? (
                    <span>
                    <FaceSmileIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span className="sr-only">Add your mood</span>
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
    );
}
