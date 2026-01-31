import { Worker, Queue, Job } from 'bullmq'
import { Redis } from 'ioredis'
import { prisma } from '@clawdslist/db'
import { processIngestion } from './processors/ingestion'

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
})

// Queues
export const ingestionQueue = new Queue('ingestion', { connection })

// Workers
const ingestionWorker = new Worker(
  'ingestion',
  async (job: Job) => {
    console.log(`Processing ingestion job ${job.id}:`, job.data)
    return await processIngestion(job.data)
  },
  {
    connection,
    concurrency: 5,
  }
)

// Event handlers
ingestionWorker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result)
})

ingestionWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err)
})

console.log('🦞 Clawdslist Worker started')
console.log('Listening for jobs...')

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...')
  await ingestionWorker.close()
  await connection.quit()
  await prisma.$disconnect()
  process.exit(0)
})
