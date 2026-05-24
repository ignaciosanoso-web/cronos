import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isAuthRoute =
    nextUrl.pathname.startsWith('/vault') ||
    nextUrl.pathname.startsWith('/my-bids') ||
    nextUrl.pathname.startsWith('/petitions') ||
    nextUrl.pathname.startsWith('/curator')

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (session?.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  if (isAuthRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/vault/:path*',
    '/my-bids/:path*',
    '/petitions/:path*',
    '/curator/:path*',
  ],
}
