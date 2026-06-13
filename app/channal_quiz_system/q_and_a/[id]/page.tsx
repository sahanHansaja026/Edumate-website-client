"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { API_BASE_URL } from "@/app/config/api";
import {
    Plus,
    Trash2,
    Settings2,
    Eye,
    Type,
    ListOrdered,
    CheckSquare,
    AlignLeft,
    CheckCircle2,
    Sigma,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getUser } from "@/app/services/authService";

type QuestionType = "mcq" | "multiple" | "short" | "essay" | "true_false";

interface Option {
    text: string;
    correct: boolean;
}

export default function QuizBuilder() {
    const params = useParams();
    const id = params.id as string;

    // Core State
    const [questionType, setQuestionType] = useState<QuestionType>("mcq");
    const [question, setQuestion] = useState("");
    const [marks, setMarks] = useState(1);
    const [answerText, setAnswerText] = useState(""); // For Short Answer & Essay
    const [options, setOptions] = useState<Option[]>([
        { text: "", correct: false },
        { text: "", correct: false },
    ]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [checking, setChecking] = useState(true);
    const [access, setAccess] = useState<boolean | null>(null);

    const addOption = () => {
        setOptions([...options, { text: "", correct: false }]);
    };

    const removeOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);
    }, []);
    
    const updateOption = (index: number, field: keyof Option, value: string | boolean) => {
        const updated = options.map((opt, i) => {
            if (i !== index) {
                if (field === "correct" && questionType === "mcq" && value === true) {
                    return { ...opt, correct: false };
                }
                return opt;
            }
            return { ...opt, [field]: value };
        });
        setOptions(updated);
    };

    const handleSaveQuestion = async () => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            // Logic to determine what 'options' to send based on type
            let finalOptions: any[] = [];

            if (questionType === "mcq" || questionType === "multiple") {
                finalOptions = options.map((opt) => ({
                    option_text: opt.text,
                    is_correct: opt.correct,
                }));
            } else if (questionType === "short" || questionType === "essay" || questionType === "true_false") {
                // For non-MCQ, we send the answerText as the "correct" option
                finalOptions = [{
                    option_text: answerText,
                    is_correct: true
                }];
            }

            const payload = {
                quiz_id: Number(id),
                question_number: 1,
                question_type: questionType,
                question_text: question,
                marks: Number(marks),
                explanation: "",
                difficulty: "medium",
                is_required: true,
                allow_negative_marking: false,
                negative_marks: 0,
                options: finalOptions
            };

            await axios.post(`${API_BASE_URL}/questions/`, payload);

            setSuccess("Question created successfully");

            // Reset Form
            setQuestion("");
            setAnswerText("");
            setOptions([
                { text: "", correct: false },
                { text: "", correct: false },
            ]);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to create question");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.id) return;

        const checkAccess = async () => {
            try {
                setChecking(true);

                const res = await axios.get(
                    `${API_BASE_URL}/access-control/channel-module/quiz/${id}/user/${user.id}`
                );
                setAccess(res.data.access);
            } catch (err) {
                setAccess(false);
            } finally {
                setChecking(false);
            }
        };

        checkAccess();
    }, [user, id]);

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
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
            <header className="border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                        <Sigma className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Assessment Module</h2>
                        <h1 className="text-xl font-bold">Advanced Quiz Editor (ID: {id})</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {success && <span className="text-green-600 text-sm font-medium">✓ {success}</span>}
                    {error && <span className="text-red-600 text-sm font-medium">{error}</span>}
                    <Link
                        href={`/channal_quiz_system/q_and_a_view/${id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <Eye className="w-4 h-4" /> Preview
                    </Link>
                    <button
                        onClick={handleSaveQuestion}
                        disabled={loading}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Question"}
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto py-12 px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {/* Question Input Area */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-sm font-bold uppercase tracking-tight text-slate-500">Question Content</label>
                            <span className="text-xs text-slate-400 font-mono">LaTeX Supported</span>
                        </div>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="e.g. Solve for x: \frac{x^2 - 4}{x - 2} = 4"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 min-h-[180px] focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all text-lg leading-relaxed border-dashed"
                        />
                    </section>

                    {/* Dynamic Answer Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <ListOrdered className="w-5 h-5" /> Response Configuration
                            </h3>
                            {(questionType === "mcq" || questionType === "multiple") && (
                                <button
                                    onClick={addOption}
                                    className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:underline"
                                >
                                    <Plus className="w-4 h-4" /> Add Choice
                                </button>
                            )}
                        </div>

                        {/* MCQ / Multiple Select */}
                        {(questionType === "mcq" || questionType === "multiple") && (
                            <div className="space-y-3">
                                {options.map((option, index) => (
                                    <div key={index} className="group flex items-center gap-4">
                                        <div className="flex-1 flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-2 focus-within:border-slate-900 transition-all shadow-sm">
                                            <div className="pl-3">
                                                <input
                                                    type={questionType === "mcq" ? "radio" : "checkbox"}
                                                    name="correct-answer"
                                                    checked={option.correct}
                                                    onChange={(e) => updateOption(index, "correct", e.target.checked)}
                                                    className="w-5 h-5 accent-slate-900 cursor-pointer"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => updateOption(index, "text", e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                className="w-full p-2 outline-none text-slate-800 bg-transparent"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeOption(index)}
                                            className="p-3 text-slate-300 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Short Answer */}
                        {questionType === "short" && (
                            <input
                                type="text"
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                placeholder="Enter the correct answer key..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-slate-900 outline-none"
                            />
                        )}

                        {/* Essay */}
                        {questionType === "essay" && (
                            <textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                placeholder="Describe marking criteria or keywords expected..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[150px] focus:ring-2 focus:ring-slate-900 outline-none"
                            />
                        )}

                        {/* True/False */}
                        {questionType === "true_false" && (
                            <div className="flex gap-4">
                                {["True", "False"].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setAnswerText(val)}
                                        className={`flex-1 py-4 border-2 rounded-xl font-bold transition-all ${answerText === val
                                                ? "bg-slate-900 text-white border-slate-900"
                                                : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                                            }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <aside className="space-y-6">
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-6">
                        <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-200 pb-4">
                            <Settings2 className="w-4 h-4" /> Properties
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Question Type</label>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { id: "mcq", label: "Multiple Choice", icon: CheckCircle2 },
                                    { id: "multiple", label: "Multiple Select", icon: CheckSquare },
                                    { id: "short", label: "Short Answer", icon: Type },
                                    { id: "essay", label: "Long Essay", icon: AlignLeft },
                                    { id: "true_false", label: "True / False", icon: CheckCircle2 },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => {
                                            setQuestionType(type.id as QuestionType);
                                            setAnswerText(""); // Clear text answer when switching types
                                        }}
                                        className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${questionType === type.id
                                                ? "bg-slate-900 text-white shadow-md"
                                                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
                                            }`}
                                    >
                                        <type.icon className="w-4 h-4" />
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Grading Weight</label>
                            <div className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-lg">
                                <input
                                    type="number"
                                    value={marks}
                                    onChange={(e) => setMarks(Number(e.target.value))}
                                    className="w-full bg-transparent outline-none font-bold text-center"
                                />
                                <span className="text-xs font-bold text-slate-400 pr-2">POINTS</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}