"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Script from "next/script"; // Next.js script optimization component
import {
    BookOpen,
    Users,
    Lock,
    Globe,
    BarChart2,
    Video,
    CheckCircle,
    Layers,
    ArrowRight,
    GraduationCap,
    Building2,
    Sparkles,
    Send,
} from "lucide-react";

// ─── REPLACE WITH YOUR ADSENSE CLIENT ID ─────────────────────────────────────
const ADSENSE_CLIENT_ID = "ca-pub-XXXXXXXXXXXXXXXX";

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
    {
        icon: <Lock className="w-6 h-6" />,
        title: "Access Control",
        desc: "Channel admins decide exactly who sees what — modules, quizzes, and assignments stay private until you grant permission.",
    },
    {
        icon: <BookOpen className="w-6 h-6" />,
        title: "Structured Modules",
        desc: "Organize learning into focused modules with assignments, quizzes, and rich content — all in one place.",
    },
    {
        icon: <Globe className="w-6 h-6" />,
        title: "Open Public Courses",
        desc: "Anyone can publish a module for the world to discover. No gatekeeping — just knowledge shared freely.",
    },
    {
        icon: <Video className="w-6 h-6" />,
        title: "Live Sessions",
        desc: "Conduct real-time classes and meetings directly within your channel. No third-party tools needed.",
    },
    {
        icon: <BarChart2 className="w-6 h-6" />,
        title: "Real-Time Tracking",
        desc: "Monitor submissions, quiz results, and student activity as it happens — not days later.",
    },
    {
        icon: <Users className="w-6 h-6" />,
        title: "Student Management",
        desc: "Invite, grant access, and track cohorts of students with a simple, visual interface.",
    },
];

const models = [
    {
        icon: <Building2 className="w-8 h-8 text-blue-600" />,
        label: "For Institutions & Teachers",
        title: "Channel-Based Learning",
        desc: "Create a private digital classroom for your school, academy, or organization. Control enrollment, manage content, and track every student — all within a secure channel.",
        bullets: [
            "Invite-only access control",
            "Assignments & graded quizzes",
            "Live sessions built-in",
            "Real-time performance analytics",
        ],
        img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
        imgAlt: "A university lecturer presenting to students in a modern classroom, representing institutional channel-based learning on EduMate",
        reverse: false,
    },
    {
        icon: <Globe className="w-8 h-8 text-emerald-600" />,
        label: "For Everyone",
        title: "Public Module System",
        desc: "Share your expertise without barriers. Create a module, publish it, and let any learner in the world enroll — no approvals, no friction, just open education.",
        bullets: [
            "Free for all learners",
            "Self-paced content",
            "No access restrictions",
            "Instant enrollment",
        ],
        img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
        imgAlt: "Diverse group of people studying together on laptops in a bright open space, representing open public learning on EduMate",
        reverse: true,
    },
];

const stats = [
    { value: "2", label: "Learning Models" },
    { value: "∞", label: "Public Modules" },
    { value: "100%", label: "Free for Students" },
    { value: "1", label: "Unified Platform" },
];

const platformLayers = [
    { icon: <Layers className="w-5 h-5" />, name: "Channel", color: "bg-blue-100 text-blue-700" },
    { icon: <BookOpen className="w-5 h-5" />, name: "Modules", color: "bg-violet-100 text-violet-700" },
    { icon: <CheckCircle className="w-5 h-5" />, name: "Assignments & Quizzes", color: "bg-amber-100 text-amber-700" },
    { icon: <Users className="w-5 h-5" />, name: "Student Access", color: "bg-emerald-100 text-emerald-700" },
];

