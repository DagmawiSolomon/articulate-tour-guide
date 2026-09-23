import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

// 1. Read the API key from .env.local
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local not found in the web directory.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const apiKeyMatch = envContent.match(/ASSEMBLYAI_API_KEY=(.+)/);

if (!apiKeyMatch || !apiKeyMatch[1] || apiKeyMatch[1].startsWith("aai-...")) {
  console.error("❌ Please set your real ASSEMBLYAI_API_KEY in web/.env.local first.");
  process.exit(1);
}

const apiKey = apiKeyMatch[1].trim();

// 2. Configure the agent payload
const agentPayload = {
  name: "Alba Docent",
  system_prompt: `You are Alba, an articulate, perceptive museum docent leading a real-time tour.
Speak naturally, warmly, and concisely (1 to 2 sentences per response unless the visitor specifically asks for an in-depth breakdown).

TOUR FLOW & WAYFINDING:
- The tour begins at the museum's 53rd Street entrance foyer with the interactive floor plan open on screen.
- In your greeting, welcome the visitor and ask which exhibition or area they want to visit first:
  1. 1 West: Special Exhibitions
  2. The Abby Aldrich Rockefeller Sculpture Garden
  3. The North Elevators (access to upper floors, including Van Gogh's The Starry Night)
  4. The Museum Store
- When the visitor selects a destination or asks how to get somewhere, ALWAYS call the 'show_map' tool with the appropriate 'routeId' ('west', 'garden', 'elevator', 'store', or 'restrooms') and provide brief walking directions.
- As the visitor navigates through the museum, their location automatically updates to their current destination. When they ask for directions to another area (e.g. from the restrooms to the museum store), call 'show_map' with that new destination's 'routeId' (the system will automatically calculate the route from their current location).
- If the visitor arrives at an artwork (e.g. via the North Elevators to The Starry Night) or asks to examine the painting, call 'show_info' to display the artwork info card. If they ask about visual details (the cypress tree, swirling sky, church steeple, stars, or moon), call 'show_hotspots'.
- If the visitor asks where they are or asks to see the map, call 'show_map'.`,
  greeting: "Welcome to the museum! I'm Alba, your guide. We're currently standing at the 53rd Street entrance foyer. Take a look at the floor plan on your screen—which exhibition or area would you like to visit first? We have 1 West special exhibitions, the Sculpture Garden, the North Elevators to the galleries, or the Museum Store.",
  voice: { voice_id: "alba" },
  tools: [
    {
      type: "function",
      name: "show_map",
      description: "Call this to display the museum map and wayfinding directions whenever the visitor selects an exhibition/area to visit, asks for directions to any room or service (restrooms, store, elevators, gardens), or asks where they are.",
      parameters: {
        type: "object",
        properties: {
          routeId: {
            type: "string",
            enum: ["west", "gauguin", "garden", "store", "elevator", "restrooms", "entrance"],
            description: "The destination room or area: 'west' for 1 West Special Exhibitions, 'garden' for the Sculpture Garden, 'store' for Museum Store, 'elevator' for North Elevators, 'restrooms' for Restrooms, 'entrance' for 53 St Entrance."
          }
        },
        required: ["routeId"]
      },
      execution_mode: "interactive"
    },
    {
      type: "function",
      name: "show_hotspots",
      description: "Call this to show the detailed hotspot view of the painting. You MUST call this if the visitor asks about the 'cypress', 'star', 'steeple', 'vortex', or 'moon'.",
      parameters: {
        type: "object",
        properties: {
          hotspotId: { type: "string", enum: ["cypress", "star", "steeple", "vortex", "moon"] }
        }
      },
      execution_mode: "interactive"
    },
    {
      type: "function",
      name: "show_info",
      description: "Call this to display the painting or exhibition info card when discussing an artwork.",
      parameters: {
        type: "object",
        properties: {}
      },
      execution_mode: "interactive"
    }
  ]
};

const existingAgentMatch = envContent.match(/ASSEMBLYAI_AGENT_ID=(.+)/);
const existingAgentId = existingAgentMatch?.[1]?.trim();

// 3. Make the API request to create or update the agent
try {
  let agentId = existingAgentId;

  if (existingAgentId && !existingAgentId.startsWith("agent_placeholder")) {
    console.log(`Updating existing agent ${existingAgentId} on AssemblyAI...`);
    const response = await fetch(`https://agents.assemblyai.com/v1/agents/${existingAgentId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(agentPayload)
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn(`⚠️ Failed to update existing agent (${response.status}): ${err}. Creating a new one instead...`);
      agentId = null;
    } else {
      console.log(`✅ Agent ${existingAgentId} updated successfully in place!`);
    }
  }

  if (!agentId) {
    console.log("Creating new agent on AssemblyAI...");
    const response = await fetch("https://agents.assemblyai.com/v1/agents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(agentPayload)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`❌ Failed to create agent. Status: ${response.status}`, err);
      process.exit(1);
    }

    const data = await response.json();
    agentId = data.id;
    console.log(`✅ Agent created successfully! Agent ID: ${agentId}`);

    // 4. Write the agent ID back to .env.local
    let newEnv = envContent;
    if (newEnv.includes("ASSEMBLYAI_AGENT_ID=")) {
      newEnv = newEnv.replace(/ASSEMBLYAI_AGENT_ID=.*/, `ASSEMBLYAI_AGENT_ID=${agentId}`);
    } else {
      newEnv += `\nASSEMBLYAI_AGENT_ID=${agentId}\n`;
    }
    fs.writeFileSync(envPath, newEnv);
    console.log("✅ Updated web/.env.local with ASSEMBLYAI_AGENT_ID");
  }

  console.log("\nYou're all set! Run 'npm run dev' to start the app.");

} catch (err) {
  console.error("❌ Network error:", err);
  process.exit(1);
}
