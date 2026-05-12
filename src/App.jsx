// =============================================================================
// FITMANAGER — App completa
// Tecnología: React (JSX) con hooks. Sin librerías externas.
//
// VISTAS:
//   "today"          → Comidas del día + agua
//   "nutricionista"  → Citas + evolución del peso
//   "calendar"       → Calendario con rangos de dieta y citas
//   "diets"          → Lista de dietas + importador PDF
//   "editDiet"       → Formulario de edición de dieta
//   "notificaciones" → Panel de notificaciones via Telegram
// =============================================================================

import { useState, useEffect, useRef } from "react";

// =============================================================================
// CONSTANTES GLOBALES
// =============================================================================
const MEAL_TYPES  = ["Desayuno","Media mañana","Comida","Merienda 1","Merienda","Cena","Recena"];
const MEAL_ICONS  = { "Desayuno":"☀️","Media mañana":"🍎","Comida":"🍽️","Merienda 1":"☕","Merienda":"☕","Cena":"🌙","Recena":"🌟","Extra":"➕" };
const DAYS        = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAY_LABELS  = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];
const WATER_GOAL  = 3000;
const WATER_STEPS = [200, 250, 500, 750];

// Telegram
const BOT_TOKEN = "8756822686:AAGjXdOfzNq7ROroGXL9my0JnrTnu3-3Jks";
const CHAT_ID   = "1080470754";
const sendTG    = (body) =>
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, parse_mode: "Markdown", ...body }),
  }).then(r => r.json());

