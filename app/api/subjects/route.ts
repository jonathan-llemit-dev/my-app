import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}