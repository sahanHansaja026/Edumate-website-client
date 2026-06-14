"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/app/config/api";
import {
    ChevronLeft,
    Download,
    ExternalLink,
    Lock,
    Clock,
    FileText,
    Calendar,
    AlertCircle
} from "lucide-react";
import { getUser } from "@/app/services/authService";

type Content = {
    assignment_id: number;
    module_id: number;
    title: string;
    description?: string;
    week: number;
    file_path: string;
    open_date?: string;
    close_date?: string;
    allow_download: boolean;
};

export default function ViewContentPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [access, setAccess] = useState<boolean | null>(null);
    const [content, setContent] = useState<Content | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchContent();
    }, [id]);

    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);

        if (currentUser && content) {
            checkAccess(currentUser.id, currentUser.email);
        }
    }, [content]);

    // Triggers a client-side redirect if backend access evaluation fails
    useEffect(() => {
        if (access === false) {
            router.push("/errors/autharization");
        }
    }, [access, router]);

    const fetchContent = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/contents/view/${id}`);
            if (!res.ok) throw new Error("Failed to fetch content");
            const data = await res.json();
            setContent(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Submits credentials matching the expected FastAPI query signature
    const checkAccess = async (userId: number, studentEmail: string) => {
        try {
            const res = await fetch(
                `${API_BASE_URL}/content-access/check/${id}?user_id=${userId}&student_email=${encodeURIComponent(studentEmail)}`
            );

            const data = await res.json();
            setAccess(data.access);
        } catch (err) {
            console.error("Access check failed", err);
            setAccess(false);
        }
    };

    const today = new Date();
    const getStatus = () => {
        if (!content?.open_date) return "LOCKED";
        const open = new Date(content.open_date);
        const close = content.close_date ? new Date(content.close_date) : null;
        if (today < open) return "LOCKED";
        if (close && today > close) return "EXPIRED";
        return "AVAILABLE";
    };

    const status = getStatus();
    const isPdf = content?.file_path?.toLowerCase().endsWith(".pdf");

    if (loading) {
        return (
            <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-4xl animate-pulse">
                    <div className="h-4 w-24 bg-gray-200 mb-4" />
                    <div className="h-12 w-3/4 bg-gray-900 mb-8" />
                    <div className="h-[600px] w-full bg-gray-100 border border-gray-200" />
                </div>
            </div>
        );
    }

    // Prevents interface flashes while router coordinates redirect layout transitions
    if (access === false) {
        return null;
    }

    if (!content) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="text-center border border-gray-200 p-12 max-w-md bg-gray-50">
                    <AlertCircle className="w-12 h-12 mx-auto text-red-600 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">Resource Not Found</h2>
                    <p className="text-gray-500 mt-2 mb-6">The requested material is missing or has been moved.</p>
                    <button onClick={() => router.back()} className="px-6 py-2 bg-gray-900 text-white text-sm font-medium uppercase tracking-widest hover:bg-black transition">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* NAVIGATION HEADER */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 md:px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link
                        href={`/moduleinside/${content.module_id}`}
                        className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                        BACK TO MODULE
                    </Link>
                    <div className="hidden md:flex gap-4">
                        {content.allow_download && content.file_path && status === "AVAILABLE" && (
                            <a
                                href={content.file_path.startsWith("http") ? content.file_path : `${API_BASE_URL}/${content.file_path}`}
                                download
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-gray-900 px-4 py-2 hover:bg-gray-900 hover:text-white transition"
                            >
                                <Download className="w-3 h-3" /> Download PDF
                            </a>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* LEFT COLUMN: PRIMARY CONTENT */}
                <div className="lg:col-span-8 space-y-8">
                    <section>
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
                                Week {content.week} • Curriculum Material
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight mb-4">
                            {content.title}
                        </h1>
                        <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                            {content.description || "No specific instructions provided for this resource."}
                        </p>
                    </section>

                    <section className="relative">
                        {status === "AVAILABLE" ? (
                            isPdf ? (
                                <div className="border border-gray-200 bg-gray-50 p-1 md:p-2 shadow-2xl">
                                    <div className="bg-gray-900 text-white px-4 py-2 flex justify-between items-center">
                                        <span className="text-[10px] font-bold tracking-widest uppercase">Document Preview</span>
                                        <FileText className="w-4 h-4 opacity-50" />
                                    </div>
                                    <iframe
                                        src={content.file_path.startsWith("http") ? content.file_path : `${API_BASE_URL}/${content.file_path}#toolbar=0`}
                                        className="w-full h-[600px] md:h-[850px] bg-white"
                                    />
                                </div>
                            ) : (
                                <div className="bg-gray-900 text-white p-12 text-center border border-gray-800">
                                    <ExternalLink className="w-12 h-12 mx-auto mb-6 opacity-20" />
                                    <h3 className="text-xl mb-4 font-serif">External Learning Resource</h3>
                                    <p className="text-gray-400 mb-8 max-w-sm mx-auto">This resource is hosted on an external platform. Click below to continue.</p>
                                    <a
                                        href={`${API_BASE_URL}/${content.file_path}`}
                                        target="_blank"
                                        className="inline-block bg-white text-gray-900 px-8 py-3 text-sm font-bold uppercase tracking-tighter hover:bg-gray-200 transition"
                                    >
                                        Open External Link
                                    </a>
                                </div>
                            )
                        ) : (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-20 text-center">
                                <Lock className="w-10 h-10 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-bold uppercase tracking-widest">{status}</h3>
                                <p className="text-gray-500 mt-2">
                                    {status === "LOCKED"
                                        ? `Access opens on ${new Date(content.open_date!).toLocaleDateString()}`
                                        : "This resource period has ended."}
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* RIGHT COLUMN: SIDEBAR INFO */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="border border-gray-100 bg-gray-50 p-6 sticky top-28">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">
                            Resource Logistics
                        </h4>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="p-2 bg-white border border-gray-200 h-fit">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Availability</p>
                                    <p className="text-sm font-medium">
                                        {content.open_date ? new Date(content.open_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : "Always Open"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="p-2 bg-white border border-gray-200 h-fit">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Deadline</p>
                                    <p className="text-sm font-medium">
                                        {content.close_date ? new Date(content.close_date).toLocaleDateString(undefined, { dateStyle: 'long' }) : "No Expiry"}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 border ${status === 'AVAILABLE' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}`}>
                                        {status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Downloads</span>
                                    <span className="text-[10px] font-bold text-gray-900">
                                        {content.allow_download && status === "AVAILABLE" ? "ENABLED" : "RESTRICTED"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* MOBILE ONLY ACTIONS */}
                        <div className="mt-8 flex flex-col gap-2 md:hidden">
                            {content.allow_download && content.file_path && status === "AVAILABLE" && (
                                <a href={`${API_BASE_URL}/${content.file_path}`} download className="w-full bg-gray-900 text-white text-center py-3 text-xs font-bold uppercase tracking-widest">
                                    Download Now
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}