"use client";

import React from "react";
import { BookOpen, Award, Tv, ShieldCheck, ArrowUpRight } from "lucide-react";

// 1. Setup rich structural interfaces reflecting your real schema
interface ModuleDetail {
    id: number;
    name: string;
    grade: number;
    ownerName: string;
}

interface EnrolledChannel {
    id: number;
    channelName: string;
    modules: ModuleDetail[];
}

export default function StudentStats() {
    // Mock Data mimicking your actual backend relationships
    const enrolledChannels: EnrolledChannel[] = [
        {
            id: 101,
            channelName: "AI & Intelligent Systems",
            modules: [
                { id: 1, name: "Advanced Machine Learning & Classification", grade: 88, ownerName: "Dr. Aris Thorne" },
            ],
        },
        {
            id: 102,
            channelName: "Enterprise Software Architecture",
            modules: [
                { id: 2, name: "Enterprise Microservices with FastAPI", grade: 94, ownerName: "Prof. Sarah Jenkins" },
                { id: 3, name: "Asynchronous Event Streams & Kafka", grade: 76, ownerName: "Prof. Sarah Jenkins" },
            ],
        },
    ];

    // Derived statistics calculations
    const allModules = enrolledChannels.flatMap((channel) =>
        channel.modules.map((mod) => ({ ...mod, channelName: channel.channelName }))
    );

    const totalModulesCount = allModules.length;
    const totalChannelsCount = enrolledChannels.length;

    const averageGrade = totalModulesCount > 0
        ? Math.round(allModules.reduce((acc, m) => acc + m.grade, 0) / totalModulesCount)
        : 0;

    // Helper to determine coloring based on performance tier thresholds
    const getGradeColorClass = (grade: number) => {
        if (grade >= 90) return "bg-emerald-600";
        if (grade >= 75) return "bg-gray-900";
        return "bg-amber-600";
    };

    return (
        <div className="space-y-10">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-xl p-6 bg-white flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Channels</p>
                        <p className="text-3xl font-black mt-1 text-gray-900">{totalChannelsCount}</p>
                    </div>
                    <Tv className="h-8 w-8 text-gray-300" />
                </div>

                <div className="border border-gray-200 rounded-xl p-6 bg-white flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Enrolled Modules</p>
                        <p className="text-3xl font-black mt-1 text-gray-900">{totalModulesCount}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-gray-300" />
                </div>

                <div className="border border-gray-200 rounded-xl p-6 bg-white flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cumulative GPA</p>
                        <p className="text-3xl font-black mt-1 text-gray-900">{averageGrade}%</p>
                    </div>
                    <Award className="h-8 w-8 text-gray-300" />
                </div>
            </div>

            {/* Core Breakdown Split UI Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Side: Main Module Performance Bars (Takes 2 columns) */}
                <div className="lg:col-span-2 border border-gray-200 rounded-xl p-6 bg-white">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                        <Award className="h-5 w-5 text-gray-900" />
                        <h4 className="font-bold text-gray-900">Module Grade Ledger</h4>
                    </div>

                    <div className="space-y-6">
                        {allModules.map((mod) => (
                            <div key={mod.id} className="space-y-2 group">
                                <div className="flex justify-between items-start text-xs font-medium">
                                    <div className="space-y-0.5 max-w-[80%]">
                                        <span className="text-gray-900 font-bold block truncate" title={mod.name}>
                                            {mod.name}
                                        </span>
                                        <span className="text-gray-400 text-[10px] block font-mono">
                                            Track: {mod.channelName}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-sm text-gray-900">{mod.grade}%</span>
                                    </div>
                                </div>

                                {/* Grade Progress Bar Container */}
                                <div className="w-full bg-gray-100 rounded-full h-3 relative overflow-hidden">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-700 ease-out ${getGradeColorClass(mod.grade)}`}
                                        style={{ width: `${mod.grade}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Channel Workspace Tree (Takes 1 column) */}
                <div className="border border-gray-200 rounded-xl p-6 bg-white">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                        <Tv className="h-5 w-5 text-gray-900" />
                        <h4 className="font-bold text-gray-900">Workspace Mapping</h4>
                    </div>

                    <div className="space-y-6">
                        {enrolledChannels.map((channel) => (
                            <div key={channel.id} className="border border-gray-100 bg-gray-50/50 p-4 rounded-xl space-y-3">
                                <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                                    <span className="text-xs font-black tracking-tight text-gray-900 uppercase">
                                        {channel.channelName}
                                    </span>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-gray-400" />
                                </div>

                                {/* Modules nested deep inside this channel */}
                                <div className="space-y-3">
                                    {channel.modules.map((m) => (
                                        <div key={m.id} className="text-[11px] space-y-1">
                                            <p className="text-gray-800 font-medium leading-tight">
                                                {m.name}
                                            </p>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                                                <ShieldCheck className="h-3 w-3 text-gray-400" />
                                                <span>Instructor: {m.ownerName}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}