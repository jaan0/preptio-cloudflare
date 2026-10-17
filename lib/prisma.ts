import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

let prismaInstance: PrismaClient | null = null
let isInitialized = false

export function setPrismaDb(db: unknown): void {
  if (!isInitialized) {
    prismaInstance = new PrismaClient({
      adapter: new PrismaD1({ db: db as any }),
      log:
        process.env.NODE_ENV === 'development'
          ? ['error', 'warn']
          : ['error'],
    })
    globalForPrisma.prisma = prismaInstance
    isInitialized = true
  }
}

export function getPrisma(db?: unknown): PrismaClient {
  if (db && !isInitialized) {
    setPrismaDb(db)
  }

  // Fallback: return existing instance or create one without adapter (for build time / safety)
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log:
        process.env.NODE_ENV === 'development'
          ? ['error', 'warn']
          : ['error'],
    })
    globalForPrisma.prisma = prismaInstance
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
