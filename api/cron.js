// api/cron.js — Tarea programada diaria a las 7:00
// Vercel Cron Job — se ejecuta automáticamente cada día a las 7:00 AM (Europa)

const BOT_TOKEN     = "8756822686:AAGjXdOfzNq7ROroGXL9my0JnrTnu3-3Jks";
const CHAT_ID       = "1080470754";
const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const GEMINI_KEY    = process.env.GEMINI_API_KEY;

// ── REDIS ────────────────────────────────────────────────────────────────────
const redis = async (...args) => {
  const res = await fetch(UPSTASH_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${UPSTASH_TOKEN}` },
    body:    JSON.stringify(args),
  });
  const data = await res.json();
  return data.result;
};
const rGet = async (key) => { const v = await redis("GET", key); try { return v ? JSON.parse(v) : null; } catch { return v; } };

// ── DATOS ────────────────────────────────────────────────────────────────────
const DAYS    = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const jsToMon = (j) => (j === 0 ? 6 : j - 1);
const getToday = () => DAYS[jsToMon(new Date().getDay())];
const dk = () => { const d = new Date(); return `fm:${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };

const DIET = {
  Lunes:     { Comida: { foods:"Filete de ternera a la plancha con tomate natural",  calories:420, schedule:"14:00", ingredients:"Aceite de oliva: 10g, Filete de ternera: 250g, Tomate crudo: 250g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Fajitas de pavo con vegetales frescos", calories:380, schedule:"23:00", ingredients:"Pavo: 150g, Fajita integral: 60g, Lechuga: 30g, Tomate: 40g" } },
  Martes:    { Comida: { foods:"Hamburguesa de pavo con guisantes",                  calories:390, schedule:"14:00", ingredients:"Hamburguesa pavo: 260g, Guisantes: 125g, Aceite: 8g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Parrillada de atún con verduras", calories:310, schedule:"23:00", ingredients:"Atún: 150g, Calabacín: 75g, Espárrago: 75g, Pimiento: 75g" } },
  Miércoles: { Comida: { foods:"Solomillo de pollo con espinacas y piñones",         calories:480, schedule:"14:00", ingredients:"Pollo: 300g, Espinacas: 150g, Piñones: 15g, Aceite: 10g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Ensalada de guisantes con queso fresco y almendras", calories:295, schedule:"23:00", ingredients:"Guisantes: 100g, Queso Burgos 0%: 110g, Almendras: 20g" } },
  Jueves:    { Comida: { foods:"Salmón a la plancha con pisto",                      calories:520, schedule:"14:00", ingredients:"Salmón: 300g, Pimiento rojo: 100g, Pimiento verde: 100g, Cebolla: 100g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Pavo al curry con manzana", calories:340, schedule:"23:00", ingredients:"Pavo: 150g, Manzana: 180g, Yogur: 125g, Curry, Comino" } },
  Viernes:   { Comida: { foods:"Salteado de ternera con ensalada en vinagreta",      calories:380, schedule:"14:00", ingredients:"Ternera: 200g, Tomate: 150g, Cebolleta: 90g, Pepinillos: 20g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Kiwi y queso fresco batido", calories:190, schedule:"23:00", ingredients:"Queso fresco batido: 240g, Kiwi: 200g" } },
  Sábado:    { Comida: { foods:"Dorada con tomate, aguacate y nueces",               calories:540, schedule:"14:00", ingredients:"Dorada: 470g, Aguacate: 125g, Tomate: 250g, Nueces: 25g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Fajitas de maíz con pollo, lechuga y tomate", calories:290, schedule:"23:00", ingredients:"Harina maíz: 40g, Clara huevo: 70g, Pollo: 75g" } },
  Domingo:   { Comida: { foods:"Merluza con salteado de gulas y puerro",             calories:430, schedule:"14:00", ingredients:"Merluza: 350g, Gulas: 100g, Puerro: 75g, Ajo: 10g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Ensalada de tomate, cebolla, pimiento verde y atún", calories:280, schedule:"23:00", ingredients:"Tomate: 200g, Cebolla: 125g, Pimiento verde: 125g, Atún: 110g" } },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
const sendMsg = async (text) => {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: CHAT_ID, parse_mode: "Markdown", text }),
  });
};

