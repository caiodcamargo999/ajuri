import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const isPasswordRecovery = next === '/auth/update-password'

            // Skip whitelist check for password recovery — user is already a valid Supabase Auth user
            if (!isPasswordRecovery) {
                const { data: { user } } = await supabase.auth.getUser()

                if (user?.email) {
                    const { data: whitelistedUser } = await supabase
                        .from('whitelist')
                        .select('email')
                        .ilike('email', user.email.trim())
                        .maybeSingle()

                    if (!whitelistedUser) {
                        await supabase.auth.signOut()
                        return NextResponse.redirect('https://cal.com/backofficebr/60min')
                    }
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
