import React, { useState } from "react";

const Footer = () => {
  const [comment, setComment] = useState("");
  const [commentsList, setCommentsList] = useState([
    { user: "Guest_3012", text: "Are the advanced backend courses completely up to date for 2026?" },
    { user: "Admin", text: "Yes, all syllabi have been refreshed this quarter!" }
  ]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setCommentsList([
      ...commentsList,
      { user: "You", text: comment }
    ]);
    setComment("");
  };

  return (
    <footer className="w-full text-slate-600 bg-gray-300 pt-16 text-sm font-sans selection:bg-slate-900 selection:text-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12">

        {/* Column 1: Brand & Core Identity */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Baniya's <span className="text-slate-500 font-medium">Code Universe</span>
            </h1>
            <p className="text-slate-500 mt-4 leading-relaxed max-w-sm">
              Enterprise software development, full-stack LMS modules, and highly optimized web components built for modern deployment pipelines.
            </p>
          </div>
        </div>

        {/* Column 2: Ecosystem & Company Navigation */}
        <div className="lg:col-span-3 sm:grid sm:grid-cols-2 lg:block space-y-6 sm:space-y-0 lg:space-y-6">
          <div>
            <h2 className="font-semibold tracking-wider uppercase text-xs text-slate-900 mb-4">Products</h2>
            <div className="flex flex-col space-y-3">
              <a className="hover:text-slate-900 transition-colors" href="#">LMS Framework</a>
              <a className="hover:text-slate-900 transition-colors" href="#">Prebuilt Components</a>
              <a className="hover:text-slate-900 transition-colors" href="#">API Gateways</a>
            </div>
          </div>
          <div className="mt-6 sm:mt-0 lg:mt-6">
            <h2 className="font-semibold tracking-wider uppercase text-xs text-slate-900 mb-4">Company</h2>
            <div className="flex flex-col space-y-3">
              <a className="hover:text-slate-900 transition-colors" href="#">About Us</a>
              <a className="hover:text-slate-900 transition-colors flex items-center gap-2" href="#">
                Careers
                <span className="text-[10px] tracking-wide font-bold uppercase text-white bg-slate-900 rounded px-1.5 py-0.5">
                  Hiring
                </span>
              </a>
              <a className="hover:text-slate-900 transition-colors" href="#">Contact</a>
            </div>
          </div>
        </div>

        {/* Column 3: Direct Component Interactivity (Comments) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="font-semibold tracking-wider uppercase text-xs text-slate-900 mb-3">
              Platform Live Q&A
            </h2>

            {/* Live Message Thread */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
              {commentsList.map((c, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${c.user === 'Admin' ? 'text-slate-900' : 'text-slate-500'}`}>
                      {c.user}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs">{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* New Comment Submission Input */}
          <form onSubmit={handleCommentSubmit} className="mt-2">
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 focus-within:bg-white focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5 transition-all">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ask a technical question or post an issue..."
                className="bg-transparent text-slate-900 placeholder-slate-400 outline-none w-full px-3 text-xs"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-sm shrink-0"
              >
                Send
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Corporate Line */}
      <div className="border-t border-slate-100 bg-slate-50/50 py-6">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            Copyright 2026 ©{" "}
            <a href="#" className="font-semibold text-slate-700 hover:text-slate-900 transition-colors">
              Baniya's Code Universe
            </a>
            . All Rights Reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;