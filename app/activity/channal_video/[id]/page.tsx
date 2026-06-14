"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/app/config/api";
import {
    ChevronLeft,
    ExternalLink,
    Clock,
    Video as VideoIcon,
    Calendar,
    AlertCircle,
    Play
} from "lucide-react";
import { getUser } from "@/app/services/authService";

type VideoData = {
    id: number;
    module_id: number;
    title: string;
    description?: string;
    source_type: "Upload" | "External" | string;
    video_url: string;
    thumbnail_url?: string;
    open_date?: string;
    close_date?: string;
};

type UserData = {
    id: number;
    email: string;
};

export default function ViewVideoPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [user, setUser] = useState<UserData | null>(null);
    const [video, setVideo] = useState<VideoData | null>(null);
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Handle User Session Hydration on Mount
    useEffect(() => {
        const currentUser = getUser();
        if (currentUser) {
            setUser(currentUser);
        } else {
            // Unauthenticated: Trigger automatic redirection
            router.push("/errors/autharization");
        }
    }, [router]);

    // 2. Fetch Video and Access Rules when both ID and User are Ready
    useEffect(() => {
        if (id && user) {
            fetchVideoAndCheckAccess(user);
        }
    }, [id, user]);

    // 3. Handle Unauthorized Access Redirection
    useEffect(() => {
        if (hasAccess === false) {
            router.push("/errors/autharization");
        }
    }, [hasAccess, router]);

    const fetchVideoAndCheckAccess = async (currentUser: UserData) => {
        try {
            // Fetch Video Metadata
            const videoRes = await fetch(`${API_BASE_URL}/videos/${id}`);
            if (!videoRes.ok) throw new Error("Failed to fetch video resource");
            const videoData = await videoRes.json();

            // Query parameters structure for FastAPI backend authorization guard
            const accessQueryParams = new URLSearchParams({
                user_id: String(currentUser.id),
                student_email: currentUser.email
            });

            // Verification check query execution
            const accessRes = await fetch(
                `${API_BASE_URL}/video-access/check/${id}?${accessQueryParams.toString()}`
            );

            if (!accessRes.ok) throw new Error("Failed to verify access permissions");
            const accessData = await accessRes.json();

            setVideo(videoData);
            setHasAccess(accessData.access); // Pulls access boolean dynamically
        } catch (error) {
            console.error("Error executing secure gateway layout:", error);
            // Fallback: If API fails, redirect to authorization error page
            router.push("/errors/autharization");
        } finally {
            setLoading(false);
        }
    };

    const today = new Date();

    const getStatus = () => {
        if (!video?.open_date) return "AVAILABLE";
        const open = new Date(video.open_date);
        const close = video.close_date ? new Date(video.close_date) : null;

        if (today < open) return "LOCKED";
        if (close && today > close) return "EXPIRED";
        return "AVAILABLE";
    };

    const status = getStatus();

    const resolveMediaUrl = (urlPath: string | undefined) => {
        if (!urlPath) return undefined;
        if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
            return urlPath;
        }
        return `${API_BASE_URL}/${urlPath}`;
    };

    // 1. LOADING STATE (Shows while checking authentication & backend validation)
    if (loading || !user || hasAccess === false) {
        return (
            <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-4xl animate-pulse">
                    <div className="h-4 w-24 bg-gray-200 mb-4" />
                    <div className="h-12 w-3/4 bg-gray-900 mb-8" />
                    <div className="h-[500px] aspect-video w-full bg-gray-100 border border-gray-200" />
                </div>
            </div>
        );
    }

    // 2. VIDEO NOT FOUND STATE
    if (!video) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="text-center border border-gray-200 p-12 max-w-md bg-gray-50">
                    <AlertCircle className="w-12 h-12 mx-auto text-red-600 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">Video Not Found</h2>
                    <p className="text-gray-500 mt-2 mb-6">The requested lecture or stream material is missing or unavailable.</p>
                    <button onClick={() => router.back()} className="px-6 py-2 bg-gray-900 text-white text-sm font-medium uppercase tracking-widest hover:bg-black transition">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // 3. GRANTED ACCESS SECURE RENDER VIEW
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* NAVIGATION HEADER */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 md:px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link
                        href={`/moduleinside/${video.module_id}`}
                        className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                        BACK TO MODULE
                    </Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* LEFT COLUMN: PRIMARY VIDEO STREAM PLAYER */}
                <div className="lg:col-span-8 space-y-8">
                    <section>
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                                Video Lecture • {video.source_type} Stream
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight mb-4">
                            {video.title}
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                            {video.description || "No description provided for this video segment."}
                        </p>
                    </section>

                    <section className="relative">
                        {status === "AVAILABLE" ? (
                            video.source_type === "Upload" ? (
                                <div className="border border-gray-200 bg-gray-50 p-1 md:p-2 shadow-2xl">
                                    <div className="bg-gray-900 text-white px-4 py-2 flex justify-between items-center">
                                        <span className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                                            <Play className="w-3 h-3 fill-current" /> Media Player
                                        </span>
                                        <VideoIcon className="w-4 h-4 opacity-50" />
                                    </div>
                                    <video
                                        src={resolveMediaUrl(video.video_url)}
                                        controls
                                        controlsList="nodownload"
                                        preload="none"
                                        crossOrigin="anonymous"
                                        poster={resolveMediaUrl(video.thumbnail_url)}
                                        className="w-full h-auto aspect-video bg-black block object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="border border-gray-200 bg-gray-50 p-1 md:p-2 shadow-2xl">
                                    <div className="relative aspect-video bg-gray-100 w-full flex-shrink-0 overflow-hidden group">
                                        {video.thumbnail_url ? (
                                            <img
                                                src={resolveMediaUrl(video.thumbnail_url)}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                                <VideoIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-6 transition-all group-hover:bg-black/75">
                                            <ExternalLink className="w-10 h-10 mx-auto mb-4 text-white opacity-40 group-hover:scale-110 transition-transform" />
                                            <h3 className="text-lg md:text-xl mb-2 font-serif text-white">External Media Resource</h3>
                                            <p className="text-gray-300 mb-6 text-xs md:text-sm max-w-sm mx-auto">
                                                This video is hosted stream-ready on an external platform. Click below to view the resource.
                                            </p>
                                            <a
                                                href={resolveMediaUrl(video.video_url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block bg-white text-gray-900 px-6 py-2.5 text-xs font-bold uppercase tracking-tighter hover:bg-gray-200 transition shadow-md"
                                            >
                                                Open Video Stream
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-20 text-center">
                                <div className="w-10 h-10 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold mb-4">
                                    !
                                </div>
                                <h3 className="text-lg font-bold uppercase tracking-widest text-red-600">{status}</h3>
                                <p className="text-gray-500 mt-2">
                                    {status === "LOCKED"
                                        ? `This video lecture safely unlocks on ${new Date(video.open_date!).toLocaleDateString(undefined, { dateStyle: 'long' })}`
                                        : "The viewing period for this session resource has officially expired."}
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT COLUMN: SIDEBAR LOGISTICS */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="border border-gray-100 bg-gray-50 p-6 sticky top-28">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">
                            Session Logistics
                        </h4>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="p-2 bg-white border border-gray-200 h-fit">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Release Date</p>
                                    <p className="text-sm font-medium">
                                        {video.open_date ? new Date(video.open_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : "Always Visible"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-2 bg-white border border-gray-200 h-fit">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Expiry Close</p>
                                    <p className="text-sm font-medium">
                                        {video.close_date ? new Date(video.close_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : "No Limit"}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Status</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 border ${status === 'AVAILABLE' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}`}>
                                        {status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Media Source</span>
                                    <span className="text-[10px] font-bold text-gray-900 uppercase">
                                        {video.source_type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}