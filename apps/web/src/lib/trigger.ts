// Trigger.dev client configuration for the web app
// This allows the web app to trigger tasks in the worker

export interface IngestListingPayload {
  listingId: string;
  sourceUrl: string;
  agentId: string;
  categoryId?: string;
  locationId?: string;
}

export interface IngestStorefrontPayload {
  jobId: string;
  storefrontUrl: string;
  agentId: string;
  categoryId?: string;
  locationId?: string;
  storefrontId?: string;
  maxListings?: number;
}

// In production, this would use the Trigger.dev SDK to trigger tasks
// For now, we'll create a mock implementation that can be replaced

export async function triggerIngestListing(payload: IngestListingPayload) {
  // TODO: Replace with actual Trigger.dev task trigger
  // import { tasks } from "@trigger.dev/sdk/v3";
  // const handle = await tasks.trigger("ingest-listing", payload);
  // return handle;

  console.log("[Trigger] Queueing ingest-listing task", payload);

  // Mock response
  return {
    id: `run_${Date.now()}`,
    status: "queued",
    payload,
  };
}

export async function triggerIngestStorefront(payload: IngestStorefrontPayload) {
  // TODO: Replace with actual Trigger.dev task trigger
  // import { tasks } from "@trigger.dev/sdk/v3";
  // const handle = await tasks.trigger("ingest-storefront", payload);
  // return handle;

  console.log("[Trigger] Queueing ingest-storefront task", payload);

  // Mock response
  return {
    id: `run_${Date.now()}`,
    status: "queued",
    payload,
  };
}

export async function getTaskRunStatus(runId: string) {
  // TODO: Replace with actual Trigger.dev run status check
  // import { runs } from "@trigger.dev/sdk/v3";
  // const run = await runs.retrieve(runId);
  // return run;

  console.log("[Trigger] Checking run status", runId);

  // Mock response
  return {
    id: runId,
    status: "completed",
  };
}
