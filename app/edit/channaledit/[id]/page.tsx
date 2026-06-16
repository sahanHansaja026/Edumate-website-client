"use client";

import { API_BASE_URL } from "@/app/config/api";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Upload, X, Plus, ArrowLeft } from "lucide-react";

type Visibility = "public" | "private";

export default function EditOrCreateModule() {
    const params = useParams();
    const id = params?.id as string;

    const router = useRouter();

    // Core form fields
    const [moduleName, setModuleName] = useState("");
    const [description, setDescription] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [coHostEmail, setCoHostEmail] = useState("");
    const [skillInput, setSkillInput] = useState("");
    const [visibility, setVisibility] = useState<string>("public");
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    // Hidden backend identifiers maintained contextually
    const [userId, setUserId] = useState<number | "">("");
    const [channelId, setChannelId] = useState<number | "">("");

    const [loading, setLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);

    // ==========================================
    // GET: FETCH EXISTING RECORDS
    // ==========================================
    useEffect(() => {
        const fetchModuleData = async () => {
            if (!id) return;

            try {
                setIsFetchingData(true);
                const res = await axios.get(`${API_BASE_URL}/channel-modules/module/${id}`);
                const data = res.data;

                // Bind text attributes
                setModuleName(data.name || "");
                setDescription(data.description || "");
                setCoHostEmail(data.co_host?.email || data.co_host_email || "");
                setVisibility(data.visibility || "public");

                // Keep IDs in state implicitly behind the scenes
                setUserId(data.user_id || "");
                setChannelId(data.channel_id || "");

                // Parse out metrics arrays safely
                if (data.skills) {
                    setSkills(Array.isArray(data.skills) ? data.skills : JSON.parse(data.skills || "[]"));
                } else {
                    setSkills([]);
                }

                if (data.cover_image) {
                    setCoverPreview(data.cover_image.startsWith("http") ? data.cover_image : `${API_BASE_URL}/uploads/channel_modules/${data.cover_image}`);
                }
            } catch (err) {
                console.error("Failed loading data setup context: ", err);
            } finally {
                setIsFetchingData(false);
            }
        };

        fetchModuleData();
    }, [id]);

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

    // ==========================================
    // PUT: UPDATE SUBMISSION PIPELINE
    // ==========================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moduleName) {
            alert("Please provide a module name.");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            // Appends IDs cleanly without UI overhead
            if (userId !== "") formData.append("user_id", String(userId));
            if (channelId !== "") formData.append("channel_id", String(channelId));

            formData.append("name", moduleName);
            formData.append("description", description);
            formData.append("co_host_email", coHostEmail);
            formData.append("visibility", visibility);
            formData.append("skills", JSON.stringify(skills));

            if (coverFile) {
                formData.append("cover_image", coverFile);
            }

            await axios.put(
                `${API_BASE_URL}/channel-modules/module/${id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Module updated successfully!");
            router.back();
        } catch (error) {
            console.error(error);
            alert("Failed to update module");
        } finally {
            setLoading(false);
        }
    };

    if (isFetchingData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 text-sm font-medium">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span>Retrieving module specifications from database...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Top Navigation Bar */}
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
                            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Workspace Management</span>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">
                                Edit Module: {moduleName || id}
                            </h1>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <span className="text-xs text-gray-500 block">Context Identity</span>
                        <span className="text-sm font-medium text-gray-700">
                            Module ID: {id}
                        </span>
                    </div>
                </div>
            </header>

            {/* Form Fields */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <form onSubmit={handleSubmit} className="space-y-10">

                    {/* Module Core Profile */}
                    <fieldset className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-gray-200 pb-10">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Module Profile</h2>
                            <p className="mt-1 text-sm text-gray-500">Configure public titles and details stored directly inside the active module record.</p>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Module Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={moduleName}
                                    onChange={(e) => setModuleName(e.target.value)}
                                    placeholder="Module Name"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide a comprehensive breakdown of objectives or content architectures..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-sm resize-none"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Metadata Settings */}
                    <fieldset className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-gray-200 pb-10">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Co-Hosting & Skills</h2>
                            <p className="mt-1 text-sm text-gray-500">Manage shared access settings and serialize key metrics arrays.</p>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Co-host Email Address</label>
                                <input
                                    type="email"
                                    value={coHostEmail}
                                    onChange={(e) => setCoHostEmail(e.target.value)}
                                    placeholder="collaborator@domain.com"
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

                    {/* Image File Buffer */}
                    <fieldset className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-b border-gray-200 pb-10">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Visual Headers</h2>
                            <p className="mt-1 text-sm text-gray-500">File buffer transfers automatically append filename attributes securely on compile.</p>
                        </div>

                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image File</label>
                            <div className="relative group border border-dashed border-gray-300 rounded-lg p-6 transition-all hover:border-indigo-500 flex flex-col items-center justify-center min-h-[180px] bg-gray-50/50">
                                {coverPreview ? (
                                    <div className="relative w-full max-w-md h-36">
                                        <img
                                            src={coverPreview}
                                            alt="Preview Banner"
                                            className="w-full h-full object-cover rounded-md border border-gray-200"
                                        />
                                        <button
                                            onClick={() => { setCoverFile(null); setCoverPreview(null); }}
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

                    {/* Form Controls & Visibility Selection */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Visibility Scope</h2>
                            <p className="mt-1 text-sm text-gray-500">Update privacy rules directly matching database enum types.</p>
                        </div>

                        <div className="lg:col-span-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500/20 border-gray-300"
                                        checked={visibility === "public"}
                                        onChange={() => setVisibility("public")}
                                    />
                                    <span className="ml-3 block text-sm font-medium text-gray-900">Public visibility</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500/20 border-gray-300"
                                        checked={visibility === "private"}
                                        onChange={() => setVisibility("private")}
                                    />
                                    <span className="ml-3 block text-sm font-medium text-gray-900">Private target</span>
                                </label>
                            </div>

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
                                    {loading ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>

                </form>
            </main>
        </div>
    );
}