"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, User, FileText, Download, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";

// Assuming this helper utility can be imported here if defined elsewhere:
// import { getUser } from "@/app/utils/auth";

function ScorePageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const assignmentId = searchParams.get("assignment_id");
    const studentId = searchParams.get("student_id");

    // 1. Setup user authentication state tracker
    const [user, setUser] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submission, setSubmission] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [marks, setMarks] = useState<number | "">("");

    const [isPdf, setIsPdf] = useState(false);
    const [fileName, setFileName] = useState("submission_document");

    const directFileUrl = submission ? `${API_BASE_URL}/submissions/file/${submission.id}` : null;

    // 2. Pull user on mount stage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const currentUser = getUser();
            setUser(currentUser);
        }
    }, []);

    // 3. Combined execution for validating access and then resolving student record assets
    useEffect(() => {
        if (!assignmentId || !studentId || !user?.id) return;

        const verifyAccessAndFetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // A. Run access verification check against the backend endpoint first
                const accessFormData = new URLSearchParams();
                accessFormData.append("assignment_id", assignmentId);
                accessFormData.append("current_user_id", user.id.toString());

                const authRes = await fetch(`${API_BASE_URL}/assignment-access/check`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: accessFormData,
                });

                // Immediately boot out or bounce unauthorized instructors
                if (authRes.status === 403) {
                    router.push("/errors/autharization");
                    return;
                }

                if (!authRes.ok) {
                    const authErrData = await authRes.json().catch(() => ({}));
                    throw new Error(authErrData?.detail || `Verification status issue: ${authRes.status}`);
                }

                // B. Authorization confirmed, fetch submission metadata
                const metaRes = await fetch(
                    `${API_BASE_URL}/submissions/assignment/${assignmentId}/student/${studentId}`
                );

                if (!metaRes.ok) {
                    throw new Error("The specified candidate assignment record was not found.");
                }

                const data = await metaRes.json();
                setSubmission(data);
                setMarks(data.marks ?? "");

                const inferredName = data.fileName || data.filename || "Submission_Asset";
                setFileName(inferredName);

                const extension = inferredName.split(".").pop()?.toLowerCase() || "";
                setIsPdf(extension === "pdf");

            } catch (err: any) {
                setError(err.message || "An unexpected integration failure occurred.");
            } finally {
                setLoading(false);
            }
        };

        verifyAccessAndFetchData();
    }, [assignmentId, studentId, user]);

    const handleSaveGrade = async () => {
        if (!submission) return;

        try {
            setSaving(true);
            const formData = new FormData();

            if (marks !== "") {
                formData.append("marks", String(marks));
            }

            const res = await fetch(
                `${API_BASE_URL}/submissions/grade/${submission.id}`,
                {
                    method: "PUT",
                    body: formData,
                }
            );

            if (!res.ok) throw new Error("Failed to post marks updates.");

            const updated = await res.json();
            setSubmission(updated);
            alert("Marks updated successfully!");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-4xl animate-pulse space-y-6">
                    <div className="h-4 w-24 bg-gray-200" />
                    <div className="h-10 w-2/4 bg-gray-900" />
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
                        <div className="lg:col-span-8 h-[650px] bg-gray-50 border border-gray-200" />
                        <div className="lg:col-span-4 h-[300px] bg-gray-50 border border-gray-100" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || (!loading && !submission)) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="text-center border border-gray-200 p-12 max-w-md bg-gray-50">
                    <AlertCircle className="w-12 h-12 mx-auto text-red-600 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tighter">Submission Missing</h2>
                    <p className="text-gray-500 mt-2 mb-6">{error || "The requested evaluation asset cannot be populated."}</p>
                    <button onClick={() => router.back()} className="px-6 py-2 bg-gray-900 text-white text-sm font-medium uppercase tracking-widest hover:bg-black transition">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 antialiased">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 md:px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                        BACK TO SUBMISSIONS
                    </button>
                    <div className="hidden md:flex gap-4">
                        {directFileUrl && (
                            <a
                                href={`${API_BASE_URL}/submissions/file/${submission.id}`}
                                download={fileName}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-gray-900 px-4 py-2 hover:bg-gray-900 hover:text-white transition"
                            >
                                <Download className="w-3 h-3" /> Download Submission File
                            </a>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-6">
                    <section>
                        <div className="flex items-center gap-4 mb-2">
                            <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">Student Deliverable</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif font-medium leading-tight text-gray-900 break-all">{fileName}</h1>
                    </section>

                    <section className="relative">
                        {directFileUrl ? (
                            isPdf ? (
                                <div className="border border-gray-200 bg-gray-50 p-1 md:p-2 shadow-2xl">
                                    <div className="bg-gray-900 text-white px-4 py-2 flex justify-between items-center">
                                        <span className="text-[10px] font-bold tracking-widest uppercase">Embedded File Frame Preview</span>
                                        <FileText className="w-4 h-4 opacity-50" />
                                    </div>
                                    <iframe src={`${directFileUrl}#toolbar=0`} className="w-full h-[600px] md:h-[850px] bg-white border-0" title="Assignment Document Viewer" />
                                </div>
                            ) : (
                                <div className="bg-gray-900 text-white p-16 text-center border border-gray-800">
                                    <FileText className="w-12 h-12 mx-auto mb-6 opacity-20" />
                                    <h3 className="text-xl mb-3 font-serif">Office Document Asset</h3>
                                    <p className="text-gray-400 mb-8 max-w-xs mx-auto text-sm">This file extension format must be evaluated via external workstation software packages.</p>
                                    <a href={directFileUrl} download={fileName} className="inline-block bg-white text-gray-900 px-8 py-3 text-sm font-bold uppercase tracking-tighter hover:bg-gray-200 transition">Extract Document File</a>
                                </div>
                            )
                        ) : (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-20 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-300 mb-4" />
                                <p className="text-sm text-gray-500">Initializing document connection streams...</p>
                            </div>
                        )}
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="border border-gray-100 bg-gray-50 p-6 sticky top-28 space-y-6">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-200 pb-2 text-gray-400">Candidate Identification</h4>
                            <div className="flex gap-4 items-center">
                                <div className="p-2 bg-white border border-gray-200 h-fit">
                                    <User className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student ID Reference</p>
                                    <p className="text-sm font-mono font-bold text-gray-900">{studentId || "UNASSIGNED"}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-200 pb-2 text-gray-400">Evaluation Performance</h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Assigned Score Input</label>
                                    <input
                                        type="number"
                                        value={marks}
                                        onChange={(e) => setMarks(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="w-full bg-white p-3 border border-gray-200 focus:outline-none focus:border-gray-900 text-sm font-semibold transition font-mono"
                                        placeholder="Add numeric point marks..."
                                    />
                                </div>
                                <button onClick={handleSaveGrade} disabled={saving || marks === ""} className="w-full bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest py-3.5 transition disabled:bg-gray-300 disabled:text-gray-500 shadow-sm">
                                    {saving ? "Updating Record Ledger..." : "Commit Grade Parameter"}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grading Status</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 border uppercase ${submission?.marks !== null && submission?.marks !== undefined ? "border-green-600 text-green-600 bg-white" : "border-amber-600 text-amber-600 bg-white"}`}>
                                    {submission?.marks !== null && submission?.marks !== undefined ? "Evaluated" : "Pending Action"}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 md:hidden">
                            {directFileUrl && (
                                <a href={directFileUrl} download={fileName} className="w-full bg-gray-900 text-white text-center py-3 text-xs font-bold uppercase tracking-widest">Download Attachment File</a>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function SimpleScorePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white p-6 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
                <p className="text-sm text-gray-500 mt-2">Loading scoring screen system assets...</p>
            </div>
        }>
            <ScorePageContent />
        </Suspense>
    );
}