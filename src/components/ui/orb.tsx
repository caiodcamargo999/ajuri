"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface OrbProps extends React.HTMLAttributes<HTMLDivElement> {
    agentState?: "talking" | "thinking" | "idle" | null
}

const Orb = React.forwardRef<HTMLDivElement, OrbProps>(
    ({ className, agentState = "idle", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]",
                    agentState === "talking" && "animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.8)] scale-110",
                    agentState === "thinking" && "animate-spin bg-gradient-to-tr from-purple-500 to-blue-400",
                    className
                )}
                {...props}
            >
                <div className="absolute inset-1 rounded-full bg-white/20 blur-sm" />
            </div>
        )
    }
)
Orb.displayName = "Orb"

export { Orb }
