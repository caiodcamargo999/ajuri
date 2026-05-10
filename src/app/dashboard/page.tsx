"use client"

import { ActionCards } from "@/components/dashboard/action-cards"
import { RecentDrafts } from "@/components/dashboard/recent-drafts"
import { ChartPieInteractive } from "@/components/dashboard/chart-pie-interactive"
import { Suspense } from "react"

export default function DashboardPage() {
    return (
        <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] animate-in fade-in duration-700 bg-black overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto w-full flex flex-1 flex-col gap-6 p-4 md:p-8 overflow-y-auto relative z-10">
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
                        <div className="min-h-[300px] rounded-xl bg-muted/50 flex flex-col items-center justify-center text-muted-foreground border p-6 text-center gap-4">
                            <span className="text-lg font-medium">Outros Indicadores</span>
                            <p className="text-sm">Espaço reservado para métricas financeiras ou prazos processuais.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
