"use client";

import Image from "next/image";

export default function UnauthorizedPage() {
    return (
        <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
            <div className="flex flex-col items-center max-w-xl w-full">

                {/* Clean, responsive illustration container */}
                <div className="relative w-72 h-72 sm:w-96 sm:h-96 mb-6 flex-shrink-0">
                    <Image
                        src="/images/401 Error Unauthorized-rafiki.png"
                        alt="401 Unauthorized"
                        fill
                        priority
                        className="object-contain"
                    />
                </div>

                {/* Plain, clean typographic error notice */}
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-2">
                    Access Denied
                </h1>

                <p className="text-gray-500 text-sm sm:text-base">
                    Error 401: You are not authorized to access this page.
                </p>

            </div>
        </main>
    );
}