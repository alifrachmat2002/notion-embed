"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ManualRefreshButton() {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [didFail, setDidFail] = useState(false);

    async function handleRefresh() {
        if (isRefreshing) return;

        setIsRefreshing(true);
        setDidFail(false);

        try {
            const response = await fetch("/api/manual-refresh", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to revalidate");
            }

            router.refresh();
        } catch {
            setDidFail(true);
        } finally {
            setIsRefreshing(false);
        }
    }

    return (
        <button
            type="button"
            title={didFail ? "Refresh failed" : "Refresh"}
            aria-label={didFail ? "Refresh failed" : "Refresh"}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="fixed left-0 top-0 z-50 flex size-8 items-center justify-center rounded-md hover:border border-border bg-transparent text-base leading-none text-muted-strong shadow-sm backdrop-blur transition hover:bg-hover-wash hover:text-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60"
        >
            <span aria-hidden="true" className={isRefreshing ? "animate-spin" : ""}>
                {didFail ? "!" : "↻"}
            </span>
        </button>
    );
}
