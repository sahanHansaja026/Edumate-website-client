"use client";

import React, { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2, AlertTriangle, BarChart3, Layers, Folder } from "lucide-react";
import { API_BASE_URL } from "@/app/config/api";

interface BackendComment {
    comment_id: number;
    module_id: string;
    module_name?: string; // 🔥 Added to accept the module name from backend
    user_id: number;
    text: string;
    sentiment: "Positive" | "Negative";
}

interface ApiResponse {
    owner_user_id: number;
    total_comments: number;
    positive: number;
    negative: number;
    comments: BackendComment[];
}

interface CommentSectionProps {
    ownerId: number;
}

export default function CommentSection({ ownerId }: CommentSectionProps) {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ownerId || !API_BASE_URL) {
            setError(!ownerId ? "Waiting for a valid Owner ID context..." : "Configuration Error: API_BASE_URL is undefined.");
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const signal = controller.signal;

        async function fetchSentiments() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/sentiment/module-owner/${ownerId}`, {
                    method: "GET",
                    signal: signal,
                    headers: { "Accept": "application/json", "Content-Type": "application/json" }
                });

                if (!response.ok) throw new Error(`HTTP Error status: ${response.status}`);
                const json: ApiResponse = await response.json();
                setData(json);
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    setError(err.message || "Could not complete network transfer.");
                }
            } finally {
                setLoading(false);
            }
        }

        fetchSentiments();
        return () => controller.abort();
    }, [ownerId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-gray-500 gap-3 border border-gray-100 rounded-2xl bg-white max-w-md mx-auto my-8">
                <Loader2 className="h-5 w-5 animate-spin text-gray-950" />
                <span className="text-xs font-mono tracking-wider uppercase font-bold text-gray-900">Evaluating sentiments...</span>
            </div>
        );
    }

    if (error || !data || data.total_comments === 0) {
        return (
            <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-2xl bg-white">
                <p className="text-sm text-gray-900 font-medium mb-1">No metadata signatures discovered</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* METRICS DASHBOARD */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <BarChart3 size={14} className="text-gray-950" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-900">Aggregated Model Analytics</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-sm">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block mb-1">Total Scanned</span>
                        <span className="text-2xl font-black text-gray-950 tracking-tight">{data.total_comments}</span>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block mb-1">Sentiment Positive</span>
                        <span className="text-2xl font-black text-gray-950 tracking-tight">{data.positive}</span>
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-100">
                            <div className="h-full bg-gray-950" style={{ width: `${(data.positive / data.total_comments) * 100}%` }} />
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block mb-1">Sentiment Negative</span>
                        <span className="text-2xl font-black text-gray-950 tracking-tight">{data.negative}</span>
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-100">
                            <div className="h-full bg-gray-400" style={{ width: `${(data.negative / data.total_comments) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* DISCUSSION FEED */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Layers size={14} className="text-gray-950" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-900">Classification Output Feed</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.comments.map((comment) => {
                        const isPositive = comment.sentiment === "Positive";

                        return (
                            <div key={comment.comment_id} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-950 transition-all duration-300 flex flex-col justify-between">
                                <div className="mb-4">
                                    <p className="text-sm text-gray-950 font-medium leading-relaxed">"{comment.text}"</p>
                                </div>

                                {/* Status Card Footer */}
                                <div className="flex items-center justify-between pt-3.5 border-t border-gray-100 mt-auto">
                                    {/* 🔥 SHOWING MODULE NAME INSTEAD OF ID */}
                                    <div className="flex items-center gap-1.5 text-gray-600 max-w-[70%]">
                                        <Folder size={12} className="text-gray-400 shrink-0" />
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-tight truncate">
                                            {comment.module_name || `Module #${comment.module_id}`}
                                        </span>
                                    </div>

                                    {/* Sentiment Pill */}
                                    <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${isPositive ? "bg-gray-100 text-gray-950 border border-gray-200" : "bg-gray-950 text-white shadow-sm"}`}>
                                        {isPositive ? <ThumbsUp size={10} /> : <ThumbsDown size={10} />}
                                        <span>{isPositive ? "Pos" : "Neg"}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}