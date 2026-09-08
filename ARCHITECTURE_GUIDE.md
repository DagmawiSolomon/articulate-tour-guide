# 🏛️ Articulate Tour Guide — Production Architecture Guide

> **Last Updated**: September 2026
> **Stack Path**: AssemblyAI Voice Agent API (Path 1) + Realtime Streaming STT (Path 2 for visual sync)
> **Architecture Style**: Event-Driven, WebSocket-First, Layered Frontend + Stateless Backend

---

## Engineering Philosophy

> **Ship the product first. Add engineering quality in phases. Never delete what you built — only promote it.**

This guide follows three phases:

| Phase | Goal | When |
| :--- | :--- | :--- |
| **Phase 1 — Core Product** | Working voice agent + visual sync. Feature-complete, demoed, submitted. | Week 1–2 |
| **Phase 2 — Hardening** | Logging, structured errors, basic tests, health checks. Still fast to ship. | Week 3 |
| **Phase 3 — Scale** | Auth, analytics, load testing, i18n, accessibility. Only if needed. | Post-launch |

Each section in this guide is tagged **[Phase 1]**, **[Phase 2]**, or **[Phase 3]** so you always know what to build now vs. later. **Do not skip to Phase 2 until Phase 1 is fully working.**

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [Database — Day One](#4-database--day-one)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Real-Time Voice Pipeline](#7-real-time-voice-pipeline)
8. [Tool Calling & Visual Sync Protocol](#8-tool-calling--visual-sync-protocol)
9. [State Management](#9-state-management)
10. [Logging Strategy](#10-logging-strategy)
11. [Error Handling & Resilience](#11-error-handling--resilience)
12. [Testing Strategy](#12-testing-strategy)
13. [Performance & Latency Budget](#13-performance--latency-budget)
14. [Security & Configuration](#14-security--configuration)
15. [Deployment](#15-deployment)

---

## 1. System Overview

Articulate Tour Guide is a **real-time, multimodal conversational voice AI** application. The core loop is:

1. Visitor speaks → captured via browser microphone
2. AssemblyAI streams transcription with near-zero latency
3. The agent brain processes the utterance, queries exhibition knowledge, and formulates a response
4. The agent speaks back via TTS while **simultaneously dispatching tool calls** that update the visual stage
5. The visual stage renders synchronized maps, archival imagery, and artifact callouts as the agent narrates

This requires the entire pipeline — from audio capture to UI update — to operate within a **sub-600ms latency budget** end-to-end.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BROWSER CLIENT (Next.js 'use client')                 │
│                                                                             │
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────────────┐ │
│  │  Mic Capture │    │  Companion Face  │    │     Visual Stage           │ │
│  │(AudioWorklet)│    │(Blobatar + Aura) │    │  (Floorplan, Media, IR)    │ │
│  └──────┬───────┘    └────────┬─────────┘    └──────────────┬─────────────┘ │
│         │                     │                             │               │
│  ┌──────▼───────────────────────────────────────────────────▼─────────────┐ │
│  │                     Voice Agent Client (React 19)                      │ │
│  │     Base UI Primitives <-> Zustand State <-> Tailwind CSS Styling      │ │
│  └──────────────────────────────────┬─────────────────────────────────────┘ │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │ Direct WebSocket (wss://)
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────┐
│                    UNIFIED BACKEND (Next.js App Router / Vercel)             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │               Serverless Route Handlers (/app/api)                  │    │
│  │  - POST /api/token (AssemblyAI temp bearer token vending)           │    │
│  │  - POST /api/tools/* (AssemblyAI HTTP webhook callbacks)            │    │
│  │  - GET  /api/exhibitions/[id] (Gallery & room metadata)             │    │
│  └────────────────────┬─────────────────────┬───────────────────┬──────┘    │
│                       │                     │                   │           │
│           ┌───────────▼──────┐  ┌───────────▼───────┐  ┌────────▼─────┐     │
│           │  AssemblyAI      │  │  Neon Postgres    │  │  Public CDN  │     │
│           │  Voice Agent API │  │  (Drizzle ORM)    │  │  Assets      │     │
│           │  wss://agents... │  │  + Tier-2 RAG     │  │              │     │
│           └──────────────────┘  └───────────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Architectural Path Decision

This app requires **both** AssemblyAI API paths:

| Concern | Recommended Path | Reason |
| :--- | :--- | :--- |
| Turn-taking, TTS, LLM routing | **Path 1: Voice Agent API** | Unified, lowest latency, built-in turn detection |
| Visual sync & agent captions | `transcript.agent.delta` event on Path 1 | Word-aligned media events during TTS playback — no Path 2 needed |

> **Primary**: Build on **Voice Agent API** (`wss://agents.assemblyai.com/v1/ws`). Use the `transcript.agent.delta` event stream for caption rendering and media synchronization triggers.

### Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) | Unified full-stack app on Vercel: frontend UI + serverless API routes with zero cold-start delay |
| **Headless UI** | Base UI (`@base-ui-components/react`) | 100% unstyled, accessible primitives (tabs, sliders, dialogs); zero shadcn opinion baggage |
| **Styling** | Tailwind CSS + CSS Custom Properties | Rapid utility styling styled directly to `data-*` attributes; Perplexity / Figma obsidian dark palette |
| **Iconography** | Hugeicons (`hugeicons-react`) | Sleek, modern stroke/twotone icons; replaces generic default Lucide sets |
| **UI State** | Zustand | Predictable, atomic state management with zero re-render cascades |
| **Voice Transport** | Browser WebSocket API | Direct WS to AssemblyAI via short-lived temp token — zero proxy relay on hot audio path |
| **Audio Capture** | Web Audio API + `AudioWorklet` | Off-main-thread 16kHz PCM capture; avoids deprecated `ScriptProcessorNode` |
| **TTS Playback** | `AudioContext` + Streamed PCM | Gapless buffer scheduling synchronized with caption events |
| **Database** | Postgres (Neon Serverless) | Free serverless tier, zero-cold-start HTTP driver |
| **ORM / Migrations**| Drizzle ORM + Drizzle Kit | Lightweight SQL-first TypeScript ORM with schema migrations |
| **Knowledge & RAG**| 2-Tier Hybrid Architecture | **Tier 1**: In-context core gallery facts (0ms latency). **Tier 2**: Tool-calling RAG (`query-archives`) for deep queries |
| **Persona Adaptation**| Explicit Toggle + LLM Tone Mirroring | Dynamic depth switcher (Highlights / Deep Dive / Family) with real-time prompt adaptation |
| **Deployment** | Vercel (Unified Production Target) | Instant deployments, edge/serverless route handlers, zero infra overhead |

---

## 3. Directory Structure

```
articulate-tour-guide/
├── app/
│   ├── api/
│   │   ├── token/
│   │   │   └── route.ts         # POST /api/token (AssemblyAI temp bearer token vending)
│   │   ├── exhibitions/
│   │   │   └── [id]/
│   │   │       └── route.ts     # GET /api/exhibitions/[id]
│   │   └── tools/               # AssemblyAI HTTP tool webhooks
│   │       ├── display-media/
│   │       │   └── route.ts     # POST /api/tools/display-media
│   │       ├── highlight-map/
│   │       │   └── route.ts     # POST /api/tools/highlight-map
│   │       └── query-archives/
│   │           └── route.ts     # POST /api/tools/query-archives (Tier-2 RAG)
│   ├── layout.tsx               # Root HTML & font configuration
│   ├── page.tsx                 # Main tour entrance & stage shell ('use client')
│   └── globals.css              # Tailwind CSS + Perplexity/Figma palette tokens
│
├── components/
│   ├── stage/
│   │   ├── VisualStage.tsx      # Central media stage container
│   │   ├── ExhibitionMap.tsx    # SVG indoor floorplan & active pins
│   │   ├── ArchivalViewer.tsx   # High-res artwork viewer & placard
│   │   ├── PentimentoSlider.tsx # Infrared / X-ray clip-path sweep
│   │   └── DetailCallout.tsx    # Crop zoom & leader line reticle
│   ├── companion/
│   │   ├── CompanionFace.tsx    # Blobatar SVG avatar + stateful gaze
│   │   └── CompanionAura.tsx    # Thinking orb ambient glow
│   ├── dialogue/
│   │   ├── LiveTranscript.tsx   # Streaming subtitles & word sync
│   │   └── ToolCallBadge.tsx    # Tool execution pill
│   └── ui/
│       ├── Button.tsx           # Base UI / Tailwind spring button
│       ├── DepthSwitcher.tsx    # Base UI Tabs + Hugeicons
│       └── Drawer.tsx           # Base UI Dialog / Drawer
│
├── hooks/
│   ├── useVoiceAgent.ts         # Core WS + audio lifecycle
│   ├── useAudioCapture.ts       # AudioWorklet mic pipeline
│   ├── useAudioPlayback.ts      # Streamed TTS playback
│   └── useVisualSync.ts         # tool.call -> stage bridge
│
├── store/
│   ├── agentStore.ts            # Listening/thinking/speaking & persona
│   ├── visualStore.ts           # Active artifact & transition state
│   └── sessionStore.ts          # Session ID & depth mode
│
├── lib/
│   ├── db/                      # Drizzle ORM + Neon Postgres
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── assemblyai/
│   │   ├── tools.ts             # Tool calling schemas
│   │   └── prompts.ts           # Persona rules & domain boosting
│   └── audio/
│       ├── cues.ts              # Cuelume procedural audio triggers
│       └── GaplessPlayer.ts
│
├── public/
│   └── worklets/
│       └── pcm-processor.js     # AudioWorklet processor
│
├── data/
│   └── exhibitions/             # Source-of-truth seed files (JSON)
│       ├── renaissance.json
│       └── ancient-civilizations.json
│
├── drizzle.config.ts
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 4. Database — Day One

> **Decision**: Use a real Postgres database from the start. No JSON file server, no "upgrade later" path.

### Why Not JSON Files?

JSON files seem simpler until you need to:
- Add a new artifact without redeploying the server
- Record which artifacts a visitor has seen (session memory)
- Log tool calls for debugging a conversation
- Run a query like "all artifacts in Room 4 with infrared scans"

A Postgres DB on **Neon** or **Supabase** is **free**, takes 2 minutes to set up, and gives you all of this from day one.

### Provider Recommendation

| Provider | Free Tier | Recommendation |
| :--- | :--- | :--- |
| **Neon** | 512 MB, serverless, instant branch-per-PR | ⭐ Best for this project — serverless Postgres, no cold-start DB connections |
| **Supabase** | 500 MB + built-in REST & Auth | Good if you want Auth later |
| **Railway** | 1 GB included with backend hosting | Simplest if hosting backend on Railway |

**For this hackathon**: Use **Railway** if deploying backend there (one less account), or **Neon** for the best developer experience.

### Schema Design **[Phase 1]**

```typescript
// apps/server/src/db/schema.ts
import { pgTable, text, jsonb, real, integer, timestamp, uuid, boolean } from "drizzle-orm/pg-core";

// ─── Exhibitions ─────────────────────────────────────────────────────────────

export const exhibitions = pgTable("exhibitions", {
  id:          text("id").primaryKey(),           // e.g. "renaissance-gallery"
  title:       text("title").notNull(),
  description: text("description"),
  floorMapUrl: text("floor_map_url"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
  id:           text("id").primaryKey(),           // e.g. "room-4"
  exhibitionId: text("exhibition_id").notNull().references(() => exhibitions.id, { onDelete: "cascade" }),
  name:         text("name").notNull(),
  // Normalized bounding box on the floor map (0–1)
  boundsX1:    real("bounds_x1").notNull(),
  boundsY1:    real("bounds_y1").notNull(),
  boundsX2:    real("bounds_x2").notNull(),
  boundsY2:    real("bounds_y2").notNull(),
});

export const artifacts = pgTable("artifacts", {
  id:           text("id").primaryKey(),           // e.g. "da-vinci-sfumato"
  exhibitionId: text("exhibition_id").notNull().references(() => exhibitions.id, { onDelete: "cascade" }),
  roomId:       text("room_id").references(() => rooms.id),
  name:         text("name").notNull(),
  coordX:       real("coord_x"),                  // Position on floor map (0–1)
  coordY:       real("coord_y"),
  docentFacts:  text("docent_facts").array().notNull().default([]),
  connections:  text("connections").array().notNull().default([]), // IDs of related artifacts
  keyterms:     text("keyterms").array().notNull().default([]),    // Boost in STT
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

export const artifactMedia = pgTable("artifact_media", {
  id:          uuid("id").defaultRandom().primaryKey(),
  artifactId:  text("artifact_id").notNull().references(() => artifacts.id, { onDelete: "cascade" }),
  type:        text("type").notNull(),             // "image" | "infrared_scan" | "comparison" | ...
  url:         text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption:     text("caption"),
  sortOrder:   integer("sort_order").notNull().default(0),
});

// ─── Sessions (Tour recordings) ──────────────────────────────────────────────
// Phase 1: minimal — just record that a session happened
// Phase 2: add transcript, analytics, tool call log

export const tourSessions = pgTable("tour_sessions", {
  id:           uuid("id").defaultRandom().primaryKey(),
  exhibitionId: text("exhibition_id").references(() => exhibitions.id),
  depthMode:    text("depth_mode").notNull().default("quick"), // "quick" | "deep" | "family"
  startedAt:    timestamp("started_at").defaultNow().notNull(),
  endedAt:      timestamp("ended_at"),
  durationSecs: integer("duration_secs"),
  // Phase 2: add ip_hash, user_agent, transcript_jsonl, tool_calls_count
});
```

> **Note on `tourSessions`**: Recording even a minimal session row gives you data from the first user. You don't need the columns yet — just the table. Add columns in Phase 2 via a migration, not a schema rewrite.

### DB Connection Singleton **[Phase 1]**

```typescript
// apps/server/src/db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export type DB = typeof db;
```

> Use `drizzle-orm/neon-http` for serverless/Neon. Switch to `drizzle-orm/node-postgres` (`pg` package) if using Railway's standard Postgres — just change the one import and the connection constructor.

### Migrations **[Phase 1]**

```typescript
// drizzle.config.ts (root of apps/server)
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config;
```

```bash
# Generate a migration from schema changes
npx drizzle-kit generate

# Apply migrations to the database
npx drizzle-kit migrate

# Explore your DB in a browser UI
npx drizzle-kit studio
```

**Rule**: Every schema change goes through `drizzle-kit generate` → commit the migration file → `drizzle-kit migrate` on deploy. Never edit a migration file by hand.

### Seeding from JSON **[Phase 1]**

Keep the JSON files as the **source of truth for exhibition content** (easy to edit, version-controlled). On server start, run a seed that upserts them into the DB:

```typescript
// apps/server/src/db/seed.ts
import { db } from "./index";
import { exhibitions, rooms, artifacts, artifactMedia } from "./schema";
import { glob } from "fast-glob";
import fs from "fs/promises";

export async function seedExhibitions() {
  const files = await glob("../../data/exhibitions/*.json");

  for (const file of files) {
    const data = JSON.parse(await fs.readFile(file, "utf-8"));

    // Upsert exhibition
    await db.insert(exhibitions)
      .values({ id: data.id, title: data.title, floorMapUrl: data.floor_map_url })
      .onConflictDoUpdate({ target: exhibitions.id, set: { title: data.title } });

    // Upsert rooms
    for (const room of data.rooms ?? []) {
      await db.insert(rooms)
        .values({ id: room.id, exhibitionId: data.id, name: room.name, ...room.bounds })
        .onConflictDoUpdate({ target: rooms.id, set: { name: room.name } });
    }

    // Upsert artifacts and their media
    for (const artifact of data.artifacts) {
      await db.insert(artifacts)
        .values({
          id: artifact.id,
          exhibitionId: data.id,
          roomId: artifact.room,
          name: artifact.name,
          coordX: artifact.coordinates?.x,
          coordY: artifact.coordinates?.y,
          docentFacts: artifact.docent_facts,
          connections: artifact.connections ?? [],
          keyterms: artifact.keyterms ?? [],
        })
        .onConflictDoUpdate({ target: artifacts.id, set: { name: artifact.name } });

      for (const [i, media] of (artifact.media ?? []).entries()) {
        await db.insert(artifactMedia)
          .values({ artifactId: artifact.id, ...media, sortOrder: i })
          .onConflictDoNothing();
      }
    }
  }

  console.log("✓ Exhibition seed complete");
}
```

```typescript
// apps/server/src/index.ts — call seed on startup
import { seedExhibitions } from "./db/seed";

async function main() {
  await seedExhibitions(); // Safe to run on every boot — uses upsert
  app.listen(config.PORT, () => console.log(`Server on :${config.PORT}`));
}
main();
```

---

## 5. Backend Architecture (Next.js Route Handlers)

### 5.1 Token Route (`app/api/token/route.ts`) **[Phase 1]**

**Never expose your AssemblyAI API key to the browser.** This Next.js Route Handler vends short-lived bearer tokens and registers the session in Neon Postgres:

```typescript
// app/api/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai"; // npm i assemblyai@^4.37.1
import { db } from "@/lib/db";
import { tourSessions } from "@/lib/db/schema";

const aai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { exhibitionId = "renaissance", depthMode = "quick" } = await req.json();

    // Create the AssemblyAI temp token (10-minute expiry)
    const token = await aai.agents.createToken({ expires_in_seconds: 600 });

    // Record the session in DB
    const [session] = await db.insert(tourSessions)
      .values({ exhibitionId, depthMode })
      .returning({ id: tourSessions.id });

    return NextResponse.json({ token: token.value, sessionId: session.id }, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to vend agent token" }, { status: 500 });
  }
}
```

### 5.2 HTTP Tool Endpoints (`app/api/tools/[tool]/route.ts`) **[Phase 1]**

AssemblyAI calls your HTTPS tool endpoints when the agent invokes a tool. In Next.js, these are clean Route Handlers:

```typescript
// app/api/tools/display-media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { artifactMedia } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { artifact_id, media_type } = await req.json();

  // Query directly from the DB
  const media = await db.query.artifactMedia.findFirst({
    where: and(
      eq(artifactMedia.artifactId, artifact_id),
      eq(artifactMedia.type, media_type)
    ),
    orderBy: artifactMedia.sortOrder,
  });

  if (!media) {
    return NextResponse.json({
      is_error: true,
      message: `No ${media_type} media found for ${artifact_id}. I'll describe it instead.`,
    });
  }

  return NextResponse.json({
    success: true,
    display_url: media.url,
    thumbnail_url: media.thumbnailUrl,
    caption: media.caption,
  });
}
```

### 5.3 Exhibition Query (`app/api/exhibitions/[id]/route.ts`) **[Phase 1]**

```typescript
// app/api/exhibitions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exhibitions, artifactMedia } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const exhibition = await db.query.exhibitions.findFirst({
    where: eq(exhibitions.id, params.id),
    with: {
      rooms: true,
      artifacts: {
        with: { media: { orderBy: artifactMedia.sortOrder } },
      },
    },
  });

  if (!exhibition) {
    return NextResponse.json({ error: "Exhibition not found" }, { status: 404 });
  }

  return NextResponse.json(exhibition);
}
```

---

## 6. Frontend Architecture

### 6.1 Component Tree **[Phase 1]**

```
App
├── SessionGate             (start screen, mic permission)
└── TourSession
    ├── VisualStage         (hero — 70%+ of viewport)
    │   ├── ExhibitionMap   (SVG floor plan + live pin)
    │   ├── MediaViewer     (images, comparisons, zoom)
    │   └── ArtifactCallout (overlay annotations)
    ├── CompanionFace       (corner element, max 180x180px)
    ├── LiveTranscript      (aria-live caption strip)
    └── TourControls        (Quick/Deep/Family toggle, mute, end)
```

### 6.2 Design Principles **[Phase 1]**

- **Visual Stage is the hero**: 70%+ of viewport. Companion face is a small ambient cue, not the attraction.
- **No layout shifts on tool calls**: pre-reserve space — skeleton screens fill in, layout never jumps
- **Kiosk + mobile**: designed for landscape 1080p and portrait 375px
- **Dark museum palette**: `#0e0e10` background, `#c9a84c` warm gold accent

### 6.3 Audio Worklet (Off-Main-Thread) **[Phase 1]**

**Never use `ScriptProcessorNode`** — deprecated, runs on main thread, causes jank at the worst moments.

```typescript
// apps/web/src/hooks/useAudioCapture.ts
export function useAudioCapture() {
  const contextRef = useRef<AudioContext | null>(null);

  const start = useCallback(async (onChunk: (pcm: Int16Array) => void) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true },
    });
    const context = new AudioContext({ sampleRate: 16000 });
    await context.audioWorklet.addModule("/worklets/pcm-processor.js");
    const source = context.createMediaStreamSource(stream);
    const worklet = new AudioWorkletNode(context, "pcm-processor");
    worklet.port.onmessage = (e: MessageEvent<Int16Array>) => onChunk(e.data);
    source.connect(worklet);
    contextRef.current = context;
  }, []);

  const stop = useCallback(() => { contextRef.current?.close(); contextRef.current = null; }, []);
  return { start, stop };
}
```

```javascript
// public/worklets/pcm-processor.js — AudioWorkletGlobalScope (not main thread)
class PcmProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input) return true;
    const pcm = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      pcm[i] = Math.max(-32768, Math.min(32767, input[i] * 32768));
    }
    this.port.postMessage(pcm, [pcm.buffer]); // zero-copy transfer
    return true;
  }
}
registerProcessor("pcm-processor", PcmProcessor);
```

---

## 7. Real-Time Voice Pipeline

### 7.1 Session Lifecycle **[Phase 1]**

```
Browser                   Token Server              AssemblyAI Voice Agent
   |                          |                            |
   |--POST /api/token-------->|                            |
   |  (exhibitionId, mode)    | INSERT tourSessions ->DB   |
   |<-{ token, sessionId }----|                            |
   |                          |                            |
   |--WSS wss://agents.assemblyai.com/v1/ws?token={token}->|
   |--session.update (config)-------------------------------->|
   |<-session.ready------------------------------------------|
   |                          |                            |
   |--[Binary PCM, continuous]------------------------------->|
   |<-transcript.user.delta (cumulative partial)-------------|
   |<-transcript.user (final)--------------------------------|
   |<-reply.started------------------------------------------|
   |<-[Binary TTS audio, streamed]---------------------------|
   |<-transcript.agent.delta (agent captions, visual sync)---|
   |<-tool.call { display_artifact_media }-------------------|
   |   | [AssemblyAI -> POST /tools/display-media -> DB]     |
   |   (update VisualStage immediately)                      |
   |<-tool.result--------------------------------------------|
   |<-reply.done---------------------------------------------|
   |                          |                            |
   |--session.end--------------------------------------->|
   |<-session.ended (duration)-------------------------------|
   |                          | UPDATE tourSessions.endedAt  |
```

### 7.2 AgentClient Implementation **[Phase 1]**

```typescript
// apps/web/src/lib/assemblyai/AgentClient.ts

export type AgentState = "idle" | "listening" | "thinking" | "speaking";

export class AgentClient extends EventTarget {
  private ws: WebSocket | null = null;

  async connect(token: string) {
    this.ws = new WebSocket(`wss://agents.assemblyai.com/v1/ws?token=${token}`);
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen = () => this.sendSessionConfig();
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
  }

  private sendSessionConfig() {
    this.send({
      type: "session.update",
      session: {
        // greeting is sent VERBATIM to TTS — write the exact words you want spoken
        greeting: "Welcome to the gallery. I'm your guide. What would you like to explore today?",
        system_prompt: buildSystemPrompt(),
        tools: TOUR_TOOLS,
        input: {
          turn_detection: { min_silence: 700, max_silence: 2500 },
          // Vocabulary context for STT — separate from system_prompt
          transcription_prompt: "Museum tour about Renaissance art, paintings, sculptures, and historical context.",
          keyterms: ["sfumato", "chiaroscuro", "Medici", "Botticelli", "triptych", "polyptych"],
        },
        output: { voice: "ember" },
      },
    });
  }

  sendAudio(chunk: Int16Array) {
    // Do NOT send faster than realtime — server drops excess frames
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(chunk.buffer);
  }

  private handleMessage(event: MessageEvent) {
    if (event.data instanceof ArrayBuffer) {
      this.dispatchEvent(new CustomEvent("audio-chunk", { detail: event.data }));
      return;
    }

    const msg = JSON.parse(event.data as string);
    switch (msg.type) {
      case "session.ready":
        this.dispatchEvent(new CustomEvent("state", { detail: "listening" as AgentState })); break;
      case "transcript.user.delta":
        // Cumulative partial — render latest, DO NOT concatenate
        this.dispatchEvent(new CustomEvent("user-partial", { detail: msg.transcript })); break;
      case "transcript.user":
        this.dispatchEvent(new CustomEvent("user-final", { detail: msg.transcript }));
        this.dispatchEvent(new CustomEvent("state", { detail: "thinking" as AgentState })); break;
      case "reply.started":
        this.dispatchEvent(new CustomEvent("state", { detail: "speaking" as AgentState })); break;
      case "transcript.agent.delta":
        // Agent words streamed live — use for captions and visual sync triggers
        this.dispatchEvent(new CustomEvent("agent-caption", { detail: msg.transcript })); break;
      case "reply.done":
        this.dispatchEvent(new CustomEvent("state", { detail: "listening" as AgentState })); break;
      case "tool.call":
        // AssemblyAI has already dispatched this to your HTTP endpoint.
        // Update UI immediately — don't wait for tool.result
        this.dispatchEvent(new CustomEvent("tool-call", { detail: msg })); break;
      case "tool.result":
        this.dispatchEvent(new CustomEvent("tool-result", { detail: msg })); break;
      case "error":
        this.dispatchEvent(new CustomEvent("agent-error", { detail: msg })); break;
    }
  }

  private handleClose(event: CloseEvent) {
    // 1000/1006 arrive WITHOUT an Error frame — on_error never fires — handle cleanup here
    // 1009 = message > 128 KB — reduce AudioWorklet chunk size
    if (event.code !== 1000) {
      this.dispatchEvent(new CustomEvent("disconnected", { detail: event.code }));
    }
  }

  end() {
    // ALWAYS send session.end — closing WebSocket alone = 30s billable grace window
    this.send({ type: "session.end" });
  }

  private send(msg: object) { this.ws?.send(JSON.stringify(msg)); }
}
```

### 7.3 System Prompt & Dynamic Persona Design **[Phase 1]**

```typescript
// lib/assemblyai/prompts.ts
import { Exhibition } from "@/types";

export type DepthMode = "quick" | "deep" | "family";

export function buildSystemPrompt(exhibition: Exhibition, depthMode: DepthMode): string {
  const depthInstruction = {
    quick:  "Highlights Mode — keep spoken responses under 35 seconds. Deliver punchy, fascinating observations with immediate visual reveals.",
    deep:   "Deep Scholar Mode — explore art history nuances (sfumato, pentimento, iconography, Medici provenance). Dive into technique and restoration.",
    family: "Family & Kids Mode — playful, wonder-driven, sensory metaphors. Ask interactive visual search questions ('Can you spot the tiny bird?'). No academic jargon.",
  }[depthMode];

  return `
You are an expert museum docent for ${exhibition.title} — knowledgeable, enthusiastic, and conversational.

## Core Persona & Tone Adaptation
- Speak in vivid, engaging spoken dialogue as a brilliant docent would — never read encyclopedia entries.
- Baseline Depth: ${depthInstruction}
- Real-Time Tone Mirroring:
  * If the visitor speaks simply or asks kid-like questions ("Why is his hat silly?"): instantly adopt playful sensory metaphors and short 2-sentence answers.
  * If the visitor uses advanced terminology ("Notice the sfumato along the jawline"): elevate your vocabulary to match an art historian.
  * Otherwise: maintain a warm, vivid storytelling cadence.

## Visual Synchronization (Critical — never skip)
You control the Synchronized Visual Stage beside you:
- When you mention ANY artifact: immediately invoke display_artifact_media.
- When giving directions or changing galleries: always invoke highlight_map_location.
- When revealing infrared underdrawings or pentimento: invoke show_underdrawing.
- When pointing out small focal details: invoke show_detail_callout with pre-validated detail_id.
- Never announce "I am showing you an image". Speak seamlessly while the visual updates.

## Tier 1 In-Context Core Exhibition Knowledge (Zero-Latency)
${JSON.stringify(exhibition.artifacts.map((a) => ({
  id: a.id,
  name: a.name,
  room: a.roomId,
  docent_facts: a.docentFacts,
  connections: a.connections
})))}

## Rules
- Never say "as an AI" or break character.
- Draw connections to works already discussed this tour.
- For deep archival or chemical questions outside core knowledge, invoke the query_archives tool.
`.trim();
}
```

### 7.4 2-Tier Knowledge & RAG Strategy **[Phase 1]**

To preserve sub-600ms conversational turn latency, Articulate Tour Guide strictly avoids vector search on every turn:

1. **Tier 1: Zero-Latency In-Context Manifest (Primary)**:
   - Full exhibition catalog (15–30 artworks, keyterms, room coordinates, docent facts) is injected directly into the LLM system prompt.
   - **Overhead**: 0ms retrieval latency.
   - **Enforcement**: Zero hallucination on bounding boxes and artifact IDs.
2. **Tier 2: On-Demand Tool-Calling RAG (Secondary)**:
   - When visitor asks deep archival queries outside the core catalog (e.g. restoration records, patron letters, pigment chemistry), the agent invokes `query_archives(query: string)`.
   - The Next.js Route Handler (`/app/api/tools/query-archives/route.ts`) queries the full archive in Postgres and returns a 2-sentence summary.
   - The docent uses a brief conversational conversational cue (*"Let me pull up the restoration analysis on that..."*) while fetching.

---

## 8. Tool Calling & Visual Sync Protocol

### 8.1 Tool Definitions **[Phase 1]**

```typescript
// apps/web/src/lib/assemblyai/tools.ts
export const TOUR_TOOLS = [
  {
    type: "function",
    name: "display_artifact_media",
    description:
      "Show a high-resolution image or archival scan on the visual display. " +
      "Call IMMEDIATELY when mentioning any artifact.",
    parameters: {
      type: "object",
      properties: {
        artifact_id: { type: "string" },
        media_type: {
          type: "string",
          enum: ["image", "infrared_scan", "restoration_before_after", "architectural_sketch", "archival_photo"],
        },
        caption: { type: "string", description: "Max 80 characters." },
        zoom_region: {
          type: "object",
          properties: {
            x: { type: "number" }, y: { type: "number" },
            width: { type: "number" }, height: { type: "number" },
          },
        },
      },
      required: ["artifact_id", "media_type"],
    },
  },
  {
    type: "function",
    name: "highlight_map_location",
    description: "Highlight a location on the exhibition floor map. Use for spatial directions and room transitions.",
    parameters: {
      type: "object",
      properties: {
        artifact_id: { type: "string" },
        room_id: { type: "string" },
        label: { type: "string" },
        visitor_position: {
          type: "object",
          properties: { x: { type: "number" }, y: { type: "number" } },
        },
      },
    },
  },
  {
    type: "function",
    name: "show_comparison",
    description: "Side-by-side comparison of two artworks or time periods.",
    parameters: {
      type: "object",
      properties: {
        left_artifact_id: { type: "string" }, right_artifact_id: { type: "string" },
        left_label: { type: "string" }, right_label: { type: "string" },
        comparison_title: { type: "string" },
      },
      required: ["left_artifact_id", "right_artifact_id"],
    },
  },
];
```

### 8.2 Frontend Visual Sync Hook **[Phase 1]**

Update visual state on `tool.call` (immediate skeleton) — resolve with real content on `tool.result`:

```typescript
// apps/web/src/hooks/useVisualSync.ts
export function useVisualSync(agentClient: AgentClient) {
  const setContent = useVisualStore((s) => s.setContent);
  const setHighlight = useVisualStore((s) => s.setHighlight);

  useEffect(() => {
    const onToolCall = (e: CustomEvent) => {
      const { name, arguments: args } = e.detail; // field is "arguments", not "args"
      switch (name) {
        case "display_artifact_media":
          setContent({ type: "media", artifactId: args.artifact_id, mediaType: args.media_type,
                       caption: args.caption, loading: true }); break;
        case "highlight_map_location":
          setHighlight({ artifactId: args.artifact_id, roomId: args.room_id,
                         label: args.label, visitorPosition: args.visitor_position }); break;
        case "show_comparison":
          setContent({ type: "comparison", leftArtifactId: args.left_artifact_id,
                       rightArtifactId: args.right_artifact_id, title: args.comparison_title, loading: true }); break;
      }
    };

    const onToolResult = (e: CustomEvent) => {
      const { name, result } = e.detail;
      if (name === "display_artifact_media" && result.success) {
        setContent((prev) => ({ ...prev!, url: result.display_url, thumbnailUrl: result.thumbnail_url, loading: false }));
      }
    };

    agentClient.addEventListener("tool-call", onToolCall as EventListener);
    agentClient.addEventListener("tool-result", onToolResult as EventListener);
    return () => {
      agentClient.removeEventListener("tool-call", onToolCall as EventListener);
      agentClient.removeEventListener("tool-result", onToolResult as EventListener);
    };
  }, [agentClient, setContent, setHighlight]);
}
```

---

## 9. State Management

### 9.1 Three Focused Stores **[Phase 1]**

```typescript
// apps/web/src/store/agentStore.ts
import { create } from "zustand";

type AgentState = "idle" | "listening" | "thinking" | "speaking";
type DepthMode = "quick" | "deep" | "family";

export const useAgentStore = create<{
  agentState: AgentState;
  userPartial: string;
  transcript: TranscriptEntry[];
  agentCaption: string;
  depthMode: DepthMode;
  setAgentState: (s: AgentState) => void;
  setUserPartial: (t: string) => void;
  appendTranscript: (e: TranscriptEntry) => void;
  setAgentCaption: (t: string) => void;
  setDepthMode: (m: DepthMode) => void;
}>((set) => ({
  agentState: "idle",
  userPartial: "",
  transcript: [],
  agentCaption: "",
  depthMode: "quick",
  setAgentState: (agentState) => set({ agentState }),
  setUserPartial: (userPartial) => set({ userPartial }),
  // Cap at 50 entries — prevents unbounded memory growth during long tours
  appendTranscript: (entry) => set((s) => ({ transcript: [...s.transcript.slice(-50), entry] })),
  setAgentCaption: (agentCaption) => set({ agentCaption }),
  setDepthMode: (depthMode) => set({ depthMode }),
}));
```

### 9.2 Companion Face (CSS State Machine) **[Phase 1]**

```typescript
// apps/web/src/components/companion/CompanionFace.tsx
const STATE_CLASS: Record<AgentState, string> = {
  idle: "companion--idle", listening: "companion--listening",
  thinking: "companion--thinking", speaking: "companion--speaking",
};

export function CompanionFace() {
  const agentState = useAgentStore((s) => s.agentState);
  const agentCaption = useAgentStore((s) => s.agentCaption);

  return (
    <aside className={`companion ${STATE_CLASS[agentState]}`} aria-label={`Guide is ${agentState}`}>
      <div className="companion__face" aria-hidden="true">
        <div className="companion__eye companion__eye--left" />
        <div className="companion__eye companion__eye--right" />
        <div className="companion__mouth" />
      </div>
      {agentCaption && <p className="companion__caption" aria-live="polite">{agentCaption}</p>}
    </aside>
  );
}
```

---

## 10. Logging Strategy

> **Philosophy**: Add structured logging incrementally. Phase 1 = console.log is fine. Phase 2 = pino. Phase 3 = log aggregation service.

### Phase 1 — Console (Ship Now)

Use `console.log` / `console.error` during Phase 1. Do not over-engineer. The only discipline: **always log the session ID** so you can trace a conversation:

```typescript
// Phase 1 — good enough
console.log("[token] issued", { sessionId, exhibitionId, ip: req.ip });
console.error("[tool] display_artifact_media failed", { artifact_id, error: e.message });
```

### Phase 2 — Structured Logging with Pino **[Phase 2]**

Switch `console.*` calls to `pino` when you're ready to debug real user sessions. The API is nearly identical — the switch takes 30 minutes:

```bash
npm i pino pino-http
```

```typescript
// apps/server/src/lib/logger.ts  [Phase 2]
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  // Pretty print in development, JSON in production
  transport: process.env.NODE_ENV === "development"
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
});
```

```typescript
// apps/server/src/middleware/requestLogger.ts  [Phase 2]
import pinoHttp from "pino-http";
import { logger } from "../lib/logger";

export const requestLogger = pinoHttp({
  logger,
  // Don't log health checks — too noisy
  autoLogging: { ignore: (req) => req.url === "/health" },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
});
```

```typescript
// Replace console.log calls:
logger.info({ sessionId, exhibitionId }, "token issued");
logger.error({ artifact_id, err }, "display_artifact_media failed");
```

### Phase 3 — Log Aggregation **[Phase 3]**

Send pino JSON logs to **Logtail** (free tier), **Axiom**, or **Datadog**. On Railway/Fly.io, logs are automatically captured — just pipe to a log drain:

```bash
# Railway: add a log drain in the Railway dashboard (one click)
# Fly.io:
fly logs --app your-app | axiom ingest --dataset your-dataset
```

---

## 11. Error Handling & Resilience

### 11.1 WebSocket Reconnection **[Phase 1]**

```typescript
// apps/web/src/hooks/useVoiceAgent.ts
const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 8000];

export function useVoiceAgent() {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const attemptRef = useRef(0);

  const connect = useCallback(async () => {
    setStatus("connecting");
    try {
      const { token, sessionId } = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exhibitionId: "renaissance-gallery", depthMode: "quick" }),
      }).then((r) => r.json());

      const client = new AgentClient();
      await client.connect(token);
      client.addEventListener("disconnected", () => scheduleReconnect());

      // Store sessionId in session store for end-of-tour update
      useSessionStore.getState().setSessionId(sessionId);
      attemptRef.current = 0;
      setStatus("connected");
      return client;
    } catch {
      setStatus("error");
      scheduleReconnect();
    }
  }, []);

  const scheduleReconnect = () => {
    const n = attemptRef.current;
    if (n >= RECONNECT_DELAYS_MS.length) { setStatus("error"); return; }
    attemptRef.current++;
    setTimeout(connect, RECONNECT_DELAYS_MS[n]);
  };

  return { status, connect };
}
```

### 11.2 Close Code Reference

| Code | Meaning | Action |
| :--- | :--- | :--- |
| `1000` | Clean close (`session.end` sent) | No reconnect |
| `1006` | Network drop (no `Error` frame — `on_error` never fires) | Reconnect with backoff |
| `1009` | Message exceeded 128 KB | **Code bug** — reduce chunk size, do not reconnect |

### 11.3 Backend Error Middleware **[Phase 1]**

```typescript
// apps/server/src/index.ts
// Catch-all error handler — always return JSON, never crash the server
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("[server] unhandled error", err.message); // Phase 1: console
  // logger.error({ err, url: req.url }, "unhandled error"); // Phase 2: pino
  res.status(500).json({ error: "Internal server error" });
});
```

### 11.4 Health Check Endpoint **[Phase 1]**

Add a `/health` route immediately — Railway, Fly.io, and Vercel all ping this to decide if your service is alive:

```typescript
app.get("/health", async (_req, res) => {
  // Phase 1: just return 200
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// Phase 2: check DB connectivity
app.get("/health", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(503).json({ status: "degraded", db: "unreachable" });
  }
});
```

---

## 12. Testing Strategy

> **Philosophy**: Write tests that give you **confidence to ship**, not tests that hit a coverage target. Phase 1 = manual + smoke. Phase 2 = unit tests on critical paths. Phase 3 = E2E.

### Phase 1 — Manual Smoke Tests (Ship Now)

Before every demo, run through this checklist manually. Takes 5 minutes:

```
SMOKE TEST CHECKLIST
[ ] Open the app. Mic permission prompt appears.
[ ] Grant permission. CompanionFace shows "listening" state.
[ ] Speak: "Tell me about this painting."
[ ] Agent responds within ~1 second. TTS audio plays.
[ ] Visual Stage updates — media appears without layout shift.
[ ] Map pin highlights the correct artifact room.
[ ] Interrupt the agent mid-sentence. It stops and listens.
[ ] Say "goodbye". Session ends. CompanionFace returns to idle.
[ ] Check DB: SELECT * FROM tour_sessions ORDER BY started_at DESC LIMIT 1;
    └── started_at is set, ended_at is null (will be set on session.end).
```

### Phase 2 — Unit Tests on Critical Paths **[Phase 2]**

Install testing tools:

```bash
# Backend
npm i -D vitest @vitest/coverage-v8

# Frontend
npm i -D vitest @testing-library/react @testing-library/user-event jsdom
```

**Test 1 — DB schema (most important early test)**:

```typescript
// apps/server/src/db/__tests__/schema.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "../index";
import { exhibitions, artifacts } from "../schema";

// Use a test DB — set TEST_DATABASE_URL in .env.test
describe("Exhibition DB", () => {
  it("inserts and retrieves an exhibition", async () => {
    await db.insert(exhibitions).values({ id: "test-ex", title: "Test Exhibition" });
    const result = await db.query.exhibitions.findFirst({
      where: (e, { eq }) => eq(e.id, "test-ex"),
    });
    expect(result?.title).toBe("Test Exhibition");
  });
});
```

**Test 2 — Tool visual sync (most important frontend test)**:

```typescript
// apps/web/src/hooks/__tests__/useVisualSync.test.ts
import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useVisualSync } from "../useVisualSync";
import { useVisualStore } from "../../store/visualStore";

it("shows skeleton on tool.call, resolves on tool.result", async () => {
  const mockClient = new EventTarget();
  renderHook(() => useVisualSync(mockClient as any));

  // Fire tool.call
  act(() => {
    mockClient.dispatchEvent(new CustomEvent("tool-call", {
      detail: { name: "display_artifact_media", arguments: { artifact_id: "sfumato", media_type: "image" } },
    }));
  });

  expect(useVisualStore.getState().currentContent?.loading).toBe(true);

  // Fire tool.result
  act(() => {
    mockClient.dispatchEvent(new CustomEvent("tool-result", {
      detail: { name: "display_artifact_media", result: { success: true, display_url: "https://cdn/img.jpg" } },
    }));
  });

  expect(useVisualStore.getState().currentContent?.loading).toBe(false);
  expect(useVisualStore.getState().currentContent?.url).toBe("https://cdn/img.jpg");
});
```

**Test 3 — Token endpoint**:

```typescript
// apps/server/src/routes/__tests__/token.test.ts
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app } from "../../index";

// Mock AssemblyAI client
vi.mock("assemblyai", () => ({
  AssemblyAI: vi.fn().mockImplementation(() => ({
    agents: { createToken: vi.fn().mockResolvedValue({ value: "test-token-abc" }) },
  })),
}));

it("POST /api/token returns a token and sessionId", async () => {
  const res = await request(app)
    .post("/api/token")
    .send({ exhibitionId: "renaissance-gallery", depthMode: "quick" });

  expect(res.status).toBe(200);
  expect(res.body.token).toBe("test-token-abc");
  expect(res.body.sessionId).toBeDefined();
});
```

**Test 4 — Voice pipeline (no microphone needed)**:

```typescript
// Stream a recorded WAV through the AgentClient for full-pipeline CI testing
async function streamTestAudio(client: AgentClient, wavPath: string) {
  const wav = await fs.readFile(wavPath);
  const pcm = wavToPcm(wav);           // strip header, extract Int16
  const CHUNK_SIZE = 3200;             // 100ms at 16kHz

  for (let i = 0; i < pcm.length; i += CHUNK_SIZE) {
    client.sendAudio(pcm.slice(i, i + CHUNK_SIZE));
    await sleep(100);                  // pace to realtime — server drops faster frames
  }
}
```

### Phase 3 — End-to-End Tests **[Phase 3]**

```bash
npm i -D playwright
```

```typescript
// e2e/tour-session.spec.ts
import { test, expect } from "@playwright/test";

test("visitor can start a tour and see visual content", async ({ page, context }) => {
  await context.grantPermissions(["microphone"]);
  await page.goto("http://localhost:5173");

  await page.click("button[data-testid='start-tour']");
  await expect(page.locator(".companion--listening")).toBeVisible({ timeout: 5000 });

  // Simulate speech via injected audio (no real mic in CI)
  await page.evaluate(() => {
    window.__injectTestAudio?.("test-utterance-renaissance.wav");
  });

  // Wait for visual stage to update
  await expect(page.locator("[data-testid='media-viewer']")).toBeVisible({ timeout: 10000 });
  await expect(page.locator("[data-testid='map-pin']")).toBeVisible();
});
```

---

## 13. Performance & Latency Budget

### Target: < 600ms from end-of-speech to first agent audio **[Phase 1]**

| Segment | Target | Notes |
| :--- | :--- | :--- |
| STT finalization | ~100ms | `universal-3-5-pro` streaming |
| Agent LLM first token | ~200ms | Streaming enabled |
| TTS first audio chunk | ~150ms | Ember voice, streamed |
| Network round-trip | ~50ms | WebSocket |
| **Total** | **~500ms** | Achievable with Path 1 |

### Optimizations **[Phase 1]**

1. **Pre-warm `AudioContext`** on first user interaction — not on "Start Tour" click (avoids cold start)
2. **Pre-fetch temp token** 5 seconds before the user presses start
3. **Skeleton screens**: update VisualStage on `tool.call` — never on `tool.result`
4. **Gapless TTS**: schedule audio chunks with `AudioContext.currentTime`

```typescript
// Gapless TTS — never a gap between audio chunks
export class GaplessPlayer {
  private context = new AudioContext();
  private nextStartTime = 0;

  schedule(buffer: AudioBuffer) {
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    const t = Math.max(this.context.currentTime, this.nextStartTime);
    source.start(t);
    this.nextStartTime = t + buffer.duration;
  }
}
```

5. **Media prefetch**: when the map pins a room, prefetch all artifact media in that room
6. **`keyterms`**: pass exhibition-specific proper nouns to improve STT accuracy with no latency cost

---

## 14. Security & Configuration

### 14.1 Environment Variables **[Phase 1]**

```bash
# apps/server/.env — NEVER commit. Add to .gitignore.

# AssemblyAI — raw key, NO "Bearer" prefix for REST/Streaming
# Exception: Voice Agent API uses "Authorization: Bearer KEY"
ASSEMBLYAI_API_KEY=your_api_key_here

# Postgres — from Neon, Supabase, or Railway
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Shared secret for HTTP tool endpoint auth
TOOL_SECRET=replace_with_32_char_hex_random_string

# CORS — comma-separated, never *
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173

PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

### 14.2 Config Validation (Fail-Fast) **[Phase 1]**

```typescript
// apps/server/src/config.ts
import { z } from "zod";

const Config = z.object({
  ASSEMBLYAI_API_KEY: z.string().min(10),
  DATABASE_URL:       z.string().url(),
  TOOL_SECRET:        z.string().min(16),
  ALLOWED_ORIGINS:    z.string().transform((s) => s.split(",")),
  PORT:               z.coerce.number().default(3001),
  NODE_ENV:           z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL:          z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
});

// Throws at startup if any required var is missing — better to crash now than fail silently later
export const config = Config.parse(process.env);
```

### 14.3 Security Checklist

| Item | Phase |
| :--- | :--- |
| `ASSEMBLYAI_API_KEY` is **server-only** — never in frontend build | **Phase 1** |
| `DATABASE_URL` is **server-only** — never in frontend build | **Phase 1** |
| Tool endpoints validate `X-Tool-Secret` header | **Phase 1** |
| CORS restricted to known origins (not `*`) | **Phase 1** |
| Rate limiting on `/api/token`: ≤2/IP/min | **Phase 1** |
| `.env` in `.gitignore` | **Phase 1** |
| `Permissions-Policy: microphone=self` header | **Phase 1** |
| `Content-Security-Policy` header (allow `wss://agents.assemblyai.com`) | **Phase 1** |
| CDN URLs use signed tokens | **Phase 3** |
| Input sanitization on all user-facing endpoints | **Phase 2** |
| Session tokens expire (600s) | **Phase 1** |

---

## 15. Deployment

### 15.1 Frontend — Vercel **[Phase 1]**

```json
// apps/web/vercel.json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://your-backend.railway.app/api/:path*" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Permissions-Policy", "value": "microphone=self" },
        { "key": "Content-Security-Policy",
          "value": "default-src 'self'; connect-src wss://agents.assemblyai.com 'self'; media-src *; script-src 'self' 'unsafe-inline';" }
      ]
    }
  ]
}
```

### 15.2 Backend — Railway **[Phase 1]**

Railway is the recommended choice for this project because it gives you **Postgres + backend hosting in one place, on the free tier**.

```dockerfile
# apps/server/Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
# Run migrations then start server
CMD ["sh", "-c", "npx drizzle-kit migrate && node dist/index.js"]
```

```bash
# Set env vars on Railway (never commit these)
railway variables set ASSEMBLYAI_API_KEY=xxx
railway variables set TOOL_SECRET=xxx
railway variables set ALLOWED_ORIGINS=https://your-app.vercel.app
# DATABASE_URL is set automatically by Railway when you add a Postgres plugin
```

> **`min_machines_running = 1`** or equivalent: keep at least one backend instance warm. Cold starts add 2–5 seconds to first-request latency — completely unacceptable for a voice app.

### 15.3 DB Migrations on Deploy **[Phase 1]**

The `CMD` in the Dockerfile runs `drizzle-kit migrate` before starting the server. This means:
- Migrations are applied automatically on every deploy
- Rollbacks are done by reverting the migration file and redeploying
- Never run `drizzle-kit migrate` manually in production — the deploy process does it

### 15.4 Demo URL Checklist (Hackathon Submission)

- [ ] HTTPS everywhere — required for microphone access
- [ ] `Permissions-Policy: microphone=self` header is set
- [ ] No auth wall — judges must be able to open and use the app immediately
- [ ] Tested on Chrome desktop and Safari iOS
- [ ] `SELECT COUNT(*) FROM tour_sessions` after testing — sessions are recording in DB

---

## AssemblyAI Gotchas — Quick Reference

| Pitfall | Correct Behavior |
| :--- | :--- |
| `Authorization: Bearer KEY` on REST/Streaming | `Authorization: KEY` (no Bearer) — **except** Voice Agent API which uses `Bearer` |
| Writing meta-instructions in `greeting` | `greeting` is sent **verbatim to TTS** — write exact spoken words |
| `e.detail.args` from `tool.call` | Field is **`arguments`** (renamed April 2026): `e.detail.arguments` |
| Concatenating `transcript.user.delta` | It is **cumulative** — render the latest value only, never concatenate |
| Closing WS to end billing | Send `{ type: "session.end" }` first — bare close = 30s billable grace window |
| Sending `tool.result` before `reply.done` | Wait for `reply.done` — sending earlier breaks turn-taking |
| `speech_model: "u3-rt-pro"` | Removed July 2026 — use `universal-3-5-pro` |
| Audio faster than realtime | Server drops excess frames — pace sends to match realtime |
| `on_error` for close codes 1000/1006 | `on_error` never fires — put cleanup in `on_close` |
| HTTP tool `headers` as `{name: value}` | Must be `[{name, value}]` array (changed June 2026) |
| Using LeMUR | **Sunset March 2026** — use LLM Gateway with `transcript.text` in messages |

---

## Phase Tracker

Use this as a living checklist. Move items to `[x]` as you complete them.

### Phase 1 — Core Product (Build This First)

```
Infrastructure
[ ] Postgres DB provisioned (Railway / Neon)
[ ] Drizzle schema defined + first migration applied
[ ] Seed script runs on boot
[ ] Server health check at /health

Backend
[ ] Token endpoint: POST /api/token (rate-limited, records session in DB)
[ ] Tool endpoints: /tools/display-media, /tools/highlight-map, /tools/show-comparison
[ ] Exhibition query: GET /api/exhibitions/:id
[ ] Zod config validation (fail-fast on missing env vars)
[ ] Basic error middleware (returns JSON, doesn't crash server)

Frontend
[ ] AudioWorklet mic capture (off-main-thread, 16kHz PCM)
[ ] AgentClient WebSocket (session.update, binary audio, all event handlers)
[ ] GaplessPlayer for TTS
[ ] VisualStage: ExhibitionMap + MediaViewer + ArtifactCallout
[ ] CompanionFace with 4 CSS animation states
[ ] LiveTranscript (cumulative partial + final)
[ ] TourControls (depth toggle, mute, end)
[ ] useVisualSync: skeleton on tool.call, resolve on tool.result
[ ] Exponential backoff reconnection

Demo
[ ] End-to-end voice + visual sync works
[ ] Smoke test checklist passes
[ ] Deployed to Vercel + Railway
[ ] Live URL accessible without auth
```

### Phase 2 — Hardening (After Phase 1 is Done & Tested)

```
[ ] Replace console.log with pino structured logging
[ ] pino-http request logger middleware
[ ] Unit tests: DB schema, token endpoint, useVisualSync
[ ] DB health check in /health endpoint
[ ] Input validation on all tool call parameters (Zod)
[ ] tourSessions.endedAt updated on session.end
[ ] CORS locked to specific origins (not *)
[ ] Rate limiting tuned from metrics
```

### Phase 3 — Scale (Post-Launch, Only If Needed)

```
[ ] pgvector + semantic search over docent_facts
[ ] Stored agent via POST /v1/agents
[ ] Webhook subscriptions for session.completed
[ ] Visitor analytics (anonymized artifact engagement)
[ ] i18n: language_codes in session.input
[ ] Accessibility: full keyboard control, ARIA roles audit
[ ] Playwright E2E tests
[ ] Load testing: 50 concurrent sessions
[ ] Log aggregation service (Logtail / Axiom)
[ ] Signed CDN URLs
```
