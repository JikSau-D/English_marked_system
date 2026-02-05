export function extractApiErrorMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;

  // FastAPI / Pydantic validation errors:
  // { detail: [ { loc: [...], msg: "...", type: "..." }, ... ] }
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((it) => (typeof it?.msg === "string" ? it.msg : null))
      .filter(Boolean) as string[];
    if (msgs.length) return msgs.join("；");
  }

  const msg = err?.message;
  if (typeof msg === "string" && msg.trim()) return msg;
  return fallback;
}

