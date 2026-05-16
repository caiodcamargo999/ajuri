
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { NavigationProgress } from "@/components/navigation-progress";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: "Ajuri | Automação Jurídica com Inteligência Artificial",
    description: "A plataforma completa para advogados modernos. Crie petições, calcule indenizações e gerencie seus clientes com o poder da IA.",
    keywords: ["advocacia", "direito", "inteligência artificial", "automação jurídica", "petições", "crm jurídico"],
    authors: [{ name: "Ajuri Team" }],
    openGraph: {
        title: "Ajuri | Automação Jurídica Inteligente",
        description: "Transforme seu escritório com IA. Produtividade e precisão em um só lugar.",
        url: "https://ajuri.com.br",
        siteName: "Ajuri",
        locale: "pt_BR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Ajuri | Automação Jurídica Inteligente",
        description: "A revolução na criação de petições e gestão jurídica.",
    },
    icons: {
        icon: "/logo.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className="dark">
            <body className={`${inter.variable} ${GeistSans.variable} font-inter`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            "name": "Ajuri",
                            "url": "https://ajuri.com.br",
                            "logo": "https://ajuri.com.br/logo.png",
                            "description": "Automação Jurídica com Inteligência Artificial para advogados modernos.",
                            "address": {
                                "@type": "PostalAddress",
                                "addressCountry": "BR"
                            }
                        })
                    }}
                />
                <Providers>
                    <Suspense fallback={null}>
                        <NavigationProgress />
                    </Suspense>
                    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
                        {children}
                        <Toaster />
                        <SonnerToaster />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
