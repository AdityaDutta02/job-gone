import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

const WIDTH = 1080;
const HEIGHT = 1440;

function clamp(value: string | null, max: number): string {
  return (value ?? "").slice(0, max).trim();
}

function riskTheme(score: number): { accent: string; soft: string; label: string } {
  if (score < 40) {
    return { accent: "#10b981", soft: "#ecfdf5", label: "Low Risk" };
  }
  if (score < 70) {
    return { accent: "#f59e0b", soft: "#fffbeb", label: "Moderate Risk" };
  }
  return { accent: "#f43f5e", soft: "#fff1f2", label: "High Risk" };
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const role = clamp(sp.get("role"), 48).toUpperCase() || "YOUR JOB";
    const scoreNum = Math.max(0, Math.min(100, Number(sp.get("score") ?? 0)));
    const timeline = clamp(sp.get("timeline"), 24) || "soon";
    const reasons = [
      clamp(sp.get("r1"), 90),
      clamp(sp.get("r2"), 90),
      clamp(sp.get("r3"), 90),
    ].filter(Boolean);

    const { accent, soft, label } = riskTheme(scoreNum);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            padding: "72px 72px 64px",
          }}
        >
          {/* Wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                backgroundColor: "#18181b",
                transform: "rotate(45deg)",
              }}
            />
            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: 2,
                color: "#18181b",
              }}
            >
              JOB GONE
            </div>
          </div>

          {/* Heading */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: 60 }}>
            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: 3,
                color: accent,
              }}
            >
              CONGRATULATIONS!
            </div>
            <div
              style={{
                fontSize: 58,
                fontWeight: 800,
                color: "#18181b",
                marginTop: 10,
                lineHeight: 1.05,
              }}
            >
              {role}
            </div>
          </div>

          {/* Score ring */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 52,
              marginBottom: 52,
            }}
          >
            <div
              style={{
                width: 380,
                height: 380,
                borderRadius: 9999,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: soft,
                border: `18px solid ${accent}`,
                boxShadow: `0 30px 80px ${accent}40`,
              }}
            >
              <div style={{ fontSize: 200, fontWeight: 800, color: accent, lineHeight: 1 }}>
                {String(scoreNum)}
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  letterSpacing: 4,
                  color: accent,
                  marginTop: 4,
                }}
              >
                % AT RISK
              </div>
            </div>
          </div>

          {/* Pull quote */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: 38,
              fontWeight: 700,
              color: "#27272a",
              lineHeight: 1.25,
            }}
          >
            <div>{`You're ${scoreNum}% automatable.`}</div>
            <div>The robots send their regards.</div>
          </div>

          {/* Verdict line */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 26,
              fontSize: 26,
              fontWeight: 700,
              color: "#71717a",
              letterSpacing: 1,
            }}
          >
            {`GONE IN ~${timeline.toUpperCase()} · ${label.toUpperCase()}`}
          </div>

          {/* Spacer */}
          <div style={{ display: "flex", flex: 1 }} />

          {/* Reasoning */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              borderTop: "2px solid #f4f4f5",
              paddingTop: 32,
            }}
          >
            {reasons.map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: soft,
                    color: accent,
                    fontSize: 22,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {String(i + 1)}
                </div>
                <div style={{ display: "flex", fontSize: 25, color: "#3f3f46", flex: 1 }}>
                  {text}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 36,
              fontSize: 26,
              fontWeight: 700,
              color: "#a1a1aa",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  backgroundColor: "#18181b",
                  transform: "rotate(45deg)",
                }}
              />
              <div style={{ color: "#18181b" }}>Job Gone</div>
            </div>
            <div>what&apos;s your number?</div>
          </div>
        </div>
      ),
      { width: WIDTH, height: HEIGHT }
    );
  } catch {
    return new Response("Failed to generate card", { status: 500 });
  }
}
