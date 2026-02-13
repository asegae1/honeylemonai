export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const { prompt, image, fileText, fileName } = req.body;

  try {
    if (image) {
      // --- Gemini 1.5 Flash (視覚解析) ---
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `あなたは画像解析のプロです。画像の中身を詳しく説明してください。命令: ${prompt || "この画像は何？"}` },
              { inline_data: { mime_type: "image/png", data: image.split(',')[1] } }
            ]
          }]
        })
      });
      const data = await response.json();
      return res.status(200).json({ content: data.candidates[0].content.parts[0].text });
    } else {
      // --- Groq (テキスト解析) ---
      // ここが重要：ファイルの中身がある場合、それを「システム設定」に近い形で強制的に読ませます
      const finalPrompt = fileText 
        ? `【最優先：以下のファイル内容を読み、それに基づいて回答してください】\nファイル名: ${fileName}\n---ファイル内容ここから---\n${fileText}\n---ファイル内容ここまで---\n\nユーザーの質問: ${prompt}`
        : prompt;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "あなたは提供されたファイルの内容を1行漏らさず正確に把握し、回答する専門家です。「名前から察するに」といった推測ではなく、内容に基づいて具体的に答えてください。" },
            { role: "user", content: finalPrompt }
          ]
        })
      });
      const data = await response.json();
      return res.status(200).json({ content: data.choices[0].message.content });
    }
  } catch (error) {
    res.status(500).json({ error: "解析エラーが発生しました。" });
  }
}
