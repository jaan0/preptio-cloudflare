import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { setPrismaDb } from '@/lib/prisma'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Initialize Prisma with D1 binding from Cloudflare Pages environment
  const db = (request as any).env?.DB || (globalThis as any).DB || process.env.DB
  if (db) {
    setPrismaDb(db)
  }

  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.endsWith('.html')) {
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  } else if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  } else {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}