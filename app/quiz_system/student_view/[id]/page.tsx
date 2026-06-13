"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/config/api";
import {
    ChevronRight,
    ChevronLeft,
    Send,
    AlertCircle,
    CheckCircle2,
    Timer,
    Layout,
    Circle,
    FileText
} from "lucide-react";
import { getUser } from "@/app/services/authService";

interface Option {
    id: number;
    option_text: string;
    is_correct?: boolean;
}

interface Question {
    id: number;
    question_text: string;
    question_type: "mcq" | "multiple" | "short" | "essay" | "true_false";
    marks: number;
    options: Option[];
}

export default function StudentQuizView() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(1800);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<{ id: number; email: string } | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/questions/quiz/${id}`);
                setQuestions(res.data);
            } catch (err) {
                console.error("Error fetching quiz questions:", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchQuestions();
    }, [id]);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleFinalSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswerChange = (questionId: number, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    useEffect(() => {
        const u = getUser();
        if (u?.id) {
            setUser(u);
        }
    }, []);

    const handleFinalSubmit = async () => {

        if (!window.confirm("Are you sure you want to submit your assessment?")) {
            return;
        }

        setIsSubmitting(true);

        try {

            const student_id = user?.id;

            if (!student_id) {
                alert("User not loaded yet");
                return;
            }

            let totalMarks = 0;
            let obtainedMarks = 0;

            let correctAnswers = 0;
            let wrongAnswers = 0;
            let skippedAnswers = 0;

            // save answers
            for (const question of questions) {

                const answer = answers[question.id];

                // skipped
                if (
                    answer === undefined ||
                    answer === "" ||
                    (Array.isArray(answer) && answer.length === 0)
                ) {
                    skippedAnswers++;
                    continue;
                }

                let isCorrect = false;
                let marks = 0;

                // MCQ CHECK
                if (
                    question.question_type === "mcq" ||
                    question.question_type === "true_false"
                ) {

                    const correctOption = question.options.find(
                        (o: any) => o.is_correct
                    );

                    isCorrect =
                        correctOption?.option_text === answer;

                    marks = isCorrect ? question.marks : 0;
                }

                // MULTIPLE ANSWER CHECK
                if (question.question_type === "multiple") {

                    const correctOptions = question.options
                        .filter((o: any) => o.is_correct)
                        .map((o: any) => o.option_text)
                        .sort();

                    const selected = [...answer].sort();

                    isCorrect =
                        JSON.stringify(correctOptions) ===
                        JSON.stringify(selected);

                    marks = isCorrect ? question.marks : 0;
                }

                // TEXT QUESTIONS
                if (
                    question.question_type === "essay" ||
                    question.question_type === "short"
                ) {

                    isCorrect = false;
                    marks = 0;
                }

                totalMarks += question.marks;
                obtainedMarks += marks;

                if (isCorrect) {
                    correctAnswers++;
                } else {
                    wrongAnswers++;
                }

                // save answer
                await axios.post(
                    `${API_BASE_URL}/student-answers/`,
                    {
                        quiz_id: Number(id),
                        question_id: question.id,
                        student_id: student_id,

                        selected_option_id: null,

                        answer_text:
                            typeof answer === "string"
                                ? answer
                                : JSON.stringify(answer),

                        is_correct: isCorrect,

                        obtained_marks: marks
                    }
                );
            }

            // percentage
            const percentage =
                totalMarks > 0
                    ? (obtainedMarks / totalMarks) * 100
                    : 0;

            // save score
            await axios.post(
                `${API_BASE_URL}/quiz-scores/`,
                {
                    quiz_id: Number(id),

                    student_id: student_id,

                    attempt_number: 1,

                    total_marks: totalMarks,

                    obtained_marks: obtainedMarks,

                    percentage: percentage,

                    correct_answers: correctAnswers,

                    wrong_answers: wrongAnswers,

                    skipped_answers: skippedAnswers,

                    status: "completed"
                }
            );

            alert("Assessment successfully submitted.");

            router.push(`/quiz_system/score/manual${student_id}`);

        } catch (err) {

            console.error(err);

            alert("Submission failed.");

        } finally {

            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
            <p className="text-gray-900 tracking-[0.2em] text-xs font-bold uppercase">Establishing Secure Link</p>
        </div>
    );

    if (questions.length === 0) return (
        <div className="p-10 text-center text-gray-900 bg-white min-h-screen flex items-center justify-center">
            <p className="font-medium text-lg">No assessment data available for this session.</p>
        </div>
    );

    const currentQ = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
            {/* Minimalist Header */}
            <header className="bg-white border-b border-gray-100 px-8 py-4 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-gray-900 rounded-xl">
                            <Layout className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-bold text-sm tracking-tight text-gray-900 uppercase">Assessment Portal</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Live Session</span>
                            </div>
                        </div>
                    </div>

                    <div className={`flex items-center gap-4 px-6 py-2.5 rounded-2xl border-2 transition-all duration-500 ${timeLeft < 300 ? "border-red-500 bg-red-50 text-red-600 animate-pulse" : "border-gray-900 bg-white text-gray-900"
                        }`}>
                        <Timer className="w-4 h-4" />
                        <span className="font-mono font-bold text-xl tracking-tighter">{formatTime(timeLeft)}</span>
                    </div>

                    <button
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.1em] transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Processing..." : "Finish Exam"}
                    </button>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-81px)]">

                {/* Left Side: Question Content (Pure White) */}
                <div className="lg:col-span-8 p-8 md:p-16 lg:p-24 border-r border-gray-50 bg-white">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-6 mb-12">
                            <span className="px-4 py-1.5 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                {currentQ.question_type.replace('_', ' ')}
                            </span>
                            <div className="h-px flex-1 bg-gray-100" />
                            <div className="flex items-center gap-2 text-gray-400 font-mono text-xs italic">
                                <FileText className="w-3 h-3" />
                                {currentQ.marks} Marks
                            </div>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold leading-[1.3] text-gray-900 mb-16 selection:bg-gray-900 selection:text-white">
                            {currentQ.question_text}
                        </h2>

                        {/* Input Methods */}
                        <div className="space-y-4">
                            {["mcq", "true_false", "multiple"].includes(currentQ.question_type) ? (
                                <div className="grid gap-4">
                                    {(currentQ.question_type === "true_false"
                                        ? [{ id: 1, option_text: "True" }, { id: 2, option_text: "False" }]
                                        : currentQ.options
                                    ).map((option) => {
                                        const isSelected = Array.isArray(answers[currentQ.id])
                                            ? answers[currentQ.id]?.includes(option.option_text)
                                            : answers[currentQ.id] === option.option_text;

                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => {
                                                    if (currentQ.question_type === "multiple") {
                                                        const current = answers[currentQ.id] || [];
                                                        const next = current.includes(option.option_text)
                                                            ? current.filter((a: string) => a !== option.option_text)
                                                            : [...current, option.option_text];
                                                        handleAnswerChange(currentQ.id, next);
                                                    } else {
                                                        handleAnswerChange(currentQ.id, option.option_text);
                                                    }
                                                }}
                                                className={`group flex items-center justify-between p-7 rounded-3xl border-2 transition-all text-left ${isSelected
                                                    ? "border-gray-900 bg-gray-50 shadow-sm"
                                                    : "border-gray-100 hover:border-gray-200 bg-white"
                                                    }`}
                                            >
                                                <span className={`text-lg font-semibold ${isSelected ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"}`}>
                                                    {option.option_text}
                                                </span>
                                                {isSelected ? (
                                                    <CheckCircle2 className="w-6 h-6 text-gray-900 fill-white" />
                                                ) : (
                                                    <Circle className="w-6 h-6 text-gray-100" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <textarea
                                    className="w-full min-h-[350px] p-10 rounded-[40px] bg-gray-50 border-2 border-transparent focus:border-gray-900 focus:bg-white outline-none transition-all text-gray-800 text-xl leading-relaxed placeholder:text-gray-300"
                                    placeholder="Start typing your detailed response..."
                                    value={answers[currentQ.id] || ""}
                                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                />
                            )}
                        </div>

                        {/* Navigation Footer */}
                        <div className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-center">
                            <button
                                disabled={currentIndex === 0}
                                onClick={() => setCurrentIndex(prev => prev - 1)}
                                className="flex items-center gap-3 text-gray-400 hover:text-gray-900 font-bold disabled:opacity-0 transition-all uppercase text-xs tracking-widest"
                            >
                                <ChevronLeft className="w-5 h-5" /> Previous
                            </button>

                            <div className="flex items-center gap-6">
                                <span className="text-xs font-mono text-gray-300">
                                    Question {currentIndex + 1} of {questions.length}
                                </span>
                                {currentIndex < questions.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentIndex(prev => prev + 1)}
                                        className="flex items-center gap-3 bg-gray-900 text-white px-12 py-4 rounded-2xl font-black transition-all hover:bg-gray-800 uppercase text-xs tracking-widest shadow-xl shadow-gray-900/10"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleFinalSubmit}
                                        className="bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black transition-all hover:bg-emerald-700 uppercase text-xs tracking-widest"
                                    >
                                        Final Submit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Control Center (Gray-900 Background) */}
                <div className="lg:col-span-4 bg-gray-900 p-8 md:p-12 lg:sticky lg:top-[81px] lg:h-[calc(100vh-81px)] text-white overflow-y-auto">
                    <div className="mb-12">
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Progress Map</h3>
                            <span className="text-xs font-mono text-white">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-12">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIndex(idx)}
                                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all border-2 ${currentIndex === idx
                                    ? "bg-white border-white text-gray-900 scale-110 shadow-2xl shadow-white/20"
                                    : answers[q.id]
                                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                        : "bg-transparent border-white/10 text-gray-600 hover:border-white/40 hover:text-white"
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <div className="flex gap-4 mb-4">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Security Note</p>
                            </div>
                            <p className="text-xs leading-relaxed text-gray-400">
                                This session is encrypted. Navigating away from this tab will be logged. If the timer hits zero, all entries will be auto-saved and submitted.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500" />
                                <span className="text-[10px] uppercase font-bold text-gray-500">Answered</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-white" />
                                <span className="text-[10px] uppercase font-bold text-gray-500">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}