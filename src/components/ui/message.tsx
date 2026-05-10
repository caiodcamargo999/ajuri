"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
    from?: "user" | "assistant" | "system"
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
    ({ className, from = "user", ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex gap-4 w-full",
                from === "user" ? "flex-row-reverse" : "flex-row",
                className
            )}
            {...props}
        />
    )
)
Message.displayName = "Message"

const MessageContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col gap-2 rounded-2xl px-4 py-3 text-sm shadow-sm",
            className
        )}
        {...props}
    />
))
MessageContent.displayName = "MessageContent"

export { Message, MessageContent }
