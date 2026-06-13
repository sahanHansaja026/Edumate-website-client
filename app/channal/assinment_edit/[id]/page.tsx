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
    EyeOff
} from "lucide-react";
import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";

export default function EditAssignmentPage() {
    const params = useParams();
    const router = useRouter();

    const assignmentId = params.id as string;

    // =========================
    // SYSTEM TRACKING STATES
    // =========================
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);

    const [moduleId, setModuleId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [openDate, setOpenDate] = useState("");
    const [closeDate, setCloseDate] = useState("");
    const [allowDownload, setAllowDownload] = useState(true);
    const [fullMarks, setFullMarks] = useState<number | "">("");

    // Asset Tracking
    const [existingFilePath, setExistingFilePath] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ===================================
    // DATA HYDRATION & ACCESS CHECK FLOW
    // ===================================
    useEffect(() => {
        const fetchAndVerifyWorkspace = async () => {
            try {
                setFetching(true);

                // 1. Authenticate user identity locally first
                const user = getUser();
                const currentUserId = user?.id;

                if (!currentUserId) {
                    router.push("/errors/autharization");
                    return;
                }

                // 2. Fetch the assignment payload from backend
                const res = await axios.get(
                    `${API_BASE_URL}/assignments/${assignmentId}`
                );
                const assignment = res.data;

                // 3. Immediately evaluate security with the fetched module_id (not the stale state variable)
                const accessRes = await axios.get(
                    `${API_BASE_URL}/assignment-access/channel-module/edit`,
                    {
                        params: {
                            module_id: assignment.module_id,
                            current_user_id: currentUserId,
                        },
                    }
                );

                if (!accessRes.data.access) {
                    router.push("/errors/autharization");
                    return;
                }

                // 4. Secure pass confirmed -> Hydrate your component state safely
                setModuleId(assignment.module_id || "");
                setTitle(assignment.title || "");
                setDescription(assignment.description || "");
                setAllowDownload(assignment.allow_download ?? true);
                setExistingFilePath(assignment.file_path || null);
                setFullMarks(assignment.full_marks ?? "");

                if (assignment.open_date) {
                    setOpenDate(assignment.open_date.split("T")[0]);
                }
                if (assignment.close_date) {
                    setCloseDate(assignment.close_date.split("T")[0]);
                }
            } catch (error) {
                console.error("Workspace synchronization failed:", error);
                router.push("/errors/autharization");
            } finally {
                setFetching(false);
            }
        };

        fetchAndVerifyWorkspace();
    }, [assignmentId, router]);

    // =========================
    // MUTATION HANDLER (PUT)
    // =========================
    const updateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            const formData = new FormData();

            formData.append("module_id", moduleId);
            formData.append("title", title);
            formData.append("description", description);
            formData.append("allow_download", allowDownload ? "true" : "false");
            formData.append("full_marks", String(fullMarks));

            if (openDate) formData.append("open_date", openDate);
            if (closeDate) formData.append("close_date", closeDate);
            if (file) formData.append("file", file);

            await axios.put(
                `${API_BASE_URL}/assignments/update/${assignmentId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Assignment configuration updated successfully!");
            router.push(`/pages/assinment_edit/${assignmentId}`);
        } catch (error) {
            console.error(error);
            alert("Update transaction encountered an issue.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Hydrating assignment metadata properties...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col">

            {/* INTERFACE ACTIONS HEADER */}
            <header className="border-b border-slate-100 px-8 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">
                        Edit Assignment Workspace
                    </h1>
                    <p className="text-xs text-slate-400">
                        Target System Identification ID: {assignmentId}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-all"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={updateAssignment}
                        disabled={loading}
                        className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                    </button>
                </div>
            </header>

            {/* SPLIT PANEL DESIGN ENVIRONMENT */}
            <main className="flex-1 flex overflow-hidden">

                {/* LEFT CORE SCHEMATICS WRAPPER */}
                <div className="w-1/2 p-10 overflow-y-auto border-r border-slate-50">
                    <div className="max-w-md ml-auto space-y-6">

                        <div>
                            <h2 className="text-lg font-semibold mb-4">Core Structural Schematics</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter structural title..."
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                        Description / Instructions
                                    </label>
                                    <textarea
                                        rows={5}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What are the details of this objective requirement?"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Full Marks
                            </label>
                            <input
                                type="number"
                                value={fullMarks}
                                onChange={(e) =>
                                    setFullMarks(
                                        e.target.value === "" ? "" : Number(e.target.value)
                                    )
                                }
                                placeholder="Enter total marks"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <hr className="border-slate-100" />

                        <div>
                            <h2 className="text-lg font-semibold mb-4">Availability Bounds</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                        Open Date
                                    </label>
                                    <input
                                        type="date"
                                        value={openDate}
                                        onChange={(e) => setOpenDate(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT RESOURCE STATUS HOUSING */}
                <div className="w-1/2 p-10 bg-slate-50/50 overflow-y-auto">
                    <div className="max-w-md space-y-6">

                        <div>
                            <h2 className="text-lg font-semibold mb-4">Asset Matrix Attachment</h2>

                            {/* FILE INTERACTION DRAG/CLICK WELL */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-white hover:border-blue-400 transition-colors cursor-pointer"
                            >
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Upload className="w-6 h-6 text-blue-500" />
                                </div>

                                <p className="text-sm font-medium">
                                    Click to change attached assignment asset
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Upload new files to replace legacy system document binary
                                </p>

                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </div>
                        </div>

                        {/* WORKSPACE STATUS METRICS LOG */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 space-y-3 shadow-sm">
                            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                                Current Asset Allocation Status
                            </h4>

                            {file ? (
                                <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-lg p-3">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                        <span className="text-xs font-medium text-emerald-800 truncate">
                                            Staged Queue: {file.name}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="p-1 hover:bg-emerald-100 rounded-md text-emerald-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : existingFilePath ? (
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg p-3">
                                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                    <span className="text-xs text-slate-600 truncate">
                                        Retained Asset: {existingFilePath.split("/").pop()}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">
                                    No active file attachments bound to this workspace resource.
                                </p>
                            )}
                        </div>

                        {/* DOWNLOAD ACCESS PERMISSION SWITCH */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                                Resource Permission Strategy
                            </h4>
                            <div className="flex p-1 bg-slate-100 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setAllowDownload(true)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${allowDownload
                                        ? "bg-white shadow-sm text-blue-600"
                                        : "text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    <Download className="w-4 h-4" />
                                    Allow Download
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAllowDownload(false)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${!allowDownload
                                        ? "bg-white shadow-sm text-red-600"
                                        : "text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    <EyeOff className="w-4 h-4" />
                                    View Only
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}