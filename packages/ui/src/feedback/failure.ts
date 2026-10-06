/**
 * The facts about a failed action that a diagnostics report may carry. Only these typed,
 * allow-listed fields: never a whole error or response object, never a refusal's free-text
 * detail or metadata (they can echo policy content).
 */
export interface Failure {
  /** The backend's machine code, such as "PERMISSION_DENIED". */
  code?: string;
  /** The operation that failed, such as "PublishPolicy". */
  operation?: string;
  /** The backend's reason symbol, such as "NOT_AUTHOR". */
  reason?: string;
  requestId?: string;
  /** The HTTP status of the failed call. */
  status?: number;
  traceId?: string;
}

const FIELDS = ["code", "operation", "reason", "requestId", "status", "traceId"] as const;

/** Copy only the allow-listed fields out of anything failure-shaped. */
export const toFailure = (value: Partial<Record<(typeof FIELDS)[number], unknown>>): Failure => {
  const out: Failure = {};
  for (const field of FIELDS) {
    const v = value[field];
    if (field === "status") {
      if (typeof v === "number" && Number.isFinite(v)) out.status = v;
    } else if (typeof v === "string" && v !== "") {
      out[field] = v;
    }
  }
  return out;
};
