import { API_ROUTES } from "@/constants/api-routes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface IngestResponse {
  session_id: string;
  chunk_count: number;
  message: string;
}

export async function ingestContent(
  text?: string,
  file?: File,
): Promise<IngestResponse> {
  const formData = new FormData();
  if (text) {
    formData.append("text", text);
  }
  if (file) {
    formData.append("file", file);
  }

  const response = await fetch(API_BASE_URL + API_ROUTES.INGEST, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to process context.");
  }

  return response.json();
}
