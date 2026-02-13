export default async function handler(req, res) {
  // Pexels APIキーを環境変数から取得
  const apiKey = process.env.PEXELS_API_KEY;
  const { prompt } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: '検索ワードが必要です。' });
  }

  // Pexels APIのURL（画像検索エンドポイント）
  // per_page=15 で15枚候補を取得し、その中からランダムに選びます
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(prompt)}&per_page=15`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey
      }
    });

    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      // 検索結果からランダムに1枚選ぶ
      const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
      
      // 画像のURLを取得（largeサイズがバランスが良いです）
      const imageUrl = photo.src.large;

      // 画像データを取得してクライアントにバイナリとして返す
      const imgRes = await fetch(imageUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(Buffer.from(arrayBuffer));
    } else {
      res.status(404).json({ error: '画像が見つかりませんでした。' });
    }
  } catch (error) {
    console.error('Pexels API Error:', error);
    res.status(500).json({ error: '画像取得エラーが発生しました。' });
  }
}
