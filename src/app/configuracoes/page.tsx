
export const dynamic = 'force-dynamic'

import { SettingsForm } from "./settings-form"
import { Separator } from "@/components/ui/separator"

export const metadata = {
    title: "Configurações",
    description: "Gerencie suas configurações de conta e equipe.",
}

export default function SettingsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const tab = searchParams.tab as string | undefined
    return (
        <div className="space-y-6 p-10 pb-16 block">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground">
                    Gerencie seu perfil e colaboradores da conta.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        {/* Simple visual nav for now, focusing on the content in Tabs */}
                        <div className="bg-muted px-4 py-2 rounded-md justify-start font-medium transition-colors">
                            Geral
                        </div>
                    </nav>
                </aside>
                <div className="flex-1 lg:max-w-2xl">
                    <SettingsForm defaultTab={tab || "profile"} />
                </div>
            </div>
        </div>
    )
}
