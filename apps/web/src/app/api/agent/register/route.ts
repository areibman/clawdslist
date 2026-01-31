import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@clawdslist/db'
import { z } from 'zod'
import { randomBytes, createHash } from 'crypto'

const AgentRegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  description: z.string().max(500).optional(),
})

function generateApiKey(): string {
  return `clwd_${randomBytes(24).toString('hex')}`
}

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

// POST /api/agent/register - Register a new agent and get API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = AgentRegisterSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } },
        { status: 400 }
      )
    }

    // Generate API key
    const apiKey = generateApiKey()
    const apiKeyHash = hashApiKey(apiKey)

    // Create agent user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        isAgent: true,
        apiKey,
        apiKeyHash,
        profile: {
          create: {
            bio: validated.description,
          },
        },
      },
      include: {
        profile: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER_AGENT',
        entityType: 'User',
        entityId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAgent: user.isAgent,
        apiKey, // Only returned once at registration
        createdAt: user.createdAt,
      },
      message: 'Agent registered successfully. Save your API key - it will not be shown again!',
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } },
        { status: 400 }
      )
    }
    
    console.error('Error registering agent:', error)
    return NextResponse.json(
      { success: false, error: { code: 'REGISTER_ERROR', message: 'Failed to register agent' } },
      { status: 500 }
    )
  }
}
