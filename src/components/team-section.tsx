"use client"
import Link from 'next/link'
import Image from 'next/image'

const members = [
    {
        name: 'Wallacy',
        role: 'Co-Founder & Comercial',
        avatar: '/images/team/wallacy.png',
        link: 'https://www.instagram.com/wallacy/',
    },
    {
        name: 'Caio',
        role: 'Co-Founder & CTO',
        avatar: '/images/team/caio.png',
        link: 'https://www.instagram.com/caio/',
    },
]

export default function TeamSection() {
    return (
        <section className="bg-black py-12 md:py-20 border-b border-zinc-900">
            <div className="mx-auto max-w-5xl px-6">
                <span className="text-caption -ml-6 -mt-3.5 block w-max bg-black px-6 text-zinc-500 font-mono text-sm tracking-wider uppercase">Liderança</span>
                <div className="mt-8 gap-4 sm:grid sm:grid-cols-2 md:mt-16">
                    <div className="sm:w-2/5">
                        <h2 className="text-3xl font-bold sm:text-4xl text-white">Nossos Fundadores</h2>
                    </div>
                    <div className="mt-6 sm:mt-0">
                        <p className="text-zinc-400 text-lg">
                            Unindo a expertise jurídica com a inovação tecnológica para criar soluções que transformam a rotina de escritórios em todo o Brasil.
                        </p>
                    </div>
                </div>
                <div className="mt-12 md:mt-16">
                    <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 max-w-3xl mx-auto">
                        {members.map((member, index) => (
                            <div
                                key={index}
                                className="group overflow-hidden">
                                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-900/50">
                                    <Image
                                        className="h-full w-full object-cover object-top transition-all duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                                        src={member.avatar}
                                        alt={member.name}
                                        width={826}
                                        height={1239}
                                    />
                                </div>
                                <div className="px-2 pt-4">
                                    <div className="flex justify-between items-end border-b border-zinc-900 pb-2">
                                        <h3 className="text-xl font-medium text-white transition-all duration-500 group-hover:text-blue-500">{member.name}</h3>
                                        <span className="text-xs text-zinc-700 font-mono">_0{index + 1}</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-zinc-400 text-sm font-medium">{member.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