const getActiveDiet = async (day) => {
  try {
    const dietDays = await rGet("fm:activeDiet");
    if (dietDays && typeof dietDays === "object" && dietDays[day]) return dietDays[day];
  } catch {}
  return DIET[day] || {};
};

const getMotivationalMsg = async (today) => {
  const tipo = Math.random() > 0.5 ? "biblico" : "motivacional";
  const prompt = tipo === "biblico"
    ? `Elige UN pasaje bíblico real y exacto en español sobre fortaleza, perseverancia o cuerpo como templo de Dios.
Formato exacto:
📖 «[versículo completo]»
— [Libro Capítulo:Versículo]
[Una frase corta conectando el pasaje con empezar bien el día]
Solo el mensaje, sin explicaciones.`
    : `Genera UNA frase motivadora corta para Joaquín para empezar el día con energía.
Objetivo: reducir grasa corporal siguiendo su plan dietético.
1 emoji al inicio. Máximo 2 frases. Solo la frase, sin comillas.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.9 },
        }),
      }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || getFallback(tipo);
  } catch {
    return getFallback(tipo);
  }
};

const getFallback = (tipo) => {
  const motivacional = [
    "💪 Hoy es otro día para acercarte a tu objetivo. ¡Vamos, Joaquín!",
    "🔥 La disciplina de hoy es la libertad de mañana. ¡A por ello!",
    "⚡ Cada comida bien hecha suma. ¡Hoy también cuenta!",
  ];
  const biblico = [
    "📖 «Todo lo puedo en Cristo que me fortalece.»\n— Filipenses 4:13\n¡Empieza el día con esa fuerza, Joaquín!",
    "📖 «El Señor es mi fortaleza y mi escudo.»\n— Salmos 28:7\nCon esa fortaleza, haz grande este día.",
    "📖 «¿No saben que su cuerpo es templo del Espíritu Santo?»\n— 1 Corintios 6:19\nCuídalo bien hoy.",
  ];
  const arr = tipo === "biblico" ? biblico : motivacional;
  return arr[Math.floor(Math.random() * arr.length)];
};

// ── HANDLER PRINCIPAL ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Comprueba si son las 7:00 en España — funciona en verano e invierno automáticamente
  // Para probar manualmente abre /api/cron?force=true
  const isManual = req.url?.includes('force=true');

  if (!isManual) {
    const now  = new Date();
    const hour = parseInt(
      now.toLocaleString('es-ES', { timeZone: 'Europe/Madrid', hour: 'numeric', hour12: false })
    );
    if (hour !== 7) {
      return res.status(200).json({ ok: true, message: `Son las ${hour}h en España. Solo se envía a las 7h.` });
    }
  }

  try {
    const today = getToday();
    const meals = await getActiveDiet(today);
    const total = Object.values(meals).reduce((s, m) => s + (m.calories || 0), 0);

    // ── MENSAJE 1: Dieta completa del día ───────────────────────────────────
    let dietMsg = `🌅 *¡Buenos días, Joaquín!*\n\n📋 *Tu dieta de hoy — ${today}*\n${"─".repeat(26)}\n\n`;
    Object.entries(meals).forEach(([name, m]) => {
      dietMsg += `🕐 *${m.schedule}* — *${name}*\n🍽️ ${m.foods}\n📝 _${m.ingredients}_\n⚡ ${m.calories} kcal\n\n`;
    });
    dietMsg += `${"─".repeat(26)}\n💯 *Total: ${total} kcal*`;
    await sendMsg(dietMsg);

    // Pequeña pausa entre mensajes
    await new Promise(r => setTimeout(r, 1000));

    // ── MENSAJE 2: Frase motivadora o pasaje bíblico ────────────────────────
    const motivMsg = await getMotivationalMsg(today);
    await sendMsg(motivMsg);

    await new Promise(r => setTimeout(r, 1000));

    // ── MENSAJE 3: Recordatorio de agua ────────────────────────────────────
    await sendMsg(`💧 *¡Empieza el día hidratado!*\n\nBébete un buen vaso de agua ahora 🥤\n\nObjetivo de hoy: *3.000 ml*\n\nUsa /agua+ 250 cada vez que bebas para llevar el control 📊`);

    return res.status(200).json({ ok: true, message: "Notificaciones enviadas" });

  } catch (err) {
    console.error("Cron error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
