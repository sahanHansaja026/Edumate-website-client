"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation"; // Added useRouter for redirection
import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";
import Link from "next/link";
import {
    Calendar,
    Clock,
    FileText,
    Download,
    UploadCloud,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowLeft,
    MessageSquare,
    User,
    ChevronRight
} from "lucide-react";

type Assignment = {
    id: number;
    module_id: number;
    title: string;
    description: string;
    file_path: string | null;
    open_date: string | null;
    close_date: string | null;
    allow_download: boolean;
};

export default function Page() {
    const params = useParams();
    const router = useRouter(); // Initialize the router instance
    const id = params.id as string;

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [authChecking, setAuthChecking] = useState(true); // Track authorization verification state
    const [user, setUser] = useState<any>(null);

    // submission UI panel states
    const [isFormOpen, setIsFormOpen] = useState(false);

    // submission data states
    const [file, setFile] = useState<File | null>(null);
    const [customName, setCustomName] = useState("");
    const [feedback, setFeedback] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submission, setSubmission] = useState<any>(null);
    const [checking, setChecking] = useState(true);

    // 1. Load user context on mount
    useEffect(() => {
        const u = getUser();
        setUser(u);
    }, []);

    // 2. Authorize user access against the FastAPI guard endpoint
    useEffect(() => {
        const verifyAccess = async () => {
            // Wait until user state is initialized from auth service
            if (!user) return;

            // If user isn't logged in at all, redirect to authorization error page
            if (!user.id || !user.email) {
                router.push("/errors/autharization");
                return;
            }

            try {
                const res = await fetch(
                    `${API_BASE_URL}/assignment-access/check?assignment_id=${id}&user_id=${user.id}&user_email=${encodeURIComponent(user.email)}`
                );

                if (!res.ok) {
                    router.push("/errors/autharization");
                    return;
                }

                const authData = await res.json();

                if (authData.access === false) {
                    router.push("/errors/autharization");
                } else {
                    setAuthChecking(false); // User verified successfully
                }
            } catch (err) {
                console.error("Authorization check failed:", err);
                router.push("/errors/autharization");
            }
        };

        if (user !== null) {
            verifyAccess();
        }
    }, [id, user, router]);

    // 3. Fetch assignment data
    useEffect(() => {
        const fetchAssignment = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/assignments/${id}`);
                if (!res.ok) {
                    setAssignment(null);
                    return;
                }
                const data = await res.json();
                setAssignment(data);
            } catch (err) {
                console.error(err);
                setAssignment(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignment();
    }, [id]);

    // 4. Fetch structural user submission records
    const fetchSubmission = useCallback(async () => {
        if (!user?.id) return;
        try {
            setChecking(true);
            const res = await fetch(
                `${API_BASE_URL}/submissions/check/${id}/${user.id}`
            );

            if (!res.ok) {
                setSubmission(null);
                return;
            }

            const data = await res.json();
            setSubmission(data);
        } catch (err) {
            console.error(err);
            setSubmission(null);
        } finally {
            setChecking(false);
        }
    }, [id, user?.id]);

    useEffect(() => {
        fetchSubmission();
    }, [fetchSubmission]);

    const handleCancel = () => {
        setFile(null);
        setCustomName("");
        setFeedback("");
        setIsFormOpen(false);
    };

    const handleSubmit = async () => {
        if (!user?.id) {
            alert("Please login first");
            return;
        }

        if (!file) {
            alert("Please select a file");
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("assignment_id", id);
            formData.append("student_id", user.id);

            const renamedFile = new File(
                [file],
                customName || file.name,
                { type: file.type }
            );
            formData.append("file", renamedFile);

            const res = await fetch(`${API_BASE_URL}/submissions/`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Submission failed");
            }

            alert("Assignment submitted successfully!");
            handleCancel();
            await fetchSubmission();
        } catch (err) {
            console.error(err);
            alert("Error submitting assignment");
        } finally {
            setSubmitting(false);
        }
    };

    // Show spinner if basic asset metadata or authorization handshake is pending
    if (loading || authChecking) {
        return (
            <div className="w-full min-h-screen flex flex-col items-center justify-center space-y-4 bg-white text-slate-500">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <span className="text-base font-medium tracking-wide text-slate-600">
                    {authChecking ? "Verifying clearance clearance..." : "Loading assignment workspace..."}
                </span>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="w-full min-h-screen bg-white p-8 md:p-16">
                <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-lg font-semibold">Assignment Unavailable</h4>
                        <p className="text-red-700/90 mt-1">The resource you are looking for does not exist or has been archived by the instructor.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-white text-slate-900 flex flex-col">

            {/* TOP NAVIGATION / HEADER BAR */}
            <header className="w-full border-b border-slate-200 px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <Link href={`/moduleinside/${assignment.module_id}`} className="flex items-center gap-1.5 hover:text-slate-900 transition font-medium">
                        <ArrowLeft className="h-4 w-4" /> Course Dashboard
                    </Link>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                    <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-xs">{assignment.title}</span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-200/70 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    {user ? `Student ID: ${user.id}` : "Guest Access"}
                </div>
            </header>

            {/* MAIN FULL PAGE CONTENT GRID */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

                {/* LEFT COLUMN: Assignment Text & Interactive Submissions */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Header Details */}
                    <div>
                        <span className="text-xs font-bold text-blue-600 tracking-widest uppercase block mb-1">Assignment Workspace</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                            {assignment.title}
                        </h1>
                    </div>

                    {/* Assignment Description Area */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-400 tracking-wider uppercase">Instructions & Prompt</h2>
                        <div className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap bg-slate-50/40 p-6 rounded-xl border border-slate-100">
                            {assignment.description}
                        </div>
                    </div>

                    {/* Dynamic Submission Flow Area */}
                    <div className="pt-6 border-t border-slate-200 space-y-6">
                        <h2 className="text-lg font-bold tracking-tight text-slate-900">Your Deliverables</h2>

                        {checking ? (
                            <div className="flex items-center gap-3 text-sm text-slate-500 py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                Checking institutional records...
                            </div>
                        ) : submission ? (
                            /* COMPLETED / GRADED STATE DISPLAY */
                            <div className="space-y-6">
                                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                    <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Submission Summary</span>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${submission.marks !== null ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                                            }`}>
                                            {submission.marks !== null ? "Graded" : "Submitted"}
                                        </span>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">File Receipt</p>
                                                <a
                                                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2 mt-1 underline underline-offset-4 text-sm"
                                                    href={`${API_BASE_URL}/${submission.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FileText className="h-4 w-4" /> View Submitted Document
                                                </a>
                                            </div>
                                            <div className="text-sm sm:text-right">
                                                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Timestamp</p>
                                                <p className="text-slate-600 mt-1 font-medium">{new Date(submission.submitted_at).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {submission.feedback && (
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
                                                    <MessageSquare className="h-3.5 w-3.5 text-slate-400" /> Evaluator Remarks
                                                </p>
                                                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{submission.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* UN-SUBMITTED STATE FLOW */
                            <div className="space-y-6">
                                {!isFormOpen ? (
                                    <div className="bg-amber-50/60 border border-amber-200/80 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-3.5">
                                            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-amber-900 text-sm">No Submission Found</h4>
                                                <p className="text-amber-800/80 text-sm mt-0.5">You have not uploaded or submitted any work for this evaluation task yet.</p>
                                            </div>
                                        </div>
                                        {user ? (
                                            <button
                                                onClick={() => setIsFormOpen(true)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition shadow-sm whitespace-nowrap self-start sm:self-auto"
                                            >
                                                Start Submission
                                            </button>
                                        ) : (
                                            <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5 bg-red-50 p-3 rounded-lg border border-red-100">
                                                <AlertCircle className="h-4 w-4" /> Please authenticate to submit.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    /* FULL PAGE WIDTH SUBMISSION FORM ARCHITECTURE */
                                    <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                                        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Upload Digital Deliverables</h3>
                                            <button onClick={handleCancel} className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition">Cancel</button>
                                        </div>

                                        <div className="space-y-5">
                                            {/* Dropzone File Input */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attached File</label>
                                                <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white p-8 hover:border-blue-500 transition-colors group text-center">
                                                    <input
                                                        type="file"
                                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    />
                                                    <div className="flex flex-col items-center justify-center pointer-events-none space-y-2">
                                                        <UploadCloud className="h-10 w-10 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                                        <p className="text-sm font-medium text-slate-800">
                                                            {file ? <span className="text-blue-600 font-bold">{file.name}</span> : "Drag files here or click to browse"}
                                                        </p>
                                                        <p className="text-xs text-slate-400">Accepted formats: PDF, ZIP, DOCX up to 50MB</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Custom File Renaming */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">System File Rename (Optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Assignment1_Final.pdf"
                                                    value={customName}
                                                    onChange={(e) => setCustomName(e.target.value)}
                                                    className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm shadow-inner"
                                                />
                                            </div>

                                            {/* Notes Input */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes for Evaluator (Optional)</label>
                                                <textarea
                                                    placeholder="Provide configuration or execution context details here..."
                                                    value={feedback}
                                                    onChange={(e) => setFeedback(e.target.value)}
                                                    className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm shadow-inner"
                                                    rows={4}
                                                />
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                                            <button
                                                onClick={handleSubmit}
                                                disabled={submitting}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-sm flex items-center gap-2"
                                            >
                                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                                {submitting ? "Uploading Material..." : "Finalize & Submit Assignment"}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={submitting}
                                                className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Sidebar Metadata & Status Metrics */}
                <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6 lg:pl-4 lg:border-l lg:border-slate-200/80">

                    {/* Visual Large Score Display if Graded */}
                    {submission && submission.marks !== null && (
                        <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-6 text-center space-y-1">
                            <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-600 block">Evaluation Score</span>
                            <span className="text-5xl font-black text-emerald-700 tracking-tight block">{submission.marks}</span>
                            <span className="text-xs text-emerald-600/80 font-medium block pt-1">Recorded in system</span>
                        </div>
                    )}

                    {/* Assignment Deadlines and Information Parameters */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Timeline Parameters</h3>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <Calendar className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Open Date</p>
                                    <p className="text-slate-800 font-medium mt-0.5">
                                        {assignment.open_date ? new Date(assignment.open_date).toLocaleString() : "Immediate Release"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <Clock className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold text-slate-500 text-xs uppercase tracking-wider">Due Date Deadline</p>
                                    <p className="text-slate-800 font-medium mt-0.5">
                                        {assignment.close_date ? new Date(assignment.close_date).toLocaleString() : "No Structured Deadline"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resources Module Section */}
                    {assignment.file_path && (
                        <div className="pt-4 border-t border-slate-200 space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Reference Materials</h3>
                            <a
                                href={`${API_BASE_URL}/${assignment.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold uppercase tracking-wider text-white p-3 rounded-xl transition shadow-sm"
                            >
                                <Download className="h-4 w-4" /> Download Attachments
                            </a>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}