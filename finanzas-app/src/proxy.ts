import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isAuthenticated = !!req.auth

  const isLoginPage = nextUrl.pathname === '/login'
  const isApiAuth = nextUrl.pathname.startsWith('/api/auth')

  if (isApiAuth) return NextResponse.next()

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
