"use client";

import { useState } from "react";
import WeekItemInfo from "./WeekItemInfo";

type WeekContentProps = {
    weeks?: number;
    itemsPerWeek?: number; // Note: WeekItemInfo usually handles the list internaly
    activeWeek: number;
    moduleId: number | string;
    currentUserId?: number | string;
    moduleUserId?: number | string;
};

export default function WeekContent({
    weeks = 5,
    activeWeek,
    currentUserId,
    moduleUserId,
    moduleId,
}: WeekContentProps) {
    const [activeItem, setActiveItem] = useState<string | null>(null);

    // ✅ Define Owner logic here to use for specific buttons
    const isOwner =
        currentUserId !== undefined &&
        moduleUserId !== undefined &&
        Number(currentUserId) === Number(moduleUserId);

    return (
        <div className="space-y-6">
            {/* LOOP THROUGH WEEKS */}
            {Array.from({ length: weeks }, (_, w) => {
                const weekNumber = w + 1;

                // Only show the content for the currently Course Videos
                if (weekNumber !== activeWeek) return null;

                return (
                    <div key={w} className="animate-fadeIn">
                        <hr className="mb-6 border-gray-100" />

                        <div className="space-y-6">
                            {/* 
                                1. THE CONTENT LIST 
                                Visible to everyone. Internal logic in WeekItemInfo 
                                handles what users see vs what owners see.
                            */}
                            <WeekItemInfo moduleId={String(moduleId)} />

                            {/* 
                                2. OWNER-ONLY ACTIONS
                                Only show the 'Create' utility if the logged-in user 
                                is the module creator.
                            */}
                            {isOwner && (
                                <div className="mt-8 p-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-between bg-gray-50/50">
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-700">Instructor Tools</h5>
                                        <p className="text-xs text-gray-500">Add new activities or content to this week.</p>
                                    </div>

                                    <a href={`/pages/create_activities/${moduleId}`}>
                                        <button
                                            onClick={() => setActiveItem(`create-week-${w}`)}
                                            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
                                        >
                                            + Create Activity
                                        </button>
                                    </a>
                                </div>
                            )}
                        </div>

                        <hr className="mt-6 border-gray-100" />
                    </div>
                );
            })}
        </div>
    );
}