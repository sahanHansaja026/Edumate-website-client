"use client";

import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Visibility = "public" | "private";

export default function CreateModule() {
  const [moduleName, setModuleName] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const router = useRouter();

  // Get logged-in user
  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  // Example skills for autocomplete
  const availableSkills = [
    // Original core subjects
    "English", "Tamil", "Math", "Science", "IT", "Technology", "Physics", "Chemistry", "Biology",

    // Advanced Tech & Engineering
    "Computer Science", "Software Engineering", "Artificial Intelligence", "Machine Learning",
    "Data Science", "Cybersecurity", "Cloud Computing", "Web Development", "Mobile Development",
    "UI/UX Design", "Robotics", "Hardware Engineering",

    // Business & Professional Development
    "Business Studies", "Economics", "Accounting", "Finance", "Digital Marketing",
    "Project Management", "Entrepreneurship", "Leadership", "Data Analytics", "Public Speaking",

    // Humanities & Social Sciences
    "History", "Geography", "Political Science", "Sociology", "Psychology",
    "Philosophy", "Literature", "Media Studies",

    // Creative Arts & Design
    "Graphic Design", "Fine Arts", "Photography", "Video Editing", "Music Production",
    "Animation", "Creative Writing",

    // Languages & Communication
    "Sinhala", "French", "German", "Spanish", "Mandarin", "Japanese", "Linguistics",

    // Soft Skills & Essential Growth
    "Critical Thinking", "Problem Solving", "Time Management", "Financial Literacy", "Emotional Intelligence"
  ];

  // Add a skill
  const addSkill = (skill?: string) => {
    const newSkill = skill || skillInput.trim();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setSkillInput("");
    }
  };

  // Remove a skill
  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Handle cover image change
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Check subscription
  const checkQuota = async (userId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/quota/module/${userId}`);
      if (!res.ok) throw new Error("Failed to check quota");
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Reset form helper
  const handleReset = () => {
    setModuleName("");
    setDescription("");
    setSkills([]);
    setSkillInput("");
    setVisibility("public");
    setCoverFile(null);
    setCoverPreview(null);
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!moduleName) {
      alert("Module name is required");
      return;
    }

    if (!user) {
      alert("User not found. Please login.");
      return;
    }

    const quota = await checkQuota(user.id);

    if (!quota) {
      alert("Unable to verify subscription");
      return;
    }

    if (!quota.can_create) {
      router.push("/subscription");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user.id.toString());
    formData.append("name", moduleName);
    formData.append("description", description);
    formData.append("skills", JSON.stringify(skills));
    formData.append("visibility", visibility);
    if (coverFile) formData.append("cover_image", coverFile);

    try {
      const res = await fetch(`${API_BASE_URL}/modules/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to create module");

      const data = await res.json();
      console.log("Module created:", data);
      alert("Module created successfully!");
      handleReset();
    } catch (error) {
      console.error(error);
      alert("Error creating module");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <form onSubmit={handleSubmit} className="w-full">

        {/* Top Control Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 px-4 py-4 md:px-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">Create New Module</h1>
                {user && (
                  <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded border border-gray-200">
                    UID: {user.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">LMS Course Management Workspace</p>
            </div>

            {/* Action Buttons in Sticky Header */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 sm:flex-initial rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition shadow-sm text-center"
              >
                Clear Changes
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial rounded-md bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 active:bg-gray-950 transition shadow-sm text-center"
              >
                Create Module
              </button>
            </div>
          </div>
        </header>

        {/* Form Body Layout */}
        <main className="max-w-6xl mx-auto px-4 py-8 md:px-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left/Main Column - Core Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Module Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Module Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g., Introduction to Computer Science"
                  className="w-full rounded-md bg-white border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Module Description
                </label>
                <textarea
                  rows={8}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an in-depth curriculum overview, milestones, targeted audiences, and course requirements..."
                  className="w-full rounded-md bg-white border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition resize-y"
                />
              </div>

              {/* Cover Image Upload Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Cover Image Asset
                </label>
                <div className="relative flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-10 bg-gray-50 hover:bg-gray-100/60 transition group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-2 text-center pointer-events-none">
                    <svg className="mx-auto h-8 w-8 text-gray-400 group-hover:text-gray-600 transition" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4-4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900 underline">Upload media file</span>
                      <p className="inline pl-1">or drag and drop here</p>
                    </div>
                    <p className="text-xs text-gray-400">Accepts PNG, JPG, or GIF formatting</p>
                  </div>
                </div>
                {coverPreview && (
                  <div className="mt-4 relative inline-block">
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      className="max-h-48 w-auto rounded border border-gray-200 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                      className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 shadow-md hover:bg-gray-800 transition text-xs w-5 h-5 flex items-center justify-center font-bold"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Column - Metadata & Settings */}
            <div className="lg:col-span-1 space-y-8 lg:border-l lg:border-gray-200 lg:pl-8">

              {/* Privacy Settings / Visibility */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Privacy Settings
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 rounded-md border p-3.5 cursor-pointer transition ${visibility === "public"
                        ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                        : "border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === "public"}
                      onChange={() => setVisibility("public")}
                      className="h-4 w-4 mt-0.5 text-gray-900 focus:ring-gray-900 border-gray-300"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-gray-900">Public Access</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Indexed inside search catalogs open to public students.</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 rounded-md border p-3.5 cursor-pointer transition ${visibility === "private"
                        ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                        : "border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === "private"}
                      onChange={() => setVisibility("private")}
                      className="h-4 w-4 mt-0.5 text-gray-900 focus:ring-gray-900 border-gray-300"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-gray-900">Private Enrolment</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Restricted strictly to invitation tokens.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Skills Section */}
              <div className="relative space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Skills Targeted
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Enter targeted skills..."
                    className="flex-1 rounded-md bg-white border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addSkill()}
                    className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition shrink-0"
                  >
                    Add
                  </button>
                </div>

                {/* Autocomplete suggestions dropdown */}
                {skillInput && (
                  <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white border border-gray-200 shadow-md divide-y divide-gray-100">
                    {availableSkills
                      .filter(
                        (skill) =>
                          skill.toLowerCase().includes(skillInput.toLowerCase()) &&
                          !skills.includes(skill)
                      )
                      .map((skill) => {
                        const index = skill.toLowerCase().indexOf(skillInput.toLowerCase());
                        const beforeMatch = skill.slice(0, index);
                        const match = skill.slice(index, index + skillInput.length);
                        const afterMatch = skill.slice(index + skillInput.length);

                        return (
                          <li
                            key={skill}
                            onClick={() => addSkill(skill)}
                            className="cursor-pointer px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition"
                          >
                            {beforeMatch}
                            <span className="font-semibold text-gray-900">{match}</span>
                            {afterMatch}
                          </li>
                        );
                      })}
                  </ul>
                )}

                {/* Selected Tags Display */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1 rounded bg-gray-100 border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-gray-400 hover:text-gray-900 transition font-bold text-sm"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>
      </form>
    </div>
  );
}