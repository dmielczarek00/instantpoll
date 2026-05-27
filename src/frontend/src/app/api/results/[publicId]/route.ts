import { NextRequest, NextResponse } from "next/server";
import type { PollResults } from "@/types/api";

const RESULTS_SERVICE_URL = process.env.RESULTS_SERVICE_URL;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const { publicId } = await params;

  if (RESULTS_SERVICE_URL) {
    const res = await fetch(`${RESULTS_SERVICE_URL}/results/${publicId}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }
}