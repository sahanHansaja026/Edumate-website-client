"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/config/api";
import {
    UserCheck,
    ArrowLeft,
    Mail,
    FileText,
    ShieldAlert,
    CheckCircle2,
    AlertCircle,
    Fingerprint,
    Layers,
    HelpCircle,
    User,
    Calendar
} from "lucide-react";

export default function EditStudentPage() {
    const params = useParams();
    const router = useRouter();
    const accessId = Number(params.id);

    // Core lifecycle tracking
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusType, setStatusType] = useState<"success" | "error" | null>(null);
    const [message, setMessage] = useState("");

    // Editable operational parameters
    const [status, setStatus] = useState("active");
    const [remark, setRemark] = useState("");

    // Read-only reference context
    const [student, setStudent] = useState<any>(null);

    // Pull database record on initial lifecycle paint
    useEffect(() => {
        const fetchStudent = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    `${API_BASE_URL}/authorized-students/${accessId}`
                );

                setStudent(res.data);
                setStatus(res.data.status);
                setRemark(res.data.remark || "");
            } catch (err: any) {
                setStatusType("error");
                setMessage("Failed to retrieve matching student authorization state record.");
            } finally {
                setLoading(false);
            }
        };

        if (accessId) fetchStudent();
    }, [accessId]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage("");
            setStatusType(null);

            await axios.put(
                `${API_BASE_URL}/authorized-students/${accessId}`,
                {
                    status,
                    remark,
                }
            );

            setStatusType("success");
            setMessage("Student parameter configuration updated successfully.");

            // Brief timeout allowing user to observe success feedback banner
            setTimeout(() => {
                router.back();
            }, 1200);
        } catch (err: any) {
            setStatusType("error");
            setMessage(
                err?.response?.data?.detail || "Failed to commit security context modifications."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
                <div className="h-8 w-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                <p className="text-xs font-mono tracking-widest text-gray-400 uppercase">Synchronizing context...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-200 antialiased flex flex-col lg:flex-row">

            {/* LEFT PANEL: Immutable Identity Scope Context & Records */}
            <div className="w-full lg:w-[40%] bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 p-8 lg:p-12 flex flex-col justify-between">
                <div className="space-y-12">
                    {/* Navigation Handle */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider group"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        Back to Management Console
                    </button>

                    {/* Branding Module */}
                    <div className="space-y-4">
                        <div className="inline-flex p-3 bg-gray-900 rounded-xl text-white">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase">
                            Modify Student <br />Access Context
                        </h1>
                        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                            Alter runtime permissions, update systemic remarks, or suspend routing states for existing module authorization entries.
                        </p>
                    </div>

                    {/* System Reference Metadata Blocks */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                            <Fingerprint className="h-4 w-4 text-gray-400" />
                            <span>ACCESS ENTRY INDEX: #{accessId}</span>
                        </div>
                        {student && (
                            <>
                                <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                                    <Layers className="h-4 w-4 text-gray-400" />
                                    <span>TARGET MODULE ID: #{student.channel_module_id}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span>PROVISIONED: {new Date(student.admission_date).toLocaleString()}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Inline Footnote Descriptor */}
                <div className="hidden lg:flex items-start gap-2.5 text-xs text-gray-400 mt-8">
                    <HelpCircle className="h-4 w-4 shrink-0 text-gray-300" />
                    <p>Modified state boundaries override dynamic gateway queries instantly across validation pipelines.</p>
                </div>
            </div>

            {/* RIGHT PANEL: Form Parameter Canvas */}
            <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center max-w-2xl">
                <div className="w-full space-y-8">

                    {/* Segment Header Indicators */}
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold font-mono uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            Mutation Scope
                        </span>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">Reconfigure Parameters</h2>
                    </div>

                    {/* Operational Feedback Banners */}
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

                    {/* Interactive Mutator Engine Form */}
                    <form onSubmit={handleUpdate} className="space-y-6">

                        {/* Read-Only Parameter: Identity Target Name */}
                        <div className="space-y-2 opacity-75">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                <User className="h-3 w-3" /> Legal Target Identity Name (Read Only)
                            </label>
                            <input
                                type="text"
                                value={student?.student_name || ""}
                                readOnly
                                className="w-full text-sm px-4 py-3 border border-gray-200 bg-gray-50/50 rounded-xl text-gray-500 font-medium select-none cursor-not-allowed outline-none"
                            />
                        </div>

                        {/* Read-Only Parameter: Routing Email Signature */}
                        <div className="space-y-2 opacity-75">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Mail className="h-3 w-3" /> Routing Endpoint Target (Read Only)
                            </label>
                            <input
                                type="email"
                                value={student?.student_email || ""}
                                readOnly
                                className="w-full text-sm px-4 py-3 border border-gray-200 bg-gray-50/50 rounded-xl text-gray-500 font-medium select-none cursor-not-allowed outline-none"
                            />
                        </div>

                        {/* Split Param Group for Editable Data fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                            {/* Mutatable Variable: Administrative Remark (Spans 2 blocks) */}
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                    Administrative Notes / Remark
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-3.5 h-4 w-4 text-gray-300 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Internal token notes"
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                        className="w-full text-sm pl-12 pr-4 py-3 border border-gray-200 bg-white rounded-xl placeholder-gray-300 text-gray-900 font-medium focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Mutatable Variable: Access State Dropdown */}
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

                        {/* Submission Engine Commit Trigger */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 disabled:bg-gray-100 text-white disabled:text-gray-400 font-bold text-sm py-3 px-8 rounded-xl transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <span className="h-4 w-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Commit Configuration Updates"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    );
}