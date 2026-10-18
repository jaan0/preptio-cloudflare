import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

/**
 * Resolve the Cloudflare D1 binding for the current request.
 *
 * On Cloudflare Workers (OpenNext) bindings are NOT injected into
 * `globalThis.DB` nor `process.env` — they are exposed through
 * `@opennextjs/cloudflare`, which stores the request context (env, ctx, cf)
 * in AsyncLocalStorage and publishes it on the global scope under this symbol.
 *
 * The symbol lookup is intentionally done without importing the package so
 * this module stays safe to import in scripts/tests.
 */
function getD1Binding(): unknown {
  try {
    const context = (globalThis as never as Record<symbol, { env?: Record<string, unknown> } | undefined>)[
      Symbol.for('__cloudflare-context__')
    ]
    const db = context?.env?.DB
    if (db) return db
  } catch {
    // No request context (build time, scripts, tests) — fall through.
  }

  // Fallback for plain Workers/Pages runtimes that expose bindings globally.
  const direct = (globalThis as never as { DB?: unknown }).DB
  if (direct && typeof direct === 'object') return direct

  return undefined
}

/**
 * Lazily create the PrismaClient bound to the D1 binding.
 * Initialization happens on first query, i.e. inside a request, where the
 * Cloudflare context is guaranteed to be available.
 */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const db = getD1Binding()

    if (!db) {
      throw new Error(
        'Prisma: D1 binding "DB" is not available. ' +
          'Make sure the "DB" binding (preptio-db) is configured in wrangler.jsonc and that this code runs during a request.'
      )
    }

    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaD1(db as never),
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : [],
    })
  }

  return globalForPrisma.prisma
}

/**
 * Singleton proxy: every `import { prisma } from '@/lib/prisma'` triggers
 * lazy initialization on first property access, so route handlers never have
 * to pass the D1 binding around manually.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance = getPrisma() as never as Record<PropertyKey, unknown>
    return instance[prop]
  },
  has(_target, prop) {
    const instance = getPrisma() as never as object
    return prop in instance
  },
})

export default prisma
