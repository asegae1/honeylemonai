export default async function handler(req, res) {
  const { prompt } = req.query;
  if (!prompt) return res.status(400).send('No prompt');

  // キャッシュを避けるためのランダム値
  const seed = Math.floor(Math.random() * 999999);
  
  // 2026年現在、最も安定している生成エンドポイント
  // モデルを 'flux' に固定し、スクレイピング対策を回避する構成
  const url = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('API Error');

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).send('Generation Failed');
  }
}
