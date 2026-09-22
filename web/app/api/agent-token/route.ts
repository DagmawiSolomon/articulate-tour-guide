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
export async function GET() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  const agentId = process.env.ASSEMBLYAI_AGENT_ID;

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
    // max_session_duration_seconds: 1800 = 30 min max tour
    const res = await fetch(
      "https://agents.assemblyai.com/v1/token?expires_in_seconds=120&max_session_duration_seconds=1800",
      {
        method: "GET",
        headers: {
          // Voice Agent API uses Bearer auth (unlike the rest of AssemblyAI)
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("AssemblyAI token error:", res.status, body);
      return NextResponse.json(
        { error: "Failed to mint agent token" },
        { status: 502 }
      );
    }

    const data = await res.json();
    // Return both so the client can open the WS and bind the stored agent
    return NextResponse.json({ token: data.token, agentId });
  } catch (err) {
    console.error("Agent token fetch failed:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
