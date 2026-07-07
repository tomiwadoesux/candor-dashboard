import "server-only";

const HF_URL = "https://router.huggingface.co/v1/chat/completions";

// Non-gated instruct models served by HF inference providers, tried in order.
// meta-llama/* models are license-gated and fail on tokens that haven't
// accepted Meta's terms — which is why they are not the default here.
// Override the first choice with HF_MODEL if you have access to something better.
const MODEL_CHAIN = [
  process.env.HF_MODEL,
  "Qwen/Qwen2.5-72B-Instruct",
  "Qwen/Qwen2.5-7B-Instruct",
  "HuggingFaceH4/zephyr-7b-beta",
].filter(Boolean);

// Calls the HF router with model fallback. Returns
// { reply } or { error, detail } — never throws.
export async function hfChat(messages, { maxTokens = 400, temperature = 0.4 } = {}) {
  if (!process.env.HF_TOKEN) {
    return { error: "not_configured", detail: "HF_TOKEN is not set" };
  }

  let lastDetail = "";
  for (const model of MODEL_CHAIN) {
    try {
      const res = await fetch(HF_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
      });
      if (!res.ok) {
        const body = await res.text();
        lastDetail = `${model}: HTTP ${res.status} ${body.slice(0, 200)}`;
        // 401 means the token itself is bad — no point trying other models.
        if (res.status === 401) break;
        continue;
      }
      const json = await res.json();
      const reply = json.choices?.[0]?.message?.content?.trim();
      if (reply) return { reply, model };
      lastDetail = `${model}: empty completion`;
    } catch (err) {
      lastDetail = `${model}: ${err?.message ?? "network error"}`;
    }
  }

  console.error("[ai] all models failed:", lastDetail);
  return { error: "unavailable", detail: lastDetail };
}
