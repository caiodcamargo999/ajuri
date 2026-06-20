export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { login, signInWithGoogle } from '@/app/auth/actions'

export default function LoginPage() {
    return (
        <section className="flex min-h-screen items-center justify-center bg-black px-4">
            <div className="max-w-md m-auto h-fit w-full bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
                <div>
                    <Link
                        href="/"
                        aria-label="go home">
                        <Logo />
                    </Link>
                    <h1 className="mb-1 mt-6 text-xl font-semibold text-white">Entrar no Ajuri</h1>
                    <p className="text-zinc-400 text-sm">Bem-vindo de volta! Faça login para continuar.</p>
                </div>

                <div className="mt-8">
                    <form>
                        <Button
                            formAction={signInWithGoogle}
                            type="submit"
                            variant="outline"
                            className="w-full bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white h-11">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="1.2em"
                                height="1.2em"
                                viewBox="0 0 256 262"
                                className="mr-2">
                                <path
                                    fill="#4285f4"
                                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                                <path
                                    fill="#34a853"
                                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                                <path
                                    fill="#fbbc05"
                                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
                                <path
                                    fill="#eb4335"
                                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                            </svg>
                            <span>Google</span>
                        </Button>
                    </form>
                </div>

                <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <hr className="border-dashed border-zinc-700" />
                    <span className="text-zinc-500 text-xs">Ou continue com email</span>
                    <hr className="border-dashed border-zinc-700" />
                </div>

                <form className="space-y-6">
                    <div className="space-y-2">
                        <Label
                            htmlFor="email"
                            className="block text-sm text-zinc-300">
                            Email
                        </Label>
                        <Input
                            type="email"
                            required
                            name="email"
                            id="email"
                            placeholder="seu@email.com"
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="password"
                            className="block text-sm text-zinc-300">
                            Senha
                        </Label>
                        <Input
                            type="password"
                            required
                            name="password"
                            id="password"
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
                        />
                    </div>

                    <div className="flex items-center justify-end">
                        <Link href="/esqueci-senha" className="text-sm text-blue-500 hover:text-blue-400">
                            Esqueceu a senha?
                        </Link>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            formAction={login}
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
                            Entrar
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    )
}
