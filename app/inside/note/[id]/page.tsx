"use client";

import { useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/app/config/api";

export default function AddContentForm() {
    const params = useParams();

    // ✅ Safe moduleId handling
    const moduleId = Array.isArray(params?.id)
        ? params?.id[0]
        : params?.id;

    // ✅ FIXED TYPES
    const [title, setTitle] = useState("");
    const [week, setWeek] = useState<number>(1);
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null); // ✅ FIX HERE
    const [externalUrl, setExternalUrl] = useState("");
    const [openDate, setOpenDate] = useState("");
    const [closeDate, setCloseDate] = useState("");
    const [allowDownload, setAllowDownload] = useState(true);

    // ✅ SUBMIT
    const handleSubmit = async () => {
        try {
            if (!moduleId) {
                alert("Module ID not found");
                return;
            }

            const formData = new FormData();

            // IMPORTANT: FormData only accepts string or Blob
            formData.append("module_id", String(moduleId));
            formData.append("title", title);
            formData.append("week", String(week));
            formData.append("description", description || "");
            formData.append("external_url", externalUrl || "");
            formData.append("open_date", openDate || "");
            formData.append("close_date", closeDate || "");
            formData.append("allow_download", String(allowDownload));

            if (file) {
                formData.append("file", file);
            }

            await axios.post(`${API_BASE_URL}/contents/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Content saved successfully!");

            // reset form
            setTitle("");
            setWeek(1);
            setDescription("");
            setFile(null);
            setExternalUrl("");
            setOpenDate("");
            setCloseDate("");
            setAllowDownload(true);

        } catch (error) {
            console.error(error);
            alert("Error saving content");
        }
    };

    return (
        <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 space-y-5">

                <h3 className="text-lg font-semibold">
                    Add New Content
                </h3>

                {/* MODULE ID */}
                <p className="text-sm text-gray-500">
                    Module ID: {moduleId}
                </p>

                {/* TITLE */}
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                />

                {/* WEEK */}
                <div>
                    <label className="text-sm">Week</label>
                    <select
                        value={week}
                        onChange={(e) => setWeek(Number(e.target.value))}
                        className="w-full border rounded-lg px-3 py-2"
                    >
                        {Array.from({ length: 20 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                Week {i + 1}
                            </option>
                        ))}
                    </select>
                </div>

                {/* DESCRIPTION */}
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                />

                {/* FILE UPLOAD / URL */}
                <div className="space-y-3">

                    <div className="border-2 border-dashed rounded-xl p-5 text-center">
                        <input
                            type="file"
                            onChange={(e) =>
                                setFile(e.target.files?.[0] || null)
                            }
                        />
                    </div>

                    <input
                        type="text"
                        placeholder="External URL (YouTube, article, etc.)"
                        value={externalUrl}
                        onChange={(e) => setExternalUrl(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                    />
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

                </div>

                {/* ALLOW DOWNLOAD */}
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={allowDownload}
                        onChange={() => setAllowDownload(!allowDownload)}
                    />
                    Allow students to download this content
                </label>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3">

                    <Button
                        variant="outline"
                        onClick={() => {
                            setTitle("");
                            setWeek(1);
                            setDescription("");
                            setFile(null);
                            setExternalUrl("");
                            setOpenDate("");
                            setCloseDate("");
                            setAllowDownload(true);
                        }}
                    >
                        Cancel
                    </Button>

                    <Button onClick={handleSubmit}>
                        Save Content
                    </Button>

                </div>

            </CardContent>
        </Card>
    );
}