import { storefronts } from "../../../lib/mock-data";

export async function GET() {
  return Response.json({
    data: storefronts,
    count: storefronts.length,
  });
}
