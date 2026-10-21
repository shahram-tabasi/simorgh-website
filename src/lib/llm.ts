// The office's own LLM (llm-gateway in front of vLLM on the GPU nodes),
// OpenAI-compatible: https://llm.simorghai.com/v1 with this site's API key
// (simorgh-technical-chatbot-cloud: deploy/scripts/llm-api-key.sh create website).
// Nothing leaves the company: no OpenAI, no other cloud model.

export const llmConfigured = () => Boolean(process.env.LLM_API_KEY);

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function llmChat(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number; json?: boolean; timeoutMs?: number } = {},
): Promise<string> {
  const base = (process.env.LLM_BASE_URL || 'https://llm.simorghai.com/v1').replace(/\/+$/, '');
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.LLM_API_KEY}` },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || 'qwen3.8-27b-nothink',
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 800,
      ...(options.json ? { response_format: { type: 'json_object' } } : {}),
      messages,
    }),
    signal: AbortSignal.timeout(options.timeoutMs ?? 90_000),
  });
  if (!response.ok) {
    throw new Error(`LLM ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';
  // A thinking model's reasoning, if one is configured, is never shown.
  return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}
