import { NextResponse } from "next/server";
import { getCurrentMembership } from "@/lib/permissions";

export async function GET() {
  const membership = await getCurrentMembership();

  return NextResponse.json({
    status: membership?.status ?? null,
  });
}
