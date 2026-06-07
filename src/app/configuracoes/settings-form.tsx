"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { Trash2, UserPlus, Users, BadgeCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TemplateManager } from "@/components/settings/TemplateManager"

interface Profile {
    id: string
    full_name: string | null
    email: string | null
    role: 'user' | 'collaborator' | 'enterprise' | 'cofounder'
    avatar_url: string | null
}

interface Collaborator {
    id: string
    email: string
    created_at: string
}

interface SettingsFormProps {
    defaultTab?: string
}

export function SettingsForm({ defaultTab = "profile" }: SettingsFormProps) {
    const supabase = createClient()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [collaborators, setCollaborators] = useState<Collaborator[]>([])
    // ...

    const [newCollaboratorEmail, setNewCollaboratorEmail] = useState("")
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)

    // Fetch Data
    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get Profile
            let { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            // If profile doesn't exist (e.g. old user), use auth data metadata
            if (!profileData) {
                setProfile({
                    id: user.id,
                    full_name: user?.user_metadata?.full_name,
                    email: user?.email!,
                    role: 'user', // Default
                    avatar_url: user?.user_metadata?.avatar_url
                })
            } else {
                setProfile(profileData)
            }

            // Get Collaborators
            if (profileData) { // Only fetch if profile exists/we have an ID
                const { data: collabData, error } = await supabase
                    .from('collaborators')
                    .select('*')
                    .eq('owner_id', user.id)

                if (collabData) {
                    setCollaborators(collabData)
                }
            }

            setLoading(false)
        }

        fetchData()
    }, [supabase])

    const handleAddCollaborator = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile) return
        if (collaborators.length >= 3) {
            toast({
                title: "Limite atingido",
                description: "Você só pode adicionar até 3 colaboradores.",
                variant: "destructive"
            })
            return
        }

        setAdding(true)

        // 1. Insert into collaborators table
        const { data, error } = await supabase
            .from('collaborators')
            .insert({
                owner_id: profile.id,
                email: newCollaboratorEmail
            })
            .select()
            .single()

        if (error) {
            toast({
                title: "Erro ao adicionar",
                description: error.message,
                variant: "destructive"
            })
        } else {
            setCollaborators([...collaborators, data])
            setNewCollaboratorEmail("")
            toast({
                title: "Colaborador convidado",
                description: "O email foi adicionado à sua equipe.",
            })
        }
        setAdding(false)
    }

    const handleRemoveCollaborator = async (id: string) => {
        const { error } = await supabase
            .from('collaborators')
            .delete()
            .eq('id', id)

        if (error) {
            toast({
                title: "Erro ao remover",
                description: error.message,
                variant: "destructive"
            })
        } else {
            setCollaborators(collaborators.filter(c => c.id !== id))
            toast({
                title: "Colaborador removido",
                description: "O acesso foi revogado.",
            })
        }
    }

    if (loading) {
        return <div className="text-muted-foreground animate-pulse">Carregando configurações...</div>
    }

    return (
        <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="team">Equipe & Plano</TabsTrigger>
                <TabsTrigger value="templates">Modelos</TabsTrigger>
            </TabsList>


            {/* --- PROFILE TAB --- */}
            <TabsContent value="profile">
                <Card>
                    <CardHeader>
                        <CardTitle>Seu Perfil</CardTitle>
                        <CardDescription>
                            Gerencie suas informações pessoais.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={profile?.avatar_url || ""} />
                                <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-medium text-lg">{profile?.full_name}</h3>
                                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                                <div className="mt-1">
                                    <Badge variant={profile?.role === 'cofounder' ? "default" : "secondary"}>
                                        {profile?.role === 'cofounder' && "Co-Founder 🚀"}
                                        {profile?.role === 'enterprise' && "Enterprise 🏢"}
                                        {profile?.role === 'collaborator' && "Colaborador 🤝"}
                                        {profile?.role === 'user' && "Plano Básico"}
                                    </Badge>
                                </div>
                            </div>
                        </div>


                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" defaultValue={profile?.full_name || ""} disabled />
                            <p className="text-[0.8rem] text-muted-foreground">
                                O nome é puxado do seu provedor de login (Google).
                            </p>
                        </div>

                        <div className="grid gap-4 border-t pt-4 mt-4">
                            <h3 className="font-medium">Segurança</h3>
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault()
                                    // Logic to update password
                                    const form = e.target as HTMLFormElement
                                    const password = (form.elements.namedItem('password') as HTMLInputElement).value
                                    if (password.length < 6) {
                                        toast({ title: "Erro", description: "Senha deve ter no mínimo 6 caracteres", variant: "destructive" });
                                        return;
                                    }

                                    try {
                                        const { error } = await supabase.auth.updateUser({ password })
                                        if (error) throw error
                                        toast({ title: "Sucesso", description: "Senha atualizada com sucesso." })
                                        form.reset()
                                    } catch (err: any) {
                                        toast({ title: "Erro", description: err.message, variant: "destructive" })
                                    }
                                }}
                                className="flex flex-col sm:flex-row sm:items-end items-stretch gap-2"
                            >
                                <div className="grid w-full gap-2">
                                    <Label htmlFor="password">Nova Senha</Label>
                                    <Input id="password" name="password" type="password" placeholder="Digite a nova senha" />
                                </div>
                                <Button type="submit" variant="outline">Atualizar Senha</Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* --- TEAM TAB --- */}
            <TabsContent value="team">
                <Card>
                    <CardHeader>
                        <CardTitle>Colaboradores</CardTitle>
                        <CardDescription>
                            Adicione até 3 pessoas da sua equipe para acessarem sua conta.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Add Collaborator Form */}
                        <form onSubmit={handleAddCollaborator} className="flex flex-col sm:flex-row w-full sm:items-end items-stretch gap-2">
                            <div className="grid w-full gap-2">
                                <Label htmlFor="collab-email">Email do Colaborador</Label>
                                <Input
                                    id="collab-email"
                                    type="email"
                                    placeholder="colega@exemplo.com"
                                    value={newCollaboratorEmail}
                                    onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={adding || collaborators.length >= 3}>
                                {adding ? "Adicionando..." : <><UserPlus className="mr-2 h-4 w-4" /> Adicionar</>}
                            </Button>
                        </form>

                        {collaborators.length >= 3 && (
                            <div className="rounded-md bg-yellow-500/15 p-3 text-sm text-yellow-600 dark:text-yellow-400">
                                ⚠️ Você atingiu o limite máximo de 3 colaboradores.
                            </div>
                        )}

                        {/* List */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Users className="h-4 w-4" /> Membros Ativos ({collaborators.length}/3)
                            </h4>
                            {collaborators.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                                    Nenhum colaborador adicionado ainda.
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {collaborators.map((collab) => (
                                        <div key={collab.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <Users className="h-4 w-4 text-slate-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{collab.email}</span>
                                                    <span className="text-xs text-muted-foreground">Adicionado em {new Date(collab.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => handleRemoveCollaborator(collab.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </CardContent>
                    <CardFooter className="bg-muted/50 px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <BadgeCheck className="h-3 w-3 text-green-500" />
                            Seu plano atual permite 3 colaboradores. Para mais, contate o suporte enterprise.
                        </div>
                    </CardFooter>
                </Card>
            </TabsContent>

            {/* --- TEMPLATES TAB --- */}
            <TabsContent value="templates">
                <TemplateManager />
            </TabsContent>
        </Tabs>
    )
}
