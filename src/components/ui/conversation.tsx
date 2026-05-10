"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

const Conversation = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col h-full w-full", className)}
        {...props}
    />
))
Conversation.displayName = "Conversation"

const ConversationContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
    <ScrollArea className="flex-1 pr-4">
        <div
            ref={ref}
            className={cn("flex flex-col gap-6 p-4", className)}
            {...props}
        >
            {children}
        </div>
    </ScrollArea>
))
ConversationContent.displayName = "ConversationContent"

const ConversationEmptyState = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        icon?: React.ReactNode
        title?: string
        description?: string
    }
>(({ className, icon, title, description, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col items-center justify-center h-full text-center p-8 gap-4 opacity-70",
            className
        )}
        {...props}
    >
        {icon && <div className="text-muted-foreground">{icon}</div>}
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
    </div>
))
ConversationEmptyState.displayName = "ConversationEmptyState"

const ConversationScrollButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    // Ideally this listens to scroll state, but for now just a static positioned button that could be hidden/shown logic
    // Since we don't have the scroll context easily exposed without more complex logic/context, we'll make it a simple 'scroll to bottom' button
    // that the parent can control or just place it.
    // For this implementation, I'll return null or a simple button if needed. 
    // User usage implies it's a known component. I'll make it a button that can be clicked.
    <Button
        ref={ref}
        variant="outline"
        size="icon"
        className={cn("absolute bottom-4 right-4 rounded-full shadow-lg opacity-0 pointer-events-none transition-opacity", className)}
        {...props}
    >
        <ArrowDown className="h-4 w-4" />
    </Button>
))
ConversationScrollButton.displayName = "ConversationScrollButton"

export {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
    ConversationScrollButton,
}
