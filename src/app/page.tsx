import HeroSection from "@/components/hero-section";
import Features from "@/components/features";
import ContentSection from "@/components/content-section";
import Pricing from "@/components/pricing";
import Link from 'next/link';
import TeamSection from "@/components/team-section";
import LogoCloud from "@/components/logo-cloud";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col bg-black text-foreground overflow-x-hidden">
            {/* Sections with improved vertical spacing */}
            <HeroSection />

            <LogoCloud />

            <div className="mt-12 md:mt-16">
                <Features />
            </div>

            <div className="mt-12 md:mt-16">
                <ContentSection />
            </div>

            <div className="mt-12 md:mt-16">
                <TeamSection />
            </div>

            <div className="mt-12 md:mt-16 mb-16">
                <Pricing />
            </div>

            {/* Footer Simples */}
            <footer className="border-t border-zinc-900 py-12 px-6 bg-black">
                <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-zinc-500">© 2026 Ajuri. Todos os direitos reservados.</p>
                    <div className="flex gap-6 text-sm text-zinc-500">
                        <Link href="/termosdeuso" className="hover:text-white transition-colors">Termos de Uso</Link>
                        <Link href="/politicasdeprivacidade" className="hover:text-white transition-colors">Privacidade</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
