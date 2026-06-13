"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/app/config/api";

interface ModuleAnalyticsProps {
    ownerId: number;
}

interface ModuleStat {
    module_id: number;
    module_name: string;
    student_count: number;
}

export default function ModuleAnalytics({
    ownerId,
}: ModuleAnalyticsProps) {
    const [stats, setStats] = useState<ModuleStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(
                    `${API_BASE_URL}/enrollment-analytics/teacher/${ownerId}`
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch analytics");
                }

                const data = await res.json();

                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (ownerId) {
            fetchAnalytics();
        }
    }, [ownerId]);

    if (loading) {
        return (
            <section className="border border-gray-200 rounded-xl p-6 bg-white">
                <p className="text-sm text-gray-500">Loading analytics...</p>
            </section>
        );
    }

    const maxCount =
        stats.length > 0
            ? Math.max(...stats.map((s) => s.student_count))
            : 1;

    return (
        <section className="border border-gray-200 rounded-xl p-6 bg-white">
            <div className="flex items-center justify-between mb-6 text-gray-900">
                <div className="flex items-center gap-2">
                    <Users size={20} />
                    <h4 className="font-bold">
                        Student Enrollment Distribution
                    </h4>
                </div>

                <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                    Owner ID: {ownerId}
                </span>
            </div>

            {stats.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No modules found.
                </p>
            ) : (
                <div className="flex items-end gap-4 h-48 border-b border-gray-200 pb-2">
                    {stats.map((item) => {
                        const height =
                            (item.student_count / maxCount) * 150 + 20;

                        return (
                            <div
                                key={item.module_id}
                                className="flex-1 flex flex-col items-center gap-2"
                            >
                                <div
                                    style={{ height: `${height}px` }}
                                    className="w-full bg-gray-900 rounded-t flex items-center justify-center text-white text-xs font-bold transition-all hover:bg-gray-800"
                                >
                                    {item.student_count}
                                </div>

                                <span className="text-[10px] text-gray-500 text-center font-medium uppercase">
                                    {item.module_name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}