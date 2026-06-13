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
    "English",
    "Tamil",
    "Math",
    "Science",
    "IT",
    "Technology",
    "Physics",
    "Chemistry",
    "Biology",
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
  // check subscription
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

    // 🔥 CHECK QUOTA BEFORE CREATING MODULE
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

      // reset
      setModuleName("");
      setDescription("");
      setSkills([]);
      setSkillInput("");
      setVisibility("public");
      setCoverFile(null);
      setCoverPreview(null);

    } catch (error) {
      console.error(error);
      alert("Error creating module");
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex justify-center px-4 py-12">
      <form
        className="w-full max-w-3xl space-y-10 text-gray-200 relative"
        onSubmit={handleSubmit}
      >
        {/* Module Info */}
        <div>
          {user && <p className="text-sm text-gray-400">User ID: {user.id}</p>}
          <h2 className="text-lg font-semibold text-white">Create Module</h2>
          <p className="text-sm text-gray-400">
            Fill in the details to create your learning module.
          </p>
        </div>

        {/* Module Name */}
        <div>
          <label className="block text-sm font-medium">Module Name</label>
          <input
            type="text"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
            placeholder="e.g. Introduction to Flutter"
            className="mt-2 w-full rounded-md bg-gray-800 px-3 py-2 outline outline-1 outline-gray-700 focus:outline-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Module Description</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this module is about..."
            className="mt-2 w-full rounded-md bg-gray-800 px-3 py-2 outline outline-1 outline-gray-700 focus:outline-indigo-500"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="mt-2 block w-full text-sm text-gray-400"
          />
          {coverPreview && (
            <img
              src={coverPreview}
              alt="Cover Preview"
              className="mt-2 max-h-40 rounded-md object-cover"
            />
          )}
        </div>

        {/* Skills with Autocomplete */}
        <div className="relative">
          <label className="block text-sm font-medium">Skills you’ll gain</label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Type a skill..."
              className="flex-1 rounded-md bg-gray-800 px-3 py-2 outline outline-1 outline-gray-700 focus:outline-indigo-500"
            />
            <button
              type="button"
              onClick={() => addSkill()}
              className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold"
            >
              Add
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {skillInput && (
            <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md bg-gray-800 shadow-lg">
              {availableSkills
                .filter(
                  (skill) =>
                    skill.toLowerCase().includes(skillInput.toLowerCase()) &&
                    !skills.includes(skill)
                )
                .map((skill) => {
                  const index = skill
                    .toLowerCase()
                    .indexOf(skillInput.toLowerCase());
                  const beforeMatch = skill.slice(0, index);
                  const match = skill.slice(index, index + skillInput.length);
                  const afterMatch = skill.slice(index + skillInput.length);

                  return (
                    <li
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className="cursor-pointer px-3 py-2 hover:bg-indigo-500/30"
                    >
                      {beforeMatch}
                      <span className="font-semibold text-indigo-300">{match}</span>
                      {afterMatch}
                    </li>
                  );
                })}
            </ul>
          )}

          {/* Selected Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium">Visibility</label>
          <div className="mt-3 flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={visibility === "public"}
                onChange={() => setVisibility("public")}
              />
              Public
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={visibility === "private"}
                onChange={() => setVisibility("private")}
              />
              Private
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="text-sm text-gray-400"
            onClick={() => {
              setModuleName("");
              setDescription("");
              setSkills([]);
              setSkillInput("");
              setVisibility("public");
              setCoverFile(null);
              setCoverPreview(null);
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-indigo-500 px-6 py-2 text-sm font-semibold"
          >
            Create Module
          </button>
        </div>
      </form>
    </div>
  );
}
