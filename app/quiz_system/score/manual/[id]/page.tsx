"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/app/config/api";
import {  useRouter } from "next/navigation";

import {
    Trophy,
    User,
    Percent,
    CheckCircle2,
    XCircle,
    Clock3
} from "lucide-react";
import { getUser } from "@/app/services/authService";
import Link from "next/link";

interface QuizScore {
    id: number;
    quiz_id: number;
    student_id: number;
    attempt_number: number;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    correct_answers: number;
    wrong_answers: number;
    skipped_answers: number;
    status: string;
    started_at: string;
    submitted_at: string;
}

export default function QuizResultsPage() {

    const params = useParams();
    const quizId = params.id as string;
    const router = useRouter();
    const [scores, setScores] = useState<QuizScore[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [checking, setChecking] = useState(true);
    const [access, setAccess] = useState<boolean | null>(null);


    useEffect(() => {

        const fetchScores = async () => {

            try {

                const res = await axios.get(
                    `${API_BASE_URL}/quiz-scores/quiz/${quizId}`
                );

                setScores(res.data);

            } catch (err) {

                console.error(err);

            } finally {

                setLoading(false);
            }
        };

        if (quizId) {
            fetchScores();
        }

    }, [quizId]);
    
        useEffect(() => {
            const currentUser = getUser();
            setUser(currentUser);
        }, []);
    
    useEffect(() => {
        if (!user?.id) return;

        const checkAccess = async () => {
            try {
                setChecking(true);

                const res = await axios.get(
                    `${API_BASE_URL}/access-control/quiz/${quizId}/user/${user.id}`
                );

                setAccess(res.data.access);
            } catch (err) {
                setAccess(false);
            } finally {
                setChecking(false);
            }
        };

        checkAccess();
    }, [user?.id, quizId]);

    if (checking) {
        return (
            <div className="flex items-center justify-center h-screen">
                Checking access...
            </div>
        );
    }

    if (access === false) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-red-600">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p>You are not allowed to edit this quiz.</p>

                <Link href="/dashboard" className="mt-4 underline">
                    Go back
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-gray-600">
                        Loading Results...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex items-center gap-4">

                    <div className="p-4 bg-gray-900 rounded-2xl">
                        <Trophy className="text-white w-7 h-7" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Quiz Results
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Quiz ID: {quizId}
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-900 text-white">

                                <tr className="text-left">

                                    <th className="p-5 text-sm font-semibold">
                                        Student
                                    </th>

                                    <th className="p-5 text-sm font-semibold">
                                        Score
                                    </th>

                                    <th className="p-5 text-sm font-semibold">
                                        Percentage
                                    </th>

                                   

                                    <th className="p-5 text-sm font-semibold">
                                        Attempt
                                    </th>

                                    <th className="p-5 text-sm font-semibold">
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {scores.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan={7}
                                            className="p-10 text-center text-gray-500"
                                        >
                                            No results found
                                        </td>

                                    </tr>

                                ) : (

                                    scores.map((score) => (

                                        <tr
                                            key={score.id}
                                            onClick={() =>
                                                router.push(`/quiz_system/score/auto?quiz_id=${score.quiz_id}&student_id=${score.student_id}`)
                                            }
                                            className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                                        >

                                            {/* Student */}
                                            <td className="p-5">

                                                <div className="flex items-center gap-3">

                                                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-white" />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            Student #{score.student_id}
                                                        </p>

                                                        <p className="text-xs text-gray-400">
                                                            ID: {score.student_id}
                                                        </p>
                                                    </div>

                                                </div>

                                            </td>

                                            {/* Score */}
                                            <td className="p-5">



                                                    <span className="text-gray-900 text-sm font-medium">
                                                         {score.total_marks}
                                                    </span>


                                            </td>

                                            {/* Percentage */}
                                            <td className="p-5">

                                                <div className="flex items-center gap-2">

                                                    <Percent className="w-4 h-4 text-gray-500" />

                                                    <span className="font-semibold text-gray-900">
                                                        {score.percentage.toFixed(1)}%
                                                    </span>

                                                </div>

                                            </td>

                                            {/* Correct */}
                                            

                                            {/* Attempt */}
                                            <td className="p-5">

                                                <div className="flex items-center gap-2 text-gray-600">

                                                    <Clock3 className="w-4 h-4" />

                                                    Attempt {score.attempt_number}

                                                </div>

                                            </td>

                                            {/* Status */}
                                            <td className="p-5">

                                                <span className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                                                    {score.status}
                                                </span>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    );
}