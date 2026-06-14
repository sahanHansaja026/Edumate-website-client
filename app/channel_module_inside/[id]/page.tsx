"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import {
    PlayCircle,
    ExternalLink,
    Calendar,
    Clock,
    Video as VideoIcon,
    ChevronLeft,
    Menu,
    BookOpen,
    FileText,
    HelpCircle,
    PenSquare,
    Settings,
    Edit3,
    Trash2,
    Users,
    X,
    MessageSquare
} from "lucide-react";

import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";
import WeekContent from "@/app/components/channalWeekContent";
import Link from "next/link";
import CommentsSection from "@/app/components/CommentsSection";

type Module = {
    module_id: number;
    user_id: number;
    channel_id?: number;
    name: string;
    description: string;
    skills?: string[];
    visibility?: string;
    cover_image?: string | null;
    cover_image_name?: string | null;
    co_host?: {
        email: string;
        firstName: string | null;
        lastName: string | null;
    } | null;
};

type Video = {
    id: number;
    module_id: number;
    title: string;
    description?: string;
    source_type: string;
    video_url?: string;
    thumbnail_url?: string;
    open_date?: string;
    close_date?: string;
    created_at?: string;
};

export default function CoursePage() {
    const params = useParams();
    const id = params?.id;

    // =========================
    // STATES
    // =========================
    const [authUser, setAuthUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [module, setModule] = useState<Module | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [activeWeek, setActiveWeek] = useState<number>(1);
    const [showMore, setShowMore] = useState(false);
    const [moduleItems, setModuleItems] = useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const [showComments, setShowComments] = useState(false); // Controls the Right Chatbot Drawer
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(true);

    // =========================
    // LOAD MODULE FROM CHANNEL ROUTE
    // =========================
    useEffect(() => {
        const fetchModule = async () => {
            try {
                const res = await fetch(
                    `${API_BASE_URL}/channel-modules/module/${id}`
                );

                if (!res.ok) {
                    throw new Error("Module not found");
                }

                const data: Module = await res.json();
                setModule(data);
            } catch (err) {
                console.error("Error fetching module:", err);
                setModule(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchModule();
        }
    }, [id]);

    // =========================
    // LOAD VIDEOS
    // =========================
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/videos/module/${id}`);
                if (!res.ok) {
                    setVideos([]);
                    return;
                }
                const data = await res.json();
                setVideos(data);
            } catch (err) {
                console.error(err);
            } finally {
                setVideoLoading(false);
            }
        };

        if (id) {
            fetchVideos();
        }
    }, [id]);

    // =========================
    // LOAD AUTH USER
    // =========================
    useEffect(() => {
        const localUser = getUser();
        setAuthUser(localUser);
    }, []);

    // =========================
    // LOAD PROFILE
    // =========================
    useEffect(() => {
        const localUser = getUser();
        const fetchUserProfile = async () => {
            if (!localUser?.email) return;
            try {
                const res = await fetch(
                    `${API_BASE_URL}/profiles/by-email?email=${localUser.email}`
                );
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const res = await fetch(
                    `${API_BASE_URL}/channel-module-access/check/${id}/${authUser?.email}`
                );

                if (!res.ok) {
                    setHasAccess(false);
                    return;
                }

                const data = await res.json();

                setHasAccess(data.access === true);
            } catch (err) {
                setHasAccess(false);
            } finally {
                setCheckingAccess(false);
            }
        };

        if (id && authUser?.email) {
            checkAccess();
        }
    }, [id, authUser]);


    // =========================
    // LOAD MODULE ITEMS
    // =========================
    useEffect(() => {
        const fetchModuleItems = async () => {
            try {
                const [contentRes, quizRes, videoRes, assignmentRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/contents/module/${id}`),
                    fetch(`${API_BASE_URL}/quizzes/module/${id}`),
                    fetch(`${API_BASE_URL}/videos/module/${id}`),
                    fetch(`${API_BASE_URL}/assignments/module/${id}`)
                ]);

                const contents = contentRes.ok
                    ? (await contentRes.json()).map((item: any) => ({
                        id: item.id || item.assignment_id,
                        title: item.title,
                        type: "content"
                    }))
                    : [];

                const quizzes = quizRes.ok
                    ? (await quizRes.json()).map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        type: "quiz"
                    }))
                    : [];

                const videosData = videoRes.ok
                    ? (await videoRes.json()).map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        type: "video"
                    }))
                    : [];

                const assignments = assignmentRes.ok
                    ? (await assignmentRes.json()).map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        type: "assignment"
                    }))
                    : [];

                setModuleItems([
                    ...videosData,
                    ...contents,
                    ...quizzes,
                    ...assignments
                ]);
            } catch (err) {
                console.error(err);
            }
        };

        if (id) {
            fetchModuleItems();
        }
    }, [id]);

    // Close dropdown on clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSettingsDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // =========================
    // ROLE & PERMISSION CHECKS
    // =========================
    const isOwner = authUser && module && (authUser.id === module.user_id || authUser.user_id === module.user_id);

    const isCoHost = authUser?.email && module?.co_host?.email &&
        authUser.email.toLowerCase() === module.co_host.email.toLowerCase();

    const hasEditPermissions = isOwner || isCoHost;
    
    const router = useRouter();
    


    // =========================
    // LOADING & ERROR STATES
    // =========================
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4">
                <p className="text-gray-500 text-sm sm:text-base">
                    Loading module layer ecosystem details...
                </p>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4">
                <p className="text-red-500 text-sm sm:text-base font-medium">
                    Module data layer configuration entry not found
                </p>
            </div>
        );
    }

    if (checkingAccess) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Checking access...
            </div>
        );
    }

    if (!hasAccess && !hasEditPermissions) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-red-500 font-semibold">
                    You are not authorized to access this module
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row lg:h-screen bg-gray-50 w-full overflow-x-hidden relative">

            {/* ================= LMS COLLAPSIBLE SIDEBAR ================= */}
            <aside
                className={`bg-white border-b lg:border-r border-gray-200 lg:h-full transition-all duration-300 ease-in-out flex flex-col z-30 w-full
                    ${isSidebarOpen ? "lg:w-80 h-auto lg:h-full" : "lg:w-20 h-auto lg:h-full"}`}
            >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70 flex-shrink-0">
                    <div className={`flex items-center gap-3 transition-opacity duration-200 ${!isSidebarOpen && "lg:opacity-0 lg:w-0 overflow-hidden"}`}>
                        <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                            <h2 className="text-sm sm:text-md font-semibold text-gray-900 truncate whitespace-nowrap">Course Content</h2>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">Select items to track</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors hidden lg:block"
                        title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 lg:hidden"
                        title="Toggle Navigation"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <div className={`p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto flex-1 max-w-full scrollbar-thin
                    ${!isSidebarOpen ? "hidden lg:flex items-center" : "flex lg:flex"}`}
                >
                    {moduleItems.map((item) => {
                        const isSelected = selectedItem?.id === item.id && selectedItem?.type === item.type;

                        return (
                            <button
                                key={`${item.type}-${item.id}`}
                                onClick={() => setSelectedItem(item)}
                                className={`text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center group relative flex-shrink-0 lg:flex-shrink w-auto lg:w-full min-w-[140px] lg:min-w-0
                                    ${isSelected
                                        ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600 pl-2 rounded-l-none"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                                title={!isSidebarOpen ? item.title : undefined}
                            >
                                <div className="flex items-center gap-3 w-full min-w-0">
                                    <div className={`text-lg flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                        ${isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}`}>
                                        {item.type === "video" && <VideoIcon className="w-4 h-4" />}
                                        {item.type === "quiz" && <HelpCircle className="w-4 h-4" />}
                                        {item.type === "content" && <FileText className="w-4 h-4" />}
                                        {item.type === "assignment" && <PenSquare className="w-4 h-4" />}
                                    </div>

                                    <span className={`truncate text-xs sm:text-sm tracking-wide transition-opacity duration-200 ${!isSidebarOpen && "lg:opacity-0 lg:w-0"}`}>
                                        {item.title}
                                    </span>
                                </div>

                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap hidden lg:block">
                                        {item.title}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* ================= MAIN CONTENT ================= */}
            <main className="flex-1 p-3 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 w-full min-w-0 lg:overflow-y-auto">

                {/* ================= MODULE HEADER ================= */}
                <div className="bg-white border rounded-lg w-full overflow-hidden">
                    <div className="border-b px-4 sm:px-6 py-4 flex items-start justify-between gap-4 relative">

                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 break-words">
                                {module.name}
                            </h1>
                        </div>

                        {/* Top Header Controls (Discussion & Settings Toggle Area) */}
                        <div className="flex items-center gap-2 self-center sm:self-start flex-shrink-0">

                            {/* Discussion Toggle Button placed on top */}
                            <button
                                onClick={() => setShowComments(!showComments)}
                                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 border shadow-sm ${showComments
                                    ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-700"
                                    }`}
                                title="Toggle Module Discussion"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-xs font-medium hidden sm:inline">Discussion</span>
                            </button>
                            {/* Grade Button */}
                            <Link href={`/modules/${id}/grades`}>
                                <button
                                    className="p-2 rounded-lg transition-colors flex items-center gap-1.5 border shadow-sm bg-white text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-700"
                                    title="View Grades"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span className="text-xs font-medium hidden sm:inline">Grades</span>
                                </button>
                            </Link>

                            {/* Privileged User Settings Dropdown Trigger */}
                            {hasEditPermissions && (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors flex items-center gap-1.5 border border-gray-200 bg-white shadow-sm"
                                        title="Administrative Actions"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span className="text-xs font-medium hidden sm:inline">Settings</span>
                                    </button>

                                    {showSettingsDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                            <Link href={`/edit/channaledit/${id}`}>
                                                <button
                                                    onClick={() => { setShowSettingsDropdown(false); }}
                                                    className="w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                                                >
                                                    <Edit3 className="w-4 h-4 text-gray-400" />
                                                    <span>Edit Module</span>
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => { setShowSettingsDropdown(false); }}
                                                className="w-full text-left px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50/50 flex items-center gap-2.5"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                                <span>Delete Module</span>
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <Link href={`/channal_modules/show_students/${id}`}>
                                            <button
                                                onClick={() => { setShowSettingsDropdown(false); }}
                                                className="w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                                            >
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span>Manage Students</span>
                                                </button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 w-full overflow-x-auto scrollbar-thin">
                        <table className="min-w-full text-xs sm:text-sm text-left table-auto">
                            <tbody>
                                <tr className="border-b">
                                    <th className="py-3 pr-4 text-gray-500 font-medium w-32 sm:w-48 whitespace-nowrap">
                                        Module ID
                                    </th>
                                    <td className="py-3 text-gray-800 break-all">
                                        {module.module_id}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <th className="py-3 pr-4 text-gray-500 font-medium whitespace-nowrap">
                                        Visibility
                                    </th>
                                    <td className="py-3 text-gray-800 capitalize">
                                        {module.visibility}
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <th className="py-3 pr-4 text-gray-500 font-medium whitespace-nowrap">
                                        Module Owner / Co-Host
                                    </th>
                                    <td className="py-3 text-gray-800 break-words">
                                        {module.co_host ? (
                                            <span className="font-medium">
                                                {module.co_host.firstName} {module.co_host.lastName} ({module.co_host.email}) [Co-Host]
                                            </span>
                                        ) : profile ? (
                                            <span>{profile.firstName} {profile.lastName} ({profile.email})</span>
                                        ) : (
                                            <span className="text-gray-400">Loading admin structure...</span>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <th className="py-3 pr-4 text-gray-500 font-medium whitespace-nowrap">
                                        Target Competencies
                                    </th>
                                    <td className="py-3 text-gray-800">
                                        <div className="flex flex-wrap gap-1">
                                            {module.skills && module.skills.length > 0 ? (
                                                module.skills.map((skill, index) => (
                                                    <span key={index} className="bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 italic">No skill tags mapped.</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ================= DESCRIPTION ================= */}
                <div className="bg-white border rounded-lg w-full overflow-hidden">
                    <div className="border-b px-4 sm:px-6 py-4">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                            Description
                        </h2>
                    </div>

                    <div className="p-4 sm:p-6">
                        <p className="text-gray-700 text-xs sm:text-sm leading-6 sm:leading-7 break-words whitespace-pre-line">
                            {module.description ? (
                                showMore
                                    ? module.description
                                    : module.description.slice(0, 250) + (module.description.length > 250 ? "..." : "")
                            ) : "No contextual details provided."}
                        </p>

                        {module.description && module.description.length > 250 && (
                            <button
                                onClick={() => setShowMore(!showMore)}
                                className="mt-4 text-xs sm:text-sm underline text-blue-600 hover:text-blue-800 block focus:outline-none"
                            >
                                {showMore ? "Show less" : "Show more"}
                            </button>
                        )}
                    </div>
                </div>

                {/* ================= VIDEOS ================= */}
                {!videoLoading && videos.length > 0 && (
                    <div className="bg-white border rounded-lg w-full overflow-hidden">
                        <div className="border-b px-4 sm:px-6 py-4 flex items-center gap-2">
                            <VideoIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                Course Videos
                            </h2>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                {videos.map((video) => (
                                    <div
                                        key={video.id}
                                        className="border rounded-xl overflow-hidden bg-white hover:shadow-lg transition flex flex-col h-full"
                                    >
                                        <div className="relative aspect-video bg-gray-100 w-full flex-shrink-0">
                                            {video.thumbnail_url ? (
                                                <img
                                                    src={video.thumbnail_url.startsWith("http") ? video.thumbnail_url : `${API_BASE_URL}/${video.thumbnail_url}`}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <VideoIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <PlayCircle className="w-10 h-10 sm:w-14 sm:h-14 text-white drop-shadow-lg" />
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-3 flex flex-col flex-1 justify-between">
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 break-words">
                                                    {video.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-500 line-clamp-3 break-words">
                                                    {video.description}
                                                </p>
                                            </div>

                                            <div className="space-y-2 text-3xs sm:text-xs text-gray-500 pt-2">
                                                {video.open_date && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                                        <span className="truncate">
                                                            Open: {video.open_date}
                                                        </span>
                                                    </div>
                                                )}

                                                {video.close_date && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                                        <span className="truncate">
                                                            Close: {video.close_date}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-2 w-full">
                                                {video.source_type === "Upload" ? (
                                                    <video
                                                        controls
                                                        className="w-full rounded-lg text-xs"
                                                    >
                                                        <source
                                                            src={`${API_BASE_URL}/${video.video_url}`}
                                                        />
                                                    </video>
                                                ) : (
                                                    <a
                                                        href={video.video_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-blue-600 hover:underline active:text-blue-800"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        <span>Watch Video</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= WEEK CONTENT ================= */}
                <div className="bg-white border rounded-lg p-4 sm:p-6 w-full overflow-hidden">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                        Weekly Content
                    </h2>

                    <div className="w-full overflow-x-auto scrollbar-thin">
                        <WeekContent
                            weeks={5}
                            itemsPerWeek={1}
                            activeWeek={activeWeek}
                            currentUserId={authUser?.id ?? authUser?.user_id}
                            currentUserEmail={authUser?.email}
                            moduleUserId={module?.user_id}
                            moduleId={module?.module_id}
                            coHostEmail={module?.co_host?.email}
                        />
                    </div>
                </div>

            </main>

            {/* ================= RIGHT CHATBOT DRAWER PANEL ================= */}
            <div
                className={`fixed top-0 right-0 h-screen bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out
                    ${showComments ? "w-full sm:w-[400px] md:w-[450px] opacity-100" : "w-0 opacity-0 pointer-events-none"}`}
            >
                {showComments && (
                    <div className="flex flex-col h-150 w-full overflow-hidden">
                        {/* Chat Panel Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                                <h3 className="font-semibold text-sm text-gray-900">
                                    Module Discussion
                                </h3>
                            </div>

                            {/* Close Chatbot Window Button */}
                            <button
                                onClick={() => setShowComments(false)}
                                className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Close panel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Chat / Comments Panel Content */}
                        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                            <CommentsSection
                                moduleId={module.module_id}
                                onClose={() => setShowComments(false)}
                            />
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}