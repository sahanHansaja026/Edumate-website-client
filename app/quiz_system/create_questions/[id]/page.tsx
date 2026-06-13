"use client";

import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

// Types
type Module = { module_id: number; user_id: number; name: string };
type Quiz = {
    id: number;
    module_id: number;
    title: string;
    description?: string;
    attempts: string;
    open_date?: string;
    close_date?: string;
    is_graded: boolean;
    shuffle_questions: boolean;
};

type AttemptInfo = {
    can_attempt: boolean;
    attempts_used: number;
    remaining_attempts: number | string;
    limit: number | string;
};

export default function QuizLMSPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const quizId = params.id as string;
    const moduleId = searchParams.get("module_id");

    const [user, setUser] = useState<{ id: number; email: string } | null>(null);
    const [module, setModule] = useState<Module | null>(null);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const router = useRouter();
    const [attemptInfo, setAttemptInfo] = useState<AttemptInfo | null>(null);

    useEffect(() => {
        setUser(getUser());
        const fetchData = async () => {
            if (!moduleId || !quizId) return;
            try {
                const [mRes, qRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/modules/${moduleId}`),
                    fetch(`${API_BASE_URL}/quizzes/${quizId}`),
                ]);
                setModule(await mRes.json());
                setQuiz(await qRes.json());
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };
        fetchData();
    }, [moduleId, quizId]);

    // Logic: Status & Ownership
    const now = new Date();
    const openDate = quiz?.open_date ? new Date(quiz.open_date) : null;
    const closeDate = quiz?.close_date ? new Date(quiz.close_date) : null;

    let status: "active" | "locked" | "closed" = "active";
    if (openDate && now < openDate) status = "locked";
    if (closeDate && now > closeDate) status = "closed";

    const isOwner = user?.id === module?.user_id;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Not Set";
        return new Date(dateStr).toLocaleString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleDeleteQuiz = async () => {
        if (!quizId) return;

        const confirmDelete = confirm("Are you sure you want to delete this quiz?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete quiz");
            }

            alert("Quiz deleted successfully");

            // redirect after delete
            window.location.href = `/modules/${moduleId}`;
        } catch (err) {
            console.error(err);
            alert("Error deleting quiz");
        }
    };

    // 3. Fetch specific student limits (Fires correctly as soon as user state hydrates)
    useEffect(() => {
        if (!quizId || !user) return;

        const fetchAttempt = async () => {
            try {
                const res = await fetch(
                    `${API_BASE_URL}/quiz-attempts/check/${quizId}/student/${user.id}`
                );

                const data = await res.json();

                console.log("🔥 ATTEMPT API RESPONSE:", data);

                setAttemptInfo(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchAttempt();
    }, [quizId, user]);

    const isAttemptAllowed =
        attemptInfo &&
        attemptInfo.can_attempt === true &&
        status === "active";

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
            {/* HEADER NAVIGATION PREVIEW */}
            <nav className="border-b border-gray-200 px-6 py-4">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <span className="text-sm font-semibold tracking-wide uppercase text-gray-500">
                        {module?.name || "Course Module"}
                    </span>
                    <div className="text-xs text-gray-400">ID: {quizId}</div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto p-6 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* MAIN CONTENT */}
                    <div className="lg:col-span-2 space-y-8">
                        <header className="space-y-4">
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                                {quiz?.title || "Loading Quiz..."}
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-prose">
                                {quiz?.description || "No description provided for this assessment."}
                            </p>
                        </header>

                        <hr className="border-gray-100" />

                        {/* INFO GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InfoTile label="Grading Type" value={quiz?.is_graded ? "Graded Assessment" : "Practice Quiz"} />
                            <InfoTile label="Shuffle Questions" value={quiz?.shuffle_questions ? "Enabled" : "Disabled"} />
                            <InfoTile label="Available From" value={formatDate(quiz?.open_date)} />
                            <InfoTile label="Due Date" value={formatDate(quiz?.close_date)} />
                        </div>
                    </div>

                    {/* SIDEBAR: ACTIONS */}
                    <div className="lg:col-span-1">
                        <div className="border border-gray-200 rounded-lg p-6 space-y-6 sticky top-8">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Status</p>
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="font-bold text-sm capitalize">{status}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {isOwner ? (
                                    /* OWNER VIEW */
                                    <><Link href={`/quiz_system/q_and_a/${quizId}`}>
                                        <button className="w-full bg-gray-900 text-white py-3 px-4 rounded font-semibold hover:bg-black transition-colors">
                                            Create Question
                                        </button>
                                    </Link>
                                        <Link href={`/quiz_system/edit_quiz/${quizId}`}>
                                            <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded font-semibold hover:bg-gray-50 transition-colors">
                                                Edit Settings
                                            </button>
                                        </Link>
                                        <button
                                            onClick={handleDeleteQuiz}
                                            className="w-full text-red-700 font-bold py-2 text-sm hover:text-red-800 hover:underline transition-colors"
                                        >
                                            Delete Quiz
                                        </button>
                                    </>
                                ) : (
                                        /* STUDENT VIEW (Fixes Link routing encapsulation bug) */
                                        isAttemptAllowed ? (
                                            <Link href={`/quiz_system/student_view/${quizId}`}>
                                                <button className="w-full py-4 px-6 rounded font-bold text-center transition-all bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200">
                                                    Start Attempt Now
                                                </button>
                                            </Link>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full py-4 px-6 rounded font-bold text-center bg-gray-100 text-gray-400 cursor-not-allowed"
                                            >
                                                {attemptInfo?.can_attempt === false
                                                    ? "Attempt Limit Reached"
                                                    : `Access ${status}`}
                                            </button>
                                        )
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 italic">
                                    Attempts Used:{" "}
                                    <span className="text-gray-900 font-semibold">
                                        {attemptInfo?.attempts_used ?? 0}
                                    </span>
                                </p>

                                <p className="text-xs text-gray-500 italic">
                                    Remaining Attempts:{" "}
                                    <span className="text-gray-900 font-semibold">
                                        {attemptInfo?.remaining_attempts ?? quiz?.attempts ?? "N/A"}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

// Reusable Formal Component Start Attempt Now
function InfoTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            <p className="text-gray-900 font-medium border-l-2 border-gray-200 pl-3">{value}</p>
        </div>
    );
}