// =============================================================================
// DIET MANAGER — App principal
// Tecnología: React (JSX) con hooks. Sin librerías externas.
//
// ESTRUCTURA DEL ARCHIVO:
//   1. CONSTANTES GLOBALES       → datos fijos que no cambian
//   2. DATOS DE LA DIETA         → el plan dietético de Joaquín
//   3. FUNCIONES HELPER          → utilidades pequeñas reutilizables
//   4. COMPONENTE PRINCIPAL      → toda la lógica y UI de la app
//      4a. Estado (useState)     → variables reactivas
//      4b. Lógica derivada       → cálculos basados en el estado
//      4c. Handlers              → funciones que responden a acciones del usuario
//      4d. Efectos (useEffect)   → código que corre en segundo plano
//      4e. Render                → lo que se muestra en pantalla
//   5. ESTILOS                   → objeto con todos los estilos CSS-in-JS
// =============================================================================

import { useState, useEffect, useRef } from "react";


// =============================================================================
// 1. CONSTANTES GLOBALES
// =============================================================================

// Tipos de comida que puede tener un día (en orden cronológico)
const MEAL_TYPES = ["Desayuno", "Media mañana", "Comida", "Merienda 1", "Merienda", "Cena", "Recena"];

// Emoji para cada tipo de comida
const MEAL_ICONS = {
  "Desayuno":     "☀️",
  "Media mañana": "🍎",
  "Comida":       "🍽️",
  "Merienda 1":   "☕",
  "Merienda":     "☕",
  "Cena":         "🌙",
  "Recena":       "🌟",
  "Extra":        "➕",
};

// Días de la semana (empezando en Lunes, como en España)
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Nombres de los meses para formatear fechas
const MONTH_NAMES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

// Abreviaciones para la cabecera del calendario
const DAY_LABELS = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];

// Objetivo diario de agua en mililitros
const WATER_GOAL = 3000;

// Opciones rápidas para añadir agua (en ml)
const WATER_STEPS = [200, 250, 500, 750];


// =============================================================================
// 2. DATOS DE LA DIETA
// Plan dietético de Joaquín - "Tú Centro de Entrenamiento" (11 Mayo 2026)
//
// Estructura de cada comida:
// {
//   foods:       string  → nombre del plato
//   ingredients: string  → ingredientes separados por coma
//   calories:    number  → kcal estimadas
//   schedule:    string  → hora en formato "HH:MM"
// }
// =============================================================================

const PRELOADED_DIET = {
  id: 1,
  name: "Plan – Tú Centro de Entrenamiento",
  startDate: "2026-05-11",  // formato YYYY-MM-DD
  endDate: "",              // vacío = sin fecha de fin definida
  active: true,             // esta es la dieta que se muestra en "Hoy"
  days: {

    Lunes: {
      Comida: {
        foods:       "Filete de ternera a la plancha con tomate natural",
        ingredients: "Aceite de oliva: 10g, Filete de ternera: 250g, Tomate crudo: 250g",
        calories:    420,
        schedule:    "14:00",
      },
      "Merienda 1": {
        foods:       "Batido de proteína con leche desnatada",
        ingredients: "Proteína de suero 90%: 30g, Leche desnatada calcio UHT: 400g",
        calories:    230,
        schedule:    "19:00",
      },
      Cena: {
        foods:       "Fajitas de pavo con vegetales frescos",
        ingredients: "Pavo/pollo: 150g, Fajita integral: 60g, Lechuga: 30g, Tomate: 40g, Cebolla: 40g, Aceite: 5g",
        calories:    380,
        schedule:    "23:00",
      },
    },

    Martes: {
      Comida: {
        foods:       "Hamburguesa de pavo con guisantes",
        ingredients: "Hamburguesa de pavo: 260g, Guisantes: 125g, Aceite: 8g",
        calories:    390,
        schedule:    "14:00",
      },
      "Merienda 1": {
        foods:       "Batido de proteína con leche desnatada",
        ingredients: "Proteína de suero 90%: 30g, Leche desnatada calcio UHT: 400g",
        calories:    230,
        schedule:    "19:00",
      },
      Cena: {
        foods:       "Parrillada de atún con verduras",
        ingredients: "Atún: 150g, Calabacín: 75g, Espárrago: 75g, Pimiento rojo: 75g, Cebolla: 70g, Aceite: 10g",
        calories:    310,
        schedule:    "23:00",
      },
    },

    Miércoles: {
      Comida: {
        foods:       "Solomillo de pollo con espinacas y piñones",
        ingredients: "Pollo solomillo: 300g, Espinacas: 150g, Piñones: 15g, Aceite: 10g",
        calories:    480,
        schedule:    "14:00",
      },
      "Merienda 1": {
        foods:       "Batido de proteína con leche desnatada",
        ingredients: "Proteína de suero 90%: 30g, Leche desnatada calcio UHT: 400g",
        calories:    230,
        schedule:    "19:00",
      },
      Cena: {
        foods:       "Ensalada de guisantes con queso fresco y almendras",
        ingredients: "Guisantes: 100g, Lechuga: 50g, Pepino: 100g, Queso Burgos 0%: 110g, Almendras: 20g, Aceite: 10g",
        calories:    295,
        schedule:    "23:00",
      },
    },

    Jueves: {
      Comida: {
        foods:       "Salmón a la plancha con pisto",
        ingredients: "Salmón: 300g, Pimiento rojo: 100g, Pimiento verde: 100g, Cebolla: 100g, Tomate triturado: 100g, Aceite: 10g",
        calories:    520,
        schedule:    "14:00",
      },
      "Merienda 1": {
        foods:       "Batido de proteína con leche desnatada",
        ingredients: "Proteína de suero 90%: 30g, Leche desnatada calcio UHT: 400g",
        calories:    230,
        schedule:    "19:00",
      },
      Cena: {
        foods:       "Pavo al curry con manzana",
        ingredients: "Pavo pechuga: 150g, Manzana: 180g, Cebolla: 100g, Yogur natural: 125g, Aceite: 8g, Curry, Comino",
        calories:    340,
        schedule:    "23:00",
      },
    },

    Viernes: {
      Comida: {
        foods:       "Salteado de ternera con ensalada en vinagreta",
        ingredients: "Ternera magra: 200g, Tomate: 150g, Cebolleta: 90g, Pepinillos: 20g, Aceite: 15g, Vinagre",
        calories:    380,
        schedule:    "14:00",
      },
      "Merienda 1": {
        foods:       "Batido de proteína con leche desnatada",
        ingredients: "Proteína de suero 90%: 30g, Leche desnatada calcio UHT: 400g",
        calories:    230,
        schedule:    "19:00",
      },
      Cena: {
        foods:       "Kiwi y queso fresco batido",
        ingredients: "Queso fresco batido desnatado: 240g, Kiwi: 200g",
        calories:    190,
        schedule:    "23:00",
      },
    },

    Sábado: {
      Comida: {
        foods:       "Dorada con tomate, aguacate y nueces",
        ingredients: "Dorada: 470g, Aguacate: 125g, Tomate: 250g, Nueces: 25g, Aceite: 15g",
        calories:    540,
        schedule:    "14:00",
      },
      "Merienda 1": {
        foods:       "Batido de proteína con leche desnatada",
        ingredients: "Proteína de suero 90%: 30g, Leche desnatada calcio UHT: 400g",
        calories:    230,
        schedule:    "19:00",
      },
      Cena: {
        foods:       "Fajitas de maíz con pollo, lechuga y tomate",
        ingredients: "Harina de maíz: 40g, Clara de huevo: 70g, Pollo: 75g, Lechuga: 20g, Tomate: 50g, Aceite: 3g",
        calories:    290,
        schedule:    "23:00",
      },
    },

    Domingo: {
      Comida: {
        foods:       "Merluza con salteado de gulas y puerro",
        ingredients: "Merluza: 350g, Gulas: 100g, Puerro: 75g, Ajo: 10g, Aceite: 15g",
        calories:    430,
        schedule:    "14:00",
      },
      "Merienda 1": {
        foods:       "Batido de proteína con leche desnatada",
        ingredients: "Proteína de suero 90%: 30g, Leche desnatada calcio UHT: 400g",
        calories:    230,
        schedule:    "19:00",
      },
      Cena: {
        foods:       "Ensalada de tomate, cebolla, pimiento verde y atún",
        ingredients: "Tomate: 200g, Cebolla: 125g, Pimiento verde: 125g, Atún en agua: 110g, Aceite: 15g",
        calories:    280,
        schedule:    "23:00",
      },
    },
  },
};


// =============================================================================
// 3. FUNCIONES HELPER
// Pequeñas funciones utilitarias usadas en varios sitios
// =============================================================================

/**
 * Convierte un string "YYYY-MM-DD" a objeto Date.
 * Devuelve null si el string está vacío o es inválido.
 */
const toDate = (str) => {
  if (!str) return null;
  const d = new Date(str + "T00:00:00");
  return isNaN(d) ? null : d;
};

/**
 * Formatea un Date como "15 May 2026"
 */
const fmtDate = (d) =>
  d ? `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}` : "—";

/**
 * Formatea un string ISO datetime como "15 May · 10:00"
 */
