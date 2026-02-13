export default async function handler(req, res) {
  const { prompt, seed } = req.query;
  const url = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed || 1}&model=flux&nologo=true`;

  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    res.status(500).send("Image Generation Error");
  }
}
