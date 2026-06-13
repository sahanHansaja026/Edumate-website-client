"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";

type Quiz = {
    id: number;
    title: string;
    description?: string;
    attempts: string;
    open_date?: string;
    close_date?: string;
    is_graded: boolean;
    shuffle_questions: boolean;
    module_id: number;
};

export default function EditQuizForm() {

    const params = useParams();
    const quizId = params.id as string;

    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [attempts, setAttempts] = useState("unlimited");
    const [openDate, setOpenDate] = useState("");
    const [closeDate, setCloseDate] = useState("");
    const [isGraded, setIsGraded] = useState(true);
    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const [moduleId, setModuleId] = useState<number | null>(null);
    const [user, setUser] = useState<any>(null);
    const [checkingAccess, setCheckingAccess] = useState(true);
    const [access, setAccess] = useState<boolean | null>(null);
    const router = useRouter();


    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);
    }, []);
    // ===============================
    // FETCH QUIZ (GET SINGLE QUIZ)
    // ===============================
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}`);

                if (!res.ok) {
                    throw new Error("Failed to fetch quiz");
                }

                const data: Quiz = await res.json();

                setTitle(data.title);
                setDescription(data.description || "");
                setAttempts(data.attempts || "unlimited");
                setIsGraded(data.is_graded);
                setShuffleQuestions(data.shuffle_questions);
                setModuleId(data.module_id);

                // FIX datetime format for input
                setOpenDate(data.open_date ? data.open_date.slice(0, 16) : "");
                setCloseDate(data.close_date ? data.close_date.slice(0, 16) : "");

            } catch (err) {
                console.error(err);
                alert("Failed to load quiz");
            } finally {
                setLoading(false);
            }
        };

        if (quizId) fetchQuiz();
    }, [quizId]);

    // ===============================
    // UPDATE QUIZ (PUT ROUTE)
    // ===============================
    const handleUpdate = async () => {
        try {

            if (openDate && closeDate && openDate > closeDate) {
                alert("Close date must be after open date");
                return;
            }

            const formData = new FormData();

            formData.append("title", title);
            formData.append("description", description || "");
            formData.append("attempts", attempts);

            // IMPORTANT: FastAPI expects datetime or null
            if (openDate) formData.append("open_date", openDate);
            if (closeDate) formData.append("close_date", closeDate);

            formData.append("is_graded", String(isGraded));
            formData.append("shuffle_questions", String(shuffleQuestions));

            const res = await axios.put(
                `${API_BASE_URL}/quizzes/${quizId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (res.status === 200) {
                alert("Quiz updated successfully!");
            }

        } catch (err) {
            console.error(err);
            alert("Error updating quiz");
        }
    };
    useEffect(() => {
        if (!user?.id || !quizId) return;

        const checkAccess = async () => {
            try {
                setCheckingAccess(true);

                const res = await axios.get(
                    `${API_BASE_URL}/access-control/quiz/${quizId}/user/${user.id}`
                );

                setAccess(res.data.access);
            } catch (err) {
                setAccess(false);
            } finally {
                setCheckingAccess(false);
            }
        };

        checkAccess();
    }, [user?.id, quizId]);

    useEffect(() => {
        if (access === false) {
            router.push("/errors/autharization");
        }
    }, [access, router]);

    // ===============================
    // LOADING STATE
    // ===============================
    if (checkingAccess) {
        return (
            <div className="p-6 text-center">
                Checking access...
            </div>
        );
    }

    if (loading) {
        return <p className="p-6">Loading quiz...</p>;
    }

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 space-y-5">

                <h3 className="text-lg font-semibold">
                    Edit Quiz
                </h3>

                <p className="text-sm text-gray-500">
                    Quiz ID: {quizId} | Module ID: {moduleId}
                </p>

                {/* TITLE */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Quiz Title"
                />

                {/* DESCRIPTION */}
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Description"
                />

                {/* ATTEMPTS */}
                <div>
                    <label className="text-sm">Attempts</label>
                    <select
                        value={attempts}
                        onChange={(e) => setAttempts(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    >
                        <option value="unlimited">Unlimited</option>
                        <option value="1">1 Attempt</option>
                        <option value="2">2 Attempts</option>
                        <option value="3">3 Attempts</option>
                    </select>
                </div>

                {/* DATES */}
                <div className="grid md:grid-cols-2 gap-4">

                    <div>
                        <label className="text-sm">Open Date</label>
                        <input
                            type="datetime-local"
                            value={openDate}
                            onChange={(e) => setOpenDate(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="text-sm">Close Date</label>
                        <input
                            type="datetime-local"
                            value={closeDate}
                            onChange={(e) => setCloseDate(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                </div>

                {/* OPTIONS */}
                <div className="space-y-2">

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={isGraded}
                            onChange={() => setIsGraded(!isGraded)}
                        />
                        Graded Quiz
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={shuffleQuestions}
                            onChange={() => setShuffleQuestions(!shuffleQuestions)}
                        />
                        Shuffle Questions
                    </label>

                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3">

                    <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                    >
                        Reset
                    </Button>

                    <Button onClick={handleUpdate}>
                        Update Quiz
                    </Button>

                </div>

            </CardContent>
        </Card>
    );
}