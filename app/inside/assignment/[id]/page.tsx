"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";

export default function CreateAssignmentForm() {
    const params = useParams();
    const router = useRouter();

    // ✅ Safe moduleId handling matching your reference UI
    const moduleId = Array.isArray(params?.id)
        ? params?.id[0]
        : params?.id;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [openDate, setOpenDate] = useState("");
    const [closeDate, setCloseDate] = useState("");
    const [allowDownload, setAllowDownload] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [fullMarks, setFullMarks] = useState<number | "">("");
    const [user, setUser] = useState<{ id: number; email: string } | null>(null);
    const [quota, setQuota] = useState<any>(null);

    // ======================
    // LOAD USER
    // ======================
    useEffect(() => {
        setUser(getUser());
    }, []);

    // ======================
    // LOAD QUOTA (LIKE QUIZ)
    // ======================
    useEffect(() => {
        const loadQuota = async () => {
            if (!user) return;

            try {
                const res = await fetch(
                    `${API_BASE_URL}/quota/assignment/${user.id}`
                );
                const data = await res.json();
                setQuota(data);
            } catch (err) {
                console.error(err);
            }
        };

        loadQuota();
    }, [user]);

    // ======================
    // SUBMIT (QUIZ STYLE)
    // ======================
    const handleSubmit = async () => {
        try {
            if (!user) {
                alert("User not found");
                return;
            }

            // 🔥 CHECK QUOTA BEFORE CREATE (SAME STYLE AS QUIZ)
            const res = await fetch(
                `${API_BASE_URL}/quota/assignment/${user.id}`
            );
            const quotaData = await res.json();

            if (!quotaData.can_create) {
                router.push("/subscription?reason=assignment_limit");
                return;
            }

            // date validation
            if (openDate && closeDate && openDate > closeDate) {
                alert("Close date must be after open date");
                return;
            }

            const formData = new FormData();

            formData.append("module_id", String(moduleId));
            formData.append("title", title);
            formData.append("description", description || "");
            formData.append("allow_download", String(allowDownload));
            formData.append("full_marks", String(fullMarks));

            if (openDate) formData.append("open_date", openDate);
            if (closeDate) formData.append("close_date", closeDate);
            if (file) formData.append("file", file);

            await axios.post(`${API_BASE_URL}/assignments/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Assignment created successfully!");

            // reset
            handleReset();

        } catch (err) {
            console.error(err);
            alert("Error creating assignment");
        }
    };

    const handleReset = () => {
        setTitle("");
        setDescription("");
        setOpenDate("");
        setCloseDate("");
        setAllowDownload(true);
        setFile(null);
    };

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 space-y-5">

                <h3 className="text-lg font-semibold">
                    Create Assignment
                </h3>

                {/* MODULE ID */}
                <p className="text-sm text-gray-500">
                    Module ID: {moduleId}
                </p>

                {/* TITLE */}
                <input
                    type="text"
                    placeholder="Assignment Title"
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

                {/* FILE UPLOAD */}
                <div className="space-y-3">
                    <div className="border-2 border-dashed rounded-xl p-5 text-center">
                        <input
                            type="file"
                            onChange={(e) =>
                                setFile(e.target.files?.[0] || null)
                            }
                        />
                    </div>
                </div>

                {/* DATES */}
                <div className="grid md:grid-cols-2 gap-4">

                    <div>
                        <label className="text-sm">Open Date</label>
                        <input
                            type="date"
                            value={openDate}
                            onChange={(e) => setOpenDate(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="text-sm">Close Date</label>
                        <input
                            type="date"
                            value={closeDate}
                            onChange={(e) => setCloseDate(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>
                    {/* FULL MARKS */}
                    <div>
                        <label className="text-sm">Full Marks</label>
                        <input
                            type="number"
                            placeholder="e.g. 100"
                            value={fullMarks}
                            onChange={(e) =>
                                setFullMarks(
                                    e.target.value === "" ? "" : Number(e.target.value)
                                )
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>
                </div>

                {/* ALLOW DOWNLOAD */}
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={allowDownload}
                        onChange={() => setAllowDownload(!allowDownload)}
                    />
                    Allow students to download this assignment
                </label>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3">

                    <Button
                        variant="outline"
                        onClick={handleReset}
                    >
                        Cancel
                    </Button>

                    <Button onClick={handleSubmit}>
                        Save Assignment
                    </Button>

                </div>

            </CardContent>
        </Card>
    );
}