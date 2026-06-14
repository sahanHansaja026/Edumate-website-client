"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";

interface ChannelData {
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

interface ChannelModuleData {
    module_id: number;
    user_id: number;
    channel_id: number;
    name: string;
    description: string | null;
    skills: string[];
    visibility: "public" | "private" | string;
    cover_image: string | null;
    cover_image_name: string | null;
    co_host: {
        email: string;
        firstName: string | null;
        lastName: string | null;
    } | null;
}

export default function ChannelDashboardView() {
    const params = useParams();
    const router = useRouter();
    const channelId = params?.id;

    const [channel, setChannel] = useState<ChannelData | null>(null);
    const [modules, setModules] = useState<ChannelModuleData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [authUser, setAuthUser] = useState<{ id: number; email: string } | null>(null);

    useEffect(() => {
        const localUser = getUser();
        setAuthUser(localUser);
    }, []);

    useEffect(() => {
        if (!channelId) return;

        const fetchChannelAndModules = async () => {
            try {
                setLoading(true);

                const [channelRes, modulesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/channels/${channelId}`),
                    fetch(`${API_BASE_URL}/channel-modules/channel/${channelId}`)
                ]);

                if (!channelRes.ok) {
                    if (channelRes.status === 404) throw new Error("The requested academic hub index does not exist.");
                    throw new Error("Unable to capture database channel object layer details.");
                }

                const channelData = await channelRes.json();
                setChannel(channelData);

                if (modulesRes.ok) {
                    const modulesData = await modulesRes.json();
                    setModules(modulesData);
                } else {
                    console.error("Failed to parse connected structural modules.");
                }

            } catch (err: any) {
                console.error(err);
                setError(err.message || "An unexpected system execution fault occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchChannelAndModules();
    }, [channelId]);

    const isOwner = channel && authUser ? authUser.id === channel.user_id : false;
    const isCoHostOrFaculty = channel && authUser && authUser.email ? channel.co_hosts_and_faculty_members.some(
        (email) => email.toLowerCase() === authUser.email.toLowerCase()
    ) : false;

    const canManageModules = isOwner || isCoHostOrFaculty;

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
                <p className="mt-4 text-xs font-mono text-gray-400 uppercase tracking-widest">Resolving Workspace Node...</p>
            </div>
        );
    }

    if (error || !channel) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold mb-4">!</div>
                <h3 className="text-base font-black text-gray-900 tracking-tight">Channel Unreachable</h3>
                <p className="mt-1 text-xs text-gray-500 max-w-sm leading-relaxed">{error}</p>
                <Link href="/channels" className="mt-5 inline-flex h-10 items-center justify-center px-4 bg-gray-900 text-white text-xs font-bold rounded-xl">
                    Return to Directory
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/60 text-gray-900 antialiased font-sans">
            <header className="border-b border-gray-200 bg-white sticky top-0 z-30 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/pages/channel" className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
                            &larr; Directory Hub
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${channel.visibility === "public" ? "bg-green-50 border-green-200 text-green-700" : "bg-purple-50 border-purple-200 text-purple-700"}`}>
                            {channel.visibility} Node
                        </span>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
                    <div className="h-44 sm:h-60 md:h-64 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 relative">
                        {channel.cover_image && (
                            <img
                                src={channel.cover_image.startsWith("http") ? channel.cover_image : `${API_BASE_URL}/${channel.cover_image}`}
                                alt="Channel Workspace Backdrop Banner"
                                className="w-full h-full object-cover"
                            />
                        )}

                        {isOwner && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                                <button onClick={() => router.push(`/pages/edit/channel/${channel.channel_id}`)} className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-white/95 hover:bg-white text-gray-800 hover:text-gray-950 text-xs font-bold rounded-xl shadow-sm border border-gray-200 transition-all active:scale-95" title="Edit Configuration parameters">
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    <span>Edit Hub</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="px-6 sm:px-8 pb-6 relative flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="relative -mt-14 sm:-mt-16 h-24 w-24 sm:h-32 sm:w-32 rounded-xl border-4 border-white bg-white shadow-sm overflow-hidden flex-shrink-0 z-10">
                            {channel.logo_image ? (
                                <img
                                    src={channel.logo_image.startsWith("http") ? channel.logo_image : `${API_BASE_URL}/${channel.logo_image}`}
                                    alt="Institutional Crest Badge"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-900 text-white font-black text-xl flex items-center justify-center">
                                    {channel.channel_name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="pt-2 md:pt-4 md:flex-1 md:pl-4">
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">{channel.channel_name}</h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">{channel.institute_legal_name}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-gray-500 font-medium">
                                {channel.physical_corporate_address && <span>📍 {channel.physical_corporate_address}</span>}
                                <span>👤 Administrator: {channel.institute_owner_full_name}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 md:pt-0 self-start md:self-end">
                            {channel.official_website_link && (
                                <a href={channel.official_website_link} target="_blank" rel="noreferrer" className="inline-flex h-9 px-4 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 items-center justify-center shadow-sm">
                                    Domain Page &rarr;
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Mission Statement Summary</h4>
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                {channel.description || "No description parameter properties configured for this deployment asset."}
                            </p>
                        </div>
                    </div>

                    <main className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                            <div>
                                <h3 className="text-lg font-black tracking-tight text-gray-900">Ecosystem Framework Pools</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Assigned execution streams linked explicitly over this channel reference layer.</p>
                            </div>

                            {canManageModules ? (
                                <Link href={`/pages/channel_modules/${channel.channel_id}`}>
                                    <button className="h-9 px-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95">
                                        + New Module Setup
                                    </button>
                                </Link>
                            ) : (
                                <button
                                    onClick={() => alert("Access Denied: Only the hub owner holds clearance to establish new modules.")}
                                    className="h-9 px-4 bg-gray-200 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed"
                                >
                                    + New Module Setup
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {modules.length > 0 ? (
                                modules.map((mod) => (
                                    <Link
                                        href={`/channel_module_inside/${mod.module_id}`}
                                        key={mod.module_id}
                                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-gray-400 hover:shadow-md transition-all duration-200 cursor-pointer"
                                    >
                                        <div className="h-32 bg-gray-100 relative w-full overflow-hidden">
                                            {mod.cover_image ? (
                                                <img
                                                    src={mod.cover_image.startsWith("http") ? mod.cover_image : `${API_BASE_URL}/uploads/channel_modules/${mod.cover_image}`}
                                                    alt={mod.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 font-mono text-[10px] uppercase">
                                                    No Graphic Asset
                                                </div>
                                            )}
                                            <span className={`absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border bg-white shadow-sm ${mod.visibility === "public" ? "border-green-200 text-green-700" : "border-purple-200 text-purple-700"}`}>
                                                {mod.visibility}
                                            </span>
                                        </div>

                                        <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                                            <div>
                                                <h5 className="text-sm font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">
                                                    {mod.name}
                                                </h5>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {mod.description || "No supplemental descriptive parameters specified."}
                                                </p>
                                            </div>

                                            <div>
                                                {mod.skills && mod.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                        {mod.skills.map((skill, idx) => (
                                                            <span key={idx} className="bg-gray-50 border border-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {mod.co_host ? (
                                                    <div className="pt-2.5 border-t border-gray-100 flex items-center gap-2">
                                                        <div className="h-5 w-5 rounded-full bg-gray-900 text-white text-[9px] flex items-center justify-center font-bold font-mono">
                                                            {(mod.co_host.firstName || "T").substring(0, 1).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] font-bold text-gray-800 leading-none">
                                                                {mod.co_host.firstName && mod.co_host.lastName
                                                                    ? `${mod.co_host.firstName} ${mod.co_host.lastName}`
                                                                    : "Assigned Teacher"}
                                                            </span>
                                                            <span className="text-[9px] text-gray-400 font-mono mt-0.5 leading-none">
                                                                {mod.co_host.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="pt-2.5 border-t border-gray-100 text-[10px] text-gray-400 font-medium italic">
                                                        No teacher assigned to this block.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="sm:col-span-2 bg-white border border-dashed border-gray-200 rounded-xl py-12 text-center">
                                    <p className="text-xs font-medium text-gray-400">No modular structural layers linked to this ecosystem node yet.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}