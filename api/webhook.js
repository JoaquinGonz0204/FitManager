// api/webhook.js — FitManager Bot para Telegram
// Vercel Serverless Function (CommonJS)

const BOT_TOKEN = "8756822686:AAGjXdOfzNq7ROroGXL9my0JnrTnu3-3Jks";
const CHAT_ID   = "1080470754";

const DAYS    = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const jsToMon = (j) => (j === 0 ? 6 : j - 1);

const DIET = {
  Lunes: {
    Comida:       { foods:"Filete de ternera a la plancha con tomate natural",  calories:420, schedule:"14:00", ingredients:"Aceite de oliva: 10g, Filete de ternera: 250g, Tomate crudo: 250g" },
    "Merienda 1": { foods:"Batido de proteína con leche desnatada",             calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods:"Fajitas de pavo con vegetales frescos",              calories:380, schedule:"23:00", ingredients:"Pavo: 150g, Fajita integral: 60g, Lechuga: 30g, Tomate: 40g" },
  },
  Martes: {
    Comida:       { foods:"Hamburguesa de pavo con guisantes",                  calories:390, schedule:"14:00", ingredients:"Hamburguesa pavo: 260g, Guisantes: 125g, Aceite: 8g" },
    "Merienda 1": { foods:"Batido de proteína con leche desnatada",             calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods:"Parrillada de atún con verduras",                    calories:310, schedule:"23:00", ingredients:"Atún: 150g, Calabacín: 75g, Espárrago: 75g, Pimiento: 75g" },
  },
  Miércoles: {
    Comida:       { foods:"Solomillo de pollo con espinacas y piñones",         calories:480, schedule:"14:00", ingredients:"Pollo: 300g, Espinacas: 150g, Piñones: 15g, Aceite: 10g" },
    "Merienda 1": { foods:"Batido de proteína con leche desnatada",             calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods:"Ensalada de guisantes con queso fresco y almendras", calories:295, schedule:"23:00", ingredients:"Guisantes: 100g, Queso Burgos 0%: 110g, Almendras: 20g" },
  },
  Jueves: {
    Comida:       { foods:"Salmón a la plancha con pisto",                      calories:520, schedule:"14:00", ingredients:"Salmón: 300g, Pimiento rojo: 100g, Pimiento verde: 100g, Cebolla: 100g" },
    "Merienda 1": { foods:"Batido de proteína con leche desnatada",             calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods:"Pavo al curry con manzana",                          calories:340, schedule:"23:00", ingredients:"Pavo: 150g, Manzana: 180g, Yogur: 125g, Curry, Comino" },
  },
  Viernes: {
    Comida:       { foods:"Salteado de ternera con ensalada en vinagreta",      calories:380, schedule:"14:00", ingredients:"Ternera: 200g, Tomate: 150g, Cebolleta: 90g, Pepinillos: 20g" },
    "Merienda 1": { foods:"Batido de proteína con leche desnatada",             calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods:"Kiwi y queso fresco batido",                         calories:190, schedule:"23:00", ingredients:"Queso fresco batido: 240g, Kiwi: 200g" },
  },
  Sábado: {
    Comida:       { foods:"Dorada con tomate, aguacate y nueces",               calories:540, schedule:"14:00", ingredients:"Dorada: 470g, Aguacate: 125g, Tomate: 250g, Nueces: 25g" },
    "Merienda 1": { foods:"Batido de proteína con leche desnatada",             calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods:"Fajitas de maíz con pollo, lechuga y tomate",        calories:290, schedule:"23:00", ingredients:"Harina maíz: 40g, Clara huevo: 70g, Pollo: 75g" },
  },
  Domingo: {
    Comida:       { foods:"Merluza con salteado de gulas y puerro",             calories:430, schedule:"14:00", ingredients:"Merluza: 350g, Gulas: 100g, Puerro: 75g, Ajo: 10g" },
    "Merienda 1": { foods:"Batido de proteína con leche desnatada",             calories:230, schedule:"19:00", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods:"Ensalada de tomate, cebolla, pimiento verde y atún", calories:280, schedule:"23:00", ingredients:"Tomate: 200g, Cebolla: 125g, Pimiento verde: 125g, Atún: 110g" },
  },
};

