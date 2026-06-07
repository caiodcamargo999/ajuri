import React, { ReactNode } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function DocumentacaoLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-black h-screen overflow-y-auto">
                <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-white/5 px-6 backdrop-blur-xl bg-black/80 transition-all">
                    <SidebarTrigger className="-ml-1 text-zinc-400 hover:text-white transition-colors" />
                    <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard" className="text-zinc-500 hover:text-white transition-colors font-medium">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-zinc-700" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-white font-bold tracking-tight">Documentação</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <main className="flex flex-1 flex-col bg-black overflow-x-hidden w-full min-w-0">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
