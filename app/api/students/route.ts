import { NextRequest, NextResponse } from "next/server";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const delay = Number(searchParams.get("delay") ?? 0);
    const fail = searchParams.get("fail"); // e.g. "500", "404"
    const random = searchParams.get("random"); // e.g. "0.3" = 30% failure chance

    if (delay > 0) await sleep(delay);

    if (fail) {
      return NextResponse.json(
        { errorCode: Number(fail), errorMessage: `Simulated error ${fail}` },
        { status: Number(fail) }
      );
    }

    if (random && Math.random() < Number(random)) {
      throw new Error("Random simulated failure");
    }

    const students = [
      { id: 1, name: "John Doe", email: "john.doe@example.com" },
      { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
    ];
    return NextResponse.json({ ok: true, students });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// /api/students?delay=3000	            Responds after 3 seconds
// /api/students?fail=500	            Returns 500 immediately
// /api/students?fail=404	            Returns 404
// /api/students?delay=2000&fail=503	Waits 2s, then returns 503
// /api/students?random=0.5	            Fails about half the time