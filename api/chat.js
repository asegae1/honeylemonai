export default async function handler(req, res) {
  const { prompt } = req.query;
  const apiKey = process.env.PEXELS_API_KEY;

  // Pexels API (日本語より英語の方がヒットしやすいため、簡易翻訳を入れるのが理想ですがそのままでも動きます)
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(prompt)}&per_page=15`;

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': apiKey }
    });
    const data = await response.json();

    if (data.photos && data.photos.length > 0) {
      // ランダムに1枚選ぶ
      const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
      const imageUrl = photo.src.large; // または original, large2x

      const imgRes = await fetch(imageUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(Buffer.from(arrayBuffer));
    } else {
      res.status(404).send('No images found');
    }
  } catch (e) {
    res.status(500).send('Pexels API Error');
  }
}
