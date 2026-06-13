"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUser } from "@/app/services/authService";
import { API_BASE_URL } from "@/app/config/api";

type ModuleType = {
  id: number;
  module_id: number;
  name: string;
  description: string;
  skills: string[];
  visibility: string;
  cover_image?: string | null;
  user_id: number;
};

export default function Enrolle() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [module, setModule] = useState<ModuleType | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // 1. Fetch current user data on mount
  useEffect(() => {
    setUser(getUser());
  }, []);

  // 2. Fetch module details based on URL parameters
  useEffect(() => {
    if (!id) return;

    const fetchModule = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/modules/${id}`);
        const data = await res.json();
        setModule(data);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchModule();
  }, [id]);

  // 3. Evaluate enrollment status and handle auto-redirection rules
  useEffect(() => {
    if (!user || !module) return;

    const checkEnrollmentAndRedirect = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/enrollments/user/${user.id}`);
        if (res.ok) {
          const enrollments = await res.json();

          // Verify if user is attached to this specific module instance
          const alreadyEnrolled = enrollments.some(
            (e: any) => e.module_id === module.module_id
          );

          setIsEnrolled(alreadyEnrolled);

          // REDIRECTION LOGIC:
          // Standard users bypass this page if enrolled. Owners are allowed to remain.
          if (alreadyEnrolled && user.id !== module.user_id) {
            router.push(`/moduleinside/${module.module_id}`);
            return;
          }
        }
      } catch (err) {
        console.error("Error checking enrollment status:", err);
      } finally {
        setLoading(false);
      }
    };

    checkEnrollmentAndRedirect();
  }, [user, module, router]);

  if (loading)
    return <div className="p-10 text-gray-600">Loading...</div>;

  if (!module)
    return <div className="p-10 text-red-500">Module not found</div>;

  // Handles the main CTA button action safely
  const enrollUser = async () => {
    // If the active user created this module, bypass backend duplication checks
    if (user?.id === module?.user_id) {
      window.location.href = `/moduleinside/${module.module_id}`;
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/enrollments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          module_id: module?.module_id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "Enrollment failed");
        return;
      }

      const data = await res.json();
      console.log("Enrolled successfully:", data);

      window.location.href = `/moduleinside/${module.module_id}`;

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="bg-white min-h-screen text-gray-900">

      {/* HERO SECTION */}
      <div className="bg-gray-50 border-b">
        <div className="px-6 md:px-20 py-10">

          <h1 className="text-4xl font-bold tracking-tight mb-3">
            {module.name}
          </h1>

          <p className="text-gray-600 mb-6">
            {module.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {module.skills?.map((k, i) => (
              <span
                key={i}
                className="bg-gray-200 text-gray-700 px-3 py-1 text-xs rounded-full"
              >
                {k}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="px-6 md:px-20 py-10 grid md:grid-cols-3 gap-10">

        {/* LEFT PANEL */}
        <div className="md:col-span-2 space-y-6">

          <img
            src={
              module.cover_image
                ? `data:image/png;base64,${module.cover_image}`
                : `http://127.0.0.1:8000/modules/${id}/image`
            }
            className="w-full h-72 object-contain bg-gray-100 rounded-xl border shadow-sm"
            alt={module.name}
          />

          {/* INFO CARD */}
          <div className="border rounded-xl p-6 shadow-sm bg-white">
            <h2 className="text-xl font-semibold mb-3">
              About this module
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {module.description}
            </p>
          </div>

          {/* METADATA TRACKERS */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="border rounded-lg p-4">
              <p className="text-gray-500">Module ID</p>
              <p className="font-semibold">{module.module_id}</p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="text-gray-500">Visibility</p>
              <p className="font-semibold capitalize">
                {module.visibility}
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR PANEL */}
        <div className="border rounded-xl p-6 shadow-sm h-fit sticky top-10 bg-white">

          <h3 className="text-lg font-semibold mb-2">
            {isEnrolled ? "You are enrolled!" : "Enroll in this module"}
          </h3>

          <p className="text-sm text-gray-500 mb-6">
            {isEnrolled
              ? "You have full access to this course's content."
              : "Get full access to lessons and resources."}
          </p>

          {user?.id === module.user_id && (
            <a href={`/pages/edit/moduleedit/${module.module_id}`}>
              <button className="w-full border border-gray-300 hover:bg-gray-100 text-gray-800 py-3 rounded-lg mb-3 transition">
                Edit Module
              </button>
            </a>
          )}

          <button
            onClick={enrollUser}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
          >
            {isEnrolled ? "Go to Module Content" : "Enroll Now"}
          </button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Free enrollment • Instant access
          </p>

        </div>

      </div>
    </div>
  );
}