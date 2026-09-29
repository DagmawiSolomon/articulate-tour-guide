import { NextResponse } from "next/server";

/**
 * GET /api/agent-token
 *
 * Server-side only. Uses the AssemblyAI API key (in .env.local) to mint
 * a short-lived temporary token for the browser to open the Voice Agent
 * WebSocket. The real API key never reaches the client.
 *
 * Token is valid for 120 seconds (redemption window) — enough for the
 * browser to open the WS. Once session.ready fires the token is consumed.
 */
export async function GET(request: Request) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  const agentId =
    process.env.ASSEMBLYAI_AGENT_ID ||
    process.env.ASSEMBLYAI_AGENT_ID_UNMUTED ||
    "agent_95e1824252314c4b8b4bd14db16f5776";

  if (!apiKey) {
    return NextResponse.json(
      { error: "ASSEMBLYAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  if (!agentId) {
    return NextResponse.json(
      { error: "ASSEMBLYAI_AGENT_ID not configured" },
      { status: 500 }
    );
  }

  try {
    // Mint a temporary token — expires in 120s (redemption window only)
    // max_session_duration_seconds: 180 = 3 min hard cap per session (prevents runaway costs)
    const tokenUrl = "https://agents.assemblyai.com/v1/token?expires_in_seconds=120&max_session_duration_seconds=180";
    console.log("[api/agent-token] Requesting token with URL:", tokenUrl);

    const res = await fetch(tokenUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        // Voice Agent API uses Bearer auth (unlike the rest of AssemblyAI)
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[api/agent-token] AssemblyAI token error:", res.status, body);
      return NextResponse.json(
        { error: "Failed to mint agent token" },
        { status: 502 }
      );
    }

    const data = await res.json();
    console.log("[api/agent-token] Minted token successfully. Keys in response:", Object.keys(data));
    // Return token, agentId, and configured maxSessionDurationSeconds
    return NextResponse.json({
      token: data.token,
      agentId,
      maxSessionDurationSeconds: 180,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("Agent token fetch failed:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
