import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { setPrismaDb } from '@/lib/prisma'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Initialize Prisma with D1 binding from Cloudflare Pages environment
  const env = (request as any).env || (request as any).context?.env
  if (env?.DB) {
    setPrismaDb(env.DB)
  }

  // For HTML pages, prevent caching to ensure latest version is always fetched
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.endsWith('.html')) {
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  } else if (request.nextUrl.pathname.startsWith('/api/')) {
    // API responses shouldn't be cached
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  } else {
    // Static assets can be cached with long TTL (they have hash in filename)
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
