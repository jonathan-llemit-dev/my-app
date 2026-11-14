// app/api/subjects/route.ts
import { NextResponse } from "next/server";

// No try/catch on purpose:
// Next.js already returns a 500 when an error is thrown, and a broad catch
// would also swallow the framework's internal "stop" signals (like the one
// that tells the build "this route can't be static").
//
// No `request` argument either: nothing here depends on the request, so the
// build prerenders this response once and serves it from cache ("Static").
export async function GET() {
  return NextResponse.json({ ok: true });
}