const MOTIVATIONAL = [
  "💪 Cada comida saludable es un paso hacia tu mejor versión. ¡Tú puedes!",
  "🌟 La consistencia es más poderosa que la perfección. ¡Sigue el plan!",
  "🔥 Los resultados no se ven de un día para otro, pero se construyen cada día.",
  "🎯 Hoy es otro día para acercarte a tu objetivo. ¡Aprovéchalo!",
  "⚡ Tu cuerpo te lo agradecerá. Un día bien alimentado = energía real.",
  "🏆 No se trata de ser perfecto, se trata de ser constante. ¡Eso lo haces tú!",
  "🌈 Cada elección saludable suma. Hoy también cuenta.",
  "🦁 Disciplina hoy, resultados mañana. ¡Vamos, Joaquín!",
];

// ── HELPERS ──────────────────────────────────────────────────────────────────

const sendMsg = async (text) => {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, parse_mode: "Markdown", text }),
  });
};

const getToday    = () => DAYS[jsToMon(new Date().getDay())];
const getTomorrow = () => DAYS[(jsToMon(new Date().getDay()) + 1) % 7];

const getNextMeal = (day) => {
  const now    = new Date();
  const hhmm   = now.getHours() * 60 + now.getMinutes();
  const meals  = DIET[day] || {};
  const sorted = Object.entries(meals).sort(([,a],[,b]) => a.schedule.localeCompare(b.schedule));
  for (const [name, meal] of sorted) {
    const [h, m] = meal.schedule.split(":").map(Number);
    if (h * 60 + m > hhmm) return { name, ...meal };
  }
  return null;
};

const formatDayDiet = (day) => {
  const meals = DIET[day] || {};
  const total = Object.values(meals).reduce((s, m) => s + m.calories, 0);
  let msg = `📋 *Dieta del ${day}*\n${"─".repeat(26)}\n\n`;
  Object.entries(meals).forEach(([name, m]) => {
    msg += `🕐 *${m.schedule}* — *${name}*\n🍽️ ${m.foods}\n📝 _${m.ingredients}_\n⚡ ${m.calories} kcal\n\n`;
  });
  msg += `${"─".repeat(26)}\n💯 *Total: ${total} kcal*`;
  return msg;
};

// ── PROCESADOR DE COMANDOS ────────────────────────────────────────────────────

