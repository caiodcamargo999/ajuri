"use client"

import * as React from "react"
import { FileText, PieChart as PieChartIcon } from "lucide-react"
import { Pie, PieChart, Label, ResponsiveContainer } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
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
    count: {
        label: "Petições",
    },
    tarifas: {
        label: "Tarifas Bancárias",
        color: "#10b981", // Emerald
    },
    seguro: {
        label: "Seguro Auto",
        color: "#3b82f6", // Blue
    },
    outros: {
        label: "Outros",
        color: "#71717a", // Zinc
    },
} satisfies ChartConfig

export function ChartPieInteractive() {
    const supabase = createClient()
    const [chartData, setChartData] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [totalPetitions, setTotalPetitions] = React.useState(0)

    React.useEffect(() => {
        const fetchAllStats = async () => {
            let user = null;

            try {
                // Get current user
                const { data: { session } } = await supabase.auth.getSession()
                user = session?.user

                // 1. Get Local Petitions
                const localStored = localStorage.getItem("ajuri_petitions_history")
                const localPetitions = localStored ? JSON.parse(localStored) : []

                // 2. Get Cloud Petitions
                let cloudPetitions: any[] = []
                if (user) {
                    const { data } = await supabase
                        .from('petitions')
                        .select('*')
                        .eq('user_id', user.id)
                    cloudPetitions = data || []
                }

                const allPetitions = [...localPetitions, ...cloudPetitions]
                setTotalPetitions(allPetitions.length)

                if (allPetitions.length === 0) {
                    setChartData([])
                    setLoading(false)
                    return
                }

                let tarifas = 0;
                let seguro = 0;
                let outros = 0;

                allPetitions.forEach(p => {
                    const title = p.title?.toLowerCase() || "";
                    if (p.templateId === "tarifas-bancarias" || title.includes("tarifas")) {
                        tarifas++;
                    } else if (p.templateId === "seguro-contrato-veiculos" || title.includes("seguro")) {
                        seguro++;
                    } else {
                        outros++;
                    }
                })

                const pieData = [];
                if (tarifas > 0) pieData.push({ petitionType: "tarifas", count: tarifas, fill: "var(--color-tarifas)" });
                if (seguro > 0) pieData.push({ petitionType: "seguro", count: seguro, fill: "var(--color-seguro)" });
                if (outros > 0) pieData.push({ petitionType: "outros", count: outros, fill: "var(--color-outros)" });

                setChartData(pieData)
            } catch (error) {
                console.error("Error generating chart data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAllStats()
    }, [supabase])

    const totalCalculated = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.count, 0)
    }, [chartData])

    if (loading) {
        return (
            <Card className="flex flex-col border border-white/5 bg-zinc-950/40 backdrop-blur-xl shadow-2xl h-full">
                <CardHeader className="items-center pb-0">
                    <Skeleton className="h-6 w-48 bg-white/5 mx-auto" />
                    <Skeleton className="h-4 w-32 bg-white/5 mt-2 mx-auto" />
                </CardHeader>
                <CardContent className="flex-1 pb-0 flex items-center justify-center">
                    <Skeleton className="h-[200px] w-[200px] rounded-full bg-white/5" />
                </CardContent>
            </Card>
        )
    }

    if (chartData.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-12 min-h-[350px] border border-white/5 bg-zinc-950/40 backdrop-blur-xl shadow-2xl">
                <div className="p-4 bg-white/5 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-zinc-500" />
                </div>
                <CardTitle className="text-center text-zinc-300">Nenhuma Petição Criada</CardTitle>
                <CardDescription className="text-center mt-2 max-w-[200px] text-zinc-500">
                    Crie sua primeira petição para ver as estatísticas aqui
                </CardDescription>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col border border-white/5 bg-zinc-950/40 backdrop-blur-xl shadow-2xl h-full">
            <CardHeader className="pb-0 border-b border-white/5 bg-white/5 pt-4 px-6 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <PieChartIcon className="w-4 h-4 text-emerald-500" />
                        Petições por Tipo
                    </CardTitle>
                    <CardDescription className="font-mono text-xs text-zinc-500 pt-1">
                        Distribuição das petições geradas
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-0 pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="count"
                            nameKey="petitionType"
                            innerRadius={60}
                            strokeWidth={5}
                            stroke="#000"
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-white text-3xl font-bold"
                                                >
                                                    {totalCalculated.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-zinc-500 text-xs font-bold uppercase tracking-wider"
                                                >
                                                    Total
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
