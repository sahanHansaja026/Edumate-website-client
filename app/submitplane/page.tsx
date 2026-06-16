"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { API_BASE_URL } from "@/app/config/api";

function SubmitPlaneForm() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Read immutable parameters safely from URL parameters
    const userId = searchParams.get("user_id") || "";
    const userEmail = searchParams.get("user_email") || "";
    const planType = searchParams.get("plan_type") || "free";
    const startDate = searchParams.get("start_date") || "";
    const validPeriod = searchParams.get("valid_period") || "";
    const expireDate = searchParams.get("expire_date") || "";

    // Modal and Mutable UI states
    const [file, setFile] = useState<File | null>(null);
    const [referenceId, setReferenceId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showAgreement, setShowAgreement] = useState(true);
    const [lang, setLang] = useState<"en" | "si">("en"); // <-- Add this state line

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const formatToISOString = (dateStr: string): string => {
        if (!dateStr) return new Date().toISOString();
        try {
            const parsedDate = new Date(dateStr);
            if (isNaN(parsedDate.getTime())) return new Date().toISOString();
            return parsedDate.toISOString();
        } catch {
            return new Date().toISOString();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) return alert("Missing required User Identity Reference context parameter.");
        if (!userEmail.trim()) return alert("User email is required.");
        if (!referenceId.trim()) return alert("Transaction reference is required.");
        if (!file) return alert("Receipt file is required.");

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("user_id", userId);
            formData.append("user_email", userEmail);
            formData.append("plan_type", planType);
            formData.append("start_date", formatToISOString(startDate));
            formData.append("valid_period", validPeriod);
            formData.append("expire_date", formatToISOString(expireDate));
            formData.append("transaction_reference", referenceId.trim());
            formData.append("receipt_file", file);

            const res = await fetch(`${API_BASE_URL}/subscription/submit-slip`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Submission verification processing failure.");
            }

            alert("Your receipt has been submitted successfully! Our backend team will verify your payment shortly.");
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            alert(`Submission Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPlanBadgeStyles = () => {
        if (planType === "edu") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        if (planType === "premium") return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">

            {/* CENTERED POPUP WINDOW / AGREEMENT MODAL */}
            {showAgreement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">

                        {/* LANGUAGE SELECTOR */}
                        <div className="flex justify-end gap-2 text-xs border-b border-slate-800 pb-3">
                            <button
                                type="button"
                                onClick={() => setLang("en")}
                                className={`px-2.5 py-1 rounded md:transition-colors ${lang === "en" ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                            >
                                English
                            </button>
                            <button
                                type="button"
                                onClick={() => setLang("si")}
                                className={`px-2.5 py-1 rounded md:transition-colors ${lang === "si" ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                            >
                                සිංහල
                            </button>
                        </div>

                        {/* WARNING HEADER */}
                        <div className="space-y-1">
                            <div className="w-11 h-11 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-xl mx-auto mb-1">
                                ⚠️
                            </div>
                            <h2 className="text-lg font-black tracking-tight text-rose-500 uppercase">
                                {lang === "en" ? "Important Notice & Agreement" : "වැදගත් දැනුම්දීම සහ එකඟතාවය"}
                            </h2>
                            <p className="text-[11px] text-slate-400">
                                {lang === "en" ? "Please read carefully before submitting your receipt." : "ඔබගේ රිසිට්පත යොමු කිරීමට පෙර කරුණාකර මෙය හොඳින් කියවන්න."}
                            </p>
                        </div>

                        {/* DIRECT RESPONSIBILITY DISCLAIMER (RED TEXT BANNER) */}
                        <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 text-left space-y-1">
                            <p className="text-xs text-rose-400 font-black uppercase tracking-wider">
                                {lang === "en" ? "We Are Not Responsible:" : "අප වගකීමක් නොගන්නා වගයි:"}
                            </p>
                            <p className="text-xs text-rose-300 font-semibold leading-relaxed">
                                {lang === "en" ? (
                                    "We are not responsible or liable for any lost money, bank transfer errors, typing mistakes, or fake/wrong receipt slips uploaded to this system. Please verify everything on your end before proceeding."
                                ) : (
                                    "මුදල් අස්ථානගතවීම්, බැංකු හුවමාරු දෝෂ, වැරදි තොරතුරු ඇතුළත් කිරීම් හෝ ව්‍යාජ රිසිට්පත් යොමු කිරීම් සම්බන්ධයෙන් අප කිසිදු වගකීමක් භාර නොගන්නා බව කරුණාවෙන් සලකන්න. ඉදිරියට යාමට පෙර සියල්ල නිවැරදිදැයි පරීක්ෂා කර බලන්න."
                                )}
                            </p>
                        </div>

                        {/* TIMELINE DETAILS */}
                        <div className="text-left bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="text-indigo-400 mt-0.5 text-sm">⏳</span>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    <strong className="text-white">{lang === "en" ? "24-Hour Review:" : "පැය 24ක පරීක්ෂාව:"}</strong>{" "}
                                    {lang === "en" ? (
                                        <>Within <span className="text-indigo-400 font-bold">24 hours</span>, we will personally check if your payment request is valid or invalid.</>
                                    ) : (
                                        <>ඔබගේ ගෙවීම් රිසිට්පත නිවැරදිද නැද්ද යන්න අප <span className="text-indigo-400 font-bold">පැය 24ක් ඇතුළත</span> පරීක්ෂා කර බලනු ලැබේ.</>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-indigo-400 mt-0.5 text-sm">📧</span>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    <strong className="text-white">{lang === "en" ? "Email & Activation:" : "විද්‍යුත් තැපෑල සහ සක්‍රීය කිරීම:"}</strong>{" "}
                                    {lang === "en" ? (
                                        "Once confirmed, we will send an email about your approval status and manually activate your subscription plan request."
                                    ) : (
                                        "එය තහවුරු වූ වහාම, අනුමැතිය ලැබුණේද නැද්ද යන තත්ත්වය පිළිබඳව ඔබට Email පණිවිඩයක් ලැබෙන අතර ඔබ ඉල්ලුම් කළ සැලසුම (Plan) සක්‍රීය කරනු ඇත."
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="pt-1 flex gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-1/3 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition-colors"
                            >
                                {lang === "en" ? "Cancel" : "අවලංගු කරන්න"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAgreement(false)}
                                className="w-2/3 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-lg shadow-indigo-600/20 transition-colors"
                            >
                                {lang === "en" ? "I Understand & Agree" : "මම කියවා තේරුම් ගතිමි"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* MAIN SYSTEM CONTAINER PANEL (Blurred slightly if modal is active) */}
            <div className={`w-full max-w-5xl bg-slate-950/40 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden grid md:grid-cols-12 transition-all duration-300 ${showAgreement ? 'blur-sm pointer-events-none scale-[0.99]' : ''}`}>

                {/* LEFT PANEL: IMMUTABLE INVOICE PASS */}
                <div className="md:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 font-bold text-sm">EM</span>
                            <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">EduMate Order Hub</span>
                        </div>

                        <h2 className="text-xl font-bold tracking-tight text-white mb-1">Selected Access Pass</h2>
                        <p className="text-xs text-slate-400 mb-6">These parameters are system-locked and secure.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium mb-1">Target Tier</label>
                                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase border ${getPlanBadgeStyles()}`}>
                                    {planType === "edu" ? "Campus Institutional" : planType === "premium" ? "Professional" : "Basic Free"}
                                </span>
                            </div>

                            <div className="border-t border-slate-800/60 pt-3">
                                <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium">Account Email</label>
                                <p className="text-sm font-semibold text-slate-300 break-all">{userEmail || "N/A"}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">ID Reference: #{userId || "N/A"}</p>
                            </div>

                            <div className="border-t border-slate-800/60 pt-3 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium">Starts On</label>
                                    <p className="text-sm font-semibold text-slate-300">{startDate || "Immediate"}</p>
                                </div>
                                <div>
                                    <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium">Valid Term</label>
                                    <p className="text-sm font-semibold text-slate-300">{validPeriod || "N/A"}</p>
                                </div>
                            </div>

                            <div className="border-t border-slate-800/60 pt-3">
                                <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium">Expiration Threshold</label>
                                <p className="text-sm font-semibold text-rose-400">{expireDate || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                        Secure transaction payload validation layer. EduMate &copy; {new Date().getFullYear()}
                    </div>
                </div>

                {/* RIGHT PANEL: MUTABLE FORM INPUT SUBMISSION */}
                <form onSubmit={handleSubmit} className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight text-white mb-1">Verify Remittance</h3>
                        <p className="text-xs text-slate-400 mb-6">Upload your bank deposit slip or transaction receipt summary below.</p>

                        <div className="space-y-5">
                            {/* TRANSACTION REFERENCE INPUT */}
                            <div>
                                <label htmlFor="reference" className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Transaction Reference / Journal ID <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="reference"
                                    type="text"
                                    required
                                    value={referenceId}
                                    onChange={(e) => setReferenceId(e.target.value)}
                                    placeholder="e.g. TXN-9827410924"
                                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                />
                            </div>

                            {/* RECEIPT FILE UPLOAD DRAG/DROP ZONE */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Upload Receipt Document <span className="text-rose-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/50 rounded-xl p-6 text-center transition-colors relative">
                                    <input
                                        type="file"
                                        required
                                        accept="image/*,application/pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="space-y-2">
                                        <div className="text-2xl">📁</div>
                                        <p className="text-xs text-slate-300 font-medium">
                                            {file ? "Change selected file" : "Drag & drop file or click to browse"}
                                        </p>
                                        <p className="text-[11px] text-slate-500">Supports PDF, PNG, JPG, JPEG formats</p>
                                    </div>
                                </div>

                                {/* FILE SUFFIX CHIP */}
                                {file && (
                                    <div className="mt-3 flex items-center justify-between bg-slate-900 border border-indigo-500/20 px-3 py-2 rounded-lg">
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="text-indigo-400 text-xs">✔</span>
                                            <span className="text-xs text-slate-300 font-medium truncate">{file.name}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-3 px-4 rounded-lg text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></span>
                                    Processing Order Securely...
                                </>
                            ) : (
                                "Complete Verification Submission"
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

export default function SubmitPlanePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading billing context validation module...</div>}>
            <SubmitPlaneForm />
        </Suspense>
    );
}