const processCommand = async (text) => {
  const raw     = (text || "").trim();
  const lower   = raw.toLowerCase();
  const parts   = lower.split(/\s+/);
  const command = parts[0];
  const args    = parts.slice(1);
  const today   = getToday();
  const tomorrow = getTomorrow();

  if (command === "/dieta") return formatDayDiet(today);

  if (command === "/manana" || command === "/mañana") return formatDayDiet(tomorrow);

  if (command === "/semana") {
    let msg = `🗓 *Plan semanal completo*\n${"─".repeat(26)}\n\n`;
    DAYS.forEach(day => {
      const meals = DIET[day] || {};
      const total = Object.values(meals).reduce((s, m) => s + m.calories, 0);
      msg += `*${day}* — ${total} kcal\n`;
      Object.entries(meals).forEach(([name, m]) => { msg += `  • ${m.schedule} ${name}: ${m.foods}\n`; });
      msg += "\n";
    });
    return msg;
  }

  if (command === "/comida") {
    const next = getNextMeal(today);
    if (!next) return `🌙 Ya terminaste todas las comidas de hoy. ¡Buen trabajo, Joaquín! 🎉\n\nMañana: *${Object.values(DIET[tomorrow]||{})[0]?.foods || "ver el plan"}*`;
    return `🍽️ *Próxima comida: ${next.name}*\n\n🕐 A las *${next.schedule}*\n🥗 ${next.foods}\n📝 _${next.ingredients}_\n⚡ ${next.calories} kcal`;
  }

  if (command === "/calorias") {
    const meals = DIET[today] || {};
    const total = Object.values(meals).reduce((s, m) => s + m.calories, 0);
    let msg = `📊 *Calorías de hoy — ${today}*\n\n`;
    Object.entries(meals).forEach(([name, m]) => { msg += `• *${name}:* ${m.calories} kcal\n`; });
    msg += `\n💯 *Total del plan: ${total} kcal*`;
    return msg;
  }

  if (command === "/agua" && args.length === 0) {
    return `💧 *Registro de agua*\n\nPara añadir agua rápido usa:\n/agua+ 200\n/agua+ 250\n/agua+ 500\n/agua+ 750\n\nObjetivo diario: *3.000 ml* 💦`;
  }

  if (command === "/agua+") {
    const ml = parseInt(args[0]);
    if (!ml || ml <= 0 || ml > 5000) return `❌ Cantidad no válida.\nEjemplo: /agua+ 500`;
    return `💧 *+${ml}ml anotados* ✓\n\nAbre la app para registrarlo en el total del día 📱`;
  }

  if (command === "/extra") {
    if (args.length < 1) return `❌ Formato: /extra nombre kcal\n\nEjemplos:\n• /extra cafe 5\n• /extra platano 105`;
    const kcal    = parseInt(args[args.length - 1]);
    const hasKcal = !isNaN(kcal);
    const name    = hasKcal ? args.slice(0, -1).join(" ") : args.join(" ");
    if (!name) return `❌ Indica qué comiste.\nEjemplo: /extra cafe 80`;
    return `➕ *Extra anotado* ✓\n\n🍽️ *${name}*${hasKcal ? `\n⚡ ${kcal} kcal` : ""}\n\n_Abre la app para añadirlo al registro del día_`;
  }

  if (command === "/consulta") {
    return `🩺 *Consulta con el nutricionista*\n\nRevisa y gestiona tus citas en la pestaña *Nutri* de la app 📱\n\n_Ahí puedes añadir citas, registrar peso y ver la evolución_`;
  }

  if (command === "/peso") {
    const kg = parseFloat(args[0]);
    if (!kg || kg < 30 || kg > 300) return `❌ Peso no válido.\nEjemplo: /peso 78.5`;
    return `⚖️ *Peso anotado: ${kg} kg* ✓\n\nAbre la app → pestaña *Nutri* para asignarlo a una consulta 📊`;
  }

  if (command === "/resumen") {
    const meals = DIET[today] || {};
    const total = Object.values(meals).reduce((s, m) => s + m.calories, 0);
    const next  = getNextMeal(today);
    return `📊 *Resumen del día — ${today}*\n${"─".repeat(26)}\n\n🍽️ *Comidas del plan:*\n${Object.entries(meals).map(([n,m]) => `  • ${m.schedule} ${n} (${m.calories} kcal)`).join("\n")}\n\n💯 *Total: ${total} kcal*\n\n${next ? `⏰ *Próxima:* ${next.name} a las ${next.schedule}` : "✅ Todas las comidas completadas"}\n\n💧 Recuerda los *3 litros de agua* 💪`;
  }

  if (command === "/motivacion" || command === "/motivación") {
    return MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)];
  }

  if (command === "/ingredientes") {
    const search = args.join(" ").toLowerCase();
    const meals  = DIET[today] || {};
    const found  = Object.entries(meals).find(([name]) =>
      name.toLowerCase().includes(search) || search.includes(name.toLowerCase().split(" ")[0])
    );
    if (!found) return `❌ Comida no encontrada.\n\nComidas de hoy: *${Object.keys(meals).join(", ")}*\n\nEjemplo: /ingredientes comida`;
    const [name, meal] = found;
    return `🧾 *Ingredientes — ${name}*\n\n${meal.ingredients.split(",").map(i => `• ${i.trim()}`).join("\n")}\n\n⚡ ${meal.calories} kcal`;
  }

  if (command === "/stats") {
    const weekTotal  = Object.values(DIET).reduce((s, d) => s + Object.values(d).reduce((ss, m) => ss + m.calories, 0), 0);
    const avg        = Math.round(weekTotal / 7);
    const todayTotal = Object.values(DIET[today] || {}).reduce((s, m) => s + m.calories, 0);
    return `📈 *Estadísticas del plan*\n\n📅 Hoy *(${today})*: *${todayTotal} kcal*\n📊 Media diaria: *${avg} kcal*\n🗓 Total semanal: *${weekTotal} kcal*\n💧 Objetivo agua: *3.000 ml/día*`;
  }

  if (command === "/recordatorio") {
    const next = getNextMeal(today);
    if (!next) return `🌙 No quedan más comidas hoy. ¡Descansa bien, Joaquín! 😴`;
    const [h, m]   = next.schedule.split(":").map(Number);
    const nowDate  = new Date();
    const minsLeft = (h * 60 + m) - (nowDate.getHours() * 60 + nowDate.getMinutes());
    if (minsLeft <= 0) return `🍽️ *¡Ya es hora de ${next.name}!*\n\n${next.foods}\n⚡ ${next.calories} kcal`;
    return `⏰ *Próxima comida en ${minsLeft} minutos*\n\n🍽️ *${next.name}* a las *${next.schedule}*\n${next.foods}\n⚡ ${next.calories} kcal`;
  }

  if (command === "/ayuda" || command === "/help" || command === "/start") {
    return `🤖 *FitManager Bot*\n${"─".repeat(28)}\n\n*🍽️ Dieta*\n/dieta — Dieta completa de hoy\n/manana — Dieta de mañana\n/semana — Plan de los 7 días\n/comida — Próxima comida ahora\n/ingredientes comida — Ver ingredientes\n\n*📊 Seguimiento*\n/calorias — Calorías de hoy\n/resumen — Resumen completo\n/stats — Estadísticas del plan\n/recordatorio — Tiempo hasta la próxima comida\n\n*💧 Agua*\n/agua — Info hidratación\n/agua+ 500 — Añade 500ml\n\n*➕ Extras*\n/extra cafe 80 — Registra un extra\n\n*🩺 Nutricionista*\n/consulta — Info de tu cita\n/peso 78.5 — Registra tu peso\n\n*💪 Motivación*\n/motivacion — Frase del día\n\n${"─".repeat(28)}\n_Tú Centro de Entrenamiento_`;
  }

  // Texto libre — detecta palabras clave
  if (!raw.startsWith("/")) {
    if (lower.includes("hola") || lower.includes("buenas")) {
      const next = getNextMeal(today);
      return `👋 *¡Hola, Joaquín!*\n\nHoy es *${today}*.\n${next ? `Tu próxima comida: *${next.name}* a las *${next.schedule}*` : "Ya completaste todas las comidas 🎉"}\n\nEscribe /ayuda para ver todos los comandos.`;
    }
    if (lower.includes("dieta") || lower.includes("comer")) return formatDayDiet(today);
    if (lower.includes("agua"))     return `💧 Objetivo: *3.000 ml/día*\nUsa /agua+ 500 para añadir agua rápido`;
    if (lower.includes("caloria"))  return processCommand("/calorias");
    return `👋 Escribe /ayuda para ver todos los comandos disponibles.`;
  }

  return `❓ Comando no reconocido: *${command}*\n\nEscribe /ayuda para ver la lista completa.`;
};

// ── HANDLER PRINCIPAL ─────────────────────────────────────────────────────────
// Usa module.exports (CommonJS) — requerido por Vercel Serverless Functions

export default async function handler(req, res) {

  // Telegram siempre usa POST — rechaza cualquier otra cosa
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  try {
    const update  = req.body;
    const message = update?.message || update?.edited_message;
    if (!message) return res.status(200).json({ ok: true });

    const chatId = String(message.chat?.id);
    const text   = message.text || "";

    // Seguridad: solo responde al chat de Joaquín
    if (chatId !== CHAT_ID) return res.status(200).json({ ok: true });

    // Procesa y responde
    const response = await processCommand(text);
    await sendMsg(response);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(200).json({ ok: true }); // siempre 200 para Telegram
  }
}
