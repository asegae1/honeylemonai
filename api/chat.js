export default async function handler(req, res) {
  // POSTメソッド以外は受け付けない
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // リクエストボディの解析（Vercelの環境に合わせて安全にパース）
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { prompt, systemPrompt } = body;

    // APIキーの存在確認
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY が Vercel の環境変数に設定されていません。' });
    }

    // Groq API へのリクエスト
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // 高速で制限が緩い 8b モデル。1日400回に最適。
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt || '親切なアシスタント。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await groqResponse.json();

    // 正常な応答をクライアントに返す
    res.status(200).json(data);

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ 
      error: 'チャットAPIでエラーが発生しました。', 
      details: error.message 
    });
  }
}