// ─── Ad Component ───────────────────────────────────────────────────────────
function AdSlot({ adSlotId, style }: { adSlotId: string; style?: React.CSSProperties }) {
    useEffect(() => {
        try {
            // Push the advertisement container into the Google script initializer stack
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense initialization layout block error: ", err);
        }
    }, []);

    return (
        <div className="w-full flex justify-center my-8 mx-auto overflow-hidden clear-both max-w-5xl px-6">
            <div className="bg-slate-50 border border-dashed border-slate-200 p-2 rounded-xl w-full min-h-[90px] text-center flex flex-col justify-center items-center">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">Advertisement</span>
                <ins
                    className="adsbygoogle"
                    style={style || { display: "block", width: "100%", minWidth: "250px" }}
                    data-ad-client={ADSENSE_CLIENT_ID}
                    data-ad-slot={adSlotId}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                />
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
    // Form State management
    const [role, setRole] = useState<"teacher" | "student">("teacher");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        organization: "",
        interest: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitted Data: ", { role, ...formData });
        setIsSubmitted(true);
    };

    return (
        <main className="bg-white text-slate-900 antialiased overflow-x-hidden">
            {/* Google AdSense Script Integration */}
            <Script
                id="adsense-init"
                async
                src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
                crossOrigin="anonymous"
                strategy="afterInteractive"
            />

            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center overflow-hidden">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage:
                            "linear-gradient(to bottom, #EFF6FF 0%, #ffffff 60%)",
                    }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-30"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 60% 20%, #BFDBFE 0%, transparent 55%), radial-gradient(circle at 20% 80%, #DDD6FE 0%, transparent 50%)",
                    }}
                />

                <div className="relative z-10 max-w-4xl mx-auto">
                    <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-600 mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        Built by Baniya Technologies
                    </span>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-slate-900 mb-6">
                        Education,{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                            reimagined
                        </span>
                        .
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
                        EduMate connects institutions, educators, and students in one
                        unified platform — with structured channel-based classrooms for
                        organisations and open modules for the world.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="#models"
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                        >
                            Explore the platform <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                            href="#join-form"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors"
                        >
                            Join as Teacher / Student
                        </a>
                    </div>
                </div>

                {/* Hero image */}
                <div className="relative z-10 mt-16 w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
                    <img
                        src="https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=1400&q=80"
                        alt="Students engaging with digital learning content on laptops and tablets in a bright modern classroom, representing the EduMate platform experience"
                        width={1400}
                        height={700}
                        className="w-full h-64 sm:h-96 object-cover rounded-2xl"
                        loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                </div>
            </section>

            {/* ── Ad Slot Placement 1: Top Responsive Banner ───────────────────── */}
            <AdSlot adSlotId="1234567890" style={{ display: 'block', height: '90px' }} />

            {/* ── Stats bar ─────────────────────────────────────────────────────── */}
            <section className="border-y border-slate-100 bg-slate-50">
                <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
                    {stats.map((s) => (
                        <div key={s.label}>
                            <p className="text-4xl font-extrabold text-blue-600">{s.value}</p>
                            <p className="mt-1 text-sm text-slate-500 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Mission ───────────────────────────────────────────────────────── */}
            <section id="mission" className="max-w-5xl mx-auto px-6 py-24">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                            Our Mission
                        </span>
                        <h2 className="mt-3 text-4xl font-extrabold leading-tight text-slate-900">
                            Simplify learning. <br /> Scale knowledge.
                        </h2>
                        <p className="mt-5 text-slate-500 leading-relaxed">
                            Traditional learning platforms are either too rigid for open
                            education or too chaotic for institutions that need structure and
                            control. EduMate does both — giving every educator the tools they
                            need, without the bloat they don't.
                        </p>
                        <p className="mt-4 text-slate-500 leading-relaxed">
                            We believe quality education should be accessible to every learner
                            on the planet, while institutions deserve a secure, professional
                            environment to deliver it. EduMate is that bridge.
                        </p>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden shadow-xl">
                        <Image
                            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80"
                            alt="A diverse group of students collaborating around a table with laptops, symbolising EduMate's mission to make learning accessible and collaborative"
                            width={800}
                            height={560}
                            className="w-full h-72 lg:h-96 object-cover"
                            unoptimized
                        />
                    </div>
                </div>
            </section>

            {/* ── Two models ────────────────────────────────────────────────────── */}
            <section
                id="models"
                className="bg-slate-50 border-y border-slate-100 py-24"
            >
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                            How It Works
                        </span>
                        <h2 className="mt-3 text-4xl font-extrabold text-slate-900">
                            Two ways to learn
                        </h2>
                        <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                            Whether you run an institution or just want to share what you
                            know, EduMate has a model built for you.
                        </p>
                    </div>

                    <div className="space-y-20">
                        {models.map((m) => (
                            <div
                                key={m.title}
                                className={`flex flex-col ${m.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
                                    } gap-10 items-center`}
                            >
                                {/* Image */}
                                <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                                    <Image
                                        src={m.img}
                                        alt={m.imgAlt}
                                        width={800}
                                        height={500}
                                        className="w-full h-64 lg:h-80 object-cover"
                                        unoptimized
                                    />
                                </div>

                                {/* Content */}
                                <div className="w-full lg:w-1/2">
                                    <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-100 px-4 py-2 shadow-sm mb-4">
                                        {m.icon}
                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                            {m.label}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-slate-900 mb-3">
                                        {m.title}
                                    </h3>
                                    <p className="text-slate-500 leading-relaxed mb-5">{m.desc}</p>
                                    <ul className="space-y-2.5">
                                        {m.bullets.map((b) => (
                                            <li key={b} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                                                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Platform Structure ────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-6 py-24">
                <div className="text-center mb-14">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                        Platform Structure
                    </span>
                    <h2 className="mt-3 text-4xl font-extrabold text-slate-900">
                        Everything stacks neatly
                    </h2>
                    <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                        EduMate's hierarchy keeps content organised and access controlled at
                        every layer.
                    </p>
                </div>

                {/* Connected flow */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
                    {platformLayers.map((layer, i) => (
                        <div key={layer.name} className="flex items-center gap-3">
                            <div
                                className={`flex items-center gap-2.5 rounded-xl px-5 py-3 font-semibold text-sm shadow-sm ${layer.color}`}
                            >
                                {layer.icon}
                                {layer.name}
                            </div>
                            {i < platformLayers.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block flex-shrink-0" />
                            )}
                        </div>
                    ))}
                </div>

                <p className="text-center text-xs text-slate-400 mt-4">
                    Channel → Modules → Assessments → Students
                </p>
            </section>

            {/* ── Ad Slot Placement 2: Mid Page Content Dynamic Ad ──────────────── */}
            <AdSlot adSlotId="0987654321" />

            {/* ── Features Grid ─────────────────────────────────────────────────── */}
            <section className="bg-slate-50 border-y border-slate-100 py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                            Features
                        </span>
                        <h2 className="mt-3 text-4xl font-extrabold text-slate-900">
                            Built for every role
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                    {f.icon}
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1.5">{f.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── For Students ──────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-6 py-24">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="relative rounded-2xl overflow-hidden shadow-xl order-2 lg:order-1">
                        <Image
                            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"
                            alt="A student studying independently on a laptop in a bright café, representing EduMate's self-paced and free learning experience for students"
                            width={800}
                            height={560}
                            className="w-full h-72 lg:h-96 object-cover"
                            unoptimized
                        />
                    </div>

                    <div className="order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 mb-4">
                            <GraduationCap className="w-5 h-5 text-emerald-600" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                                For Students
                            </span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                            Always free. <br /> Always yours.
                        </h2>
                        <p className="text-slate-500 leading-relaxed mb-5">
                            EduMate is completely free for learners. Enrol in any public
                            module instantly, or join a channel your institution has invited
                            you to — and track every bit of your progress along the way.
                        </p>
                        <ul className="space-y-2.5">
                            {[
                                "Enrol in public modules freely",
                                "Track quiz scores & submissions",
                                "Access institution-assigned content",
                                "Learn at your own pace",
                            ].map((b) => (
                                <li key={b} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ── Dynamic Intake Form ────────────────────────────────────────── */}
            <section id="join-form" className="bg-slate-50 border-y border-slate-100 py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                            Get Started
                        </span>
                        <h2 className="mt-3 text-4xl font-extrabold text-slate-900">
                            Join the EduMate ecosystem
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Submit your details below to get personalized access configurations.
                        </p>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm">
                        {isSubmitted ? (
                            <div className="text-center py-10 space-y-4">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <CheckCircle className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">Details Received!</h3>
                                <p className="text-slate-500 max-w-md mx-auto text-sm">
                                    Thank you for registering interest. Our platform team will evaluate your onboarding configuration profile shortly.
                                </p>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline pt-2"
                                >
                                    Submit another response
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                {/* Role Custom Toggle Switch */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                        Registering as a:
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60">
                                        <button
                                            type="button"
                                            onClick={() => setRole("teacher")}
                                            className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all ${role === "teacher" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                                        >
                                            <Building2 className="w-4 h-4" /> Institution / Teacher
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setRole("student")}
                                            className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-all ${role === "student" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                                        >
                                            <GraduationCap className="w-4 h-4" /> Student / Learner
                                        </button>
                                    </div>
                                </div>

                                {/* General Fields */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Professor Sahan"
                                            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-blue-600 bg-slate-50/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="name@domain.com"
                                            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-blue-600 bg-slate-50/50"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Fields depending on Role selection */}
                                {role === "teacher" && (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">School / Academy name</label>
                                        <input
                                            type="text"
                                            required={role === "teacher"}
                                            value={formData.organization}
                                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                            placeholder="e.g. Global Educational Institute"
                                            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-blue-600 bg-slate-50/50"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        {role === "teacher" ? "What modules or classes do you plan to host?" : "What areas of study are you looking to explore?"}
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.interest}
                                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                        placeholder={role === "teacher" ? "Briefly explain course structures or private channel goals..." : "e.g. Distributed architectures, self-paced programming modules..."}
                                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:border-blue-600 bg-slate-50/50 resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-100"
                                >
                                    Submit Application <Send className="w-4 h-4" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* ── About Baniya Technologies ─────────────────────────────────────── */}
            <section className="bg-slate-900 text-white py-24">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                                About the maker
                            </span>
                            <h2 className="mt-3 text-4xl font-extrabold leading-tight mb-5">
                                Baniya Technologies
                            </h2>
                            <p className="text-slate-400 leading-relaxed mb-4">
                                We are a software development company focused on building modern
                                digital solutions for education, productivity, and intelligent
                                systems. EduMate is our flagship product — built to transform
                                how education is delivered and managed in the digital era.
                            </p>
                            <p className="text-slate-400 leading-relaxed">
                                Our vision is a global learning ecosystem where education is
                                accessible, organised, interactive, and scalable for every
                                learner and institution on the planet.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                {["Accessible 🌍", "Organised 📚", "Interactive 🧠", "Scalable 🚀"].map(
                                    (tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-slate-700 bg-slate-800 px-4 py-1.5 text-sm text-slate-300"
                                        >
                                            {tag}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80"
                                alt="A software developer working on code for a modern application, representing the Baniya Technologies team building EduMate"
                                width={800}
                                height={560}
                                className="w-full h-72 lg:h-80 object-cover opacity-90"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────────────────── */}
            <section className="py-24 px-6 text-center bg-white">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
                        Ready to transform your classroom?
                    </h2>
                    <p className="text-slate-500 mb-10 leading-relaxed">
                        Join institutions and learners already using EduMate to build better
                        educational experiences.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="#join-form"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                        >
                            Get started for free <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                            href="#join-form"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-colors"
                        >
                            Contact us
                        </a>
                    </div>
                </div>
            </section>

        </main>
    );
}