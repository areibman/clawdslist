import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const res = NextResponse.redirect(new URL("/", url));
  res.cookies.set("clawds_api_key", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

