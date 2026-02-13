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
        model: body.model || "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "あなたはHoneyLemonAIです。親切に日本語で回答してください。" },
          { role: "user", content: body.prompt }
        ],
        max_tokens: body.maxTokens || 1000
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
