import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code" }, { status: 400 });
  }

  return NextResponse.redirect(new URL("/", request.url));
}