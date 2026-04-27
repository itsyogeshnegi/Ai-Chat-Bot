import { env } from "../config/env.js";

export const streamOllamaResponse = async ({ prompt, model, signal, onChunk }) => {
  let response;

  try {
    response = await fetch(`${env.ollamaBaseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: true
      }),
      signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Unable to connect to Ollama. Make sure the Ollama server is running at the configured URL."
    );
  }

  if (!response.ok) {
    let errorMessage = `Ollama request failed with status ${response.status}.`;

    try {
      const payload = await response.json();
      errorMessage = payload.error || payload.message || errorMessage;
    } catch {
      const text = await response.text().catch(() => "");
      if (text.trim()) {
        errorMessage = text.trim();
      }
    }

    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error("Ollama did not return a readable response body.");
  }

  const decoder = new TextDecoder();
  const reader = response.body.getReader();
  let buffer = "";
  let fullResponse = "";
  let finalStats = null;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        continue;
      }

      const payload = JSON.parse(trimmed);

      if (payload.error) {
        throw new Error(payload.error);
      }

      const delta = payload.response || "";

      if (delta) {
        fullResponse += delta;
        onChunk(delta);
      }

      if (payload.done) {
        finalStats = payload;
      }
    }
  }

  if (buffer.trim()) {
    const payload = JSON.parse(buffer.trim());

    if (payload.error) {
      throw new Error(payload.error);
    }

    const delta = payload.response || "";

    if (delta) {
      fullResponse += delta;
      onChunk(delta);
    }

    if (payload.done) {
      finalStats = payload;
    }
  }

  return {
    text: fullResponse,
    stats: finalStats
  };
};
