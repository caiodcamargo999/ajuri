"use client";
import Image from 'next/image'

export default function ContentSection() {
    return (
        <section className="py-12 md:py-20 bg-black" id="solution">
            <div className="mx-auto max-w-5xl space-y-6 px-6 md:space-y-10">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl text-white">O ecossistema Ajuri conecta seu escritório.</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
                    <div className="relative mb-6 sm:mb-0 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-6xl font-bold text-blue-500 mb-2">10x</h3>
                            <p className="text-xl font-medium text-white">Mais Produtividade</p>
                        </div>
                    </div>

                    <div className="relative space-y-4">
                        <p className="text-zinc-400 text-lg">
                            O Ajuri comp não é apenas um gerador de documentos. <span className="text-white font-bold">É um sistema completo de gestão de teses</span> — permitindo que você padronize a qualidade técnica de todo o seu escritório.
                        </p>
                        <p className="text-zinc-400 text-lg">Desde a captura do cliente até o protocolo, garantimos consistência e agilidade.</p>

                        <div className="pt-6">
                            <blockquote className="border-l-4 pl-4 border-blue-500/50">
                                <p className="italic text-lg text-zinc-300">"O Ajuri transformou nossa advocacia de massa em uma operação de precisão cirúrgica. Reduzimos o tempo de peticionamento em 90%."</p>

                                <div className="mt-6 space-y-1">
                                    <cite className="block font-medium not-italic text-white">Dr. Wallacy</cite>
                                    <span className="text-sm text-zinc-500">Sócio Fundador</span>
                                </div>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
