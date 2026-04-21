// Shared Outlook mail sender with retry + exponential backoff.
// Handles transient errors (429, 5xx, network timeouts) automatically.

const GATEWAY_URL = "https://connector-gateway.lovable.dev/microsoft_outlook";

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string[];
  bcc?: string[];
  saveToSentItems?: boolean;
}

export interface SendMailResult {
  ok: boolean;
  status?: number;
  error?: string;
  attempts: number;
  durationMs: number;
  permanent?: boolean; // true => no point retrying later
}

interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
}

const DEFAULTS: Required<RetryOptions> = {
  maxAttempts: 4,
  baseDelayMs: 800,
  maxDelayMs: 8_000,
  timeoutMs: 15_000,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function jitter(ms: number): number {
  // ±25% jitter to avoid thundering herd
  const delta = ms * 0.25;
  return Math.round(ms - delta + Math.random() * delta * 2);
}

function isTransientStatus(status: number): boolean {
  // 408 timeout, 425 too early, 429 rate limit, 5xx server errors
  return status === 408 || status === 425 || status === 429 || (status >= 500 && status <= 599);
}

function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (!Number.isNaN(seconds) && seconds >= 0) return Math.min(seconds * 1000, 30_000);
  // HTTP-date form
  const dateMs = Date.parse(value);
  if (!Number.isNaN(dateMs)) return Math.max(0, Math.min(dateMs - Date.now(), 30_000));
  return null;
}

export async function sendOutlookMail(
  opts: SendMailOptions,
  retry: RetryOptions = {}
): Promise<SendMailResult> {
  const cfg = { ...DEFAULTS, ...retry };
  const startedAt = Date.now();

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return { ok: false, error: "LOVABLE_API_KEY not configured", attempts: 0, durationMs: 0, permanent: true };
  }
  const OUTLOOK_KEY = Deno.env.get("MICROSOFT_OUTLOOK_API_KEY");
  if (!OUTLOOK_KEY) {
    return { ok: false, error: "MICROSOFT_OUTLOOK_API_KEY not configured", attempts: 0, durationMs: 0, permanent: true };
  }

  const payload = {
    message: {
      subject: opts.subject,
      body: { contentType: "HTML", content: opts.html },
      toRecipients: [{ emailAddress: { address: opts.to } }],
      ...(opts.cc?.length
        ? { ccRecipients: opts.cc.map((address) => ({ emailAddress: { address } })) }
        : {}),
      ...(opts.bcc?.length
        ? { bccRecipients: opts.bcc.map((address) => ({ emailAddress: { address } })) }
        : {}),
    },
    saveToSentItems: opts.saveToSentItems ?? true,
  };

  let lastError: string | undefined;
  let lastStatus: number | undefined;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), cfg.timeoutMs);

    try {
      const res = await fetch(`${GATEWAY_URL}/me/sendMail`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": OUTLOOK_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        return { ok: true, status: res.status, attempts: attempt, durationMs: Date.now() - startedAt };
      }

      lastStatus = res.status;
      const txt = await res.text().catch(() => "");
      lastError = `Outlook ${res.status}: ${txt.slice(0, 500)}`;

      // Permanent failure → stop immediately
      if (!isTransientStatus(res.status)) {
        console.error(`[outlook-mail] permanent failure to ${opts.to}: ${lastError}`);
        return {
          ok: false,
          status: res.status,
          error: lastError,
          attempts: attempt,
          durationMs: Date.now() - startedAt,
          permanent: true,
        };
      }

      // Transient → backoff (respect Retry-After if provided)
      const retryAfter = parseRetryAfter(res.headers.get("Retry-After"));
      const backoff = retryAfter ?? jitter(Math.min(cfg.baseDelayMs * 2 ** (attempt - 1), cfg.maxDelayMs));
      console.warn(
        `[outlook-mail] transient ${res.status} for ${opts.to} (attempt ${attempt}/${cfg.maxAttempts}), retrying in ${backoff}ms`
      );
      if (attempt < cfg.maxAttempts) await sleep(backoff);
    } catch (e) {
      clearTimeout(timer);
      const isAbort = (e as Error).name === "AbortError";
      lastError = isAbort ? `timeout after ${cfg.timeoutMs}ms` : (e as Error).message;
      console.warn(
        `[outlook-mail] network error for ${opts.to} (attempt ${attempt}/${cfg.maxAttempts}): ${lastError}`
      );
      if (attempt < cfg.maxAttempts) {
        await sleep(jitter(Math.min(cfg.baseDelayMs * 2 ** (attempt - 1), cfg.maxDelayMs)));
      }
    }
  }

  console.error(
    `[outlook-mail] giving up after ${cfg.maxAttempts} attempts to ${opts.to}: ${lastError}`
  );
  return {
    ok: false,
    status: lastStatus,
    error: lastError,
    attempts: cfg.maxAttempts,
    durationMs: Date.now() - startedAt,
    permanent: false,
  };
}
