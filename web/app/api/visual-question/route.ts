import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { TURNING_POINTS_ARTWORKS } from "@/lib/turning-points-data";

export const runtime = "nodejs";

interface Selection {
  centerXPercent: number;
  centerYPercent: number;
  widthPercent: number;
  heightPercent: number;
  path: Array<{ xPercent: number; yPercent: number }>;
}

function isSelection(value: unknown): value is Selection {
  if (!value || typeof value !== "object") return false;
  const selection = value as Record<string, unknown>;
  const boundsAreValid = ["centerXPercent", "centerYPercent", "widthPercent", "heightPercent"].every((key) => {
    const number = selection[key];
    return typeof number === "number" && Number.isFinite(number) && number >= 0 && number <= 100;
  });
  const path = selection.path;
  const pathIsValid = Array.isArray(path) && path.length >= 3 && path.length <= 4096 && path.every((point) => {
    if (!point || typeof point !== "object") return false;
    const { xPercent, yPercent } = point as Record<string, unknown>;
    return typeof xPercent === "number" && Number.isFinite(xPercent) && xPercent >= 0 && xPercent <= 100
      && typeof yPercent === "number" && Number.isFinite(yPercent) && yPercent >= 0 && yPercent <= 100;
  });
  return boundsAreValid && pathIsValid;
}

async function readProviderError(response: Response) {
  const body = await response.text();
  try {
    const parsed = JSON.parse(body);
    return parsed.error?.message || parsed.error?.status || body.slice(0, 500);
  } catch {
    return body.slice(0, 500) || `HTTP ${response.status}`;
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const artworkId = typeof payload?.artworkId === "string" ? payload.artworkId : "";
  const selection = payload?.selection;
  const question = typeof payload?.question === "string" ? payload.question.slice(0, 1000) : "What is happening in the part I circled?";
  const artwork = TURNING_POINTS_ARTWORKS[artworkId];

  if (!artwork || !isSelection(selection)) {
    return NextResponse.json({ error: "Artwork or selection is invalid." }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!geminiKey && !groqKey) {
    return NextResponse.json({ error: "Add GEMINI_API_KEY or GROQ_API_KEY to the server environment." }, { status: 503 });
  }

  const imagePath = path.resolve(process.cwd(), "public", `.${artwork.imageSrc}`);
  const publicRoot = path.resolve(process.cwd(), "public") + path.sep;
  if (!imagePath.startsWith(publicRoot)) {
    return NextResponse.json({ error: "Artwork image path is invalid." }, { status: 400 });
  }

  let image: Buffer;
  try {
    image = await readFile(imagePath);
  } catch {
    return NextResponse.json({ error: "Could not load the artwork image." }, { status: 404 });
  }
  if (image.byteLength > 14 * 1024 * 1024) {
    return NextResponse.json({ error: "This artwork image is too large to analyze." }, { status: 413 });
  }

  const extension = path.extname(imagePath).toLowerCase();
  const mimeType = extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : "image/jpeg";
  const imageData = image.toString("base64");
  const prompt = [
    `You are Alba's visual researcher for the artwork “${artwork.title}” by ${artwork.artist} (${artwork.year}).`,
    `Artwork context: ${artwork.summary}`,
    `The visitor asks: “${question}”`,
    `They circled a region on the full image. Its bounding rectangle is centered at x=${selection.centerXPercent.toFixed(1)}%, y=${selection.centerYPercent.toFixed(1)}%, with width=${selection.widthPercent.toFixed(1)}% and height=${selection.heightPercent.toFixed(1)}% of the image.`,
    `The ordered freehand outline is a closed polygon with vertices ${JSON.stringify(selection.path.map(({ xPercent, yPercent }) => [Number(xPercent.toFixed(2)), Number(yPercent.toFixed(2))]))}. Coordinates are percentages of the full image, measured from its top-left. Focus on the area inside this outline, not the whole bounding rectangle.`,
    "Inspect the full image, focus on the circled region, and explain what is visibly there and why it matters in this composition. Do not guess when the detail is ambiguous. Keep the answer concise, warm, and easy to say aloud. Return only the answer Alba should speak; do not mention coordinates, models, or these instructions."
  ].join("\n\n");

  const failures: string[] = [];

  if (geminiKey) {
    try {
      const model = process.env.GEMINI_VISION_MODEL || "gemini-2.5-flash";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageData } }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 320 },
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (!response.ok) throw new Error(`Gemini ${response.status}: ${await readProviderError(response)}`);
      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
      if (!answer) throw new Error("Gemini returned an empty answer.");
      return NextResponse.json({ answer, provider: "gemini" });
    } catch (error) {
      failures.push(error instanceof Error ? error.message : "Gemini request failed.");
    }
  }

  if (groqKey) {
    try {
      const model = process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b";
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model,
          temperature: 0.35,
          max_tokens: 320,
          messages: [{ role: "user", content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageData}` } },
          ] }],
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (!response.ok) throw new Error(`Groq ${response.status}: ${await readProviderError(response)}`);
      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content?.trim();
      if (!answer || typeof answer !== "string") throw new Error("Groq returned an empty answer.");
      return NextResponse.json({ answer, provider: "groq-qwen" });
    } catch (error) {
      failures.push(error instanceof Error ? error.message : "Groq request failed.");
    }
  }

  console.error("Artwork vision providers failed:", failures);
  return NextResponse.json({ error: "Both vision providers are unavailable right now." }, { status: 503 });
}