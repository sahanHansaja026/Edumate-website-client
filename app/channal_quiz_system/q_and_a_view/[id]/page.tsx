"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/app/config/api";
import { useParams, useRouter } from "next/navigation";
import {
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Eye,
    BarChart3,
    CheckCircle2,
    AlertCircle,
    Sigma,
    ArrowLeft,
    Loader2,
    Save,
    X,
    FileText,
    ListChecks
} from "lucide-react";
import { getUser } from "@/app/services/authService";
import Link from "next/link";

// --- TYPES ---
interface Option {
    id: string | number;
    option_text: string;
    is_correct: boolean;
}

interface Question {
    id: string | number;
    question_number: number;

    question_type:
    | "mcq"
    | "multiple"
    | "essay"
    | "short"
    | "short_answer"
    | "true_false";

    question_text: string;
    options?: Option[];
    correct_answer?: string;
    marks: number | string;
    difficulty: string;
}

export default function QuizPreview() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.id as string;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // --- EDITING STATE ---
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Question | null>(null);
    const [user, setUser] = useState<any>(null);
    const [checking, setChecking] = useState(true);
    const [access, setAccess] = useState<boolean | null>(null);

    // =========================
    // FETCH QUESTIONS
    // =========================

    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${API_BASE_URL}/questions/quiz/${quizId}`
            );

            const data = res.data || [];

            setQuestions(data);

            if (data.length > 0) {
                setEditData(JSON.parse(JSON.stringify(data[0])));
            }
        } catch (err) {
            console.error("Error fetching questions:", err);
        } finally {
            setLoading(false);
        }
    }, [quizId]);

    useEffect(() => {
        if (quizId) fetchQuestions();
    }, [quizId, fetchQuestions]);

    // =========================
    // SYNC QUESTION
    // =========================

    useEffect(() => {
        if (questions[currentIndex]) {
            setEditData(
                JSON.parse(JSON.stringify(questions[currentIndex]))
            );

            setIsEditing(false);
        }
    }, [currentIndex, questions]);

    // =========================
    // SAVE
    // =========================

    const handleSave = async () => {
        if (!editData) return;

        try {
            setActionLoading(true);

            await axios.put(
                `${API_BASE_URL}/questions/${editData.id}`,
                editData
            );

            const updatedQuestions = [...questions];
            updatedQuestions[currentIndex] = editData;

            setQuestions(updatedQuestions);

            setIsEditing(false);

            alert("Changes saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save changes");
        } finally {
            setActionLoading(false);
        }
    };

    // =========================
    // DELETE
    // =========================

    const handleDelete = async () => {
        const currentQ = questions[currentIndex];

        if (!currentQ) return;

        if (
            !confirm(
                `Delete Question ${currentQ.question_number}?`
            )
        )
            return;

        try {
            setActionLoading(true);

            await axios.delete(
                `${API_BASE_URL}/questions/${currentQ.id}`
            );

            const updated = questions.filter(
                (q) => q.id !== currentQ.id
            );

            setQuestions(updated);

            if (
                currentIndex >= updated.length &&
                updated.length > 0
            ) {
                setCurrentIndex(updated.length - 1);
            }
        } catch (err) {
            alert("Delete failed");
        } finally {
            setActionLoading(false);
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
                    `${API_BASE_URL}/access-control/channel-module/quiz/${quizId}/user/${user.id}`
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
            <div className="flex flex-col items-center justify-center h-screen text-red-600">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p>You are not allowed to edit this quiz.</p>

                <Link href="/dashboard" className="mt-4 underline">
                    Go back
                </Link>
            </div>
        );
    }
    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-white">
                <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />

                <p className="text-slate-500 font-medium tracking-wide">
                    Loading Assessment...
                </p>
            </div>
        );
    }

    // =========================
    // EMPTY
    // =========================

    if (!editData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />

                <h3 className="text-xl font-bold text-slate-900">
                    No Questions Found
                </h3>

                <button
                    onClick={() => router.back()}
                    className="mt-6 flex items-center gap-2 hover:underline text-slate-600"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                </button>
            </div>
        );
    }

    // =========================
    // QUESTION TYPES
    // =========================

    const isMCQ =
        editData.question_type === "mcq" ||
        editData.question_type === "multiple";

    // =========================
    // RENDER
    // =========================

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans antialiased">

            {/* =========================
                TOPBAR
            ========================= */}

            <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm px-8 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">

                    {/* NAVIGATION */}
                    <div className="flex items-center gap-6 overflow-x-auto pb-2 sm:pb-0">
                        <div className="flex flex-col min-w-max">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                                Navigator
                            </span>

                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mt-1">
                                {questions.map((q, idx) => (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-9 h-9 rounded-md text-sm font-bold transition-all ${currentIndex === idx
                                            ? "bg-slate-900 text-white shadow-md scale-105"
                                            : "text-slate-500 hover:bg-white hover:text-slate-900"
                                            }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2">

                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}

                                    Save
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-all active:scale-95 text-slate-700"
                                >
                                    <Pencil className="w-4 h-4 text-slate-500" />
                                    Edit Inline
                                </button>

                                <button
                                    onClick={handleDelete}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 border border-red-100 bg-red-50 hover:bg-red-100 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="max-w-7xl mx-auto py-10 px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LEFT */}
                <div className="lg:col-span-8 space-y-6">

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                        {/* HEADER */}
                        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-start">

                            <div>
                                <div className="flex items-center gap-2 mb-2">

                                    <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                                        Question {editData.question_number}
                                    </span>

                                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                                        • {editData.question_type.replace("_", " ")}
                                    </span>
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {isEditing ? "Modify Content" : "Preview"}
                                </h1>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl">
                                {isMCQ ? (
                                    <ListChecks className="w-6 h-6 text-slate-400" />
                                ) : (
                                    <FileText className="w-6 h-6 text-slate-400" />
                                )}
                            </div>
                        </div>

                        {/* BODY */}
                        <div className="px-10 py-10">

                            {/* QUESTION */}
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                                Question Prompt
                            </label>

                            {isEditing ? (
                                <textarea
                                    className="w-full text-lg p-6 rounded-2xl border-2 border-blue-500 focus:outline-none mb-8 bg-blue-50/10 text-slate-800"
                                    value={editData.question_text}
                                    rows={3}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            question_text: e.target.value
                                        })
                                    }
                                />
                            ) : (
                                <div className="text-lg leading-relaxed text-slate-700 font-medium bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-8">
                                    {editData.question_text}
                                </div>
                            )}

                            {/* ANSWERS */}
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4">
                                {isMCQ
                                    ? "Options & Correct Answer"
                                    : "Reference / Model Answer"}
                            </label>

                            <div className="space-y-3">

                                {/* MCQ */}
                                {isMCQ && editData.options ? (

                                    editData.options.map((opt, i) => (

                                        <div
                                            key={opt.id || i}
                                            className={`p-5 rounded-xl border-2 flex items-center justify-between transition-all ${opt.is_correct
                                                ? "border-emerald-500 bg-emerald-50/30"
                                                : "border-slate-100 bg-white"
                                                }`}
                                        >

                                            <div className="flex items-center gap-4 flex-1">

                                                <div
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${opt.is_correct
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-slate-100 text-slate-500"
                                                        }`}
                                                >
                                                    {String.fromCharCode(65 + i)}
                                                </div>

                                                {isEditing ? (
                                                    <input
                                                        className="flex-1 bg-transparent border-b border-slate-300 focus:border-blue-500 outline-none py-1 text-slate-700 font-medium"
                                                        value={opt.option_text}
                                                        onChange={(e) => {

                                                            const newOptions = [
                                                                ...(editData.options || [])
                                                            ];

                                                            newOptions[i].option_text =
                                                                e.target.value;

                                                            setEditData({
                                                                ...editData,
                                                                options: newOptions
                                                            });
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        className={`text-base ${opt.is_correct
                                                            ? "font-bold text-emerald-900"
                                                            : "font-medium text-slate-700"
                                                            }`}
                                                    >
                                                        {opt.option_text}
                                                    </span>
                                                )}
                                            </div>

                                            {isEditing ? (
                                                <input
                                                    type={
                                                        editData.question_type ===
                                                            "multiple"
                                                            ? "checkbox"
                                                            : "radio"
                                                    }
                                                    checked={opt.is_correct}
                                                    name="correct-opt"
                                                    className="w-5 h-5 accent-emerald-600 cursor-pointer"
                                                    onChange={() => {

                                                        let newOptions;

                                                        if (
                                                            editData.question_type ===
                                                            "multiple"
                                                        ) {
                                                            newOptions = (
                                                                editData.options || []
                                                            ).map((o, idx) =>
                                                                idx === i
                                                                    ? {
                                                                        ...o,
                                                                        is_correct:
                                                                            !o.is_correct
                                                                    }
                                                                    : o
                                                            );
                                                        } else {
                                                            newOptions = (
                                                                editData.options || []
                                                            ).map((o, idx) => ({
                                                                ...o,
                                                                is_correct:
                                                                    idx === i
                                                            }));
                                                        }

                                                        setEditData({
                                                            ...editData,
                                                            options: newOptions
                                                        });
                                                    }}
                                                />
                                            ) : (
                                                opt.is_correct && (
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                )
                                            )}
                                        </div>
                                    ))

                                ) : (

                                    /* NON MCQ */
                                    isEditing ? (

                                        <textarea
                                            className="w-full p-5 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none bg-white text-slate-700 italic"
                                            rows={
                                                editData.question_type === "essay"
                                                    ? 8
                                                    : 3
                                            }
                                            placeholder="Enter the correct or model answer here..."
                                            value={
                                                editData.options?.[0]
                                                    ?.option_text ||
                                                editData.correct_answer ||
                                                ""
                                            }
                                            onChange={(e) => {

                                                setEditData({
                                                    ...editData,

                                                    correct_answer:
                                                        e.target.value,

                                                    options: [
                                                        {
                                                            id: 1,
                                                            option_text:
                                                                e.target.value,
                                                            is_correct: true
                                                        }
                                                    ]
                                                });
                                            }}
                                        />

                                    ) : (

                                        <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-600 italic leading-relaxed">

                                            {
                                                editData.options?.find(
                                                    (opt) => opt.is_correct
                                                )?.option_text ||

                                                editData.correct_answer ||

                                                "No model answer provided for this question."
                                            }

                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* NAVIGATION */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">

                        <button
                            disabled={currentIndex === 0}
                            onClick={() =>
                                setCurrentIndex((p) => p - 1)
                            }
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Previous
                        </button>

                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {currentIndex + 1} / {questions.length}
                        </div>

                        <button
                            disabled={
                                currentIndex === questions.length - 1
                            }
                            onClick={() =>
                                setCurrentIndex((p) => p + 1)
                            }
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-all"
                        >
                            Next
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* SIDEBAR */}
                <aside className="lg:col-span-4 space-y-6">

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm sticky top-24">

                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Assessment Data
                        </h4>

                        <div className="space-y-6">

                            {/* MARKS */}
                            <div className="flex items-center justify-between">

                                <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                    <Sigma className="w-4 h-4" />
                                    Marks
                                </span>

                                {isEditing ? (
                                    <input
                                        type="number"
                                        className="w-20 border-b-2 border-slate-200 focus:border-blue-500 outline-none text-right font-bold text-sm"
                                        value={editData.marks}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                marks: e.target.value
                                            })
                                        }
                                    />
                                ) : (
                                    <span className="text-sm font-bold uppercase">
                                        {editData.marks} Marks
                                    </span>
                                )}
                            </div>

                            {/* DIFFICULTY */}
                            <div className="flex items-center justify-between">

                                <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Difficulty
                                </span>

                                {isEditing ? (
                                    <select
                                        className="text-sm font-bold border-none bg-slate-50 rounded px-2 py-1 outline-none"
                                        value={editData.difficulty || "Medium"}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                difficulty: e.target.value
                                            })
                                        }
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                ) : (
                                    <span className="text-[10px] font-black uppercase bg-amber-50 text-amber-700 px-2 py-1 rounded">
                                        {editData.difficulty || "Medium"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* PREVIEW BUTTON */}
                        <div className="mt-8 pt-8 border-t border-slate-100">

                            <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]">
                                <Eye className="w-4 h-4" />
                                Student Live Preview
                            </button>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}