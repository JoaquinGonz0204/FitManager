// api/redis.js — Proxy Redis para la app React
// Usa Upstash REST API (HTTP) en lugar de protocolo Redis nativo

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export default async function handler(req, res) {
  // Permite CORS para que la app React pueda llamarlo
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(200).json({ result: null });

  try {
    let args = req.body;
    if (typeof args === "string") args = JSON.parse(args);

    const response = await fetch(UPSTASH_URL, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${UPSTASH_TOKEN}`,
      },
      body: JSON.stringify(args),
    });

    const data = await response.json();
    return res.status(200).json({ result: data.result });

  } catch (err) {
    console.error("Redis proxy error:", err);
    return res.status(200).json({ result: null });
  }
}
