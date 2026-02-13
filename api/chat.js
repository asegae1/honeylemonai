export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { prompt, image, fileText, fileName } = req.body;

  try {
    if (image) {
      // --- 画像がある場合は Gemini 1.5 Flash で視覚解析 ---
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `ファイル名: ${fileName}\n命令: ${prompt || "この画像を詳しく説明してください。"}` },
              { inline_data: { mime_type: "image/png", data: image.split(',')[1] } }
            ]
          }]
        })
      });
      const data = await response.json();
      return res.status(200).json({ content: data.candidates[0].content.parts[0].text });
    } else {
      // --- 画像がない場合は Groq で高速テキスト解析 ---
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "あなたはファイルの内容を正確に分析するアシスタントです。" },
            { role: "user", content: fileText ? `ファイル名: ${fileName}\n内容:\n${fileText}\n\n質問: ${prompt}` : prompt }
          ]
        })
      });
      const data = await response.json();
      return res.status(200).json({ content: data.choices[0].message.content });
    }
  } catch (error) {
    res.status(500).json({ error: "解析に失敗しました。APIキーを確認してください。" });
  }
}
