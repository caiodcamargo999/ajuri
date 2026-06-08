"use client"

import * as React from "react"
import {
    Bot,
    Briefcase,
    FileText,
    LayoutDashboard,
    LogOut,
    MoreHorizontal,
    Scale,
    Settings,
    User,
    Users,
    Palette,
    MessageSquare,
    Zap,
    CheckSquare,
    BookOpen,
} from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarGroup,
    SidebarGroupLabel,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

import { LinkWithProgress as Link } from "@/components/link-with-progress"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { Scale16SolidIcon } from "@/components/icons/scale-icon"
import { cn } from "@/lib/utils"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { isMobile } = useSidebar()
    const [user, setUser] = React.useState<any>(null)
    const [isLoaded, setIsLoaded] = React.useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    React.useEffect(() => {
        const fetchUser = async () => {
            // 1. First get session
            const { data: { session } } = await supabase.auth.getSession();

            // 2. Also try getUser for more up-to-date data
            const { data: { user: authUser } } = await supabase.auth.getUser();

            const finalUser = authUser || session?.user;

            if (finalUser) {
                console.log("AppSidebar User:", finalUser);
                setUser(finalUser);
            }

            setIsLoaded(true);
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(session.user)
            } else {
                setUser(null)
            }
            setIsLoaded(true)
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    // Logic to determine display name
    // 1. user_metadata.full_name (Google often provides this)
    // 2. user_metadata.name
    // 3. user_metadata.custom_claims?.global_name
    // 4. email username part
    // 5. Fallback "Usuário"
    const getDisplayName = () => {
        if (!user) return "Usuário";

        const meta = user.user_metadata || {};

        if (meta.full_name) return meta.full_name;
        if (meta.name) return meta.name;
        if (meta.preferred_username) return meta.preferred_username;

        if (user.email) {
            // Check if email has a name part like "john.doe" -> "John Doe"
            const emailName = user.email.split("@")[0];
            // Format "john.doe" to "John Doe" if possible, otherwise just "john.doe"
            if (emailName.includes('.')) {
                return emailName.split('.').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
            }
            return emailName.charAt(0).toUpperCase() + emailName.slice(1); // Capitalize first letter
        }

        return "Usuário";
    }

    const userName = getDisplayName();
    const userEmail = user?.email || ""
    const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""
    const userInitials = userName.substring(0, 2).toUpperCase();

    // Check if subscription data exists in metadata, otherwise default to "Plano Premium" if that's the default
    // Or if the user IS a premium user. For now, we assume everyone is premium as per instruction context, 
    // but we can hide it if we want less clutter. The user complained about "USUARIO PREMIUM". 
    // If we have a real name, showing "Plano Premium" below is fine as a status.
    const userPlan = user?.user_metadata?.plan || "Plano Premium";

    return (
        <Sidebar collapsible="icon" {...props} className="bg-zinc-950 border-r border-white/5 shadow-2xl">
            <SidebarHeader className="pb-2 pt-4 px-4 group-data-[collapsible=icon]:px-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                            <div className="group-data-[collapsible=icon]:hidden transition-all hover:scale-105 duration-300">
                                <Logo />
                            </div>
                            {/* Fallback Icon for Collapsed State with Glow */}
                            <div className="hidden group-data-[collapsible=icon]:flex aspect-square size-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                                <Scale16SolidIcon size={22} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            </div>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-3 gap-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <SidebarGroup>
                    <SidebarMenu className="gap-1">
                        <SidebarGroupLabel className="uppercase tracking-[0.2em] text-[10px] text-zinc-500 font-bold px-4 mb-2 mt-2 group-data-[collapsible=icon]:hidden opacity-80">
                            Dashboard
                        </SidebarGroupLabel>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname === "/dashboard"} size="default" className="rounded-xl px-4 font-semibold sidebar-item transition-all duration-300 hover:bg-emerald-500/5 hover:text-emerald-400 active:scale-95 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-10">
                                <Link href="/dashboard" className="flex items-center gap-3">
                                    <LayoutDashboard className={cn("opacity-70 transition-colors", pathname === "/dashboard" ? "text-emerald-400 opacity-100" : "group-hover:text-emerald-400")} />
                                    <span className={cn(pathname === "/dashboard" && "text-emerald-400", "group-data-[collapsible=icon]:hidden")}>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarMenu className="gap-1">
                        <SidebarGroupLabel className="uppercase tracking-[0.2em] text-[10px] text-zinc-500 font-bold px-4 mb-2 mt-4 group-data-[collapsible=icon]:hidden opacity-80">
                            Jurídico
                        </SidebarGroupLabel>
                        {[
                            { href: "/peticoes", label: "Petições", icon: FileText, color: "text-blue-400" },
                            // { href: "/processos", label: "Processos", icon: Briefcase, color: "text-purple-400" },
                            { href: "/clientes", label: "Clientes", icon: Users, color: "text-amber-400" },
                            { href: "/tarefas", label: "Tarefas", icon: CheckSquare, color: "text-indigo-400" },
                            { href: "/docs", label: "Docs", icon: FileText, color: "text-blue-500" },
                            { href: "/integracoes", label: "Integrações", icon: Zap, color: "text-amber-600" },
                            { href: "/whatsapp", label: "WhatsApp", icon: FaWhatsapp, color: "text-emerald-500" },
                            { href: "/customizar-documentacao", label: "Customização", icon: Palette, color: "text-pink-400" },
                            { href: "/documentacao", label: "Documentação", icon: BookOpen, color: "text-cyan-400" },
                        ].map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.label}
                                    isActive={pathname.startsWith(item.href)}
                                    className="rounded-xl px-4 font-semibold sidebar-item transition-all duration-300 hover:bg-white/5 active:scale-95 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-10"
                                >
                                    <Link href={item.href} className="flex items-center gap-3">
                                        <item.icon className={cn("opacity-70 transition-all", pathname.startsWith(item.href) ? `${item.color} opacity-100` : "group-hover:opacity-100")} />
                                        <span className={cn(pathname.startsWith(item.href) && "text-white", "group-data-[collapsible=icon]:hidden")}>{item.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarMenu className="gap-1">
                        <SidebarGroupLabel className="uppercase tracking-[0.2em] text-[10px] text-zinc-500 font-bold px-4 mb-2 mt-4 group-data-[collapsible=icon]:hidden opacity-80">
                            IA Intelligence
                        </SidebarGroupLabel>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Ajuri X" isActive={pathname.startsWith("/ajuri-x")} className="rounded-xl px-4 font-bold sidebar-item transition-all duration-500 bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] active:scale-95 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-10">
                                <Link href="/ajuri-x" className="flex items-center gap-3">
                                    <Scale16SolidIcon className="text-emerald-500 w-5 h-5 flex-shrink-0 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" size="100%" color="currentColor" />
                                    <span className="text-emerald-500 tracking-wider group-data-[collapsible=icon]:hidden">AJURI X</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {/*
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Agente Ajuri X" isActive={pathname.startsWith("/assistentes-ia")} className="rounded-xl px-4 font-semibold sidebar-item transition-all duration-300 hover:bg-white/5 active:scale-95 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-10">
                                <Link href="/assistentes-ia" className="flex items-center gap-3">
                                    <Bot className={cn("opacity-70 transition-colors", pathname.startsWith("/assistentes-ia") ? "text-emerald-400 opacity-100" : "group-hover:text-emerald-400")} />
                                    <span className="group-data-[collapsible=icon]:hidden">Agente Ajuri X</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        */}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 bg-black/20 border-t border-white/5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <SidebarMenuButton
                                asChild
                                size="lg"
                                className="data-[state=open]:bg-white/5 data-[state=open]:text-white rounded-xl transition-all duration-300 hover:bg-white/5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                            >
                                <DropdownMenuTrigger className="focus-visible:outline-none focus-visible:ring-0">
                                    <div className="relative">
                                        <Avatar className="h-9 w-9 rounded-lg border border-white/10 shadow-lg">
                                            <AvatarImage src={userAvatar} alt={userName} />
                                            <AvatarFallback className="rounded-lg bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">{userInitials}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold text-zinc-200">{userName}</span>
                                        <span className="truncate text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{userPlan}</span>
                                    </div>
                                    <MoreHorizontal className="ml-auto size-4 text-zinc-600 group-data-[collapsible=icon]:hidden" />
                                </DropdownMenuTrigger>
                            </SidebarMenuButton>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10 bg-zinc-950 backdrop-blur-2xl"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={12}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-3 px-4 py-3 text-left text-sm bg-white/5 rounded-t-2xl">
                                        <Avatar className="h-10 w-10 rounded-xl border border-white/10">
                                            <AvatarImage src={userAvatar} alt={userName} />
                                            <AvatarFallback className="rounded-xl bg-emerald-500/10 text-emerald-500 font-bold">{userInitials}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-bold text-zinc-200">{userName}</span>
                                            <span className="truncate text-xs text-zinc-500">{userEmail}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuGroup className="p-2">
                                    <DropdownMenuItem className="rounded-xl cursor-pointer py-2 focus:bg-emerald-500/10 focus:text-emerald-400 transition-colors" onClick={() => router.push('/configuracoes')}>
                                        <Settings className="mr-3 h-4 w-4" />
                                        <span className="font-medium">Configurações da Conta</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <div className="p-2">
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 focus:bg-red-400/10 rounded-xl cursor-pointer py-2 transition-colors font-semibold">
                                        <LogOut className="mr-3 h-4 w-4" />
                                        Sair da conta
                                    </DropdownMenuItem>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
