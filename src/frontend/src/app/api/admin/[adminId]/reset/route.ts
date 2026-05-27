import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  const { adminId } = await params;

  const res = await fetch(`${process.env.POLL_SERVICE_URL}/admin/${adminId}/reset`, {
    method: "POST",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}