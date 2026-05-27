import { NextRequest, NextResponse } from "next/server";
import type { Poll } from "@/types/poll";

const POLL_SERVICE_URL = process.env.POLL_SERVICE_URL;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  const { publicId } = await params;

  if (POLL_SERVICE_URL) {
    const res = await fetch(`${POLL_SERVICE_URL}/polls/${publicId}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

}