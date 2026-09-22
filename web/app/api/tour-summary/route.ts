import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert museum curator generating a post-tour summary and quiz for a visitor.
You will be provided with the conversation transcript between the visitor and Mr. Triangle (the AI guide).

CRITICAL INSTRUCTIONS:
1. Ignore all logistical, navigational, or troubleshooting conversation (e.g., asking for directions to the toilet, map routing, microphone issues, or "how do I get to X").
2. Focus strictly on art history, exhibit facts, and educational content discussed during the tour.
3. Generate exactly 3 key takeaway bullets for the summary.
4. Generate exactly 3 multiple-choice quiz questions based ONLY on the educational facts discussed.
5. You MUST return your response as a valid JSON object matching the requested schema.`;

const GEMINI_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Exactly 3 key takeaway bullets from the educational content of the tour."
    },
    quiz: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          options: {
            type: "ARRAY",
            items: { type: "STRING" }
          },
          correctIndex: { type: "INTEGER" },
          explanation: { type: "STRING" }
        },
        required: ["question", "options", "correctIndex", "explanation"]
      },
      description: "Exactly 3 multiple choice questions."
    }
  },
  required: ["summary", "quiz"]
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured in .env.local" }, { status: 500 });
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    // Format transcript into a readable string for the LLM
    const transcript = messages
      .map((m: any) => `${m.role === 'agent' ? 'Mr. Triangle (Guide)' : 'Visitor'}: ${m.text}`)
      .join('\n');

    // If there's barely any transcript, return a fallback so it doesn't fail
    if (transcript.trim().length < 50) {
      return NextResponse.json({
        summary: ["The tour was very brief, so there isn't much to summarize yet!"],
        quiz: []
      });
    }

    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [{
        role: "user",
        parts: [{ text: `Here is the transcript of the tour:\n\n${transcript}\n\nPlease generate the JSON summary and quiz.` }]
      }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: GEMINI_JSON_SCHEMA
      }
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(geminiPayload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[Tour Summary] Gemini API error:", errorText);
      return NextResponse.json({ error: `Gemini API returned ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("No content returned from Gemini API");
    }

    const parsedResult = JSON.parse(resultText);
    return NextResponse.json(parsedResult);

  } catch (error) {
    console.error("[Tour Summary] Route error:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
