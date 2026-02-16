// Vercel Serverless Function — AI Coach Proxy
// Env: ANTHROPIC_API_KEY (server-side only)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const { message, systemPrompt, history } = req.body

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing message' })
  }

  try {
    const messages = [
      ...(history || []).map(m => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 300,
        system: systemPrompt || 'אתה מאמן למידה. ענה בקצרה בעברית.',
        messages,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return res.status(502).json({ error: 'AI service error' })
    }

    const data = await response.json()
    const reply = data.content?.[0]?.text || 'אין תשובה'

    return res.status(200).json({ reply })
  } catch (err) {
    console.error('AI Coach error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
