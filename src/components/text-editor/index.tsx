"use client"
import React, {useEffect, useState} from 'react';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import axios from 'axios';

import { saveAs } from 'file-saver';

interface CountDetails {
    text: string;
    characters: number;
    words: number;
    specialCharacters: number;
}

interface ElementProps {
    children: React.ReactNode | React.ReactNode[];
}

interface Element {
    type: string;
    key: string | null;
    ref: React.Ref<any> | null;
    props: ElementProps;
    _owner: any;
    _store: any;
}

const TextEditor = () => {
    const [value, setValue] = useState('');
    const [topic, setTopic] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [totalCharacter, setTotalCharacter] = useState<number>(0)
    const [totalWords, setTotalWords] = useState<number>(0)
    const [totalSpecialCharacter, setTotalSpecialCharacter] = useState<number>(0)

    console.log('Current value:', value);

    const modules = {
        toolbar: [
            [{size: ["small", false, "large", "huge"]}],
            ["bold", "italic", "underline", "strike", "blockquote"],
            ["link"],
            [
                {list: "ordered"},
                {list: "bullet"},
                {indent: "-1"},
                {indent: "+1"},
                {align: []}
            ],
            [{"color": ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", 'custom-color']}],
        ]
    };

    const formats: string[] = [
        "header", "height", "bold", "italic",
        "underline", "strike", "blockquote",
        "list", "color", "bullet", "indent",
        "link", "image", "align", "size",
    ];

    // AI text generation using an open-source model API
    const generateText = async (topic: string) => {
        const headers = {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPEN_AI_KEY_Second}`,
            }
        };

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/completions',
                {
                    model: 'text-embedding-ada-002', // Specify the model here
                    prompt: topic,
                    max_tokens: 100,
                    temperature: 0.7, // Adjust the temperature for randomness
                },
                {
                    ...headers
                }
            );

            return response.data.choices[0].text;
        } catch (error) {
            console.error('Error generating text:', error);
            throw new Error('Text generation failed');
        }
    };

    const processHtmlString = (htmlString: string): string => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const body = doc.body;

        const extractText = (node: ChildNode | Node): string => {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent || '';
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                return Array.from(node.childNodes).map(extractText).join(' ');
            }
            return '';
        };

        let text = extractText(body);
        text = text
            .replace(/\s+/g, ' ') // Normalize multiple spaces
            .trim();

        return text;
    };

    useEffect(() => {
        if (value) {
            try {
                const text = processHtmlString(value);
                const characters = text.length;
                const words = text.split(/\s+/).filter(word => word.length > 0).length;
                const specialCharacters = text.replace(/[a-zA-Z0-9\s]/g, '').length;
                setTotalCharacter(characters);
                setTotalSpecialCharacter(specialCharacters)
                setTotalWords(words)
                console.log('Processed Text:', text);
                console.log('Counting Details:', {
                    text,
                    characters,
                    words,
                    specialCharacters
                });
            } catch (error) {
                console.error('Error processing HTML:', error);
            }
        }
    }, [value]);
    const handleExport = (format) => {
        const blob = new Blob([value], { type: format });
        saveAs(blob, `document.${format === 'application/pdf' ? 'pdf' : 'docx'}`);
    };


    return (

        <>
            <div className={'p-12'}>
                <h1 className={'text-3xl text-black text-center pb-8'}>TEXT EDITOR</h1>

                <div className="flex ">
                    <button onClick={() => handleExport('application/pdf')} className={'text-black'}>Export to PDF</button>
                    <button
                        onClick={() => handleExport('application/vnd.openxmlformats-officedocument.wordprocessingml.document')} className={'text-black'}>Export
                        to Word
                    </button>
                </div>

                <ReactQuill

                    theme="snow"
                    modules={modules}
                    formats={formats}
                    placeholder="Write your content..."
                    value={value}
                    onChange={setValue}
                    style={{height: "220px", color: '#000', fontSize: '16px'}}
                />
                <div className={'flex justify-center gap-10'}>

                    <h2 className={'text-lg text-black'}>TotalCharacter : {totalCharacter}</h2>
                    <h2 className={'text-lg text-black'}>TotalWords : {totalWords}</h2>
                    <h2 className={'text-lg text-black'}>TotalSpecialCharacter : {totalSpecialCharacter}</h2>

                </div>
            </div>
        </>

    );
};

export default TextEditor;
