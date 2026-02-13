export default async function handler(req, res) {
  try {
    const b = JSON.parse(req.body);
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: b.model,
        messages: [{ role: "system", content: b.systemPrompt }, { role: "user", content: b.prompt }],
        max_tokens: parseInt(b.maxTokens),
        temperature: parseFloat(b.temp) || 0.7,
        top_p: 1,
        stream: false
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "API接続エラー" });
  }
}
