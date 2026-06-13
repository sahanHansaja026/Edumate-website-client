"use client";

import { API_BASE_URL } from "@/app/config/api";
import { getUser } from "@/app/services/authService";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

  useEffect(() => {
    setUser(getUser());
  }, []);

  // Fetch module
  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/modules/${id}`);
        const data = await res.json();

        setModuleName(data.name || "");
        setDescription(data.description || "");

        // FIX: safe skills handling
        setSkills(
          typeof data.skills === "string"
            ? JSON.parse(data.skills)
            : data.skills || []
        );

        setVisibility(data.visibility || "public");

        // FIX: base64 image handling
        setCoverPreview(
          data.cover_image
            ? `data:image/png;base64,${data.cover_image}`
            : "/images/Tree life-rafiki.png"
        );
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchModule();
  }, [id]);

  // Add skill
  const addSkill = (skill?: string) => {
    const newSkill = skill || skillInput.trim();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setSkillInput("");
    }
  };

  // Remove skill
  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Image change
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return alert("User not found");

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

      if (!res.ok) throw new Error("Update failed");

      alert("Module updated successfully");
      router.push("/modules");
    } catch (err) {
      console.error(err);
      alert("Error updating module");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading module...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl space-y-10 text-gray-200"
      >
        {/* HEADER */}
        <div>
          <h2 className="text-2xl font-bold text-white">Edit Module</h2>
          <p className="text-sm text-gray-400">
            Update your learning module details
          </p>
        </div>

        {/* NAME */}
        <div>
          <label className="text-sm">Module Name</label>
          <input
            className="mt-2 w-full bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm">Description</label>
          <textarea
            rows={4}
            className="mt-2 w-full bg-gray-800 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* IMAGE */}
        {/* IMAGE */}
        <div>
          <label className="text-sm">Cover Image</label>

          <input
            type="file"
            onChange={handleCoverChange}
            className="mt-2 block w-full text-sm"
          />

          {coverPreview && (
            <img
              src={coverPreview}
              className="mt-3 w-full h-52 object-cover rounded-xl"
              alt="cover"
            />
          )}
        </div>

        {/* SKILLS */}
        <div>
          <label className="text-sm">Skills</label>

          <div className="flex gap-2 mt-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="flex-1 bg-gray-800 p-2 rounded-lg"
              placeholder="Add skill"
            />
            <button
              type="button"
              onClick={() => addSkill()}
              className="bg-indigo-500 px-4 rounded-lg"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-indigo-500/20 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                #{skill}
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

        {/* VISIBILITY */}
        <div>
          <label className="text-sm">Visibility</label>

          <div className="flex gap-6 mt-3">
            <label>
              <input
                type="radio"
                checked={visibility === "public"}
                onChange={() => setVisibility("public")}
              />{" "}
              Public
            </label>

            <label>
              <input
                type="radio"
                checked={visibility === "private"}
                onChange={() => setVisibility("private")}
              />{" "}
              Private
            </label>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/modules")}
            className="text-gray-400"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-indigo-500 px-6 py-2 rounded-lg font-semibold"
          >
            Update Module
          </button>
        </div>
      </form>
    </div>
  );
}