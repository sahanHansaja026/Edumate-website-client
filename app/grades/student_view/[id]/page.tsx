"use client";

import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
    id: number;
    email: string;
};

type Grade = {
    quiz_id: number;
    quiz_title: string;

    obtained_marks: number;
    total_marks: number;
    percentage: number;

    attempt_number: number;
    status: string;
};

export default function Page() {
    const params = useParams();
    const id = params.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchGrades = async () => {
            try {
                setLoading(true);

                const res = await fetch(
                    `${API_BASE_URL}/grades/user/${user.id}/module/${id}`
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch grades");
                }

                const data = await res.json();
                setGrades(data.results || []);
            } catch (error) {
                console.error(error);
                setGrades([]);
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, [user, id]);

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">
                Module ID: {id} - Grade Dashboard
            </h1>

            {loading ? (
                <p>Loading...</p>
            ) : grades.length === 0 ? (
                <p>No grades found</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Quiz Name</th>
                                <th className="border p-2">Score</th>
                                <th className="border p-2">Percentage</th>
                            </tr>
                        </thead>

                                <tbody>
                                    {grades.map((g) => (
                                        <tr key={g.quiz_id} className="text-center">
                                            <td className="border p-2">{g.quiz_title}</td>

                                            <td className="border p-2">{g.total_marks}</td>

                                            <td className="border p-2">
                                                {g.percentage ? `${g.percentage}%` : "-"}
                                            </td>

                                            <td className="border p-2">{g.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}