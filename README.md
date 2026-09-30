# Conversational AI Museum Guide

A conversational museum guide that turns a traditional, fixed audio tour into an interactive experience that follows the visitor’s curiosity.

What We Built

Instead of selecting predefined audio tracks or navigating through menus, visitors can simply talk to an AI guide.

They can:

- Ask for a recommended museum tour
- Ask questions about artworks
- Explore specific visual details
- Get contextual explanations
- Ask for directions
- Navigate the museum using natural language

The key idea is that the conversation controls the experience.

Interactive Experience

The AI isn't limited to responding with voice.

A visitor's request can trigger actions in the visual interface, such as:

- 🔎 Zooming into an artwork detail
- 📍 Creating visual hotspots
- 🖼️ Displaying contextual artwork information
- 🗺️ Opening the museum floor plan
- 🚶 Generating a route to a destination

This connects the conversational layer directly to what the visitor sees and where they need to go.

Technology

Voice & AI

- AssemblyAI Voice Agent API — real-time voice interaction, turn-taking, and tool calling
- AI agent with structured tool calls for controlling the application
- Groq(qwen) or Gemini for image aanalysis( based on availability)

Frontend
- Nextjs
- 
Core Architecture

Visitor → Voice → AssemblyAI Voice Agent → Tool Calls → Application State → Visual Interface

This allows natural spoken requests to produce real actions inside the application rather than simply generating a text or voice response.

Why It Matters

Traditional audio guides provide predetermined information.

Our approach makes the experience conversational.

Visitors can ask the question they actually have, follow unexpected details, change direction, and interact with the experience without navigating through complex menus.

Beyond Museums

The same architecture can support other physical spaces:

- Historic sites
- Heritage locations
- Botanical gardens
- Zoos
- University campuses
- Tourist attractions

Museums are our starting point for a broader idea: a conversational guide for the physical world.

Goal

Make exploring physical spaces feel natural, conversational, and personalized—giving every visitor a guide that can follow their curiosity in real time.
