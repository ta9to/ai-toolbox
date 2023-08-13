import { useState, useEffect, useRef } from "react";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { classNames } from './utils';
import {
    Card,
    CardBody,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@nextui-org/react";
import {
    UserCircleIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline'

const markdownComponents = {
    table: ({ children }) => {
        let headers = [];
        let rows = [];
        children.map((child, index) => {
            if (child.type === 'thead') {
                headers = child.props.children[0].props.children.map(header => header.props.children);
            } else if (child.type === 'tbody') {
                rows = child.props.children.map(row => row.props.children.map(cell => cell.props.children));
            }
        });
        return (
            <>
                <Table aria-label="table">
                    <TableHeader>
                        {headers.map((header, index) => (
                            <TableColumn key={index}>{header}</TableColumn>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                {row.map((cell, cellIndex) => (
                                    <TableCell key={cellIndex}>{cell}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </>
        );
    },
};


const MessageList = ({ messages, currentResponse, copyToClipboard }) => {
    const messagesEndRef = useRef(null);
    const [scrolling, setScrolling] = useState(false);
    useEffect(() => {
        scrollToBottom();
    }, [messages.length, currentResponse]);
    const scrollToBottom = () => {
        if (!scrolling) {
            if (messagesEndRef.current) {
                setScrolling(true);
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
                setTimeout(() => setScrolling(false), 500);
            }
        }
    };
    useEffect(() => {
        setTimeout(() => scrollToBottom(), 100);
    }, []);

    return (
        <ul className="flex-grow space-y-4 overflow-auto">
            {messages.map((message, index) => (
                <li key={index} className={`relative flex gap-x-4 mr-4`}>
                    <div
                        className={classNames(
                            index === messages.length - 1 ? 'h-6' : '-bottom-6',
                            'absolute left-0 top-0 flex w-6 justify-center'
                        )}
                    >
                        <div className="w-px" />
                    </div>
                    {message.role === 'assistant' ? (
                        <SparklesIcon className="relative mt-3 h-6 w-6 flex-none rounded-full" aria-hidden="true" />
                    ) : (
                        <UserCircleIcon className="relative mt-3 h-6 w-6 flex-none rounded-full" aria-hidden="true" />
                    )}
                    <Card>
                        <CardBody
                            onClick={() => copyToClipboard(message.content)}
                        >
                            <ReactMarkdown
                                className={'text-sm leading-6'}
                                children={message.content}
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents}
                            />
                        </CardBody>
                    </Card>
                </li>
            ))}
            {currentResponse && (
                <li className={`relative flex gap-x-4`}>
                    <div className={'absolute left-0 top-0 flex w-6 justify-center'}>
                        <div className="w-px bg-gray-200" />
                    </div>
                    <SparklesIcon className="relative mt-3 h-6 w-6 flex-none rounded-full" aria-hidden="true" />
                    <Card>
                        <CardBody>
                            <div className={'text-sm leading-6'}>{currentResponse}</div>
                        </CardBody>
                    </Card>
                </li>
            )}
            <li ref={messagesEndRef}></li>
        </ul>
    );
};

export default MessageList;
