"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/app/config/api";
import { UserPlus, ArrowLeft, Mail, FileText, ShieldAlert, CheckCircle2, AlertCircle, Fingerprint, Layers, HelpCircle } from "lucide-react";

export default function AuthorizeStudentPage() {
    const params = useParams();
    const router = useRouter();
    const channel_module_id = Number(params.id);

    const [student_name, setStudentName] = useState("");
    const [student_email, setStudentEmail] = useState("");
    const [remark, setRemark] = useState("");
    const [status, setStatus] = useState("active");

    const [loading, setLoading] = useState(false);
    const [statusType, setStatusType] = useState<"success" | "error" | null>(null);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");
            setStatusType(null);

            await axios.post(`${API_BASE_URL}/authorized-students/`, {
                channel_module_id,
                student_name,
                student_email,
                remark,
                status,
            });

            setStatusType("success");
            setMessage("Student access profile provisioned successfully.");

            // Clear form
            setStudentName("");
            setStudentEmail("");
            setRemark("");
            setStatus("active");
        } catch (err: any) {
            setStatusType("error");
            setMessage(
                err?.response?.data?.detail || "Failed to authorize student context."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-200 antialiased flex flex-col lg:flex-row">

            {/* LEFT PANEL: Context Information & Audit View */}
            <div className="w-full lg:w-[40%] bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 p-8 lg:p-12 flex flex-col justify-between">
                <div className="space-y-12">
                    {/* Navigation */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider group"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        Back to Management Console
                    </button>

                    {/* Left Panel Context Branding */}
                    <div className="space-y-4">
                        <div className="inline-flex p-3 bg-gray-900 rounded-xl text-white">
                            <UserPlus className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Student Access <br />Provisioning
                        </h1>
                        <p className="text-sm text-red-500 max-w-sm leading-relaxed">
                            Authorize secure credentials and module entry allocations for incoming student enrollment targets.
                        </p>
                    </div>

                    {/* Metadata Readout */}
                    <div className="space-y-3 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                            <Fingerprint className="h-4 w-4 text-gray-400" />
                            <span>TARGET RESOURCE ID: #{channel_module_id}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                            <Layers className="h-4 w-4 text-gray-400" />
                            <span>PIPELINE: ModuleMate Acess Context</span>
                        </div>
                    </div>
                </div>

                {/* Left Panel Footnote Note (Hidden on small mobile screens for cleaner flow) */}
                <div className="hidden lg:flex items-start gap-2.5 text-xs text-gray-400 mt-8">
                    <HelpCircle className="h-4 w-4 shrink-0 text-gray-300" />
                    <p>Granting access instantly authorizes database hooks to clear the matching registration signature on student logins.</p>
                </div>
            </div>

            {/* RIGHT PANEL: Full Page Registration Input Canvas */}
            <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center max-w-2xl">
                <div className="w-full space-y-8">

                    {/* Header Context Indicator */}
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold font-mono uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            Identity Form Scope
                        </span>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">Configure Security Parameters</h2>
                    </div>

                    {/* Status Feedback Banner */}
                    {message && (
                        <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${statusType === "success"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                                : "bg-red-50 border-red-100 text-red-800"
                            }`}>
                            {statusType === "success" ? (
                                <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                            ) : (
                                <AlertCircle className="h-4 w-4 mt-0.5 text-red-600 shrink-0" />
                            )}
                            <p className="text-xs font-medium leading-relaxed">{message}</p>
                        </div>
                    )}

                    {/* Full Sized Interactive Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Entry Block: Full Legal Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Legal Student Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Alexander Wright"
                                value={student_name}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="w-full text-sm px-4 py-3 border border-gray-200 bg-white rounded-xl placeholder-gray-300 text-gray-900 font-medium focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all shadow-sm"
                                required
                            />
                        </div>

                        {/* Entry Block: Email Signature Address */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                System Routing Destination (Email)
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-gray-300 pointer-events-none" />
                                <input
                                    type="email"
                                    placeholder="student@institution.edu"
                                    value={student_email}
                                    onChange={(e) => setStudentEmail(e.target.value)}
                                    className="w-full text-sm pl-12 pr-4 py-3 border border-gray-200 bg-white rounded-xl placeholder-gray-300 text-gray-900 font-medium focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Double Row Subparameters Group */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                            {/* Operational Reference Remark (Spans 2 columns) */}
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                    Administrative Notes / Remark
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-3.5 h-4 w-4 text-gray-300 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Internal token or department notes"
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                        className="w-full text-sm pl-12 pr-4 py-3 border border-gray-200 bg-white rounded-xl placeholder-gray-300 text-gray-900 font-medium focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Dropdown Field: Security State Clearances */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                    Access Clearance
                                </label>
                                <div className="relative">
                                    <ShieldAlert className="absolute left-4 top-3.5 h-4 w-4 text-gray-300 pointer-events-none" />
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full text-sm pl-12 pr-4 py-3 border border-gray-200 bg-white rounded-xl text-gray-900 font-bold focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all appearance-none cursor-pointer shadow-sm"
                                    >
                                        <option value="active">Active</option>
                                        <option value="suspend">Suspended</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Submission Action Anchor */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 disabled:bg-gray-100 text-white disabled:text-gray-400 font-bold text-sm py-3 px-8 rounded-xl transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="h-4 w-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Grant Database Authorization"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    );
}