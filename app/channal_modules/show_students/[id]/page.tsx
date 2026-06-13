"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/app/config/api";
import {
    Users, ArrowLeft, Search, Filter, RefreshCw, UserPlus,
    Edit3, Trash2, ShieldCheck, ShieldAlert, Calendar, Mail, FileText
} from "lucide-react";

interface Student {
    id: number;
    channel_module_id: number;
    student_name: string;
    student_email: string;
    admission_date: string;
    status: string;
    remark?: string;
}

export default function AuthorizedStudentsPage() {
    const params = useParams();
    const router = useRouter();
    const channel_module_id = Number(params.id);

    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get(
                `${API_BASE_URL}/authorized-students/module/${channel_module_id}`
            );
            setStudents(res.data);
        } catch (err: any) {
            setError("Failed to synchronize authorized student metrics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (channel_module_id) {
            fetchStudents();
        }
    }, [channel_module_id]);

    const handleEdit = (accessId: number) => {
        router.push(`/channal_modules/edit_students/${accessId}`);
    };

    const handleDelete = async (studentId: number) => {
        if (!confirm("Are you sure you want to revoke this student access?")) return;

        try {
            await axios.delete(
                `${API_BASE_URL}/authorized-students/${studentId}`
            );

            // remove from UI instantly (no refetch needed)
            setStudents((prev) => prev.filter((s) => s.id !== studentId));

        } catch (err) {
            alert("Failed to delete student");
        }
    };

    const filteredStudents = students.filter((student) => {
        const matchesSearch =
            student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.student_email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || student.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-200 antialiased">

            {/* Global Breadcrumb Navigation */}
            <div className="max-w-7xl mx-auto px-6 pt-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider group"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    Back to Dashboard
                </button>
            </div>

            <main className="max-w-7xl mx-auto p-6 space-y-8">

                {/* Section Branding Header with Control Group */}
                <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5 text-gray-900">
                            <Users className="h-6 w-6 text-gray-900" />
                            <h1 className="text-2xl font-black tracking-tighter uppercase">Authorized Student Registry</h1>
                        </div>
                        <p className="text-xs font-mono text-gray-400">
                            Live Node Engine Scope: Module #{channel_module_id}
                        </p>
                    </div>

                    {/* Header Action Button Group */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={fetchStudents}
                            disabled={loading}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 hover:border-gray-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all bg-white text-gray-700 hover:text-gray-900 active:scale-[0.98] disabled:opacity-50 h-10"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                            Sync Data
                        </button>

                        {/* New Primary Navigation Button: Add Students */}
                        <button
                            onClick={() => router.push(`/channal_modules/add_students/${channel_module_id}`)} // Adjust path to target your form layout file
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-white active:scale-[0.98] shadow-sm h-10"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add Student
                        </button>
                    </div>
                </header>

                {/* Filter & Multi-Search Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Filter by name or system routing email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-xs pl-11 pr-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 text-gray-900 font-medium focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all bg-gray-50/30"
                        />
                    </div>

                    <div className="relative w-full md:w-56 shrink-0">
                        <Filter className="absolute left-4 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full text-xs pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all bg-gray-50/30 appearance-none cursor-pointer"
                        >
                            <option value="all">All Clearance Tags</option>
                            <option value="active">Active</option>
                            <option value="suspend">Suspended</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 text-xs font-mono text-gray-400 animate-pulse">
                        Querying student array records from FastAPI data matrix...
                    </div>
                ) : error ? (
                    <div className="p-4 border border-red-100 bg-red-50 text-red-800 rounded-xl text-xs font-medium">
                        {error}
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-xs font-medium text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
                        No active matching student access signatures mapped to current filter filters.
                    </div>
                ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/70 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                        <th className="px-6 py-4">Student Profile Context</th>
                                        <th className="px-6 py-4">System Routing Address</th>
                                        <th className="px-6 py-4">Clearance Tag</th>
                                        <th className="px-6 py-4">Administrative Remark</th>
                                        <th className="px-6 py-4">Admission Date</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">

                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {student.student_name}
                                            </td>

                                            <td className="px-6 py-4 text-gray-500 font-mono">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5 text-gray-300" />
                                                    {student.student_email}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                {student.status.toLowerCase() === "active" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <ShieldCheck className="h-3 w-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-700 border border-red-100">
                                                        <ShieldAlert className="h-3 w-3" />
                                                        Suspended
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-gray-400 italic">
                                                {student.remark ? (
                                                    <div className="flex items-center gap-1.5 text-gray-600 not-italic">
                                                        <FileText className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                                                        <span className="truncate max-w-[180px]" title={student.remark}>
                                                            {student.remark}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    "---"
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-gray-400 font-mono text-[11px]">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-300" />
                                                    {new Date(student.admission_date).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(student.id)}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
                                                        title="Edit Access Settings"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(student.id)}
                                                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Revoke Clearances"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}