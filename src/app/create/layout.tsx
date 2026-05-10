"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Building2, Receipt, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
    { id: "client", label: "Autor", href: "/create/client", icon: User },
    { id: "bank", label: "Banco", href: "/create/bank", icon: Building2 },
    { id: "charges", label: "Valores", href: "/create/charges", icon: Receipt },
    { id: "preview", label: "Preview", href: "/create/preview", icon: FileText },
];

export default function CreateLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Navigation for Wizard */}
            <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-lg flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="text-muted-foreground">Ajuri</span>
                        <span className="text-foreground">/ Editor</span>
                    </Link>

                    <nav className="flex items-center gap-1 md:gap-4">
                        {steps.map((step, index) => {
                            const isActive = pathname.includes(step.href);
                            const isCompleted = false; // TODO: Check validation state

                            return (
                                <Link key={step.id} href={step.href}>
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm",
                                        isActive
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "text-muted-foreground hover:bg-secondary"
                                    )}>
                                        <step.icon className="w-4 h-4" />
                                        <span className="hidden md:inline">{step.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="w-20"></div> {/* Spacer for balance */}
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                {children}
            </main>
        </div>
    );
}
