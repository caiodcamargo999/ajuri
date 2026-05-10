"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import { ComponentProps, useEffect } from 'react'

type LinkWithProgressProps = ComponentProps<typeof Link>

export function LinkWithProgress({ href, onClick, ...props }: LinkWithProgressProps) {
    const router = useRouter()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // If it's an external link or has a target, don't intercept
        if (props.target || typeof href !== 'string' || href.startsWith('http')) {
            onClick?.(e)
            return
        }

        // Start progress bar
        NProgress.start()

        // Call original onClick if provided
        onClick?.(e)

        // If default wasn't prevented, navigate
        if (!e.defaultPrevented) {
            e.preventDefault()
            router.push(href)
        }
    }

    return <Link href={href} onClick={handleClick} {...props} />
}
