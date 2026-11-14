// app/api/students/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl; // idiomatic NextRequest, not new URL()

  const delay = Number(searchParams.get("delay") ?? 0);
  const fail = searchParams.get("fail");
  const random = searchParams.get("random");

  if (delay > 0) await sleep(delay);

  if (fail) {
    const status = Number(fail);
    if (!Number.isInteger(status) || status < 100 || status > 599) {
      return NextResponse.json(
        { error: "`fail` must be a valid HTTP status code" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { errorCode: status, errorMessage: `Simulated error ${status}` },
      { status }
    );
  }

  if (random && Math.random() < Number(random)) {
    return NextResponse.json({ error: "Random simulated failure" }, { status: 500 });
  }

  const students = [
    { id: 1, name: "John Doe", email: "john.doe@example.com" },
    { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
  ];
  return NextResponse.json({ ok: true, students });
}
// /api/students?delay=3000	            Responds after 3 seconds
// /api/students?fail=500	            Returns 500 immediately
// /api/students?fail=404	            Returns 404
// /api/students?delay=2000&fail=503	Waits 2s, then returns 503
// /api/students?random=0.5	            Fails about half the time