const fmtDateTime = (str) => {
  if (!str) return "—";
  const d = new Date(str);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/**
 * Convierte el día de la semana de JS (0=domingo) al índice de nuestro array DAYS (0=lunes).
 * JS: 0=Dom, 1=Lun, 2=Mar... → Nosotros: 0=Lun, 1=Mar... 6=Dom
 */
const jsToMon = (jsDay) => (jsDay === 0 ? 6 : jsDay - 1);

/**
 * Genera una clave única para cada día de la semana actual.
 * Se usa para guardar datos del registro diario (agua, extras, etc.)
 * Ej: índice 0 (Lunes) → "2026-4-13" (año-mes-dia del lunes de esta semana)
 */
const dayKey = (idx) => {
  const now  = new Date();
  const diff = idx - jsToMon(now.getDay()); // diferencia en días respecto a hoy
  const d    = new Date(now);
  d.setDate(d.getDate() + diff);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};


// =============================================================================
// 4. COMPONENTE PRINCIPAL
// =============================================================================

export default function App() {

  // ---------------------------------------------------------------------------
  // 4a. ESTADO (useState)
  // Cada useState guarda una variable reactiva: cuando cambia, React re-renderiza
  // ---------------------------------------------------------------------------

  // Vista activa en la bottom nav: "today" | "nutricionista" | "calendar" | "diets" | "editDiet"
  const [view, setView] = useState("today");

  // Lista de dietas del usuario. Empieza con la dieta precargada del PDF
  const [diets, setDiets] = useState([PRELOADED_DIET]);

  // Dieta que se está editando en el formulario (null = no hay ninguna en edición)
  const [editingDiet, setEditingDiet] = useState(null);

  // Índice del día seleccionado en la vista "Hoy" (0=Lunes, 6=Domingo)
  const [todayDayIdx, setTodayDayIdx] = useState(jsToMon(new Date().getDay()));

  // Qué comidas están marcadas como completadas
  // Clave: "${dayKey}-${mealName}" → true/false
  const [checkedMeals, setCheckedMeals] = useState({});

  // Día seleccionado en el formulario de edición de dieta
  const [editDay, setEditDay] = useState("Lunes");

  // Comida que se está editando dentro del formulario de dieta (null = ninguna)
  const [editMeal, setEditMeal] = useState(null);

  // Datos del formulario de edición de una comida concreta
  const [mealForm, setMealForm] = useState({ foods: "", calories: "", ingredients: "", schedule: "" });

  // Mensaje de feedback temporal (aparece abajo y desaparece solo)
  const [toast, setToast] = useState(null);

  // Mes y año que se muestra en el calendario
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear,  setCalYear]  = useState(new Date().getFullYear());

  // Estado del importador de PDF
  const [importing,    setImporting]    = useState(false);
  const [importError,  setImportError]  = useState(null);

  // Qué comida está expandida para ver sus ingredientes
  const [expandedMeal, setExpandedMeal] = useState(null);

  // Referencia al input de tipo file (oculto) para el import de PDF
  const fileRef = useRef();

  // ---------------------------------------------------------------------------
  // REGISTRO DIARIO
  // Permite modificar comidas del plan para un día concreto o añadir extras
  //
  // Estructura: {
  //   [dayKey]: {
  //     overrides: { [mealName]: mealObj | null },  // null = comida eliminada ese día
  //     extras:    [ mealObj, mealObj, ... ]         // comidas añadidas fuera del plan
  //   }
  // }
  // ---------------------------------------------------------------------------
  const [dailyLog, setDailyLog] = useState({});

  // Modal para añadir/modificar comidas del registro diario
  // null = cerrado | { type: "override", meal: string } | { type: "extra" }
  const [logModal, setLogModal] = useState(null);

  // Formulario del modal de registro diario
  const [logForm, setLogForm] = useState({ foods: "", calories: "", ingredients: "" });

  // ---------------------------------------------------------------------------
  // AGUA
  // ---------------------------------------------------------------------------
  // Registro de agua por día: { [dayKey]: mililitros }
  const [waterLog,    setWaterLog]    = useState({});
  // Valor del input de cantidad personalizada de agua
  const [customWater, setCustomWater] = useState("");

  // ---------------------------------------------------------------------------
  // NUTRICIONISTA
  // Cada cita: { id, datetime (ISO string), weight (string kg), notes (string) }
  // ---------------------------------------------------------------------------
  const [appointments, setAppointments] = useState([
    { id: 1, datetime: "2026-05-11T10:00", weight: "", notes: "Primera consulta – Plan dietético" }
  ]);

  // Modal para crear nueva cita
  const [apptModal, setApptModal] = useState(false);
  const [apptForm,  setApptForm]  = useState({ datetime: "", weight: "", notes: "" });

  // Modal para registrar peso en una cita: null | id de la cita
  const [weightModal, setWeightModal] = useState(null);
  const [weightInput, setWeightInput] = useState("");


  // ---------------------------------------------------------------------------
  // 4b. LÓGICA DERIVADA
  // Valores calculados a partir del estado. No son useState porque se recalculan
  // automáticamente cada vez que cambia el estado del que dependen.
  // ---------------------------------------------------------------------------

  // Dieta activa (la que se muestra en "Hoy")
  const activeDiet = diets.find((d) => d.active) || diets[0];

  // Día de la semana seleccionado como string
  const todayDay = DAYS[todayDayIdx];

  // Clave única del día seleccionado (para buscar en dailyLog y waterLog)
  const currentDayKey = dayKey(todayDayIdx);

  // Registro del día actual (overrides + extras). Si no existe, estructura vacía.
  const log = dailyLog[currentDayKey] || { overrides: {}, extras: [] };

  // Agua bebida hoy en ml
  const waterMl  = waterLog[currentDayKey] || 0;
  // Porcentaje del objetivo (máximo 100% para la barra, pero mostramos el real)
  const waterPct = Math.min(100, (waterMl / WATER_GOAL) * 100);
  // ¿Ha superado el objetivo?
  const waterOver = waterMl > WATER_GOAL;

  // Comidas base del plan para el día seleccionado
  const baseMeals = activeDiet?.days?.[todayDay] || {};

  // Comidas efectivas = plan base + overrides del registro diario
  // Si override es null → la comida fue eliminada ese día
  // Si override es un objeto → se usa ese en lugar del plan
  const effectiveMeals = {};
  Object.keys(baseMeals).forEach((m) => {
    if (log.overrides[m] === null) return;           // eliminada ese día
    effectiveMeals[m] = log.overrides[m] || baseMeals[m]; // override o plan original
  });

  // Extras añadidos fuera del plan ese día
  const allExtras = log.extras || [];

  // Totales de calorías
  const planCalories  = Object.values(effectiveMeals).reduce((s, m) => s + (m.calories || 0), 0);
  const extraCalories = allExtras.reduce((s, m) => s + (m.calories || 0), 0);
  const totalCalories = planCalories + extraCalories;
  const planTarget    = Object.values(baseMeals).reduce((s, m) => s + (m.calories || 0), 0);
  const calDiff       = totalCalories - planTarget; // positivo = por encima del plan

  // Comidas del plan ordenadas por hora
  const allMealKeys = Object.keys(effectiveMeals).sort((a, b) =>
    (effectiveMeals[a].schedule || "00:00").localeCompare(effectiveMeals[b].schedule || "00:00")
  );

  // Progreso de comidas completadas (para el anillo circular)
  const totalItems  = allMealKeys.length + allExtras.length;
  const checkedCount = [
    ...allMealKeys.map(m => `${currentDayKey}-${m}`),
    ...allExtras.map((_, i) => `${currentDayKey}-extra-${i}`),
  ].filter(k => checkedMeals[k]).length;
  const progress = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

  // Próxima cita con el nutricionista (la más cercana en el futuro)
  const now           = new Date();
  const nextAppt      = appointments
    .filter(a => a.datetime && new Date(a.datetime) > now)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))[0];
  const nextApptDiff  = nextAppt
    ? Math.ceil((new Date(nextAppt.datetime) - now) / 86400000)
    : null;


  // ---------------------------------------------------------------------------
  // 4c. HANDLERS
  // Funciones que responden a acciones del usuario
  // ---------------------------------------------------------------------------

  /** Muestra un toast (mensaje temporal) durante 2.5 segundos */
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  /** Marca/desmarca una comida del plan como completada */
  const toggleMeal = (meal) =>
    setCheckedMeals((p) => ({ ...p, [`${currentDayKey}-${meal}`]: !p[`${currentDayKey}-${meal}`] }));

  // -- Agua --

  /** Añade ml al registro de agua del día actual */
  const addWater = (ml) =>
    setWaterLog(p => ({ ...p, [currentDayKey]: (p[currentDayKey] || 0) + ml }));

  /** Resetea el agua del día a 0 */
  const resetWater = () =>
    setWaterLog(p => ({ ...p, [currentDayKey]: 0 }));

  // -- Registro diario --

  /** Abre el modal para modificar una comida del plan ese día */
  const openOverride = (meal) => {
    const cur = effectiveMeals[meal] || baseMeals[meal];
    setLogForm({ foods: cur?.foods || "", calories: cur?.calories || "", ingredients: cur?.ingredients || "" });
    setLogModal({ type: "override", meal });
  };

  /** Abre el modal para añadir un extra (café, fruta, snack…) */
  const openExtra = () => {
    setLogForm({ foods: "", calories: "", ingredients: "" });
    setLogModal({ type: "extra" });
  };

  /** Guarda el dato del modal de registro diario */
  const saveLog = () => {
    if (!logForm.foods) return;
    const entry = { foods: logForm.foods, calories: Number(logForm.calories) || 0, ingredients: logForm.ingredients };
    setDailyLog((prev) => {
      const ex = prev[currentDayKey] || { overrides: {}, extras: [] };
      if (logModal.type === "override") {
        // Reemplaza esa comida con el override
        return { ...prev, [currentDayKey]: { ...ex, overrides: { ...ex.overrides, [logModal.meal]: entry } } };
      }
      // Añade a la lista de extras
      return { ...prev, [currentDayKey]: { ...ex, extras: [...ex.extras, entry] } };
    });
    setLogModal(null);
    showToast(logModal.type === "override" ? "Comida modificada ✓" : "Extra añadido ✓");
  };

  /** Elimina el override de una comida, volviendo al plan original */
  const removeOverride = (meal) => {
    setDailyLog((prev) => {
      const ex = prev[currentDayKey] || { overrides: {}, extras: [] };
      const { [meal]: _, ...rest } = ex.overrides; // elimina solo esa clave
      return { ...prev, [currentDayKey]: { ...ex, overrides: rest } };
    });
    showToast("Restaurado al plan original");
  };

  /** Elimina un extra del registro diario por su índice */
  const removeExtra = (idx) => {
    setDailyLog((prev) => {
      const ex = prev[currentDayKey] || { overrides: {}, extras: [] };
      return { ...prev, [currentDayKey]: { ...ex, extras: ex.extras.filter((_, i) => i !== idx) } };
    });
    showToast("Extra eliminado");
  };

  // -- Citas con el nutricionista --

  /** Guarda una nueva cita */
  const saveAppt = () => {
    if (!apptForm.datetime) return;
    const newA = { id: Date.now(), ...apptForm };
    setAppointments(p => [...p, newA].sort((a, b) => new Date(a.datetime) - new Date(b.datetime)));
    setApptModal(false);
    setApptForm({ datetime: "", weight: "", notes: "" });
    showToast("Consulta añadida ✓");
  };

  /** Guarda el peso en una cita existente */
  const saveWeight = () => {
    if (!weightInput) return;
    setAppointments(p => p.map(a => a.id === weightModal ? { ...a, weight: weightInput } : a));
    setWeightModal(null);
    setWeightInput("");
    showToast("Peso registrado ✓");
  };

  /** Elimina una cita por su id */
  const deleteAppt = (id) => {
    setAppointments(p => p.filter(a => a.id !== id));
    showToast("Consulta eliminada");
  };

  // -- Edición de dietas --

  /** Abre el formulario de edición con una copia profunda de la dieta */
  const startEditDiet = (diet) => {
    setEditingDiet(JSON.parse(JSON.stringify(diet))); // deep clone para no mutar el original
    setEditDay("Lunes");
    setView("editDiet");
  };

  /** Guarda una comida dentro del formulario de edición de dieta */
  const saveMealToEditing = () => {
    if (!mealForm.foods) return;
    setEditingDiet((prev) => {
      const d = { ...prev };
      if (!d.days[editDay]) d.days[editDay] = {};
      d.days[editDay][editMeal] = {
        foods:       mealForm.foods,
        calories:    Number(mealForm.calories) || 0,
        ingredients: mealForm.ingredients,
        schedule:    mealForm.schedule,
      };
      return d;
    });
    setEditMeal(null);
    setMealForm({ foods: "", calories: "", ingredients: "", schedule: "" });
    showToast("Guardado ✓");
  };

  /** Guarda la dieta completa (nueva o editada) */
  const saveEditingDiet = () => {
    if (editingDiet.id) {
      // Actualiza la dieta existente
      setDiets((prev) => prev.map((d) => (d.id === editingDiet.id ? editingDiet : d)));
    } else {
      // Crea una nueva dieta con ID único basado en timestamp
      setDiets((prev) => [...prev, { ...editingDiet, id: Date.now(), active: false }]);
    }
    setView("diets");
    showToast("Dieta guardada ✓");
  };

  /** Marca una dieta como activa (desactiva el resto) */
  const setActiveDiet = (id) => {
    setDiets((prev) => prev.map((d) => ({ ...d, active: d.id === id })));
    showToast("Dieta activa ✓");
  };

  /** Elimina una dieta por su id */
  const deleteDiet = (id) => {
    setDiets((prev) => prev.filter((d) => d.id !== id));
    showToast("Dieta eliminada");
  };

  // -- Import PDF --

  /**
   * Lee un PDF del nutricionista y usa la API de Claude para extraer
   * los datos del plan dietético automáticamente.
   * El PDF se convierte a base64 y se manda a la API como documento.
   */
  const handlePDFImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportError(null);

    try {
      // Convierte el archivo PDF a base64 para mandarlo a la API
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload  = () => res(reader.result.split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

      // Llama a la API de Claude para extraer la dieta del PDF
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{
            role:    "user",
            content: [
              // El PDF como documento
              { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
              // La instrucción de extracción
              {
                type: "text",
                text: `Extrae el plan dietético del PDF en JSON estricto. Solo JSON sin texto extra ni backticks.
Estructura exacta:
{
  "name": "nombre del plan",
  "startDate": "YYYY-MM-DD o vacío",
  "endDate": "",
  "days": {
    "Lunes": {
      "NombreComida": {
        "foods": "nombre del plato",
        "ingredients": "ingredientes con cantidades separados por coma",
        "calories": número,
        "schedule": "HH:MM"
      }
    }
  }
}
Mapeo de días: Día 1=Lunes, Día 2=Martes, ..., Día 7=Domingo.
Nombres de comida: "Desayuno", "Media mañana", "Comida", "Merienda 1", "Cena", "Recena".
Estima las calorías si no aparecen explícitamente.`,
              },
            ],
          }],
        }),
      });

      const data   = await response.json();
      const text   = data.content?.map(i => i.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

      // Añade la nueva dieta importada a la lista (inactiva por defecto)
      setDiets(prev => [...prev, { ...parsed, id: Date.now(), active: false }]);
      showToast("✅ Dieta importada correctamente");

    } catch (err) {
      setImportError("Error procesando el PDF. Inténtalo de nuevo.");
    } finally {
      setImporting(false);
      e.target.value = ""; // resetea el input para permitir reimportar el mismo archivo
    }
  };


  // ---------------------------------------------------------------------------
  // 4d. HELPERS DE CALENDARIO
  // ---------------------------------------------------------------------------

  /**
   * Genera el array de celdas del calendario para un mes/año.
   * Devuelve null para las celdas vacías al principio (antes del día 1)
   * y números del 1 al último día del mes.
   */
  const buildCalendar = (year, month) => {
    const first      = new Date(year, month, 1);
    const startOffset = jsToMon(first.getDay()); // cuántos huecos vacíos al inicio
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array(startOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  };

  /**
   * Devuelve el "estado" de un día del calendario para pintarlo correctamente.
   * Posibles valores:
   *   "active-start" / "other-start" → primer día de una dieta
   *   "active-end"   / "other-end"   → último día de una dieta
   *   "active-range" / "other-range" → dentro del rango de una dieta
   *   "appt"                         → hay una consulta con el nutricionista
   *   "today"                        → es hoy
   *   null                           → día normal
   */
  const getDayStatus = (year, month, day) => {
    const date      = new Date(year, month, day);
    const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
    const isToday   = date.getTime() === todayDate.getTime();

    let result = isToday ? "today" : null;

    // Comprueba si el día cae dentro del rango de alguna dieta
    diets.forEach((diet) => {
      const s = toDate(diet.startDate);
      const e = toDate(diet.endDate);
      if (!s) return;
      const prefix = diet.active ? "active" : "other";
      if (date.getTime() === s.getTime())                    result = `${prefix}-start`;
      else if (e && date.getTime() === e.getTime())          result = `${prefix}-end`;
      else if (e && date > s && date < e)                    result = `${prefix}-range`;
    });

    // Comprueba si hay una consulta ese día
    appointments.forEach(a => {
      const apptDate = toDate(a.datetime?.slice(0, 10));
      if (apptDate && apptDate.getTime() === date.getTime()) {
        result = result === "today" ? "today-appt" : "appt";
      }
    });

    return result;
  };

  const cells = buildCalendar(calYear, calMonth);


  // ---------------------------------------------------------------------------
  // 4e. RENDER
  // Lo que React pinta en pantalla. Devuelve JSX.
  // ---------------------------------------------------------------------------

  return (
    <div style={S.phone}>

      {/* ── CSS global y animaciones ────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@300;600;900&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        /* Clase para el efecto "press" en botones táctiles */
        .bp:active { transform: scale(0.95); opacity: 0.8; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px);  } to { opacity:1; transform:translateY(0);  } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0);  } }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes modalIn { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0);  } }
        @keyframes spin    { to   { transform: rotate(360deg); } }
        .fi { animation: fadeIn  0.3s  ease both; }
        .su { animation: slideUp 0.38s cubic-bezier(0.16,1,0.3,1) both; }
        .sp { animation: spin    1s    linear infinite; }
      `}</style>

      {/* Barra de estado (simulada) */}
      <div style={S.statusBar}><span>9:41</span><span>●●● 🔋</span></div>

      {/* Toast de feedback (aparece y desaparece solo) */}
      {toast && <div style={S.toast}>{toast}</div>}


      {/* ── MODALES (se renderizan encima de todo) ──────────────────────── */}

      {/* Modal de registro diario / citas / peso */}
      {(logModal || apptModal || weightModal) && (
        <div style={S.modalOverlay} onClick={() => { setLogModal(null); setApptModal(false); setWeightModal(null); }}>
          <div style={S.modal} onClick={e => e.stopPropagation()} className="su">

            {/* -- Modal: añadir/modificar comida -- */}
            {logModal && (
              <>
                <p style={S.modalTitle}>
                  {logModal.type === "extra" ? "➕ Añadir extra" : `✏️ Modificar ${logModal.meal}`}
                </p>
                <p style={S.modalSub}>
                  {logModal.type === "extra"
                    ? "Café, fruta, snack o cualquier cosa fuera del plan"
                    : "Cambia este plato por lo que realmente has comido hoy"}
                </p>
                <label style={S.label}>¿Qué comiste?</label>
                <input style={S.input} placeholder="Ej: Café solo, Plátano…"
                  value={logForm.foods} onChange={e => setLogForm(p => ({ ...p, foods: e.target.value }))} autoFocus />
                <label style={{ ...S.label, marginTop: 10 }}>Ingredientes / detalle (opcional)</label>
                <input style={S.input} placeholder="Ej: Café: 1 taza, Azúcar: 5g"
                  value={logForm.ingredients} onChange={e => setLogForm(p => ({ ...p, ingredients: e.target.value }))} />
                <label style={{ ...S.label, marginTop: 10 }}>Calorías estimadas (kcal)</label>
                <input type="number" style={S.input} placeholder="Ej: 80"
                  value={logForm.calories} onChange={e => setLogForm(p => ({ ...p, calories: e.target.value }))} />
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button className="bp" onClick={() => setLogModal(null)} style={{ ...S.modalCancelBtn, flex: 1 }}>Cancelar</button>
                  <button className="bp" onClick={saveLog} disabled={!logForm.foods}
                    style={{ ...S.modalSaveBtn, flex: 2, opacity: logForm.foods ? 1 : 0.4 }}>Guardar</button>
                </div>
              </>
            )}

            {/* -- Modal: nueva consulta nutricionista -- */}
            {apptModal && (
              <>
                <p style={S.modalTitle}>🩺 Nueva consulta</p>
                <p style={S.modalSub}>Añade la fecha y hora de tu próxima visita</p>
                <label style={S.label}>Fecha y hora</label>
                <input type="datetime-local" style={S.input}
                  value={apptForm.datetime} onChange={e => setApptForm(p => ({ ...p, datetime: e.target.value }))} />
                <label style={{ ...S.label, marginTop: 10 }}>Peso en esa consulta (kg) — opcional</label>
                <input type="number" step="0.1" style={S.input} placeholder="Ej: 78.5"
                  value={apptForm.weight} onChange={e => setApptForm(p => ({ ...p, weight: e.target.value }))} />
                <label style={{ ...S.label, marginTop: 10 }}>Notas (opcional)</label>
                <input style={S.input} placeholder="Ej: Revisión mensual"
                  value={apptForm.notes} onChange={e => setApptForm(p => ({ ...p, notes: e.target.value }))} />
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button className="bp" onClick={() => setApptModal(false)} style={{ ...S.modalCancelBtn, flex: 1 }}>Cancelar</button>
                  <button className="bp" onClick={saveAppt} disabled={!apptForm.datetime}
                    style={{ ...S.modalSaveBtn, flex: 2, opacity: apptForm.datetime ? 1 : 0.4 }}>Guardar</button>
                </div>
              </>
            )}

            {/* -- Modal: registrar peso en una consulta -- */}
            {weightModal && (
              <>
                <p style={S.modalTitle}>⚖️ Registrar peso</p>
                <p style={S.modalSub}>¿Cuánto pesaste en esta consulta?</p>
                <label style={S.label}>Peso (kg)</label>
                <input type="number" step="0.1" style={S.input} placeholder="Ej: 78.3"
                  value={weightInput} onChange={e => setWeightInput(e.target.value)} autoFocus />
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button className="bp" onClick={() => setWeightModal(null)} style={{ ...S.modalCancelBtn, flex: 1 }}>Cancelar</button>
                  <button className="bp" onClick={saveWeight} disabled={!weightInput}
                    style={{ ...S.modalSaveBtn, flex: 2, opacity: weightInput ? 1 : 0.4 }}>Guardar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}


      {/* ── CONTENIDO PRINCIPAL ─────────────────────────────────────────── */}
      <div style={S.content}>


        {/* ════════════════════════════════════════════════════════════════
            VISTA: HOY
            Muestra las comidas del día seleccionado con su progreso,
            calorías, registro de agua y opción de añadir extras.
        ════════════════════════════════════════════════════════════════ */}
        {view === "today" && (
          <div className="fi" style={{ paddingBottom: 90 }}>

            {/* Cabecera con saludo y nombre de la dieta activa */}
            <div style={S.todayHeader}>
              <div>
                <p style={S.greeting}>Hola, Joaquín 👋</p>
                <h1 style={S.todayTitle}>Hoy, {todayDay}</h1>
              </div>
              <div style={S.dietBadge}>{activeDiet?.name?.split("–")[0]?.trim() || "Sin dieta"}</div>
            </div>

            {/* Banner de próxima consulta (solo si hay una en el futuro) */}
            {nextAppt && (
              <div style={S.apptBanner} className="bp" onClick={() => setView("nutricionista")}>
                <span style={{ fontSize: 18 }}>🩺</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 13, fontWeight: 600 }}>Próxima consulta</p>
                  <p style={{ fontFamily: "'DM Sans'", color: "#c8a97e", fontSize: 12, marginTop: 1 }}>{fmtDateTime(nextAppt.datetime)}</p>
                </div>
                <span style={{ fontFamily: "'DM Sans'", color: "#888", fontSize: 11 }}>
                  {nextApptDiff === 0 ? "Hoy" : nextApptDiff === 1 ? "Mañana" : `${nextApptDiff}d`} →
                </span>
              </div>
            )}

            {/* Selector de día de la semana (scroll horizontal) */}
            <div style={S.dayScroll}>
              {DAYS.map((d, i) => (
                <button key={d} className="bp" onClick={() => setTodayDayIdx(i)} style={{
                  ...S.dayChip,
                  background: i === todayDayIdx ? "#1a1a2e" : "rgba(255,255,255,0.07)",
                  color:      i === todayDayIdx ? "#f0e6d3" : "#888",
                  fontWeight: i === todayDayIdx ? 600 : 400,
                  border:     i === todayDayIdx ? "1px solid rgba(200,169,126,0.4)" : "1px solid transparent",
                }}>{d.slice(0, 3)}</button>
              ))}
            </div>

            {/* Tarjeta de progreso: anillo SVG + stats de calorías */}
            <div style={S.progressCard}>
              {/* Anillo circular SVG */}
              <svg width="78" height="78" viewBox="0 0 78 78">
                {/* Pista de fondo */}
                <circle cx="39" cy="39" r="32" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
                {/* Arco de progreso — cambia de color si se superan las calorías */}
                <circle cx="39" cy="39" r="32" fill="none"
                  stroke={calDiff > 150 ? "#e07060" : "#c8a97e"} strokeWidth="7"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - progress / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 39 39)"
                  style={{ transition: "stroke-dashoffset 0.6s ease" }} />
                {/* Porcentaje en el centro */}
                <text x="39" y="43" textAnchor="middle" fill="#f0e6d3" fontSize="15" fontFamily="Fraunces" fontWeight="600">
                  {Math.round(progress)}%
                </text>
              </svg>

              {/* Stats de calorías */}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "Fraunces", fontSize: 26, color: "#f0e6d3", fontWeight: 600 }}>
                  {totalCalories} <span style={{ fontSize: 13, color: "#c8a97e" }}>kcal</span>
                </p>
                <p style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#888", marginTop: 2 }}>Plan: {planTarget} kcal</p>
                {/* Extras añadidos */}
                {extraCalories > 0 && (
                  <p style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#c8a97e", marginTop: 2 }}>+ {extraCalories} kcal extras</p>
                )}
                {/* Diferencia vs plan (positivo = por encima, negativo = por debajo) */}
                {calDiff !== 0 && (
                  <p style={{ fontFamily: "'DM Sans'", fontSize: 11, color: calDiff > 0 ? "#e07060" : "#7ec8a0", fontWeight: 600, marginTop: 3 }}>
                    {calDiff > 0 ? `▲ +${calDiff}` : `▼ ${calDiff}`} kcal vs plan
                  </p>
                )}
                {/* Días restantes de dieta */}
                {activeDiet?.endDate && (() => {
                  const end  = toDate(activeDiet.endDate);
                  if (!end) return null;
                  const td   = new Date(); td.setHours(0, 0, 0, 0);
                  const diff = Math.ceil((end - td) / 86400000);
                  return (
                    <p style={{ fontFamily: "'DM Sans'", fontSize: 11, color: diff >= 0 ? "#c8a97e" : "#666", marginTop: 3 }}>
                      {diff > 0 ? `⏳ ${diff}d restantes` : diff === 0 ? "⚡ Último día" : "✅ Finalizada"}
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Estado vacío */}
            {allMealKeys.length === 0 && allExtras.length === 0 && (
              <div style={S.emptyState}>
                <p style={{ fontSize: 34 }}>🥗</p>
                <p style={{ fontFamily: "Fraunces", color: "#666", marginTop: 8 }}>Sin comidas para este día</p>
              </div>
            )}

            {/* Lista de comidas del plan */}
            {allMealKeys.map((meal, i) => {
              const data    = effectiveMeals[meal];
              const isOvr   = !!log.overrides[meal];   // ¿tiene override hoy?
              const done    = checkedMeals[`${currentDayKey}-${meal}`];
              const isExp   = expandedMeal === `${currentDayKey}-${meal}`;
              return (
                <div key={meal} style={{ margin: "0 20px 10px", animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>

                  {/* Tarjeta de comida */}
                  <div className="bp"
                    onClick={() => setExpandedMeal(isExp ? null : `${currentDayKey}-${meal}`)}
                    style={{ ...S.mealCard, opacity: done ? 0.5 : 1, borderColor: isOvr ? "rgba(200,169,126,0.3)" : "rgba(255,255,255,0.05)" }}>
                    <div style={S.mealLeft}>
                      <span style={{ fontSize: 19 }}>{MEAL_ICONS[meal] || "🍴"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <p style={S.mealName}>{meal}</p>
                          {data.schedule && <span style={{ fontSize: 10, color: "#555" }}>{data.schedule}</span>}
                          {/* Badge "modificado" si hay override */}
                          {isOvr && <span style={{ fontSize: 9, color: "#c8a97e", background: "rgba(200,169,126,0.12)", padding: "1px 6px", borderRadius: 50 }}>mod.</span>}
                        </div>
                        <p style={S.mealFoods}>{data.foods}</p>
                      </div>
                    </div>
                    {/* Calorías + botón de completar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ textAlign: "right" }}>
                        <p style={S.mealCal}>{data.calories}</p>
                        <p style={{ fontFamily: "'DM Sans'", fontSize: 10, color: "#666" }}>kcal</p>
                      </div>
                      <div className="bp"
                        onClick={e => { e.stopPropagation(); toggleMeal(meal); }}
                        style={{ ...S.check, background: done ? "#c8a97e" : "transparent", borderColor: done ? "#c8a97e" : "#444" }}>
                        {done && <span style={{ color: "#1a1a2e", fontSize: 11, fontWeight: 700 }}>✓</span>}
                      </div>
                    </div>
                  </div>

                  {/* Detalle expandido (ingredientes + botón de modificar) */}
                  {isExp && (
                    <div className="su" style={S.mealDetail}>
                      {data.ingredients && (
                        <>
                          <p style={S.detailLabel}>🧾 Ingredientes</p>
                          {data.ingredients.split(",").map((g, j) => (
                            <p key={j} style={S.detailIng}>• {g.trim()}</p>
                          ))}
                        </>
                      )}
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <button className="bp" onClick={() => openOverride(meal)} style={S.detailBtn}>✏️ Cambiar hoy</button>
                        {isOvr && (
                          <button className="bp" onClick={() => removeOverride(meal)} style={{ ...S.detailBtn, color: "#888" }}>↩ Restaurar</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Lista de extras del día */}
            {allExtras.map((extra, idx) => {
              const k    = `${currentDayKey}-extra-${idx}`;
              const done = checkedMeals[k];
              return (
                <div key={`ex-${idx}`} style={{ margin: "0 20px 10px" }}>
                  <div style={{ ...S.mealCard, border: "1px solid rgba(126,200,160,0.2)", opacity: done ? 0.5 : 1 }}>
                    <div style={S.mealLeft}>
                      <span style={{ fontSize: 19 }}>➕</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <p style={S.mealName}>Extra</p>
                          <span style={{ fontSize: 9, color: "#7ec8a0", background: "rgba(126,200,160,0.12)", padding: "1px 6px", borderRadius: 50 }}>añadido</span>
                        </div>
                        <p style={S.mealFoods}>{extra.foods}</p>
                        {extra.ingredients && <p style={{ fontFamily: "'DM Sans'", color: "#555", fontSize: 11, marginTop: 2 }}>{extra.ingredients}</p>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ ...S.mealCal, color: "#7ec8a0" }}>{extra.calories}</p>
                        <p style={{ fontFamily: "'DM Sans'", fontSize: 10, color: "#666" }}>kcal</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div className="bp" onClick={() => setCheckedMeals(p => ({ ...p, [k]: !p[k] }))}
                          style={{ ...S.check, background: done ? "#7ec8a0" : "transparent", borderColor: done ? "#7ec8a0" : "#444" }}>
                          {done && <span style={{ color: "#1a1a2e", fontSize: 11, fontWeight: 700 }}>✓</span>}
                        </div>
                        <button className="bp" onClick={() => removeExtra(idx)}
                          style={{ background: "none", border: "none", color: "#555", fontSize: 13, cursor: "pointer", padding: 0 }}>✕</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Botón añadir extra */}
            <div style={{ padding: "4px 20px 0" }}>
              <button className="bp" onClick={openExtra} style={S.addExtraBtn}>
                ➕ Añadir extra (café, fruta, snack…)
              </button>
            </div>

            {/* ── REGISTRO DE AGUA ────────────────────────────────────── */}
            <div style={S.waterCard}>
              {/* Cabecera con total */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>💧</span>
                  <p style={{ fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 16, fontWeight: 600 }}>Agua del día</p>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: "Fraunces", color: waterOver ? "#7ec8a0" : waterPct >= 100 ? "#7ec8a0" : "#68b4d4", fontSize: 20, fontWeight: 600 }}>
                    {waterMl}
                  </span>
                  <span style={{ fontFamily: "'DM Sans'", color: "#666", fontSize: 11 }}>/ {WATER_GOAL} ml</span>
                  {/* Muestra el extra si se superó el objetivo */}
                  {waterOver && (
                    <span style={{ fontFamily: "'DM Sans'", color: "#7ec8a0", fontSize: 11 }}>+{waterMl - WATER_GOAL}ml</span>
                  )}
                </div>
              </div>

              {/* Barra de progreso */}
              <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 50, height: 8, marginBottom: 14, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 50,
                  background: waterPct >= 100 ? "#7ec8a0" : "linear-gradient(90deg, #4a9ebb, #68d4c8)",
                  width: `${waterPct}%`,
                  transition: "width 0.4s ease",
                }} />
              </div>

              {/* Botones de acceso rápido */}
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {WATER_STEPS.map(ml => (
                  <button key={ml} className="bp" onClick={() => addWater(ml)} style={S.waterBtn}>
                    +{ml < 1000 ? ml : `${ml / 1000}L`}
                  </button>
                ))}
              </div>

              {/* Input de cantidad personalizada */}
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" style={{ ...S.input, flex: 1, padding: "9px 12px", fontSize: 13 }}
                  placeholder="Cantidad personalizada (ml)"
                  value={customWater} onChange={e => setCustomWater(e.target.value)} />
                <button className="bp"
                  onClick={() => { if (customWater) { addWater(Number(customWater)); setCustomWater(""); } }}
                  style={{ background: "rgba(104,180,212,0.15)", color: "#68b4d4", border: "1px solid rgba(104,180,212,0.3)", borderRadius: 12, padding: "9px 16px", fontFamily: "'DM Sans'", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Añadir
                </button>
              </div>

              {/* Botón de resetear */}
              {waterMl > 0 && (
                <button className="bp" onClick={resetWater}
                  style={{ background: "none", border: "none", color: "#555", fontFamily: "'DM Sans'", fontSize: 11, cursor: "pointer", marginTop: 8 }}>
                  ↺ Reiniciar
                </button>
              )}

              {/* Mensaje de objetivo alcanzado */}
              {waterPct >= 100 && (
                <p style={{ fontFamily: "'DM Sans'", fontSize: 12, color: "#7ec8a0", marginTop: 8 }}>
                  {waterOver ? `🚀 ¡Súper hidratado! ${waterMl}ml bebidos` : "🎉 ¡Objetivo de 3L alcanzado!"}
                </p>
              )}
            </div>
          </div>
        )}


        {/* ════════════════════════════════════════════════════════════════
            VISTA: NUTRICIONISTA
            Gestión de citas y seguimiento del peso
        ════════════════════════════════════════════════════════════════ */}
        {view === "nutricionista" && (
          <div className="fi" style={{ paddingBottom: 90 }}>
            <div style={S.pageHeader}>
              <h1 style={S.pageTitle}>Nutricionista</h1>
              <button className="bp"
                onClick={() => { setApptForm({ datetime: "", weight: "", notes: "" }); setApptModal(true); }}
                style={S.addBtn}>+ Consulta</button>
            </div>

            {/* Gráfica de evolución del peso (solo si hay ≥2 pesos registrados) */}
            {appointments.filter(a => a.weight).length >= 2 && (
              <div style={S.weightCard}>
                <p style={{ fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 15, fontWeight: 600, marginBottom: 12 }}>⚖️ Evolución del peso</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
                  {appointments.filter(a => a.weight).map((a, i, arr) => {
                    const vals = arr.map(x => parseFloat(x.weight));
                    const min  = Math.min(...vals) - 1;
                    const max  = Math.max(...vals) + 1;
                    const pct  = ((parseFloat(a.weight) - min) / (max - min)) * 100;
                    const diff = i > 0 ? (parseFloat(a.weight) - parseFloat(arr[i - 1].weight)).toFixed(1) : null;
                    return (
                      <div key={a.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        {/* Diferencia con la consulta anterior */}
                        <span style={{ fontFamily: "'DM Sans'", fontSize: 9, color: diff < 0 ? "#7ec8a0" : diff > 0 ? "#e07060" : "#888" }}>
                          {diff !== null ? (diff > 0 ? `+${diff}` : diff) : ""}
                        </span>
                        {/* Barra */}
                        <div style={{ width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                          <div style={{ width: 28, background: "rgba(200,169,126,0.25)", borderRadius: "4px 4px 0 0", height: `${Math.max(8, pct * 0.5)}px`, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 3 }}>
                            <span style={{ fontFamily: "Fraunces", color: "#c8a97e", fontSize: 9, fontWeight: 600 }}>{a.weight}</span>
                          </div>
                        </div>
                        {/* Fecha abreviada */}
                        <span style={{ fontFamily: "'DM Sans'", fontSize: 8, color: "#555" }}>
                          {fmtDate(toDate(a.datetime?.slice(0, 10))).slice(0, 6)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Estado vacío */}
            {appointments.length === 0 && (
              <div style={S.emptyState}>
                <p style={{ fontSize: 34 }}>🩺</p>
                <p style={{ fontFamily: "Fraunces", color: "#666", marginTop: 8 }}>Sin consultas registradas</p>
              </div>
            )}

            {/* Lista de consultas (las más recientes primero) */}
            {appointments.slice().reverse().map((appt, i) => {
              const isPast = appt.datetime && new Date(appt.datetime) < now;
              const isNext = nextAppt?.id === appt.id;
              return (
                <div key={appt.id} className="fi"
                  style={{ ...S.dietCard, animationDelay: `${i * 0.05}s`, borderColor: isNext ? "rgba(200,169,126,0.3)" : "rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      {/* Fecha + badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 20 }}>{isPast ? "✅" : "🗓"}</span>
                        <p style={{ fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 15, fontWeight: 600 }}>
                          {fmtDateTime(appt.datetime)}
                        </p>
                        {isNext && <span style={S.activePill}>Próxima</span>}
                      </div>
                      {/* Notas */}
                      {appt.notes && (
                        <p style={{ fontFamily: "'DM Sans'", color: "#888", fontSize: 12, marginLeft: 28 }}>{appt.notes}</p>
                      )}
                      {/* Peso registrado o botón para añadirlo */}
                      <div style={{ marginLeft: 28, marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                        {appt.weight ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ background: "rgba(200,169,126,0.1)", borderRadius: 10, padding: "6px 12px", border: "1px solid rgba(200,169,126,0.2)" }}>
                              <p style={{ fontFamily: "Fraunces", color: "#c8a97e", fontSize: 18, fontWeight: 600 }}>
                                {appt.weight} <span style={{ fontSize: 11 }}>kg</span>
                              </p>
                            </div>
                            <button className="bp"
                              onClick={() => { setWeightModal(appt.id); setWeightInput(appt.weight); }}
                              style={{ ...S.detailBtn, fontSize: 11 }}>✏️</button>
                          </div>
                        ) : (
                          <button className="bp"
                            onClick={() => { setWeightModal(appt.id); setWeightInput(""); }}
                            style={S.detailBtn}>⚖️ Añadir peso</button>
                        )}
                      </div>
                    </div>
                    {/* Botón eliminar */}
                    <button className="bp" onClick={() => deleteAppt(appt.id)}
                      style={{ background: "none", border: "none", color: "#444", fontSize: 16, cursor: "pointer" }}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}


        {/* ════════════════════════════════════════════════════════════════
            VISTA: CALENDARIO
            Muestra el rango de las dietas y las citas del nutricionista
        ════════════════════════════════════════════════════════════════ */}
        {view === "calendar" && (
          <div className="fi" style={{ paddingBottom: 90 }}>
            <div style={S.pageHeader}><h1 style={S.pageTitle}>Calendario</h1></div>

            {/* Navegación de mes */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 18px" }}>
              <button className="bp" onClick={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                else setCalMonth(m => m - 1);
              }} style={S.monthNavBtn}>‹</button>
              <p style={{ fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 18, fontWeight: 600 }}>
                {MONTH_NAMES[calMonth]} {calYear}
              </p>
              <button className="bp" onClick={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                else setCalMonth(m => m + 1);
              }} style={S.monthNavBtn}>›</button>
            </div>

            {/* Cabecera de días */}
            <div style={S.calGrid}>
              {DAY_LABELS.map(l => (
                <div key={l} style={{ textAlign: "center", fontFamily: "'DM Sans'", fontSize: 11, color: "#555", fontWeight: 600, paddingBottom: 8 }}>{l}</div>
              ))}
            </div>

            {/* Celdas del calendario */}
            <div style={S.calGrid}>
              {cells.map((day, idx) => {
                if (!day) return <div key={`e-${idx}`} style={{ height: 40 }} />;

                const st      = getDayStatus(calYear, calMonth, day);
                const isStart = st === "active-start" || st === "other-start";
                const isEnd   = st === "active-end"   || st === "other-end";
                const inRange = st === "active-range"  || st === "other-range";
                const isAct   = st?.startsWith("active");
                const isToday = st === "today" || st === "today-appt";
                const isAppt  = st === "appt"  || st === "today-appt";

                // Color según si es la dieta activa o una inactiva
                const rangeColor = isAct ? "rgba(200,169,126,0.2)" : "rgba(130,130,200,0.15)";
                const dotColor   = isAct ? "#c8a97e" : "#9090cc";

                return (
                  <div key={`d-${day}`} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 40 }}>
                    {/* Franja de rango */}
                    {inRange && <div style={{ position: "absolute", top: "22%", bottom: "22%", left: -1, right: -1,   background: rangeColor, zIndex: 0 }} />}
                    {isStart  && <div style={{ position: "absolute", top: "22%", bottom: "22%", left: "50%", right: -1, background: rangeColor, zIndex: 0 }} />}
                    {isEnd    && <div style={{ position: "absolute", top: "22%", bottom: "22%", left: -1, right: "50%", background: rangeColor, zIndex: 0 }} />}
                    {/* Círculo del día */}
                    <div style={{
                      position: "relative", zIndex: 1,
                      width: 30, height: 30, borderRadius: "50%",
                      background: (isStart || isEnd) ? dotColor : isToday ? "rgba(200,169,126,0.18)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: isToday && !isStart && !isEnd ? "1.5px solid #c8a97e" : "none",
                    }}>
                      <span style={{
                        fontFamily: (isStart || isEnd) ? "Fraunces" : "'DM Sans'",
                        fontSize: 12,
                        fontWeight: (isStart || isEnd || isToday) ? 700 : 400,
                        color: (isStart || isEnd) ? "#1a1a2e" : inRange ? dotColor : isToday ? "#c8a97e" : "#bbb",
                      }}>{day}</span>
                    </div>
                    {/* Punto morado para citas */}
                    {isAppt && <div style={{ position: "absolute", bottom: 3, width: 4, height: 4, borderRadius: "50%", background: "#9090cc", zIndex: 2 }} />}
                  </div>
                );
              })}
            </div>

            {/* Leyenda */}
            <div style={{ padding: "16px 20px 0", display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#c8a97e" }} />
                <span style={{ fontFamily: "'DM Sans'", color: "#888", fontSize: 11 }}>Dieta activa</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#9090cc" }} />
                <span style={{ fontFamily: "'DM Sans'", color: "#888", fontSize: 11 }}>Consulta</span>
              </div>
            </div>

            {/* Resumen de dietas */}
            <div style={{ padding: "14px 20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
              {diets.map(diet => {
                const s = toDate(diet.startDate);
                const e = toDate(diet.endDate);
                return (
                  <div key={diet.id} style={S.legendCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: diet.active ? "#c8a97e" : "#9090cc" }} />
                        <span style={{ fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 13 }}>{diet.name}</span>
                      </div>
                      {diet.active && <span style={S.activePill}>Activa</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <span style={S.dateTag}>📅 {s ? fmtDate(s) : "Sin inicio"}</span>
                      {e && <><span style={{ color: "#555", fontSize: 12 }}>→</span><span style={S.dateTag}>🏁 {fmtDate(e)}</span></>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* ════════════════════════════════════════════════════════════════
            VISTA: DIETAS
            Lista de dietas + importador de PDF
        ════════════════════════════════════════════════════════════════ */}
        {view === "diets" && (
          <div className="fi" style={{ paddingBottom: 90 }}>
            <div style={S.pageHeader}>
              <h1 style={S.pageTitle}>Mis Dietas</h1>
              <button className="bp"
                onClick={() => { setEditingDiet({ id: null, name: "", startDate: "", endDate: "", days: {} }); setView("editDiet"); }}
                style={S.addBtn}>+ Nueva</button>
            </div>

            {/* Importador de PDF */}
            <div style={S.importCard}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>📄</span>
                <div>
                  <p style={{ fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 14, fontWeight: 600 }}>Importar desde PDF</p>
                  <p style={{ fontFamily: "'DM Sans'", color: "#888", fontSize: 11, marginTop: 2 }}>
                    Sube el PDF de tu nutricionista y lo leemos automáticamente
                  </p>
                </div>
              </div>
              {/* Input oculto — se activa con el botón de abajo */}
              <input type="file" accept=".pdf" ref={fileRef} style={{ display: "none" }} onChange={handlePDFImport} />
              <button className="bp" onClick={() => fileRef.current?.click()} disabled={importing} style={S.importBtn}>
                {importing
                  ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="sp" style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #1a1a2e", borderTopColor: "transparent", borderRadius: "50%" }} />
                      Procesando…
                    </span>
                  : "📤 Subir PDF de dieta"
                }
              </button>
              {importError && <p style={{ fontFamily: "'DM Sans'", color: "#c0504d", fontSize: 12, marginTop: 8 }}>{importError}</p>}
            </div>

            {/* Lista de dietas */}
            {diets.map((diet, i) => {
              const s  = toDate(diet.startDate);
              const e  = toDate(diet.endDate);
              const td = new Date(); td.setHours(0, 0, 0, 0);
              const dl = e ? Math.ceil((e - td) / 86400000) : null;
              return (
                <div key={diet.id} className="fi" style={{ ...S.dietCard, animationDelay: `${i * 0.06}s` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <h2 style={S.dietName}>{diet.name}</h2>
                      <div style={{ display: "flex", gap: 8, marginTop: 7, flexWrap: "wrap" }}>
                        <span style={S.dateTag}>📅 {s ? fmtDate(s) : "—"}</span>
                        {e && <span style={S.dateTag}>🏁 {fmtDate(e)}</span>}
                      </div>
                      {dl !== null && (
                        <p style={{ fontFamily: "'DM Sans'", fontSize: 11, color: dl >= 0 ? "#c8a97e" : "#666", marginTop: 5 }}>
                          {dl > 0 ? `⏳ ${dl}d restantes` : dl === 0 ? "⚡ Último día" : "✅ Finalizada"}
                        </p>
                      )}
                      <p style={S.dietDays}>{Object.keys(diet.days).length} días configurados</p>
                    </div>
                    {diet.active && <span style={S.activePill}>Activa</span>}
                  </div>
                  <div style={S.dietActions}>
                    <button className="bp" onClick={() => startEditDiet(diet)} style={S.actionBtn}>✏️ Editar</button>
                    {!diet.active && (
                      <button className="bp" onClick={() => setActiveDiet(diet.id)}
                        style={{ ...S.actionBtn, background: "rgba(200,169,126,0.12)", color: "#c8a97e" }}>⭐ Activar</button>
                    )}
                    <button className="bp" onClick={() => deleteDiet(diet.id)} style={{ ...S.actionBtn, color: "#c0504d" }}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}


        {/* ════════════════════════════════════════════════════════════════
            VISTA: EDITAR / NUEVA DIETA
            Formulario completo para crear o editar una dieta
        ════════════════════════════════════════════════════════════════ */}
        {view === "editDiet" && editingDiet && (
          <div className="su" style={{ paddingBottom: 100 }}>
            <div style={S.pageHeader}>
              <button className="bp" onClick={() => setView("diets")} style={S.backBtn}>← Volver</button>
              <h1 style={{ ...S.pageTitle, fontSize: 18 }}>{editingDiet.id ? "Editar Dieta" : "Nueva Dieta"}</h1>
            </div>

            {/* Campos generales de la dieta */}
            <div style={S.section}>
              <label style={S.label}>Nombre</label>
              <input style={S.input} placeholder="Nombre del plan"
                value={editingDiet.name} onChange={e => setEditingDiet(p => ({ ...p, name: e.target.value }))} />

              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={S.label}>📅 Fecha inicio</label>
                  <input type="date" style={S.input} value={editingDiet.startDate || ""}
                    onChange={e => setEditingDiet(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={S.label}>🏁 Fecha fin</label>
                  <input type="date" style={S.input} value={editingDiet.endDate || ""}
                    min={editingDiet.startDate || ""}
                    onChange={e => setEditingDiet(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>

              {/* Duración calculada automáticamente */}
              {editingDiet.startDate && editingDiet.endDate && (() => {
                const s   = toDate(editingDiet.startDate);
                const e   = toDate(editingDiet.endDate);
                const dur = s && e ? Math.ceil((e - s) / 86400000) + 1 : 0;
                return dur > 0 ? (
                  <div style={{ marginTop: 10, background: "rgba(200,169,126,0.08)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(200,169,126,0.2)" }}>
                    <p style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "#c8a97e" }}>✨ Duración: <strong>{dur} días</strong></p>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Selector de día para editar comidas */}
            <p style={{ ...S.label, padding: "0 20px", marginBottom: 8 }}>Comidas por día de la semana</p>
            <div style={S.dayScroll}>
              {DAYS.map(d => (
                <button key={d} className="bp" onClick={() => setEditDay(d)} style={{
                  ...S.dayChip,
                  background: d === editDay ? "#c8a97e" : "rgba(255,255,255,0.07)",
                  color:      d === editDay ? "#1a1a2e" : "#888",
                  fontWeight: d === editDay ? 700 : 400,
                  border: "1px solid transparent",
                }}>
                  {d.slice(0, 3)}{editingDiet.days?.[d] ? <span style={{ fontSize: 7, marginLeft: 2 }}>●</span> : ""}
                </button>
              ))}
            </div>

            {/* Lista de comidas del día seleccionado */}
            <div style={{ padding: "0 20px" }}>
              {MEAL_TYPES.map(meal => {
                const cur  = editingDiet.days?.[editDay]?.[meal];
                const isEd = editMeal === meal;
                return (
                  <div key={meal} style={S.editMealBlock}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{MEAL_ICONS[meal] || "🍴"}</span>
                        <span style={S.mealName}>{meal}</span>
                      </div>
                      <button className="bp" onClick={() => {
                        if (isEd) setEditMeal(null);
                        else { setEditMeal(meal); setMealForm(cur ? { ...cur, calories: cur.calories || "" } : { foods: "", calories: "", ingredients: "", schedule: "" }); }
                      }} style={S.editChip}>{isEd ? "Cancelar" : cur ? "✏️ Editar" : "+ Añadir"}</button>
                    </div>

                    {/* Preview de la comida existente */}
                    {cur && !isEd && (
                      <div style={S.mealPreview}>
                        <p style={{ fontFamily: "'DM Sans'", color: "#bbb", fontSize: 12, flex: 1 }}>{cur.foods}</p>
                        <p style={{ fontFamily: "Fraunces", color: "#c8a97e", fontSize: 13 }}>{cur.calories} kcal</p>
                      </div>
                    )}

                    {/* Formulario de edición de comida */}
                    {isEd && (
                      <div className="su" style={S.mealEditForm}>
                        <label style={S.label}>Plato</label>
                        <input style={S.input} placeholder="Nombre del plato"
                          value={mealForm.foods} onChange={e => setMealForm(p => ({ ...p, foods: e.target.value }))} />
                        <label style={S.label}>Ingredientes (separados por coma)</label>
                        <textarea style={{ ...S.input, height: 60, resize: "none" }}
                          placeholder="Ingrediente: cantidad, …"
                          value={mealForm.ingredients} onChange={e => setMealForm(p => ({ ...p, ingredients: e.target.value }))} />
                        <div style={{ display: "flex", gap: 10 }}>
                          <div style={{ flex: 1 }}>
                            <label style={S.label}>Kcal</label>
                            <input type="number" style={S.input} value={mealForm.calories}
                              onChange={e => setMealForm(p => ({ ...p, calories: e.target.value }))} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={S.label}>Hora</label>
                            <input style={S.input} placeholder="14:00" value={mealForm.schedule}
                              onChange={e => setMealForm(p => ({ ...p, schedule: e.target.value }))} />
                          </div>
                        </div>
                        <button className="bp" onClick={saveMealToEditing} style={S.saveMealBtn}>Guardar</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón guardar dieta completa */}
            <div style={{ padding: "18px 20px 0" }}>
              <button className="bp" onClick={saveEditingDiet} disabled={!editingDiet.name}
                style={{ ...S.primaryBtn, opacity: editingDiet.name ? 1 : 0.4 }}>
                {editingDiet.id ? "Guardar cambios" : "Crear dieta"}
              </button>
            </div>
          </div>
        )}

      </div>{/* fin content */}


      {/* ── BARRA DE NAVEGACIÓN INFERIOR ────────────────────────────────── */}
      <div style={S.bottomNav}>
        {[
          { id: "today",         icon: "🏠", label: "Hoy"      },
          { id: "nutricionista", icon: "🩺", label: "Nutri"    },
          { id: "calendar",      icon: "📅", label: "Cal."     },
          { id: "diets",         icon: "📋", label: "Dietas"   },
        ].map(({ id, icon, label }) => (
          <button key={id} className="bp" onClick={() => setView(id)} style={{
            ...S.navBtn,
            color: (id === "diets" && (view === "diets" || view === "editDiet")) || view === id
              ? "#c8a97e" : "#555",
          }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={S.navLabel}>{label}</span>
            {/* Punto rojo si la próxima consulta es en ≤3 días */}
            {id === "nutricionista" && nextAppt && nextApptDiff <= 3 && (
              <div style={{ position: "absolute", top: 8, right: "calc(50% - 16px)", width: 6, height: 6, borderRadius: "50%", background: "#e07060" }} />
            )}
          </button>
        ))}
      </div>

    </div>
  );
}


// =============================================================================
// 5. ESTILOS (CSS-in-JS)
// Objeto con todos los estilos de la app.
// Se usa como: style={S.nombreDelEstilo}
// =============================================================================
const S = {
  // Contenedor principal — simula la pantalla del móvil
  phone: { width: "100%", maxWidth: 390, minHeight: "100dvh", margin: "0 auto", background: "#0f0f17", position: "relative", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" },

  // Barra de estado superior (hora y batería simulados)
  statusBar: { display: "flex", justifyContent: "space-between", padding: "12px 20px 4px", color: "#555", fontSize: 11 },

  // Zona scrollable de contenido
  content: { flex: 1, overflowY: "auto", overflowX: "hidden" },

  // Mensaje de feedback temporal
  toast: { position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)", background: "#2a2a3a", color: "#f0e6d3", padding: "10px 22px", borderRadius: 50, fontSize: 13, zIndex: 999, animation: "toastIn 0.3s ease both", whiteSpace: "nowrap", border: "1px solid rgba(200,169,126,0.3)" },

  // Overlay oscuro detrás del modal
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "flex-end" },

  // Contenedor del modal (sube desde abajo)
  modal: { width: "100%", maxWidth: 390, margin: "0 auto", background: "#1a1a2e", borderRadius: "20px 20px 0 0", padding: "24px 22px 40px" },
  modalTitle: { fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 18, fontWeight: 600, marginBottom: 6 },
  modalSub:   { fontFamily: "'DM Sans'", color: "#666", fontSize: 12, marginBottom: 16 },
  modalCancelBtn: { background: "rgba(255,255,255,0.07)", color: "#888", border: "none", borderRadius: 12, padding: "12px", fontFamily: "'DM Sans'", fontSize: 14, cursor: "pointer" },
  modalSaveBtn:   { background: "#c8a97e", color: "#1a1a2e", border: "none", borderRadius: 12, padding: "12px", fontFamily: "Fraunces", fontSize: 15, fontWeight: 600, cursor: "pointer" },

  // Banner de próxima consulta
  apptBanner: { margin: "0 20px 14px", background: "linear-gradient(135deg, rgba(144,144,204,0.12), rgba(144,144,204,0.06))", border: "1px solid rgba(144,144,204,0.2)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" },

  // Vista Hoy — cabecera
  todayHeader: { padding: "16px 22px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  greeting:    { fontFamily: "'DM Sans'", color: "#555", fontSize: 13 },
  todayTitle:  { fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 28, fontWeight: 600, lineHeight: 1.1 },
  dietBadge:   { background: "rgba(200,169,126,0.1)", color: "#c8a97e", padding: "5px 12px", borderRadius: 50, fontSize: 10, border: "1px solid rgba(200,169,126,0.2)", maxWidth: 110, textAlign: "center", lineHeight: 1.3 },

  // Selector de días (scroll horizontal)
  dayScroll: { display: "flex", gap: 8, padding: "8px 20px 14px", overflowX: "auto" },
  dayChip:   { padding: "6px 14px", borderRadius: 50, border: "none", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans'", whiteSpace: "nowrap", transition: "all 0.2s", flexShrink: 0 },

  // Tarjeta de progreso (anillo + calorías)
  progressCard: { margin: "0 20px 18px", background: "linear-gradient(135deg, #1e1e2e, #16162a)", borderRadius: 20, padding: "18px 22px", display: "flex", alignItems: "center", gap: 18, border: "1px solid rgba(255,255,255,0.06)" },

  // Tarjetas de comida
  mealCard:   { background: "#16162a", borderRadius: 16, padding: "13px 15px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer", transition: "all 0.2s", border: "1px solid rgba(255,255,255,0.05)" },
  mealDetail: { background: "#13131f", borderRadius: "0 0 14px 14px", padding: "12px 15px 14px", border: "1px solid rgba(255,255,255,0.04)", borderTop: "none" },
  mealLeft:   { display: "flex", gap: 11, flex: 1 },
  mealName:   { fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 14, fontWeight: 600 },
  mealFoods:  { fontFamily: "'DM Sans'", color: "#999", fontSize: 12, marginTop: 3, lineHeight: 1.4 },
  mealCal:    { fontFamily: "Fraunces", color: "#c8a97e", fontSize: 17, fontWeight: 600 },
  detailLabel: { fontFamily: "'DM Sans'", fontSize: 10, color: "#c8a97e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  detailIng:   { fontFamily: "'DM Sans'", color: "#bbb", fontSize: 12, lineHeight: 1.7 },
  detailBtn:   { background: "rgba(200,169,126,0.1)", color: "#c8a97e", border: "1px solid rgba(200,169,126,0.2)", borderRadius: 50, padding: "5px 14px", fontSize: 12, fontFamily: "'DM Sans'", cursor: "pointer" },

  // Botón check (marcar comida como completada)
  check: { width: 22, height: 22, borderRadius: "50%", border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 },

  // Botón añadir extra
  addExtraBtn: { width: "100%", background: "rgba(126,200,160,0.08)", color: "#7ec8a0", border: "1px dashed rgba(126,200,160,0.3)", borderRadius: 14, padding: "12px", fontFamily: "'DM Sans'", fontSize: 13, cursor: "pointer", marginBottom: 6 },

  // Tarjeta de agua
  waterCard: { margin: "10px 20px 16px", background: "#16162a", borderRadius: 18, padding: "18px", border: "1px solid rgba(104,180,212,0.15)" },
  waterBtn:  { flex: 1, background: "rgba(104,180,212,0.1)", color: "#68b4d4", border: "1px solid rgba(104,180,212,0.2)", borderRadius: 10, padding: "8px 4px", fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 600, cursor: "pointer" },

  // Tarjeta de evolución del peso
  weightCard: { margin: "0 20px 14px", background: "#16162a", borderRadius: 16, padding: "16px", border: "1px solid rgba(200,169,126,0.12)" },

  // Estado vacío (sin datos)
  emptyState: { textAlign: "center", padding: "60px 20px" },

  // Cabecera de página genérica
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px 14px" },
  pageTitle:  { fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 26, fontWeight: 600 },

  // Botón "añadir" (esquina superior derecha de las páginas)
  addBtn: { background: "#c8a97e", color: "#1a1a2e", border: "none", borderRadius: 50, padding: "8px 18px", fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 600, cursor: "pointer" },

  // Importador de PDF
  importCard: { margin: "0 20px 16px", background: "#16162a", borderRadius: 16, padding: "16px", border: "1px solid rgba(200,169,126,0.15)" },
  importBtn:  { width: "100%", background: "rgba(200,169,126,0.12)", color: "#c8a97e", border: "1px solid rgba(200,169,126,0.3)", borderRadius: 12, padding: "11px", fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },

  // Calendario
  calGrid:     { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 14px" },
  monthNavBtn: { background: "rgba(255,255,255,0.07)", border: "none", color: "#f0e6d3", borderRadius: "50%", width: 36, height: 36, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  legendCard:  { background: "#16162a", borderRadius: 14, padding: "14px", border: "1px solid rgba(255,255,255,0.06)" },

  // Tarjetas de dieta
  dietCard:    { margin: "0 20px 14px", background: "#16162a", borderRadius: 18, padding: "18px", border: "1px solid rgba(255,255,255,0.06)", animation: "fadeIn 0.3s ease both" },
  dietName:    { fontFamily: "Fraunces", color: "#f0e6d3", fontSize: 15, fontWeight: 600, lineHeight: 1.3 },
  dietDays:    { fontFamily: "'DM Sans'", color: "#555", fontSize: 11, marginTop: 6 },
  dietActions: { display: "flex", gap: 8, marginTop: 13 },
  actionBtn:   { background: "rgba(255,255,255,0.06)", color: "#bbb", border: "none", borderRadius: 50, padding: "7px 14px", fontFamily: "'DM Sans'", fontSize: 12, cursor: "pointer" },

  // Badges y etiquetas
  activePill: { background: "rgba(200,169,126,0.15)", color: "#c8a97e", border: "1px solid rgba(200,169,126,0.3)", borderRadius: 50, padding: "3px 10px", fontSize: 10, whiteSpace: "nowrap" },
  dateTag:    { fontFamily: "'DM Sans'", color: "#999", fontSize: 11, background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "3px 8px" },

  // Formulario de edición de dieta
  backBtn:      { background: "none", border: "none", color: "#c8a97e", fontFamily: "'DM Sans'", fontSize: 14, cursor: "pointer" },
  section:      { padding: "0 20px 16px" },
  label:        { fontFamily: "'DM Sans'", color: "#666", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" },
  input:        { width: "100%", background: "#1e1e2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "11px 14px", color: "#f0e6d3", fontFamily: "'DM Sans'", fontSize: 14, outline: "none" },
  editMealBlock: { background: "#16162a", borderRadius: 13, padding: "13px", marginBottom: 9, border: "1px solid rgba(255,255,255,0.05)" },
  editChip:     { background: "rgba(200,169,126,0.1)", color: "#c8a97e", border: "1px solid rgba(200,169,126,0.2)", borderRadius: 50, padding: "4px 12px", fontSize: 11, cursor: "pointer" },
  mealPreview:  { marginTop: 9, padding: "7px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  mealEditForm: { marginTop: 11, display: "flex", flexDirection: "column", gap: 6 },
  saveMealBtn:  { width: "100%", background: "rgba(200,169,126,0.12)", color: "#c8a97e", border: "1px solid rgba(200,169,126,0.25)", borderRadius: 12, padding: "11px", fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  primaryBtn:   { width: "100%", background: "#c8a97e", color: "#1a1a2e", border: "none", borderRadius: 14, padding: "15px", fontFamily: "Fraunces", fontSize: 16, fontWeight: 600, cursor: "pointer" },

  // Barra de navegación inferior
  bottomNav: { position: "sticky", bottom: 0, background: "rgba(15,15,23,0.96)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-around", padding: "10px 0 20px", zIndex: 100 },
  navBtn:    { background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "0 14px", transition: "color 0.2s", position: "relative" },
  navLabel:  { fontSize: 10, fontFamily: "'DM Sans'", fontWeight: 500 },
};
