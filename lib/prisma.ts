import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to handle database errors
export function handlePrismaError(error: any): {
  message: string
  code: string
  statusCode: number
} {
  // Unique constraint violation
  if (error.code === 'P2002') {
    const target = error.meta?.target
    return {
      message: `A record with this ${target} already exists`,
      code: 'UNIQUE_VIOLATION',
      statusCode: 409,
    }
  }

  // Record not found
  if (error.code === 'P2025') {
    return {
      message: 'Record not found',
      code: 'NOT_FOUND',
      statusCode: 404,
    }
  }

  // Foreign key constraint violation
  if (error.code === 'P2003') {
    return {
      message: 'Referenced record does not exist',
      code: 'FOREIGN_KEY_VIOLATION',
      statusCode: 400,
    }
  }

  // Required field missing
  if (error.code === 'P2012') {
    return {
      message: 'Required field is missing',
      code: 'MISSING_FIELD',
      statusCode: 400,
    }
  }

  // Generic database error
  return {
    message: 'An error occurred while processing your request',
    code: 'DATABASE_ERROR',
    statusCode: 500,
  }
}

// Transaction helper with retry logic
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 100
): Promise<T> {
  let lastError: any
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on client errors
      if (error.code && error.code.startsWith('P2')) {
        throw error
      }
      
      // Wait before retrying with exponential backoff
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }
  
  throw lastError
}

// Pagination helper
export interface PaginationParams {
  page?: number
  limit?: number
  orderBy?: any
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export async function paginate<T>(
  model: any,
  {
    page = 1,
    limit = 10,
    orderBy = { createdAt: 'desc' },
    where = {},
    include = {},
    select = undefined,
  }: PaginationParams & { where?: any; include?: any; select?: any }
): Promise<PaginatedResult<T>> {
  const skip = (page - 1) * limit
  
  const [total, data] = await Promise.all([
    model.count({ where }),
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      ...(include && { include }),
      ...(select && { select }),
    }),
  ])
  
  const totalPages = Math.ceil(total / limit)
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

export default prisma