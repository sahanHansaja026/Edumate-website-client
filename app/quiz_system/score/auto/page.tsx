'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react'; // Added Suspense import
import {
    Save,
    ArrowLeft,
    Award,
    BookOpen,
    User,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { API_BASE_URL } from '@/app/config/api';
import Link from 'next/link';
import { getUser } from '@/app/services/authService';
import axios from 'axios';

interface GradeItem {
    question_id: number;
    question_text: string;
    question_marks: number;
    student_answer: string | null;
    obtained_score: number;
}

// 1. Core Logic Sub-Component
function ManualGradingContent() {
    const searchParams = useSearchParams();

    const quizId = searchParams.get('quiz_id');
    const studentId = searchParams.get('student_id');
    const router = useRouter();
    const [data, setData] = useState<GradeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState<Record<number, number>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [user, setUser] = useState<any>(null);
    const [checking, setChecking] = useState(true);
    const [access, setAccess] = useState<boolean | null>(null);

    useEffect(() => {
        if (!quizId || !studentId) return;

        const fetchData = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8000/manual-grading/quiz/${quizId}/student/${studentId}`
                );
                const json = await res.json();
                setData(json);

                // Initialize internal scores state with current database scores
                const initialScores: Record<number, number> = {};
                json.forEach((item: GradeItem) => {
                    initialScores[item.question_id] = item.obtained_score;
                });
                setScores(initialScores);
            } catch (error) {
                console.error("Failed to fetch grading data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [quizId, studentId]);

    // Track if any local changes differ from original loaded data
    const isDirty = data.some(item => scores[item.question_id] !== item.obtained_score);

    const handleSaveAll = async () => {
        setIsSaving(true);
        setSaveStatus(null);

        try {
            // Send requests concurrently for modified scores
            const updatePromises = data
                .filter(item => scores[item.question_id] !== item.obtained_score)
                .map(item =>
                    fetch(`${API_BASE_URL}/manual-grading/update-score`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            quiz_id: quizId,
                            student_id: studentId,
                            question_id: item.question_id,
                            score: scores[item.question_id],
                        }),
                    })
                );

            await Promise.all(updatePromises);

            // Update base data state to match newly saved scores
            setData(prev => prev.map(item => ({
                ...item,
                obtained_score: scores[item.question_id] ?? item.obtained_score
            })));

            setSaveStatus({ type: 'success', message: 'All grades updated successfully.' });
        } catch (error) {
            setSaveStatus({ type: 'error', message: 'Failed to save updates. Please try again.' });
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

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

    useEffect(() => {
        if (access === false) {
            router.push("/errors/autharization");
        }
    }, [access, router]);

    if (checking) {
        return (
            <div className="flex items-center justify-center h-screen">
                Checking access...
            </div>
        );
    }

    if (access === false) {
        return (
            <div className="flex items-center justify-center h-screen">
                Redirecting...
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium">Loading grading sheet...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-24 bg-slate-50 min-h-screen">
            {/* Header Canvas */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <Link
                            href={`/quiz_system/score/manual/${quizId}`}
                            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition mb-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Submissions
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Manual Assessment Panel
                        </h1>
                    </div>
                </div>

                {/* Status Alert Notifications */}
                {saveStatus && (
                    <div className={`mt-4 p-3 rounded-lg border flex items-center gap-2.5 text-sm font-medium ${saveStatus.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                        {saveStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {saveStatus.message}
                    </div>
                )}
            </div>

            {/* Grading Content */}
            <div className="p-6 space-y-6">
                {data.map((item, index) => {
                    const isChanged = scores[item.question_id] !== item.obtained_score;

                    return (
                        <div
                            key={item.question_id}
                            className={`bg-white rounded-xl shadow-sm border transition duration-200 ${isChanged ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
                                }`}
                        >
                            {/* Question Header Card */}
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-4 rounded-t-xl">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Question {index + 1}
                                    </span>
                                    <p className="font-semibold text-slate-800 text-base leading-relaxed">
                                        {item.question_text}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md text-xs font-bold">
                                        <Award className="w-3.5 h-3.5" />
                                        Max: {item.question_marks} Pts
                                    </span>
                                    {isChanged && (
                                        <div className="text-[11px] font-medium text-amber-600 mt-1.5 flex items-center justify-end gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Unsaved changes
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Response Section */}
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Student Submission
                                    </h4>
                                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-150 text-slate-700 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                        {item.student_answer || (
                                            <span className="text-slate-400 italic">No response submitted.</span>
                                        )}
                                    </div>
                                </div>

                                {/* Scoring Node */}
                                <div className="pt-2 flex items-center gap-3">
                                    <div className="space-y-1">
                                        <label htmlFor={`score-${item.question_id}`} className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Assign Score
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative rounded-md shadow-sm">
                                                <input
                                                    id={`score-${item.question_id}`}
                                                    type="number"
                                                    min={0}
                                                    max={item.question_marks}
                                                    step="0.5"
                                                    value={scores[item.question_id] ?? ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                                                        setScores({
                                                            ...scores,
                                                            [item.question_id]: Math.min(val, item.question_marks),
                                                        });
                                                    }}
                                                    className="block w-24 rounded-lg border-slate-300 pr-2 pl-3 py-2 text-slate-900 font-semibold focus:border-blue-500 focus:ring-blue-500 sm:text-sm border shadow-inner"
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-slate-400">
                                                / {item.question_marks} available points
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Global Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 shadow-lg z-20 flex justify-end items-center">
                <div className="max-w-5xl w-full mx-auto flex items-center justify-between gap-4">
                    <p className="text-xs text-slate-500 hidden md:block">
                        {isDirty ? "Review unsaved points updates accented in gold fields before persisting." : "All evaluations match current records."}
                    </p>
                    <button
                        onClick={handleSaveAll}
                        disabled={!isDirty || isSaving}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow transition-all ${isDirty && !isSaving
                            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer hover:shadow-md'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving Grades...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save All Evaluation Grades
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// 2. High-Level Secure Export Boundary Wrapper
export default function ManualGradingPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-slate-500 bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium">Mounting automated grading layout elements...</p>
            </div>
        }>
            <ManualGradingContent />
        </Suspense>
    );
}