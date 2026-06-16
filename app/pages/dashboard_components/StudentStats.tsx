"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Award, Tv, ShieldCheck, ArrowUpRight, Loader2, Layers } from "lucide-react";
import { getUser } from "@/app/services/authService";
import { API_BASE_URL } from "@/app/config/api";

// Define Frontend Interfaces matching your exact FastAPI Response Schema
interface BackendModule {
    moduleId: number;
    moduleName: string | null;
    instructor: string | null;
    userId: number;
}

interface BackendChannel {
    channelId: number;
    channelName: string | null;
    modules: BackendModule[];
}

interface ChannelCountResponse {
    student_email: string;
    channel_count: number;
    channel_ids: number[];
}

interface ModuleBreakdownResponse {
    email: string;
    user_id: number;
    channel_modules: number;
    normal_modules: number;
    total_modules: number;
}

export default function StudentStats() {
    const [user, setUser] = useState<{ email: string } | null>(null);
    const [realUserId, setRealUserId] = useState<number | null>(null);

    // API States
    const [liveChannelCount, setLiveChannelCount] = useState<number | null>(null);
    const [liveChannels, setLiveChannels] = useState<BackendChannel[]>([]);
    const [moduleBreakdown, setModuleBreakdown] = useState<ModuleBreakdownResponse | null>(null);

    // Loading States
    const [isLoadingCount, setIsLoadingCount] = useState<boolean>(false);
    const [isLoadingChannels, setIsLoadingChannels] = useState<boolean>(false);
    const [isLoadingBreakdown, setIsLoadingBreakdown] = useState<boolean>(false);

    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);
    }, []);

    // Phase 1: Fetch Channel data using the user's email
    useEffect(() => {
        if (!user?.email) return;

        const encodedEmail = encodeURIComponent(user.email);

        // Fetch Route 1: Count Summary
        const fetchChannelCount = async () => {
            setIsLoadingCount(true);
            try {
                const response = await fetch(`${API_BASE_URL}/student-channel-count/${encodedEmail}`);
                if (!response.ok) throw new Error("Failed to fetch count");
                const data: ChannelCountResponse = await response.json();
                setLiveChannelCount(data.channel_count);
            } catch (error) {
                console.error("Error fetching channel counts:", error);
            } finally {
                setIsLoadingCount(false);
            }
        };

        // Fetch Route 2: Complete Enrolled Details (Extracts the real user.id)
        const fetchEnrolledChannels = async () => {
            setIsLoadingChannels(true);
            try {
                const response = await fetch(`${API_BASE_URL}/student-channel-count/enrolled-channels/${encodedEmail}`);
                if (!response.ok) throw new Error("Failed to fetch workspace channels");
                const data: BackendChannel[] = await response.json();
                setLiveChannels(data);

                // Dynamically grab the first available user_id from enrolled modules to settle the profile link
                const firstModuleWithUser = data.flatMap(c => c.modules).find(m => m.userId);
                if (firstModuleWithUser) {
                    setRealUserId(firstModuleWithUser.userId);
                }
            } catch (error) {
                console.error("Error fetching enrolled channels:", error);
            } finally {
                setIsLoadingChannels(false);
            }
        };

        fetchChannelCount();
        fetchEnrolledChannels();
    }, [user]);

    // Phase 2: Fetch the unified Module breakdown once BOTH email and user_id are resolved
    useEffect(() => {
        if (!user?.email || !realUserId) return;

        const encodedEmail = encodeURIComponent(user.email);

        const fetchModuleBreakdown = async () => {
            setIsLoadingBreakdown(true);
            try {
                const response = await fetch(
                    `${API_BASE_URL}/student-channel-count/enrollement_count/?email=${encodedEmail}&user_id=${realUserId}`
                );
                if (!response.ok) throw new Error("Failed to fetch enrollment count breakdown");
                const data: ModuleBreakdownResponse = await response.json();
                setModuleBreakdown(data);
            } catch (error) {
                console.error("Error fetching enrollment modules breakdown:", error);
            } finally {
                setIsLoadingBreakdown(false);
            }
        };

        fetchModuleBreakdown();
    }, [user, realUserId]);

    // Flatten all modules for the ledger view
    const allModules = liveChannels.flatMap((channel) =>
        channel.modules.map((mod) => ({
            id: mod.moduleId,
            name: mod.moduleName || "Unnamed Module",
            channelName: channel.channelName || "Unknown Channel",
            // Since API tracks existence/enrollment without numerical grades, 
            // we default to a standard 100% completion score upon database validation.
            progress: 100
        }))
    );

    const totalChannelsCount = liveChannelCount !== null ? liveChannelCount : liveChannels.length;

    return (
        <div className="space-y-10">
            {user && (
                <div className="text-sm font-medium text-gray-500 flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                        Current user email: <span className="text-gray-900 font-bold">{user.email}</span>
                    </div>
                    {realUserId && (
                        <div className="text-xs text-gray-400 font-mono">
                            Database User ID: <span className="text-gray-600 font-bold">{realUserId}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Overview Stat Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-xl p-6 bg-white flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Channels</p>
                        {isLoadingCount ? (
                            <div className="mt-2 animate-spin text-gray-400">
                                <Loader2 className="h-6 w-6" />
                            </div>
                        ) : (
                            <p className="text-3xl font-black mt-1 text-gray-900">{totalChannelsCount}</p>
                        )}
                    </div>
                    <Tv className="h-8 w-8 text-gray-300" />
                </div>

                <div className="border border-gray-200 rounded-xl p-6 bg-white flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Unique Modules</p>
                        {isLoadingBreakdown ? (
                            <div className="mt-2 animate-spin text-gray-400">
                                <Loader2 className="h-6 w-6" />
                            </div>
                        ) : (
                            <p className="text-3xl font-black mt-1 text-gray-900">
                                {moduleBreakdown ? moduleBreakdown.total_modules : 0}
                            </p>
                        )}
                    </div>
                    <BookOpen className="h-8 w-8 text-gray-300" />
                </div>

                <div className="border border-gray-200 rounded-xl p-6 bg-white flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Standard Enrollments</p>
                        {isLoadingBreakdown ? (
                            <div className="mt-2 animate-spin text-gray-400">
                                <Loader2 className="h-6 w-6" />
                            </div>
                        ) : (
                            <p className="text-3xl font-black mt-1 text-gray-900">
                                {moduleBreakdown ? moduleBreakdown.normal_modules : 0}
                            </p>
                        )}
                    </div>
                    <Layers className="h-8 w-8 text-gray-300" />
                </div>
            </div>

            {/* Split Interface layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Side: Module Tracking Ledger (Visual Grade Bars Retained) */}
                <div className="lg:col-span-2 border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                        <Award className="h-5 w-5 text-gray-900" />
                        <h4 className="font-bold text-gray-900">Module Enrollment Performance</h4>
                    </div>

                    {isLoadingChannels ? (
                        <div className="flex justify-center items-center py-12 text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : allModules.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4">No active module records discovered.</p>
                    ) : (
                        <div className="space-y-6">
                            {allModules.map((mod, index) => (
                                <div key={`${mod.id}-${index}`} className="space-y-2 group">
                                    <div className="flex justify-between items-start text-xs font-medium">
                                        <div className="space-y-0.5 max-w-[80%]">
                                            <span className="text-gray-900 font-bold block truncate" title={mod.name}>
                                                {mod.name}
                                            </span>
                                            <span className="text-gray-400 text-[10px] block font-mono">
                                                Track: {mod.channelName}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-sm text-emerald-600">Active</span>
                                        </div>
                                    </div>

                                    <div className="w-full bg-gray-100 rounded-full h-3 relative overflow-hidden">
                                        <div
                                            className="h-3 rounded-full bg-emerald-600 transition-all duration-700 ease-out"
                                            style={{ width: `${mod.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Channel Workspace Tree Mapping */}
                <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                        <Tv className="h-5 w-5 text-gray-900" />
                        <h4 className="font-bold text-gray-900">Workspace Mapping</h4>
                    </div>

                    {isLoadingChannels ? (
                        <div className="flex justify-center items-center py-12 text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : liveChannels.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4">No workspace mappings established yet.</p>
                    ) : (
                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-1">
                            {liveChannels.map((channel) => (
                                <div key={channel.channelId} className="border border-gray-100 bg-gray-50/50 p-4 rounded-xl space-y-3">
                                    <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                                        <span className="text-xs font-black tracking-tight text-gray-900 uppercase truncate pr-2">
                                            {channel.channelName || "Unassigned Channel Name"}
                                        </span>
                                        <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                    </div>

                                    <div className="space-y-3">
                                        {channel.modules.map((m) => (
                                            <div key={m.moduleId} className="text-[11px] space-y-1 border-b border-gray-100 last:border-none pb-1 last:pb-0">
                                                <p className="text-gray-800 font-medium leading-tight">
                                                    {m.moduleName || "Unnamed Submodule"}
                                                </p>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                                                    <ShieldCheck className="h-3 w-3 text-gray-400" />
                                                    <span className="truncate">Instructor: {m.instructor || "Not assigned"}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}