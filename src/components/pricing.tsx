"use client";
import { Button } from '@/components/ui/button'
import { Check, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function Pricing() {
    return (
        <div className="relative py-12 md:py-20 bg-black" id="pricing">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl text-white">
                        Comece a gerenciar seu escritório com inteligência hoje
                    </h2>
                </div>
                <div className="mt-6 md:mt-12">
                    <div className="bg-zinc-900/50 relative rounded-3xl border border-zinc-800 shadow-2xl shadow-zinc-950/5 backdrop-blur-sm">
                        <div className="grid items-center gap-8 md:gap-12 divide-y divide-zinc-800 p-8 md:p-12 md:grid-cols-2 md:divide-x md:divide-y-0">
                            <div className="pb-12 text-center md:pb-0 md:pr-12 md:order-last">
                                <h3 className="text-xl md:text-2xl font-semibold text-white">Plano Enterprise</h3>
                                <p className="mt-2 text-base md:text-lg text-zinc-400">Personalizado para sua demanda</p>

                                <div className="mt-8 mb-8 flex items-center justify-center h-24">
                                    <span className="text-3xl md:text-4xl font-bold text-white">Sob Consulta</span>
                                </div>

                                <div className="flex justify-center">
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg h-12 px-8"
                                        data-cal-namespace="60min"
                                        data-cal-link="backofficebr/60min"
                                        data-cal-config='{"layout":"month_view","theme":"dark"}'>
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Agendar Demonstração
                                    </Button>
                                </div>

                                <p className="text-zinc-500 mt-8 text-sm">
                                    Inclui: Implementação assistida, Suporte prioritário e Acesso total à IA.
                                </p>
                            </div>
                            <div className="relative pt-12 md:pt-0">
                                <div className="mb-6 text-center md:text-left">
                                    <h4 className="text-lg font-semibold text-white mb-4">Tudo o que você precisa para escalar:</h4>
                                </div>
                                <ul
                                    role="list"
                                    className="space-y-4">
                                    {[
                                        'Automação de Petições em Massa',
                                        'Cálculos Revisionais Automáticos',
                                        'Inteligência Artificial Jurídica',
                                        'Gestão de Clientes e Prazos',
                                        'Exportação Ilimitada em PDF/Word'
                                    ].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-3 text-zinc-300">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-900/30 border border-blue-800">
                                                <Check className="size-3.5 text-blue-400" />
                                            </div>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-zinc-500 mt-8 text-sm text-center md:text-left">Escritórios que já utilizam nossa tecnologia:</p>
                                <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                    {/* Using placeholders or lucide icons for "companies" visual representation if external images fail or aren't desired, but sticking to user request style */}
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <span className="text-xl">SENA</span>
                                        <span className="text-xs font-normal border border-zinc-700 rounded px-1">ADVOCACIA</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white font-bold">
                                        <span className="text-xl">WALLACY</span>
                                        <span className="text-xs font-normal border border-zinc-700 rounded px-1">PARCEIROS</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
