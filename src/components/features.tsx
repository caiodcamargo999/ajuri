"use client";
import React, { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Settings2, Sparkles, Zap, Scale, FileText, Banknote } from 'lucide-react'

export default function Features() {
    return (
        <section className="bg-black py-12 md:py-16" id="features">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl text-white">Feito para Advogados Modernos</h2>
                    <p className="mt-4 text-zinc-400">Ferramentas essenciais para escalar sua atuação no direito do consumidor.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 mx-auto mt-6 gap-6 *:text-center md:mt-10">
                    <Card className="group border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 transition-colors shadow-none">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Zap className="size-6 text-blue-500" aria-hidden />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium text-white">Automação Rápida</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-zinc-400">Preencha formulários inteligentes e gere petições completas em segundos, não horas.</p>
                        </CardContent>
                    </Card>

                    <Card className="group border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 transition-colors shadow-none">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Banknote className="size-6 text-blue-500" aria-hidden />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium text-white">Cálculos Exatos</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm text-zinc-400">Cálculo automático de repetição de indébito, danos morais e correção monetária.</p>
                        </CardContent>
                    </Card>

                    <Card className="group border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 transition-colors shadow-none">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Sparkles className="size-6 text-blue-500" aria-hidden />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium text-white">Inteligência Artificial</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-sm text-zinc-400">Assistente jurídico para sugerir teses e revisar textos automaticamente.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="relative mx-auto size-24 flex items-center justify-center rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors border border-blue-500/20">
        {children}
    </div>
)
