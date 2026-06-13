"use client";

import { Disclosure, Menu } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { getUser } from "../services/authService";
import { API_BASE_URL } from "../config/api";

const navigation = [
  { name: "Home", href: "/pages/home", current: true },
  { name: "Create Module", href: "/pages/modulecreation", current: false },
  { name: "About Us", href: "/pages/about_us", current: false },
  { name: "channels", href: "/pages/channel", current: false },
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
    ? `${API_BASE_URL}/profiles/photo?email=${encodeURIComponent(
        user.email
      )}`
    : "/images/default-avatar.png";

  return (
    <Disclosure as="nav" className="bg-gray-900 relative">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">

              {/* Mobile menu button */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:outline-indigo-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Logo + Menu */}
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <img
                    src="/images/Tree life-rafiki.png"
                    alt="Logo"
                    className="h-8 w-auto"
                  />
                </div>

                <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-gray-950/50 text-white"
                          : "text-gray-300 hover:bg-white/5 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Right side */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:ml-6 sm:pr-0 space-x-4">

                {/* Notifications */}
                <button className="relative rounded-full p-1 text-gray-400 hover:text-white focus:outline-2 focus:outline-indigo-500">
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
                </button>

                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex rounded-full focus:outline-2 focus:outline-indigo-500">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={
                        imageError
                          ? "/images/default-avatar.png"
                          : profileImageUrl
                      }
                      onError={() => setImageError(true)}
                      alt="User"
                    />
                  </Menu.Button>

                  <Menu.Items className="absolute right-0 mt-2 w-78 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg">
                    <Menu.Item>
                      {({ active }) => (
                        
                        <div
                          className={classNames(
                            active ? "bg-white/5" : "",
                            "px-4 py-2 text-sm text-gray-300"
                          )}
                        ><a href="/pages/profile">
                          {user?.email}
                          </a>
                        </div>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/pages/profile"
                          className={classNames(
                            active ? "bg-white/5" : "",
                            "block px-4 py-2 text-sm text-gray-300"
                          )}
                        >
                          Settings
                        </a>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/subscription"
                          className={classNames(
                            active ? "bg-white/5" : "",
                            "block px-4 py-2 text-sm text-gray-300"
                          )}
                        >
                          Subcrption
                        </a>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/"
                          className={classNames(
                            active ? "bg-white/5" : "",
                            "block px-4 py-2 text-sm text-gray-300"
                          )}
                        >
                          Sign out
                        </a>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Disclosure.Button
                key={item.name}
                as="a"
                href={item.href}
                className={classNames(
                  item.current
                    ? "bg-gray-950/50 text-white"
                    : "text-gray-300 hover:bg-white/5 hover:text-white",
                  "block rounded-md px-3 py-2 text-base font-medium"
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
