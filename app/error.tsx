"use client";

import { useEffect } from "react";

export default function ErrorPage({
    error,
    unstable_retry,
}: {
    error: Error & { digest?: string };
    unstable_retry: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
            <h2 className="text-lg font-medium">Something went wrong loading your workouts.</h2>
            <button
                type="button"
                onClick={() => unstable_retry()}
                className="rounded-md border border-white/10 px-4 py-2 text-sm hover:bg-black/70"
            >
                Try again
            </button>
        </div>
    );
}
