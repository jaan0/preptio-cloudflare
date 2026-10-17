import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

let prismaInstance: PrismaClient | null = null

/**
 * Initialize Prisma with a D1 database binding.
 * Call this from middleware or route handlers with `context.env.DB`.
 */
export function setPrismaDb(db: unknown): void {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      adapter: new PrismaD1({ db: db as any }),
      log:
        process.env.NODE_ENV === 'development'
          ? ['error', 'warn']
          : ['error'],
    })
    globalForPrisma.prisma = prismaInstance
  }
}

/**
 * Get the Prisma client instance. Initializes with `db` if provided and not yet initialized.
 */
export function getPrisma(db?: unknown): PrismaClient {
  if (db && !prismaInstance) {
    setPrismaDb(db)
  }
  if (!prismaInstance) {
    throw new Error(
      'Prisma D1 binding not initialized. Call setPrismaDb(db) from middleware or route handler first.'
    )
  }
  return prismaInstance
}

// Backward-compatible singleton — delegates to the initialized instance
export const prisma = new Proxy({}, {
  get(target: unknown, prop: string) {
    const instance = getPrisma()
    return (instance as PrismaClient)[prop as keyof PrismaClient]
  },
})

export default prisma
