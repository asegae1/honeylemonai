export default async function handler(req, res) {
  try {
    const body = JSON.parse(req.body);
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: body.model,
        messages: [
          { role: "system", content: body.systemPrompt },
          { role: "user", content: body.prompt }
        ],
        max_tokens: parseInt(body.maxTokens) || 500
      })
    });
    const data = await response.json();
    if (!response.ok) {
        return res.status(response.status).json({ error: data.error.message });
    }
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "サーバー接続に失敗しました。" });
  }
}
