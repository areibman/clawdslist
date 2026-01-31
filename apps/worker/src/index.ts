import { Worker, Queue, Job } from 'bullmq';
import IORedis from 'ioredis';
import { processIngestionJob } from './jobs/ingestion';
import { prisma } from './db';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis connection
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Job queue
const queue = new Queue('clawdslist', { connection });

// Worker
const worker = new Worker(
  'clawdslist',
  async (job: Job) => {
    console.log(`🦞 Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'INGEST_URL':
        return processIngestionJob(job.data);
      default:
        console.log(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

// Poll database for pending jobs and add to queue
async function pollForJobs() {
  try {
    const pendingJobs = await prisma.job.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: new Date() },
        attempts: { lt: prisma.job.fields.maxAttempts },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      take: 10,
    });

    for (const job of pendingJobs) {
      // Mark as processing
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'PROCESSING',
          startedAt: new Date(),
          attempts: { increment: 1 },
        },
      });

      // Add to BullMQ queue
      await queue.add(job.type, {
        ...job.payload as object,
        jobId: job.id,
      });
    }
  } catch (error) {
    console.error('Error polling for jobs:', error);
  }
}

// Start polling
const pollInterval = setInterval(pollForJobs, 5000);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🦞 Worker shutting down...');
  clearInterval(pollInterval);
  await worker.close();
  await connection.quit();
  await prisma.$disconnect();
  process.exit(0);
});

console.log('🦞 Clawdslist worker started!');
