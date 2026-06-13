"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { API_BASE_URL } from "../config/api";

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
        {
            sender: "bot",
            text: "Welcome to the Student Support Center. How may I assist you with your course today?",
        },
    ]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userMessage = { sender: "user", text: message };
        setMessages((prev) => [...prev, userMessage]);
        const currentMessage = message;
        setMessage("");
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/chatbot/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: currentMessage }),
            });

            const data = await response.json();
            setMessages((prev) => [...prev, { sender: "bot", text: data.answer }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "An error occurred. Please try again later." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Minimalist Floating Button */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-8 right-8 z-50 bg-gray-900 hover:bg-gray-800 text-white p-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
                <MessageSquare size={22} />
                <span className="text-sm font-medium">LMS Support</span>
            </button>

            {/* Sidebar Chat Window */}
            <div
                className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[60] transform transition-transform duration-500 ease-in-out flex flex-col border-l border-gray-200 ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Formal Header */}
                <div className="bg-white border-b border-gray-200 p-5 flex justify-between items-center">
                    <div>
                        <h2 className="text-gray-900 font-semibold text-lg tracking-tight">Academic Assistant</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-gray-500 font-medium">Available</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50"
                >
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === "user" ? "bg-gray-200" : "bg-gray-900 text-white"
                                    }`}>
                                    {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div
                                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === "user"
                                            ? "bg-gray-900 text-white rounded-tr-none"
                                            : "bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-none"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Refined Input Area */}
                <div className="p-5 border-t border-gray-200 bg-white">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Ask a question about your courses..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 pr-12 text-sm focus:ring-2 focus:ring-gray-900 transition-all outline-none text-gray-800 placeholder:text-gray-500"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!message.trim() || isLoading}
                            className="absolute right-2 p-2 text-gray-400 hover:text-gray-900 disabled:opacity-50 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-gray-400 mt-3 uppercase tracking-widest font-medium">
                        Powered by LMS AI
                    </p>
                </div>
            </div>
        </>
    );
}