"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Trash2, Edit2, Check, X } from "lucide-react";
import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "../services/authService";

type Comment = {
    id: number;
    user_id: number;
    module_id: number;
    text: string;
    created_at: string;
};

type Props = {
    moduleId: number;
    onClose?: () => void;
};

export default function CommentsSection({ moduleId }: Props) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    // Editing State
    const [editId, setEditId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");

    const messageEndRef = useRef<HTMLDivElement>(null);

    const user = getUser();
    const userId = user?.user_id || user?.id;

    // =========================
    // FETCH COMMENTS
    // =========================
    const fetchComments = async () => {
        try {
            const res = await fetch(
                `${API_BASE_URL}/modules/comments/${moduleId}`
            );
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) {
            console.error("Failed to fetch comments:", err);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [moduleId]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    // =========================
    // CREATE COMMENT
    // =========================
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || loading || !userId) return;

        setLoading(true);
        try {
            await fetch(
                `${API_BASE_URL}/modules/${moduleId}/comments`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: userId,
                        module_id: moduleId,
                        text: text.trim(),
                    }),
                }
            );
            setText("");
            await fetchComments();
        } catch (err) {
            console.error("Error creating comment:", err);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // DELETE COMMENT
    // =========================
    const handleDelete = async (id: number) => {
        try {
            await fetch(
                `${API_BASE_URL}/modules/${moduleId}/comments/${id}`,
                {
                    method: "DELETE",
                }
            );
            fetchComments();
        } catch (err) {
            console.error("Error deleting comment:", err);
        }
    };

    // =========================
    // UPDATE COMMENT
    // =========================
    const handleUpdate = async (id: number) => {
        if (!editText.trim()) return;
        try {
            await fetch(
                `${API_BASE_URL}/modules/${moduleId}/comments/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: editText.trim(),
                    }),
                }
            );
            setEditId(null);
            setEditText("");
            fetchComments();
        } catch (err) {
            console.error("Error updating comment:", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white w-full relative border-l border-gray-200">

            {/* SCROLLABLE CHAT CONTAINER (Responsive text & paddings) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {comments.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs bg-gray-50 rounded-xl max-w-xs mx-auto p-4 border border-gray-100">
                        🔒 No messages yet. Start the conversation module!
                    </div>
                ) : (
                    comments.map((c) => {
                        const isMe = c.user_id === userId;

                        return (
                            <div
                                key={c.id}
                                className={`flex flex-col w-full mb-1 ${isMe ? "items-end" : "items-start"}`}
                            >
                                {/* Chat Bubble Body */}
                                <div
                                    className={`relative max-w-[85%] sm:max-w-[75%] px-3.5 py-2 shadow-sm rounded-2xl text-sm transition-all
                                        ${isMe
                                            ? "bg-gray-900 text-white rounded-tr-none"
                                            : "bg-gray-100 text-gray-900 rounded-tl-none"
                                        }`}
                                >
                                    {/* Message Text vs Inline Editing Input */}
                                    {editId === c.id ? (
                                        <div className="flex items-center gap-2 py-0.5 min-w-[200px] sm:min-w-[260px]">
                                            <input
                                                type="text"
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                className="w-full p-1.5 bg-white text-gray-900 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                                                autoFocus
                                            />
                                            <button onClick={() => handleUpdate(c.id)} className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 shrink-0">
                                                <Check className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => setEditId(null)} className="p-1.5 bg-gray-600 text-white rounded hover:bg-gray-500 shrink-0">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="pb-4 break-words whitespace-pre-line leading-relaxed">
                                            {c.text}
                                        </div>
                                    )}

                                    {/* Timestamp Layout inside bubble base */}
                                    <div className={`absolute bottom-1 right-2.5 flex items-center gap-1 text-[10px] select-none ${isMe ? "text-gray-400" : "text-gray-500"}`}>
                                        <span>
                                            {c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                        </span>
                                    </div>
                                </div>

                                {/* ACTION BUTTONS DISPLAYED DIRECTLY UNDER COMMENT ROW */}
                                {isMe && editId !== c.id && (
                                    <div className="flex items-center gap-3 mt-1 px-1 text-gray-400">
                                        <button
                                            onClick={() => {
                                                setEditId(c.id);
                                                setEditText(c.text);
                                            }}
                                            className="flex items-center gap-1 text-xs hover:text-gray-700 transition-colors py-0.5"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            <span>Edit</span>
                                        </button>
                                        <span className="text-gray-200 text-xs">|</span>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="flex items-center gap-1 text-xs hover:text-red-600 text-gray-400 transition-colors py-0.5"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messageEndRef} />
            </div>

            {/* BOTTOM PERSISTENT BAR FOR CONTROLS */}
            <form onSubmit={handleSend} className="p-3 bg-gray-50 flex items-center gap-2 border-t border-gray-100">
                <div className="relative flex-1 flex items-center w-full">
                    <input
                        type="text"
                        placeholder={userId ? "Type a message..." : "Log in to text..."}
                        disabled={!userId}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full pl-4 pr-12 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 placeholder-gray-400 text-gray-800 shadow-sm transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!text.trim() || loading || !userId}
                        className="absolute right-2 p-1.5 bg-gray-900 text-white hover:bg-gray-800 rounded-lg disabled:opacity-20 disabled:hover:bg-gray-900 transition-all"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </form>
        </div>
    );
}