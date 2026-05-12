// =============================================================================
// setup-webhook.js — Script para registrar el webhook en Telegram
//
// Ejecuta este script UNA SOLA VEZ desde el navegador (o Node.js)
// después de desplegar en Vercel para conectar Telegram con tu app.
//
// OPCIÓN A — Desde el navegador:
//   Abre la consola del navegador (F12 → Console) en cualquier página
//   y pega todo el contenido de este archivo. Pulsa Enter.
//
// OPCIÓN B — Desde Node.js en tu ordenador:
//   node setup-webhook.js
//
// Una vez registrado, Telegram llamará automáticamente a tu webhook
// cada vez que escribas un mensaje al bot.
// =============================================================================

const BOT_TOKEN   = "8756822686:AAGjXdOfzNq7ROroGXL9my0JnrTnu3-3Jks";
const WEBHOOK_URL = "https://fit-manager-beige.vercel.app/api/webhook";

// Registra el webhook en Telegram
fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url:             WEBHOOK_URL,
    allowed_updates: ["message"],       // solo mensajes de texto
    drop_pending_updates: true,         // ignora mensajes anteriores al registro
  }),
})
  .then(r => r.json())
  .then(data => {
    if (data.ok) {
      console.log("✅ Webhook registrado correctamente");
      console.log("URL:", WEBHOOK_URL);
      console.log("Ahora escribe /ayuda en Telegram para probarlo");
    } else {
      console.error("❌ Error al registrar el webhook:", data.description);
    }
  })
  .catch(err => console.error("❌ Error de red:", err));
