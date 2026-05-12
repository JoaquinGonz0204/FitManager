// api/redis.js — Proxy Redis para la app React
// La app no puede llamar a Redis directamente (CORS), así que lo hace a través de este endpoint

const REDIS_URL = process.env.REDIS_URL;

export default async function handler(req, res) {
  // Solo acepta POST
  if (req.method !== "POST") {
    return res.status(200).json({ result: null });
  }

  try {
    let args = req.body;
    if (typeof args === "string") args = JSON.parse(args);

    // Llama a Redis via Upstash REST API
    const response = await fetch(REDIS_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(args),
    });

    const data = await response.json();
    return res.status(200).json({ result: data.result });

  } catch (err) {
    console.error("Redis proxy error:", err);
    return res.status(200).json({ result: null });
  }
}
