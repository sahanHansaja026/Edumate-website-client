import React from "react";
import { ShieldAlert, Users, Radio } from "lucide-react";

export default function ChannelManager() {
    // Setup data representation for channels owned or access authorized
    const channelData = {
        name: "Computer Science Faculty Hub",
        totalStudents: 342,
        coHosts: [
            { name: "Dr. Sarah Jenkins", email: "s.jenkins@university.edu", status: "Active" },
            { name: "Prof. Alex Rivera", email: "a.rivera@university.edu", status: "Active" },
            { name: "Asst. Prof. Liam Chen", email: "l.chen@university.edu", status: "Pending Invitation" },
        ],
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Channel Core Metadata Card */}
            <div className="lg:col-span-1 border border-gray-200 rounded-xl p-6 bg-white space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Radio size={16} className="animate-pulse text-gray-900" />
                        <span className="text-xs font-mono font-bold tracking-widest uppercase">Live Broadcast Context</span>
                    </div>
                    <h4 className="text-2xl font-black tracking-tight text-gray-900 leading-tight">
                        {channelData.name}
                    </h4>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Audience Reach</span>
                            <span className="text-2xl font-black text-gray-900 mt-0.5 block">{channelData.totalStudents} Students</span>
                        </div>
                        <Users className="h-6 w-6 text-gray-300" />
                    </div>
                </div>
            </div>

            {/* Directory and Administrative Access Grid */}
            <div className="lg:col-span-2 border border-gray-200 rounded-xl p-6 bg-white">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                    <ShieldAlert className="h-5 w-5 text-gray-900" />
                    <h4 className="font-bold text-gray-900">Co-Host Permission Directory</h4>
                </div>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                    The security profiles cataloged below possess access permissions to view administrative assets, manage assignments, and configure settings.
                </p>

                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200">
                    {channelData.coHosts.map((host, index) => (
                        <div key={index} className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition">
                            <div>
                                <p className="text-sm font-bold text-gray-900">{host.name}</p>
                                <p className="text-xs text-gray-400 font-mono mt-0.5">{host.email}</p>
                            </div>
                            <span className={`text-[9px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full uppercase border select-none w-fit ${host.status === "Active"
                                    ? "bg-white text-gray-900 border-gray-900"
                                    : "bg-gray-900 text-white border-transparent animate-pulse"
                                }`}>
                                {host.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}