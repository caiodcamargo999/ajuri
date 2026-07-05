"use client";
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { getCalApi } from "@calcom/embed-react"

const menuItems = [
    { name: 'Funcionalidades', href: '#features' },
    { name: 'Solução', href: '#solution' },
    { name: 'Preços', href: '#pricing' },
    { name: 'Sobre', href: '#about' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    React.useEffect(() => {
        (async function () {
            const cal = await getCalApi({"namespace":"60min"});
            cal("ui", {"theme":"dark","cssVarsPerTheme":{"dark":{"cal-brand":"#4c69e9"}, "light":{"cal-brand":"#4c69e9"}},"hideEventTypeDetails":false,"layout":"month_view"});
        })();
    }, [])

    return (
        <header>
            <nav
                className="fixed z-20 w-full px-2 mt-4">
                <div className={cn('mx-auto mt-2 max-w-7xl px-4 transition-all duration-300 lg:px-8', isScrolled && 'bg-background/80 max-w-6xl rounded-2xl border backdrop-blur-lg lg:px-6')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2 scale-110 origin-left">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className={cn("m-auto size-6 duration-200", menuState ? "rotate-180 scale-0 opacity-0" : "")} />
                                <X className={cn("absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200", menuState ? "rotate-0 scale-100 opacity-100" : "")} />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-6 text-sm font-medium">
                                {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150 transition-colors">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={cn("bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent", menuState ? "block" : "hidden lg:flex")}>
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setMenuState(false)}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Link href="/login">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full w-full sm:w-auto"
                                    >
                                        <span>Login</span>
                                    </Button>
                                </Link>
                                <Button
                                    size="sm"
                                    className="rounded-full w-full sm:w-auto"
                                    data-cal-namespace="60min"
                                    data-cal-link="backofficebr/60min"
                                    data-cal-config='{"layout":"month_view","theme":"dark"}'
                                >
                                    <span>Falar com Vendas</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

export const Header = HeroHeader
