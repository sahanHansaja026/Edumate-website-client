"use client";

import { saveUser } from "../../services/authService";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/config/api";

const LoginPage: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email,
          password,
          remember_me: rememberMe,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // ✅ SAVE TOKENS
      // SAVE TOKENS
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      // 🔥 FORCE SAFE USER SAVE
      const user = res.data.user;

      if (user && user.id && user.email) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: user.id,
            email: user.email,
          })
        );
      } else {
        console.error("Invalid user data from backend:", res.data);
      }

      // ✅ REDIRECT
      router.push("/pages/home");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[700px] w-full bg-white">
      {/* LEFT IMAGE */}
      <div className="w-full hidden md:flex items-center justify-center">
        <img
          className="h-120 w-120 object-contain"
          src="/images/Tree life-rafiki.png"
          alt="leftSideImage"
        />
      </div>

      {/* RIGHT FORM */}
      <div className="w-full flex flex-col items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="md:w-96 w-80 flex flex-col items-center justify-center"
        >
          <h2 className="text-4xl text-gray-900 font-bold">EduMate</h2>
          <p className="text-sm text-gray-900/90 mt-3">
            Welcome back! Please sign in to continue
          </p>

          {/* GOOGLE BUTTON */}
          <button
            type="button"
            className="w-full mt-8 bg-gray-900/10 flex items-center justify-center h-12 rounded-full"
          >
            <img
              src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg"
              alt="googleLogo"
            />
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 w-full my-5">
            <div className="w-full h-px bg-gray-900"></div>
            <p className="w-full text-nowrap text-sm text-gray-900">
              or sign in with email
            </p>
            <div className="w-full h-px bg-gray-900"></div>
          </div>

          {/* EMAIL INPUT */}
          <div className="flex items-center w-full border border-gray-900 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <svg
              width="16"
              height="11"
              viewBox="0 0 16 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
                fill="#6B7280"
              />
            </svg>
            <input
              type="email"
              placeholder="Email id"
              className="bg-transparent text-gray-900 placeholder-gray-900 outline-none text-sm w-full h-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD INPUT */}
          <div className="flex items-center mt-6 w-full border border-gray-900 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <svg
              width="13"
              height="17"
              viewBox="0 0 13 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
                fill="#6B7280"
              />
            </svg>
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent text-gray-900 placeholder-gray-900 outline-none text-sm w-full h-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* REMEMBER ME */}
          <div className="w-full flex items-center justify-between mt-8 text-gray-900">
            <div className="flex items-center gap-2">
              <input
                className="h-5"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-sm">Remember me</label>
            </div>
            <a className="text-sm underline" href="#">
              Forgot password?
            </a>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-600 text-sm mt-4 text-center">{error}</p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full h-11 rounded-full text-white bg-gray-900 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-gray-900 text-sm mt-4">
            Don’t have an account?{" "}
            <Link
              className="text-indigo-900 hover:underline"
              href="/auth/signup"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
