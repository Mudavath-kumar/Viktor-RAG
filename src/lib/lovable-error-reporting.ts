// Generic error reporting utility
export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[Viktor RAG Error]", error, context);
}
