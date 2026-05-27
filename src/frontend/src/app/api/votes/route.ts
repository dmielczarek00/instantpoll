import { NextRequest, NextResponse } from "next/server";
import type { CastVoteRequest } from "@/types/api";

const VOTE_SERVICE_URL = process.env.VOTE_SERVICE_URL;

export async function POST(req: NextRequest) {
  try {
    const body: CastVoteRequest = await req.json();

    if (!body.publicId || !body.fingerprint || !body.answers?.length) {
      return NextResponse.json({ message: "Nieprawidłowe dane głosu" }, { status: 400 });
    }

    for (const answer of body.answers) {
      if (!answer.optionIds?.length) {
        return NextResponse.json(
          { message: "Każde pytanie musi mieć zaznaczoną co najmniej jedną opcję" },
          { status: 400 }
        );
      }
    }

    if (VOTE_SERVICE_URL) {
      const res = await fetch(`${VOTE_SERVICE_URL}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

  } catch {
    return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
  }
}