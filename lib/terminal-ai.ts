function getGatewayUrl(): string {
  const url = process.env.TERMINAL_AI_GATEWAY_URL;
  if (!url) {
    throw new Error("TERMINAL_AI_GATEWAY_URL environment variable is required");
  }
  return url;
}

export class GatewayError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "GatewayError";
    this.status = status;
    this.code = code;
  }
}

interface CallGatewayOptions {
  category?: string;
  tier?: string;
  model?: string;
  system?: string;
}

interface GenerateResponse {
  content?: string;
  model_used?: string;
  credits_charged?: number;
}

/**
 * Call the Terminal AI gateway. Uses category+tier routing by default
 * (terminal-ai SDK: POST /v1/generate). Returns the response text.
 */
export async function callGateway(
  messages: { role: string; content: string }[],
  embedToken: string,
  opts: CallGatewayOptions = { category: "chat", tier: "good" }
): Promise<string> {
  if (!embedToken) {
    throw new GatewayError("Missing embed token", 401);
  }

  const gatewayUrl = getGatewayUrl();

  const payload: Record<string, unknown> = { messages };
  if (opts.system) payload.system = opts.system;
  if (opts.model) {
    payload.model = opts.model;
  } else {
    payload.category = opts.category ?? "chat";
    payload.tier = opts.tier ?? "good";
  }

  const res = await fetch(`${gatewayUrl}/v1/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${embedToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 401) {
    throw new GatewayError("Session expired. Please refresh the page.", 401);
  }

  if (res.status === 402) {
    throw new GatewayError(
      "You're out of credits. Top up to keep analyzing.",
      402,
      "INSUFFICIENT_CREDITS"
    );
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new GatewayError(
      `Gateway error ${res.status}: ${errorText}`,
      res.status
    );
  }

  const data = (await res.json()) as GenerateResponse;
  return data.content ?? "";
}
