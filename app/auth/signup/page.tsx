"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/app/config/api";

// rest of your code...


const SignupPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        password
      });
      setSuccess(response.data.message);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setTermsAccepted(false);
      router.push("/auth/login");
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail);
      } else {
        setError("Something went wrong. Try again later.");
      }
    }
  };

  return (
    <div className="flex h-[700px] w-full bg-white">
      {/* Left Image */}
      <div className="w-full hidden md:flex items-center justify-center">
        <img
          className="h-120 w-120 object-contain"
          src="/images/Tree life-rafiki.png"
          alt="signupImage"
        />
      </div>

      {/* Right Form */}
      <div className="w-full flex flex-col items-center justify-center">
        <form
          className="md:w-96 w-80 flex flex-col items-center justify-center"
          onSubmit={handleSignup}
        >
          <h2 className="text-4xl text-gray-900 font-bold">EduMate</h2>
          <p className="text-sm text-gray-900/90 mt-3">
            Create your account to get started
          </p>

          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-500 mt-2">{success}</p>}

          {/* Email */}
          <div className="flex items-center w-full mt-8 border border-gray-900 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="bg-transparent text-gray-900 placeholder-gray-900 outline-none text-sm w-full h-full"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="flex items-center mt-6 w-full border border-gray-900 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent text-gray-900 placeholder-gray-900 outline-none text-sm w-full h-full"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password */}
          <div className="flex items-center mt-6 w-full border border-gray-900 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <input
              type="password"
              placeholder="Confirm password"
              className="bg-transparent text-gray-900 placeholder-gray-900 outline-none text-sm w-full h-full"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Terms */}
          <div className="w-full flex items-center gap-2 mt-6 text-gray-900">
            <input
              className="h-5"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
            />
            <p className="text-sm">
              I agree to the{" "}
              <span className="underline cursor-pointer">Terms & Conditions</span>
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-8 w-full h-11 rounded-full text-white bg-gray-900 hover:opacity-90 transition-opacity"
          >
            Sign Up
          </button>

          {/* Login Link */}
          <p className="text-gray-900 text-sm mt-4">
            Already have an account?{" "}
            <a className="text-indigo-900 hover:underline" href="/auth/login">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
