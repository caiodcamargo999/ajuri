"use client"

import { BrandingSettings } from "./branding-settings"
import { Palette, Sparkles } from "lucide-react"

export default function CustomizarDocumentacaoPage() {
    return (
        <div className="flex flex-1 flex-col gap-8 p-8 max-w-[1600px] mx-auto w-full animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                            <Palette className="w-6 h-6 text-pink-500" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">
                            Identidade Visual
                        </h1>
                    </div>
                    <p className="text-zinc-500 text-lg max-w-2xl font-medium">
                        Padronize a excelência técnica e visual de todas as suas petições e documentos.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center gap-3">
                        <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                        <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Branding Ativo</span>
                    </div>
                </div>
            </header>

            <BrandingSettings />
        </div>
    )
}
