"use client"

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { updatePassword } from '@/app/auth/password-actions'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

export default function UpdatePasswordPage() {
    const [pass, setPass] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updatePassword(pass)
            toast({
                title: "Sucesso",
                description: "Senha atualizada com sucesso. Redirecionando...",
            })
            router.push('/dashboard')
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao atualizar senha. Tente novamente.",
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="flex min-h-screen items-center justify-center bg-black px-4">
            <div className="max-w-md m-auto h-fit w-full bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
                <div>
                    <Link href="/" aria-label="go home">
                        <Logo />
                    </Link>
                    <h1 className="mb-1 mt-6 text-xl font-semibold text-white">Nova Senha</h1>
                    <p className="text-zinc-400 text-sm">Digite sua nova senha abaixo.</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="block text-sm text-zinc-300">Nova Senha</Label>
                        <Input
                            type="password"
                            required
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
                            {loading ? 'Atualizando...' : 'Atualizar Senha'}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    )
}
