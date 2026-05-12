// =============================================================================
// DIET NOTIFICATIONS — Panel de notificaciones via Telegram
// Tecnología: React (JSX) con hooks. Sin librerías externas.
//
// CÓMO FUNCIONA:
//   - El usuario activa/desactiva cada notificación con un toggle
//   - Un intervalo de 1 minuto comprueba si alguna notificación debe dispararse
//   - Cuando coincide la hora, llama a la API de Telegram para enviar el mensaje
//   - El estado de activación se persiste en localStorage del navegador
//
// ESTRUCTURA DEL ARCHIVO:
//   1. CONFIGURACIÓN DE TELEGRAM  → token del bot y chat ID
//   2. DATOS DE LA DIETA          → el plan para construir los mensajes
//   3. DEFINICIÓN DE NOTIFICACIONES → los 24 avisos con sus horas y descripciones
//   4. CONSTRUCTORES DE MENSAJES  → función que genera el texto de cada aviso
//   5. COMPONENTE PRINCIPAL       → lógica + UI del panel
//   6. ESTILOS                    → CSS-in-JS
// =============================================================================

import { useState, useEffect, useRef } from "react";


// =============================================================================
// 1. CONFIGURACIÓN DE TELEGRAM
// =============================================================================

// Token del bot (obtenido de @BotFather en Telegram)
// ⚠️ En producción esto debería estar en una variable de entorno, no aquí
const BOT_TOKEN = "8756822686:AAGjXdOfzNq7ROroGXL9my0JnrTnu3-3Jks";

// Chat ID de Joaquín (obtenido de @userinfobot en Telegram)
const CHAT_ID = "1080470754";

/**
 * Envía un mensaje a Telegram via la API del bot.
 * Usa parse_mode Markdown para poder usar *negrita* y _cursiva_ en los mensajes.
 * @param {Object} body - Propiedades del mensaje (text, etc.)
 * @returns {Promise<Object>} Respuesta de la API de Telegram
 */
const sendTelegram = (body) =>
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, parse_mode: "Markdown", ...body }),
  }).then((r) => r.json());


// =============================================================================
// 2. DATOS DE LA DIETA
// Mismos datos que en diet-manager.jsx — necesarios para construir los mensajes
// =============================================================================

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/** Convierte el día JS (0=domingo) al índice de nuestro array (0=lunes) */
const jsToMon = (jsDay) => (jsDay === 0 ? 6 : jsDay - 1);

