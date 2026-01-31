import { NextRequest } from "next/server";

export const parseRequestBody = async (
  req: NextRequest
): Promise<Record<string, any>> => {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return req.json();
  }

  const formData = await req.formData();
  const data: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
};
