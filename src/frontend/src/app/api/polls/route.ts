import { NextRequest, NextResponse } from "next/server";
import type { CreatePollRequest, CreatePollResponse } from "@/types/api";

const POLL_SERVICE_URL = process.env.POLL_SERVICE_URL;

export async function POST(req: NextRequest) {
  try {
    const body: CreatePollRequest = await req.json();

    // Walidacja podstawowa
    if (!body.title?.trim()) {
      return NextResponse.json(
        { message: "Tytuł ankiety jest wymagany" },
        { status: 400 }
      );
    }
    if (!body.questions?.length) {
      return NextResponse.json(
        { message: "Ankieta musi mieć co najmniej jedno pytanie" },
        { status: 400 }
      );
    }
    for (const q of body.questions) {
      if (!q.text?.trim()) {
        return NextResponse.json(
          { message: "Każde pytanie musi mieć treść" },
          { status: 400 }
        );
      }
      if (q.options.length < 2) {
        return NextResponse.json(
          { message: "Każde pytanie musi mieć co najmniej 2 opcje" },
          { status: 400 }
        );
      }
    }

    if (POLL_SERVICE_URL) {
      const res = await fetch(`${POLL_SERVICE_URL}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

  } catch (err) {
    console.error("[POST /api/polls]", err);
    return NextResponse.json(
      { message: "Wystąpił błąd serwera" },
      { status: 500 }
    );
  }
}
