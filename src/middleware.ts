import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

const protectedRoutes = [
    '/dashboard',
    '/courses',
    '/goals',
    '/tasks',
    '/notes',
    '/study-tracker',
    '/timetable',
    '/settings',
    '/ai-tools',
    '/daily-activities',
    '/weekly-plan',
]

const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/join',
    '/terms',
    '/privacy',
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // This is the crucial part:
  // Exclude service worker and other public files from auth logic.
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/static') ||
    req.nextUrl.pathname.includes('.') // Generally, files with extensions
  ) {
    return res
  }

  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtectedRoute = protectedRoutes.some(path => req.nextUrl.pathname.startsWith(path));

  // if user is not signed in and the current path is protected
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // if user is signed in and the current path is a public route
  if (user && publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}
