"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "../../services/authService";
import { API_BASE_URL } from "@/app/config/api";
import { Sparkles, Compass, GraduationCap, BarChart3 } from "lucide-react";

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
  const [publicModules, setPublicModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAllPublic, setShowAllPublic] = useState(false);

  // Coursera-style grid limit for clean layout composition
  const PUBLIC_LIMIT = 8;

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchModules = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/modules/user/${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch user modules");
        const data = await res.json();
        setModules(data);
      } catch (error) {
        console.error("Workspace initialization error:", error);
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
        if (!res.ok) throw new Error("Failed to fetch global curricula");
        const data = await res.json();
        setPublicModules(data);
      } catch (error) {
        console.error("Global directory fetch error:", error);
      }
    };

    fetchPublicModules();
  }, []);

  const displayedPublicModules = showAllPublic
    ? publicModules
    : publicModules.slice(0, PUBLIC_LIMIT);

  return (
    <div className="bg-white text-gray-900 min-h-screen font-sans antialiased">

      {/* COURSERA-INSPIRED HERO SECTION */}
      <section className="relative bg-gradient-to-br from-blue-50/60 via-white to-transparent border-b border-gray-100">
        <div className="py-16 px-4 mx-auto max-w-7xl lg:py-24 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-gray-900 text-xs font-semibold tracking-wide">
              <span className="bg-gray-900 text-white rounded-full px-2 py-0.5 scale-95 font-bold">NEW</span>
              EduMate Hub v2.0: AI-Powered Academic Ecosystem
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
              Learn without limits. <br />
              <span className="text-gray-900 font-bold">Build without boundaries.</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl font-normal leading-relaxed">
              EduMate bridges foundational curriculum design, structured digital learning resources,
              automated diagnostic evaluations, and custom growth analytics into one elite system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="#directory"
                className="inline-flex justify-center items-center py-3.5 px-6 text-base font-semibold text-white rounded-md bg-gray-600 hover:bg-gray-900 transition-colors shadow-sm"
              >
                Explore Curricula
              </Link>
              <Link
                href="/pages/create_chanel"
                className="inline-flex justify-center items-center py-3.5 px-6 text-base font-semibold text-gray-700 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                Create Studio Hub
              </Link>
            </div>

            {/* Micro Branding Logotypes Accent */}
            <div className="pt-8 border-t border-gray-100 flex flex-wrap items-center gap-6 text-xs text-gray-400 font-medium">
              <span className="uppercase tracking-widest text-gray-500 font-bold">TRUSTED INFRASTRUCTURE:</span>
              <span>Next.js Architecture</span>
              <span>•</span>
              <span>REST & SOAP Services</span>
              <span>•</span>
              <span>AI Diagnostics</span>
            </div>
          </div>

          {/* Right Hero Feature Graphic Card */}
          <div className="lg:col-span-5 hidden lg:block relative">
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200/80 shadow-sm relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold">EM</div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">EduMate Advanced Learning</h4>
                  <p className="text-xs text-gray-400">Adaptive Workspace Console</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-3/4 bg-gray-200 rounded" />
                <div className="h-2 w-full bg-gray-200 rounded" />
                <div className="h-2 w-5/6 bg-gray-200 rounded" />
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <div className="text-lg font-bold text-gray-900">98%</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Retention</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-gray-100">
                  <div className="text-lg font-bold text-gray-900">Adaptive</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">AI Logic</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-blue-100/60 rounded-full blur-2xl z-0" />
          </div>

        </div>
      </section>

      {/* INSTITUTIONAL PILLARS / VALUE PROPOSITIONS */}
      <section className="py-12 bg-gray-50/60 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-gray-900 rounded-lg flex items-center justify-center font-bold">01</div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Resource Repositories</h3>
              <p className="text-sm text-gray-500 mt-1">Access structured learning notes, documentation matrices, and contextual study tools on-demand.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-gray-900 rounded-lg flex items-center justify-center font-bold">02</div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">AI Assisted Diagnostics</h3>
              <p className="text-sm text-gray-500 mt-1">Dynamic test pathways provide predictive analytical evaluations mapping user growth points instantly.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-gray-900 rounded-lg flex items-center justify-center font-bold">03</div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Institutional Management</h3>
              <p className="text-sm text-gray-500 mt-1">Reduces mechanical operations for dynamic educators via centralized control schemas and portal tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD USER OWNED MODULE WORKSPACE */}
      {user && (
        <section className="max-w-7xl mx-auto px-4 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Your Active Workspace</h2>
              <p className="text-sm text-gray-500 mt-1">Manage and build operational course syllabi mapped directly to your instructor ID.</p>
            </div>
            <Link
              href="/pages/modulecreation"
              className="mt-3 sm:mt-0 text-xs font-bold text-gray-900 hover:text-gray-900 bg-blue-50 border border-blue-200/50 px-3 py-2 rounded"
            >
              + Launch New Module Nodes
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 font-medium animate-pulse">
              Synthesizing learning environment registry...
            </div>
          ) : modules.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-12 text-center max-w-xl mx-auto">
              <h4 className="text-sm font-bold text-gray-800">Workspace Directory Empty</h4>
              <p className="text-xs text-gray-500 mt-1">You haven&apos;t initialized any specific curricula structures yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {modules.map((module) => (
                <div
                  key={module.module_id}
                  className="group bg-white border border-gray-200/80 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  <div className="h-44 w-full relative overflow-hidden bg-gray-100 border-b border-gray-100">
                    <img
                      className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                      src={
                        module.cover_image
                          ? `data:image/png;base64,${module.cover_image}`
                          : "/images/Tree life-rafiki.png"
                      }
                      alt={module.name}
                    />
                    <span className="absolute top-3 left-3 bg-gray-900 text-[10px] tracking-wider uppercase font-extrabold text-white px-2 py-0.5 rounded shadow-sm">
                      Workspace Node
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed flex-grow">
                      {module.description || "No core description parameters detailed for this environment hub."}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link
                        href={`/enrolle/${module.module_id}`}
                        className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        Launch Portal Console <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* MAIN PUBLIC DIRECTORY (COURSERA SHELF FORMAT) */}
      <section id="directory" className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Explore Open Curriculum Directory</h2>
            <p className="text-sm text-gray-500 mt-1">Browse through public, open-access modules crafted across verified EdTech verticals.</p>
          </div>
          <span className="text-xs text-gray-400 font-medium mt-1 sm:mt-0">
            Rendered: {displayedPublicModules.length} / {publicModules.length} Modules Available
          </span>
        </div>

        {publicModules.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm font-medium">No open source directories have been indexed yet.</p>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayedPublicModules.map((module) => (
                <div
                  key={module.module_id}
                  className="group bg-white border border-gray-200 hover:border-gray-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  <div className="h-40 w-full relative overflow-hidden bg-gray-50 border-b border-gray-100">
                    <img
                      className="h-full w-full object-cover"
                      src={
                        module.cover_image
                          ? `data:image/png;base64,${module.cover_image}`
                          : "/images/Tree life-rafiki.png"
                      }
                      alt={module.name}
                    />
                    <span className="absolute top-3 left-3 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded shadow-sm">
                      Public Access
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-base font-bold text-gray-900 tracking-tight line-clamp-1">
                      {module.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed flex-grow">
                      {module.description || "Open module resource with structured testing components ready."}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link
                        href={`/enrolle/${module.module_id}`}
                        className="inline-flex justify-center items-center w-full py-2 px-4 text-xs font-bold text-center text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                      >
                        Enroll & Begin Path
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* EXPAND/COLLAPSE CONTROL SHELF */}
            {publicModules.length > PUBLIC_LIMIT && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setShowAllPublic(!showAllPublic)}
                  className="inline-flex items-center px-6 py-2.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-sm transition-all"
                >
                  {showAllPublic ? (
                    <>
                      Show Fewer Modules
                      <svg className="ml-2 w-4 h-4 transform rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      View All Modules ({publicModules.length - PUBLIC_LIMIT} more)
                      <svg className="ml-2 w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>
      {/* ── NAV STRIP ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            Edu<span className="text-indigo-600">Mate</span>
          </span>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {/* Large indigo geometric accent — the signature element */}
        <div
          aria-hidden
          className="absolute right-0 top-0 w-[55%] h-full bg-indigo-50 [clip-path:polygon(12%_0%,100%_0%,100%_100%,0%_100%)] pointer-events-none"
        />
        {/* Dot-grid texture on the indigo panel */}
        <div
          aria-hidden
          className="absolute right-0 top-0 w-[55%] h-full opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #818cf8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            clipPath: "polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-36 grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT — copy */}
          <div>
            <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-indigo-600 mb-5">
              Learning Management System
            </span>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-slate-900 mb-6">
              Smart paths for{" "}
              <em className="not-italic text-indigo-600">every</em>{" "}
              learner.
            </h1>
            <p className="text-base text-slate-500 leading-relaxed max-w-md mb-10">
              EduMate unifies digital assessments, structured curricula, and AI-powered insights so students and educators move forward together.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/subscription"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all"
              >
                Take Plane
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* RIGHT — floating stats card */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200 p-8 w-full max-w-sm border border-slate-100">
              {/* accent corner */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-600 rounded-2xl rotate-12" />

              <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-6">
                Platform at a glance
              </p>

              <div className="space-y-5">
                {[
                  {
                    label: "AI-Powered Study Paths",
                    icon: Sparkles,
                    color: "text-indigo-600"
                  },
                  {
                    label: "Centralized Syllabus Hub",
                    icon: Compass,
                    color: "text-violet-500"
                  },
                  {
                    label: "Interactive Assessments",
                    icon: GraduationCap,
                    color: "text-sky-500"
                  },
                  {
                    label: "Real-Time Progress Tracking",
                    icon: BarChart3,
                    color: "text-emerald-500"
                  },
                ].map((item) => {
                  // 1. Assign the component reference to a Capitalized variable name
                  const IconComponent = item.icon;

                  return (
                    <div key={item.label} className="flex items-center gap-4">
                      {/* 2. Render it as a proper JSX element component tag */}
                      <span className={`${item.color} w-6 flex-shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </span>
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Trusted by educators worldwide</span>
                <div className="flex -space-x-2">
                  {["bg-indigo-400", "bg-violet-400", "bg-sky-400", "bg-emerald-400"].map((c, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full border-2 border-white ${c}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default HomePage;