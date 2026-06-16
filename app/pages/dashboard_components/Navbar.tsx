"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";
import { getUser } from "@/app/services/authService";

type Role = "student" | "Module owner" | "channel";

interface NavbarProps {
    currentRole: Role;
    onRoleChange: (role: Role) => void;
}

type User = {
    id: number;
    email: string;
};
export default function Navbar({ currentRole, onRoleChange }: NavbarProps) {
    const [user, setUser] = useState<{ email: string } | null>(null);


      useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);
      }, []);

    return (
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
                <GraduationCap className="h-7 w-7 text-gray-900" />
                <span className="text-lg font-black tracking-tight text-gray-900">EduMate</span>
            </div>

            {/* Dynamic Role Switcher (Simulated environment controller) */}
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
                {(["student", "Module owner", "channel"] as const).map((r) => (
                    <button
                        key={r}
                        onClick={() => onRoleChange(r)}
                        className={`px-4 py-2 rounded-md font-bold tracking-wide uppercase transition-all ${currentRole === r
                                ? "bg-gray-900 text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        {r === "Module owner" ? "Module Owner" : r === "channel" ? "Channel Host" : r}
                    </button>
                ))}
            </div>

            {/* User Status Profile */}
            {user && (
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900">{user.email}</p>
                        <p className="text-[10px] font-mono font-medium text-gray-400 uppercase tracking-wider">Verified Account</p>
                    </div>
                </div>
            )}
        </header>
    );
}