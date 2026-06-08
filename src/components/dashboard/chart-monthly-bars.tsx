"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { TrendingUp, BarChart3 } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { createClient } from "@/utils/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
    tarifas: {
        label: "Tarifas",
        color: "#10b981",
    },
    seguro: {
        label: "Seguro",
        color: "#3b82f6",
    },
    outros: {
        label: "Outros",
        color: "#71717a",
    },
} satisfies ChartConfig

export function ChartMonthlyBars() {
    const supabase = createClient()
    const [chartData, setChartData] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchMonthlyStats = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                const user = session?.user

                const localStored = localStorage.getItem("ajuri_petitions_history")
                const localPetitions = localStored ? JSON.parse(localStored) : []

                let cloudPetitions: any[] = []
                if (user) {
                    const { data } = await supabase
                        .from('petitions')
                        .select('*')
                        .eq('user_id', user.id)
                    cloudPetitions = data || []
                }

                const allPetitions = [...localPetitions, ...cloudPetitions]

                // Group by month
                const months: Record<string, any> = {}
                const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

                // Initialize last 6 months
                const now = new Date()
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
                    const key = `${monthNames[d.getMonth()]}`
                    months[key] = { month: key, tarifas: 0, seguro: 0, outros: 0 }
                }

                allPetitions.forEach(p => {
                    const date = new Date(p.updated_at || p.date || Date.now())
                    const key = `${monthNames[date.getMonth()]}`
                    
                    if (months[key]) {
                        const title = p.title?.toLowerCase() || ""
                        if (p.templateId === "tarifas-bancarias" || title.includes("tarifas")) {
                            months[key].tarifas++
                        } else if (p.templateId === "seguro-contrato-veiculos" || title.includes("seguro")) {
                            months[key].seguro++
                        } else {
                            months[key].outros++
                        }
                    }
                })

                setChartData(Object.values(months))
            } catch (error) {
                console.error("Error generating monthly chart data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchMonthlyStats()
    }, [supabase])

    if (loading) {
        return <Skeleton className="w-full h-[300px] rounded-xl" />
    }

    return (
        <Card className="flex flex-col shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="pb-0 border-b pt-4 px-6 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        Histórico Mensal
                    </CardTitle>
                    <CardDescription className="text-[10px] text-zinc-500 pt-1">
                        Petições por mês e categoria
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-6">
                <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
                    <BarChart data={chartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value}
                            className="text-[10px] fill-zinc-500"
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <Bar dataKey="tarifas" fill="var(--color-tarifas)" radius={[2, 2, 0, 0]} stackId="a" />
                        <Bar dataKey="seguro" fill="var(--color-seguro)" radius={[2, 2, 0, 0]} stackId="a" />
                        <Bar dataKey="outros" fill="var(--color-outros)" radius={[2, 2, 0, 0]} stackId="a" />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm border-t p-4 mt-auto">
                <div className="flex gap-2 font-medium leading-none">
                    Tendência de crescimento <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="leading-none text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                    Últimos 6 meses
                </div>
            </CardFooter>
        </Card>
    )
}
