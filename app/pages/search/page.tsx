"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Compass, Tag, Layers, User, ExternalLink, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/app/config/api";

interface Owner {
    email: string;
    first_name: string | null;
    last_name: string | null;
}

interface Module {
    module_id: number;
    channel_id?: number;
    user_id: number;
    name: string;
    description?: string | null;
    skills: string[];
    visibility: "public" | "private";
    type: "module" | "channel_module";
    owner?: Owner;
}

export default function ModuleSearchPage() {
    const [modules, setModules] = useState<Module[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // -----------------------------
    // FETCH MODULES & STATIC TAGS
    // -----------------------------
    useEffect(() => {
        const fetchModules = async () => {
            setLoading(true);
            setErrorMsg(null);

            try {
                const params = new URLSearchParams();
                if (searchQuery) params.append("search", searchQuery);

                // Appends tags sequentially for FastAPI List parsing
                selectedTags.forEach(tag => params.append("tags", tag));

                // Formulate the endpoint cleanly using your configured API base
                const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
                const res = await fetch(`${cleanBase}/modules_search?${params.toString()}`);

                // Check for server-side errors (404, 500, etc.)
                if (!res.ok) {
                    throw new Error(`Server status returned ${res.status}`);
                }

                // Verify the response content type before parsing JSON
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const htmlFallback = await res.text();
                    console.error("Expected JSON, received HTML payload instead:", htmlFallback);
                    throw new TypeError("Received an invalid response format (HTML) from the server endpoint.");
                }

                const data = await res.json();
                const list = data.data || [];
                setModules(list);

                // Safely compute distinct tags using a functional state check to avoid re-renders
                setAllTags(prevTags => {
                    if (prevTags.length > 0) return prevTags;
                    const tagsSet = new Set<string>();
                    list.forEach((m: Module) => {
                        m.skills?.forEach(skill => tagsSet.add(skill));
                    });
                    return Array.from(tagsSet);
                });
            } catch (err: any) {
                console.error("Fetch Exception caught:", err);
                setErrorMsg(err.message || "An unexpected network error occurred.");
                setModules([]);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchModules, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedTags]); // Removed allTags.length dependency to prevent structural re-renders

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedTags([]);
    };

    return (
        <div className="min-h-screen bg-white text-zinc-900 antialiased selection:bg-zinc-100">
            {/* TOP HEADER CONTROLS */}
            <header className="border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Explore Modules</h1>
                            <p className="text-xs text-zinc-500 mt-0.5">Discover skills, channels, and learning tracks</p>
                        </div>

                        {/* SEARCH BAR */}
                        <div className="relative flex-1 max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                            <input
                                className="w-full pl-9 pr-9 py-2 text-sm bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white border border-zinc-200 focus:border-zinc-400 rounded-lg outline-none transition-all"
                                placeholder="Search by name, owner, or topic..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* MOBILE TAGS ROLL */}
                    {allTags.length > 0 && (
                        <div className="flex md:hidden items-center gap-2 overflow-x-auto pt-3 pb-1 no-scrollbar mask-image">
                            <span className="text-xs font-medium text-zinc-400 flex items-center gap-1 shrink-0">
                                <SlidersHorizontal size={12} /> Filters:
                            </span>
                            {allTags.map(tag => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`text-xs px-2.5 py-1 rounded-full border transition shrink-0 ${isSelected
                                            ? "bg-zinc-900 border-zinc-900 text-white"
                                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8 items-start">

                    {/* DESKTOP SIDEBAR */}
                    <aside className="w-60 shrink-0 hidden md:block sticky top-24">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                <Tag size={12} /> Filter by Tags
                            </h2>
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={() => setSelectedTags([])}
                                    className="text-xs text-zinc-500 hover:text-zinc-900 transition underline underline-offset-2"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="space-y-1.5 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                            {allTags.map(tag => {
                                const isChecked = selectedTags.includes(tag);
                                return (
                                    <label
                                        key={tag}
                                        className={`flex items-center justify-between gap-2 text-sm px-2 py-1.5 rounded-md cursor-pointer transition ${isChecked ? "bg-zinc-50 font-medium text-zinc-900" : "text-zinc-600 hover:bg-zinc-50/50 hover:text-zinc-900"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <input
                                                type="checkbox"
                                                className="accent-zinc-900 rounded border-zinc-300 focus:ring-zinc-500 h-3.5 w-3.5"
                                                checked={isChecked}
                                                onChange={() => toggleTag(tag)}
                                            />
                                            <span className="truncate">{tag}</span>
                                        </div>
                                    </label>
                                );
                            })}
                            {allTags.length === 0 && (
                                <p className="text-xs text-zinc-400 italic">No tags available</p>
                            )}
                        </div>
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <main className="flex-1 min-w-0">
                        {loading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="border border-zinc-100 rounded-xl p-5 space-y-3 animate-pulse">
                                        <div className="h-4 bg-zinc-100 rounded w-2/3"></div>
                                        <div className="h-3 bg-zinc-100 rounded w-1/3"></div>
                                        <div className="space-y-1.5 pt-2">
                                            <div className="h-3 bg-zinc-100 rounded w-full"></div>
                                            <div className="h-3 bg-zinc-100 rounded w-4/5"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : errorMsg ? (
                            <div className="text-center py-12 border border-red-100 rounded-xl bg-red-50/30 max-w-xl mx-auto px-4">
                                <p className="text-sm font-medium text-red-800">Connection Failed</p>
                                <p className="text-xs text-red-600/80 mt-1">{errorMsg}</p>
                                <p className="text-xs text-zinc-500 mt-4">
                                    Double-check if your backend service is running and endpoints are configured to route queries properly.
                                </p>
                            </div>
                        ) : modules.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                                <Compass className="mx-auto text-zinc-300 stroke-[1.5]" size={36} />
                                <h3 className="mt-4 text-sm font-medium text-zinc-900">No modules found</h3>
                                <p className="mt-1 text-xs text-zinc-500 max-w-xs mx-auto">
                                    We couldn't find anything matching your requirements. Try adjusting your scope.
                                </p>
                                {(searchQuery || selectedTags.length > 0) && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-4 text-xs font-medium text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 active:bg-zinc-100 transition"
                                    >
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {modules.map((m) => (
                                    <div
                                        key={m.module_id}
                                        className="border border-zinc-100 hover:border-zinc-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md/5 transition flex flex-col justify-between group"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <h3 className="font-medium text-zinc-900 text-sm group-hover:text-zinc-700 line-clamp-1 transition">
                                                    {m.name}
                                                </h3>
                                                <span className={`text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded ${m.type === "channel_module"
                                                    ? "bg-indigo-50 text-indigo-600"
                                                    : "bg-amber-50 text-amber-600"
                                                    }`}>
                                                    {m.type === "channel_module" ? "Channel" : "Standard"}
                                                </span>
                                            </div>

                                            {m.owner && (
                                                <div className="flex items-center gap-1 text-zinc-400 mb-3 text-xs">
                                                    <User size={12} />
                                                    <span className="truncate">
                                                        {m.owner.first_name ? `${m.owner.first_name} ${m.owner.last_name || ""}` : m.owner.email}
                                                    </span>
                                                </div>
                                            )}

                                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4">
                                                {m.description || "No description provided for this module."}
                                            </p>
                                        </div>

                                        <div>
                                            {m.skills && m.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {m.skills.slice(0, 3).map((skill, index) => (
                                                        <span key={index} className="text-[10px] bg-zinc-50 border border-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {m.skills.length > 3 && (
                                                        <span className="text-[10px] text-zinc-400 font-medium pl-0.5 self-center">
                                                            +{m.skills.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <Link
                                                href={`/modules/${m.module_id}`}
                                                className="w-full inline-flex items-center justify-center gap-1 text-xs font-medium text-zinc-700 bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white border border-zinc-100 group-hover:border-zinc-900 py-1.5 px-3 rounded-lg transition-all"
                                            >
                                                View Module <ExternalLink size={12} className="opacity-60 group-hover:opacity-100" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>

                </div>
            </div>
        </div>
    );
}