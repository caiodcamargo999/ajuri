"use client"

import { ActionCards } from "@/components/dashboard/action-cards"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
        <div className="flex flex-1 flex-col animate-in fade-in duration-300 min-h-screen relative">
            <div className="max-w-[1600px] mx-auto w-full space-y-6 p-4 md:p-8 relative z-10">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                        Dashboard
                    </h1>
                    <Link href="/ajuri-x">
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 h-10 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Criar via AJURI X
                        </Button>
                    </Link>
                </div>
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
