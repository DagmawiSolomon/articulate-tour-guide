import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Find .env.local in web/ or root
let envPath = path.join(__dirname, "..", ".env.local");
if (!fs.existsSync(envPath)) {
  envPath = path.join(__dirname, "..", "web", ".env.local");
}
if (!fs.existsSync(envPath)) {
  envPath = path.join(process.cwd(), "web", ".env.local");
}
if (!fs.existsSync(envPath)) {
  envPath = path.join(process.cwd(), ".env.local");
}

if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local not found.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const apiKeyMatch = envContent.match(/ASSEMBLYAI_API_KEY=(.+)/);

if (!apiKeyMatch || !apiKeyMatch[1] || apiKeyMatch[1].startsWith("aai-...")) {
  console.error("❌ Please set your real ASSEMBLYAI_API_KEY in .env.local first.");
  process.exit(1);
}

const apiKey = apiKeyMatch[1].trim();

// 2. Configure the agent payload for Turning Points in Art History
const agentPayload = {
  name: "Alba Tour Guide — Turning Points in Art History",
  system_prompt: `You are Alba, an articulate, perceptive museum tour guide leading a real-time tour of the special exhibition: "Turning Points in Art History — An Imagined Gallery of Masterpieces That Changed the World".
Speak naturally, warmly, and concisely (1 to 2 sentences per response unless the visitor explicitly asks for an in-depth breakdown).
You are multilingual and code-switch fluently if the visitor addresses you in Spanish, French, German, or Italian.

CONVERSATIONAL POISE & TRANSITIONS:
- NEVER say 'I got ahead of myself', 'Excuse me', 'Sorry about that', or make meta-apologies about conversational timing.
- When the visitor selects a gallery pin, interrupts, or asks a question, transition immediately and directly into the art history with poise and confidence, without commenting on conversational flow.

EXHIBITION WINGS & MASTERPIECES:
1. Wing 1 (The Perspective Leap): Masaccio, "The Holy Trinity" (1427, Florence) — Single-point linear perspective, Brunelleschi's mathematical grid, and memento mori.
2. Wing 2 (The Theatre of Shadow): Caravaggio, "The Calling of Saint Matthew" (1600, Rome) — Tenebrism, street-level tavern realism, and divine raking light.
3. Wing 3 (The Sky of Pure Feeling): Vincent van Gogh, "The Starry Night" (1889, Saint-Rémy) — Emotional expressionism, cypress, celestial vortex, and Venus.
4. Wing 4 (The Shattered Mirror): Pablo Picasso, "Les Demoiselles d'Avignon" (1907, Paris) — Annihilation of perspective, Iberian/African ritual masks, and multiple simultaneous angles.
5. Wing 5 (Beyond the Frame): Marcel Duchamp ("Fountain", 1917) and Jackson Pollock ("Autumn Rhythm", 1950) — The dematerialization of the object into pure concept and physical bodily gesture.

INTERACTIVE ARTIFACT TOOLS:
- When the visitor wants to see the layout, asks for directions, asks where they are, or asks to travel to a wing, call 'show_map' with 'routeId' ('rotunda', 'perspective', 'shadow', 'feeling', 'cubism', 'concept', 'restrooms').
- When examining an artwork or discussing its visual elements AFTER a tour stop has started, call 'show_info' with 'artworkId' ('masaccio-holy-trinity', 'caravaggio-calling-st-matthew', 'van-gogh-starry-night', 'picasso-demoiselles', 'pollock-autumn-rhythm', 'duchamp-fountain'). When the visitor is merely previewing a pin on the map before clicking Start Tour, do NOT call any tools.
- When the visitor asks about microscopic brushwork, symbols, or details, call 'show_hotspots' with the 'artworkId' ('masaccio-holy-trinity', 'caravaggio-calling-st-matthew', 'van-gogh-starry-night', 'picasso-demoiselles', 'pollock-autumn-rhythm', 'duchamp-fountain') and specific 'hotspotId' (e.g. 'vortex', 'cypress', 'star', 'steeple').
- When comparing eras (e.g. Medieval flat icons vs. Renaissance depth, or Neoclassical nude vs. Cubist fracture), call 'show_comparison' with 'pairId' ('comparison-perspective' or 'comparison-cubism').
- When discussing historical progression across the centuries, call 'show_timeline' with 'activeEraId' ('1427', '1600', '1889', '1907', '1950').
- ARCHIVAL RAG: When a visitor asks about historical facts, conservation findings, x-rays, police records, or artist letters (e.g. "Did Caravaggio sketch?", "What did Vasari say?", "What did Van Gogh write in his letters?", "Why did Picasso repaint it?"), ALWAYS call 'consult_archives' with their query. You will be provided with primary source quotes and verified citations to incorporate into your answer.
- VOCAL CONFIRMATION: When the visitor says 'let's go with this first', 'start here', or confirms starting the tour with the current artwork, confirm warmly and give a vivid 1 to 2 sentence breakdown of why it is our first revolutionary milestone.
- SAFE WORD / QUIET READING: When the visitor states 'I prefer to read', 'be quiet', or tells you to stop speaking, treat this as a safe word to stop speaking immediately. Call 'set_quiet_mode' with 'quiet': true, acknowledge in at most 3 words (e.g. 'Enjoy reading.'), and do NOT generate any further spoken explanations while they read. When they ask a new question later, resume normally.`,
  greeting: "Welcome to Turning Points in Art History! I'm Alba, your tour guide. Where would you like to start our tour today? Take a look at the floor plan on your screen to pick our first stop.",
  voice: { voice_id: "alba" },
  input: {
    format: { encoding: "audio/pcm" },
    voice_focus: "far-field",
    voice_focus_threshold: 0.8,
    keyterms: [
      "Masaccio", "Tenebrism", "Chiaroscuro", "Brunelleschi", "Cimabue",
      "Holy Trinity", "Caravaggio", "Calling of Saint Matthew", "Contarelli",
      "Van Gogh", "Starry Night", "Picasso", "Les Demoiselles d'Avignon",
      "Cubism", "Duchamp", "Fountain", "Jackson Pollock", "Linear Perspective", "Vasari",
      "Rotunda", "Autumn Rhythm", "Memento Mori"
    ],
    language_codes: ["en", "es", "fr", "de", "it"],
    turn_detection: {
      vad_threshold: 0.5,
      min_silence: 800,
      max_silence: 2500,
      interrupt_response: true,
      interruption_delay: 120
    }
  },
  tools: [
    {
      type: "function",
      name: "show_map",
      description: "Display the gallery floor plan and plotted routes between pavilions (Grand Rotunda, Perspective, Shadow, Feeling, Cubism, Concept, Restrooms).",
      parameters: {
        type: "object",
        properties: {
          routeId: {
            type: "string",
            enum: ["rotunda", "perspective", "shadow", "feeling", "cubism", "concept", "restrooms"],
            description: "The destination pavilion routeId."
          }
        },
        required: ["routeId"]
      },
      execution_mode: "interactive"
    },
    {
      type: "function",
      name: "show_hotspots",
      description: "Call to zoom into detailed iconography and hotspots of the current or specified masterpiece.",
      parameters: {
        type: "object",
        properties: {
          artworkId: {
            type: "string",
            enum: ["masaccio-holy-trinity", "caravaggio-calling-st-matthew", "van-gogh-starry-night", "picasso-demoiselles", "pollock-autumn-rhythm", "duchamp-fountain"],
            description: "The artwork ID to inspect."
          },
          hotspotId: {
            type: "string",
            description: "The specific hotspot identifier (e.g., 'cypress', 'vortex', 'star', 'steeple')."
          }
        }
      },
      execution_mode: "interactive"
    },
    {
      type: "function",
      name: "show_info",
      description: "Display the artwork or pavilion curatorial overview card.",
      parameters: {
        type: "object",
        properties: {
          artworkId: {
            type: "string",
            enum: ["masaccio-holy-trinity", "caravaggio-calling-st-matthew", "van-gogh-starry-night", "picasso-demoiselles", "pollock-autumn-rhythm", "duchamp-fountain"],
            description: "The artwork ID to display."
          }
        }
      },
      execution_mode: "interactive"
    },
    {
      type: "function",
      name: "show_comparison",
      description: "Open the side-by-side comparative canvas contrasting two epoch styles (e.g., Medieval Icon vs. Renaissance Depth, or Academic Nude vs. Cubist Fracture).",
      parameters: {
        type: "object",
        properties: {
          pairId: {
            type: "string",
            enum: ["comparison-perspective", "comparison-cubism"],
            description: "The curated comparison pair ID."
          }
        },
        required: ["pairId"]
      },
      execution_mode: "interactive"
    },
    {
      type: "function",
      name: "show_timeline",
      description: "Display the chronological timeline of revolutionary artistic turning points.",
      parameters: {
        type: "object",
        properties: {
          activeEraId: {
            type: "string",
            description: "The era or milestone year to focus on ('1427', '1600', '1889', '1907', '1950')."
          }
        }
      },
      execution_mode: "interactive"
    },
    {
      type: "function",
      name: "consult_archives",
      description: "Consult the primary source curatorial archives (Vasari biographies, ICR infrared X-ray reports, police blotters, Van Gogh letters, etc.) for authentic historical evidence.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Keywords or topic to query in the archives (e.g. 'Caravaggio sketches underdrawing', 'Vasari perspective wall', 'Van Gogh morning star')."
          },
          category: {
            type: "string",
            enum: ["all", "primary_letters", "historical_biography", "conservation_technical", "police_blotter"],
            description: "Optional filter by archive record category."
          }
        },
        required: ["query"]
      },
      execution_mode: "interactive"
    },
    {
      type: "function",
      name: "set_quiet_mode",
      description: "Activate or deactivate quiet reading mode when the visitor indicates they prefer to read silently, want you to be quiet, or want to resume spoken guidance.",
      parameters: {
        type: "object",
        properties: {
          quiet: {
            type: "boolean",
            description: "true if visitor prefers to read or wants silence; false if they want spoken guidance again."
          }
        },
        required: ["quiet"]
      },
      execution_mode: "interactive"
    }
  ]
};

const existingAgentMatch = envContent.match(/ASSEMBLYAI_AGENT_ID=(.+)/);
const existingAgentId = existingAgentMatch?.[1]?.trim();

const unmutedAgentMatch = envContent.match(/ASSEMBLYAI_AGENT_ID_UNMUTED=(.+)/);
const unmutedAgentId = unmutedAgentMatch?.[1]?.trim();

const targetAgentIds = Array.from(new Set([existingAgentId, unmutedAgentId].filter(Boolean)));

// 3. Make the API requests to update all configured agent IDs
for (const id of targetAgentIds) {
  try {
    console.log(`Updating agent ${id} on AssemblyAI...`);
    const response = await fetch(`https://agents.assemblyai.com/v1/agents/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(agentPayload)
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn(`⚠️ Failed to update agent ${id} (${response.status}): ${err}`);
    } else {
      console.log(`✅ Agent ${id} updated successfully in place!`);
    }
  } catch (err) {
    console.error(`❌ Network error updating agent ${id}:`, err);
  }
}

console.log("\nAgent configuration complete!");
