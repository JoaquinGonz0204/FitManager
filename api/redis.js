// api/redis.js — Proxy Redis para la app React
// Usa Upstash REST API (HTTP) en lugar de protocolo Redis nativo

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const upstash = async (args) => {
  const response = await fetch(UPSTASH_URL, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${UPSTASH_TOKEN}`,
    },
    body: JSON.stringify(args),
  });
  return response.json();
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Test GET — verifica que Upstash funciona
  if (req.method === "GET") {
    try {
      const data = await upstash(["SET", "fm:test", "ok"]);
      const data2 = await upstash(["GET", "fm:test"]);
      return res.status(200).json({ upstash_set: data, upstash_get: data2, url_set: !!UPSTASH_URL, token_set: !!UPSTASH_TOKEN });
    } catch (err) {
      return res.status(200).json({ error: err.message });
    }
  }

  if (req.method !== "POST") return res.status(200).json({ result: null });

  try {
    let args = req.body;
    if (typeof args === "string") args = JSON.parse(args);

    // Asegura que los valores string no estén doblemente serializados
    if (args[0] === "SET" && args[2] && typeof args[2] !== "string") {
      args[2] = JSON.stringify(args[2]);
    }

    const data = await upstash(args);
    return res.status(200).json({ result: data.result });

  } catch (err) {
    console.error("Redis proxy error:", err);
    return res.status(200).json({ result: null });
  }
}
