"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Compass, Tag, Layers, User, ExternalLink, SlidersHorizontal } from "lucide-react";
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

    // -----------------------------
    // FETCH MODULES & STATIC TAGS
    // -----------------------------
    useEffect(() => {
        const fetchModules = async () => {
            setLoading(true);

            try {
                const params = new URLSearchParams();
                if (searchQuery) params.append("search", searchQuery);
                selectedTags.forEach(tag => params.append("tag", tag));

                const res = await fetch(
                    `http://localhost:8000/modules?${params.toString()}`
                );

                const data = await res.json();
                const list = data.data || [];
                setModules(list);

                // Populate initial tags only if they haven't been loaded yet 
                // to prevent sidebar filters from disappearing during filtering
                if (allTags.length === 0 && list.length > 0) {
                    const tags = new Set<string>();
                    list.forEach((m: Module) => {
                        m.skills?.forEach(skill => tags.add(skill));
                    });
                    setAllTags(Array.from(tags));
                }
            } catch (err) {
                console.error(err);
                setModules([]);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchModules, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedTags, allTags.length]);

    // -----------------------------
    // TOGGLE TAG CHECKBOX
    // -----------------------------
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

                    {/* MOBILE TAGS ROLL (Visible only on mobile/tablet) */}
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

                    {/* ================= DESKTOP SIDEBAR ================= */}
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

                    {/* ================= MAIN CONTENT AREA ================= */}
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
                                        className="mt-4 text-xs font-medium inline-flex items-center justify-center px-3 py-1.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg transition"
                                    >
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {modules.map((m) => (
                                    <div
                                        key={`${m.type}-${m.module_id}`}
                                        className="group relative flex flex-col justify-between p-5 bg-white border border-zinc-200 hover:border-zinc-400 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-200"
                                    >
                                        <div>
                                            {/* TYPE ICON & UPPER ROW */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${m.type === "channel_module"
                                                        ? "bg-zinc-100 text-zinc-800"
                                                        : "bg-zinc-50 text-zinc-600 border border-zinc-200/60"
                                                    }`}>
                                                    <Layers size={10} />
                                                    {m.type === "channel_module" ? "Channel" : "Standard"}
                                                </span>
                                                <ExternalLink size={14} className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                                            </div>

                                            {/* TITLE */}
                                            <h3 className="font-medium text-sm text-zinc-900 group-hover:text-black tracking-tight line-clamp-1 mb-1">
                                                {m.name}
                                            </h3>

                                            {/* OWNER */}
                                            {m.owner && (
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-3">
                                                    <User size={12} className="shrink-0" />
                                                    <span className="truncate">
                                                        {m.owner.first_name || m.owner.last_name
                                                            ? `${m.owner.first_name || ""} ${m.owner.last_name || ""}`.trim()
                                                            : m.owner.email
                                                        }
                                                    </span>
                                                </div>
                                            )}

                                            {/* DESCRIPTION */}
                                            {m.description && (
                                                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4">
                                                    {m.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* TAGS FOOTER */}
                                        {m.skills && m.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-3 border-t border-zinc-100/80">
                                                {m.skills.slice(0, 3).map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-[11px] bg-zinc-50 text-zinc-600 px-2 py-0.5 rounded-md border border-zinc-100"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {m.skills.length > 3 && (
                                                    <span className="text-[10px] text-zinc-400 self-center font-medium pl-1">
                                                        +{m.skills.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
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