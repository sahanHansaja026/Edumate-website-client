"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
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
    const [lang, setLang] = useState<"en" | "si">("en");

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
        if (planType === "edu") return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (planType === "premium") return "bg-indigo-50 text-indigo-700 border-indigo-200";
        return "bg-slate-100 text-slate-700 border-slate-200";
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">

            {/* CENTERED POPUP WINDOW / AGREEMENT MODAL */}
            {showAgreement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">

                        {/* LANGUAGE SELECTOR */}
                        <div className="flex justify-end gap-2 text-xs border-b border-slate-100 pb-3">
                            <button
                                type="button"
                                onClick={() => setLang("en")}
                                className={`px-2.5 py-1 rounded transition-colors ${lang === "en" ? "bg-indigo-600 text-white font-semibold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                            >
                                English
                            </button>
                            <button
                                type="button"
                                onClick={() => setLang("si")}
                                className={`px-2.5 py-1 rounded transition-colors ${lang === "si" ? "bg-indigo-600 text-white font-semibold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                            >
                                සිංහල
                            </button>
                        </div>

                        {/* WARNING HEADER */}
                        <div className="space-y-1">
                            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xl mx-auto mb-2 border border-rose-100">
                                ⚠️
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                                {lang === "en" ? "Important Notice & Activation" : "වැදගත් දැනුම්දීම සහ සැලසුම් සක්‍රීය කිරීම"}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {lang === "en" ? "Please read the requirements completely before uploading." : "කරුණාකර ඉදිරියට යාමට පෙර සියලු උපදෙස් හොඳින් කියවන්න."}
                            </p>
                        </div>

                        {/* BANK DETAILS & STEP-BY-STEP */}
                        <div className="text-left bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-2.5 text-xs">
                            <p className="font-bold text-indigo-800 uppercase tracking-wider">
                                {lang === "en" ? "How to Activate Your Plan:" : "සැලසුම සක්‍රීය කරගන්නා ආකාරය:"}
                            </p>
                            <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                                <li>
                                    {lang === "en" ? <>Transfer the exact amount to Account Number: <strong className="text-indigo-700 font-mono text-sm bg-indigo-100/50 px-1 rounded">4924086</strong></> : <>නියමිත මුදල මෙම ගිණුම් අංකයට බැර කරන්න: <strong className="text-indigo-700 font-mono text-sm bg-indigo-100/50 px-1 rounded">4924086</strong></>}
                                </li>
                                <li>
                                    {lang === "en" ? <>Write your account email (<span className="text-indigo-600 font-semibold">{userEmail || "your email"}</span>) on the receipt or payment reference remarks slot.</> : <>ගෙවීම් රිසිට්පත මත හෝ Transfer Remarks ලෙස ඔබගේ විද්‍යුත් තැපෑල (<span className="text-indigo-600 font-semibold">{userEmail || "ඔබගේ email ලිපිනය"}</span>) පැහැදිලිව සඳහන් කරන්න.</>}
                                </li>
                                <li>
                                    {lang === "en" ? "Capture a clear digital screenshot or image of the transaction slip summary." : "සම්පූර්ණ රිසිට්පත පැහැදිලිව පෙනෙන සේ ඡායාරූපයක් හෝ Screenshot එකක් ලබාගන්න."}
                                </li>
                            </ol>
                        </div>

                        {/* RESPONSIBILITY DISCLAIMER */}
                        <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 text-left space-y-1">
                            <p className="text-xs text-rose-800 font-bold uppercase tracking-wider">
                                {lang === "en" ? "Liability Disclaimer:" : "වගකීම් ලිහිල් කිරීම:"}
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                {lang === "en" ? (
                                    "We are not liable for any misdirected transactions, bank system connection dropouts, or typing mistakes. Double check details thoroughly before continuing."
                                ) : (
                                    "මුදල් අස්ථානගතවීම්, බැංකු පද්ධති දෝෂ, වැරදි තොරතුරු ඇතුළත් කිරීම් සම්බන්ධයෙන් අප කිසිදු වගකීමක් භාර නොගන්නා බව කරුණාවෙන් සලකන්න."
                                )}
                            </p>
                        </div>

                        {/* TIMELINE DETAILS */}
                        <div className="text-left bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-indigo-600 text-base mt-0.5">⏳</span>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    <strong className="text-slate-900">{lang === "en" ? "Strict 6-Hour Deadline:" : "පැය 6ක කාලසීමාව:"}</strong>{" "}
                                    {lang === "en" ? (
                                        <>Please submit your proof within <span className="text-rose-600 font-semibold">6 hours</span> of making the bank transfer. Verification requests processed outside this frame might see delays.</>
                                    ) : (
                                        <>මුදල් හුවමාරුව සිදුකර <span className="text-rose-600 font-semibold">පැය 6ක් ඇතුළත</span> රිසිට්පත මෙහි ඇතුලත් කරන්න.</>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-1/3 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                            >
                                {lang === "en" ? "Cancel" : "අවලංගු කරන්න"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAgreement(false)}
                                className="w-2/3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/10 transition-colors"
                            >
                                {lang === "en" ? "I Understand & Agree" : "මම කියවා තේරුම් ගතිමි"}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* MAIN SYSTEM CONTAINER PANEL */}
            <div className={`w-full max-w-5xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all duration-300 ${showAgreement ? 'blur-sm pointer-events-none scale-[0.99] opacity-40' : ''}`}>

                {/* LEFT PANEL: IMMUTABLE INVOICE PASS */}
                <div className="md:col-span-5 bg-slate-50 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <span className="p-2 rounded-lg bg-indigo-600 text-white font-bold text-xs tracking-wider">EM</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">EduMate Order Hub</span>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Selected Access Pass</h2>
                        <p className="text-xs text-slate-500 mb-6">These parameters are securely locked to your session.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Target Tier</label>
                                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase border ${getPlanBadgeStyles()}`}>
                                    {planType === "edu" ? "Campus Institutional" : planType === "premium" ? "Professional" : "Basic Free"}
                                </span>
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Account Email</label>
                                <p className="text-sm font-semibold text-slate-800 break-all">{userEmail || "N/A"}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">ID: #{userId || "N/A"}</p>
                            </div>

                            <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Starts On</label>
                                    <p className="text-xs font-semibold text-slate-700">{startDate || "Immediate"}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Valid Term</label>
                                    <p className="text-xs font-semibold text-slate-700">{validPeriod || "N/A"}</p>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Expiration Threshold</label>
                                <p className="text-xs font-semibold text-rose-600">{expireDate || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-400 font-medium">
                        EduMate Payment Validation Layer &copy; {new Date().getFullYear()}
                    </div>
                </div>

                {/* RIGHT PANEL: MUTABLE FORM INPUT SUBMISSION */}
                <form onSubmit={handleSubmit} className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between bg-white">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Verify Remittance</h3>
                        <p className="text-xs text-slate-500 mb-6">Provide your transaction receipt context metrics to complete deployment setup.</p>

                        {/* SAMPLE CSS RECEIPT PREVIEW DESIGN */}
                        <div className="mb-6 border border-indigo-100 bg-indigo-50/30 rounded-xl p-4 relative overflow-hidden">
                            <span className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl">
                                Expected Structure
                            </span>
                            <p className="text-xs font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
                                <span>📋</span> Verification Reference Mapping Blueprint
                            </p>

                            <div className="bg-white border border-slate-200 rounded-lg p-3 font-mono text-[11px] text-slate-600 space-y-1.5 shadow-sm">
                                <div className="flex justify-between border-b border-slate-100 pb-1 text-[10px] text-slate-400">
                                    <span>OFFICIAL BANK RECEIPT</span>
                                    <span className="text-emerald-600 font-sans font-bold">SUCCESS</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Bank:</span>
                                    <span className="font-bold text-slate-900">BOC Bank - Sri Lanka</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Beneficiary Account:</span>
                                    <span className="font-bold text-slate-900">4924086</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span>Remittance Target:</span>
                                    <span className="font-medium text-slate-700 uppercase">{planType} Plan Pack</span>
                                </div>
                                <div className="py-1.5 px-2 bg-slate-50 border border-dashed border-indigo-200 rounded text-center">
                                    <span className="text-[9px] text-indigo-600 block font-sans uppercase font-bold tracking-wide">Required Transaction Remarks Memo:</span>
                                    <span className="text-slate-800 font-semibold break-all text-xs">{userEmail || "your-account-email@domain.com"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* TRANSACTION REFERENCE INPUT */}
                            <div>
                                <label htmlFor="reference" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Transaction Reference / Journal ID <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="reference"
                                    type="text"
                                    required
                                    value={referenceId}
                                    onChange={(e) => setReferenceId(e.target.value)}
                                    placeholder="e.g. TXN-9827410924"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
                                />
                            </div>

                            {/* RECEIPT FILE UPLOAD DRAG/DROP ZONE */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Upload Completed Bank Receipt <span className="text-rose-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/10 bg-slate-50/50 rounded-xl p-6 text-center transition-all relative group cursor-pointer">
                                    <input
                                        type="file"
                                        required
                                        accept="image/*,application/pdf"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="space-y-2">
                                        <div className="text-2xl group-hover:scale-110 transition-transform duration-200">📤</div>
                                        <p className="text-xs text-slate-700 font-medium">
                                            {file ? "Replace selected document" : "Drag & drop file or click to browse layout"}
                                        </p>
                                        <p className="text-[11px] text-slate-400">Supports PDF, PNG, JPG, JPEG asset variants</p>
                                    </div>
                                </div>

                                {/* FILE SUFFIX CHIP */}
                                {file && (
                                    <div className="mt-3 flex items-center justify-between bg-emerald-50/50 border border-emerald-200 px-3 py-2 rounded-xl">
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="text-emerald-600 text-xs font-bold">✓</span>
                                            <span className="text-xs text-emerald-800 font-medium truncate">{file.name}</span>
                                        </div>
                                        <span className="text-[10px] text-emerald-600 shrink-0 font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-100">
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
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md shadow-indigo-600/10 transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin"></span>
                                    Processing Secure Handshake...
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
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading order configuration engine...</div>}>
            <SubmitPlaneForm />
        </Suspense>
    );
}