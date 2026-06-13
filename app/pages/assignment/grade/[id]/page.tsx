"use client";

import { API_BASE_URL } from "@/app/config/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Trophy,
    User,
    Percent,
    GraduationCap,
    Clock3
} from "lucide-react";

interface StudentGrading {
    user_id: string;
    status: string;
    submitted_at: string | null;
    marks: number | null;
    percentage: number;
}

interface AssignmentData {
    full_marks: number;
    students: StudentGrading[];
}

export default function Page() {
    const params = useParams();
    const router = useRouter();
    const assignmentId = params?.id as string;

    const [data, setData] = useState<AssignmentData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        if (!assignmentId) return;

        setLoading(true);
        setError(null);

        const url = `${API_BASE_URL}/assignment_grading/${assignmentId}`;

        try {
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const result = await res.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [assignmentId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-gray-600">
                        Loading Grading Data...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-medium">
                        ❌ {error}
                    </div>
                )}

                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gray-900 rounded-2xl">
                            <GraduationCap className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Assignment Grading
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Assignment ID: {assignmentId}
                            </p>
                        </div>
                    </div>

                    {data && (
                        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                            <Trophy className="text-amber-500 w-5 h-5" />
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Full Marks</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {data.full_marks}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table Container */}
                {data && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-900 text-white">
                                    <tr className="text-left">
                                        <th className="p-5 text-sm font-semibold">Student</th>
                                        <th className="p-5 text-sm font-semibold">Status</th>
                                        <th className="p-5 text-sm font-semibold">Submitted At</th>
                                        <th className="p-5 text-sm font-semibold">Marks</th>
                                        <th className="p-5 text-sm font-semibold">Percentage</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {data.students.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-10 text-center text-gray-500">
                                                No results found
                                            </td>
                                        </tr>
                                    ) : (
                                        data.students.map((student, index) => {
                                            const isSubmitted = student.status === "Submitted";
                                            return (
                                                <tr
                                                    key={index}
                                                    onClick={() =>
                                                        router.push(`/assignment_system/score?assignment_id=${assignmentId}&student_id=${student.user_id}`)
                                                    }
                                                    className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                                                >
                                                    {/* Student Info */}
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                                                                <User className="w-5 h-5 text-gray-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">
                                                                    User #{student.user_id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="p-5">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isSubmitted
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : "bg-rose-50 text-rose-700 border border-rose-200"
                                                            }`}>
                                                            {student.status}
                                                        </span>
                                                    </td>

                                                    {/* Submitted At */}
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Clock3 className="w-4 h-4 text-gray-400" />
                                                            {student.submitted_at || "—"}
                                                        </div>
                                                    </td>

                                                    {/* Marks / Full Marks */}
                                                    <td className="p-5">
                                                        <span className="text-gray-900 text-sm font-semibold">
                                                            {student.marks ?? "—"}
                                                        </span>
                                                        <span className="text-gray-400 text-xs font-normal ml-1">
                                                            / {data.full_marks}
                                                        </span>
                                                    </td>

                                                    {/* Percentage */}
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-1.5">
                                                            <Percent className="w-4 h-4 text-gray-400" />
                                                            <span className="font-bold text-gray-900">
                                                                {student.percentage}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}