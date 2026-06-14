"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import {
    Upload,
    FileText,
    X,
    Loader2,
    Download,
    EyeOff,
    ArrowLeft,
    Calendar,
    Layers,
    Link,
    FileUp,
    ShieldAlert
} from "lucide-react";
import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";

export default function EditContentForm() {
    const params = useParams();
    const router = useRouter();

    const contentId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    // ===================================
    // SECURITY & SYSTEM TRACKING STATES
    // ===================================
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);

    // Form inputs
    const [title, setTitle] = useState("");
    const [week, setWeek] = useState<number>(1);
    const [description, setDescription] = useState("");
    const [externalUrl, setExternalUrl] = useState("");
    const [openDate, setOpenDate] = useState("");
    const [closeDate, setCloseDate] = useState("");
    const [allowDownload, setAllowDownload] = useState(false);

    // File attachments
    const [existingFilePath, setExistingFilePath] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ===================================
    // DATA HYDRATION & CHANNEL AUTH CHECK
    // ===================================
    useEffect(() => {
        const fetchAndVerifyAccess = async () => {
            if (!contentId) return;

            try {
                const activeUser = getUser();
                if (!activeUser?.id) {
                    setHasAccess(false);
                    setFetching(false);
                    return;
                }

                // 1. Fetch content metadata item
                const contentRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL || API_BASE_URL}/contents/view/${contentId}`
                );
                const contentData = contentRes.data;

                // 2. Query specialized FastAPI /access endpoint using the channel module ID
                const channelModuleId = contentData.module_id;
                const accessRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL || API_BASE_URL}/channel-modules/access/${channelModuleId}/${activeUser.id}`
                );

                // Validate if current session user is the true module owner
                if (!accessRes.data.is_owner) {
                    setHasAccess(false);
                    setFetching(false);
                    return;
                }

                // 3. Hydrate inputs if authorized owner
                setHasAccess(true);
                setTitle(contentData.title || "");
                setWeek(contentData.week || 1);
                setDescription(contentData.description || "");
                setExternalUrl(contentData.file_path || "");
                setExistingFilePath(contentData.file_path || null);
                setAllowDownload(contentData.allow_download || false);

                if (contentData.open_date) {
                    setOpenDate(contentData.open_date.split("T")[0]);
                }
                if (contentData.close_date) {
                    setCloseDate(contentData.close_date.split("T")[0]);
                }

            } catch (err) {
                console.error("Hydration fallback security intercept exception:", err);
                setHasAccess(false);
            } finally {
                setFetching(false);
            }
        };

        fetchAndVerifyAccess();
    }, [contentId]);

    // ===================================
    // AUTOMATIC SECURITY NAVIGATION EFFECT
    // ===================================
    useEffect(() => {
        if (hasAccess === false) {
            router.push("/errors/autharization");
        }
    }, [hasAccess, router]);

    // ===================================
    // MUTATION HANDLER (PUT)
    // ===================================
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasAccess) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("week", String(week));
            formData.append("description", description || "");
            formData.append("external_url", externalUrl || "");
            formData.append("open_date", openDate || "");
            formData.append("close_date", closeDate || "");
            formData.append("allow_download", String(allowDownload));

            if (file) {
                formData.append("file", file);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || API_BASE_URL}/contents/update/${contentId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Content updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Update transaction encountered an issue.");
        } finally {
            setLoading(false);
        }
    };

    // Keep layout blank/loading while authorization resolves or triggers redirect routing
    if (fetching || hasAccess === null || hasAccess === false) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center text-gray-900 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-gray-900" />
                <p className="text-xs font-semibold uppercase tracking-wider">Verifying Channel Module Ownership...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col antialiased">

            {/* ACTION HEADER */}
            <header className="border-b border-gray-100 px-4 sm:px-8 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-20 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                    >
                        <ArrowLeft className="w-4 h-4 text-gray-900" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">
                            Edit Channel Content Workspace
                        </h1>
                        <p className="text-[11px] text-gray-400 font-mono tracking-tight">
                            Target Resource Vector ID: {contentId}
                        </p>
                    </div>
                </div>

                <div className="flex w-full sm:w-auto items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 sm:flex-none text-center px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-900 rounded-xl transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </header>

            {/* RESPONSIVE DUAL-PANEL GRID DESIGN SYSTEM */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

                {/* LEFT CORE LAYOUT PARAMETERS FORM PANEL */}
                <div className="p-6 sm:p-10 bg-white">
                    <div className="max-w-xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">Section 01</h2>
                            <h3 className="text-lg font-bold tracking-tight text-gray-900">Structural Schematics</h3>
                        </div>

                        <div className="space-y-5">
                            {/* TITLE */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter content title..."
                                    className="w-full p-3 bg-white border border-gray-200 text-gray-900 rounded-xl outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-50 transition"
                                    required
                                />
                            </div>

                            {/* SELECT TIMELINE TRACKING */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-gray-400" /> Timeline Allocation
                                </label>
                                <select
                                    value={week}
                                    onChange={(e) => setWeek(Number(e.target.value))}
                                    className="w-full p-3 bg-white border border-gray-200 text-gray-900 rounded-xl outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-50 transition appearance-none cursor-pointer font-medium"
                                >
                                    {Array.from({ length: 20 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            Week {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* DESCRIPTION TEXTAREA */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                    Description / Summary
                                </label>
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="What are the structural details or brief descriptions of this content?"
                                    className="w-full p-3 bg-white border border-gray-200 text-gray-900 rounded-xl outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-50 transition text-sm leading-relaxed"
                                />
                            </div>

                            {/* REDIRECT EXTERNAL URL TARGET */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                    <Link className="w-3.5 h-3.5 text-gray-400" /> External Path / URL Reference
                                </label>
                                <input
                                    type="text"
                                    value={externalUrl}
                                    onChange={(e) => setExternalUrl(e.target.value)}
                                    placeholder="https://example.com/external-resource"
                                    className="w-full p-3 bg-white border border-gray-200 text-gray-900 rounded-xl outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-50 transition text-sm"
                                />
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* AVAILABILITY LIMIT WINDOW BOUNDS */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Availability Bounds</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase">Open Date</span>
                                    <input
                                        type="date"
                                        value={openDate}
                                        onChange={(e) => setOpenDate(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:border-gray-900 transition text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase">Close Date</span>
                                    <input
                                        type="date"
                                        value={closeDate}
                                        onChange={(e) => setCloseDate(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:border-gray-900 transition text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SYSTEM STATUS CONTROL PANEL */}
                <div className="p-6 sm:p-10 bg-gray-50/50">
                    <div className="max-w-xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-1">Section 02</h2>
                            <h3 className="text-lg font-bold tracking-tight text-gray-900">Asset Matrix Attachment</h3>
                        </div>

                        {/* UPLOAD FILE DROP CONTAINER BLOCK */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                <FileUp className="w-3.5 h-3.5 text-gray-400" /> Primary Object Storage Asset
                            </label>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border border-dashed border-gray-300 rounded-2xl p-6 sm:p-10 text-center bg-white hover:border-gray-900 transition group cursor-pointer shadow-sm relative"
                            >
                                <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 transition group-hover:scale-105">
                                    <Upload className="w-4 h-4 text-gray-900" />
                                </div>

                                <p className="text-sm font-bold text-gray-900">
                                    Click to change attached content asset
                                </p>
                                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-normal">
                                    Upload new files to replace legacy system document binary.
                                </p>

                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </div>
                        </div>

                        {/* WORKSPACE STATUS LOG CONTAINER */}
                        <div className="bg-white border border-gray-200/60 rounded-xl p-4 space-y-3 shadow-sm">
                            <h4 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">
                                Current Asset Allocation Status
                            </h4>

                            {file ? (
                                <div className="flex items-center justify-between bg-gray-900 text-white rounded-xl p-3 border border-gray-900">
                                    <div className="flex items-center gap-2.5 truncate">
                                        <FileText className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                        <span className="text-xs font-medium truncate">
                                            Staged Queue: {file.name}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="p-1 hover:bg-white/10 rounded-md text-white transition"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : existingFilePath ? (
                                <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl p-3">
                                    <FileText className="w-4 h-4 text-gray-900 flex-shrink-0" />
                                    <span className="text-xs text-gray-700 font-medium truncate">
                                        Retained Asset: {existingFilePath.split("/").pop()}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">
                                    No active file attachments bound to this workspace resource.
                                </p>
                            )}
                        </div>

                        {/* PRIVILEGE SWITCH CONFIG ENGINE */}
                        <div className="bg-white border border-gray-200/60 rounded-xl p-4 shadow-sm space-y-3">
                            <h4 className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">
                                Resource Permission Strategy
                            </h4>

                            <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
                                <button
                                    type="button"
                                    onClick={() => setAllowDownload(true)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${allowDownload
                                            ? "bg-gray-900 shadow-sm text-white"
                                            : "text-gray-500 hover:text-gray-900"
                                        }`}
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Allow Download
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAllowDownload(false)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${!allowDownload
                                            ? "bg-gray-900 shadow-sm text-white"
                                            : "text-gray-500 hover:text-gray-900"
                                        }`}
                                >
                                    <EyeOff className="w-3.5 h-3.5" />
                                    View Only
                                </button>
                            </div>
                        </div>

                        {/* ENTERPRISE ENFORCEMENT NOTIFICATION CARD */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-white flex items-start gap-3">
                            <ShieldAlert className="w-4 h-4 text-gray-900 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="text-xs font-bold text-gray-900 block">Channel Enforced Authorization</span>
                                <p className="text-[11px] text-gray-400 mt-0.5 leading-normal">
                                    This workspace checks backend ownership properties. Only the assigned creator of this channel module can save updates.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}