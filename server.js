require("dotenv").config();
const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const claude = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

app.get("/api/status", (_req, res) => {
  res.json({
    claudeConnected: Boolean(claude),
    imageConnected: Boolean(process.env.OPENAI_API_KEY)
  });
});

app.post("/api/generate", async (req, res) => {
  try {
    if (!claude) return res.status(503).json({
      error: "Claude is not connected. Add ANTHROPIC_API_KEY as a private server secret."
    });

    const prompt = String(req.body.prompt || "").trim();
    if (!prompt) return res.status(400).json({ error: "Enter a request first." });
    if (prompt.length > 12000) return res.status(413).json({ error: "Request is too long." });

    const result = await claude.messages.create({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-4-5",
      max_tokens: 6000,
      system: `You are ForgeGui, a Roblox Studio Lite development assistant.
Generate practical Luau for games the user owns. State each script's exact Explorer location.
For multi-script systems, separate scripts with clear filenames and placement instructions.
Use secure server-authoritative logic: validate RemoteEvents; never trust clients for currency,
damage, purchases, inventory, or permissions. Do not create exploit executors or cheats.
Do not claim code has been installed or tested. Explain Studio Lite limitations honestly.
The user prefers game systems without unsolicited GUI elements. Only create GUI code if explicitly requested.`,
      messages: [{ role: "user", content: prompt }]
    });

    const answer = result.content.filter(x => x.type === "text").map(x => x.text).join("\n");
    res.json({ answer });
  } catch (e) {
    console.error("Claude API error:", e.message);
    res.status(500).json({ error: "Claude request failed. Check its API key, model access, and account billing/limits." });
  }
});

app.post("/api/image", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(503).json({
      error: "Image AI is not connected. Add OPENAI_API_KEY as a private server secret."
    });

    const userPrompt = String(req.body.prompt || "").trim();
    const kind = req.body.kind === "icon" ? "icon" : "thumbnail";
    if (!userPrompt) return res.status(400).json({ error: "Describe the image you want first." });
    if (userPrompt.length > 8000) return res.status(413).json({ error: "Prompt is too long." });

    const format = kind === "icon"
      ? "Square 1:1 Roblox game icon composition."
      : "Wide landscape Roblox game thumbnail composition, designed to crop cleanly to 16:9.";

    const prompt = `Create polished, original Roblox-inspired 3D game artwork. ${format}
Use blocky toy-like Roblox avatar proportions, expressive readable poses, detailed environment,
cinematic lighting, clear subject separation, rich colors, professional game marketing composition.
Do not include watermarks, logos of real brands, or UI overlays.
User's scene request: ${userPrompt}`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-flare",
        prompt,
        n: 1,
        size: kind === "icon" ? "1024x1024" : "1536x1024",
        quality: "high",
        output_format: "png"
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Image API error:", data);
      return res.status(response.status).json({
        error: data.error?.message || "Image generation failed. Check API access, model availability, and billing."
      });
    }

    const image = data.data && data.data[0] && data.data[0].b64_json;
    if (!image) return res.status(502).json({ error: "The image service returned no image data." });
    res.json({ image: `data:image/png;base64,${image}`, revisedPrompt: data.data[0].revised_prompt || null });
  } catch (e) {
    console.error("Image generation error:", e.message);
    res.status(500).json({ error: "Could not reach the online image service. Try again later." });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`ForgeGui Online AI listening on port ${port}`));
