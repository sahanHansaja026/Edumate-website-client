"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

import {
    Upload,
    Globe,
    Image as ImageIcon,
    X,
    Loader2
} from "lucide-react";

import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";

// Mock helper function to fetch current authenticated user details.
// Update this block to plug into your actual Auth Context or State Provider.


export default function EditVideoForm() {
    const params = useParams();
    const router = useRouter();

    const videoId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    // =========================
    // STATES
    // =========================
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);

    const [source, setSource] = useState("YouTube");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [videoUrl, setVideoUrl] = useState("");

    // Binary uploads
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    const [openDate, setOpenDate] = useState("");
    const [closeDate, setCloseDate] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // =========================
    // DATA HYDRATION & ACCESS CONTROL
    // =========================
    useEffect(() => {
        const fetchVideoData = async () => {
            if (!videoId) return;

            const currentUser = getUser();
            if (!currentUser?.id) {
                router.push("/errors/autharization");
                return;
            }

            try {
                // 1. Verify Edit Access (Checks current user id == module user id)
                const accessRes = await axios.get(
                    `${API_BASE_URL}/video-access/edit-access/${videoId}`,
                    { params: { user_id: currentUser.id } }
                );

                // Auto-navigate if unauthorized
                if (accessRes.data?.access === false) {
                    router.push("/errors/autharization");
                    return;
                }

                // 2. Fetch Video Core Properties if access is verified
                const res = await axios.get(`${API_BASE_URL}/videos/${videoId}`);
                const data = res.data;

                setTitle(data.title || "");
                setDescription(data.description || "");
                setSource(data.source_type || "YouTube");

                if (data.source_type === "Upload") {
                    setVideoUrl("");
                } else {
                    setVideoUrl(data.video_url || "");
                }

                if (data.thumbnail_url) {
                    const cleanThumbnailPath = data.thumbnail_url.startsWith("http")
                        ? data.thumbnail_url
                        : `${API_BASE_URL}/${data.thumbnail_url}`;
                    setThumbnail(cleanThumbnailPath);
                }

                setOpenDate(data.open_date ? data.open_date.split("T")[0] : "");
                setCloseDate(data.close_date ? data.close_date.split("T")[0] : "");

                // Content successfully validated and pulled
                setFetching(false);
            } catch (err) {
                console.error(err);
                // Fallback safe route redirect if the resource query completely fails or returns errors
                router.push("/errors/autharization");
            }
        };

        fetchVideoData();
    }, [videoId, router]);

    // =========================
    // INTERACTION HANDLERS
    // =========================
    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(URL.createObjectURL(file));
            setThumbnailFile(file);
        }
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
        }
    };

    // =========================
    // MUTATION SUBMIT (PUT)
    // =========================
    const handleUpdate = async () => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("source_type", source);
            formData.append("open_date", openDate);
            formData.append("close_date", closeDate);

            if (source === "Upload") {
                if (videoFile) {
                    formData.append("video_file", videoFile);
                }
            } else {
                formData.append("video_url", videoUrl);
            }

            if (thumbnailFile) {
                formData.append("thumbnail", thumbnailFile);
            }

            await axios.put(
                `${API_BASE_URL}/videos/${videoId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            alert("Video configuration updated successfully!");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Update transaction encountered an issue.");
        } finally {
            setLoading(false);
        }
    };

    // Blocking Loader View state to hide structural elements until verified
    if (fetching) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Verifying workspace permissions...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col">

            {/* HEADER INTERFACE */}
            <header className="border-b border-slate-100 px-8 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">
                        Edit Video Resource
                    </h1>
                    <p className="text-xs text-slate-400">
                        Target System Identification: {videoId}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-all"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </header>

            {/* SPLIT PANEL MAIN HOUSING AREA */}
            <main className="flex-1 flex overflow-hidden">

                {/* LEFT CORE SCHEMATICS WRAPPER */}
                <div className="w-1/2 p-10 overflow-y-auto border-r border-slate-50">
                    <div className="max-w-md ml-auto">
                        <section className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold mb-4">
                                    Video Details
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Enter video title..."
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="What is this video about?"
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h2 className="text-lg font-semibold mb-4">
                                    Availability
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Open Date
                                        </label>
                                        <input
                                            type="date"
                                            value={openDate}
                                            onChange={(e) => setOpenDate(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                            Close Date
                                        </label>
                                        <input
                                            type="date"
                                            value={closeDate}
                                            onChange={(e) => setCloseDate(e.target.value)}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* RIGHT SYSTEM DESIGNATION HOUSING */}
                <div className="w-1/2 p-10 bg-slate-50/50 overflow-y-auto">
                    <div className="max-w-md">
                        <h2 className="text-lg font-semibold mb-4">
                            Media Source
                        </h2>

                        {/* SOURCE TYPE CHANGER PILLS */}
                        <div className="flex p-1 bg-slate-200/50 rounded-xl mb-6">
                            {["YouTube", "Vimeo", "Upload"].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSource(type)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${source === type
                                        ? "bg-white shadow-sm text-blue-600"
                                        : "text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            {/* MEDIA STREAM SELECTIONS AND TARGET HOOKS */}
                            {source === "Upload" ? (
                                <div>
                                    <div
                                        onClick={() => videoInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-white hover:border-blue-400 transition-colors cursor-pointer"
                                    >
                                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Upload className="w-6 h-6 text-blue-500" />
                                        </div>

                                        <p className="text-sm font-medium">
                                            Click to replace file content
                                        </p>

                                        <p className="text-xs text-slate-400 mt-1">
                                            Leave unselected to preserve historical system binary asset
                                        </p>

                                        {videoFile && (
                                            <p className="text-xs text-green-600 mt-3 font-medium truncate">
                                                Selected File: {videoFile.name}
                                            </p>
                                        )}

                                        <input
                                            type="file"
                                            hidden
                                            ref={videoInputRef}
                                            accept="video/*"
                                            onChange={handleVideoUpload}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                        {source} Address URL Connection
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            placeholder={`https://${source.toLowerCase()}.com/...`}
                                            className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* PREVIEW CONTAINER MATRICES */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Video Thumbnail Preview
                                </label>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative aspect-video bg-slate-200 rounded-xl overflow-hidden border border-slate-200 group cursor-pointer"
                                >
                                    {thumbnail ? (
                                        <>
                                            <img
                                                src={thumbnail}
                                                alt="Target configuration image preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <p className="text-white text-sm font-medium">
                                                    Change Image Canvas
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setThumbnail(null);
                                                    setThumbnailFile(null);
                                                }}
                                                className="absolute top-2 right-2 p-1 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                            <ImageIcon className="w-8 h-8 mb-2" />
                                            <p className="text-xs">
                                                Select system static display image
                                            </p>
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        hidden
                                        accept="image/*"
                                        onChange={handleThumbnailUpload}
                                    />
                                </div>

                                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tight">
                                    Recommended Asset Boundary: 1280x720px
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}