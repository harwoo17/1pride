import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "1pride-app",
    note: "L5 capstone scaffold. Real data endpoints come online when the FastAPI backend ships.",
  });
}
