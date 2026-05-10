"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PetitionProvider } from "@/contexts/PetitionContext";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <PetitionProvider>
                    {children}
                </PetitionProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}
