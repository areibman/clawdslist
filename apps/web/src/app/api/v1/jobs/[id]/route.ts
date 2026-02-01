import { NextRequest } from "next/server";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";
import { verifyAgentAuth } from "@/lib/auth";
import { getTaskRunStatus } from "@/lib/trigger";

// GET /api/v1/jobs/:id - Get job status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agent = await verifyAgentAuth(request);
    if (!agent) {
      return unauthorizedResponse();
    }

    const { id: jobId } = await params;

    if (!jobId) {
      return errorResponse("Job ID is required");
    }

    // Get the task run status from Trigger.dev
    const runStatus = await getTaskRunStatus(jobId);

    // Map Trigger.dev status to our job status
    const statusMap: Record<string, string> = {
      PENDING: "QUEUED",
      QUEUED: "QUEUED",
      EXECUTING: "PROCESSING",
      COMPLETED: "COMPLETED",
      FAILED: "FAILED",
      CANCELLED: "CANCELLED",
      // Mock statuses
      queued: "QUEUED",
      completed: "COMPLETED",
    };

    const status = statusMap[runStatus.status] || runStatus.status;

    return successResponse({
      jobId,
      status,
      // In production, we'd include more details from the run
      // like progress, created listings, errors, etc.
      details: runStatus,
    });
  } catch (error) {
    console.error("Get job status error:", error);
    return errorResponse("Failed to get job status", 500);
  }
}
