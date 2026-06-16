"use client";

import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
    id: number;
    email: string;
};

type ScoreResponse = {
    student_id: number;
    module_id: number;
    summary: any;
    quizzes: any[];
    assignments: any[];
};

export default function Page() {
    const params = useParams();
    const moduleId = params.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [data, setData] = useState<ScoreResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setUser(getUser());
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id || !moduleId) return;

            setLoading(true);

            try {
                const res = await fetch(
                    `${API_BASE_URL}/student-score/${user.id}/${moduleId}`
                );
                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, moduleId]);

    const quizzes = data?.quizzes ?? [];
    const assignments = data?.assignments ?? [];
    const summary = data?.summary;

    return (
        <div className="p-6">

            <h1 className="text-xl font-bold mb-4">
                Module Gradebook
            </h1>

            {/* SUMMARY */}
            {summary && (
                <div className="bg-gray-100 p-4 rounded mb-6">
                    <p className="font-semibold">Overall: {summary.overall_percentage}%</p>
                    <p>Total: {summary.total_obtained} / {summary.total_marks}</p>
                </div>
            )}

            {/* TABLE */}
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm">

                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 border">Type</th>
                            <th className="p-2 border">Title</th>
                            <th className="p-2 border">Marks</th>
                            <th className="p-2 border">Obtained</th>
                            <th className="p-2 border">Percentage</th>
                            <th className="p-2 border">Status / Feedback</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* QUIZZES */}
                        {quizzes.map((q, i) => (
                            <tr key={`quiz-${i}`} className="text-center">
                                <td className="border p-2">Quiz</td>
                                <td className="border p-2">
                                    {q.title || `Quiz #${q.quiz_id}`}
                                </td>
                                <td className="border p-2">{q.total_marks}</td>
                                <td className="border p-2">{q.obtained_marks}</td>
                                <td className="border p-2">{q.percentage}%</td>
                                <td className="border p-2">{q.status}</td>
                            </tr>
                        ))}

                        {/* ASSIGNMENTS */}
                        {assignments.map((a, i) => (
                            <tr key={`assign-${i}`} className="text-center">
                                <td className="border p-2">Assignment</td>
                                <td className="border p-2">
                                    {a.title || `Assignment #${a.assignment_id}`}
                                </td>
                                <td className="border p-2">{a.full_marks}</td>
                                <td className="border p-2">{a.marks}</td>
                                <td className="border p-2">
                                    {a.full_marks
                                        ? Math.round((a.marks / a.full_marks) * 100)
                                        : 0}
                                    %
                                </td>
                                <td className="border p-2">
                                    {a.feedback || "No feedback"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* EMPTY STATE */}
            {!loading && quizzes.length === 0 && assignments.length === 0 && (
                <p className="text-gray-500 mt-4">
                    No records found for this module.
                </p>
            )}
        </div>
    );
}