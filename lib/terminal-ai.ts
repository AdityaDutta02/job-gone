function getGatewayUrl(): string {
  const url = process.env.TERMINAL_AI_GATEWAY_URL;
  if (!url) {
    throw new Error("TERMINAL_AI_GATEWAY_URL environment variable is required");
  }
  return url;
}

function getAppId(): string {
  const appId = process.env.TERMINAL_AI_APP_ID;
  if (!appId) {
    throw new Error("TERMINAL_AI_APP_ID environment variable is required");
  }
  return appId;
}

export async function callGateway(
  messages: { role: string; content: string }[]
): Promise<string> {
  const gatewayUrl = getGatewayUrl();
  const appId = getAppId();

  const res = await fetch(`${gatewayUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${appId}`,
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
    throw new Error("AI service authentication failed. Please contact support.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gateway error ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
