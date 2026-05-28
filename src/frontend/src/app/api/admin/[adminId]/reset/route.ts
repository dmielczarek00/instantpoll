import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  const { adminId } = await params;

  const res = await fetch(
    `${process.env.VOTE_SERVICE_URL}/votes/admin/${adminId}/reset`,
    { method: "POST" }
  );

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}