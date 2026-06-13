"use client";

import { useEffect, useState } from "react";
import { getUser } from "../../services/authService";
import { API_BASE_URL } from "@/app/config/api";

type Module = {
  module_id: number;
  name: string;
  description?: string;
  skills: string[];
  cover_image?: string;
  cover_image_name?: string;
};

const HomePage = () => {
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [publicModules, setPublicModules] = useState<Module[]>([]);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchModules = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/modules/user/${user.id}`
        );

        if (!res.ok) throw new Error("Failed to fetch modules");

        const data = await res.json();
        setModules(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [user]);
  useEffect(() => {
    const fetchPublicModules = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/modules/public`);

        if (!res.ok) throw new Error("Failed to fetch public modules");

        const data = await res.json();
        setPublicModules(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPublicModules();
  }, []);

  return (
    <>
      <section className="bg-gray-900 dark:bg-gray-900">
        <div className="py-8 px-4 mx-auto max-w-7xl text-center lg:py-16 lg:px-12">
          <a
            href="#"
            role="alert"
            className="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-100 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <span className="text-xs bg-primary-600 rounded-full text-white px-4 py-1.5 mr-3">
              New
            </span>
            <span className="text-sm font-medium">
              ModuleMate is Live! Build, Manage, Learn
            </span>
            <svg
              className="ml-2 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              />
            </svg>
          </a>

          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-100 md:text-5xl lg:text-6xl dark:text-white">
            We invest in learners, creators, and the world’s potential
          </h1>

          <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
            At ModuleMate, we focus on learning experiences where technology and
            innovation unlock long-term value and drive sustainable growth.
          </p>

          <div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <a
              href="#"
              className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
            >
              Learn more
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                />
              </svg>
            </a>

            <a
              href="/pages/create_chanel"
              className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-gray-100 rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
            >
              Create Chanel
            </a>
          </div>
        </div>
      </section>
      {/* MODULES SECTION */}
      <div className="max-w-7xl mx-auto px-4 mt-10">

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Your Modules
        </h2>

        {loading ? (
          <p className="text-gray-400">Loading modules...</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modules.map((module) => (
              <div
                key={module.module_id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300"
              >
                <a href={`/enrolle/${module.module_id}`}>
                  <img
                    className="h-40 w-full object-cover hover:scale-105 transition duration-300"
                    src={
                      module.cover_image
                        ? `data:image/png;base64,${module.cover_image}`
                        : "/images/Tree life-rafiki.png"
                    }
                    alt="Module cover"
                  />
                </a>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white line-clamp-1">
                    {module.name}
                  </h3>

                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                    {module.description || "No description available."}
                  </p>

                  <a
                    href={`/enrolle/${module.module_id}`}
                    className="inline-flex items-center mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Open Module →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DIVIDER */}
      <div className="max-w-7xl mx-auto px-4 my-10">
        <div className="border-t border-gray-800" />
      </div>

      {/* PUBLIC MODULES */}
      <div className="max-w-7xl mx-auto px-4 pb-16">

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Explore Public Modules
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {publicModules.map((module) => (
            <div
              key={module.module_id}
              className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow hover:scale-[1.02] transition duration-300"
            >
              <a href={`/enrolle/${module.module_id}`}>
                <img
                  className="h-40 w-full object-cover"
                  src={
                    module.cover_image
                      ? `data:image/png;base64,${module.cover_image}`
                      : "/images/Tree life-rafiki.png"
                  }
                  alt="Module cover"
                />
              </a>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-white line-clamp-1">
                  {module.name}
                </h3>

                <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                  {module.description || "No description available."}
                </p>

                <a
                  href={`/enrolle/${module.module_id}`}
                  className="inline-block mt-4 text-green-400 hover:text-green-300 text-sm font-medium"
                >
                  Explore →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </>
  );
};

export default HomePage;
