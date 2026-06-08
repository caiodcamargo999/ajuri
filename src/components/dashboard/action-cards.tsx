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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, i) => (
                <Card key={i} className="group min-h-[140px] transition-all duration-300 hover:ring-foreground/20 hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-[0.1em] text-zinc-500 truncate">
                            {stat.label}
                        </CardTitle>
                        <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110 duration-300", stat.bg, stat.color)}>
                            <stat.icon className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black tracking-tight">{stat.value}</div>
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
