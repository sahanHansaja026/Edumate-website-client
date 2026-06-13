"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/app/services/authService";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = getUser();

        if (!user) {
            router.replace("/login"); // redirect if not logged in
        } else {
            setLoading(false);
        }
    }, [router]);

    if (loading) return null; // or a spinner

    return <>{children}</>;
}