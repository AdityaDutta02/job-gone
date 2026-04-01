function getGatewayUrl(): string {
  const url = process.env.TERMINAL_AI_GATEWAY_URL;
  if (!url) {
    throw new Error("TERMINAL_AI_GATEWAY_URL environment variable is required");
  }
  return url;
}

export async function callGateway(
  messages: { role: string; content: string }[],
  embedToken: string
): Promise<string> {
  if (!embedToken) {
    throw new Error("Missing embed token");
  }

  const gatewayUrl = getGatewayUrl();

  const res = await fetch(`${gatewayUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${embedToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      stream: false,
      response_format: { type: "json_object" },
    }),
  });

  if (res.status === 401) {
    throw new Error("Session expired. Please refresh the page.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gateway error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
