"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";
import {
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  X,
  Globe,
  Lock,
  Sparkles,
  AlignLeft,
  BookOpen
} from "lucide-react";

type Visibility = "public" | "private";

export default function EditModule() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [moduleName, setModuleName] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  // 1. Fetch current user data on mount
  useEffect(() => {
    setUser(getUser());
  }, []);

  // 2. Fetch module details and verify ownership logic
  useEffect(() => {
    const fetchModule = async () => {
      if (!id || !user) return;

      try {
        const res = await fetch(`${API_BASE_URL}/modules/${id}`);
        if (!res.ok) throw new Error("Failed to capture module information");

        const data = await res.json();

        // AUTH CHECK: Ensure the authenticated user owns this module
        if (Number(user.id) !== Number(data.user_id)) {
          setHasAccess(false);
          return;
        }

        setHasAccess(true);
        setModuleName(data.name || "");
        setDescription(data.description || "");
        setVisibility(data.visibility || "public");

        setSkills(
          typeof data.skills === "string"
            ? JSON.parse(data.skills)
            : data.skills || []
        );

        setCoverPreview(
          data.cover_image
            ? `data:image/png;base64,${data.cover_image}`
            : null
        );
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchModule();
    } else if (!id) {
      setLoading(false);
    }
  }, [id, user]);

  // 3. Strict Routing Guard for unauthorized entities
  useEffect(() => {
    if (hasAccess === false) {
      router.push("/errors/autharization");
    }
  }, [hasAccess, router]);

  // Skill mutations
  const addSkill = () => {
    const newSkill = skillInput.trim();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Safe image swapping preview mapping
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("User configuration data is missing");

    const formData = new FormData();
    formData.append("user_id", user.id.toString());
    formData.append("name", moduleName);
    formData.append("description", description);
    formData.append("skills", JSON.stringify(skills));
    formData.append("visibility", visibility);

    if (coverFile) {
      formData.append("cover_image", coverFile);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/modules/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Network payload rejected");

      alert("Module updated successfully");
      router.push("/pages/home");
    } catch (err) {
      console.error(err);
      alert("Error updating module details");
    }
  };

  if (loading || hasAccess === null) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-gray-500 gap-3">
        <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium tracking-wide">Verifying credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-100">

      {/* HEADER ACTION BAR */}
      <div className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to workspace
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
            Editor
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-10">

          {/* TITLE BANNER */}
          <div className="border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Module Settings</h1>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              Modify details, imagery properties, and operational access levels for this structural unit.
            </p>
          </div>

          {/* MODULE CONFIGURATION FIELDS */}
          <div className="space-y-8">

            {/* MODULE NAME */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                Module Title
              </label>
              <input
                type="text"
                required
                className="w-full bg-white border border-gray-200 text-gray-900 p-3 rounded-xl outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-100 font-medium"
                placeholder="e.g., Advanced System Infrastructure Architectures"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5 text-gray-400" />
                Detailed Overview
              </label>
              <textarea
                rows={5}
                required
                className="w-full bg-white border border-gray-200 text-gray-900 p-3 rounded-xl outline-none transition focus:border-gray-900 focus:ring-4 focus:ring-gray-100 text-sm leading-relaxed"
                placeholder="Provide a comprehensive operational dynamic summary of the module curriculum objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* COVER IMAGE LOADER */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                Presentation Graphical Banner
              </label>

              <div className="grid sm:grid-cols-3 gap-4 items-start">
                <div className="sm:col-span-1">
                  <div className="relative group border border-dashed border-gray-200 rounded-xl p-4 hover:border-gray-900 transition flex flex-col items-center justify-center text-center bg-gray-50/50 min-h-[160px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon className="w-5 h-5 text-gray-400 mb-2 group-hover:text-gray-900 transition" />
                    <span className="text-xs font-semibold text-gray-700">Choose custom file</span>
                    <span className="text-[10px] text-gray-400 mt-1">PNG, JPG format</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  {coverPreview ? (
                    <div className="relative border border-gray-100 rounded-xl overflow-hidden bg-gray-50 group h-40 flex items-center justify-center">
                      <img
                        src={coverPreview}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        alt="Current live layout illustration"
                      />
                      <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="border border-gray-100 rounded-xl bg-gray-50/70 h-40 flex items-center justify-center text-xs text-gray-400 italic font-mono">
                      No cover preview configured
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SKILLS CHIPS REGISTRATION */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gray-400" />
                Target Core Skills
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  className="flex-1 bg-white border border-gray-200 text-gray-900 p-2.5 rounded-xl outline-none text-sm transition focus:border-gray-900"
                  placeholder="Press enter or click 'Add' to insert tags"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold px-5 rounded-xl transition"
                >
                  Add
                </button>
              </div>

              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-gray-50 border border-gray-200 text-gray-800 pl-3 pr-1.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-gray-400 hover:text-red-500 rounded-full p-0.5 hover:bg-gray-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic pt-1">No skill indices added to this configuration container.</p>
              )}
            </div>

            {/* VISIBILITY CONTEXT CONTROL */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Privacy Visibility Framework
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* PUBLIC RADIO */}
                <label className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition select-none ${visibility === "public"
                    ? "border-gray-900 bg-gray-50/50 ring-1 ring-gray-900"
                    : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <input
                    type="radio"
                    name="visibility"
                    className="mt-1 accent-gray-900"
                    checked={visibility === "public"}
                    onChange={() => setVisibility("public")}
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-gray-500" /> Public Access
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Module contents are indexing searchable and indexable by platform-wide students.
                    </p>
                  </div>
                </label>

                {/* PRIVATE RADIO */}
                <label className={`border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition select-none ${visibility === "private"
                    ? "border-gray-900 bg-gray-50/50 ring-1 ring-gray-900"
                    : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <input
                    type="radio"
                    name="visibility"
                    className="mt-1 accent-gray-900"
                    checked={visibility === "private"}
                    onChange={() => setVisibility("private")}
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-gray-500" /> Private Sandbox
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Only explicit user system profiles and specific direct link targets can access content.
                    </p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* ACTION BUTTON WRAPPER */}
          <div className="border-t border-gray-100 pt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/modules")}
              className="text-sm font-semibold text-gray-500 hover:text-gray-900 px-4 py-2.5 rounded-xl transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm"
            >
              Update Module
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}