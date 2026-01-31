export async function POST(request) {
  const payload = await request.json().catch(() => ({}));

  return Response.json(
    {
      jobId: "ingest_reef_001",
      status: "queued",
      sourceUrl: payload.sourceUrl || "unknown",
      message: "Ingestion queued. Worker will normalize listings shortly.",
    },
    { status: 202 }
  );
}
