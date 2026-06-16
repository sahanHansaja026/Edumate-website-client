import React, { useState, useEffect } from "react";
import { ShieldAlert, Users, Radio, Loader2, BookOpen } from "lucide-react";
import { API_BASE_URL } from "@/app/config/api";

// ==========================================
// 1. TYPE DEFINITIONS (Fixes ts(2339) error)
// ==========================================
interface ChannelModule {
    module_id: number;
    name: string;
    description: string;
    visibility: string;
    cover_image: string | null;
    skills: string | null;
    student_count: number;
}

interface ChannelData {
    channel_id: number;
    channel_name: string;
    description: string;
    visibility: string;
    institute_legal_name: string;
    modules_count: number;
    total_students: number;
    modules: ChannelModule[];
}

interface AnalyticsResponse {
    user_id: number;
    channels_count: number;
    channels: ChannelData[];
}

interface ChannelManagerProps {
    userId?: number;
}

// ==========================================
// 2. RESPONSIVE COMPONENT
// ==========================================
export default function ChannelManager({ userId = 1 }: ChannelManagerProps) {
    // Explicitly typing the state hook to accept our API payload or null
    const [analyticsData, setAnalyticsData] = useState<AnalyticsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/channel-analytics/${userId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP Error: Master data fetch failed with status ${res.status}`);
                }
                return res.json();
            })
            .then((data: AnalyticsResponse) => {
                setAnalyticsData(data);
                setError(null);
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : "An unexpected error occurred");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [userId]);

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[350px] w-full gap-3 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
                <p className="text-sm text-gray-500 font-mono tracking-wide">Syncing runtime infrastructure...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="mx-auto my-6 max-w-2xl w-full p-5 border border-red-200 bg-red-50 text-red-800 rounded-xl flex items-start gap-4 shadow-sm">
                <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                <div className="space-y-1">
                    <h5 className="font-bold text-sm tracking-tight">API Stream Disrupted</h5>
                    <p className="text-xs text-red-700 font-mono leading-relaxed">{error}</p>
                </div>
            </div>
        );
    }

    // Empty/No Channels State
    if (!analyticsData || analyticsData.channels_count === 0) {
        return (
            <div className="text-center p-12 border border-dashed border-gray-300 rounded-xl max-w-xl mx-auto my-8 bg-gray-50/50">
                <Radio className="h-8 w-8 text-gray-400 mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-gray-600 font-medium">No operational channel footprints allocated to this profile.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-16">

            {/* Loop through all returned channels */}
            {analyticsData.channels.map((channel) => (
                <div
                    key={channel.channel_id}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-start border-b border-gray-100 pb-12 last:border-b-0 last:pb-0"
                >

                    {/* LEFT PANEL: Core Metadata Card (Sticky positioning on desktop screens) */}
                    <div className="lg:col-span-1 lg:sticky lg:top-6 border border-gray-200 rounded-2xl p-6 bg-white shadow-sm space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Radio size={15} className="animate-pulse text-red-500" />
                                <span className="text-[10px] font-mono font-black tracking-widest uppercase text-gray-500 truncate">
                                    {channel.institute_legal_name || "Live Instance Context"}
                                </span>
                            </div>
                            <h4 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">
                                {channel.channel_name}
                            </h4>
                            {channel.description && (
                                <p className="text-xs text-gray-500 leading-relaxed font-normal">
                                    {channel.description}
                                </p>
                            )}
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Audience Reach</span>
                                    <span className="text-xl sm:text-2xl font-black text-gray-900 block">
                                        {channel.total_students.toLocaleString()} Students
                                    </span>
                                </div>
                                <Users className="h-6 w-6 text-gray-400 flex-shrink-0" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Dynamic Module Inventory */}
                    <div className="lg:col-span-2 border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-gray-900 flex-shrink-0" />
                                <h4 className="font-bold text-sm sm:text-base text-gray-900 tracking-tight">
                                    Course Modules Structure
                                </h4>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-md w-fit">
                                ALLOCATED MODULES: {channel.modules_count}
                            </span>
                        </div>

                        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                            The micro-learning nodes documented below process distinct user footprints, display parameters, and isolated capability profiles.
                        </p>

                        {/* List Layout */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                            {channel.modules.length === 0 ? (
                                <div className="p-8 text-center text-xs text-gray-400 font-mono font-medium">
                                    No modules map directly to this stream layout.
                                </div>
                            ) : (
                                channel.modules.map((module) => (
                                    <div
                                        key={module.module_id}
                                        className="p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-gray-50/70 transition-colors"
                                    >
                                        <div className="space-y-1.5 min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-bold text-gray-900 tracking-tight truncate">
                                                    {module.name}
                                                </p>
                                                <span className="text-[9px] font-mono font-semibold border px-1.5 py-0.5 rounded text-gray-500 bg-gray-50 uppercase tracking-wider">
                                                    {module.visibility}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed pr-2">
                                                {module.description}
                                            </p>
                                            {module.skills && (
                                                <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                                                    <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-tight">Capacities:</span>
                                                    <span className="text-[10px] font-mono text-gray-600 bg-gray-100/80 px-2 py-0.5 rounded">
                                                        {module.skills}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Badge alignment adjustments for mobile to desktop viewports */}
                                        <div className="flex-shrink-0 self-start sm:self-center">
                                            <span className="text-[10px] font-mono font-bold tracking-wider px-3 py-1 rounded-full uppercase border select-none block text-center bg-white text-gray-900 border-gray-900 whitespace-nowrap shadow-sm">
                                                {module.student_count} Active
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            ))}
        </div>
    );
}