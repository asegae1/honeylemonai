export default async function handler(req, res) {
  const { prompt, seed } = req.query;

  if (!prompt) {
    return res.status(400).send("検索ワードが必要です。");
  }

  // 独創的な画像を作るPollinations AIのURL
  // model=flux を指定することで、より高品質で独創的な絵になります
  const url = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed || 1}&model=flux&nologo=true`;

  try {
    // 1. AIサーバーから画像をダウンロード
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('AIサーバーからの応答がありません');

    // 2. 画像の生データ（バイナリ）を取得
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. ブラウザに対して「これは画像ですよ」と伝えて送り返す
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // キャッシュ防止
    res.send(buffer);

  } catch (error) {
    console.error("Image Proxy Error:", error);
    res.status(500).send("画像生成に失敗しました。");
  }
}
