// api/webhook.js — FitManager Bot
// Telegram bot con Upstash Redis (REST API) y Gemini AI

const BOT_TOKEN     = "8756822686:AAGjXdOfzNq7ROroGXL9my0JnrTnu3-3Jks";
const CHAT_ID       = "1080470754";
const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const GEMINI_KEY    = process.env.GEMINI_API_KEY;

// =============================================================================
// UPSTASH REDIS (REST API — funciona con fetch normal)
// =============================================================================
const redis = async (...args) => {
  const res = await fetch(UPSTASH_URL, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${UPSTASH_TOKEN}`,
    },
    body: JSON.stringify(args),
  });
  const data = await res.json();
  return data.result;
};

const rGet = async (key) => {
  const v = await redis("GET", key);
  try { return v ? JSON.parse(v) : null; } catch { return v; }
};
const rSet = (key, value) => redis("SET", key, JSON.stringify(value));
const rDel = (key)        => redis("DEL", key);

// Clave del día actual (ej: "fm:2026-4-13")
const dk = () => {
  const d = new Date();
  return `fm:${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

// =============================================================================
// GEMINI AI — Frases motivadoras y pasajes bíblicos
// =============================================================================
const getMotivationalMsg = async (today, dayKey) => {
  const waterMl  = (await rGet(`${dayKey}:water`))   || 0;
  const checked  = (await rGet(`${dayKey}:checked`)) || {};
  const meals    = await getActiveDiet(today);
  const doneCnt  = Object.keys(checked).length;
  const totalCnt = Object.keys(meals).length;
  const tipo     = Math.random() > 0.5 ? "biblico" : "motivacional";

  const prompt = tipo === "biblico"
    ? `Elige UN pasaje bíblico real y exacto en español relacionado con fortaleza, perseverancia, cuerpo como templo de Dios, o esperanza.
Contexto: Joaquín lleva ${waterMl}ml de agua hoy (objetivo 3000ml) y ha completado ${doneCnt} de ${totalCnt} comidas.
Formato exacto:
📖 «[versículo completo]»
— [Libro Capítulo:Versículo]
[Una frase corta conectando el pasaje con su salud hoy]
Solo el mensaje, sin explicaciones.`
    : `Genera UNA frase motivadora corta y personal para Joaquín.
Contexto: lleva ${waterMl}ml de agua (objetivo 3000ml) y completó ${doneCnt} de ${totalCnt} comidas. Objetivo: reducir grasa corporal.
Específica, enérgica, directa. 1 emoji al inicio. Máximo 2 frases.
Solo la frase, sin comillas ni explicaciones.`;

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
    "💪 La constancia supera al talento. Llevas días construyendo algo grande, Joaquín.",
    "🔥 Tu cuerpo es el resultado de lo que haces hoy. ¡Hazlo bien!",
    "🎯 No se trata de ser perfecto, se trata de no rendirse. ¡Sigue adelante!",
    "⚡ Cada comida del plan es un paso hacia tu mejor versión.",
    "🏆 Los que llegan lejos no son los más rápidos, sino los que no paran.",
  ];
  const biblico = [
    "📖 «Todo lo puedo en Cristo que me fortalece.»\n— Filipenses 4:13\nHoy tienes esa fuerza. Úsala.",
    "📖 «¿No saben que su cuerpo es templo del Espíritu Santo?»\n— 1 Corintios 6:19\nCuídalo con cada comida de hoy.",
    "📖 «No nos cansemos de hacer el bien, porque a su debido tiempo cosecharemos.»\n— Gálatas 6:9\nLos resultados llegan. No pares.",
    "📖 «El Señor es mi fortaleza y mi escudo; en él confió mi corazón.»\n— Salmos 28:7\nCon esa fortaleza, completa el plan de hoy.",
    "📖 «Esfuérzate y sé valiente. No temas ni te acobardes.»\n— Josué 1:9\nEse valor también se aplica a cuidar tu salud.",
  ];
  const arr = tipo === "biblico" ? biblico : motivacional;
  return arr[Math.floor(Math.random() * arr.length)];
};

// =============================================================================
// DATOS DE LA DIETA
// =============================================================================
const DAYS    = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const jsToMon = (j) => (j === 0 ? 6 : j - 1);
const getToday    = () => DAYS[jsToMon(new Date().getDay())];
const getTomorrow = () => DAYS[(jsToMon(new Date().getDay()) + 1) % 7];

// Dieta hardcodeada como fallback
const DIET_FALLBACK = {
  Lunes:     { Comida: { foods:"Filete de ternera a la plancha con tomate natural",  calories:420, schedule:"14:00", ingredients:"Aceite de oliva: 10g, Filete de ternera: 250g, Tomate crudo: 250g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Fajitas de pavo con vegetales frescos", calories:380, schedule:"23:00", ingredients:"Pavo: 150g, Fajita integral: 60g, Lechuga: 30g, Tomate: 40g" } },
  Martes:    { Comida: { foods:"Hamburguesa de pavo con guisantes",                  calories:390, schedule:"14:00", ingredients:"Hamburguesa pavo: 260g, Guisantes: 125g, Aceite: 8g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Parrillada de atún con verduras", calories:310, schedule:"23:00", ingredients:"Atún: 150g, Calabacín: 75g, Espárrago: 75g, Pimiento: 75g" } },
  Miércoles: { Comida: { foods:"Solomillo de pollo con espinacas y piñones",         calories:480, schedule:"14:00", ingredients:"Pollo: 300g, Espinacas: 150g, Piñones: 15g, Aceite: 10g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Ensalada de guisantes con queso fresco y almendras", calories:295, schedule:"23:00", ingredients:"Guisantes: 100g, Queso Burgos 0%: 110g, Almendras: 20g" } },
  Jueves:    { Comida: { foods:"Salmón a la plancha con pisto",                      calories:520, schedule:"14:00", ingredients:"Salmón: 300g, Pimiento rojo: 100g, Pimiento verde: 100g, Cebolla: 100g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Pavo al curry con manzana", calories:340, schedule:"23:00", ingredients:"Pavo: 150g, Manzana: 180g, Yogur: 125g, Curry, Comino" } },
  Viernes:   { Comida: { foods:"Salteado de ternera con ensalada en vinagreta",      calories:380, schedule:"14:00", ingredients:"Ternera: 200g, Tomate: 150g, Cebolleta: 90g, Pepinillos: 20g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Kiwi y queso fresco batido", calories:190, schedule:"23:00", ingredients:"Queso fresco batido: 240g, Kiwi: 200g" } },
  Sábado:    { Comida: { foods:"Dorada con tomate, aguacate y nueces",               calories:540, schedule:"14:00", ingredients:"Dorada: 470g, Aguacate: 125g, Tomate: 250g, Nueces: 25g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Fajitas de maíz con pollo, lechuga y tomate", calories:290, schedule:"23:00", ingredients:"Harina maíz: 40g, Clara huevo: 70g, Pollo: 75g" } },
  Domingo:   { Comida: { foods:"Merluza con salteado de gulas y puerro",             calories:430, schedule:"14:00", ingredients:"Merluza: 350g, Gulas: 100g, Puerro: 75g, Ajo: 10g" }, "Merienda 1": { foods:"Batido de proteína con leche desnatada", calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" }, Cena: { foods:"Ensalada de tomate, cebolla, pimiento verde y atún", calories:280, schedule:"23:00", ingredients:"Tomate: 200g, Cebolla: 125g, Pimiento verde: 125g, Atún: 110g" } },
};

// Lee la dieta activa de Redis (subida por la app) o usa el fallback
const getActiveDiet = async (day) => {
  try {
    const dietDays = await rGet("fm:activeDiet");
    if (dietDays && typeof dietDays === "object" && dietDays[day]) return dietDays[day];
  } catch {}
  return DIET_FALLBACK[day] || {};
};

// =============================================================================
// HELPERS
// =============================================================================
const sendMsg = async (text) => {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: CHAT_ID, parse_mode: "Markdown", text }),
  });
};

