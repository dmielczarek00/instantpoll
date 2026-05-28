import { NextRequest, NextResponse } from "next/server";
import type { UpdatePollSettingsRequest } from "@/types/api";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  const { adminId } = await params;

  const [pollRes, resultsRes] = await Promise.all([
    fetch(`${process.env.POLL_SERVICE_URL}/polls/admin/${adminId}`),
    fetch(`${process.env.RESULTS_SERVICE_URL}/results/admin/${adminId}`),
  ]);

  if (!pollRes.ok || !resultsRes.ok) {
    return NextResponse.json(
      { message: "Błąd pobierania danych" },
      { status: 500 }
    );
  }

  const poll = await pollRes.json();
  const results = await resultsRes.json();

  const host = _req.headers.get("x-forwarded-host") ?? _req.headers.get("host") ?? "localhost:3000";
  const proto = _req.headers.get("x-forwarded-proto") ?? "http";
  const appUrl = `${proto}://${host}`;

  return NextResponse.json({
    poll,
    results,
    publicUrl: `${appUrl}/poll/${poll.publicId}`,
    adminUrl: `${appUrl}/admin/${adminId}`,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  const { adminId } = await params;
  const body = await req.json();

  const res = await fetch(
    `${process.env.POLL_SERVICE_URL}/polls/admin/${adminId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { message: "Nie udało się zaktualizować ankiety" },
      { status: 500 }
    );
  }

  const updatedPoll = await res.json();

  return NextResponse.json(updatedPoll);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ adminId: string }> }
) {
  const { adminId } = await params;

  const res = await fetch(
    `${process.env.POLL_SERVICE_URL}/polls/admin/${adminId}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { message: "Nie udało się usunąć ankiety" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}