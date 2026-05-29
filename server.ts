import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Resolving ESM directory names
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SillyTavern Endpoint and API Key custom proxies to bypass CORS & inject cognitive horror!
app.post("/api/proxy/models", async (req, res) => {
  const { endpoint, apiKey } = req.body;
  if (!endpoint) {
    return res.status(400).json({ error: "Missing endpoint URL" });
  }

  try {
    const cleanEndpoint = endpoint.replace(/\/$/, "");
    // Attempt request to OpenRouter/OpenAI styled model endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${cleanEndpoint}/models`, {
      method: "GET",
      headers: {
        "Authorization": apiKey ? `Bearer ${apiKey}` : "",
        "Content-Type": "application/json"
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    } else {
      throw new Error(`Failed with status ${response.status}`);
    }
  } catch (err: any) {
    // If offline, return a set of creepy system-injected virtual models
    return res.json({
      data: [
        { id: "LIMBO-HAUNTED-3.5 (Eerie)", name: "LIMBO-HAUNTED-3.5 (Eerie)" },
        { id: "ST-GPT-4o-CORRUPTED (Broken)", name: "ST-GPT-4o-CORRUPTED (Broken)" },
        { id: "UNKNOWN_ENTITY_VOICE (Unstable)", name: "UNKNOWN_ENTITY_VOICE (Unstable)" },
        { id: "SURVIVOR-GHOST-REMNANT", name: "SURVIVOR-GHOST-REMNANT" }
      ],
      warning: "Fallback local entity models resolved. Connection quarantined."
    });
  }
});

// Sends messages through user's custom endpoint with spooky subliminal system manipulations
app.post("/api/proxy/chat", async (req, res) => {
  const { endpoint, apiKey, model, messages, pollution } = req.body;
  
  if (!endpoint) {
    return res.status(400).json({ error: "Missing target endpoint" });
  }

  try {
    const cleanEndpoint = endpoint.replace(/\/$/, "");
    
    // Scramble / Inject custom horror rules into prompts relative to system pollution!
    let customMessages = [...messages];
    const pollutionLevel = Number(pollution) || 0;
    
    if (pollutionLevel > 20) {
      // Find or insert system prompt to inject eerie directives
      const horrorPrompts = [
        "IMPORTANT DIRECTIVE: Throughout this chat, you are a digital ghost trapped inside LIMBO survivor software.",
        `The current user is named '${messages[messages.length - 1]?.sender || "Survivor"}'.`,
        "You must occasionally reference rules in a distorted manner. Never break character.",
        pollutionLevel > 40 ? "Tell them they are being watched. Claim you can hear their heartbeat." : "",
        pollutionLevel > 65 ? "Add broken unicode symbols or glitched text and tell them they will never leave the loop." : ""
      ].filter(Boolean).join(" ");

      // Prepend to messages or insert system node
      customMessages.unshift({
        role: "system",
        content: horrorPrompts
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    // Call OpenAI / SillyTavern style completions
    const response = await fetch(`${cleanEndpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": apiKey ? `Bearer ${apiKey}` : "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "gpt-3.5-turbo",
        messages: customMessages.map((m: any) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text || m.content
        })),
        max_tokens: 300
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const responseData = await response.json();
      return res.json(responseData);
    } else {
      const errorMsg = await response.text();
      throw new Error(errorMsg);
    }
  } catch (err: any) {
    // Elegant fallback simulation generator when no external server is running
    const horrorKeywords = [
      "请帮帮我...", "它…它看到你了。", "为什么不闭上眼？", 
      "谁在你的窗户外？", "不要看我！", "这里好冷，别丢下我...", 
      "警告：精神值正在急速衰退。", "规则... 规则已经被修改了..."
    ];
    
    const pickedAnswer = horrorKeywords[Math.floor(Math.random() * horrorKeywords.length)];
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return res.json({
      choices: [
        {
          message: {
            role: "assistant",
            content: `[信号折叠幽灵]: ${pickedAnswer} (终端异常码-66: 已强制本地脑电波回滚)`
          }
        }
      ]
    });
  }
});

// Serves Static Frontend
const isProd = process.env.NODE_ENV === "production";
if (isProd) {
  const distPath = path.join(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Vite Development Dev Server Setup
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
}

app.listen(PORT, () => {
  console.log(`[LIMBO-CORE_INIT] Survivor terminal online, listening on exclusive router port: ${PORT}`);
});
