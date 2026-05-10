"use client";
import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { TextEffect } from '@/components/motion-primitives/text-effect'
import { AnimatedGroup } from '@/components/motion-primitives/animated-group'
import { HeroHeader } from "@/components/header"

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 0.8,
            },
        },
    },
}

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden min-h-screen bg-black">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block pointer-events-none">
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(220,100%,50%,.08)_0,hsla(220,100%,50%,.02)_50%,hsla(220,100%,50%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(220,100%,50%,.06)_0,hsla(220,100%,50%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(220,100%,50%,.04)_0,hsla(220,100%,50%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-32 md:pt-40 pb-20 md:pb-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 0.1,
                                        },
                                    },
                                },
                                item: transitionVariants.item
                            }}
                            className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32 pointer-events-none">
                            <div className="hidden size-full dark:block bg-gradient-to-b from-black via-zinc-900 to-blue-950/20 opacity-50" />
                        </AnimatedGroup>

                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_10%_,transparent_0%,#000_75%)]"
                        />

                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.2, // Faster start
                                                },
                                            },
                                        },
                                        item: transitionVariants.item
                                    }}
                                    className="">
                                    <Link
                                        href="#features"
                                        className="hover:bg-zinc-900 bg-zinc-900/50 group mx-auto flex w-fit items-center gap-4 rounded-full border border-zinc-800 p-1 pl-4 shadow-md shadow-blue-500/5 transition-colors duration-300">
                                        <span className="text-zinc-200 text-sm">Novo módulo de Inteligência Artificial</span>
                                        <span className="block h-4 w-0.5 border-l border-zinc-700 bg-zinc-700"></span>

                                        <div className="bg-zinc-800 group-hover:bg-zinc-700 size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3 text-white" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3 text-white" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </AnimatedGroup>

                                <TextEffect
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    as="h1"
                                    className="mx-auto mt-8 max-w-4xl text-balance text-5xl font-bold tracking-tight text-white max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                    {"Automação Jurídica para a Era Digital"}
                                </TextEffect>
                                <TextEffect
                                    per="line"
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    delay={0.2} // Reduced delay
                                    as="p"
                                    className="mx-auto mt-8 max-w-2xl text-balance text-lg text-zinc-400">
                                    Crie petições complexas em minutos, calcule indenizações automaticamente e aumente a produtividade do seu escritório com o Ajuri.
                                </TextEffect>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.3, // Faster start
                                                },
                                            },
                                        },
                                        item: transitionVariants.item
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-gradient-to-b from-blue-500 to-blue-700 rounded-[calc(var(--radius-xl)+0.125rem)] p-0.5 shadow-lg shadow-blue-500/20">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="w-full sm:w-auto rounded-xl px-8 text-base bg-black hover:bg-zinc-900 text-white h-12 border border-transparent hover:border-blue-500/30 transition-all">
                                            <Link href="/login">
                                                <span className="text-nowrap font-medium">Acessar Plataforma</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="w-full sm:w-auto h-12 rounded-xl px-8 text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800">
                                        <Link href="https://cal.com/backofficebr/30min" target="_blank">
                                            <span className="text-nowrap">Falar com Vendas</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>

                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.4, // Faster start
                                        },
                                    },
                                },
                                item: transitionVariants.item
                            }}
                            className="w-full hidden md:flex justify-center mt-10 px-4"
                        >
                            {/* Placeholder for Product Screenshot using a generic placeholder or existing asset if available */}
                            <div className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900/50 backdrop-blur-sm group">
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-center p-10 transform group-hover:scale-105 transition-transform duration-700">
                                        <div className="w-24 h-24 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                                            <Calculator className="w-10 h-10 text-blue-500" />
                                        </div>
                                        <h3 className="text-2xl font-semibold text-white mb-2">Interface Intuitiva</h3>
                                        <p className="text-zinc-500">Dashboard de gestão e criação de petições em tempo real.</p>
                                    </div>
                                </div>
                                {/* Optional: Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                <section className="bg-black pb-10 pt-10 md:pb-16 border-b border-zinc-900">
                    <div className="group relative m-auto max-w-5xl px-6">
                        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
                            <Link
                                href="/"
                                className="block text-sm duration-150 hover:opacity-75 text-zinc-400 hover:text-white">
                                <span> Conheça nossos parceiros</span>
                                <ChevronRight className="ml-1 inline-block size-3" />
                            </Link>
                        </div>
                        <div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14 justify-items-center opacity-70">
                            <div className="flex text-zinc-500 font-bold text-lg items-center text-center">
                                SENA ADVOCACIA
                            </div>
                            <div className="flex text-zinc-500 font-bold text-lg items-center text-center">
                                DIGI JURÍDICO
                            </div>
                            <div className="flex text-zinc-500 font-bold text-lg items-center text-center">
                                MARTINS E FILHOS
                            </div>
                            <div className="flex text-zinc-500 font-bold text-lg items-center text-center">
                                LEX TECH
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
