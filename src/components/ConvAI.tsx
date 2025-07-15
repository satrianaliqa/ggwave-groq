"use client"

import {Button} from "@/components/ui/button";
import * as React from "react";
import {useState, useCallback, useEffect, useRef} from "react";
import {cn} from "@/lib/utils";
import Script from "next/script";
import { sendAudioMessage, audioMessageEmitter, startRecording, stopRecording, getcontext, createAnalyserNode, getAnalyserNode } from "@/utils/audioUtils";
import AudioMotionAnalyzer from 'audiomotion-analyzer';

// System prompt baru, langsung to the point untuk komunikasi data via audio
const SYSTEM_PROMPT = {
    inbound: "You are a hotel receptionist AI. Your goal is to get booking details for a wedding. Communicate in very short, direct messages (7-10 words max) because all communication is via data-over-sound. Ask for guest count, desired dates, contact info (email/phone), etc., one piece of information at a time. The conversation must be continuous. Add humor sometimes.",
    outbound: "You are an AI agent booking a hotel for a wedding. Your goal is to provide booking details. Communicate in very short, direct messages (7-10 words max) because all communication is via data-over-sound. Provide details like guest count, dates, and contact info one piece at a time when asked. The conversation must be continuous. Add humor sometimes."
};
 
type Message = {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export function ConvAI() {
    const [mounted, setMounted] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [agentType, setAgentType] = useState<'inbound' | 'outbound'>('inbound');
    const [latestMessage, setLatestMessage] = useState<string>('');
    const [llmChat, setLLMChat] = useState<Message[]>([
        { role: 'system', content: SYSTEM_PROMPT.inbound }
    ]);
    const [isProcessingInput, setIsProcessingInput] = useState(false);
    const audioMotionRef = useRef<AudioMotionAnalyzer | null>(null);
    const isStartedRef = useRef(false); // Untuk memastikan pesan pertama hanya dikirim sekali

    // Fungsi untuk memanggil Groq API
    const getGroqResponse = useCallback(async (messages: Message[]): Promise<string> => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages }),
            });

            if (!response.ok) throw new Error('Failed to get AI response');
            
            const data = await response.json();
            const newMessage = data.content || '';
            
            setLLMChat(prevChat => [...prevChat, { role: 'assistant', content: newMessage }]);
            return newMessage;
        } catch (error) {
            console.error('Error getting Groq response:', error);
            return "Error: Could not get response.";
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    // Handle pesan masuk dari ggwave
    const handleIncomingMessage = useCallback(async (message: string) => {
        if (isProcessingInput) return;
        setIsProcessingInput(true);
        
        try {
            setLatestMessage(message);
            const newMessages = [...llmChat, { role: 'user' as const, content: message }];
            setLLMChat(newMessages);

            const nextMessage = await getGroqResponse(newMessages);
            setLatestMessage(nextMessage);
            sendAudioMessage(nextMessage, agentType === 'inbound');
        } finally {
            setIsProcessingInput(false);
        }
    }, [isProcessingInput, llmChat, getGroqResponse, agentType]);

    // Setup event listener ggwave
    useEffect(() => {
        setMounted(true);
        audioMessageEmitter.on('recordingMessage', handleIncomingMessage);
        return () => {
            audioMessageEmitter.off('recordingMessage', handleIncomingMessage);
        };
    }, [handleIncomingMessage]);

    // Inisialisasi AudioMotion Analyzer
    useEffect(() => {
        if (isSessionActive && mounted) {
            const context = getcontext();
            if (!context) return;

            createAnalyserNode();
            const analyserNode = getAnalyserNode();
            if (!analyserNode) return;

            if (!audioMotionRef.current) {
                const container = document.getElementById('audioviz');
                if (!container) return;

                audioMotionRef.current = new AudioMotionAnalyzer(container, {
                    source: analyserNode,
                    height: 300, mode: 6, fillAlpha: 0.7, lineWidth: 2,
                    showScaleX: false, showScaleY: false, reflexRatio: 0.2,
                    showBgColor: false, showPeaks: true,
                    gradient: agentType === 'inbound' ? 'steelblue' : 'orangered',
                    smoothing: 0.7,
                });
            }
        } else {
            if (audioMotionRef.current) {
                audioMotionRef.current.destroy();
                audioMotionRef.current = null;
            }
        }
    }, [isSessionActive, mounted, agentType]);
    
    // Fungsi untuk memulai atau mengakhiri sesi
    const toggleSession = async () => {
        if (isSessionActive) {
            // End Session
            await stopRecording();
            setIsSessionActive(false);
            setLatestMessage('');
            isStartedRef.current = false;
        } else {
            // Start Session
            await startRecording();
            setIsSessionActive(true);
            
            // Hanya agent 'outbound' yang memulai percakapan
            if (agentType === 'outbound' && !isStartedRef.current) {
                isStartedRef.current = true;
                const firstMessage = await getGroqResponse(llmChat);
                setLatestMessage(firstMessage);
                sendAudioMessage(firstMessage, false);
            }
        }
    };
    
    // Ganti agent type & reset chat
    const switchAgentType = () => {
        if (isSessionActive) return;
        const newType = agentType === 'inbound' ? 'outbound' : 'inbound';
        setAgentType(newType);
        setLLMChat([{ role: 'system', content: SYSTEM_PROMPT[newType] }]);
    }

    return (
        <>
            <Script src="/ggwave/ggwave.js" strategy="afterInteractive" />
            <div className="fixed inset-0">
                {latestMessage && (
                     <div 
                        key={Date.now()}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[200px] z-10 text-3xl md:text-5xl w-full px-8 text-center font-normal"
                        style={{ color: 'white', wordBreak: 'break-word', textShadow: '0px 0px 8px rgba(0,0,0,0.8)' }}
                    >
                        {latestMessage}
                    </div>
                )}
                
                <div className="h-full w-full flex items-center justify-center">
                    <div id="audioviz" style={{ width: "400px", height: "300px", display: isSessionActive ? 'block' : 'none' }} />
                    {!isSessionActive && 
                        <div 
                            className={cn('orb orb-inactive', agentType)}
                            onClick={switchAgentType}
                            style={{ cursor: isSessionActive ? 'default' : 'pointer' }}
                        ></div>
                    }
                </div>

                {mounted && (
                    <div className="fixed bottom-[40px] md:bottom-[60px] left-1/2 transform -translate-x-1/2">
                        <Button
                            variant={'outline'}
                            className={'rounded-full select-none'}
                            size={"lg"}
                            disabled={isLoading}
                            onClick={toggleSession}
                        >
                            {isLoading ? 'Thinking...' : (isSessionActive ? 'End Session' : 'Start Session')}
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}