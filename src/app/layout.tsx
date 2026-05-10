
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

export const metadata: Metadata = {
    title: "Ajuri Comp - Gerador de Petições",
    description: "Automação jurídica para advogados modernos.",
    icons: {
        icon: "/favicon.png",
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
