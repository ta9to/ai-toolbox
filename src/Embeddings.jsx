import {
    Button,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Textarea
} from "@nextui-org/react";
import React, {useEffect, useState} from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { useStorage } from "./useStorage";
import { saveToStorage } from './storageUtils';
import { truncateString } from './utils';
import {
    TrashIcon,
} from '@heroicons/react/24/outline'

class CustomFormData extends FormData {
    getHeaders() {
        return {}
    }
}

export default function Embeddings() {
    const [isLoading, setIsLoading] = useState(false);
    const [apiKey, setApiKey] = useStorage("openai_api_key");
    const [input, setInput] = useState("");
    const [embeddings, setEmbeddings] = useStorage("embeddings_index", true, []);
    useEffect(() => {
        if (embeddings.length > 0) {
            saveToStorage("embeddings_index", embeddings, true);
        }
    }, [embeddings]);
    const deleteRow = (index) => {
        const newEmbeddings = embeddings.filter((row, i) => i !== index);
        setEmbeddings(newEmbeddings);
        saveToStorage("embeddings_index", newEmbeddings, true);
    }
    const generateVector = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        const configuration = new Configuration({
            apiKey: apiKey,
        });
        const openai = new OpenAIApi(configuration);
        const createEmbeddingRequest = {
            model: "text-embedding-ada-002",
            input: input,
        };
        const response = await openai.createEmbedding(createEmbeddingRequest);
        const row = {
            input: input,
            vector: response.data.data[0].embedding,
        };
        const newEmbeddings = [...embeddings, row];
        setEmbeddings(newEmbeddings);
        saveToStorage("embeddings_index", newEmbeddings, true);

        setIsLoading(false);
    }

    return (
        <>
            <form onSubmit={generateVector}>
                <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-base font-semibold leading-7">Create embeddings</h2>
                    <p className="mt-1 text-sm leading-6">
                        Creates an embedding vector representing the input text.
                    </p>
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                        <div className="col-span-full">
                            <Input
                                isReadOnly
                                isRequired
                                type="text"
                                label="Model"
                                defaultValue="text-embedding-ada-002"
                                description="ID of the model to use. You can use the List models API to see all of your available models, or see our Model overview for descriptions of them."
                            />
                        </div>

                        <div className="col-span-full">
                            <Textarea
                                isRequired
                                label="Input"
                                description="Input text to embed, input must not exceed the max input tokens for the model (8191 tokens for text-embedding-ada-002)."
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                            />
                        </div>

                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <Button
                        type="submit"
                        color="primary"
                        isLoading={isLoading}
                    >
                        {isLoading ? 'Generating...' : 'Generate'}
                    </Button>
                </div>

            </form>

            <Table className="mt-6" aria-label="Example static collection table">
                <TableHeader>
                    <TableColumn>INPUT</TableColumn>
                    <TableColumn>VECTOR</TableColumn>
                    <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                { embeddings.length === 0 && (
                    <TableBody emptyContent={"No rows to display."}>{[]}</TableBody>
                )}
                { embeddings.length > 0 && (
                    <TableBody>
                        {embeddings.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{truncateString(row.input, 30)}</TableCell>
                                <TableCell>{row.vector[0]}, ...</TableCell>
                                <TableCell>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        color="danger"
                                        aria-label="Delete"
                                        onClick={() => deleteRow(index)}
                                    >
                                        <TrashIcon className="h-6 w-6" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                )}
            </Table>
        </>
    )
}
