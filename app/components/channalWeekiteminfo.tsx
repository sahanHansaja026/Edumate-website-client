"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "../services/authService";
import Link from "next/link";

type Content = {
    assignment_id: number;
    title: string;
    description?: string;
    week: number;
    open_date?: string;
    close_date?: string;
    type: "content";
};

type Quiz = {
    id: number;
    title: string;
    description?: string;
    week: number;
    open_date?: string;
    close_date?: string;
    type: "quiz";
};

type Video = {
    id: number;
    title: string;
    description?: string;
    week: number;
    open_date?: string;
    close_date?: string;
    type: "video";
};

type Assignment = {
    id: number;
    module_id: number;
    title: string;
    description?: string;
    week: number;
    open_date?: string;
    close_date?: string;
    type: "assignment";
};

type Module = {
    module_id: number;
    user_id: number;
    name: string;
    description?: string;
};

type Item = Content | Quiz | Video | Assignment;

type Props = {
    moduleId: string;
};

export default function WeekItemInfo({ moduleId }: Props) {
    const [items, setItems] = useState<Item[]>([]);
    const [module, setModule] = useState<Module | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [done, setDone] = useState<Record<string, boolean>>({});
    const [user, setUser] = useState<{ id: number; email: string } | null>(null);

    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);
    }, []);

    const fetchData = async () => {
        try {
            // MODULE
            const moduleRes = await fetch(`${API_BASE_URL}/channel-modules/module/${moduleId}`);

            if (!moduleRes.ok) {
                throw new Error("Failed to fetch module");
            }

            const moduleData = await moduleRes.json();
            setModule(moduleData);

            // CONTENTS
            const contentRes = await fetch(
                `${API_BASE_URL}/contents/module/${moduleId}`
            );

            let formattedContents: Content[] = [];

            if (contentRes.ok) {
                const contentData = await contentRes.json();

                formattedContents = contentData.map((item: any) => ({
                    ...item,
                    type: "content",
                }));
            }

            // QUIZZES
            let formattedQuizzes: Quiz[] = [];

            try {
                const quizRes = await fetch(
                    `${API_BASE_URL}/quizzes/module/${moduleId}`
                );

                if (quizRes.ok) {
                    const quizData = await quizRes.json();

                    formattedQuizzes = quizData.map((quiz: any) => ({
                        ...quiz,
                        type: "quiz",
                    }));
                }
            } catch (err) {
                console.log("No quizzes found");
            }

            // VIDEOS
            let formattedVideos: Video[] = [];

            try {
                const videoRes = await fetch(
                    `${API_BASE_URL}/videos/module/${moduleId}`
                );

                if (videoRes.ok) {
                    const videoData = await videoRes.json();

                    formattedVideos = videoData.map((video: any) => ({
                        ...video,
                        week: video.week ?? 1,
                        type: "video",
                    }));
                }
            } catch (err) {
                console.log("No videos found");
            }

            // ASSIGNMENTS (Fixed missing forward slash)
            let formattedAssignments: Assignment[] = [];

            try {
                const assignmentRes = await fetch(
                    `${API_BASE_URL}/assignments/module/${moduleId}`
                );

                if (assignmentRes.ok) {
                    const assignmentData = await assignmentRes.json();

                    formattedAssignments = assignmentData.map((assignment: any) => ({
                        ...assignment,
                        // If your backend schemas handle assignment_id, map it dynamically to id
                        id: assignment.id ?? assignment.assignment_id,
                        week: assignment.week ?? 1,
                        type: "assignment",
                    }));
                }
            } catch (err) {
                console.log("No assignments found");
            }

            // MERGE ALL ITEMS
            const mergedItems = [
                ...formattedContents,
                ...formattedQuizzes,
                ...formattedVideos,
                ...formattedAssignments,
            ];

            // SORT Course Videos
            mergedItems.sort((a, b) => a.week - b.week);

            setItems(mergedItems);

            // LOAD DONE STATE
            const savedDone = localStorage.getItem(
                `done_module_${moduleId}`
            );

            if (savedDone) {
                setDone(JSON.parse(savedDone));
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [moduleId]);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem(
                `done_module_${moduleId}`,
                JSON.stringify(done)
            );
        }
    }, [done, moduleId, loading]);

    // DELETE HANDLER
    const handleDelete = async (
        itemId: number,
        type: "content" | "quiz" | "video" | "assignment"
    ) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this activity?"
        );

        if (!confirmed) return;

        try {
            let endpoint = "";
            if (type === "content") {
                endpoint = `${API_BASE_URL}/contents/${itemId}`;
            } else if (type === "quiz") {
                endpoint = `${API_BASE_URL}/quizzes/${itemId}`;
            } else if (type === "video") {
                endpoint = `${API_BASE_URL}/videos/${itemId}`;
            } else if (type === "assignment") {
                endpoint = `${API_BASE_URL}/assignments/${itemId}`;
            }

            const res = await fetch(endpoint, {
                method: "DELETE",
            });

            if (res.ok) {
                setItems((prev) =>
                    prev.filter((item) => {
                        if (item.type === "content") {
                            return item.assignment_id !== itemId;
                        }
                        return item.id !== itemId;
                    })
                );
            } else {
                alert("Failed to delete item");
            }
        } catch (error) {
            console.error("Delete Error:", error);
            alert("An error occurred while deleting");
        }
    };

    const today = new Date();

    const getStatus = (item: Item) => {
        if (!item.open_date) return "locked";

        const open = new Date(item.open_date);
        const close = item.close_date
            ? new Date(item.close_date)
            : null;

        if (today < open) return "locked";

        if (close && today > close) return "closed";

        return "active";
    };

    const toggleState = (
        setter: React.Dispatch<
            React.SetStateAction<Record<string, boolean>>
        >,
        key: string
    ) => {
        setter((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const isOwner = user?.id === module?.user_id;

    const visibleItems = isOwner
        ? items
        : items.filter((item) => getStatus(item) !== "locked");

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="text-gray-400 text-sm animate-pulse">
                    Loading content...
                </div>
            ) : visibleItems.length === 0 ? (
                <div className="text-gray-400 text-sm italic border-2 border-dashed p-4 rounded-xl text-center">
                    No activities available.
                </div>
            ) : (
                <div className="space-y-6">
                    {visibleItems.map((item, index) => {
                        const status = getStatus(item);

                        const itemId =
                            item.type === "content"
                                ? item.assignment_id
                                : item.id;

                        const itemKey = `${item.type}-${itemId}-${index}`;

                        const isDone = !!done[itemKey];

                        const isExpanded = !!expanded[itemKey];

                        let detailsHref = "";
                        if (item.type === "content") {
                            detailsHref = `/activity/channal_content/${item.assignment_id}`;
                        } else if (item.type === "quiz") {
                            detailsHref = `/channal_quiz_system/create_questions/${item.id}?module_id=${moduleId}`;
                        } else if (item.type === "video") {
                            detailsHref = `/activity/channal_video/${item.id}`;
                        } else if (item.type === "assignment") {
                            detailsHref = `/activity/channal_assignment/${item.id}`;
                        }

                        let editHref = "";
                        if (item.type === "content") {
                            editHref = `/pages/channal_content/edit/${item.assignment_id}`;
                        } else if (item.type === "quiz") {
                            editHref = `/channal_quiz_system/edit_quiz/${item.id}`;
                        } else if (item.type === "video") {
                            editHref = `/pages/channal_video/edit/${item.id}`;
                        } else if (item.type === "assignment") {
                            editHref = `/channal/assinment_edit/${item.id}`;
                        }

                        let GradeHref = "";
                        if (item.type === "content") {
                            GradeHref = `/pages/content/edit/${item.assignment_id}`;
                        } else if (item.type === "quiz") {
                            GradeHref = `/channal_quiz_system/score/manual/${item.id}`;
                        } else if (item.type === "video") {
                            GradeHref = `/activity/video/analytics/${item.id}`;
                        } else if (item.type === "assignment") {
                            GradeHref = `/pages/channal_assignment/grade/${item.id}`;
                        }

                        return (
                            <div
                                key={itemKey}
                                className={`flex gap-4 p-5 border rounded-2xl transition-all ${status === "active"
                                    ? "bg-white border-gray-100 shadow-sm"
                                    : "bg-gray-50 border-transparent opacity-70"
                                    }`}
                            >
                                {/* TIMELINE */}
                                <div className="flex flex-col items-center mt-1">
                                    <div
                                        className={`w-4 h-4 rounded-full border-2 ${isDone
                                            ? "bg-green-500 border-green-200"
                                            : item.type === "quiz"
                                                ? "bg-purple-500 border-purple-200"
                                                : item.type === "video"
                                                    ? "bg-red-500 border-red-200"
                                                    : item.type === "assignment"
                                                        ? "bg-amber-500 border-amber-200"
                                                        : "bg-blue-500 border-blue-100"
                                            }`}
                                    />

                                    <div className="w-[2px] flex-1 bg-gray-100 mt-2" />
                                </div>

                                {/* CONTENT */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* LEFT */}
                                        <div>
                                            <Link href={detailsHref}>
                                                <h4
                                                    className={`text-base font-bold hover:text-blue-500 transition cursor-pointer ${isDone
                                                        ? "text-gray-400 line-through"
                                                        : "text-gray-800"
                                                        }`}
                                                >
                                                    {item.title}

                                                    {/* TYPE BADGE */}
                                                    <span
                                                        className={`ml-2 text-[10px] px-2 py-0.5 rounded uppercase font-mono ${item.type === "quiz"
                                                            ? "bg-purple-100 text-purple-700"
                                                            : item.type === "video"
                                                                ? "bg-red-100 text-red-700"
                                                                : item.type === "assignment"
                                                                    ? "bg-amber-100 text-amber-700"
                                                                    : "bg-blue-100 text-blue-700"
                                                            }`}
                                                    >
                                                        {item.type}
                                                    </span>

                                                    {/* OWNER MODE */}
                                                    {isOwner && (
                                                        <span className="ml-2 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase font-mono">
                                                            Owner ({status})
                                                        </span>
                                                    )}
                                                </h4>
                                            </Link>

                                            {status === "closed" &&
                                                !isOwner && (
                                                    <span className="text-[10px] font-bold text-red-400 uppercase">
                                                        ⛔ Access Expired
                                                    </span>
                                                )}
                                        </div>

                                        {/* RIGHT */}
                                        <div className="flex items-center gap-2">
                                            {isOwner && (
                                                <div className="flex items-center gap-2 mr-2 border-r pr-2 border-gray-200">
                                                    {/* EDIT */}
                                                    <Link
                                                        href={editHref}
                                                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                                                    >
                                                        Edit
                                                    </Link>

                                                    {/* DELETE */}
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                itemId,
                                                                item.type
                                                            )
                                                        }
                                                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                                    >
                                                        Delete
                                                    </button>

                                                    {/* GRADE */}
                                                    {item.type !== "video" && (
                                                        <Link
                                                            href={GradeHref}
                                                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-300 text-purple-500 hover:bg-yellow-200 transition-colors"
                                                        >
                                                            Grade
                                                        </Link>
                                                    )}
                                                </div>
                                            )}

                                            {/* DONE BUTTON */}
                                            <button
                                                onClick={() =>
                                                    toggleState(
                                                        setDone,
                                                        itemKey
                                                    )
                                                }
                                                disabled={
                                                    status !== "active" &&
                                                    !isOwner
                                                }
                                                className={`text-xs font-bold px-4 py-2 rounded-xl border-2 transition-all ${isDone
                                                    ? "bg-green-500 border-green-500 text-white"
                                                    : status === "active" ||
                                                        isOwner
                                                        ? "bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-500"
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                {isDone
                                                    ? "Done ✓"
                                                    : "Mark Done"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* DESCRIPTION */}
                                    {item.description && (
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                {isExpanded ||
                                                    item.description.length <= 120
                                                    ? item.description
                                                    : `${item.description.slice(
                                                        0,
                                                        120
                                                    )}...`}

                                                {item.description.length >
                                                    120 && (
                                                        <button
                                                            onClick={() =>
                                                                toggleState(
                                                                    setExpanded,
                                                                    itemKey
                                                                )
                                                            }
                                                            className="ml-2 text-blue-500 font-bold hover:underline"
                                                        >
                                                            {isExpanded
                                                                ? "Show Less"
                                                                : "Read More"}
                                                        </button>
                                                    )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}