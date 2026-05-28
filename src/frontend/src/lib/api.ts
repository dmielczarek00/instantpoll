import type { CreatePollRequest, CreatePollResponse } from "@/types/api";
import type {
  Poll,
  PollResults,
  CastVoteRequest,
  AdminPollData,
  UpdatePollSettingsRequest,
} from "@/types/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Błąd sieci" }));
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function createPoll(data: CreatePollRequest): Promise<CreatePollResponse> {
  const res = await fetch(`/api/polls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<CreatePollResponse>(res);
}

export async function fetchPoll(publicId: string): Promise<Poll> {
  const res = await fetch(`/api/polls/${publicId}`);
  return handleResponse<Poll>(res);
}

export async function castVote(data: CastVoteRequest): Promise<{ success: boolean }> {
  const res = await fetch(`/api/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<{ success: boolean }>(res);
}

export async function fetchResults(publicId: string): Promise<PollResults> {
  const res = await fetch(`/api/results/${publicId}`);
  return handleResponse<PollResults>(res);
}

export async function fetchAdminData(adminId: string): Promise<AdminPollData> {
  const res = await fetch(`/api/admin/${adminId}`);
  return handleResponse<AdminPollData>(res);
}

export async function updatePollSettings(
  adminId: string,
  data: UpdatePollSettingsRequest
): Promise<AdminPollData> {
  const res = await fetch(`/api/admin/${adminId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<AdminPollData>(res);
}

export async function deletePoll(adminId: string): Promise<void> {
  const res = await fetch(`/api/admin/${adminId}`, {
    method: "DELETE",
  });

  return handleResponse<void>(res);
}

export async function resetVotes(adminId: string): Promise<AdminPollData> {
  const res = await fetch(`/api/admin/${adminId}/reset`, {
    method: "POST",
  });

  return handleResponse<AdminPollData>(res);
}