// =============================================================================
// DATOS DE LA DIETA
// =============================================================================
const PRELOADED_DIET = {
  id: 1, name: "Plan – Tú Centro de Entrenamiento",
  startDate: "2026-05-11", endDate: "", active: true,
  days: {
    Lunes:     { Comida: { foods:"Filete de ternera a la plancha con tomate natural",     ingredients:"Aceite de oliva: 10g, Filete de ternera: 250g, Tomate crudo: 250g",                            calories:420, schedule:"14:00" }, "Merienda 1":{ foods:"Batido de proteína con leche desnatada", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g",                                     calories:230, schedule:"19:00" }, Cena:{ foods:"Fajitas de pavo con vegetales frescos",       ingredients:"Pavo: 150g, Fajita integral: 60g, Lechuga: 30g, Tomate: 40g, Cebolla: 40g, Aceite: 5g", calories:380, schedule:"23:00" } },
    Martes:    { Comida: { foods:"Hamburguesa de pavo con guisantes",                     ingredients:"Hamburguesa pavo: 260g, Guisantes: 125g, Aceite: 8g",                                          calories:390, schedule:"14:00" }, "Merienda 1":{ foods:"Batido de proteína con leche desnatada", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g",                                     calories:230, schedule:"19:00" }, Cena:{ foods:"Parrillada de atún con verduras",              ingredients:"Atún: 150g, Calabacín: 75g, Espárrago: 75g, Pimiento rojo: 75g, Cebolla: 70g",          calories:310, schedule:"23:00" } },
    Miércoles: { Comida: { foods:"Solomillo de pollo con espinacas y piñones",            ingredients:"Pollo solomillo: 300g, Espinacas: 150g, Piñones: 15g, Aceite: 10g",                           calories:480, schedule:"14:00" }, "Merienda 1":{ foods:"Batido de proteína con leche desnatada", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g",                                     calories:230, schedule:"19:00" }, Cena:{ foods:"Ensalada de guisantes con queso fresco y almendras", ingredients:"Guisantes: 100g, Lechuga: 50g, Pepino: 100g, Queso Burgos 0%: 110g, Almendras: 20g",   calories:295, schedule:"23:00" } },
    Jueves:    { Comida: { foods:"Salmón a la plancha con pisto",                         ingredients:"Salmón: 300g, Pimiento rojo: 100g, Pimiento verde: 100g, Cebolla: 100g, Tomate: 100g",        calories:520, schedule:"14:00" }, "Merienda 1":{ foods:"Batido de proteína con leche desnatada", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g",                                     calories:230, schedule:"19:00" }, Cena:{ foods:"Pavo al curry con manzana",                    ingredients:"Pavo: 150g, Manzana: 180g, Cebolla: 100g, Yogur: 125g, Aceite: 8g, Curry, Comino",     calories:340, schedule:"23:00" } },
    Viernes:   { Comida: { foods:"Salteado de ternera con ensalada en vinagreta",         ingredients:"Ternera: 200g, Tomate: 150g, Cebolleta: 90g, Pepinillos: 20g, Aceite: 15g, Vinagre",         calories:380, schedule:"14:00" }, "Merienda 1":{ foods:"Batido de proteína con leche desnatada", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g",                                     calories:230, schedule:"19:00" }, Cena:{ foods:"Kiwi y queso fresco batido",                   ingredients:"Queso fresco batido: 240g, Kiwi: 200g",                                                 calories:190, schedule:"23:00" } },
    Sábado:    { Comida: { foods:"Dorada con tomate, aguacate y nueces",                  ingredients:"Dorada: 470g, Aguacate: 125g, Tomate: 250g, Nueces: 25g, Aceite: 15g",                        calories:540, schedule:"14:00" }, "Merienda 1":{ foods:"Batido de proteína con leche desnatada", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g",                                     calories:230, schedule:"19:00" }, Cena:{ foods:"Fajitas de maíz con pollo, lechuga y tomate",  ingredients:"Harina maíz: 40g, Clara huevo: 70g, Pollo: 75g, Lechuga: 20g, Tomate: 50g",            calories:290, schedule:"23:00" } },
    Domingo:   { Comida: { foods:"Merluza con salteado de gulas y puerro",                ingredients:"Merluza: 350g, Gulas: 100g, Puerro: 75g, Ajo: 10g, Aceite: 15g",                             calories:430, schedule:"14:00" }, "Merienda 1":{ foods:"Batido de proteína con leche desnatada", ingredients:"Proteína suero 90%: 30g, Leche desnatada: 400g",                                     calories:230, schedule:"19:00" }, Cena:{ foods:"Ensalada de tomate, cebolla, pimiento verde y atún", ingredients:"Tomate: 200g, Cebolla: 125g, Pimiento verde: 125g, Atún en agua: 110g, Aceite: 15g",  calories:280, schedule:"23:00" } },
  },
};

// =============================================================================
// NOTIFICACIONES — definición y mensajes
// =============================================================================
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

const buildMsg = (id, day) => {
  const d     = PRELOADED_DIET.days[day] || {};
  const total = Object.values(d).reduce((s, m) => s + (m.calories || 0), 0);
  switch (id) {
    case "daily_plan": {
      let msg = `🌅 *¡Buenos días, Joaquín!*\n\n📋 *Tu dieta de hoy — ${day}*\n${"─".repeat(28)}\n\n`;
      Object.entries(d).forEach(([name, m]) => { msg += `🕐 *${m.schedule}* — *${name}*\n🍽️ ${m.foods}\n📝 _${m.ingredients}_\n⚡ ${m.calories} kcal\n\n`; });
      msg += `${"─".repeat(28)}\n💯 *Total: ${total} kcal*\n\n💧 Recuerda: *3 litros de agua hoy* 💪`;
      return msg;
    }
    case "breakfast":     return `☀️ *¡Buenos días!* Es hora del desayuno 🍳\n\n¡${day} arrancando con energía! 💪`;
    case "mid_morning":   return `🍎 *Media mañana*\n\nBuen momento para un snack ligero. ¡Recuerda el plan! 👍`;
    case "lunch_pre":     return `🍽️ *¡En 15 minutos es la comida!*\n\n📌 Hoy: *${d.Comida?.foods || "Comida del plan"}*\n📝 _${d.Comida?.ingredients || ""}_\n⚡ ${d.Comida?.calories || 0} kcal`;
    case "snack":         return `☕ *¡Hora de la merienda!* (19:00)\n\n📌 *${d["Merienda 1"]?.foods || "Batido de proteína"}*\n📝 _${d["Merienda 1"]?.ingredients || ""}_\n⚡ ${d["Merienda 1"]?.calories || 0} kcal`;
    case "dinner_pre":    return `🌙 *¡En 15 minutos es la cena!*\n\n📌 Hoy: *${d.Cena?.foods || "Cena del plan"}*\n📝 _${d.Cena?.ingredients || ""}_\n⚡ ${d.Cena?.calories || 0} kcal`;
    case "dinner_done":   return `✅ *¿Ya has cenado?*\n\nMárcala en la app. ¡Buen trabajo hoy, Joaquín! 😴`;
    case "water_morning": return `💧 *¡Empieza el día hidratado!*\n\nBébete un buen vaso de agua 🥤\nObjetivo: *3.000 ml*`;
    case "water_midday":  return `🚰 *Control de agua — Mediodía*\n\n¿Llevas al menos *1 litro* bebido? 💧`;
    case "water_evening": return `💦 *Control de agua — Tarde*\n\nDeberías llevar ~*2 litros*. Queda la noche para completar los 3L 🌊`;
    case "water_night":   return `🌊 *Último aviso — Agua*\n\n¿Has llegado a los *3 litros* hoy? Si te falta, bebe un poco más antes de dormir 💧`;
    case "appt_day":      return `🩺 *¡Hoy tienes consulta con el nutricionista!*\n\n• Lleva tus dudas anotadas\n• Comenta si has modificado algo\n• ¡Pésate antes de salir! ⚖️`;
    case "appt_1day":     return `📅 *¡Mañana tienes consulta!*\n\nPrepara preguntas y recuerda *pesarte en ayunas* ⚖️`;
    case "appt_3days":    return `🗓️ *Consulta en 3 días*\n\nVe anotando cómo te has sentido esta semana para comentárselo al nutricionista.`;
    case "weight_remind": return `⚖️ *¡Recuerda pesarte!*\n\nHoy tienes consulta. Pésate *en ayunas* antes de salir 📊`;
    case "daily_summary": return `📊 *Resumen del día — ${day}*\n\n🍽️ Plan: *${total} kcal*\n\n✅ ¿Completaste todas las comidas?\n💧 ¿Llegaste a los 3 litros?\n\n¡Mañana seguimos! 💪`;
    case "weekly_sunday": return `📈 *Resumen semanal*\n\n¡Otra semana completada, Joaquín! 🏆\n\n⚡ Media diaria: *${Math.round(Object.values(PRELOADED_DIET.days).reduce((s,dd)=>s+Object.values(dd).reduce((ss,m)=>ss+(m.calories||0),0),0)/7)} kcal*\n\n¡Sigue así! 🌟`;
    case "streak":        return `🔥 *¡Racha de cumplimiento!*\n\n¡Llevas varios días seguidos con el plan! Eso es consistencia de verdad 💪`;
    case "calories_over": return `⚠️ *Alerta: calorías superadas*\n\nHoy te has pasado un poco del plan. Sin agobios 😊\nMañana volvemos con energía 💪`;
    case "motivation":    return MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)];
    case "midweek_cheer": return `🌟 *¡Mitad de semana superada!*\n\nYa llevas 4 días con el plan. ¡Quedan 3 para la semana perfecta! 🏆`;
    case "weekend_warn":  return `🛡️ *¡Fin de semana!*\n\nRecuerda que el plan también se mantiene el finde. ¡Tú puedes, Joaquín! 💪`;
    case "plan_end":      return `🏁 *Tu plan termina en 3 días*\n\nContacta con tu nutricionista para el siguiente. ¡Vas a llegar con buenos resultados! 🌟`;
    case "sleep_prep":    return `🌙 *Prepara el día de mañana*\n\nEcha un vistazo a las comidas de mañana en la app antes de dormir 📱\n\n¡Buenas noches! 😴`;
    case "shopping":      return `🛒 *¡Nueva semana, nueva compra!*\n\n🥦 Verduras · 🥩 Proteínas · 🐟 Pescado · 🥛 Lácteos\n\n¡Empieza la semana con la nevera surtida!`;
    case "supplements":   return `🧪 *Recordatorio: Batido de proteínas* (19:00) 🥤\n\n📝 _Proteína suero 90%: 30g + Leche desnatada: 400ml_\n⚡ 230 kcal`;
    case "exercise_day":  return `🏋️ *¡Hoy es día de entreno!*\n\nHazlo *2-3h después de comer*, no justo después de una ingesta 💪🔥`;
    default:              return `📢 Recordatorio de tu plan dietético`;
  }
};

const NOTIF_GROUPS = [
  { group:"🌅 Comidas del día",  color:"#c8a97e", items:[
    { id:"daily_plan",    label:"Dieta del día completa",        time:"07:00", desc:"Todas las comidas e ingredientes cada mañana",           emoji:"🌅" },
    { id:"breakfast",     label:"Recordatorio desayuno",          time:"08:45", desc:"Buenos días + aviso de hora del desayuno",               emoji:"☀️" },
    { id:"mid_morning",   label:"Media mañana",                   time:"11:45", desc:"Recordatorio de media mañana",                           emoji:"🍎" },
    { id:"lunch_pre",     label:"Aviso precomida",                time:"13:45", desc:"\"En 15 min es la comida\" con ingredientes",            emoji:"🍽️" },
    { id:"snack",         label:"Recordatorio merienda",          time:"19:00", desc:"Aviso de la merienda con lo que toca hoy",               emoji:"☕" },
    { id:"dinner_pre",    label:"Aviso precena",                  time:"22:45", desc:"\"En 15 min es la cena\" con ingredientes",              emoji:"🌙" },
    { id:"dinner_done",   label:"¿Has cenado ya?",                time:"23:30", desc:"Recordatorio de marcar la cena en la app",               emoji:"✅" },
  ]},
  { group:"💧 Hidratación",      color:"#68b4d4", items:[
    { id:"water_morning", label:"Agua al despertar",              time:"08:00", desc:"Arranca el día bebiendo un vaso de agua",                emoji:"💧" },
    { id:"water_midday",  label:"Control agua mediodía",          time:"13:00", desc:"¿Llevas 1 litro? Comprueba tu hidratación",              emoji:"🚰" },
    { id:"water_evening", label:"Control agua tarde",             time:"18:00", desc:"Deberías llevar ~2L a esta hora",                        emoji:"💦" },
    { id:"water_night",   label:"Último aviso agua",              time:"23:55", desc:"¿Has llegado a los 3 litros hoy?",                       emoji:"🌊" },
  ]},
  { group:"🩺 Nutricionista",    color:"#9090cc", items:[
    { id:"appt_day",      label:"Día de consulta",                time:"08:00", desc:"Aviso la mañana del día que tienes consulta",            emoji:"🩺" },
    { id:"appt_1day",     label:"Mañana tienes consulta",         time:"09:00", desc:"Recordatorio el día anterior",                           emoji:"📅" },
    { id:"appt_3days",    label:"Consulta en 3 días",             time:"09:00", desc:"Aviso 3 días antes para preparar preguntas",             emoji:"🗓️" },
    { id:"weight_remind", label:"Recuerda pesarte",               time:"07:30", desc:"El día de consulta: pésate antes de salir",              emoji:"⚖️" },
  ]},
  { group:"📊 Seguimiento",      color:"#7ec8a0", items:[
    { id:"daily_summary", label:"Resumen diario",                 time:"22:00", desc:"Calorías del plan y comidas del día",                    emoji:"📊" },
    { id:"weekly_sunday", label:"Resumen semanal (domingos)",     time:"20:00", desc:"Cada domingo: resumen de la semana",                     emoji:"📈" },
    { id:"streak",        label:"Racha de cumplimiento",          time:"21:00", desc:"Aviso de días seguidos cumpliendo el plan",              emoji:"🔥" },
    { id:"calories_over", label:"Alerta calorías superadas",      time:"live",  desc:"Aviso si superas el plan en más de 200 kcal",            emoji:"⚠️" },
  ]},
  { group:"💪 Motivación",       color:"#e0a070", items:[
    { id:"motivation",    label:"Mensaje motivacional diario",    time:"07:30", desc:"Frase motivadora aleatoria cada mañana",                 emoji:"💪" },
    { id:"midweek_cheer", label:"Ánimo mitad de semana (mié)",    time:"12:00", desc:"Cada miércoles: empujón para acabar la semana",          emoji:"🌟" },
    { id:"weekend_warn",  label:"Precaución fin de semana (sáb)", time:"10:00", desc:"Sábados: recuerda mantener el plan el finde",            emoji:"🛡️" },
    { id:"plan_end",      label:"Fin de plan próximo",            time:"09:00", desc:"3 días antes de que acabe tu dieta actual",              emoji:"🏁" },
  ]},
  { group:"🌙 Bienestar",        color:"#a078d4", items:[
    { id:"sleep_prep",    label:"Prepara el día siguiente",       time:"22:30", desc:"Revisa las comidas de mañana antes de dormir",           emoji:"🌙" },
    { id:"shopping",      label:"Lista de la compra (lunes)",     time:"10:00", desc:"Cada lunes: ingredientes que necesitas esta semana",     emoji:"🛒" },
    { id:"supplements",   label:"Recordatorio batido proteínas",  time:"19:00", desc:"Hora del batido de proteínas",                           emoji:"🧪" },
    { id:"exercise_day",  label:"Hoy es día de entreno",          time:"17:00", desc:"Aviso los días de entrenamiento",                        emoji:"🏋️" },
  ]},
];

const ALL_NOTIFS = NOTIF_GROUPS.flatMap(g => g.items);

// =============================================================================
// HELPERS
// =============================================================================
const toDate     = (str) => { if (!str) return null; const d = new Date(str + "T00:00:00"); return isNaN(d) ? null : d; };
const fmtDate    = (d)   => d ? `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getFullYear()}` : "—";
const fmtDT      = (str) => { if (!str) return "—"; const d = new Date(str); return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0,3)} · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; };
const jsToMon    = (j)   => (j === 0 ? 6 : j - 1);
const dayKey     = (idx) => { const now = new Date(); const diff = idx - jsToMon(now.getDay()); const d = new Date(now); d.setDate(d.getDate() + diff); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
const buildCal   = (y,m) => { const f = new Date(y,m,1); const off = jsToMon(f.getDay()); const days = new Date(y,m+1,0).getDate(); return [...Array(off).fill(null), ...Array.from({length:days},(_,i)=>i+1)]; };

// =============================================================================
// HELPER DE PERSISTENCIA
// Lee un valor de localStorage al arrancar y lo guarda cada vez que cambia.
// Si no existe o hay error, devuelve el valor por defecto.
// =============================================================================
const persist = (key, defaultValue) => {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================
export default function App() {

  // ── VISTAS ─────────────────────────────────────────────────────────────────
  const [view, setView] = useState("today");

  // ── DIETAS ─────────────────────────────────────────────────────────────────
  // Se persiste para conservar ediciones e importaciones entre sesiones
  const [diets,       setDiets]       = useState(() => persist("fm_diets", [PRELOADED_DIET]));
  const [editingDiet, setEditingDiet] = useState(null);
  const [editDay,     setEditDay]     = useState("Lunes");
  const [editMeal,    setEditMeal]    = useState(null);
  const [mealForm,    setMealForm]    = useState({ foods:"", calories:"", ingredients:"", schedule:"" });
  const [importing,   setImporting]   = useState(false);
  const [importError, setImportError] = useState(null);
  const fileRef = useRef();

  // ── HOY ────────────────────────────────────────────────────────────────────
  const [todayDayIdx,  setTodayDayIdx]  = useState(jsToMon(new Date().getDay()));
  // Comidas marcadas como completadas — persiste para no perder el progreso del día
  const [checkedMeals, setCheckedMeals] = useState(() => persist("fm_checked", {}));
  const [expandedMeal, setExpandedMeal] = useState(null);
  // Registro diario (extras + overrides) — persiste para conservar cambios del día
  const [dailyLog,     setDailyLog]     = useState(() => persist("fm_dailylog", {}));
  const [logModal,     setLogModal]     = useState(null);
  const [logForm,      setLogForm]      = useState({ foods:"", calories:"", ingredients:"" });

  // ── AGUA ───────────────────────────────────────────────────────────────────
  // Persiste para conservar el registro de agua aunque se cierre la app
  const [waterLog,    setWaterLog]    = useState(() => persist("fm_water", {}));
  const [customWater, setCustomWater] = useState("");

  // ── NUTRICIONISTA ──────────────────────────────────────────────────────────
  // Persiste para conservar citas y pesos registrados
  const [appointments, setAppointments] = useState(() => persist("fm_appointments", [
    { id:1, datetime:"2026-05-11T10:00", weight:"", notes:"Primera consulta – Plan dietético" }
  ]));
  const [apptModal,    setApptModal]    = useState(false);
  const [apptForm,     setApptForm]     = useState({ datetime:"", weight:"", notes:"" });
  const [weightModal,  setWeightModal]  = useState(null);
  const [weightInput,  setWeightInput]  = useState("");

  // ── CALENDARIO ─────────────────────────────────────────────────────────────
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear,  setCalYear]  = useState(new Date().getFullYear());

  // ── NOTIFICACIONES ─────────────────────────────────────────────────────────
  const [notifEnabled, setNotifEnabled] = useState(() => persist("nf_enabled", {}));
  const [notifSending,  setNotifSending]  = useState({});
  const [notifLastSent, setNotifLastSent] = useState({});
  // Persiste si el bot estaba conectado para no tener que reconectar cada vez
  const [tgConnected,   setTgConnected]   = useState(() => persist("fm_tg_connected", false));
  const [tgConnecting,  setTgConnecting]  = useState(false);
  const tickRef = useRef(null);

  // ── TOAST ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // ── EFECTOS DE PERSISTENCIA ────────────────────────────────────────────────
  // Cada useEffect escucha los cambios de un estado y lo guarda en localStorage
  useEffect(() => { localStorage.setItem("fm_diets",        JSON.stringify(diets));        }, [diets]);
  useEffect(() => { localStorage.setItem("fm_checked",      JSON.stringify(checkedMeals)); }, [checkedMeals]);
  useEffect(() => { localStorage.setItem("fm_dailylog",     JSON.stringify(dailyLog));     }, [dailyLog]);
  useEffect(() => { localStorage.setItem("fm_water",        JSON.stringify(waterLog));     }, [waterLog]);
  useEffect(() => { localStorage.setItem("fm_appointments", JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem("nf_enabled",      JSON.stringify(notifEnabled)); }, [notifEnabled]);
  useEffect(() => { localStorage.setItem("fm_tg_connected", JSON.stringify(tgConnected));  }, [tgConnected]);

  // ── REDIS SYNC ────────────────────────────────────────────────────────────
  // Llama a la API del webhook para leer/escribir datos en Redis
  // Así Telegram y la app comparten los mismos datos en tiempo real

  const redisCall = async (...args) => {
    try {
      const res  = await fetch("/api/redis", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(args),
      });
      const data = await res.json();
      return data.result;
    } catch { return null; }
  };

  const rGet = async (key) => {
    const v = await redisCall("GET", key);
    try { return v ? JSON.parse(v) : null; } catch { return v; }
  };
  const rSet = (key, value) => redisCall("SET", key, JSON.stringify(value));

  // Clave del día actual (igual que en webhook.js)
  const rDayKey = () => {
    const d = new Date();
    return `fm:${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  };

  // Al arrancar: sincroniza agua y extras desde Redis
  useEffect(() => {
    const syncFromRedis = async () => {
      try {
        const dk = rDayKey();

        // Agua — lee de Redis y actualiza waterLog si hay datos más recientes
        const waterRedis = await rGet(`${dk}:water`);
        if (waterRedis !== null && waterRedis !== undefined) {
          setWaterLog(prev => ({ ...prev, [dayKey(todayDayIdx)]: waterRedis }));
        }

        // Extras — lee de Redis y fusiona con dailyLog
        const extrasRedis = await rGet(`${dk}:extras`);
        if (extrasRedis && Array.isArray(extrasRedis) && extrasRedis.length > 0) {
          setDailyLog(prev => {
            const dk2    = dayKey(todayDayIdx);
            const existing = prev[dk2] || { overrides: {}, extras: [] };
            // Solo actualiza si Redis tiene más extras que localStorage
            if (extrasRedis.length > existing.extras.length) {
              return { ...prev, [dk2]: { ...existing, extras: extrasRedis } };
            }
            return prev;
          });
        }

        // Comidas completadas — lee de Redis y fusiona con checkedMeals
        const checkedRedis = await rGet(`${dk}:checked`);
        if (checkedRedis && typeof checkedRedis === "object") {
          setCheckedMeals(prev => {
            const dk2    = dayKey(todayDayIdx);
            const merged = { ...prev };
            Object.keys(checkedRedis).forEach(meal => {
              merged[`${dk2}-${meal}`] = true;
            });
            return merged;
          });
        }
      } catch (err) {
        console.log("Redis sync error:", err);
      }
    };
    syncFromRedis();
  }, []);

  // Cuando cambia la dieta activa → súbela a Redis para que el bot la use
  useEffect(() => {
    const activeDiet = diets.find(d => d.active);
    if (!activeDiet) return;
    const uploadDiet = async () => {
      try {
        await rSet("fm:activeDiet", activeDiet.days);
      } catch {}
    };
    uploadDiet();
  }, [diets]);

  // Cuando cambia el agua → sincroniza con Redis
  useEffect(() => {
    const dk2     = dayKey(todayDayIdx);
    const waterMl = waterLog[dk2];
    if (waterMl === undefined) return;
    const dk3 = rDayKey();
    rSet(`${dk3}:water`, waterMl);
  }, [waterLog]);

  // Cuando cambian los extras → sincroniza con Redis
  useEffect(() => {
    const dk2    = dayKey(todayDayIdx);
    const logDay = dailyLog[dk2];
    if (!logDay?.extras?.length) return;
    const dk3 = rDayKey();
    rSet(`${dk3}:extras`, logDay.extras);
  }, [dailyLog]);

  // ── SCHEDULER DE NOTIFICACIONES ────────────────────────────────────────────
  useEffect(() => {
    if (!tgConnected) return;
    const check = () => {
      const now  = new Date();
      const hhmm = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
      const day  = DAYS[jsToMon(now.getDay())];
      const dow  = now.getDay();
      ALL_NOTIFS.forEach(n => {
        if (!notifEnabled[n.id] || n.time === "live" || n.time !== hhmm) return;
        const key = `sent_${n.id}_${now.toDateString()}`;
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
        if (n.id === "weekly_sunday"  && dow !== 0) return;
        if (n.id === "midweek_cheer"  && dow !== 3) return;
        if (n.id === "weekend_warn"   && dow !== 6) return;
        if (n.id === "shopping"       && dow !== 1) return;
        sendNotif(n);
      });
    };
    check();
    tickRef.current = setInterval(check, 60000);
    return () => clearInterval(tickRef.current);
  }, [tgConnected, notifEnabled]);

  // ── LÓGICA DERIVADA ────────────────────────────────────────────────────────
  const activeDiet     = diets.find(d => d.active) || diets[0];
  const todayDay       = DAYS[todayDayIdx];
  const currentDayKey  = dayKey(todayDayIdx);
  const log            = dailyLog[currentDayKey] || { overrides:{}, extras:[] };
  const waterMl        = waterLog[currentDayKey] || 0;
  const waterPct       = Math.min(100, (waterMl / WATER_GOAL) * 100);
  const waterOver      = waterMl > WATER_GOAL;
  const baseMeals      = activeDiet?.days?.[todayDay] || {};
  const effectiveMeals = {};
  Object.keys(baseMeals).forEach(m => { if (log.overrides[m] !== null) effectiveMeals[m] = log.overrides[m] || baseMeals[m]; });
  const allExtras      = log.extras || [];
  const planCal        = Object.values(effectiveMeals).reduce((s,m) => s+(m.calories||0), 0);
  const extraCal       = allExtras.reduce((s,m) => s+(m.calories||0), 0);
  const totalCal       = planCal + extraCal;
  const planTarget     = Object.values(baseMeals).reduce((s,m) => s+(m.calories||0), 0);
  const calDiff        = totalCal - planTarget;
  const allMealKeys    = Object.keys(effectiveMeals).sort((a,b) => (effectiveMeals[a].schedule||"00:00").localeCompare(effectiveMeals[b].schedule||"00:00"));
  const totalItems     = allMealKeys.length + allExtras.length;
  const checkedCount   = [...allMealKeys.map(m=>`${currentDayKey}-${m}`), ...allExtras.map((_,i)=>`${currentDayKey}-extra-${i}`)].filter(k=>checkedMeals[k]).length;
  const progress       = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;
  const now            = new Date();
  const nextAppt       = appointments.filter(a => a.datetime && new Date(a.datetime) > now).sort((a,b) => new Date(a.datetime)-new Date(b.datetime))[0];
  const nextApptDiff   = nextAppt ? Math.ceil((new Date(nextAppt.datetime)-now)/86400000) : null;
  const notifCount     = ALL_NOTIFS.filter(n => notifEnabled[n.id]).length;
  const cells          = buildCal(calYear, calMonth);

  // ── HANDLERS HOY ───────────────────────────────────────────────────────────
  const toggleMeal    = (meal) => setCheckedMeals(p => ({...p, [`${currentDayKey}-${meal}`]: !p[`${currentDayKey}-${meal}`]}));
  const addWater      = (ml)   => setWaterLog(p => ({...p, [currentDayKey]: (p[currentDayKey]||0)+ml}));
  const resetWater    = ()     => setWaterLog(p => ({...p, [currentDayKey]: 0}));
  const openOverride  = (meal) => { const c = effectiveMeals[meal]||baseMeals[meal]; setLogForm({foods:c?.foods||"", calories:c?.calories||"", ingredients:c?.ingredients||""}); setLogModal({type:"override",meal}); };
  const openExtra     = ()     => { setLogForm({foods:"",calories:"",ingredients:""}); setLogModal({type:"extra"}); };
  const saveLog       = ()     => {
    if (!logForm.foods) return;
    const entry = {foods:logForm.foods, calories:Number(logForm.calories)||0, ingredients:logForm.ingredients};
    setDailyLog(prev => { const ex = prev[currentDayKey]||{overrides:{},extras:[]}; if (logModal.type==="override") return {...prev,[currentDayKey]:{...ex,overrides:{...ex.overrides,[logModal.meal]:entry}}}; return {...prev,[currentDayKey]:{...ex,extras:[...ex.extras,entry]}}; });
    setLogModal(null); showToast(logModal.type==="override" ? "Comida modificada ✓" : "Extra añadido ✓");
  };
  const removeOverride = (meal) => { setDailyLog(prev => { const ex = prev[currentDayKey]||{overrides:{},extras:[]}; const {[meal]:_,...rest} = ex.overrides; return {...prev,[currentDayKey]:{...ex,overrides:rest}}; }); showToast("Restaurado al plan original"); };
  const removeExtra    = (idx)  => { setDailyLog(prev => { const ex = prev[currentDayKey]||{overrides:{},extras:[]}; return {...prev,[currentDayKey]:{...ex,extras:ex.extras.filter((_,i)=>i!==idx)}}; }); showToast("Extra eliminado"); };

  // ── HANDLERS NUTRICIONISTA ─────────────────────────────────────────────────
  const saveAppt   = () => { if (!apptForm.datetime) return; setAppointments(p => [...p,{id:Date.now(),...apptForm}].sort((a,b)=>new Date(a.datetime)-new Date(b.datetime))); setApptModal(false); setApptForm({datetime:"",weight:"",notes:""}); showToast("Consulta añadida ✓"); };
  const saveWeight = () => { if (!weightInput) return; setAppointments(p => p.map(a => a.id===weightModal ? {...a,weight:weightInput} : a)); setWeightModal(null); setWeightInput(""); showToast("Peso registrado ✓"); };
  const deleteAppt = (id) => { setAppointments(p => p.filter(a => a.id!==id)); showToast("Consulta eliminada"); };

  // ── HANDLERS DIETAS ────────────────────────────────────────────────────────
  const startEditDiet   = (diet) => { setEditingDiet(JSON.parse(JSON.stringify(diet))); setEditDay("Lunes"); setView("editDiet"); };
  const saveMealToEdit  = ()     => { if (!mealForm.foods) return; setEditingDiet(prev => { const d={...prev}; if (!d.days[editDay]) d.days[editDay]={}; d.days[editDay][editMeal]={foods:mealForm.foods,calories:Number(mealForm.calories)||0,ingredients:mealForm.ingredients,schedule:mealForm.schedule}; return d; }); setEditMeal(null); setMealForm({foods:"",calories:"",ingredients:"",schedule:""}); showToast("Guardado ✓"); };
  const saveEditingDiet = ()     => { if (editingDiet.id) setDiets(p=>p.map(d=>d.id===editingDiet.id?editingDiet:d)); else setDiets(p=>[...p,{...editingDiet,id:Date.now(),active:false}]); setView("diets"); showToast("Dieta guardada ✓"); };
  const setActiveDiet   = (id)   => { setDiets(p=>p.map(d=>({...d,active:d.id===id}))); showToast("Dieta activa ✓"); };
  const deleteDiet      = (id)   => { setDiets(p=>p.filter(d=>d.id!==id)); showToast("Dieta eliminada"); };

  // ── IMPORT PDF ─────────────────────────────────────────────────────────────
  const handlePDFImport = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImporting(true); setImportError(null);
    try {
      const base64 = await new Promise((res,rej) => { const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(file); });
      const resp = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,messages:[{role:"user",content:[{type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}},{type:"text",text:`Extrae el plan dietético en JSON. Solo JSON sin texto extra ni backticks. Estructura: {"name":"","startDate":"YYYY-MM-DD","endDate":"","days":{"Lunes":{"NombreComida":{"foods":"","ingredients":"","calories":0,"schedule":"HH:MM"}}}}. Mapeo: Día 1=Lunes…Día 7=Domingo.`}]}]})});
      const data = await resp.json();
      const parsed = JSON.parse(data.content.map(i=>i.text||"").join("").replace(/```json|```/g,"").trim());
      setDiets(p=>[...p,{...parsed,id:Date.now(),active:false}]);
      showToast("✅ Dieta importada");
    } catch { setImportError("Error procesando el PDF."); }
    finally { setImporting(false); e.target.value=""; }
  };

  // ── HANDLERS NOTIFICACIONES ────────────────────────────────────────────────
  const connectTG = () => {
    setTgConnecting(true);
    sendTG({text:`✅ *¡Conectado, Joaquín!*\n\nTu bot de FitManager está activo 🎉\n\nActiva los recordatorios que quieras en la app 💪`})
      .then(r => { setTgConnected(r.ok); setTgConnecting(false); if (r.ok) showToast("✅ Telegram conectado"); else showToast("❌ Error de conexión"); })
      .catch(() => { setTgConnected(false); setTgConnecting(false); showToast("❌ Error de conexión"); });
  };
  const sendNotif = async (notif) => {
    const day = DAYS[jsToMon(new Date().getDay())];
    setNotifSending(p=>({...p,[notif.id]:true}));
    try { await sendTG({text:buildMsg(notif.id,day)}); setNotifLastSent(p=>({...p,[notif.id]:new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})})); showToast(`${notif.emoji} Enviado ✓`); }
    catch { showToast("❌ Error al enviar"); }
    setNotifSending(p=>({...p,[notif.id]:false}));
  };
  const toggleNotif  = (id) => setNotifEnabled(p=>({...p,[id]:!p[id]}));
  const enableAllN   = ()   => { const a={}; ALL_NOTIFS.forEach(n=>{a[n.id]=true;}); setNotifEnabled(a); showToast("✅ Todas activadas"); };
  const disableAllN  = ()   => { setNotifEnabled({}); showToast("⬜ Todas desactivadas"); };

  // ── CALENDARIO STATUS ──────────────────────────────────────────────────────
  const getDaySt = (y,m,d) => {
    const date=new Date(y,m,d); const td=new Date(); td.setHours(0,0,0,0);
    let r = date.getTime()===td.getTime() ? "today" : null;
    diets.forEach(diet=>{ const s=toDate(diet.startDate); const e=toDate(diet.endDate); if(!s)return; const px=diet.active?"a":"o"; if(date.getTime()===s.getTime()) r=`${px}s`; else if(e&&date.getTime()===e.getTime()) r=`${px}e`; else if(e&&date>s&&date<e) r=`${px}r`; });
    appointments.forEach(a=>{ const ad=toDate(a.datetime?.slice(0,10)); if(ad&&ad.getTime()===date.getTime()) r=r==="today"?"today-appt":"appt"; });
    return r;
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div style={S.phone}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@300;600;900&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { display:none; }
        .bp:active { transform:scale(0.95); opacity:0.8; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter:invert(0.5); cursor:pointer; }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)}  }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)}  }
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)}  }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .fi { animation:fadeIn  0.3s  ease both; }
        .su { animation:slideUp 0.38s cubic-bezier(0.16,1,0.3,1) both; }
        .sp { animation:spin    1s    linear infinite; }
        .pu { animation:pulse   2s    ease infinite; }
      `}</style>

      <div style={S.statusBar}><span>9:41</span><span>●●● 🔋</span></div>
      {toast && <div style={S.toast}>{toast}</div>}

      {/* ── MODALES ─────────────────────────────────────────────────────── */}
      {(logModal||apptModal||weightModal) && (
        <div style={S.overlay} onClick={()=>{setLogModal(null);setApptModal(false);setWeightModal(null);}}>
          <div style={S.modal} onClick={e=>e.stopPropagation()} className="su">

            {logModal && (<>
              <p style={S.mTitle}>{logModal.type==="extra" ? "➕ Añadir extra" : `✏️ Modificar ${logModal.meal}`}</p>
              <p style={S.mSub}>{logModal.type==="extra" ? "Café, fruta, snack o cualquier cosa fuera del plan" : "Cambia este plato por lo que realmente has comido hoy"}</p>
              <label style={S.label}>¿Qué comiste?</label>
              <input style={S.input} placeholder="Ej: Café solo, Plátano…" value={logForm.foods} onChange={e=>setLogForm(p=>({...p,foods:e.target.value}))} autoFocus />
              <label style={{...S.label,marginTop:10}}>Ingredientes (opcional)</label>
              <input style={S.input} placeholder="Ej: Café: 1 taza, Azúcar: 5g" value={logForm.ingredients} onChange={e=>setLogForm(p=>({...p,ingredients:e.target.value}))} />
              <label style={{...S.label,marginTop:10}}>Calorías estimadas (kcal)</label>
              <input type="number" style={S.input} placeholder="Ej: 80" value={logForm.calories} onChange={e=>setLogForm(p=>({...p,calories:e.target.value}))} />
              <div style={{display:"flex",gap:10,marginTop:16}}>
                <button className="bp" onClick={()=>setLogModal(null)} style={{...S.mCancel,flex:1}}>Cancelar</button>
                <button className="bp" onClick={saveLog} disabled={!logForm.foods} style={{...S.mSave,flex:2,opacity:logForm.foods?1:0.4}}>Guardar</button>
              </div>
            </>)}

            {apptModal && (<>
              <p style={S.mTitle}>🩺 Nueva consulta</p>
              <p style={S.mSub}>Añade la fecha y hora de tu próxima visita</p>
              <label style={S.label}>Fecha y hora</label>
              <input type="datetime-local" style={S.input} value={apptForm.datetime} onChange={e=>setApptForm(p=>({...p,datetime:e.target.value}))} />
              <label style={{...S.label,marginTop:10}}>Peso en esa consulta (kg) — opcional</label>
              <input type="number" step="0.1" style={S.input} placeholder="Ej: 78.5" value={apptForm.weight} onChange={e=>setApptForm(p=>({...p,weight:e.target.value}))} />
              <label style={{...S.label,marginTop:10}}>Notas (opcional)</label>
              <input style={S.input} placeholder="Ej: Revisión mensual" value={apptForm.notes} onChange={e=>setApptForm(p=>({...p,notes:e.target.value}))} />
              <div style={{display:"flex",gap:10,marginTop:16}}>
                <button className="bp" onClick={()=>setApptModal(false)} style={{...S.mCancel,flex:1}}>Cancelar</button>
                <button className="bp" onClick={saveAppt} disabled={!apptForm.datetime} style={{...S.mSave,flex:2,opacity:apptForm.datetime?1:0.4}}>Guardar</button>
              </div>
            </>)}

            {weightModal && (<>
              <p style={S.mTitle}>⚖️ Registrar peso</p>
              <p style={S.mSub}>¿Cuánto pesaste en esta consulta?</p>
              <label style={S.label}>Peso (kg)</label>
              <input type="number" step="0.1" style={S.input} placeholder="Ej: 78.3" value={weightInput} onChange={e=>setWeightInput(e.target.value)} autoFocus />
              <div style={{display:"flex",gap:10,marginTop:16}}>
                <button className="bp" onClick={()=>setWeightModal(null)} style={{...S.mCancel,flex:1}}>Cancelar</button>
                <button className="bp" onClick={saveWeight} disabled={!weightInput} style={{...S.mSave,flex:2,opacity:weightInput?1:0.4}}>Guardar</button>
              </div>
            </>)}
          </div>
        </div>
      )}

      <div style={S.content}>

        {/* ════════════ HOY ════════════ */}
        {view==="today" && (
          <div className="fi" style={{paddingBottom:90}}>
            <div style={S.todayHeader}>
              <div><p style={S.greeting}>Hola, Joaquín 👋</p><h1 style={S.todayTitle}>Hoy, {todayDay}</h1></div>
              <div style={S.dietBadge}>{activeDiet?.name?.split("–")[0]?.trim()||"Sin dieta"}</div>
            </div>

            {nextAppt && (
              <div style={S.apptBanner} className="bp" onClick={()=>setView("nutricionista")}>
                <span style={{fontSize:18}}>🩺</span>
                <div style={{flex:1}}>
                  <p style={{fontFamily:"Fraunces",color:"#f0e6d3",fontSize:13,fontWeight:600}}>Próxima consulta</p>
                  <p style={{fontFamily:"'DM Sans'",color:"#c8a97e",fontSize:12,marginTop:1}}>{fmtDT(nextAppt.datetime)}</p>
                </div>
                <span style={{fontFamily:"'DM Sans'",color:"#888",fontSize:11}}>{nextApptDiff===0?"Hoy":nextApptDiff===1?"Mañana":`${nextApptDiff}d`} →</span>
              </div>
            )}

            <div style={S.dayScroll}>
              {DAYS.map((d,i) => (
                <button key={d} className="bp" onClick={()=>setTodayDayIdx(i)} style={{...S.dayChip,background:i===todayDayIdx?"#1a1a2e":"rgba(255,255,255,0.07)",color:i===todayDayIdx?"#f0e6d3":"#888",fontWeight:i===todayDayIdx?600:400,border:i===todayDayIdx?"1px solid rgba(200,169,126,0.4)":"1px solid transparent"}}>{d.slice(0,3)}</button>
              ))}
            </div>

            <div style={S.progressCard}>
              <svg width="78" height="78" viewBox="0 0 78 78">
                <circle cx="39" cy="39" r="32" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
                <circle cx="39" cy="39" r="32" fill="none" stroke={calDiff>150?"#e07060":"#c8a97e"} strokeWidth="7" strokeDasharray={`${2*Math.PI*32}`} strokeDashoffset={`${2*Math.PI*32*(1-progress/100)}`} strokeLinecap="round" transform="rotate(-90 39 39)" style={{transition:"stroke-dashoffset 0.6s ease"}}/>
                <text x="39" y="43" textAnchor="middle" fill="#f0e6d3" fontSize="15" fontFamily="Fraunces" fontWeight="600">{Math.round(progress)}%</text>
              </svg>
              <div style={{flex:1}}>
                <p style={{fontFamily:"Fraunces",fontSize:26,color:"#f0e6d3",fontWeight:600}}>{totalCal} <span style={{fontSize:13,color:"#c8a97e"}}>kcal</span></p>
                <p style={{fontFamily:"'DM Sans'",fontSize:11,color:"#888",marginTop:2}}>Plan: {planTarget} kcal</p>
                {extraCal>0 && <p style={{fontFamily:"'DM Sans'",fontSize:11,color:"#c8a97e",marginTop:2}}>+ {extraCal} kcal extras</p>}
                {calDiff!==0 && <p style={{fontFamily:"'DM Sans'",fontSize:11,color:calDiff>0?"#e07060":"#7ec8a0",fontWeight:600,marginTop:3}}>{calDiff>0?`▲ +${calDiff}`:`▼ ${calDiff}`} kcal vs plan</p>}
              </div>
            </div>

            {allMealKeys.length===0&&allExtras.length===0 && <div style={S.emptyState}><p style={{fontSize:34}}>🥗</p><p style={{fontFamily:"Fraunces",color:"#666",marginTop:8}}>Sin comidas para este día</p></div>}

            {allMealKeys.map((meal,i) => {
              const data=effectiveMeals[meal]; const isOvr=!!log.overrides[meal]; const done=checkedMeals[`${currentDayKey}-${meal}`]; const isExp=expandedMeal===`${currentDayKey}-${meal}`;
              return (
                <div key={meal} style={{margin:"0 20px 10px",animation:`fadeIn 0.3s ease ${i*0.05}s both`}}>
                  <div className="bp" onClick={()=>setExpandedMeal(isExp?null:`${currentDayKey}-${meal}`)} style={{...S.mealCard,opacity:done?0.5:1,borderColor:isOvr?"rgba(200,169,126,0.3)":"rgba(255,255,255,0.05)"}}>
                    <div style={S.mealLeft}>
                      <span style={{fontSize:19}}>{MEAL_ICONS[meal]||"🍴"}</span>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <p style={S.mealName}>{meal}</p>
                          {data.schedule && <span style={{fontSize:10,color:"#555"}}>{data.schedule}</span>}
                          {isOvr && <span style={{fontSize:9,color:"#c8a97e",background:"rgba(200,169,126,0.12)",padding:"1px 6px",borderRadius:50}}>mod.</span>}
                        </div>
                        <p style={S.mealFoods}>{data.foods}</p>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{textAlign:"right"}}><p style={S.mealCal}>{data.calories}</p><p style={{fontFamily:"'DM Sans'",fontSize:10,color:"#666"}}>kcal</p></div>
                      <div className="bp" onClick={e=>{e.stopPropagation();toggleMeal(meal);}} style={{...S.check,background:done?"#c8a97e":"transparent",borderColor:done?"#c8a97e":"#444"}}>{done&&<span style={{color:"#1a1a2e",fontSize:11,fontWeight:700}}>✓</span>}</div>
                    </div>
                  </div>
                  {isExp && (
                    <div className="su" style={S.mealDetail}>
                      {data.ingredients && (<><p style={S.detLbl}>🧾 Ingredientes</p>{data.ingredients.split(",").map((g,j)=><p key={j} style={S.detIng}>• {g.trim()}</p>)}</>)}
                      <div style={{display:"flex",gap:8,marginTop:12}}>
                        <button className="bp" onClick={()=>openOverride(meal)} style={S.detBtn}>✏️ Cambiar hoy</button>
                        {isOvr && <button className="bp" onClick={()=>removeOverride(meal)} style={{...S.detBtn,color:"#888"}}>↩ Restaurar</button>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {allExtras.map((extra,idx) => {
              const k=`${currentDayKey}-extra-${idx}`; const done=checkedMeals[k];
              return (
                <div key={`ex-${idx}`} style={{margin:"0 20px 10px"}}>
                  <div style={{...S.mealCard,border:"1px solid rgba(126,200,160,0.2)",opacity:done?0.5:1}}>
                    <div style={S.mealLeft}>
                      <span style={{fontSize:19}}>➕</span>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <p style={S.mealName}>Extra</p>
                          <span style={{fontSize:9,color:"#7ec8a0",background:"rgba(126,200,160,0.12)",padding:"1px 6px",borderRadius:50}}>añadido</span>
                        </div>
                        <p style={S.mealFoods}>{extra.foods}</p>
                        {extra.ingredients && <p style={{fontFamily:"'DM Sans'",color:"#555",fontSize:11,marginTop:2}}>{extra.ingredients}</p>}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{textAlign:"right"}}><p style={{...S.mealCal,color:"#7ec8a0"}}>{extra.calories}</p><p style={{fontFamily:"'DM Sans'",fontSize:10,color:"#666"}}>kcal</p></div>
                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        <div className="bp" onClick={()=>setCheckedMeals(p=>({...p,[k]:!p[k]}))} style={{...S.check,background:done?"#7ec8a0":"transparent",borderColor:done?"#7ec8a0":"#444"}}>{done&&<span style={{color:"#1a1a2e",fontSize:11,fontWeight:700}}>✓</span>}</div>
                        <button className="bp" onClick={()=>removeExtra(idx)} style={{background:"none",border:"none",color:"#555",fontSize:13,cursor:"pointer",padding:0}}>✕</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div style={{padding:"4px 20px 0"}}>
              <button className="bp" onClick={openExtra} style={S.addExtraBtn}>➕ Añadir extra (café, fruta, snack…)</button>
            </div>

            {/* AGUA */}
            <div style={S.waterCard}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:20}}>💧</span><p style={{fontFamily:"Fraunces",color:"#f0e6d3",fontSize:16,fontWeight:600}}>Agua del día</p></div>
                <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                  <span style={{fontFamily:"Fraunces",color:waterOver?"#7ec8a0":waterPct>=100?"#7ec8a0":"#68b4d4",fontSize:20,fontWeight:600}}>{waterMl}</span>
                  <span style={{fontFamily:"'DM Sans'",color:"#666",fontSize:11}}>/ {WATER_GOAL} ml</span>
                  {waterOver && <span style={{fontFamily:"'DM Sans'",color:"#7ec8a0",fontSize:11}}>+{waterMl-WATER_GOAL}ml</span>}
                </div>
              </div>
              <div style={{background:"rgba(255,255,255,0.06)",borderRadius:50,height:8,marginBottom:14,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:50,background:waterPct>=100?"#7ec8a0":"linear-gradient(90deg,#4a9ebb,#68d4c8)",width:`${waterPct}%`,transition:"width 0.4s ease"}}/>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                {WATER_STEPS.map(ml=><button key={ml} className="bp" onClick={()=>addWater(ml)} style={S.waterBtn}>+{ml<1000?ml:`${ml/1000}L`}</button>)}
              </div>
              <div style={{display:"flex",gap:8}}>
                <input type="number" style={{...S.input,flex:1,padding:"9px 12px",fontSize:13}} placeholder="Cantidad personalizada (ml)" value={customWater} onChange={e=>setCustomWater(e.target.value)}/>
                <button className="bp" onClick={()=>{if(customWater){addWater(Number(customWater));setCustomWater("");}}} style={{background:"rgba(104,180,212,0.15)",color:"#68b4d4",border:"1px solid rgba(104,180,212,0.3)",borderRadius:12,padding:"9px 16px",fontFamily:"'DM Sans'",fontSize:13,cursor:"pointer",whiteSpace:"nowrap"}}>Añadir</button>
              </div>
              {waterMl>0 && <button className="bp" onClick={resetWater} style={{background:"none",border:"none",color:"#555",fontFamily:"'DM Sans'",fontSize:11,cursor:"pointer",marginTop:8}}>↺ Reiniciar</button>}
              {waterPct>=100 && <p style={{fontFamily:"'DM Sans'",fontSize:12,color:"#7ec8a0",marginTop:8}}>{waterOver?`🚀 ¡Súper hidratado! ${waterMl}ml`:"🎉 ¡Objetivo de 3L alcanzado!"}</p>}
            </div>
          </div>
        )}

        {/* ════════════ NUTRICIONISTA ════════════ */}
        {view==="nutricionista" && (
          <div className="fi" style={{paddingBottom:90}}>
            <div style={S.pageHeader}><h1 style={S.pageTitle}>Nutricionista</h1><button className="bp" onClick={()=>{setApptForm({datetime:"",weight:"",notes:""});setApptModal(true);}} style={S.addBtn}>+ Consulta</button></div>
            {appointments.filter(a=>a.weight).length>=2 && (
              <div style={S.weightCard}>
                <p style={{fontFamily:"Fraunces",color:"#f0e6d3",fontSize:15,fontWeight:600,marginBottom:12}}>⚖️ Evolución del peso</p>
                <div style={{display:"flex",alignItems:"flex-end",gap:6,height:60}}>
                  {appointments.filter(a=>a.weight).map((a,i,arr)=>{
                    const vals=arr.map(x=>parseFloat(x.weight)); const min=Math.min(...vals)-1; const max=Math.max(...vals)+1;
                    const pct=((parseFloat(a.weight)-min)/(max-min))*100; const diff=i>0?(parseFloat(a.weight)-parseFloat(arr[i-1].weight)).toFixed(1):null;
                    return (<div key={a.id} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <span style={{fontFamily:"'DM Sans'",fontSize:9,color:diff<0?"#7ec8a0":diff>0?"#e07060":"#888"}}>{diff!==null?(diff>0?`+${diff}`:diff):""}</span>
                      <div style={{width:"100%",display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div style={{width:28,background:"rgba(200,169,126,0.25)",borderRadius:"4px 4px 0 0",height:`${Math.max(8,pct*0.5)}px`,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:3}}><span style={{fontFamily:"Fraunces",color:"#c8a97e",fontSize:9,fontWeight:600}}>{a.weight}</span></div></div>
                      <span style={{fontFamily:"'DM Sans'",fontSize:8,color:"#555"}}>{fmtDate(toDate(a.datetime?.slice(0,10))).slice(0,6)}</span>
                    </div>);
                  })}
                </div>
              </div>
            )}
            {appointments.length===0 && <div style={S.emptyState}><p style={{fontSize:34}}>🩺</p><p style={{fontFamily:"Fraunces",color:"#666",marginTop:8}}>Sin consultas registradas</p></div>}
            {appointments.slice().reverse().map((appt,i)=>{
              const isPast=appt.datetime&&new Date(appt.datetime)<now; const isNext=nextAppt?.id===appt.id;
              return (
                <div key={appt.id} className="fi" style={{...S.dietCard,animationDelay:`${i*0.05}s`,borderColor:isNext?"rgba(200,169,126,0.3)":"rgba(255,255,255,0.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <span style={{fontSize:20}}>{isPast?"✅":"🗓"}</span>
                        <p style={{fontFamily:"Fraunces",color:"#f0e6d3",fontSize:15,fontWeight:600}}>{fmtDT(appt.datetime)}</p>
                        {isNext && <span style={S.activePill}>Próxima</span>}
                      </div>
                      {appt.notes && <p style={{fontFamily:"'DM Sans'",color:"#888",fontSize:12,marginLeft:28}}>{appt.notes}</p>}
                      <div style={{marginLeft:28,marginTop:8,display:"flex",alignItems:"center",gap:10}}>
                        {appt.weight ? (
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{background:"rgba(200,169,126,0.1)",borderRadius:10,padding:"6px 12px",border:"1px solid rgba(200,169,126,0.2)"}}><p style={{fontFamily:"Fraunces",color:"#c8a97e",fontSize:18,fontWeight:600}}>{appt.weight} <span style={{fontSize:11}}>kg</span></p></div>
                            <button className="bp" onClick={()=>{setWeightModal(appt.id);setWeightInput(appt.weight);}} style={{...S.detBtn,fontSize:11}}>✏️</button>
                          </div>
                        ) : <button className="bp" onClick={()=>{setWeightModal(appt.id);setWeightInput("");}} style={S.detBtn}>⚖️ Añadir peso</button>}
                      </div>
                    </div>
                    <button className="bp" onClick={()=>deleteAppt(appt.id)} style={{background:"none",border:"none",color:"#444",fontSize:16,cursor:"pointer"}}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════ CALENDARIO ════════════ */}
        {view==="calendar" && (
          <div className="fi" style={{paddingBottom:90}}>
            <div style={S.pageHeader}><h1 style={S.pageTitle}>Calendario</h1></div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px 18px"}}>
              <button className="bp" onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);}} style={S.monthNavBtn}>‹</button>
              <p style={{fontFamily:"Fraunces",color:"#f0e6d3",fontSize:18,fontWeight:600}}>{MONTH_NAMES[calMonth]} {calYear}</p>
              <button className="bp" onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);}} style={S.monthNavBtn}>›</button>
            </div>
            <div style={S.calGrid}>{DAY_LABELS.map(l=><div key={l} style={{textAlign:"center",fontFamily:"'DM Sans'",fontSize:11,color:"#555",fontWeight:600,paddingBottom:8}}>{l}</div>)}</div>
            <div style={S.calGrid}>
              {cells.map((day,idx)=>{
                if(!day) return <div key={`e-${idx}`} style={{height:40}}/>;
                const st=getDaySt(calYear,calMonth,day);
                const isStart=st==="as"||st==="os"; const isEnd=st==="ae"||st==="oe"; const inRange=st==="ar"||st==="or"; const isAct=st?.startsWith("a"); const isToday=st==="today"||st==="today-appt"; const isAppt=st==="appt"||st==="today-appt";
                const rc=isAct?"rgba(200,169,126,0.2)":"rgba(130,130,200,0.15)"; const dc=isAct?"#c8a97e":"#9090cc";
                return (
                  <div key={`d-${day}`} style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",height:40}}>
                    {inRange && <div style={{position:"absolute",top:"22%",bottom:"22%",left:-1,right:-1,background:rc,zIndex:0}}/>}
                    {isStart && <div style={{position:"absolute",top:"22%",bottom:"22%",left:"50%",right:-1,background:rc,zIndex:0}}/>}
                    {isEnd   && <div style={{position:"absolute",top:"22%",bottom:"22%",left:-1,right:"50%",background:rc,zIndex:0}}/>}
                    <div style={{position:"relative",zIndex:1,width:30,height:30,borderRadius:"50%",background:(isStart||isEnd)?dc:isToday?"rgba(200,169,126,0.18)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",border:isToday&&!isStart&&!isEnd?"1.5px solid #c8a97e":"none"}}>
                      <span style={{fontFamily:(isStart||isEnd)?"Fraunces":"'DM Sans'",fontSize:12,fontWeight:(isStart||isEnd||isToday)?700:400,color:(isStart||isEnd)?"#1a1a2e":inRange?dc:isToday?"#c8a97e":"#bbb"}}>{day}</span>
                    </div>
                    {isAppt && <div style={{position:"absolute",bottom:3,width:4,height:4,borderRadius:"50%",background:"#9090cc",zIndex:2}}/>}
                  </div>
                );
              })}
            </div>
            <div style={{padding:"16px 20px 0",display:"flex",gap:16,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:"50%",background:"#c8a97e"}}/><span style={{fontFamily:"'DM Sans'",color:"#888",fontSize:11}}>Dieta activa</span></div>
              <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:6,height:6,borderRadius:"50%",background:"#9090cc"}}/><span style={{fontFamily:"'DM Sans'",color:"#888",fontSize:11}}>Consulta</span></div>
            </div>
            <div style={{padding:"14px 20px 0",display:"flex",flexDirection:"column",gap:10}}>
              {diets.map(diet=>{
                const s=toDate(diet.startDate); const e=toDate(diet.endDate);
                return (
                  <div key={diet.id} style={S.legendCard}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:diet.active?"#c8a97e":"#9090cc"}}/><span style={{fontFamily:"Fraunces",color:"#f0e6d3",fontSize:13}}>{diet.name}</span></div>
                      {diet.active && <span style={S.activePill}>Activa</span>}
                    </div>
                    <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                      <span style={S.dateTag}>📅 {s?fmtDate(s):"Sin inicio"}</span>
                      {e && <><span style={{color:"#555",fontSize:12}}>→</span><span style={S.dateTag}>🏁 {fmtDate(e)}</span></>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════ DIETAS ════════════ */}
        {view==="diets" && (
          <div className="fi" style={{paddingBottom:90}}>
            <div style={S.pageHeader}><h1 style={S.pageTitle}>Mis Dietas</h1><button className="bp" onClick={()=>{setEditingDiet({id:null,name:"",startDate:"",endDate:"",days:{}});setView("editDiet");}} style={S.addBtn}>+ Nueva</button></div>
            <div style={S.importCard}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><span style={{fontSize:22}}>📄</span><div><p style={{fontFamily:"Fraunces",color:"#f0e6d3",fontSize:14,fontWeight:600}}>Importar desde PDF</p><p style={{fontFamily:"'DM Sans'",color:"#888",fontSize:11,marginTop:2}}>Sube el PDF de tu nutricionista y lo leemos automáticamente</p></div></div>
              <input type="file" accept=".pdf" ref={fileRef} style={{display:"none"}} onChange={handlePDFImport}/>
              <button className="bp" onClick={()=>fileRef.current?.click()} disabled={importing} style={S.importBtn}>
                {importing ? <span style={{display:"flex",alignItems:"center",gap:8}}><span className="sp" style={{display:"inline-block",width:14,height:14,border:"2px solid #1a1a2e",borderTopColor:"transparent",borderRadius:"50%"}}/>Procesando…</span> : "📤 Subir PDF de dieta"}
              </button>
              {importError && <p style={{fontFamily:"'DM Sans'",color:"#c0504d",fontSize:12,marginTop:8}}>{importError}</p>}
            </div>
            {diets.map((diet,i)=>{
              const s=toDate(diet.startDate); const e=toDate(diet.endDate); const td=new Date(); td.setHours(0,0,0,0); const dl=e?Math.ceil((e-td)/86400000):null;
              return (
                <div key={diet.id} className="fi" style={{...S.dietCard,animationDelay:`${i*0.06}s`}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div style={{flex:1}}>
                      <h2 style={S.dietName}>{diet.name}</h2>
                      <div style={{display:"flex",gap:8,marginTop:7,flexWrap:"wrap"}}>
                        <span style={S.dateTag}>📅 {s?fmtDate(s):"—"}</span>
                        {e && <span style={S.dateTag}>🏁 {fmtDate(e)}</span>}
                      </div>
                      {dl!==null && <p style={{fontFamily:"'DM Sans'",fontSize:11,color:dl>=0?"#c8a97e":"#666",marginTop:5}}>{dl>0?`⏳ ${dl}d restantes`:dl===0?"⚡ Último día":"✅ Finalizada"}</p>}
                      <p style={S.dietDays}>{Object.keys(diet.days).length} días configurados</p>
                    </div>
                    {diet.active && <span style={S.activePill}>Activa</span>}
                  </div>
                  <div style={S.dietActions}>
                    <button className="bp" onClick={()=>startEditDiet(diet)} style={S.actionBtn}>✏️ Editar</button>
                    {!diet.active && <button className="bp" onClick={()=>setActiveDiet(diet.id)} style={{...S.actionBtn,background:"rgba(200,169,126,0.12)",color:"#c8a97e"}}>⭐ Activar</button>}
                    <button className="bp" onClick={()=>deleteDiet(diet.id)} style={{...S.actionBtn,color:"#c0504d"}}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════ EDITAR DIETA ════════════ */}
        {view==="editDiet" && editingDiet && (
          <div className="su" style={{paddingBottom:100}}>
            <div style={S.pageHeader}><button className="bp" onClick={()=>setView("diets")} style={S.backBtn}>← Volver</button><h1 style={{...S.pageTitle,fontSize:18}}>{editingDiet.id?"Editar Dieta":"Nueva Dieta"}</h1></div>
            <div style={S.section}>
              <label style={S.label}>Nombre</label>
              <input style={S.input} placeholder="Nombre del plan" value={editingDiet.name} onChange={e=>setEditingDiet(p=>({...p,name:e.target.value}))}/>
              <div style={{display:"flex",gap:10,marginTop:12}}>
                <div style={{flex:1}}><label style={S.label}>📅 Inicio</label><input type="date" style={S.input} value={editingDiet.startDate||""} onChange={e=>setEditingDiet(p=>({...p,startDate:e.target.value}))}/></div>
                <div style={{flex:1}}><label style={S.label}>🏁 Fin</label><input type="date" style={S.input} value={editingDiet.endDate||""} min={editingDiet.startDate||""} onChange={e=>setEditingDiet(p=>({...p,endDate:e.target.value}))}/></div>
              </div>
            </div>
            <p style={{...S.label,padding:"0 20px",marginBottom:8}}>Comidas por día</p>
            <div style={S.dayScroll}>{DAYS.map(d=><button key={d} className="bp" onClick={()=>setEditDay(d)} style={{...S.dayChip,background:d===editDay?"#c8a97e":"rgba(255,255,255,0.07)",color:d===editDay?"#1a1a2e":"#888",fontWeight:d===editDay?700:400,border:"1px solid transparent"}}>{d.slice(0,3)}{editingDiet.days?.[d]?"·":""}</button>)}</div>
            <div style={{padding:"0 20px"}}>
              {MEAL_TYPES.map(meal=>{
                const cur=editingDiet.days?.[editDay]?.[meal]; const isEd=editMeal===meal;
                return (
                  <div key={meal} style={S.editMealBlock}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{MEAL_ICONS[meal]||"🍴"}</span><span style={S.mealName}>{meal}</span></div>
                      <button className="bp" onClick={()=>{if(isEd)setEditMeal(null);else{setEditMeal(meal);setMealForm(cur?{...cur,calories:cur.calories||""}:{foods:"",calories:"",ingredients:"",schedule:""});}}} style={S.editChip}>{isEd?"Cancelar":cur?"✏️":"+ Añadir"}</button>
                    </div>
                    {cur&&!isEd && <div style={S.mealPreview}><p style={{fontFamily:"'DM Sans'",color:"#bbb",fontSize:12,flex:1}}>{cur.foods}</p><p style={{fontFamily:"Fraunces",color:"#c8a97e",fontSize:13}}>{cur.calories} kcal</p></div>}
                    {isEd && (
                      <div className="su" style={S.mealEditForm}>
                        <label style={S.label}>Plato</label>
                        <input style={S.input} placeholder="Nombre del plato" value={mealForm.foods} onChange={e=>setMealForm(p=>({...p,foods:e.target.value}))}/>
                        <label style={S.label}>Ingredientes</label>
                        <textarea style={{...S.input,height:60,resize:"none"}} placeholder="Ingrediente: cantidad, …" value={mealForm.ingredients} onChange={e=>setMealForm(p=>({...p,ingredients:e.target.value}))}/>
                        <div style={{display:"flex",gap:10}}>
                          <div style={{flex:1}}><label style={S.label}>Kcal</label><input type="number" style={S.input} value={mealForm.calories} onChange={e=>setMealForm(p=>({...p,calories:e.target.value}))}/></div>
                          <div style={{flex:1}}><label style={S.label}>Hora</label><input style={S.input} placeholder="14:00" value={mealForm.schedule} onChange={e=>setMealForm(p=>({...p,schedule:e.target.value}))}/></div>
                        </div>
                        <button className="bp" onClick={saveMealToEdit} style={S.saveMealBtn}>Guardar</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{padding:"18px 20px 0"}}><button className="bp" onClick={saveEditingDiet} disabled={!editingDiet.name} style={{...S.primaryBtn,opacity:editingDiet.name?1:0.4}}>{editingDiet.id?"Guardar cambios":"Crear dieta"}</button></div>
          </div>
        )}

        {/* ════════════ NOTIFICACIONES ════════════ */}
        {view==="notificaciones" && (
          <div className="fi" style={{paddingBottom:90}}>
            <div style={{padding:"18px 22px 0"}}>
              <p style={{fontFamily:"'DM Sans'",color:"#555",fontSize:13}}>Joaquín González Novo</p>
              <h1 style={{fontFamily:"Fraunces",color:"#f0e6d3",fontSize:26,fontWeight:600,marginTop:2}}>Notificaciones</h1>
              <p style={{fontFamily:"'DM Sans'",color:"#555",fontSize:12,marginTop:3}}>Recordatorios via Telegram · {notifCount} activas</p>
            </div>

            {/* Estado conexión + botón conectar */}
            <div style={{margin:"14px 20px 0",borderRadius:14,padding:"14px 16px",background:tgConnected?"rgba(126,200,160,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${tgConnected?"rgba(126,200,160,0.25)":"rgba(255,255,255,0.07)"}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {tgConnecting
                    ? <span className="sp" style={{display:"inline-block",width:8,height:8,borderRadius:"50%",border:"2px solid #888",borderTopColor:"transparent"}}/>
                    : <div className={tgConnected?"pu":""} style={{width:8,height:8,borderRadius:"50%",background:tgConnected?"#7ec8a0":"#555"}}/>
                  }
                  <div>
                    <p style={{fontFamily:"'DM Sans'",color:tgConnected?"#7ec8a0":"#888",fontSize:13,fontWeight:500}}>{tgConnecting?"Conectando…":tgConnected?"✈️ Telegram conectado":"Sin conexión"}</p>
                    {tgConnected && <p style={{fontFamily:"'DM Sans'",color:"#555",fontSize:11,marginTop:1}}>Chat ID: {CHAT_ID} · Bot activo</p>}
                  </div>
                </div>
                {tgConnected
                  ? <button className="bp" onClick={()=>sendNotif({id:"daily_plan",emoji:"🌅",label:"Dieta"})} style={{background:"rgba(200,169,126,0.12)",border:"1px solid rgba(200,169,126,0.25)",color:"#c8a97e",borderRadius:50,padding:"5px 12px",fontSize:11,fontFamily:"'DM Sans'",cursor:"pointer"}}>Enviar dieta ahora</button>
                  : <button className="bp" onClick={connectTG} disabled={tgConnecting} style={{background:"#c8a97e",color:"#1a1a2e",border:"none",borderRadius:50,padding:"7px 16px",fontFamily:"Fraunces",fontSize:13,fontWeight:600,cursor:"pointer",opacity:tgConnecting?0.5:1}}>{tgConnecting?"…":"Conectar"}</button>
                }
              </div>
            </div>

            {tgConnected && (
              <>
                <div style={{display:"flex",gap:8,padding:"12px 20px 0"}}>
                  <button className="bp" onClick={enableAllN}  style={{...S.qBtn,background:"rgba(200,169,126,0.1)",color:"#c8a97e",border:"1px solid rgba(200,169,126,0.2)",flex:1}}>✅ Activar todas</button>
                  <button className="bp" onClick={disableAllN} style={{...S.qBtn,background:"rgba(255,255,255,0.05)",color:"#666",border:"1px solid rgba(255,255,255,0.07)",flex:1}}>⬜ Desactivar todas</button>
                </div>

                {/* Botón para registrar comandos en Telegram */}
                <div style={{padding:"8px 20px 0"}}>
                  <button className="bp" onClick={async () => {
                    try {
                      const res = await fetch(
                        `https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ commands: [
                            { command:"dieta",        description:"🍽️ Dieta completa de hoy" },
                            { command:"manana",       description:"📅 Dieta de mañana" },
                            { command:"semana",       description:"🗓 Plan de los 7 días" },
                            { command:"comida",       description:"⏰ Próxima comida ahora" },
                            { command:"calorias",     description:"📊 Calorías de hoy" },
                            { command:"agua",         description:"💧 Estado de hidratación" },
                            { command:"resumen",      description:"📋 Resumen completo del día" },
                            { command:"completar",    description:"✅ Marcar comida como completada" },
                            { command:"ingredientes", description:"🧾 Ingredientes de una comida" },
                            { command:"extra",        description:"➕ Añadir algo extra" },
                            { command:"peso",         description:"⚖️ Registrar tu peso" },
                            { command:"stats",        description:"📈 Estadísticas del plan" },
                            { command:"recordatorio", description:"⏰ Tiempo hasta próxima comida" },
                            { command:"motivacion",   description:"💪 Frase o pasaje bíblico" },
                            { command:"ayuda",        description:"🤖 Ver todos los comandos" },
                          ]})
                        }
                      );
                      const data = await res.json();
                      showToast(data.ok ? "✅ Comandos registrados en Telegram" : "❌ Error al registrar");
                    } catch { showToast("❌ Error de conexión"); }
                  }} style={{width:"100%",background:"rgba(144,144,204,0.1)",color:"#9090cc",border:"1px solid rgba(144,144,204,0.25)",borderRadius:12,padding:"11px",fontFamily:"'DM Sans'",fontSize:13,cursor:"pointer"}}>
                    ✈️ Registrar comandos en Telegram
                  </button>
                </div>

                {NOTIF_GROUPS.map((group,gi) => (
                  <div key={group.group} className="fi" style={{margin:"18px 20px 0",animationDelay:`${gi*0.04}s`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:3,height:18,borderRadius:2,background:group.color,flexShrink:0}}/>
                      <p style={{fontFamily:"Fraunces",color:"#f0e6d3",fontSize:15,fontWeight:600}}>{group.group}</p>
                      <span style={{fontFamily:"'DM Sans'",color:"#444",fontSize:11,marginLeft:"auto"}}>{group.items.filter(n=>notifEnabled[n.id]).length}/{group.items.length}</span>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {group.items.map(notif=>{
                        const isOn=!!notifEnabled[notif.id]; const isSnd=!!notifSending[notif.id]; const sent=notifLastSent[notif.id];
                        return (
                          <div key={notif.id} style={{borderRadius:14,padding:"13px 14px",border:`1px solid ${isOn?group.color+"35":"rgba(255,255,255,0.05)"}`,background:isOn?group.color+"0a":"#16162a",transition:"all 0.2s"}}>
                            <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                              <span style={{fontSize:19,marginTop:1,flexShrink:0}}>{notif.emoji}</span>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <p style={{fontFamily:"Fraunces",color:isOn?"#f0e6d3":"#555",fontSize:13,fontWeight:600,flex:1}}>{notif.label}</p>
                                  <div className="bp" onClick={()=>toggleNotif(notif.id)} style={{width:44,height:25,borderRadius:50,background:isOn?group.color:"rgba(255,255,255,0.08)",position:"relative",cursor:"pointer",transition:"background 0.25s",flexShrink:0}}>
                                    <div style={{position:"absolute",top:3.5,left:isOn?22:3.5,width:18,height:18,borderRadius:"50%",background:isOn?"#1a1a2e":"#555",transition:"left 0.25s",boxShadow:"0 1px 3px rgba(0,0,0,0.4)"}}/>
                                  </div>
                                </div>
                                <p style={{fontFamily:"'DM Sans'",color:"#555",fontSize:11,marginTop:4,lineHeight:1.45}}>{notif.desc}</p>
                                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
                                  {notif.time==="live"
                                    ? <span style={{fontFamily:"'DM Sans'",fontSize:10,color:"#e07060",background:"rgba(224,112,96,0.1)",padding:"2px 8px",borderRadius:50}}>⚡ Tiempo real</span>
                                    : <span style={{fontFamily:"'DM Sans'",fontSize:10,color:isOn?group.color:"#444",background:isOn?group.color+"18":"rgba(255,255,255,0.04)",padding:"2px 9px",borderRadius:50,border:`1px solid ${isOn?group.color+"30":"transparent"}`}}>🕐 {notif.time}</span>
                                  }
                                  {sent && <span style={{fontFamily:"'DM Sans'",fontSize:10,color:"#7ec8a0"}}>✓ Enviado {sent}</span>}
                                  {isOn&&notif.time!=="live" && (
                                    <button className="bp" onClick={()=>sendNotif(notif)} disabled={isSnd} style={{marginLeft:"auto",background:"none",border:`1px solid ${group.color}50`,color:group.color,borderRadius:50,padding:"3px 12px",fontFamily:"'DM Sans'",fontSize:10,fontWeight:500,cursor:"pointer",opacity:isSnd?0.5:1}}>{isSnd?"…":"Probar →"}</button>
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
              </>
            )}
            <div style={{height:20}}/>
          </div>
        )}

      </div>

      {/* ── BOTTOM NAV ──────────────────────────────────────────────────── */}
      <div style={S.bottomNav}>
        {[
          { id:"today",           icon:"🏠", label:"Hoy"    },
          { id:"nutricionista",   icon:"🩺", label:"Nutri"  },
          { id:"calendar",        icon:"📅", label:"Cal."   },
          { id:"diets",           icon:"📋", label:"Dietas" },
          { id:"notificaciones",  icon:"🔔", label:"Avisos" },
        ].map(({id,icon,label}) => (
          <button key={id} className="bp" onClick={()=>setView(id)} style={{...S.navBtn,color:(id==="diets"&&(view==="diets"||view==="editDiet"))||view===id?"#c8a97e":"#555",position:"relative"}}>
            <span style={{fontSize:19}}>{icon}</span>
            <span style={S.navLabel}>{label}</span>
            {/* Punto rojo si consulta en ≤3 días */}
            {id==="nutricionista"&&nextAppt&&nextApptDiff<=3 && <div style={{position:"absolute",top:6,right:"calc(50% - 14px)",width:6,height:6,borderRadius:"50%",background:"#e07060"}}/>}
            {/* Punto dorado en avisos si hay activas */}
            {id==="notificaciones"&&notifCount>0 && <div style={{position:"absolute",top:6,right:"calc(50% - 14px)",width:6,height:6,borderRadius:"50%",background:"#c8a97e"}}/>}
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// ESTILOS
// =============================================================================
const S = {
  phone:       { width:"100%", maxWidth:390, minHeight:"100dvh", margin:"0 auto", background:"#0f0f17", position:"relative", display:"flex", flexDirection:"column", fontFamily:"'DM Sans',sans-serif" },
  statusBar:   { display:"flex", justifyContent:"space-between", padding:"12px 20px 4px", color:"#555", fontSize:11 },
  content:     { flex:1, overflowY:"auto", overflowX:"hidden" },
  toast:       { position:"fixed", bottom:88, left:"50%", transform:"translateX(-50%)", background:"#2a2a3a", color:"#f0e6d3", padding:"10px 22px", borderRadius:50, fontSize:13, zIndex:999, animation:"toastIn 0.3s ease both", whiteSpace:"nowrap", border:"1px solid rgba(200,169,126,0.3)" },
  overlay:     { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200, display:"flex", alignItems:"flex-end" },
  modal:       { width:"100%", maxWidth:390, margin:"0 auto", background:"#1a1a2e", borderRadius:"20px 20px 0 0", padding:"24px 22px 40px" },
  mTitle:      { fontFamily:"Fraunces", color:"#f0e6d3", fontSize:18, fontWeight:600, marginBottom:6 },
  mSub:        { fontFamily:"'DM Sans'", color:"#666", fontSize:12, marginBottom:16 },
  mCancel:     { background:"rgba(255,255,255,0.07)", color:"#888", border:"none", borderRadius:12, padding:"12px", fontFamily:"'DM Sans'", fontSize:14, cursor:"pointer" },
  mSave:       { background:"#c8a97e", color:"#1a1a2e", border:"none", borderRadius:12, padding:"12px", fontFamily:"Fraunces", fontSize:15, fontWeight:600, cursor:"pointer" },
  apptBanner:  { margin:"0 20px 14px", background:"linear-gradient(135deg,rgba(144,144,204,0.12),rgba(144,144,204,0.06))", border:"1px solid rgba(144,144,204,0.2)", borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, cursor:"pointer" },
  todayHeader: { padding:"16px 22px 10px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
  greeting:    { fontFamily:"'DM Sans'", color:"#555", fontSize:13 },
  todayTitle:  { fontFamily:"Fraunces", color:"#f0e6d3", fontSize:28, fontWeight:600, lineHeight:1.1 },
  dietBadge:   { background:"rgba(200,169,126,0.1)", color:"#c8a97e", padding:"5px 12px", borderRadius:50, fontSize:10, border:"1px solid rgba(200,169,126,0.2)", maxWidth:110, textAlign:"center", lineHeight:1.3 },
  dayScroll:   { display:"flex", gap:8, padding:"8px 20px 14px", overflowX:"auto" },
  dayChip:     { padding:"6px 14px", borderRadius:50, border:"none", cursor:"pointer", fontSize:12, fontFamily:"'DM Sans'", whiteSpace:"nowrap", transition:"all 0.2s", flexShrink:0 },
  progressCard:{ margin:"0 20px 18px", background:"linear-gradient(135deg,#1e1e2e,#16162a)", borderRadius:20, padding:"18px 22px", display:"flex", alignItems:"center", gap:18, border:"1px solid rgba(255,255,255,0.06)" },
  mealCard:    { background:"#16162a", borderRadius:16, padding:"13px 15px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", cursor:"pointer", transition:"all 0.2s", border:"1px solid rgba(255,255,255,0.05)" },
  mealDetail:  { background:"#13131f", borderRadius:"0 0 14px 14px", padding:"12px 15px 14px", border:"1px solid rgba(255,255,255,0.04)", borderTop:"none" },
  mealLeft:    { display:"flex", gap:11, flex:1 },
  mealName:    { fontFamily:"Fraunces", color:"#f0e6d3", fontSize:14, fontWeight:600 },
  mealFoods:   { fontFamily:"'DM Sans'", color:"#999", fontSize:12, marginTop:3, lineHeight:1.4 },
  mealCal:     { fontFamily:"Fraunces", color:"#c8a97e", fontSize:17, fontWeight:600 },
  detLbl:      { fontFamily:"'DM Sans'", fontSize:10, color:"#c8a97e", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 },
  detIng:      { fontFamily:"'DM Sans'", color:"#bbb", fontSize:12, lineHeight:1.7 },
  detBtn:      { background:"rgba(200,169,126,0.1)", color:"#c8a97e", border:"1px solid rgba(200,169,126,0.2)", borderRadius:50, padding:"5px 14px", fontSize:12, fontFamily:"'DM Sans'", cursor:"pointer" },
  addExtraBtn: { width:"100%", background:"rgba(126,200,160,0.08)", color:"#7ec8a0", border:"1px dashed rgba(126,200,160,0.3)", borderRadius:14, padding:"12px", fontFamily:"'DM Sans'", fontSize:13, cursor:"pointer", marginBottom:6 },
  waterCard:   { margin:"10px 20px 16px", background:"#16162a", borderRadius:18, padding:"18px", border:"1px solid rgba(104,180,212,0.15)" },
  waterBtn:    { flex:1, background:"rgba(104,180,212,0.1)", color:"#68b4d4", border:"1px solid rgba(104,180,212,0.2)", borderRadius:10, padding:"8px 4px", fontFamily:"'DM Sans'", fontSize:12, fontWeight:600, cursor:"pointer" },
  weightCard:  { margin:"0 20px 14px", background:"#16162a", borderRadius:16, padding:"16px", border:"1px solid rgba(200,169,126,0.12)" },
  emptyState:  { textAlign:"center", padding:"60px 20px" },
  pageHeader:  { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 22px 14px" },
  pageTitle:   { fontFamily:"Fraunces", color:"#f0e6d3", fontSize:26, fontWeight:600 },
  addBtn:      { background:"#c8a97e", color:"#1a1a2e", border:"none", borderRadius:50, padding:"8px 18px", fontFamily:"'DM Sans'", fontSize:13, fontWeight:600, cursor:"pointer" },
  importCard:  { margin:"0 20px 16px", background:"#16162a", borderRadius:16, padding:"16px", border:"1px solid rgba(200,169,126,0.15)" },
  importBtn:   { width:"100%", background:"rgba(200,169,126,0.12)", color:"#c8a97e", border:"1px solid rgba(200,169,126,0.3)", borderRadius:12, padding:"11px", fontFamily:"'DM Sans'", fontSize:14, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 },
  calGrid:     { display:"grid", gridTemplateColumns:"repeat(7,1fr)", padding:"0 14px" },
  monthNavBtn: { background:"rgba(255,255,255,0.07)", border:"none", color:"#f0e6d3", borderRadius:"50%", width:36, height:36, fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" },
  legendCard:  { background:"#16162a", borderRadius:14, padding:"14px", border:"1px solid rgba(255,255,255,0.06)" },
  dietCard:    { margin:"0 20px 14px", background:"#16162a", borderRadius:18, padding:"18px", border:"1px solid rgba(255,255,255,0.06)", animation:"fadeIn 0.3s ease both" },
  dietName:    { fontFamily:"Fraunces", color:"#f0e6d3", fontSize:15, fontWeight:600, lineHeight:1.3 },
  dietDays:    { fontFamily:"'DM Sans'", color:"#555", fontSize:11, marginTop:6 },
  dietActions: { display:"flex", gap:8, marginTop:13 },
  actionBtn:   { background:"rgba(255,255,255,0.06)", color:"#bbb", border:"none", borderRadius:50, padding:"7px 14px", fontFamily:"'DM Sans'", fontSize:12, cursor:"pointer" },
  activePill:  { background:"rgba(200,169,126,0.15)", color:"#c8a97e", border:"1px solid rgba(200,169,126,0.3)", borderRadius:50, padding:"3px 10px", fontSize:10, whiteSpace:"nowrap" },
  dateTag:     { fontFamily:"'DM Sans'", color:"#999", fontSize:11, background:"rgba(255,255,255,0.06)", borderRadius:6, padding:"3px 8px" },
  backBtn:     { background:"none", border:"none", color:"#c8a97e", fontFamily:"'DM Sans'", fontSize:14, cursor:"pointer" },
  section:     { padding:"0 20px 16px" },
  label:       { fontFamily:"'DM Sans'", color:"#666", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, display:"block" },
  input:       { width:"100%", background:"#1e1e2e", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"11px 14px", color:"#f0e6d3", fontFamily:"'DM Sans'", fontSize:14, outline:"none" },
  editMealBlock:{ background:"#16162a", borderRadius:13, padding:"13px", marginBottom:9, border:"1px solid rgba(255,255,255,0.05)" },
  editChip:    { background:"rgba(200,169,126,0.1)", color:"#c8a97e", border:"1px solid rgba(200,169,126,0.2)", borderRadius:50, padding:"4px 12px", fontSize:11, cursor:"pointer" },
  mealPreview: { marginTop:9, padding:"7px 10px", background:"rgba(255,255,255,0.03)", borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center", gap:10 },
  mealEditForm:{ marginTop:11, display:"flex", flexDirection:"column", gap:6 },
  saveMealBtn: { width:"100%", background:"rgba(200,169,126,0.12)", color:"#c8a97e", border:"1px solid rgba(200,169,126,0.25)", borderRadius:12, padding:"11px", fontFamily:"'DM Sans'", fontSize:14, fontWeight:500, cursor:"pointer" },
  primaryBtn:  { width:"100%", background:"#c8a97e", color:"#1a1a2e", border:"none", borderRadius:14, padding:"15px", fontFamily:"Fraunces", fontSize:16, fontWeight:600, cursor:"pointer" },
  bottomNav:   { position:"sticky", bottom:0, background:"rgba(15,15,23,0.96)", backdropFilter:"blur(20px)", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-around", padding:"10px 0 20px", zIndex:100 },
  navBtn:      { background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer", padding:"0 8px", transition:"color 0.2s" },
  navLabel:    { fontSize:10, fontFamily:"'DM Sans'", fontWeight:500 },
  check:       { width:22, height:22, borderRadius:"50%", border:"2px solid", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", flexShrink:0 },
  qBtn:        { borderRadius:50, padding:"8px 14px", fontFamily:"'DM Sans'", fontSize:12, fontWeight:500, cursor:"pointer", border:"none", textAlign:"center" },
};
