"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";

export default function CreateQuizForm() {
    const params = useParams();
    const id = params.id as string;
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [attempts, setAttempts] = useState("unlimited");
    const [openDate, setOpenDate] = useState("");
    const [closeDate, setCloseDate] = useState("");
    const [isGraded, setIsGraded] = useState(true);
    const [shuffleQuestions, setShuffleQuestions] = useState(false);
    const router = useRouter();

    const [user, setUser] = useState<{ id: number; email: string } | null>(null);
    const [quota, setQuota] = useState<any>(null);
    
    // load user
    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);
    }, []);

    useEffect(() => {
        const loadQuota = async () => {
            if (!user) return;

            try {
                const res = await fetch(`${API_BASE_URL}/quota/quiz/${user.id}`);
                const data = await res.json();
                setQuota(data);
            } catch (err) {
                console.error(err);
            }
        };

        loadQuota();
    }, [user]);

    const handleSubmit = async () => {
        try {

            if (!user) {
                alert("User not found");
                return;
            }

            // 🔥 CHECK QUIZ QUOTA BEFORE CREATE
            const res = await fetch(`${API_BASE_URL}/quota/quiz/${user.id}`);
            const quotaData = await res.json();

            if (!quotaData.can_create) {
                router.push("/subscription?reason=quiz_limit");
                return;
            }

            if (openDate && closeDate && openDate > closeDate) {
                alert("Close date must be after open date");
                return;
            }

            const formData = new FormData();

            formData.append("module_id", id);
            formData.append("title", title);
            formData.append("description", description || "");
            formData.append("attempts", attempts);
            formData.append("open_date", openDate || "");
            formData.append("close_date", closeDate || "");
            formData.append("is_graded", String(isGraded));
            formData.append("shuffle_questions", String(shuffleQuestions));

            await axios.post(`${API_BASE_URL}/quizzes/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Quiz created successfully!");

            // reset
            setTitle("");
            setDescription("");
            setAttempts("unlimited");
            setOpenDate("");
            setCloseDate("");
            setIsGraded(true);
            setShuffleQuestions(false);

        } catch (err) {
            console.error(err);
            alert("Error creating quiz");
        }
    };

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 space-y-5">

                <h3 className="text-lg font-semibold">
                    Create New Quiz
                </h3>
                <h1>module_id :  {id}</h1>
                {/* TITLE */}
                <input
                    type="text"
                    placeholder="Quiz Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                />

                {/* DESCRIPTION */}
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                />

                {/* ATTEMPTS */}
                <div>
                    <label className="text-sm">Attempt Count</label>
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
                        onClick={() => {
                            setTitle("");
                            setDescription("");
                            setAttempts("unlimited");
                            setOpenDate("");
                            setCloseDate("");
                            setIsGraded(true);
                            setShuffleQuestions(false);
                        }}
                    >
                        Cancel
                    </Button>

                    <Button onClick={handleSubmit}>
                        Save Quiz
                    </Button>

                </div>

            </CardContent>
        </Card>
    );
}