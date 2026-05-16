"use client"

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { forgotPassword } from '@/app/auth/password-actions'
import { useState } from 'react'

export default function ForgotPasswordPage({ searchParams }: { searchParams: { message?: string, error?: string, success?: string } }) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setLoading(true)
        // Note: Using formAction is fine, but we want to show loading state
    }

    return (
        <section className="flex min-h-screen items-center justify-center bg-black px-4">
            <div className="max-w-md m-auto h-fit w-full bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
                <div>
                    <Link href="/" aria-label="go home">
                        <Logo />
                    </Link>
                    <h1 className="mb-1 mt-6 text-xl font-semibold text-white">Recuperar Senha</h1>
                    <p className="text-zinc-400 text-sm">Digite seu email para receber o link de redefinição.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="block text-sm text-zinc-300">Email</Label>
                        <Input
                            type="email"
                            required
                            name="email"
                            id="email"
                            placeholder="seu@email.com"
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
                        />
                    </div>

                    {searchParams?.error && (
                        <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded">
                            {decodeURIComponent(searchParams.error)}
                        </p>
                    )}
                    {searchParams?.success && (
                        <p className="text-green-500 text-sm bg-green-500/10 p-2 rounded">
                            {searchParams.success}
                        </p>
                    )}

                    <div className="flex flex-col gap-4">
                        <Button
                            formAction={forgotPassword}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
                            {loading ? 'Enviando...' : 'Enviar Link'}
                        </Button>
                        <Link href="/login" className="text-sm text-zinc-400 text-center hover:text-white">
                            Voltar para o Login
                        </Link>
                    </div>
                </form>
            </div>
        </section>
    )
}
