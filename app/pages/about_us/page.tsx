"use client";

import { useEffect, useRef, useState } from "react";

// ─── Animated counter hook ───────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, start]);
    return count;
}

// ─── Intersection Observer hook ──────────────────────────────────────────────
function useInView(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
    const { ref, inView } = useInView();
    const count = useCounter(value, 1600, inView);
    return (
        <div ref={ref} className="flex flex-col items-center gap-1">
            <span className="text-4xl md:text-5xl font-black text-gray-900 tabular-nums tracking-tight">
                {count}{suffix}
            </span>
            <span className="text-sm text-gray-500 font-medium uppercase tracking-widest">{label}</span>
        </div>
    );
}

// ─── Feature pill ────────────────────────────────────────────────────────────
function FeaturePill({ icon, label }: { icon: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-sm font-medium shadow-sm hover:border-gray-400 hover:shadow-md transition-all duration-200">
            <span className="text-base">{icon}</span> {label}
        </span>
    );
}

// ─── Timeline item ───────────────────────────────────────────────────────────
function TimelineItem({
    year, title, desc, last,
}: { year: string; title: string; desc: string; last?: boolean }) {
    const { ref, inView } = useInView();
    return (
        <div
            ref={ref}
            className={`relative flex gap-6 transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
        >
            {/* spine */}
            <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-gray-900 ring-4 ring-white mt-1 shrink-0" />
                {!last && <div className="w-px flex-1 bg-gray-200 mt-1" />}
            </div>
            <div className="pb-10">
                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">{year}</span>
                <h4 className="text-lg font-bold text-gray-900 mt-0.5">{title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed mt-1">{desc}</p>
            </div>
        </div>
    );
}

// ─── Social link ─────────────────────────────────────────────────────────────
function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-5 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-200 shadow-sm"
        >
            <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
            {label}
        </a>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AboutPage() {
    const { ref: heroRef, inView: heroIn } = useInView(0.05);

    const features = [
        { icon: "🎓", label: "Teacher & Student Management" },
        { icon: "📚", label: "Public & Private Modules" },
        { icon: "🏫", label: "School Channels" },
        { icon: "🔒", label: "Private Course Access" },
        { icon: "🌐", label: "Open Learning for All" },
        { icon: "🤝", label: "Collaborative Environment" },
    ];

    return (
        <main className="min-h-screen bg-white text-gray-900 font-sans">
            {/* ── Nav ─────────────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                            <span className="text-white text-sm font-black">B</span>
                        </div>
                        <span className="font-bold text-gray-900 text-sm tracking-tight hidden sm:block">
                            Baniya&apos;s Code Universe
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                        {["Home", "Products", "Blog", "Contact"].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="px-3 py-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors font-medium"
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </nav>

            {/* ── Hero ────────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden">
                {/* subtle grid bg */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#111 1px,transparent 1px),linear-gradient(90deg,#111 1px,transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative">
                    <div
                        ref={heroRef}
                        className={`max-w-3xl transition-all duration-1000 ${heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                    >
                        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400 mb-6 border border-gray-200 px-3 py-1.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-900 inline-block" />
                            About Us
                        </span>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-gray-900">
                            Building the{" "}
                            <span className="relative inline-block">
                                future
                                <span className="absolute bottom-1 left-0 w-full h-2 bg-gray-200 -z-10 rounded" />
                            </span>{" "}
                            of digital education
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl">
                            Baniya&apos;s Code Universe is a one-person software studio on a mission to make
                            learning accessible, organised, and beautifully simple for teachers, students,
                            and institutions worldwide.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Stats bar ───────────────────────────────────────────────── */}
            <section className="border-y border-gray-100 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-gray-200">
                        <StatCard value={1} suffix="" label="Products launched" />
                        <StatCard value={1} suffix="" label="Passionate developer" />
                        <StatCard value={4} suffix="+" label="Platform features" />
                        <StatCard value={100} suffix="%" label="Open learning vision" />
                    </div>
                </div>
            </section>

            {/* ── Founder ─────────────────────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* avatar / visual */}
                    <div className="relative flex justify-center lg:justify-start">
                        <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                            {/* decorative rings */}
                            <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200 animate-[spin_20s_linear_infinite]" />
                            <div className="absolute inset-4 rounded-full border border-gray-100" />
                            {/* avatar */}
                            <div className="absolute inset-8 rounded-full bg-gray-900 flex items-center justify-center shadow-2xl">
                                <span className="text-white text-6xl font-black select-none">SH</span>
                            </div>
                            {/* floating badge */}
                            <div className="absolute -bottom-3 -right-3 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-lg">
                                <p className="text-xs text-gray-400 font-medium">Founder & Developer</p>
                                <p className="text-sm font-bold text-gray-900 mt-0.5">Sahan Hansaja</p>
                            </div>
                        </div>
                    </div>

                    {/* text */}
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                            A solo developer with a universe-sized vision
                        </h2>
                        <p className="mt-5 text-gray-500 leading-relaxed">
                            Hi — I&apos;m Sahan Hansaja, the founder, designer, and sole developer behind
                            Baniya&apos;s Code Universe. I started this initiative to build meaningful digital
                            products while sharing everything I learn with the wider developer community.
                        </p>
                        <p className="mt-4 text-gray-500 leading-relaxed">
                            My first product, <span className="font-semibold text-gray-900">EduMate</span>, is a
                            full-featured Learning Management System designed to connect teachers and students in
                            one collaborative space — something I believe every school and educator deserves
                            access to.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <SocialLink
                                href="mailto:hansajasahan50@gmail.com"
                                label="hansajasahan50@gmail.com"
                                icon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m2 7 10 7 10-7" />
                                    </svg>
                                }
                            />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                            <SocialLink
                                href="#"
                                label="YouTube"
                                icon={
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.2C4.6 3 3.3 3 2.2 4.2 1.3 5 1 7 1 7S.7 9.3.7 11.5v2.1c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.4 22.1 12 22.1 12 22.1s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2.1C23.3 9.3 23 7 23 7zm-13.6 8.9V8.1l8.1 3.9-8.1 3.9z" />
                                    </svg>
                                }
                            />
                            <SocialLink
                                href="#"
                                label="LinkedIn"
                                icon={
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                }
                            />
                            <SocialLink
                                href="#"
                                label="Medium"
                                icon={
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                                    </svg>
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── EduMate product spotlight ────────────────────────────────── */}
            <section className="bg-gray-900 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-gray-400 mb-5 border border-gray-700 px-3 py-1.5 rounded-full">
                                First Product
                            </span>
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                                Introducing{" "}
                                <span className="text-white underline decoration-gray-600 underline-offset-4">
                                    EduMate
                                </span>
                            </h2>
                            <p className="mt-5 text-gray-400 leading-relaxed text-lg">
                                An LMS that brings teachers, students, schools, and institutions together in one
                                seamless digital environment.
                            </p>
                            <p className="mt-4 text-gray-400 leading-relaxed">
                                Create public or private modules, build school channels, restrict or open
                                course access — EduMate gives educators total control while keeping the
                                learning experience clean and intuitive for students.
                            </p>
                            <a
                                href="#"
                                className="mt-8 inline-flex items-center gap-2 bg-white text-gray-900 font-bold text-sm px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Explore EduMate
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>

                        {/* feature pills */}
                        <div className="flex flex-wrap gap-3">
                            {features.map((f) => (
                                <span
                                    key={f.label}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-700 bg-gray-800 text-gray-300 text-sm font-medium hover:border-gray-400 hover:text-white transition-all duration-200"
                                >
                                    <span>{f.icon}</span> {f.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Mission & Vision ────────────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid sm:grid-cols-2 gap-8">
                    {/* Vision */}
                    <div className="group rounded-3xl border border-gray-100 bg-white p-8 sm:p-10 hover:border-gray-900 hover:shadow-xl transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mb-6">
                            <span className="text-2xl">🔭</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-3">Our Vision</h3>
                        <p className="text-gray-500 leading-relaxed">
                            To make digital education more accessible, organised, and collaborative by providing a
                            flexible platform for teachers, students, schools, and educational institutions — no
                            matter where they are.
                        </p>
                    </div>

                    {/* Mission */}
                    <div className="group rounded-3xl border border-gray-100 bg-white p-8 sm:p-10 hover:border-gray-900 hover:shadow-xl transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mb-6">
                            <span className="text-2xl">🚀</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-3">Our Mission</h3>
                        <p className="text-gray-500 leading-relaxed">
                            To develop innovative educational technology solutions that improve teaching, learning,
                            and collaboration in modern education — and to share every lesson learned along the way
                            with the developer community.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Timeline ────────────────────────────────────────────────── */}
            <section className="bg-gray-50 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-14 tracking-tight">
                        Our journey so far
                    </h2>
                    <div className="max-w-xl">
                        <TimelineItem
                            year="2024"
                            title="Baniya's Code Universe founded"
                            desc="Sahan Hansaja launches the company as an independent software development initiative focused on modern web applications and educational platforms."
                        />
                        <TimelineItem
                            year="2024 – 2025"
                            title="EduMate enters development"
                            desc="Work begins on EduMate, a full-featured LMS designed to unify teachers, students, and institutions in a single digital environment."
                        />
                        <TimelineItem
                            year="2025"
                            title="Community & content presence"
                            desc="YouTube tutorials, LinkedIn company page, and Medium technical blog go live — sharing progress and knowledge with the developer community."
                            last
                        />
                    </div>
                </div>
            </section>

            {/* ── CTA ─────────────────────────────────────────────────────── */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                    Want to connect or collaborate?
                </h2>
                <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
                    Whether you have feedback on EduMate, a collaboration idea, or just want to say hi —
                    I&apos;d love to hear from you.
                </p>
                <a
                    href="mailto:hansajasahan50@gmail.com"
                    className="mt-8 inline-flex items-center gap-2 bg-gray-900 text-white font-bold text-sm px-8 py-4 rounded-2xl hover:bg-gray-700 transition-colors shadow-lg"
                >
                    Get in touch
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </a>
            </section>

            {/* ── Footer ──────────────────────────────────────────────────── */}
            <footer className="border-t border-gray-100 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center">
                            <span className="text-white text-xs font-black">B</span>
                        </div>
                        <span>Baniya&apos;s Code Universe</span>
                    </div>
                    <span>© {new Date().getFullYear()} Sahan Hansaja. All rights reserved.</span>
                </div>
            </footer>
        </main>
    );
}