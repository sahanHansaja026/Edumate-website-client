"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../dashboard_components/Navbar";
import StudentStats from "../dashboard_components/StudentStats";
import ModuleAnalytics from "../dashboard_components/ModuleAnalytics";
import CommentSection from "../dashboard_components/CommentSection";
import ChannelManager from "../dashboard_components/ChannelManager";
import { getUser } from "@/app/services/authService";

// Define your local User scheme
type UserProfile = {
    id: number;
    email: string;
};

export default function DashboardPage() {
    const [role, setRole] = useState<"student" | "Module owner" | "channel">("Module owner");
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

    // Consolidate into a single useEffect to handle the session resolution cleanly
    useEffect(() => {
        async function resolveSession() {
            try {
                setIsAuthenticating(true);
                const currentUser = await getUser();
                setUser(currentUser);
            } catch (err) {
                console.error("Failed to authenticate user context:", err);
            } finally {
                setIsAuthenticating(false);
            }
        }

        resolveSession();
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-200">
            <Navbar currentRole={role} onRoleChange={setRole} />

            <main className="max-w-7xl mx-auto p-6 space-y-10">
                <header>
                    <h1 className="text-4xl font-black tracking-tighter">DASHBOARD</h1>
                    <p className="text-gray-500 font-medium">
                        Managing your EduMate workspace as a{" "}
                        <span className="text-gray-900 underline underline-offset-4 capitalize">{role}</span>
                    </p>
                </header>

                {/* 1. Global Session Loader state */}
                {isAuthenticating ? (
                    <div className="text-xs font-mono text-gray-400 animate-pulse">
                        Resolving user profile credentials...
                    </div>
                ) : (
                    <>
                        {/* Dynamic Context Render Engines */}
                        {role === "student" && <StudentStats />}

                        {role === "Module owner" && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                {user?.id ? (
                                    <>
                                        <ModuleAnalytics ownerId={user.id} />

                                        <div className="border border-gray-200 rounded-xl p-6 bg-white">
                                            <h4 className="font-bold mb-6 flex items-center gap-2 italic text-gray-900">
                                                <span className="h-2 w-2 bg-gray-900 rounded-full animate-pulse" />
                                                Live AI Feedback Stream
                                            </h4>
                                            <CommentSection ownerId={user.id} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 text-xs font-mono text-gray-500">
                                        Error: No authorized owner account matched to this session profile.
                                    </div>
                                )}
                            </div>
                        )}

                        {role === "channel" && <ChannelManager />}
                    </>
                )}
            </main>
        </div>
    );
}