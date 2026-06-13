"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/app/config/api";

interface ChannelItem {
    channel_id: number;
    user_id: number;
    channel_name: string;
    description: string | null;
    institute_legal_name: string;
    institute_owner_full_name: string;
    physical_corporate_address: string | null;
    co_hosts_and_faculty_members: string[];
    visibility: "public" | "private";
    official_website_link: string | null;
    facebook_portal_link: string | null;
    cover_image: string | null;
    logo_image: string | null;
}

export default function ChannelDirectoryPage() {
    const [channels, setChannels] = useState<ChannelItem[]>([]);
    const [filteredChannels, setFilteredChannels] = useState<ChannelItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Search Engine Parameter States
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [activeVisibilityFilter, setActiveVisibilityFilter] = useState<"all" | "public" | "private">("all");

    useEffect(() => {
        const fetchAllChannels = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/channels/`);

                if (!response.ok) {
                    throw new Error("Failed to parse remote network infrastructure channels ledger database indices.");
                }

                const data = await response.json();
                setChannels(data);
                setFilteredChannels(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "An error occurred compiling directory nodes.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllChannels();
    }, []);

    // Sync Search Query and Visibility Filtering Logic Loops
    useEffect(() => {
        let result = channels;

        if (searchQuery.trim() !== "") {
            const targetQuery = searchQuery.toLowerCase();
            result = result.filter(
                (c) =>
                    c.channel_name.toLowerCase().includes(targetQuery) ||
                    c.institute_legal_name.toLowerCase().includes(targetQuery) ||
                    (c.description && c.description.toLowerCase().includes(targetQuery))
            );
        }

        if (activeVisibilityFilter !== "all") {
            result = result.filter((c) => c.visibility === activeVisibilityFilter);
        }

        setFilteredChannels(result);
    }, [searchQuery, activeVisibilityFilter, channels]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent" />
                <p className="mt-4 text-xs font-mono text-gray-400 tracking-widest uppercase">Syncing Central Matrix...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans antialiased selection:bg-gray-200">

            {/* Dynamic Header Block Container Frame */}
            <div className="bg-white border-b border-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 mix-blend-overlay bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
                            Global Channel Directory
                        </h1>
                        <p className="mt-3 text-base text-gray-500 leading-relaxed">
                            Explore open academic frameworks, sandbox clusters, and sovereign organization entities hosted inside your workspace grid runtime state structure.
                        </p>
                    </div>

                    {/* Interactive Dynamic Creative Filtering Sub-Engine UI Block */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                        {/* Dynamic Search Core Bar Structure */}
                        <div className="md:col-span-8 relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                {/* Search Glass Input Path Icon SVG */}
                                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-gray-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by channel moniker, faculty tag, or parent legal institute system parameters..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder-gray-400 text-sm font-medium text-gray-900"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-900 text-xs font-bold font-mono transition-colors"
                                >
                                    Clear ✕
                                </button>
                            )}
                        </div>

                        {/* Visibility Mode Control Deck Toggle Filters */}
                        <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-1.5 bg-gray-100 p-1 rounded-2xl border border-gray-200">
                            {(["all", "public", "private"] as const).map((filterMode) => (
                                <button
                                    key={filterMode}
                                    onClick={() => setActiveVisibilityFilter(filterMode)}
                                    className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${activeVisibilityFilter === filterMode
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-900"
                                        }`}
                                >
                                    {filterMode}
                                </button>
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* Main Structural Display Layout Content Deck */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {error && (
                    <div className="p-4 mb-8 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-2xl">
                        {error}
                    </div>
                )}

                {/* Evaluation Output Switch */}
                {filteredChannels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredChannels.map((channel) => (
                            <div
                                key={channel.channel_id}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                            >

                                {/* Embedded Graphic Layer Block Card Context */}
                                <div>
                                    <div className="h-28 w-full bg-gradient-to-r from-gray-100 to-gray-200 relative overflow-hidden">
                                        {channel.cover_image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={`${API_BASE_URL}/${channel.cover_image}`}
                                                alt="Channel Asset Banner"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />
                                        )}

                                        {/* Meta Status Float Pin */}
                                        <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${channel.visibility === "public"
                                                ? "bg-green-50/80 border-green-200 text-green-700"
                                                : "bg-purple-50/80 border-purple-200 text-purple-700"
                                            }`}>
                                            {channel.visibility}
                                        </span>
                                    </div>

                                    {/* Body Details Deck Card Stack Layout */}
                                    <div className="p-5 relative">

                                        {/* Overlapping Absolute Circular Shield Container */}
                                        <div className="absolute -top-10 left-5 h-14 w-14 rounded-xl border-2 border-white bg-white shadow-sm overflow-hidden flex-shrink-0">
                                            {channel.logo_image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={`${API_BASE_URL}/${channel.logo_image}`}
                                                    alt="Crest Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white font-black text-xs">
                                                    {channel.channel_name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Text Configuration Data Injections */}
                                        <div className="pt-6">
                                            <h3 className="font-black text-lg text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                                                {channel.channel_name}
                                            </h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-0.5 line-clamp-1">
                                                {channel.institute_legal_name}
                                            </p>

                                            <p className="mt-3 text-xs text-gray-500 line-clamp-3 leading-relaxed min-h-[54px]">
                                                {channel.description || "No description summary contextual mapping provided for this active registry node cluster instance."}
                                            </p>
                                        </div>

                                    </div>
                                </div>

                                {/* Footer Dynamic Connection Direct Entry Points Links */}
                                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <span>{channel.co_hosts_and_faculty_members.length} Members</span>
                                    </div>

                                    <Link
                                        href={`/pages/mychannel/${channel.channel_id}`}
                                        className="inline-flex items-center justify-center text-xs font-bold text-gray-900 hover:text-blue-600 transition-colors"
                                    >
                                        Enter Hub &rarr;
                                    </Link>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty Output Query Layout State Matrix Screen */
                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center max-w-xl mx-auto">
                        <div className="h-10 w-10 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-base font-bold mx-auto mb-4">?</div>
                        <h3 className="font-bold text-gray-900 text-base">No Matching Ecosystem Matrix Indices Found</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                            We couldn&apos;t isolate structural items matching your input. Readjust filter variables or clear criteria state strings.
                        </p>
                        <button
                            onClick={() => { setSearchQuery(""); setActiveVisibilityFilter("all"); }}
                            className="mt-5 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 hover:bg-gray-800"
                        >
                            Reset Search Parameters
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}