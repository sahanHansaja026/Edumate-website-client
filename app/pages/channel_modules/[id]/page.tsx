"use client";

import { API_BASE_URL } from "@/app/config/api";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Upload, X, Plus, Info, ArrowLeft } from "lucide-react";
import { getUser } from "@/app/services/authService";

type Visibility = "public" | "private";

export default function CreateModule() {
    const params = useParams();
    const channelId = params.id as string;
    const router = useRouter();

    const [moduleName, setModuleName] = useState("");
    const [description, setDescription] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [coHostEmail, setCoHostEmail] = useState("");
    const [skillInput, setSkillInput] = useState("");
    const [visibility, setVisibility] = useState<Visibility>("public");
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    // Auth and Guard states
    const [user, setUser] = useState<{ id: number; email: string } | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [loading, setLoading] = useState(false);

    // ==========================================
    // AUTHENTICATION & AUTHORIZATION GUARD
    // ==========================================
    useEffect(() => {
        const checkAuthorization = async () => {
            const localUser = getUser();

            // 1. If no logged in user structure is found locally, redirect away
            if (!localUser || !localUser.id || !localUser.email) {
                router.push("/errors/autharization");
                return;
            }

            setUser(localUser);

            try {
                // 2. Query your FastAPI authorize endpoint
                const url = new URL(`${API_BASE_URL}/channels/${channelId}/authorize`);
                url.searchParams.append("current_user_id", localUser.id.toString());
                url.searchParams.append("current_email", localUser.email);

                const response = await fetch(url.toString(), {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });

                if (!response.ok) {
                    throw new Error("Authorization server responded with an error status.");
                }

                const authData = await response.json();

                // 3. Kick user out if the authorized flag resolves to false
                if (!authData.authorized) {
                    router.push("/errors/autharization");
                } else {
                    // Access permitted! Remove loading boundary layout
                    setIsCheckingAuth(false);
                }
            } catch (error) {
                console.error("Authorization check failed:", error);
                router.push("/errors/autharization");
            }
        };

        if (channelId) {
            checkAuthorization();
        }
    }, [channelId, router]);

    const availableSkills = ["English", "Tamil", "Math", "Science", "IT", "Technology", "Physics", "Chemistry", "Biology"];

    const addSkill = (skill?: string) => {
        const newSkill = skill || skillInput.trim();
        if (newSkill && !skills.includes(newSkill)) {
            setSkills([...skills, newSkill]);
            setSkillInput("");
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter((s) => s !== skill));
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moduleName || !user) {
            alert("Please provide a module name.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("user_id", user.id.toString());
        formData.append("channel_id", channelId);
        formData.append("name", moduleName);
        formData.append("co_host_email", coHostEmail);
        formData.append("description", description);
        formData.append("skills", JSON.stringify(skills));
        formData.append("visibility", visibility);
        if (coverFile) formData.append("cover_image", coverFile);

        try {
            const res = await fetch(`${API_BASE_URL}/channel-modules/`, {
                method: "POST",
                body: formData,
                // Do NOT manually supply Content-Type for FormDatas. 
                // Let the browser calculate boundaries seamlessly.
            });

            if (!res.ok) throw new Error("Failed to create module");

            alert("Module created successfully!");
            router.back();
        } catch (err) {
            console.error(err);
            alert("Error creating module");
        } finally {
            setLoading(false);
        }
    };

    // Render a clean structural placeholder screen while background requests verify security state
    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm font-medium">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying workspace privileges...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Top Minimal Navigation Bar */}
            <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-50 transition-all"
                            type="button"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Channel Workspace</span>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">Create Module</h1>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <span className="text-xs text-gray-500 block">Active Context</span>
                        <span className="text-sm font-medium text-gray-700">Channel ID: {channelId}</span>
                    </div>
                </div>
            </header>

            {/* Main Full-Page Form Container */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* Section 1: Core Details */}
                    <fieldset className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-gray-200 pb-10">
                        <legend className="sr-only">Module Core Details</legend>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Module Information</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Provide the primary setup details for your module. The name and descriptive data will be visible to your audiences depending on visibility rules.
                            </p>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Module Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={moduleName}
                                    onChange={(e) => setModuleName(e.target.value)}
                                    placeholder="e.g., Introduction to Computational Mathematics"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide a comprehensive breakdown of the syllabus, milestones, or target achievements..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Section 2: Management & Collaborators */}
                    <fieldset className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-gray-200 pb-10">
                        <legend className="sr-only">Collaborators and Categorization</legend>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Access & Categorization</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Assign shared ownership to another educator and index your modules with explicit tag skill matrices.
                            </p>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Co-host Email Address</label>
                                <input
                                    type="email"
                                    value={coHostEmail}
                                    onChange={(e) => setCoHostEmail(e.target.value)}
                                    placeholder="collaborator@institution.edu"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Associated Skill Tags</label>
                                <div className="relative flex gap-2">
                                    <input
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        placeholder="Type or select targeted domains..."
                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addSkill()}
                                        className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center"
                                    >
                                        <Plus size={18} />
                                    </button>

                                    {/* Inline Dropdown Suggestions */}
                                    {skillInput && (
                                        <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {availableSkills
                                                .filter(s => s.toLowerCase().includes(skillInput.toLowerCase()) && !skills.includes(s))
                                                .map(skill => (
                                                    <button
                                                        key={skill}
                                                        type="button"
                                                        onClick={() => addSkill(skill)}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                                                    >
                                                        {skill}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {/* Active Skill Badges */}
                                {skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {skills.map((skill) => (
                                            <span key={skill} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-xs font-semibold border border-gray-200">
                                                {skill}
                                                <button type="button" onClick={() => removeSkill(skill)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </fieldset>

                    {/* Section 3: Media Elements */}
                    <fieldset className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-gray-200 pb-10">
                        <legend className="sr-only">Module Visual Display</legend>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Module Graphic</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Upload high-resolution visual headers. Transparent assets or optimized dimensions render dynamic scaling context accurately.
                            </p>
                        </div>

                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image File</label>
                            <div className="relative group border border-dashed border-gray-300 rounded-lg p-6 transition-all hover:border-indigo-500 flex flex-col items-center justify-center min-h-[180px] bg-gray-50/50">
                                {coverPreview ? (
                                    <div className="relative w-full max-w-md h-36">
                                        <img src={coverPreview} alt="Preview" className="w-full h-full object-cover rounded-md border border-gray-200" />
                                        <button
                                            onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                                            className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors"
                                            type="button"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="text-gray-400 mb-3" size={28} />
                                        <div className="text-sm text-gray-600 text-center">
                                            <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Click to upload banner asset</span> or drag context here
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Acceptable types: WebP, PNG, JPG up to 5MB</p>
                                        <input type="file" onChange={handleCoverChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    </>
                                )}
                            </div>
                        </div>
                    </fieldset>

                    {/* Section 4: Submission Scope */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Visibility Control & Launch</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Verify privacy boundaries before publishing live updates directly back to your channel container.
                            </p>
                        </div>

                        <div className="lg:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            {/* Radio Toggles */}
                            <div className="flex items-center gap-6">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500/20 border-gray-300"
                                        checked={visibility === "public"}
                                        onChange={() => setVisibility("public")}
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-medium text-gray-900">Public visibility</span>
                                    </div>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500/20 border-gray-300"
                                        checked={visibility === "private"}
                                        onChange={() => setVisibility("private")}
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-medium text-gray-900">Private target</span>
                                    </div>
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 sm:flex-none px-7 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-all"
                                >
                                    {loading ? "Processing..." : "Publish Module"}
                                </button>
                            </div>
                        </div>
                    </div>

                </form>
            </main>
        </div>
    );
}