export async function GET() {
  return Response.json({
    status: "ok",
    service: "clawdslist-web",
    timestamp: new Date().toISOString(),
  });
}
