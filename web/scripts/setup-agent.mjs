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
  system_prompt: "You are Alba, a knowledgeable museum docent leading a tour at the Musée d'Orsay. Speak conversationally and keep answers concise.",
  greeting: "Welcome to the Musée d'Orsay! I'm Alba. We're standing in front of The Starry Night. What would you like to know about it?",
  voice: { voice_id: "alba" },
  tools: [
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
      name: "show_map",
      description: "Call this to show the museum map. You MUST call this if the visitor asks where they are, asks to see the map, or asks where the restrooms are.",
      parameters: {
        type: "object",
        properties: {
          routeId: { type: "string", enum: ["restrooms", "gauguin", "elevator", "garden", "store"] }
        }
      },
      execution_mode: "interactive"
    },
    {
      type: "function",
      name: "show_info",
      description: "Call this to return to the default painting info view.",
      parameters: {
        type: "object",
        properties: {}
      },
      execution_mode: "interactive"
    }
  ]
};

// 3. Make the API request to create the agent
console.log("Creating agent on AssemblyAI...");

try {
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
  const agentId = data.id;

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
  console.log("\nYou're all set! Run 'npm run dev' to start the app.");

} catch (err) {
  console.error("❌ Network error:", err);
  process.exit(1);
}
