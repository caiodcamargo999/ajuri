
'use client';

export default function LogoCloud() {
    const clients = [
        "Venâncio & Associados",
        "Pierre & Cunha Advogados",
        "Vinicius Lima Advocacia",
        "Bentes Ramos",
        "Carneiro & Bacellar",
        "GAC Advogados",
        "Sena Advocacia",
        "Mascarenhas & Justiniano",
        "Justiniano, Mascarenhas e Cutrim",
        "Coelho Santos Tavares",
        "Luis Albert Advogado",
    ];

    return (
        <section className="bg-black py-24 border-y border-zinc-900 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6">
                <h2 className="text-center text-xl font-medium text-zinc-400 mb-20 tracking-wide">
                    Empresas que confiam na Ajuri
                </h2>

                <div className="relative m-auto w-full overflow-hidden bg-black before:absolute before:left-0 before:top-0 before:z-20 before:h-full before:w-16 before:bg-gradient-to-r before:from-black before:to-transparent after:absolute after:right-0 after:top-0 after:z-20 after:h-full after:w-16 after:bg-gradient-to-l after:from-black after:to-transparent">
                    <div className="flex w-max animate-infinite-scroll gap-16 hover:[animation-play-state:paused]">
                        {[...clients, ...clients].map((client, index) => (
                            <div key={index} className="flex items-center justify-center">
                                <span className="text-2xl md:text-3xl font-serif text-zinc-600 whitespace-nowrap tracking-tight transition-colors duration-300 hover:text-white cursor-default">
                                    {client}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <style jsx>{`
                    @keyframes scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-infinite-scroll {
                        animation: scroll 40s linear infinite;
                    }
                `}</style>
            </div>
        </section>
    )
}
