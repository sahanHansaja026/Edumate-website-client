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

export default function VideoInput() {

    const params = useParams();
    const id = params.id as string;

    // =========================
    // STATES
    // =========================

    const [source, setSource] = useState("YouTube");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [videoUrl, setVideoUrl] = useState("");

    const [videoFile, setVideoFile] = useState<File | null>(null);

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    const [openDate, setOpenDate] = useState("");
    const [closeDate, setCloseDate] = useState("");

    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const [user, setUser] = useState<{ id: number; email: string } | null>(null);
    const [quota, setQuota] = useState<any>(null);

    // load user
    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);
    }, []);

    useEffect(() => {
        const loadQuota = async () => {
            if (!user) return;

            try {
                const res = await fetch(`${API_BASE_URL}/quota/video/${user.id}`);
                const data = await res.json();
                setQuota(data);
            } catch (err) {
                console.error(err);
            }
        };

        loadQuota();
    }, [user]);
    // =========================
    // METADATA
    // =========================

    const metadata = {
        moduleId: id,
        createdAt: new Date().toISOString().split("T")[0]
    };

    // =========================
    // THUMBNAIL UPLOAD
    // =========================

    const handleThumbnailUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = e.target.files?.[0];

        if (file) {
            setThumbnail(URL.createObjectURL(file));
            setThumbnailFile(file);
        }
    };

    // =========================
    // VIDEO FILE UPLOAD
    // =========================

    const handleVideoUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = e.target.files?.[0];

        if (file) {
            setVideoFile(file);
        }
    };

    // =========================
    // SUBMIT
    // =========================

    const handleSubmit = async () => {

        try {

            if (!user) {
                alert("User not found");
                return;
            }

            // 🔥 CHECK VIDEO QUOTA FIRST
            const quotaRes = await fetch(`${API_BASE_URL}/quota/video/${user.id}`);
            const quotaData = await quotaRes.json();

            if (!quotaData.can_create) {
                router.push("/subscription");
                return;
            }

            setLoading(true);

            const formData = new FormData();

            formData.append("module_id", id);

            formData.append("title", title);
            formData.append("description", description);

            formData.append("source_type", source);

            formData.append("open_date", openDate);
            formData.append("close_date", closeDate);

            // VIDEO
            if (source === "Upload") {

                if (!videoFile) {
                    alert("Please upload a video");
                    return;
                }

                formData.append("video_file", videoFile);

            } else {
                formData.append("video_url", videoUrl);
            }

            // THUMBNAIL
            if (thumbnailFile) {
                formData.append("thumbnail", thumbnailFile);
            }

            const response = await axios.post(
                `${API_BASE_URL}/videos`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            console.log(response.data);

            alert("Video uploaded successfully");

        } catch (error) {

            console.error(error);
            alert("Upload failed");

        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col">

            {/* HEADER */}

            <header className="border-b border-slate-100 px-8 py-4 flex justify-between items-center">

                <div>
                    <h1 className="text-xl font-bold tracking-tight">
                        Resource Management
                    </h1>

                    <p className="text-xs text-slate-400">
                        Module: {metadata.moduleId} • Created: {metadata.createdAt}
                    </p>
                </div>

                <div className="flex gap-3">

                    <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-all">
                        Discard
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2"
                    >

                        {loading && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        )}

                        Publish Video

                    </button>

                </div>

            </header>

            <main className="flex-1 flex overflow-hidden">

                {/* LEFT */}

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

                {/* RIGHT */}

                <div className="w-1/2 p-10 bg-slate-50/50 overflow-y-auto">

                    <div className="max-w-md">

                        <h2 className="text-lg font-semibold mb-4">
                            Media Source
                        </h2>

                        {/* TOGGLE */}

                        <div className="flex p-1 bg-slate-200/50 rounded-xl mb-6">

                            {["YouTube", "Vimeo", "Upload"].map((type) => (

                                <button
                                    key={type}
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

                            {/* VIDEO */}

                            {source === "Upload" ? (

                                <>
                                    <div
                                        onClick={() => videoInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-white hover:border-blue-400 transition-colors cursor-pointer"
                                    >

                                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">

                                            <Upload className="w-6 h-6 text-blue-500" />

                                        </div>

                                        <p className="text-sm font-medium">
                                            Click to upload video file
                                        </p>

                                        <p className="text-xs text-slate-400 mt-1">
                                            MP4, WebM up to 500MB
                                        </p>

                                        {videoFile && (
                                            <p className="text-xs text-green-600 mt-3">
                                                {videoFile.name}
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
                                </>

                            ) : (

                                <div>

                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                        {source} Link
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

                            {/* THUMBNAIL */}

                            <div>

                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                                    Video Thumbnail
                                </label>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative aspect-video bg-slate-200 rounded-xl overflow-hidden border border-slate-200 group cursor-pointer"
                                >

                                    {thumbnail ? (

                                        <>
                                            <img
                                                src={thumbnail}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />

                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">

                                                <p className="text-white text-sm font-medium">
                                                    Change Image
                                                </p>

                                            </div>

                                            <button
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
                                                Upload custom thumbnail
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
                                    Recommended: 1280x720px
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}