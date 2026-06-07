
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
        <div className="space-y-6 p-4 md:p-10 pb-16 block">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground">
                    Gerencie seu perfil e colaboradores da conta.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 w-full">
                <div className="flex-1 w-full lg:max-w-4xl">
                    <SettingsForm defaultTab={tab || "profile"} />
                </div>
            </div>
        </div>
    )
}
