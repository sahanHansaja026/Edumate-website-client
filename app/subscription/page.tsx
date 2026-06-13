"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getUser } from "@/app/services/authService";
import { API_BASE_URL } from "@/app/config/api";

type Subscription = {
    plan_name: "free" | "premium" | "edu";
    video_limit: number | "unlimited";
    module_limit: number | "unlimited";
    quiz_limit: number | "unlimited";
    channel_limit: number | "unlimited";
};

function SubscriptionContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get("reason");

    const [user, setUser] = useState<{ id: number; email: string } | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const currentPlan = subscription?.plan_name ?? "free";

    useEffect(() => {
        setUser(getUser());
    }, []);

    const fetchSubscription = async (userId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/subscription/${userId}`);
            if (!res.ok) throw new Error("Failed to load subscription details");
            const data = await res.json();
            setSubscription(data);
        } catch (err) {
            console.error("Error fetching subscription:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchSubscription(user.id);
        }
    }, [user]);

    const handlePlanUpdate = async (targetPlan: "free" | "premium" | "edu") => {
        if (!user) return alert("Please log in to update your EduMate plan.");

        setIsLoading(targetPlan);

        try {
            const formData = new URLSearchParams();
            formData.append("subscription_type", targetPlan);
            formData.append("status", "active");

            const res = await fetch(`${API_BASE_URL}/subscription/update/${user.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Failed to update subscription");
            }

            await fetchSubscription(user.id);
            alert(`Welcome to your new ${targetPlan.toUpperCase()} plan on EduMate!`);

        } catch (err: any) {
            console.error("Update error:", err);
            alert(`Could not update plan: ${err.message}`);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between p-6 md:p-12 font-sans">
            <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                {/* EDUMATE HEADER */}
                <div className="bg-slate-900 text-white p-8 border-b border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400">
                                EduMate Plans & Pricing
                            </span>
                            <h1 className="text-3xl font-bold tracking-tight mt-1">
                                Choose Your Teaching & Learning Space
                            </h1>
                            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
                                Unlock powerful tools to share knowledge, create custom courses, and connect with students and teachers worldwide.
                            </p>
                        </div>

                        {/* CURRENT STATUS BADGE */}
                        <div className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-xl flex flex-col justify-center">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Current Membership</span>
                            <span className="text-lg font-semibold text-slate-100 capitalize mt-0.5">
                                {currentPlan === "edu" ? "🏫 Campus Institutional" : currentPlan === "premium" ? "🚀 Professional Teacher" : "Basic Learner (Free)"}
                            </span>
                        </div>
                    </div>

                    {/* DYNAMIC SYSTEM ALERT */}
                    {reason && (
                        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm rounded-lg flex items-center gap-2">
                            <span className="font-bold">Notice:</span>
                            <span>You reached a limit on your current basic plan ({reason}). Upgrade below to continue creating and exploring without boundaries!</span>
                        </div>
                    )}
                </div>

                <div className="p-8">
                    {/* SECTION TITLE */}
                    <div className="mb-6 pb-4 border-b border-slate-200">
                        <h2 className="text-lg font-semibold text-slate-700">Explore EduMate Plans</h2>
                        <p className="text-xs text-slate-500">Pick the tier that best matches your learning or teaching goals.</p>
                    </div>

                    {/* TIERS GRID */}
                    <div className="grid lg:grid-cols-3 gap-6 items-stretch">

                        {/* STANDARD TIER */}
                        <div className={`flex flex-col justify-between p-6 rounded-xl border transition-all ${currentPlan === "free" ? "border-slate-400 bg-slate-50/50 ring-1 ring-slate-400" : "border-slate-200 bg-white"}`}>
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Basic Learner</h3>
                                        <p className="text-xs text-slate-500 mt-1">Perfect for independent self-study</p>
                                    </div>
                                    {currentPlan === "free" && (
                                        <span className="text-xs px-2 py-1 bg-slate-200 text-slate-700 font-medium rounded">Active</span>
                                    )}
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Learning Limits</h4>
                                        <ul className="text-sm space-y-2 text-slate-600">
                                            <li className="flex items-center gap-2">▪ 1 Enrolled Course Module</li>
                                            <li className="flex items-center gap-2">▪ 1 Media Stream / Lesson Video</li>
                                            <li className="flex items-center gap-2">▪ 5 Core Learning Objects</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quizzes & Progress</h4>
                                        <ul className="text-sm space-y-2 text-slate-600">
                                            <li className="flex items-center gap-2">▪ 3 Interactive Quizzes</li>
                                            <li className="flex items-center gap-2">▪ 2 Student Assignments</li>
                                            <li className="flex items-center gap-2">▪ 1 Public Study Group / Channel</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handlePlanUpdate("free")}
                                disabled={currentPlan === "free" || isLoading !== null}
                                className={`mt-8 w-full py-2.5 text-sm font-medium rounded-lg border transition-colors ${currentPlan === "free"
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                                    }`}
                            >
                                {isLoading === "free" ? "Processing..." : currentPlan === "free" ? "Your Current Plan" : "Downgrade to Free"}
                            </button>
                        </div>

                        {/* PROFESSIONAL TIER */}
                        <div className={`flex flex-col justify-between p-6 rounded-xl border transition-all ${currentPlan === "premium" ? "border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-600" : "border-slate-200 bg-white"}`}>
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-indigo-900">Professional Teacher</h3>
                                        <p className="text-xs text-indigo-600 mt-1">For creators, tutors & independent educators</p>
                                    </div>
                                    {currentPlan === "premium" && (
                                        <span className="text-xs px-2 py-1 bg-indigo-600 text-white font-medium rounded">Active</span>
                                    )}
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Teaching Power</h4>
                                        <ul className="text-sm space-y-2 text-slate-700">
                                            <li className="flex items-center gap-2 font-medium text-slate-900">✓ Unlimited Course Modules</li>
                                            <li className="flex items-center gap-2 font-medium text-slate-900">✓ Unlimited Lesson Video Uploads</li>
                                            <li className="flex items-center gap-2 font-medium text-slate-900">✓ Unlimited Content Nodes & Resources</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Evaluation Metrics</h4>
                                        <ul className="text-sm space-y-2 text-slate-700">
                                            <li className="flex items-center gap-2">✓ Unlimited Quizzes & Question Banks</li>
                                            <li className="flex items-center gap-2">✓ Unlimited Homework & Assignments</li>
                                            <li className="flex items-center gap-2">✓ Custom Branded Teaching Channels</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handlePlanUpdate("premium")}
                                disabled={currentPlan === "premium" || isLoading !== null}
                                className={`mt-8 w-full py-2.5 text-sm font-semibold rounded-lg transition-colors ${currentPlan === "premium"
                                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                                    }`}
                            >
                                {isLoading === "premium" ? "Processing..." : currentPlan === "premium" ? "Your Current Plan" : "Upgrade to Pro Teacher"}
                            </button>
                        </div>

                        {/* EDU PRO TIER */}
                        <div className={`flex flex-col justify-between p-6 rounded-xl border transition-all ${currentPlan === "edu" ? "border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600" : "border-slate-200 bg-white"}`}>
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-emerald-900">EduMate Campus (Edu Pro)</h3>
                                        <p className="text-xs text-emerald-700 mt-1">Multi-seat licenses for schools & universities</p>
                                    </div>
                                    {currentPlan === "edu" && (
                                        <span className="text-xs px-2 py-1 bg-emerald-600 text-white font-medium rounded">Active</span>
                                    )}
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div>
                                        <h4 className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider mb-2">Campus Administration</h4>
                                        <ul className="text-sm space-y-2 text-slate-700">
                                            <li className="flex items-center gap-2 font-medium text-emerald-950">🏛 Unified School Dashboard</li>
                                            <li className="flex items-center gap-2 font-medium text-emerald-950">🏛 Smart Roles (Admins, Teachers, Students)</li>
                                            <li className="flex items-center gap-2 font-medium text-emerald-950">🏛 Bulk Course Provisioning Tools</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-emerald-600/70 uppercase tracking-wider mb-2">Academic Operations</h4>
                                        <ul className="text-sm space-y-2 text-slate-700">
                                            <li className="flex items-center gap-2">✓ School-Wide Shared Resource Catalogs</li>
                                            <li className="flex items-center gap-2">✓ Inter-departmental Collaboration Sync</li>
                                            <li className="flex items-center gap-2">✓ Detailed Cohort & Performance Analytics</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handlePlanUpdate("edu")}
                                disabled={currentPlan === "edu" || isLoading !== null}
                                className={`mt-8 w-full py-2.5 text-sm font-semibold rounded-lg transition-colors ${currentPlan === "edu"
                                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                    : "bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm"
                                    }`}
                            >
                                {isLoading === "edu" ? "Processing..." : currentPlan === "edu" ? "Your Current Plan" : "Request Campus Plan"}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* INSTITUTIONAL FOOTER */}
            <footer className="mt-8 text-center text-xs text-slate-500 max-w-xl mx-auto space-y-1">
                <p>&copy; {new Date().getFullYear()} EduMate Learning Solutions. Safe, secure, and privacy-compliant.</p>
                <p className="text-slate-400">Looking for complex custom system integrations? Contact your school network administrator.</p>
            </footer>
        </div>
    );
}

// Next.js requires useSearchParams to be wrapped in a Suspense boundary for static HTML generation builds
export default function SubscriptionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading EduMate Space...</div>}>
            <SubscriptionContent />
        </Suspense>
    );
}