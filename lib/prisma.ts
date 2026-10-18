import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

let prismaInstance: PrismaClient | null = null

export function setPrismaDb(db: unknown): void {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      adapter: new PrismaD1(db as any),
      log:
        process.env.NODE_ENV === 'development'
          ? ['error', 'warn']
          : [],
    })
    globalForPrisma.prisma = prismaInstance
  }
}

export function getPrisma(db?: unknown): PrismaClient {
  if (prismaInstance) return prismaInstance

  const dbInstance = db || (globalThis as any).DB || process.env.DB
  if (!dbInstance) {
    throw new Error(
      'Prisma D1 binding not initialized. Call setPrismaDb(db) from middleware or route handler first.'
    )
  }

  prismaInstance = new PrismaClient({
    adapter: new PrismaD1(dbInstance as any),
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : [],
  })
  globalForPrisma.prisma = prismaInstance
  return prismaInstance
}

export const prisma = new Proxy({} as PrismaClient, {
  get(target: any, prop: string) {
    const instance = getPrisma()
    return (instance as PrismaClient)[prop as keyof PrismaClient]
  },
})

export default prisma