// Plan dietético completo de Joaquín
const DIET = {
  Lunes: {
    Comida:       { foods: "Filete de ternera a la plancha con tomate natural",     calories: 420, schedule: "14:00", ingredients: "Aceite de oliva: 10g, Filete de ternera: 250g, Tomate crudo: 250g" },
    "Merienda 1": { foods: "Batido de proteína con leche desnatada",                calories: 230, schedule: "19:00", ingredients: "Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods: "Fajitas de pavo con vegetales frescos",                 calories: 380, schedule: "23:00", ingredients: "Pavo: 150g, Fajita integral: 60g, Lechuga: 30g, Tomate: 40g" },
  },
  Martes: {
    Comida:       { foods: "Hamburguesa de pavo con guisantes",                     calories: 390, schedule: "14:00", ingredients: "Hamburguesa pavo: 260g, Guisantes: 125g, Aceite: 8g" },
    "Merienda 1": { foods: "Batido de proteína con leche desnatada",                calories: 230, schedule: "19:00", ingredients: "Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods: "Parrillada de atún con verduras",                       calories: 310, schedule: "23:00", ingredients: "Atún: 150g, Calabacín: 75g, Espárrago: 75g, Pimiento: 75g" },
  },
  Miércoles: {
    Comida:       { foods: "Solomillo de pollo con espinacas y piñones",            calories: 480, schedule: "14:00", ingredients: "Pollo: 300g, Espinacas: 150g, Piñones: 15g, Aceite: 10g" },
    "Merienda 1": { foods: "Batido de proteína con leche desnatada",                calories: 230, schedule: "19:00", ingredients: "Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods: "Ensalada de guisantes con queso fresco y almendras",    calories: 295, schedule: "23:00", ingredients: "Guisantes: 100g, Queso Burgos 0%: 110g, Almendras: 20g" },
  },
  Jueves: {
    Comida:       { foods: "Salmón a la plancha con pisto",                         calories: 520, schedule: "14:00", ingredients: "Salmón: 300g, Pimiento rojo: 100g, Pimiento verde: 100g, Cebolla: 100g" },
    "Merienda 1": { foods: "Batido de proteína con leche desnatada",                calories: 230, schedule: "19:00", ingredients: "Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods: "Pavo al curry con manzana",                             calories: 340, schedule: "23:00", ingredients: "Pavo: 150g, Manzana: 180g, Yogur: 125g, Curry" },
  },
  Viernes: {
    Comida:       { foods: "Salteado de ternera con ensalada en vinagreta",         calories: 380, schedule: "14:00", ingredients: "Ternera: 200g, Tomate: 150g, Cebolleta: 90g, Pepinillos: 20g" },
    "Merienda 1": { foods: "Batido de proteína con leche desnatada",                calories: 230, schedule: "19:00", ingredients: "Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods: "Kiwi y queso fresco batido",                            calories: 190, schedule: "23:00", ingredients: "Queso fresco batido: 240g, Kiwi: 200g" },
  },
  Sábado: {
    Comida:       { foods: "Dorada con tomate, aguacate y nueces",                  calories: 540, schedule: "14:00", ingredients: "Dorada: 470g, Aguacate: 125g, Tomate: 250g, Nueces: 25g" },
    "Merienda 1": { foods: "Batido de proteína con leche desnatada",                calories: 230, schedule: "19:00", ingredients: "Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods: "Fajitas de maíz con pollo, lechuga y tomate",           calories: 290, schedule: "23:00", ingredients: "Harina maíz: 40g, Clara huevo: 70g, Pollo: 75g" },
  },
  Domingo: {
    Comida:       { foods: "Merluza con salteado de gulas y puerro",                calories: 430, schedule: "14:00", ingredients: "Merluza: 350g, Gulas: 100g, Puerro: 75g, Ajo: 10g" },
    "Merienda 1": { foods: "Batido de proteína con leche desnatada",                calories: 230, schedule: "19:00", ingredients: "Proteína suero 90%: 30g, Leche desnatada: 400g" },
    Cena:         { foods: "Ensalada de tomate, cebolla, pimiento verde y atún",    calories: 280, schedule: "23:00", ingredients: "Tomate: 200g, Cebolla: 125g, Pimiento verde: 125g, Atún: 110g" },
  },
};

// Frases motivacionales (se elige una aleatoria cada día)
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


// =============================================================================
// 3. DEFINICIÓN DE NOTIFICACIONES
// Están organizadas en grupos temáticos.
//
// Estructura de cada notificación:
// {
//   id:    string  → identificador único (usado en localStorage y en el scheduler)
//   label: string  → nombre que se muestra en la UI
//   time:  string  → hora de envío en formato "HH:MM", o "live" para tiempo real
//   desc:  string  → descripción para el usuario
//   emoji: string  → emoji decorativo
// }
//
// Filtros de día de la semana (aplicados en el scheduler):
//   weekly_sunday  → solo domingos (getDay() === 0)
//   midweek_cheer  → solo miércoles (getDay() === 3)
//   weekend_warn   → solo sábados (getDay() === 6)
//   shopping       → solo lunes (getDay() === 1)
// =============================================================================

const NOTIF_GROUPS = [
  {
    group: "🌅 Comidas del día",
    color: "#c8a97e",
    items: [
      { id: "daily_plan",    label: "Dieta del día completa",         time: "07:00", desc: "Todas las comidas e ingredientes del día, cada mañana a las 7:00",   emoji: "🌅" },
      { id: "breakfast",     label: "Recordatorio desayuno",           time: "08:45", desc: "Buenos días + aviso de hora del desayuno",                           emoji: "☀️" },
      { id: "mid_morning",   label: "Media mañana",                    time: "11:45", desc: "Recordatorio de media mañana",                                       emoji: "🍎" },
      { id: "lunch_pre",     label: "Aviso precomida",                 time: "13:45", desc: "\"En 15 min es la comida\" con los ingredientes del día",             emoji: "🍽️" },
      { id: "snack",         label: "Recordatorio merienda",           time: "19:00", desc: "Aviso de la merienda con lo que toca hoy",                           emoji: "☕" },
      { id: "dinner_pre",    label: "Aviso precena",                   time: "22:45", desc: "\"En 15 min es la cena\" con los ingredientes del día",               emoji: "🌙" },
      { id: "dinner_done",   label: "¿Has cenado ya?",                 time: "23:30", desc: "Recordatorio de marcar la cena como completada en la app",           emoji: "✅" },
    ],
  },
  {
    group: "💧 Hidratación",
    color: "#68b4d4",
    items: [
      { id: "water_morning", label: "Agua al despertar",               time: "08:00", desc: "Arranca el día bebiendo un vaso de agua — activa el metabolismo",    emoji: "💧" },
      { id: "water_midday",  label: "Control agua mediodía",           time: "13:00", desc: "¿Llevas 1 litro? Comprueba tu hidratación antes de comer",           emoji: "🚰" },
      { id: "water_evening", label: "Control agua tarde",              time: "18:00", desc: "Deberías llevar ~2L a esta hora para llegar al objetivo",            emoji: "💦" },
      { id: "water_night",   label: "Último aviso agua",               time: "23:55", desc: "¿Has llegado a los 3 litros hoy? Último aviso del día",              emoji: "🌊" },
    ],
  },
  {
    group: "🩺 Nutricionista",
    color: "#9090cc",
    items: [
      { id: "appt_day",      label: "Día de consulta",                 time: "08:00", desc: "Aviso la mañana del día que tienes consulta con el nutricionista",   emoji: "🩺" },
      { id: "appt_1day",     label: "Mañana tienes consulta",          time: "09:00", desc: "Recordatorio el día anterior para que prepares preguntas",           emoji: "📅" },
      { id: "appt_3days",    label: "Consulta en 3 días",              time: "09:00", desc: "Aviso 3 días antes para ir anotando cómo te has sentido",            emoji: "🗓️" },
      { id: "weight_remind", label: "Recuerda pesarte",                time: "07:30", desc: "El día de consulta: pésate en ayunas antes de salir de casa",        emoji: "⚖️" },
    ],
  },
  {
    group: "📊 Seguimiento",
    color: "#7ec8a0",
    items: [
      { id: "daily_summary", label: "Resumen diario",                  time: "22:00", desc: "Calorías del plan, agua y comidas completadas del día",              emoji: "📊" },
      { id: "weekly_sunday", label: "Resumen semanal (domingos)",      time: "20:00", desc: "Cada domingo: resumen de calorías y adherencia de la semana",        emoji: "📈" },
      { id: "streak",        label: "Racha de cumplimiento",           time: "21:00", desc: "Aviso de días seguidos cumpliendo el plan",                         emoji: "🔥" },
      { id: "calories_over", label: "Alerta calorías superadas",       time: "live",  desc: "Aviso inmediato si superas el plan en más de 200 kcal (tiempo real)", emoji: "⚠️" },
    ],
  },
  {
    group: "💪 Motivación",
    color: "#e0a070",
    items: [
      { id: "motivation",    label: "Mensaje motivacional diario",     time: "07:30", desc: "Frase motivadora aleatoria cada mañana para arrancar con energía",   emoji: "💪" },
      { id: "midweek_cheer", label: "Ánimo mitad de semana (mié)",     time: "12:00", desc: "Cada miércoles: empujón para acabar la semana con fuerza",           emoji: "🌟" },
      { id: "weekend_warn",  label: "Precaución fin de semana (sáb)",  time: "10:00", desc: "Sábados: recuerda mantener el plan aunque sea fin de semana",        emoji: "🛡️" },
      { id: "plan_end",      label: "Fin de plan próximo",             time: "09:00", desc: "3 días antes de que acabe tu dieta actual: aviso para contactar",    emoji: "🏁" },
    ],
  },
  {
    group: "🌙 Bienestar",
    color: "#a078d4",
    items: [
      { id: "sleep_prep",    label: "Prepara el día siguiente",        time: "22:30", desc: "Revisa las comidas de mañana en la app antes de dormir",             emoji: "🌙" },
      { id: "shopping",      label: "Lista de la compra (lunes)",      time: "10:00", desc: "Cada lunes: ingredientes que necesitas para la semana",              emoji: "🛒" },
      { id: "supplements",   label: "Recordatorio batido proteínas",   time: "19:00", desc: "Hora del batido de proteínas (coincide con la merienda del plan)",   emoji: "🧪" },
      { id: "exercise_day",  label: "Hoy es día de entreno",           time: "17:00", desc: "Aviso los días de entrenamiento para planificar bien la comida",     emoji: "🏋️" },
    ],
  },
];

// Array plano con todas las notificaciones (para iterar en el scheduler)
const ALL_NOTIFS = NOTIF_GROUPS.flatMap((g) => g.items);


// =============================================================================
// 4. CONSTRUCTORES DE MENSAJES
// Una función por cada tipo de notificación.
// Recibe el id y el día actual, devuelve el texto del mensaje en formato Markdown.
// =============================================================================

/**
 * Genera el texto del mensaje para una notificación concreta.
 * @param {string} id  - ID de la notificación
 * @param {string} day - Día de la semana actual (ej: "Lunes")
 * @returns {string} Texto del mensaje en Markdown de Telegram
 */
const buildMessage = (id, day) => {
  const d     = DIET[day] || {};
  // Calorías totales del plan del día
  const total = Object.values(d).reduce((s, m) => s + (m.calories || 0), 0);

  switch (id) {

    // ── Comidas ──────────────────────────────────────────────────────────────

    case "daily_plan": {
      // Construye el resumen completo de todas las comidas del día
      let msg = `🌅 *¡Buenos días, Joaquín!*\n\n📋 *Tu dieta de hoy — ${day}*\n${"─".repeat(28)}\n\n`;
      Object.entries(d).forEach(([name, m]) => {
        msg += `🕐 *${m.schedule}* — *${name}*\n`;
        msg += `🍽️ ${m.foods}\n`;
        msg += `📝 _${m.ingredients}_\n`;
        msg += `⚡ ${m.calories} kcal\n\n`;
      });
      msg += `${"─".repeat(28)}\n💯 *Total del día: ${total} kcal*\n\n💧 Recuerda: *3 litros de agua hoy* 💪`;
      return msg;
    }

    case "breakfast":
      return `☀️ *¡Buenos días!* Es hora del desayuno 🍳\n\nRevisa tu plan en la app y empieza el día con energía. ¡${day} arrancando! 💪`;

    case "mid_morning":
      return `🍎 *Media mañana*\n\nSi tienes algo de hambre, es buen momento para un snack ligero. Recuerda mantenerte en el plan 👍`;

    case "lunch_pre":
      return `🍽️ *¡En 15 minutos es la comida!*\n\n📌 Hoy toca: *${d.Comida?.foods || "Comida del plan"}*\n📝 _${d.Comida?.ingredients || ""}_\n⚡ ${d.Comida?.calories || 0} kcal\n\n¡Ve preparando los ingredientes!`;

    case "snack":
      return `☕ *¡Hora de la merienda!* (19:00)\n\n📌 Hoy toca: *${d["Merienda 1"]?.foods || "Batido de proteína"}*\n📝 _${d["Merienda 1"]?.ingredients || ""}_\n⚡ ${d["Merienda 1"]?.calories || 0} kcal`;

    case "dinner_pre":
      return `🌙 *¡En 15 minutos es la cena!*\n\n📌 Hoy toca: *${d.Cena?.foods || "Cena del plan"}*\n📝 _${d.Cena?.ingredients || ""}_\n⚡ ${d.Cena?.calories || 0} kcal\n\n¡Última comida del día, a por ello!`;

    case "dinner_done":
      return `✅ *¿Ya has cenado?*\n\nNo olvides marcar la cena como completada en la app 📱\n\n¡Buen trabajo hoy, Joaquín! Descansa bien 😴`;

    // ── Hidratación ───────────────────────────────────────────────────────────

    case "water_morning":
      return `💧 *¡Empieza el día hidratado!*\n\nAntes de nada, bébete un buen vaso de agua 🥤\nObjetivo del día: *3.000 ml*\n\n¡A por ello!`;

    case "water_midday":
      return `🚰 *Control de agua — Mediodía*\n\n¿Llevas al menos *1 litro* bebido?\n\nSi no, ahora es buen momento. Quedan muchas horas para llegar a los 3L 💧`;

    case "water_evening":
      return `💦 *Control de agua — Tarde*\n\n¿Cómo vas con la hidratación?\n\nDeberías llevar unos *2 litros* a estas horas.\nQueda la noche para completar los *3 litros* 🌊`;

    case "water_night":
      return `🌊 *Último aviso del día — Agua*\n\n¿Has llegado a los *3 litros* hoy?\n\nSi te falta, bebe un poco más antes de dormir.\nLa hidratación es clave para tus resultados 💧`;

    // ── Nutricionista ─────────────────────────────────────────────────────────

    case "appt_day":
      return `🩺 *¡Hoy tienes consulta con el nutricionista!*\n\n📌 Recuerda llevar:\n• Tus dudas o preguntas anotadas\n• Si has modificado alguna comida\n• Tu peso de hoy ⚖️\n\n¡A por esa consulta!`;

    case "appt_1day":
      return `📅 *¡Mañana tienes consulta!*\n\nPrepara tus preguntas esta noche y recuerda *pesarte mañana por la mañana* en ayunas antes de salir ⚖️`;

    case "appt_3days":
      return `🗓️ *Tienes consulta en 3 días*\n\nVe anotando cómo te has sentido con el plan:\n• ¿Alguna comida que no te ha gustado?\n• ¿Cómo llevas la energía?\n• ¿Dudas sobre algún ingrediente?\n\n¡Todo eso cuéntaselo a tu nutricionista!`;

    case "weight_remind":
      return `⚖️ *¡Recuerda pesarte!*\n\nHoy tienes consulta.\nPésate *en ayunas* antes de salir para llevar el dato exacto 📊`;

    // ── Seguimiento ───────────────────────────────────────────────────────────

    case "daily_summary":
      return `📊 *Resumen del día — ${day}*\n\n🍽️ Plan de hoy: *${total} kcal*\n\n¿Has completado todas las comidas?\n✅ Márcalas en la app si no lo has hecho\n💧 ¿Has llegado a los 3 litros de agua?\n\n¡Mañana seguimos! 💪`;

    case "weekly_sunday": {
      const weekTotal = Object.values(DIET).reduce((s, dd) =>
        s + Object.values(dd).reduce((ss, m) => ss + (m.calories || 0), 0), 0);
      return `📈 *Resumen semanal*\n\n¡Otra semana completada, Joaquín! 🏆\n\n⚡ Media diaria del plan: *${Math.round(weekTotal / 7)} kcal*\n🥗 7 días de alimentación estructurada\n💧 Objetivo: 3L de agua cada día\n\nCada semana que cumples el plan te acerca a tu objetivo. ¡Sigue así! 🌟`;
    }

    case "streak":
      return `🔥 *¡Racha de cumplimiento!*\n\n¡Llevas varios días seguidos cumpliendo el plan!\n\nEso es consistencia de verdad, Joaquín. Los resultados se construyen exactamente así 💪\n\n¡No pares ahora! 🏆`;

    case "calories_over":
      return `⚠️ *Alerta: calorías superadas*\n\nParece que hoy has superado las calorías del plan.\n\nNo hay que agobiarse 😊 Un día no cambia nada.\nMañana volvemos al plan con energía renovada 💪`;

    // ── Motivación ────────────────────────────────────────────────────────────

    case "motivation":
      // Elige una frase aleatoria del array de motivacionales
      return MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)];

    case "midweek_cheer":
      return `🌟 *¡Mitad de semana superada!*\n\nYa llevas 4 días con el plan, Joaquín.\nEl miércoles siempre es el más duro y ya lo tienes en el bolsillo 💼\n\n¡Quedan 3 días para completar la semana perfecta! 🏆`;

    case "weekend_warn":
      return `🛡️ *¡Fin de semana en marcha!*\n\nRecuerda que el plan también se mantiene el sábado y domingo 📅\n\nUn finde bien llevado marca la diferencia en los resultados. ¡Tú puedes! 💪`;

    case "plan_end":
      return `🏁 *Tu plan actual termina en 3 días*\n\nEs momento de contactar con tu nutricionista para preparar el siguiente plan 🩺\n\n¡Vas a llegar con unos resultados estupendos! 🌟`;

    // ── Bienestar ─────────────────────────────────────────────────────────────

    case "sleep_prep":
      return `🌙 *Prepara el día de mañana*\n\nAntes de dormir, echa un vistazo a las comidas de mañana en tu app 📱\nAsí no hay sorpresas por la mañana.\n\n¡Buenas noches, Joaquín! 😴`;

    case "shopping":
      return `🛒 *¡Nueva semana, nueva compra!*\n\nRevisa los ingredientes de tu plan en la app para tener todo listo 📋\n\n🥦 Verduras · 🥩 Proteínas · 🐟 Pescado · 🥛 Lácteos\n\n¡Empieza la semana con la nevera bien surtida!`;

    case "supplements":
      return `🧪 *Recordatorio: Batido de proteínas*\n\n¡Es la hora del batido! (19:00) 🥤\n\n📝 _Proteína suero 90%: 30g + Leche desnatada calcio: 400ml_\n⚡ 230 kcal\n\n¡A mezclarlo!`;

    case "exercise_day":
      return `🏋️ *¡Hoy es día de entreno!*\n\nRecuerda hacer el ejercicio en estado de *ayuno postabsortivo*\n_(2-3 horas después de comer, no justo después de una ingesta)_\n\n¡A por ello, Joaquín! 💪🔥`;

    // Fallback para cualquier ID desconocido
    default:
      return `📢 Recordatorio de tu plan dietético`;
  }
};


// =============================================================================
// 5. COMPONENTE PRINCIPAL
// =============================================================================

export default function NotificationsPanel() {

  // ---------------------------------------------------------------------------
  // ESTADO
  // ---------------------------------------------------------------------------

  // Qué notificaciones están activadas. Se persiste en localStorage.
  // Estructura: { [notifId]: true/false }
  const [enabled, setEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nf_enabled") || "{}"); }
    catch { return {}; }
  });

  // Qué notificaciones están enviándose en este momento (para el spinner)
  const [sending, setSending] = useState({});

  // Cuándo se envió cada notificación por última vez (para mostrar "Enviado 14:30")
  const [lastSent, setLastSent] = useState({});

  // Mensaje de feedback temporal
  const [toast, setToast] = useState(null);

  // Estado de la conexión con Telegram
  const [connected,  setConnected]  = useState(false);
  const [connecting, setConnecting] = useState(true);

  // Referencia al intervalo del scheduler (para poder limpiarlo al desmontar)
  const tickRef = useRef(null);


  // ---------------------------------------------------------------------------
  // EFECTOS
  // ---------------------------------------------------------------------------

  // Persiste el estado de notificaciones en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem("nf_enabled", JSON.stringify(enabled));
  }, [enabled]);

  // Al montar el componente: envía un mensaje de bienvenida para verificar conexión
  useEffect(() => {
    sendTelegram({
      text: `✅ *¡Conexión verificada, Joaquín!*\n\n🎉 Tu bot de nutrición está activo.\n\nEste chat recibirá todos los recordatorios que actives:\n\n🌅 Dieta del día a las 7:00\n💧 Recordatorios de agua\n🩺 Avisos de consulta\n📊 Resúmenes diarios y semanales\n💪 Mensajes motivacionales\n🌙 Y mucho más...\n\n¡Activa las que quieras y empieza! 💪`,
    })
      .then((r) => { setConnected(r.ok); setConnecting(false); })
      .catch(() => { setConnected(false); setConnecting(false); });
  }, []);

  /**
   * SCHEDULER: comprueba cada minuto si hay alguna notificación que enviar.
   *
   * Lógica:
   * 1. Obtiene la hora actual en formato "HH:MM"
   * 2. Recorre todas las notificaciones activadas
   * 3. Si la hora coincide Y no se ha enviado ya hoy → envía el mensaje
   *
   * Para evitar envíos duplicados usa sessionStorage con clave única por día.
   * Se recrea el intervalo cuando cambia `enabled` (para recoger los cambios).
   */
  useEffect(() => {
    const check = () => {
      const now  = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const day  = DAYS[jsToMon(now.getDay())];
      const dow  = now.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado

      ALL_NOTIFS.forEach((notif) => {
        // Saltar si no está activada, si es "live" (tiempo real) o si la hora no coincide
        if (!enabled[notif.id]) return;
        if (notif.time === "live") return;
        if (notif.time !== hhmm)  return;

        // Clave única para evitar envíos duplicados el mismo día
        const sessionKey = `sent_${notif.id}_${now.toDateString()}`;
        if (sessionStorage.getItem(sessionKey)) return;
        sessionStorage.setItem(sessionKey, "1");

        // Filtros de día de la semana
        if (notif.id === "weekly_sunday"  && dow !== 0) return; // solo domingos
        if (notif.id === "midweek_cheer"  && dow !== 3) return; // solo miércoles
        if (notif.id === "weekend_warn"   && dow !== 6) return; // solo sábados
        if (notif.id === "shopping"       && dow !== 1) return; // solo lunes

        // ¡Enviar!
        sendNotification(notif);
      });
    };

    check(); // comprueba inmediatamente al montar
    tickRef.current = setInterval(check, 60000); // y luego cada minuto

    // Limpieza: cancela el intervalo al desmontar o al recrear el efecto
    return () => clearInterval(tickRef.current);
  }, [enabled]);


  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  /** Muestra un toast temporal */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * Envía una notificación a Telegram inmediatamente.
   * Se usa tanto desde el scheduler como desde el botón "Probar".
   */
  const sendNotification = async (notif) => {
    const day = DAYS[jsToMon(new Date().getDay())];
    setSending((p) => ({ ...p, [notif.id]: true }));
    try {
      await sendTelegram({ text: buildMessage(notif.id, day) });
      // Guarda la hora de último envío para mostrarla en la UI
      setLastSent((p) => ({
        ...p,
        [notif.id]: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      }));
      showToast(`${notif.emoji} Enviado a Telegram ✓`);
    } catch {
      showToast("❌ Error al enviar");
    } finally {
      setSending((p) => ({ ...p, [notif.id]: false }));
    }
  };

  /** Activa o desactiva una notificación concreta */
  const toggle = (id) => setEnabled((p) => ({ ...p, [id]: !p[id] }));

  /** Activa todas las notificaciones de golpe */
  const enableAll = () => {
    const all = {};
    ALL_NOTIFS.forEach(n => { all[n.id] = true; });
    setEnabled(all);
    showToast("✅ Todas las notificaciones activadas");
  };

  /** Desactiva todas las notificaciones de golpe */
  const disableAll = () => {
    setEnabled({});
    showToast("⬜ Todas las notificaciones desactivadas");
  };

  // Número total de notificaciones activas (para el contador del header)
  const enabledCount = ALL_NOTIFS.filter((n) => enabled[n.id]).length;


  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div style={S.phone}>

      {/* CSS global y animaciones */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;900&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        .bp:active { transform: scale(0.95); opacity: 0.8; }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px);  } to { opacity:1; transform:translateY(0);  } }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes pulse   { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        .fi    { animation: fadeIn 0.32s ease both; }
        .pulse { animation: pulse  2s ease infinite; }
        .spin  { animation: spin   1s linear infinite; display: inline-block; }
      `}</style>

      <div style={S.statusBar}><span>9:41</span><span>●●● 🔋</span></div>
      {toast && <div style={S.toast}>{toast}</div>}

      <div style={S.content}>

        {/* Cabecera */}
        <div style={{ padding: "18px 22px 0" }}>
          <p style={{ fontFamily: "'DM Sans'", color: "#555", fontSize: 13 }}>Joaquín González Novo</p>
          <h1 style={{ fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 26, fontWeight: 600, marginTop: 2 }}>
            Notificaciones
          </h1>
          <p style={{ fontFamily: "'DM Sans'", color: "#555", fontSize: 12, marginTop: 3 }}>
            Recordatorios via Telegram · {enabledCount} activas
          </p>
        </div>

        {/* Estado de la conexión con Telegram */}
        <div style={{
          margin: "14px 20px 0",
          borderRadius: 14,
          padding: "12px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: connecting ? "rgba(255,255,255,0.04)" : connected ? "rgba(126,200,160,0.08)" : "rgba(224,112,96,0.08)",
          border: `1px solid ${connecting ? "rgba(255,255,255,0.06)" : connected ? "rgba(126,200,160,0.25)" : "rgba(224,112,96,0.25)"}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Indicador de estado: spinner si conectando, punto pulsante si OK, punto rojo si error */}
            {connecting
              ? <span className="spin" style={{ width: 8, height: 8, borderRadius: "50%", border: "2px solid #888", borderTopColor: "transparent" }} />
              : <div className={connected ? "pulse" : ""} style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#7ec8a0" : "#e07060" }} />
            }
            <div>
              <p style={{ fontFamily: "'DM Sans'", color: connecting ? "#888" : connected ? "#7ec8a0" : "#e07060", fontSize: 13, fontWeight: 500 }}>
                {connecting ? "Conectando con Telegram…" : connected ? "✈️ Conectado con Telegram" : "❌ Error de conexión"}
              </p>
              {connected && (
                <p style={{ fontFamily: "'DM Sans'", color: "#555", fontSize: 11, marginTop: 1 }}>
                  Chat ID: {CHAT_ID} · Bot activo
                </p>
              )}
            </div>
          </div>

          {/* Botón de envío rápido de la dieta de hoy */}
          {connected && (
            <button className="bp"
              onClick={() => sendNotification({ id: "daily_plan", emoji: "🌅", label: "Dieta de hoy" })}
              style={{ background: "rgba(200,169,126,0.12)", border: "1px solid rgba(200,169,126,0.25)", color: "#c8a97e", borderRadius: 50, padding: "5px 12px", fontSize: 11, fontFamily: "'DM Sans'", cursor: "pointer" }}>
              Enviar dieta ahora
            </button>
          )}
        </div>

        {/* Botones de activar/desactivar todas */}
        {connected && (
          <div style={{ display: "flex", gap: 8, padding: "12px 20px 0" }}>
            <button className="bp" onClick={enableAll}
              style={{ ...S.qBtn, background: "rgba(200,169,126,0.1)", color: "#c8a97e", border: "1px solid rgba(200,169,126,0.2)", flex: 1 }}>
              ✅ Activar todas
            </button>
            <button className="bp" onClick={disableAll}
              style={{ ...S.qBtn, background: "rgba(255,255,255,0.05)", color: "#666", border: "1px solid rgba(255,255,255,0.07)", flex: 1 }}>
              ⬜ Desactivar todas
            </button>
          </div>
        )}

        {/* Grupos de notificaciones */}
        {connected && NOTIF_GROUPS.map((group, gi) => (
          <div key={group.group} className="fi" style={{ margin: "18px 20px 0", animationDelay: `${gi * 0.04}s` }}>

            {/* Cabecera del grupo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              {/* Barra de color del grupo */}
              <div style={{ width: 3, height: 18, borderRadius: 2, background: group.color, flexShrink: 0 }} />
              <p style={{ fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 15, fontWeight: 600 }}>{group.group}</p>
              {/* Contador de activas en este grupo */}
              <span style={{ fontFamily: "'DM Sans'", color: "#444", fontSize: 11, marginLeft: "auto" }}>
                {group.items.filter(n => enabled[n.id]).length}/{group.items.length}
              </span>
            </div>

            {/* Items del grupo */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.items.map((notif) => {
                const isOn     = !!enabled[notif.id];
                const isSending = !!sending[notif.id];
                const sent     = lastSent[notif.id];

                return (
                  <div key={notif.id} style={{
                    borderRadius: 14, padding: "13px 14px",
                    border: `1px solid ${isOn ? group.color + "35" : "rgba(255,255,255,0.05)"}`,
                    background: isOn ? group.color + "0a" : "#16162a",
                    transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      {/* Emoji */}
                      <span style={{ fontSize: 19, marginTop: 1, flexShrink: 0 }}>{notif.emoji}</span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Título + toggle switch */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <p style={{ fontFamily: "Fraunces", color: isOn ? "#f0e6d3" : "#555", fontSize: 13, fontWeight: 600, flex: 1 }}>
                            {notif.label}
                          </p>
                          {/* Toggle (switch on/off) */}
                          <div className="bp" onClick={() => toggle(notif.id)} style={{
                            width: 44, height: 25, borderRadius: 50,
                            background: isOn ? group.color : "rgba(255,255,255,0.08)",
                            position: "relative", cursor: "pointer",
                            transition: "background 0.25s", flexShrink: 0,
                          }}>
                            {/* Bolita del toggle */}
                            <div style={{
                              position: "absolute", top: 3.5,
                              left: isOn ? 22 : 3.5,              // se mueve al activar
                              width: 18, height: 18, borderRadius: "50%",
                              background: isOn ? "#1a1a2e" : "#555",
                              transition: "left 0.25s",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                            }} />
                          </div>
                        </div>

                        {/* Descripción */}
                        <p style={{ fontFamily: "'DM Sans'", color: "#555", fontSize: 11, marginTop: 4, lineHeight: 1.45 }}>
                          {notif.desc}
                        </p>

                        {/* Footer: hora + último envío + botón probar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                          {/* Badge de hora (o "Tiempo real" si es live) */}
                          {notif.time === "live"
                            ? <span style={{ fontFamily: "'DM Sans'", fontSize: 10, color: "#e07060", background: "rgba(224,112,96,0.1)", padding: "2px 8px", borderRadius: 50 }}>⚡ Tiempo real</span>
                            : <span style={{ fontFamily: "'DM Sans'", fontSize: 10, color: isOn ? group.color : "#444", background: isOn ? group.color + "18" : "rgba(255,255,255,0.04)", padding: "2px 9px", borderRadius: 50, border: `1px solid ${isOn ? group.color + "30" : "transparent"}` }}>🕐 {notif.time}</span>
                          }
                          {/* Hora del último envío */}
                          {sent && (
                            <span style={{ fontFamily: "'DM Sans'", fontSize: 10, color: "#7ec8a0" }}>✓ Enviado {sent}</span>
                          )}
                          {/* Botón "Probar" — envía el mensaje inmediatamente */}
                          {isOn && notif.time !== "live" && (
                            <button className="bp" onClick={() => sendNotification(notif)} disabled={isSending}
                              style={{ marginLeft: "auto", background: "none", border: `1px solid ${group.color}50`, color: group.color, borderRadius: 50, padding: "3px 12px", fontFamily: "'DM Sans'", fontSize: 10, fontWeight: 500, cursor: "pointer", opacity: isSending ? 0.5 : 1 }}>
                              {isSending ? "…" : "Probar →"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}


// =============================================================================
// 6. ESTILOS
// =============================================================================
const S = {
  phone:     { width: "100%", maxWidth: 390, minHeight: "100dvh", margin: "0 auto", background: "#0f0f17", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" },
  statusBar: { display: "flex", justifyContent: "space-between", padding: "12px 20px 4px", color: "#555", fontSize: 11 },
  content:   { flex: 1, overflowY: "auto", paddingBottom: 30 },
  toast:     { position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", background: "#2a2a3a", color: "#f0e6d3", padding: "10px 22px", borderRadius: 50, fontSize: 13, zIndex: 999, animation: "toastIn 0.3s ease both", whiteSpace: "nowrap", border: "1px solid rgba(200,169,126,0.3)" },
  qBtn:      { borderRadius: 50, padding: "8px 14px", fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", textAlign: "center" },
};
