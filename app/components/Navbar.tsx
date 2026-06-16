"use client";

import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState, Fragment } from "react";
import { getUser } from "../services/authService";
import { API_BASE_URL } from "../config/api";

const navigation = [
  { name: "Home", href: "/pages/home", current: true },
  { name: "Modules", href: "/pages/search", current: false },
  { name: "About Us", href: "/pages/about_us", current: false },
  { name: "Channels", href: "/pages/channel", current: false },
  { name: "Dashboard", href: "/pages/dashboard", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type User = {
  id: number;
  email: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  const profileImageUrl = user
    ? `${API_BASE_URL}/profiles/photo?email=${encodeURIComponent(user.email)}`
    : "/images/default-avatar.png";

  return (
    <Disclosure as="nav" className="sticky top-0 z-50 bg-slate-900 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">

              {/* Mobile Menu Button Left Anchor */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="h-6 w-6 transform rotate-0 scale-100 transition-all duration-200" />
                  ) : (
                    <Bars3Icon className="h-6 w-6 transform rotate-0 scale-100 transition-all duration-200" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Brand Branding Identity Grid */}
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center gap-2.5 group cursor-pointer">
                  <div className="bg-indigo-600 p-1.5 rounded-lg shadow-md shadow-indigo-600/20 group-hover:bg-indigo-500 transition-colors">
                    <img
                      src="/images/Tree life-rafiki.png"
                      alt="Logo"
                      className="h-5 w-auto object-contain invert brightness-200"
                    />
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-white hidden md:block">
                    Edu<span className="text-indigo-400">Mate</span>
                  </span>
                </div>

                {/* Horizontal Navigation Interactivity Links */}
                <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-1">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-white/10 text-white font-semibold"
                          : "text-slate-300 hover:bg-white/5 hover:text-white font-medium",
                        "relative rounded-lg px-3.5 py-2 text-xs tracking-wide uppercase transition-all duration-200 group"
                      )}
                    >
                      {item.name}
                      {item.current && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full" />
                      )}
                    </a>
                  ))}
                </div>
              </div>

              {/* Utility Tools Menu Right Deck */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:ml-6 sm:pr-0 space-x-3.5">

                {/* Micro Animated Alert Bell Icon */}
                <button className="relative rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all group">
                  <span className="sr-only">Notifications</span>
                  <BellIcon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-900 animate-pulse" />
                </button>

                {/* Dropdown Profile Anchor Menu Wrapper */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex rounded-full p-0.5 ring-2 ring-transparent hover:ring-indigo-500/50 focus:outline-none transition-all">
                    <div className="relative h-9 w-9 rounded-full overflow-hidden border border-white/10 bg-slate-800">
                      <img
                        className="h-full w-full object-cover"
                        src={imageError ? "/images/default-avatar.png" : profileImageUrl}
                        onError={() => setImageError(true)}
                        alt="User Avatar"
                      />
                    </div>
                  </Menu.Button>

                  {/* Clean Dropdown Animations */}
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2.5 w-64 origin-top-right rounded-xl bg-slate-900 border border-white/10 p-1.5 shadow-2xl focus:outline-none">
                      <div className="px-3 py-2.5 border-b border-white/5 mb-1">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Authenticated As</p>
                        <p className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                          {user?.email || "Guest Account"}
                        </p>
                      </div>

                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="/pages/profile"
                            className={classNames(
                              active ? "bg-white/5 text-white" : "text-slate-300",
                              "block rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                            )}
                          >
                            Settings Profile
                          </a>
                        )}
                      </Menu.Item>

                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="/subscription"
                            className={classNames(
                              active ? "bg-white/5 text-white" : "text-slate-300",
                              "block rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                            )}
                          >
                            Subscription Portal
                          </a>
                        )}
                      </Menu.Item>

                      <div className="my-1 border-t border-white/5" />

                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="/"
                            className={classNames(
                              active ? "bg-red-500/10 text-red-400" : "text-slate-400",
                              "block rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                            )}
                          >
                            Sign out System
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>

            </div>
          </div>

          {/* Drawer Responsive System Layout (Mobile Viewport) */}
          <Disclosure.Panel className="sm:hidden bg-slate-950/95 border-b border-white/5 px-3 pt-2 pb-4 space-y-1">
            {navigation.map((item) => (
              <Disclosure.Button
                key={item.name}
                as="a"
                href={item.href}
                className={classNames(
                  item.current
                    ? "bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500 font-semibold pl-4"
                    : "text-slate-300 hover:bg-white/5 hover:text-white font-medium pl-3",
                  "block rounded-lg py-2.5 text-sm tracking-wide transition-all"
                )}
              >
                {item.name}
              </Disclosure.Button>
            ))}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}