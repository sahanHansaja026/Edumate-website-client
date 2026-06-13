"use client";

import { useState } from "react";
import WeekItemInfo from "./channalWeekiteminfo";

type WeekContentProps = {
    weeks?: number;
    itemsPerWeek?: number; // Note: WeekItemInfo usually handles the list internally
    activeWeek: number;
    moduleId: number | string;
    currentUserId?: number | string;
    currentUserEmail?: string | null;
    moduleUserId?: number | string;
    coHostEmail?: string | null;
};

export default function WeekContent({
    weeks = 5,
    activeWeek,
    currentUserId,
    currentUserEmail,
    moduleUserId,
    moduleId,
    coHostEmail,
}: WeekContentProps) {
    const [activeItem, setActiveItem] = useState<string | null>(null);

    // 1. Check if the user is the original Module Owner
    const isOwner =
        currentUserId !== undefined &&
        moduleUserId !== undefined &&
        Number(currentUserId) === Number(moduleUserId);

    // 2. Check if the user is the designated Co-Host
    const isCoHost =
        currentUserEmail &&
        coHostEmail &&
        currentUserEmail.toLowerCase() === coHostEmail.toLowerCase();

    // 3. Grant instructor tools if they meet either condition
    const hasEditPermissions = isOwner || isCoHost;

    return (
        <div className="space-y-6">
            {/* LOOP THROUGH WEEKS */}
            {Array.from({ length: weeks }, (_, w) => {
                const weekNumber = w + 1;

                // Only show the content for the currently selected week
                if (weekNumber !== activeWeek) return null;

                return (
                    <div key={w} className="animate-fadeIn">
                        <hr className="mb-6 border-gray-100" />

                        <div className="space-y-6">
                            {/* 1. THE CONTENT LIST 
                                Visible to everyone. Internal logic in WeekItemInfo 
                                handles what users see vs what owners see.
                            */}
                            <WeekItemInfo moduleId={String(moduleId)} />

                            {/* 2. PRIVILEGED ACTIONS
                                Show the 'Create' utility if the logged-in user 
                                is either the module owner or the co-host.
                            */}
                            {hasEditPermissions && (
                                <div className="mt-8 p-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-between bg-gray-50/50">
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-700">Instructor Tools</h5>
                                        <p className="text-xs text-gray-500">Add new activities or content to this week.</p>
                                    </div>

                                    <a href={`/pages/channal_create_activities/${moduleId}`}>
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