const getNextMeal = async (day) => {
  const now    = new Date();
  const hhmm   = now.getHours() * 60 + now.getMinutes();
  const meals  = await getActiveDiet(day);
  const sorted = Object.entries(meals).sort(([,a],[,b]) => a.schedule.localeCompare(b.schedule));
  for (const [name, meal] of sorted) {
    const [h, m] = meal.schedule.split(":").map(Number);
    if (h * 60 + m > hhmm) return { name, ...meal };
  }
  return null;
};

const formatDayDiet = async (day) => {
  const meals = await getActiveDiet(day);
  const total = Object.values(meals).reduce((s, m) => s + (m.calories || 0), 0);
  let msg = `📋 *Dieta del ${day}*\n${"─".repeat(26)}\n\n`;
  Object.entries(meals).forEach(([name, m]) => {
    msg += `🕐 *${m.schedule || ""}* — *${name}*\n🍽️ ${m.foods}\n📝 _${m.ingredients || ""}_\n⚡ ${m.calories || 0} kcal\n\n`;
  });
  msg += `${"─".repeat(26)}\n💯 *Total: ${total} kcal*`;
  return msg;
};

// =============================================================================
// PROCESADOR DE COMANDOS
// =============================================================================
const processCommand = async (text) => {
  const raw      = (text || "").trim();
  const lower    = raw.toLowerCase();
  const parts    = lower.split(/\s+/);
  const command  = parts[0];
  const args     = parts.slice(1);
  const today    = getToday();
  const tomorrow = getTomorrow();
  const dayKey   = dk();

  if (command === "/dieta")   return await formatDayDiet(today);
  if (command === "/manana" || command === "/mañana") return await formatDayDiet(tomorrow);

  if (command === "/semana") {
    let msg = `🗓 *Plan semanal completo*\n${"─".repeat(26)}\n\n`;
    for (const day of DAYS) {
      const meals = await getActiveDiet(day);
      const total = Object.values(meals).reduce((s, m) => s + (m.calories || 0), 0);
      msg += `*${day}* — ${total} kcal\n`;
      Object.entries(meals).forEach(([name, m]) => { msg += `  • ${m.schedule || ""} ${name}: ${m.foods}\n`; });
      msg += "\n";
    }
    return msg;
  }

  if (command === "/comida") {
    const next = await getNextMeal(today);
    if (!next) {
      const tom = await getActiveDiet(tomorrow);
      return `🌙 Ya terminaste todas las comidas de hoy. ¡Buen trabajo, Joaquín! 🎉\n\nMañana: *${Object.values(tom)[0]?.foods || "ver el plan"}*`;
    }
    return `🍽️ *Próxima comida: ${next.name}*\n\n🕐 A las *${next.schedule}*\n🥗 ${next.foods}\n📝 _${next.ingredients}_\n⚡ ${next.calories} kcal`;
  }

  if (command === "/calorias") {
    const meals = await getActiveDiet(today);
    const total = Object.values(meals).reduce((s, m) => s + (m.calories || 0), 0);
    let msg = `📊 *Calorías de hoy — ${today}*\n\n`;
    Object.entries(meals).forEach(([name, m]) => { msg += `• *${name}:* ${m.calories} kcal\n`; });
    msg += `\n💯 *Total del plan: ${total} kcal*`;
    return msg;
  }

  if (command === "/agua" && args.length === 0) {
    const waterMl = (await rGet(`${dayKey}:water`)) || 0;
    const pct     = Math.min(100, Math.round((waterMl / 3000) * 100));
    const bar     = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
    return `💧 *Agua de hoy*\n\n${bar} ${pct}%\n*${waterMl} ml* de 3.000 ml\n\nPara añadir:\n/agua+ 200\n/agua+ 250\n/agua+ 500\n/agua+ 750\n\nPara reiniciar: /agua0`;
  }

  if (command === "/agua+") {
    const ml = parseInt(args[0]);
    if (!ml || ml <= 0 || ml > 5000) return `❌ Cantidad no válida.\nEjemplo: /agua+ 500`;
    const current = (await rGet(`${dayKey}:water`)) || 0;
    const newVal  = current + ml;
    await rSet(`${dayKey}:water`, newVal);
    const pct = Math.min(100, Math.round((newVal / 3000) * 100));
    const bar = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
    return `💧 *+${ml}ml añadidos* ✓\n\n${bar} ${pct}%\n*${newVal} ml* de 3.000 ml\n\n${newVal >= 3000 ? "🎉 ¡Objetivo de 3L alcanzado!" : `Faltan *${3000 - newVal} ml* para el objetivo`}`;
  }

  if (command === "/agua0") {
    await rDel(`${dayKey}:water`);
    return `💧 Agua del día reiniciada a 0 ml ✓`;
  }

  if (command === "/extra") {
    if (args.length < 1) return `❌ Formato: /extra nombre kcal\n\nEjemplos:\n• /extra cafe 5\n• /extra platano 105`;
    const kcal    = parseInt(args[args.length - 1]);
    const hasKcal = !isNaN(kcal);
    const name    = hasKcal ? args.slice(0, -1).join(" ") : args.join(" ");
    if (!name) return `❌ Indica qué comiste.\nEjemplo: /extra cafe 80`;
    const extras     = (await rGet(`${dayKey}:extras`)) || [];
    extras.push({ foods: name, calories: hasKcal ? kcal : 0, ingredients: "" });
    await rSet(`${dayKey}:extras`, extras);
    const totalExtra = extras.reduce((s, e) => s + (e.calories || 0), 0);
    return `➕ *Extra añadido* ✓\n\n🍽️ *${name}*${hasKcal ? `\n⚡ ${kcal} kcal` : ""}\n\n📊 Total extras hoy: *${totalExtra} kcal*\n_(Se refleja en la app)_`;
  }

  if (command === "/completar") {
    const search  = args.join(" ").toLowerCase();
    const meals   = await getActiveDiet(today);
    const found   = Object.keys(meals).find(name =>
      name.toLowerCase().includes(search) || search.includes(name.toLowerCase().split(" ")[0])
    );
    if (!found) return `❌ Comida no encontrada.\n\nComidas de hoy: *${Object.keys(meals).join(", ")}*\n\nEjemplo: /completar comida`;
    const checked = (await rGet(`${dayKey}:checked`)) || {};
    checked[found] = true;
    await rSet(`${dayKey}:checked`, checked);
    const total = Object.keys(meals).length;
    const done  = Object.keys(checked).length;
    return `✅ *${found}* marcada como completada\n\n${done}/${total} comidas completadas hoy 💪`;
  }

  if (command === "/resumen") {
    const meals    = await getActiveDiet(today);
    const planCal  = Object.values(meals).reduce((s, m) => s + (m.calories || 0), 0);
    const next     = await getNextMeal(today);
    const waterMl  = (await rGet(`${dayKey}:water`)) || 0;
    const extras   = (await rGet(`${dayKey}:extras`)) || [];
    const extraCal = extras.reduce((s, e) => s + (e.calories || 0), 0);
    const checked  = (await rGet(`${dayKey}:checked`)) || {};
    const doneCnt  = Object.keys(checked).length;
    const totalCnt = Object.keys(meals).length;
    const waterPct = Math.min(100, Math.round((waterMl / 3000) * 100));
    const waterBar = "█".repeat(Math.floor(waterPct / 10)) + "░".repeat(10 - Math.floor(waterPct / 10));
    return `📊 *Resumen del día — ${today}*\n${"─".repeat(26)}\n\n🍽️ *Comidas:* ${doneCnt}/${totalCnt} completadas\n⚡ *Plan:* ${planCal} kcal${extraCal > 0 ? `\n➕ *Extras:* ${extraCal} kcal\n💯 *Total:* ${planCal + extraCal} kcal` : `\n💯 *Total:* ${planCal} kcal`}\n\n💧 *Agua:*\n${waterBar} ${waterPct}%\n${waterMl} ml de 3.000 ml\n\n${next ? `⏰ *Próxima:* ${next.name} a las ${next.schedule}` : "✅ ¡Todas las comidas completadas!"}${extras.length > 0 ? `\n\n📝 *Extras:*\n${extras.map(e => `  • ${e.foods}${e.calories ? ` (${e.calories} kcal)` : ""}`).join("\n")}` : ""}`;
  }

  if (command === "/motivacion" || command === "/motivación") {
    return await getMotivationalMsg(today, dayKey);
  }

  if (command === "/ingredientes") {
    const search = args.join(" ").toLowerCase();
    const meals  = await getActiveDiet(today);
    const found  = Object.entries(meals).find(([name]) =>
      name.toLowerCase().includes(search) || search.includes(name.toLowerCase().split(" ")[0])
    );
    if (!found) return `❌ Comida no encontrada.\n\nComidas de hoy: *${Object.keys(meals).join(", ")}*\n\nEjemplo: /ingredientes comida`;
    const [name, meal] = found;
    return `🧾 *Ingredientes — ${name}*\n\n${meal.ingredients.split(",").map(i => `• ${i.trim()}`).join("\n")}\n\n⚡ ${meal.calories} kcal`;
  }

  if (command === "/stats") {
    const weekTotal  = Object.values(DIET_FALLBACK).reduce((s, d) => s + Object.values(d).reduce((ss, m) => ss + m.calories, 0), 0);
    const avg        = Math.round(weekTotal / 7);
    const meals      = await getActiveDiet(today);
    const todayTotal = Object.values(meals).reduce((s, m) => s + (m.calories || 0), 0);
    return `📈 *Estadísticas del plan*\n\n📅 Hoy *(${today})*: *${todayTotal} kcal*\n📊 Media diaria: *${avg} kcal*\n💧 Objetivo agua: *3.000 ml/día*`;
  }

  if (command === "/recordatorio") {
    const next = await getNextMeal(today);
    if (!next) return `🌙 No quedan más comidas hoy. ¡Descansa bien, Joaquín! 😴`;
    const [h, m]   = next.schedule.split(":").map(Number);
    const nowDate  = new Date();
    const minsLeft = (h * 60 + m) - (nowDate.getHours() * 60 + nowDate.getMinutes());
    if (minsLeft <= 0) return `🍽️ *¡Ya es hora de ${next.name}!*\n\n${next.foods}\n⚡ ${next.calories} kcal`;
    return `⏰ *Próxima comida en ${minsLeft} minutos*\n\n🍽️ *${next.name}* a las *${next.schedule}*\n${next.foods}\n⚡ ${next.calories} kcal`;
  }

  if (command === "/consulta") {
    return `🩺 *Consulta con el nutricionista*\n\nRevisa y gestiona tus citas en la pestaña *Nutri* de la app 📱`;
  }

  if (command === "/peso") {
    const kg = parseFloat(args[0]);
    if (!kg || kg < 30 || kg > 300) return `❌ Peso no válido.\nEjemplo: /peso 78.5`;
    await rSet("fm:lastWeight", { kg, date: new Date().toISOString() });
    return `⚖️ *Peso registrado: ${kg} kg* ✓\n\nAbre la app → pestaña *Nutri* para asignarlo a una consulta 📊`;
  }

  if (command === "/ayuda" || command === "/help" || command === "/start") {
    return `🤖 *FitManager Bot*\n${"─".repeat(28)}\n\n*🍽️ Dieta*\n/dieta — Dieta completa de hoy\n/manana — Dieta de mañana\n/semana — Plan de los 7 días\n/comida — Próxima comida ahora\n/ingredientes comida — Ver ingredientes\n/completar comida — Marcar como completada ✅\n\n*📊 Seguimiento*\n/calorias — Calorías de hoy\n/resumen — Resumen completo del día\n/stats — Estadísticas del plan\n/recordatorio — Tiempo hasta la próxima comida\n\n*💧 Agua (sincronizado con la app)*\n/agua — Ver estado de hidratación\n/agua+ 500 — Añade 500ml\n/agua0 — Reiniciar agua del día\n\n*➕ Extras (sincronizado con la app)*\n/extra cafe 80 — Registra un extra\n\n*🩺 Nutricionista*\n/consulta — Info de tu cita\n/peso 78.5 — Registra tu peso\n\n*💪 Motivación*\n/motivacion — Frase o pasaje bíblico\n\n${"─".repeat(28)}\n_Tú Centro de Entrenamiento_`;
  }

  // Texto libre
  if (!raw.startsWith("/")) {
    if (lower.includes("hola") || lower.includes("buenas")) {
      const next = await getNextMeal(today);
      return `👋 *¡Hola, Joaquín!*\n\nHoy es *${today}*.\n${next ? `Tu próxima comida: *${next.name}* a las *${next.schedule}*` : "Ya completaste todas las comidas 🎉"}\n\nEscribe /ayuda para ver todos los comandos.`;
    }
    if (lower.includes("dieta") || lower.includes("comer")) return await formatDayDiet(today);
    if (lower.includes("agua"))    return await processCommand("/agua");
    if (lower.includes("caloria")) return await processCommand("/calorias");
    return `👋 Escribe /ayuda para ver todos los comandos disponibles.`;
  }

  return `❓ Comando no reconocido: *${command}*\n\nEscribe /ayuda para ver la lista completa.`;
};

// =============================================================================
// HANDLER PRINCIPAL
// =============================================================================
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  try {
    let update = req.body;
    if (typeof update === "string") update = JSON.parse(update);

    const message = update?.message || update?.edited_message;
    if (!message) return res.status(200).json({ ok: true });

    const chatId = String(message.chat?.id);
    const text   = message.text || "";

    if (chatId !== CHAT_ID) return res.status(200).json({ ok: true });

    const response = await processCommand(text);
    await sendMsg(response);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(200).json({ ok: true });
  }
}
