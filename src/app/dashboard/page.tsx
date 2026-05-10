"use client"

import { ActionCards } from "@/components/dashboard/action-cards"
import dynamic from "next/dynamic"
import { Suspense } from "react"

const ChartPieInteractive = dynamic(() => import("@/components/dashboard/chart-pie-interactive").then(mod => mod.ChartPieInteractive), { 
    ssr: false,
    loading: () => <div className="h-[350px] w-full bg-zinc-900/20 animate-pulse rounded-xl" />
})

const ChartMonthlyBars = dynamic(() => import("@/components/dashboard/chart-monthly-bars").then(mod => mod.ChartMonthlyBars), { 
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-zinc-900/20 animate-pulse rounded-xl" />
})

const RecentDrafts = dynamic(() => import("@/components/dashboard/recent-drafts").then(mod => mod.RecentDrafts), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-zinc-900/20 animate-pulse rounded-xl" />
})

export default function DashboardPage() {
    return (
        <div className="flex flex-1 flex-col animate-in fade-in duration-700 bg-black min-h-screen relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto w-full space-y-6 p-4 md:p-8 relative z-10">
                <Suspense fallback={null}>
                    <ActionCards />
                </Suspense>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Suspense fallback={null}>
                            <ChartPieInteractive />
                        </Suspense>
                        <Suspense fallback={null}>
                            <RecentDrafts />
                        </Suspense>
                    </div>
                    {/* ... */}
                    <div className="space-y-6">
                        <Suspense fallback={null}>
                            <ChartMonthlyBars />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    )
}
