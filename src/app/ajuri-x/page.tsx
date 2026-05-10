"use client"

import AjuriXForm from "@/components/ajuri-x/ajuri-x-form";
import { Suspense, useEffect, useState } from "react";
import { Loader2, Zap, ShieldCheck } from "lucide-react";
import { Scale16SolidIcon } from "@/components/icons/scale-icon";

export default function AjuriXPage() {
    return (
        <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] animate-in fade-in duration-700 bg-black overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full -ml-64 -mb-64" />
            </div>

            <div className="max-w-[1600px] mx-auto w-full flex flex-col gap-6 p-4 md:p-8 h-full relative z-10">
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] group hover:bg-emerald-500/20 transition-all duration-500">
                                <Scale16SolidIcon size={32} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none">
                                    AJURI X Intelligence
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
                                        <Zap className="w-3 h-3" /> IA Avançada
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-6 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Segurança</span>
                            <ShieldCheck className="w-4 h-4 text-emerald-500/60" />
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-zinc-300">End-to-End</span>
                            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-tighter">Processamento Privado</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 min-h-0">
                    <Suspense fallback={
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950/40 border border-white/5 rounded-2xl backdrop-blur-xl">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                                <Loader2 className="h-16 w-16 text-emerald-500 animate-spin relative z-10" />
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-xs mt-8 animate-pulse">
                                Carregando...
                            </p>
                        </div>
                    }>
                        <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent animate-in zoom-in-95 fade-in duration-1000 delay-300 fill-mode-both">
                            <AjuriXForm />
                        </div>
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
