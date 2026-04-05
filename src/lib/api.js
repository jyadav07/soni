/**
 * Anthropic API fetch helper.
 * Calls are made server-side or via a proxy to avoid exposing the API key.
 */
export async function callClaude({ apiKey, model = 'claude-sonnet-4-6', messages, system }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      ...(system ? { system } : {}),
      messages,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.error?.message ?? `API error ${response.status}`)
  }

  return response.json()
}
