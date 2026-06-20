"use client"
import { FileText, MoreHorizontal, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function RecentDrafts() {
    const supabase = createClient()
    const [drafts, setDrafts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDrafts = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Get Local Petitions
            const localStored = localStorage.getItem("ajuri_petitions_history")
            const localPetitions = localStored ? JSON.parse(localStored).map((p: any) => ({ ...p, isLocal: true })) : []

            // 2. Get Cloud Petitions
            let cloudPetitions: any[] = []
            if (user) {
                const { data } = await supabase
                    .from('petitions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(5)
                if (data) cloudPetitions = data
            }

            // Combine and Sort
            const combined = [...cloudPetitions, ...localPetitions]
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 5); // Take top 5

            setDrafts(combined)
            setLoading(false)
        }

        fetchDrafts()

        // Listen for updates
        window.addEventListener('petitions-updated', fetchDrafts);
        return () => window.removeEventListener('petitions-updated', fetchDrafts);
    }, [supabase])

    if (loading) {
        return (
            <Card className="shadow-xs hover:shadow-md transition-shadow">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full bg-white/5" />
                    <Skeleton className="h-16 w-full bg-white/5" />
                    <Skeleton className="h-16 w-full bg-white/5" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    Trabalhos Recentes
                </CardTitle>
                <Link href="/peticoes">
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 h-8 gap-1 transition-all">
                        Ver Todos <ArrowRight className="w-3 h-3" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="p-0">
                {drafts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500 space-y-3">
                        <FileText className="w-12 h-12 text-zinc-700 stroke-1" />
                        <p>Nenhum trabalho recente.</p>
                        <Button variant="outline" size="sm" className="mt-2">Iniciar Nova Petição</Button>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {drafts.map((draft) => (
                            <div
                                key={draft.id}
                                className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group/item"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                                        <FileText className="h-5 w-5 text-zinc-400 group-hover/item:text-emerald-500 transition-colors" />
                                    </div>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-bold leading-none text-zinc-200 group-hover/item:text-white transition-colors">{draft.title}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 flex items-center gap-1">
                                            {new Date(draft.updated_at).toLocaleDateString()}
                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                            {draft.status === 'completed' ? (
                                                <span className="text-emerald-500">Finalizado</span>
                                            ) : (
                                                <span className="text-amber-500">Rascunho</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-lg h-8 w-8 p-0 text-zinc-500 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-zinc-200">
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        </DropdownMenuGroup>
                                        <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">Editar</DropdownMenuItem>
                                        <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">Duplicar</DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">Excluir</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
