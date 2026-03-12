import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure Prisma for serverless environments (Vercel + Supabase)
// Connection pool optimization for Supabase free tier
export function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DB_URL ||
    ''
  )
}

export function hasDatabaseConfig() {
  return Boolean(resolveDatabaseUrl())
}

function createPrismaClient() {
  const connectionString = resolveDatabaseUrl()

  if (!connectionString) {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }

  let datasourceUrl = connectionString

  try {
    // Parse and enhance connection string with pool settings
    const enhancedUrl = new URL(connectionString)

    // Add connection pool parameters
    enhancedUrl.searchParams.set('pgbouncer', 'true') // Use Supabase pooler
    enhancedUrl.searchParams.set('connection_limit', '10')
    enhancedUrl.searchParams.set('pool_timeout', '30')
    datasourceUrl = enhancedUrl.toString()
  } catch {
    datasourceUrl = connectionString
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: datasourceUrl,
      },
    },
  })
}

// Single instance pattern for serverless - reuse connection
export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Graceful shutdown for local development
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await db.$disconnect()
  })
}
