// api/chat.js
export default async function handler(req, res) {
  // POSTメソッド以外を弾く
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model, systemPrompt, maxTokens } = JSON.parse(req.body);

    // Groq APIへのリクエスト
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: parseInt(maxTokens) || 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
