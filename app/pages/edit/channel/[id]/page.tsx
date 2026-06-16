"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation"; // To grab channelId dynamically

import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";

export default function UpdateChannelPage() {
    const params = useParams();
    const router = useRouter();
    const channelId = params?.channel_id || params?.id; // Matches dynamic folder layout names like [id] or [channel_id]

    const [user, setUser] = useState<{ id: number; email: string } | null>(null);
    const [channelName, setChannelName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Form states matching FastAPI field variables
    const [instituteLegalName, setInstituteLegalName] = useState("");
    const [instituteOwnerFullName, setInstituteOwnerFullName] = useState("");
    const [physicalCorporateAddress, setPhysicalCorporateAddress] = useState("");
    const [officialWebsiteLink, setOfficialWebsiteLink] = useState("");
    const [facebookPortalLink, setFacebookPortalLink] = useState("");

    // Media files & local previews
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string>("");
    const [logoImage, setLogoImage] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");

    const coverInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Faculty Tag Management State
    const [coHosts, setCoHosts] = useState<string[]>([]);
    const [emailInput, setEmailInput] = useState("");

    useEffect(() => {
        const currentUser = getUser();
        setUser(currentUser);
    }, []);

    // FETCH EXISTING CHANNEL RECORDS
    useEffect(() => {
        if (!channelId) return;

        const fetchChannelData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/channels/${channelId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch channel configurations.");
                }
                const data = await response.json();

                // Hydrate field state variables
                setChannelName(data.channel_name || "");
                setDescription(data.description || "");
                setIsPublic(data.visibility === "public");
                setInstituteLegalName(data.institute_legal_name || "");
                setInstituteOwnerFullName(data.institute_owner_full_name || "");
                setPhysicalCorporateAddress(data.physical_corporate_address || "");
                setOfficialWebsiteLink(data.official_website_link || "");
                setFacebookPortalLink(data.facebook_portal_link || "");

                // Parse faculty roster safely array structures
                if (data.co_hosts_and_faculty_members) {
                    const parsedFaculty = typeof data.co_hosts_and_faculty_members === "string"
                        ? JSON.parse(data.co_hosts_and_faculty_members)
                        : data.co_hosts_and_faculty_members;
                    setCoHosts(parsedFaculty);
                }

                // Handle system media maps directly from storage pathways
                if (data.cover_image) {
                    // Check if path is absolute URL or relative to standard media server boundaries
                    const fullCoverUrl = data.cover_image.startsWith("http")
                        ? data.cover_image
                        : `${API_BASE_URL.replace("/channels", "")}/${data.cover_image}`;
                    setCoverPreview(fullCoverUrl);
                }
                if (data.logo_image) {
                    const fullLogoUrl = data.logo_image.startsWith("http")
                        ? data.logo_image
                        : `${API_BASE_URL.replace("/channels", "")}/${data.logo_image}`;
                    setLogoPreview(fullLogoUrl);
                }

            } catch (err: any) {
                console.error(err);
                setMessage({ type: "error", text: err.message || "Failed parsing record structure." });
            }
        };

        fetchChannelData();
    }, [channelId]);

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
            if (logoPreview && logoPreview.startsWith("blob:")) URL.revokeObjectURL(logoPreview);
        };
    }, [coverPreview, logoPreview]);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoImage(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === "," || e.key === " ") {
            e.preventDefault();
            const trimmed = emailInput.trim().replace(/,/, "");

            if (trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                if (!coHosts.includes(trimmed)) {
                    setCoHosts([...coHosts, trimmed]);
                }
                setEmailInput("");
            } else if (trimmed) {
                setMessage({ type: "error", text: "Please enter a valid email address." });
            }
        }
    };

    const removeCoHost = (emailToRemove: string) => {
        setCoHosts(coHosts.filter((email) => email !== emailToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!channelName.trim() || !instituteLegalName.trim() || !instituteOwnerFullName.trim()) {
            setMessage({ type: "error", text: "Please fill out all required fields." });
            return;
        }
        if (!user) {
            setMessage({ type: "error", text: "You must be logged in to modify this channel." });
            return;
        }
        if (!channelId) {
            setMessage({ type: "error", text: "Missing targeting record Channel Identifier identification." });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append("user_id", String(user.id));
            formData.append("channel_name", channelName);
            formData.append("description", description || "");
            formData.append("institute_legal_name", instituteLegalName);
            formData.append("institute_owner_full_name", instituteOwnerFullName);
            formData.append("physical_corporate_address", physicalCorporateAddress || "");
            formData.append("co_hosts_and_faculty_members", JSON.stringify(coHosts));
            formData.append("visibility", isPublic ? "public" : "private");
            formData.append("official_website_link", officialWebsiteLink || "");
            formData.append("facebook_portal_link", facebookPortalLink || "");

            // Append raw files only if explicit updates have overridden baseline paths
            if (coverImage) formData.append("cover_image", coverImage);
            if (logoImage) formData.append("logo_image", logoImage);

            // Fetch request method mutations updated from POST to PUT targeting the specific ID route bound
            const response = await fetch(`${API_BASE_URL}/channels/${channelId}`, {
                method: "PUT",
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData?.detail || "Failed to update channel properties.");
            }

            setMessage({ type: "success", text: "Channel successfully updated and re-published!" });
        } catch (error: any) {
            console.error(error);
            setMessage({ type: "error", text: error.message || "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-gray-200">

            {/* Top Workspace Navbar Layout */}
            <header className="border-b border-gray-200 bg-gray-50/50 sticky top-0 backdrop-blur-md z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/pages/home"
                            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            ← Dashboard
                        </Link>
                        <span className="text-gray-300">/</span>
                        <span className="text-sm font-semibold text-gray-900">Edit Channel</span>
                    </div>
                    <div className="text-xs text-gray-400 font-mono hidden sm:block">
                        Workspace User ID: {user?.id || "Unauthenticated"}
                    </div>
                </div>
            </header>

            {/* LinkedIn profile identity design */}
            <div className="w-full bg-gray-100 relative group border-b border-gray-200">
                <input
                    type="file"
                    ref={coverInputRef}
                    onChange={handleCoverChange}
                    accept="image/*"
                    className="hidden"
                />
                <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoChange}
                    accept="image/*"
                    className="hidden"
                />

                {/* Banner Canvas Container (1584x396px aspect) */}
                <div
                    onClick={() => coverInputRef.current?.click()}
                    className="h-48 sm:h-64 md:h-72 w-full overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 relative cursor-pointer flex items-center justify-center transition-all group-hover:opacity-95"
                >
                    {coverPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center space-y-1 p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-600 bg-white/80 px-3 py-1.5 rounded-md shadow-sm backdrop-blur-sm">
                                Click to replace cover banner
                            </p>
                            <p className="text-[10px] text-gray-500">Target Size: 1584 × 396 px</p>
                        </div>
                    )}
                </div>

                {/* Profile Avatar Frame Container (400x400px aspect) */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-16 sm:h-20">
                    <div
                        onClick={() => logoInputRef.current?.click()}
                        className="absolute -top-16 sm:-top-20 left-4 sm:left-6 lg:left-8 h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 border-white bg-gray-50 shadow-md overflow-hidden cursor-pointer flex items-center justify-center hover:scale-[1.02] transition-transform"
                    >
                        {logoPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block">Replace Logo</span>
                                <span className="text-[9px] text-gray-400 block font-mono">400×400 px</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Primary Layout Engine Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Info Side Rail */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                                Update Channel Engine
                            </h1>
                            <p className="mt-3 text-base text-gray-500 leading-relaxed">
                                Modify your channel instance properties. Required parameters are processed downstream for identity parsing and routing layouts.
                            </p>
                        </div>

                        <hr className="border-gray-200" />

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Setup State Validation</h4>
                            <ul className="space-y-2.5 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${channelName ? "bg-green-500" : "bg-gray-300"}`} />
                                    Channel Core Identity
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${instituteLegalName && instituteOwnerFullName ? "bg-green-500" : "bg-gray-300"}`} />
                                    Infrastructure Context
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Form Processing Center */}
                    <main className="lg:col-span-8">
                        <form onSubmit={handleSubmit} className="space-y-12">

                            {/* Section 1: Core Params */}
                            <section className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">1. Channel Metadata</h2>

                                <div>
                                    <label htmlFor="channelName" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Channel Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="channelName"
                                        value={channelName}
                                        onChange={(e) => setChannelName(e.target.value)}
                                        placeholder="e.g., Department of Computational Science"
                                        className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-base"
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Description Summary
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Provide a high-level mission statement or curriculum focus pool..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-base resize-none"
                                        maxLength={500}
                                    />
                                </div>
                            </section>

                            {/* Section 2: Enterprise Infrastructure */}
                            <section className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">2. Institute Infrastructure</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="instituteLegalName" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            Institute Legal Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="instituteLegalName"
                                            value={instituteLegalName}
                                            onChange={(e) => setInstituteLegalName(e.target.value)}
                                            placeholder="e.g., Oakwood Academic Matrix"
                                            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="instituteOwnerFullName" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            Institute Owner Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="instituteOwnerFullName"
                                            value={instituteOwnerFullName}
                                            onChange={(e) => setInstituteOwnerFullName(e.target.value)}
                                            placeholder="e.g., Dr. Elizabeth Vance"
                                            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="physicalCorporateAddress" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Physical Corporate Address
                                    </label>
                                    <input
                                        type="text"
                                        id="physicalCorporateAddress"
                                        value={physicalCorporateAddress}
                                        onChange={(e) => setPhysicalCorporateAddress(e.target.value)}
                                        placeholder="e.g., 405 Innovation Way, Building C"
                                        className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                                    />
                                </div>
                            </section>

                            {/* Section 3: Access Management Controls */}
                            <section className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">3. Workspace Access & Personnel</h2>

                                <div>
                                    <label htmlFor="coHosts" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                        Faculty Sub-members Whitelist (Emails)
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        Only valid email addresses can be added. Use Space or Enter to confirm.
                                    </p>
                                    <div className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-gray-900 transition-all">
                                        <div className="flex flex-wrap gap-2 items-center">
                                            {coHosts.map((email) => (
                                                <span key={email} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-lg">
                                                    {email}
                                                    <button type="button" onClick={() => removeCoHost(email)} className="text-gray-400 hover:text-white transition-colors font-bold focus:outline-none">
                                                        &times;
                                                    </button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                id="coHosts"
                                                value={emailInput}
                                                onChange={(e) => setEmailInput(e.target.value)}
                                                onKeyDown={handleEmailKeyDown}
                                                placeholder={coHosts.length === 0 ? "Add faculty emails followed by a Space, Comma, or Enter..." : ""}
                                                className="flex-1 min-w-[250px] px-2 py-1 bg-transparent text-gray-900 focus:outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                                        Channel Visibility Scope Context
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setIsPublic(true)}
                                            className={`p-5 rounded-xl border cursor-pointer transition-all ${isPublic ? "border-gray-900 bg-gray-50/70 ring-1 ring-gray-900" : "border-gray-200 bg-white hover:border-gray-400"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-sm text-gray-900">Public Channel Hub</h3>
                                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isPublic ? "border-gray-900" : "border-gray-300"}`}>
                                                    {isPublic && <div className="h-2 w-2 rounded-full bg-gray-900" />}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500">Globally accessible across the instance space configuration.</p>
                                        </div>

                                        <div
                                            onClick={() => setIsPublic(false)}
                                            className={`p-5 rounded-xl border cursor-pointer transition-all ${!isPublic ? "border-gray-900 bg-gray-50/70 ring-1 ring-gray-900" : "border-gray-200 bg-white hover:border-gray-400"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-sm text-gray-900">Private / Sandbox</h3>
                                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${!isPublic ? "border-gray-900" : "border-gray-300"}`}>
                                                    {!isPublic && <div className="h-2 w-2 rounded-full bg-gray-900" />}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500">Requires direct record inclusion variables to interact.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 4: Web footprints links */}
                            <section className="space-y-6">
                                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">4. Web Footprint</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="officialWebsiteLink" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            Official Website Link
                                        </label>
                                        <input
                                            type="url"
                                            id="officialWebsiteLink"
                                            value={officialWebsiteLink}
                                            onChange={(e) => setOfficialWebsiteLink(e.target.value)}
                                            placeholder="https://institute.edu"
                                            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="facebookPortalLink" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            Facebook Portal Link
                                        </label>
                                        <input
                                            type="url"
                                            id="facebookPortalLink"
                                            value={facebookPortalLink}
                                            onChange={(e) => setFacebookPortalLink(e.target.value)}
                                            placeholder="https://facebook.com/inst-hub"
                                            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Status Alert Windows */}
                            {message && (
                                <div className={`p-4 rounded-xl border text-sm font-semibold ${message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            {/* Form Action Controls */}
                            <div className="pt-6 border-t border-gray-200 flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-3 border border-gray-300 text-sm font-bold rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-gray-900 text-sm font-bold rounded-xl text-white hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all min-w-[160px]"
                                >
                                    {loading ? "Saving Changes..." : "Save Changes"}
                                </button>
                            </div>

                        </form>
                    </main>

                </div>
            </div>
        </div>
    );
}