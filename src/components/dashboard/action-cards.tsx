"use client"
import { Plus, FileText, Bot, Briefcase, Users, ArrowUpRight, Sparkles } from "lucide-react"
import { LinkWithProgress as Link } from "@/components/link-with-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ActionCards() {
    const [counts, setCounts] = useState({
        clients: 0,
        processes: 0,
        petitions: 0
    });

    useEffect(() => {
        const storedClients = localStorage.getItem("ajuri_crm_clients");
        const storedProcesses = localStorage.getItem("ajuri_legal_processes");
        const storedPetitions = localStorage.getItem("ajuri_petitions_history");

        setCounts({
            clients: storedClients ? JSON.parse(storedClients).length : 0,
            processes: storedProcesses ? JSON.parse(storedProcesses).length : 0,
            petitions: storedPetitions ? JSON.parse(storedPetitions).length : 0
        });
    }, []);

    const stats = [
        {
            label: "Petições",
            value: counts.petitions,
            icon: FileText,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
            trend: "+12%"
        },
        {
            label: "Clientes",
            value: counts.clients,
            icon: Users,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20",
            trend: "+5%"
        },
        {
            label: "Processos",
            value: counts.processes,
            icon: Briefcase,
            color: "text-purple-400",
            bg: "bg-purple-400/10",
            border: "border-purple-400/20",
            trend: "+8%"
        }
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden group border-none bg-gradient-to-br from-emerald-600 to-emerald-900 shadow-2xl shadow-emerald-900/20 h-full sm:col-span-2 lg:col-span-1 min-h-[160px] cursor-pointer active:scale-[0.98] transition-all duration-300">
                <Link href="/ajuri-x" className="absolute inset-0 z-30" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 rounded-full blur-2xl -ml-12 -mb-12" />

                <CardHeader className="pb-2 relative z-10">
                    <div className="flex items-center gap-2 text-white/90">
                        <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                        <CardTitle className="text-lg font-bold">AJURI X</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                    <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
                        IA jurídica de alta performance.
                    </p>
                    <Button variant="secondary" size="sm" className="w-full bg-white text-emerald-700 group-hover:bg-emerald-50 font-bold shadow-xl border-none relative z-40 pointer-events-none">
                        Iniciar IA
                        <ArrowUpRight className="ml-2 w-4 h-4" />
                    </Button>
                </CardContent>
            </Card>

            {stats.map((stat, i) => (
                <Card key={i} className="bg-zinc-950/40 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all duration-300 group min-h-[140px]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-500 truncate">
                            {stat.label}
                        </CardTitle>
                        <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110 duration-300", stat.bg, stat.color)}>
                            <stat.icon className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
                        <div className="flex items-center mt-2.5">
                            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full border", stat.bg, stat.color, stat.border)}>
                                {stat.trend}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
