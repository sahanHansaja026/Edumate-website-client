"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";
import {
    Type,
    Calendar,
    FileUp,
    TextQuote,
    CheckSquare,
    Square,
    X,
    Save,
    ArrowLeft,
    Layers,
    Award
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateAssignmentPage() {
    const params = useParams();
    const router = useRouter();

    // ✅ Safe moduleId handling matching your reference UI
    const moduleId = Array.isArray(params?.id)
        ? params?.id[0]
        : params?.id;

    // ✅ State Variables
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [openDate, setOpenDate] = useState("");
    const [closeDate, setCloseDate] = useState("");
    const [allowDownload, setAllowDownload] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [fullMarks, setFullMarks] = useState<number | "">("");
    const [user, setUser] = useState<{ id: number; email: string } | null>(null);
    const [quota, setQuota] = useState<any>(null);

    // ======================
    // LOAD USER
    // ======================
    useEffect(() => {
        setUser(getUser());
    }, []);

    // ======================
    // LOAD QUOTA
    // ======================
    useEffect(() => {
        const loadQuota = async () => {
            if (!user) return;

            try {
                const res = await fetch(
                    `${API_BASE_URL}/quota/assignment/${user.id}`
                );
                const data = await res.json();
                setQuota(data);
            } catch (err) {
                console.error(err);
            }
        };

        loadQuota();
    }, [user]);

    // ✅ Form Reset Handler
    const handleReset = () => {
        setTitle("");
        setDescription("");
        setOpenDate("");
        setCloseDate("");
        setAllowDownload(true);
        setFile(null);
        setFullMarks("");
    };

    // ======================
    // SUBMIT HANDLER
    // ======================
    const handleSubmit = async () => {
        try {
            if (!user) {
                alert("User not found");
                return;
            }

            // 🔥 CHECK QUOTA BEFORE CREATE
            const res = await fetch(
                `${API_BASE_URL}/quota/assignment/${user.id}`
            );
            const quotaData = await res.json();

            if (!quotaData.can_create) {
                router.push("/subscription?reason=assignment_limit");
                return;
            }

            // date validation
            if (openDate && closeDate && openDate > closeDate) {
                alert("Close date must be after open date");
                return;
            }

            const formData = new FormData();
            formData.append("module_id", String(moduleId));
            formData.append("title", title);
            formData.append("description", description || "");
            formData.append("allow_download", String(allowDownload));
            formData.append("full_marks", String(fullMarks));

            if (openDate) formData.append("open_date", openDate);
            if (closeDate) formData.append("close_date", closeDate);
            if (file) formData.append("file", file);

            await axios.post(`${API_BASE_URL}/assignments/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Assignment created successfully!");
            handleReset();

        } catch (err) {
            console.error(err);
            alert("Error creating assignment");
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-100">
            {/* Top Minimal Action Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 sm:px-8 lg:px-12 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                        title="Go back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-gray-900">
                            Coursework Manager
                        </h1>
                    </div>
                </div>

                {/* Desktop Global Actions */}
                <div className="hidden sm:flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-4 h-9 text-sm font-medium"
                    >
                        Reset Form
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-gray-900 text-white hover:bg-gray-800 px-5 h-9 text-sm font-medium shadow-sm transition-all"
                    >
                        Save Assignment
                    </Button>
                </div>
            </header>

            {/* Main Workspace Frame */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Structural Column: Anchors, Metadata & Quota Alert */}
                <section className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                            <Layers className="w-3.5 h-3.5" /> Project Delivery Node
                        </div>
                        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                            Create Assignment
                        </h2>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Deploy academic benchmarks, attach prompt sheets, allocate score criteria, and set execution baselines for grading panels.
                        </p>
                    </div>

                    {/* Metadata Context Box */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Target Assignment Context
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 block">Identified Module Reference</span>
                            <span className="text-sm font-mono font-bold text-gray-900 select-all">
                                {moduleId || "Undefined Node"}
                            </span>
                        </div>
                        {quota && (
                            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                                <span className="text-gray-500">Assignment Quota Status:</span>
                                <span className={`font-semibold ${quota.can_create ? "text-gray-700" : "text-red-600"}`}>
                                    {quota.can_create ? "Verified" : "Limit Exceeded"}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Structural Column: Full Page Inputs Form Canvas */}
                <section className="lg:col-span-8 space-y-10 pb-24">

                    {/* Block 1: Core Content Information */}
                    <div className="space-y-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">
                            01. General Specifications
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                            <div className="sm:col-span-3 space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                                    <Type className="w-3.5 h-3.5 text-gray-400" /> Assignment Title
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Capstone Architecture Proposal Blueprint Submission"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full text-gray-900 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400 shadow-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                                    <Award className="w-3.5 h-3.5 text-gray-400" /> Full Marks
                                </label>
                                <input
                                    type="number"
                                    placeholder="e.g. 100"
                                    value={fullMarks}
                                    onChange={(e) =>
                                        setFullMarks(
                                            e.target.value === "" ? "" : Number(e.target.value)
                                        )
                                    }
                                    className="w-full text-gray-900 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                                <TextQuote className="w-3.5 h-3.5 text-gray-400" /> Problem Prompt & Rubric Detail
                            </label>
                            <textarea
                                placeholder="Detail out technical prerequisites, system dependencies, required analysis structures, and layout standards..."
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full text-gray-900 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400 resize-y shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Block 2: Guidelines File Distribution */}
                    <div className="space-y-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">
                            02. Coursework Prompt Attachment
                        </h3>

                        <div className="flex flex-col justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors group relative">
                            <input
                                type="file"
                                id="assignment-file-upload"
                                className="sr-only"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <label
                                htmlFor="assignment-file-upload"
                                className="cursor-pointer flex flex-col items-center text-center justify-center space-y-2 w-full min-h-[110px]"
                            >
                                <FileUp className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                <div className="space-y-0.5">
                                    <span className="text-xs font-bold text-gray-900 block">
                                        {file ? "Replace attached document" : "Mount local prompt sheet"}
                                    </span>
                                    <span className="text-[11px] text-gray-400 max-w-[280px] truncate block px-2">
                                        {file ? file.name : "Accepts reference briefs, starter templates, or datasets"}
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Block 3: Access Matrix & Timeline Constraints */}
                    <div className="space-y-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">
                            03. Scheduling & Authorizations
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Release Start Window
                                </label>
                                <input
                                    type="date"
                                    value={openDate}
                                    onChange={(e) => setOpenDate(e.target.value)}
                                    className="w-full text-gray-900 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Deadline Target Window
                                </label>
                                <input
                                    type="date"
                                    value={closeDate}
                                    onChange={(e) => setCloseDate(e.target.value)}
                                    className="w-full text-gray-900 bg-white border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Security Configuration Control Block */}
                        <div
                            onClick={() => setAllowDownload(!allowDownload)}
                            className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50/50 transition-colors cursor-pointer select-none group"
                        >
                            <div className="mt-0.5 text-gray-900">
                                {allowDownload ? (
                                    <CheckSquare className="w-4 h-4 transition-transform group-active:scale-95" />
                                ) : (
                                    <Square className="w-4 h-4 text-gray-300 transition-transform group-active:scale-95" />
                                )}
                            </div>
                            <div className="flex flex-col space-y-0.5">
                                <span className="text-sm font-bold text-gray-900">
                                    Grant client attachment download authorization
                                </span>
                                <span className="text-xs text-gray-500 leading-normal">
                                    When enabled, students can save the uploaded prompt guidelines sheet directly to local devices.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Global Actions Footer Block */}
                    <div className="flex flex-col-reverse sm:hidden items-center gap-3 pt-6 border-t border-gray-200">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="w-full border-gray-300 text-gray-700 h-11 text-sm font-semibold"
                        >
                            <X className="w-4 h-4 mr-2" /> Cancel Changes
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="w-full bg-gray-900 text-white hover:bg-gray-800 h-11 text-sm font-semibold shadow-sm"
                        >
                            <Save className="w-4 h-4 mr-2" /> Publish Assignment
                        </Button>
                    </div>

                </section>
            </main>
        </div>
    );
}