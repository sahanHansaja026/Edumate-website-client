"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { getUser } from "@/app/services/authService";
import { API_BASE_URL } from "@/app/config/api";

type ModuleItem = {
    label: string;
    href: string;
    visible: boolean;
};

type Module = {
    title: string;
    visible: boolean;
    items: ModuleItem[];
};

type User = {
    id: number;
    name?: string;
    email?: string;
};

export default function LMSModuleDashboard() {
    const [openIndex, setOpenIndex] = useState<number>(0);
    const { id } = useParams<{ id: string }>();
    const router = useRouter();



    const [checking, setChecking] = useState(true);
    const [allowed, setAllowed] = useState(false);
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const currentUser = getUser();

                if (!currentUser?.id || !id) {
                    router.push("/errors/autharization");
                    return;
                }

                const res = await axios.get(
                    `${API_BASE_URL}/channel-modules/access/${id}/${currentUser.id}`
                );

                if (!res.data.has_access) {
                    router.push("/errors/autharization");
                    return;
                }

                setAllowed(true);

            } catch (error) {
                router.push("/errors/autharization");
            } finally {
                setChecking(false);
            }
        };

        checkAccess();
    }, [id]);
    
    const modules: Module[] = [
        {
            title: "Content Delivery",
            visible: true,
            items: [
                { label: "Upload lecture notes (PDF, DOC, slides)", href: `/inside/note/${id}`, visible: true },
                { label: "Add videos (YouTube, Vimeo, uploads)", href: `/inside/video/${id}`, visible: true },
                { label: "Add audio lessons or podcasts", href: "/lms/content-delivery/audio", visible: false},
                { label: "Provide reading materials or external links", href: `/inside/note/${id}`, visible: true },
                { label: "Organize content into structured sections", href: "/lms/content-delivery/structure", visible: false }
            ]
        },
        {
            title: "Quizzes & Assessments",
            visible: true,
            items: [
                { label: "Create MCQ, true/false, short answer quizzes", href: `/quiz_system/create_quiz/${id}`, visible: true },
                { label: "Timed quizzes and exams", href: "/lms/quizzes/timed", visible: false },
                { label: "Question banks with randomization", href: "/lms/quizzes/bank", visible: false },
                { label: "Auto and manual grading", href: "/lms/quizzes/grading", visible: false },
                { label: "Attempt limitations", href: "/lms/quizzes/attempts", visible: false },
                { label: "Feedback and result review", href: "/lms/quizzes/results", visible: false }
            ]
        },
        {
            title: "Assignments",
            visible: true,
            items: [
                { label: "Create assignment tasks", href: "/lms/assignments/create", visible: false },
                { label: "File upload submissions", href: `/inside/assignment/${id}`, visible: true },
                { label: "Text-based submissions", href: "/lms/assignments/text", visible: false },
                { label: "Deadlines and late submission rules", href: "/lms/assignments/deadlines", visible: false },
                { label: "Rubric-based grading", href: "/lms/assignments/rubric", visible: false },
                { label: "Resubmission support", href: "/lms/assignments/resubmission", visible: false }
            ]
        },
        {
            title: "Live Learning",
            visible: true,
            items: [
                { label: "Live class integration", href: `/live/${id}`, visible: true },
                { label: "Attendance tracking", href: "/lms/live/attendance", visible: false },
            ]
        },
        {
            title: "Analytics",
            visible: false,
            items: [
                { label: "Student progress tracking", href: "/lms/analytics/progress", visible: true },
                { label: "Performance analytics", href: "/lms/analytics/performance", visible: true },
                { label: "Assignment reports", href: "/lms/analytics/assignments", visible: true },
                { label: "Engagement metrics", href: "/lms/analytics/engagement", visible: true }
            ]
        },
        {
            title: "Learning Flow",
            visible: false,
            items: [
                { label: "Module unlocking system", href: "/lms/learning/locking", visible: true },
                { label: "Prerequisite control", href: "/lms/learning/prerequisites", visible: true },
                { label: "Structured learning paths", href: "/lms/learning/paths", visible: true },
                { label: "Conditional access rules", href: "/lms/learning/access", visible: true }
            ]
        },
        {
            title: "Grading System",
            visible: false,
            items: [
                { label: "Centralized gradebook", href: "/lms/grading/gradebook", visible: true },
                { label: "Weighted scoring system", href: "/lms/grading/weighted", visible: true },
                { label: "GPA calculation support", href: "/lms/grading/gpa", visible: true },
                { label: "Export grades", href: "/lms/grading/export", visible: true },
                { label: "Feedback management", href: "/lms/grading/feedback", visible: true }
            ]
        },
        {
            title: "Resources",
            visible: false,
            items: [
                { label: "Central file repository", href: "/lms/resources/repository", visible: true },
                { label: "Downloadable materials", href: "/lms/resources/downloads", visible: true },
                { label: "Shared learning resources", href: "/lms/resources/shared", visible: true },
                { label: "Version control for files", href: "/lms/resources/versioning", visible: true }
            ]
        },
        {
            title: "Group Activities",
            visible: false,
            items: [
                { label: "Group assignments", href: "/lms/groups/assignments", visible: true },
                { label: "Peer review system", href: "/lms/groups/peer-review", visible: true },
                { label: "Collaborative submissions", href: "/lms/groups/collaboration", visible: true },
                { label: "Group discussions", href: "/lms/groups/discussions", visible: true }
            ]
        },
        {
            title: "Notifications",
            visible: false,
            items: [
                { label: "Deadline reminders", href: "/lms/notifications/deadlines", visible: true },
                { label: "Quiz notifications", href: "/lms/notifications/quizzes", visible: true },
                { label: "New content alerts", href: "/lms/notifications/content", visible: true },
                { label: "Feedback notifications", href: "/lms/notifications/feedback", visible: true }
            ]
        },
        {
            title: "Instructor Tools",
            visible: false,
            items: [
                { label: "Create and manage modules", href: "/lms/instructor/modules", visible: true },
                { label: "Duplicate course structures", href: "/lms/instructor/duplicate", visible: true },
                { label: "Import and export courses", href: "/lms/instructor/import-export", visible: true },
                { label: "Bulk upload content", href: "/lms/instructor/bulk-upload", visible: true },
                { label: "Publish and unpublish modules", href: "/lms/instructor/publish", visible: true }
            ]
        },
        {
            title: "Advanced Features",
            visible: false,
            items: [
                { label: "AI-assisted quiz generation", href: "/lms/advanced/ai-quiz", visible: true },
                { label: "Automated coding evaluation", href: "/lms/advanced/code-eval", visible: true },
                { label: "Plagiarism detection", href: "/lms/advanced/plagiarism", visible: true },
                { label: "Interactive coding environment", href: "/lms/advanced/coding-env", visible: true },
                { label: "Gamification system", href: "/lms/advanced/gamification", visible: true }
            ]
        }
        // باقي modules 그대로 유지 가능 (same pattern)
    ];

    return (
        <div className="min-h-screen bg-white text-black">

            {/* Header */}
            <div className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <h1 className="text-2xl font-semibold">
                        Learning Management System Module ID:{" "}
                        <span className="font-medium">{id}</span>
                    </h1>
                    <p className="text-sm text-gray-900 mt-1">
                        Manage course modules, learning content, assessments, and student activity
                    </p>
                </div>
            </div>

            {/* Layout */}
            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Sidebar */}
                <div className="md:col-span-1 space-y-2">
                    {modules.map((mod, index) => (
                        <button
                            key={index}
                            onClick={() => setOpenIndex(index)}
                            className={`w-full text-left border border-gray-900 rounded-md px-3 py-2 hover:bg-gray-100 flex justify-between items-center ${openIndex === index ? "bg-gray-100" : ""
                                }`}
                        >
                            <span>{mod.title}</span>

                            {!mod.visible && (
                                <span className="text-xs text-red-600 font-semibold">
                                    LOCKED
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Panel */}
                <div className="md:col-span-2">
                    <Card className="border border-gray-900 shadow-sm rounded-lg">
                        <CardContent className="p-6">

                            {!modules[openIndex].visible ? (
                                <div className="text-center py-10 text-gray-500">
                                    🔒 This module is locked. Complete prerequisites to unlock.
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {modules[openIndex].items.map((item, i) =>
                                        item.visible ? (
                                            <Link
                                                key={i}
                                                href={item.href}
                                                className="block border border-gray-900 rounded-md p-3 text-sm hover:bg-gray-100"
                                            >
                                                {item.label}
                                            </Link>
                                        ) : (
                                            <div
                                                key={i}
                                                className="block border border-gray-300 rounded-md p-3 text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
                                            >
                                                🔒 {item.label}
                                            </div>
                                        )
                                    )}
                                </ul>
                            )}

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}