import "server-only";

export type WhatsAppMessage = { to: string; body: string };
export type WhatsAppResult = { ok: boolean; skipped?: boolean; error?: string };

/** India-first: bare 10-digit numbers get a 91 country code. Returns digits only, no "+". */
export function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/**
 * Click-to-chat link. Works with zero setup and no provider account — used for
 * the "Send on WhatsApp" buttons in the admin panel so the shop owner can always
 * reach a customer even before the automated API is configured.
 */
export function waMeLink(phone: string, text: string) {
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(text)}`;
}

async function sendViaMetaCloud({ to, body }: WhatsAppMessage): Promise<WhatsAppResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !token) {
    return { ok: false, error: "WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN are not set" };
  }

  const version = process.env.WHATSAPP_API_VERSION ?? "v21.0";
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;

  // Business-initiated messages outside the 24h service window must use an
  // approved template; free-form text only reaches users who messaged first.
  const payload = templateName
    ? {
        messaging_product: "whatsapp",
        to: toWhatsAppNumber(to),
        type: "template",
        template: {
          name: templateName,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG ?? "en" },
          components: [{ type: "body", parameters: [{ type: "text", text: body }] }],
        },
      }
    : {
        messaging_product: "whatsapp",
        to: toWhatsAppNumber(to),
        type: "text",
        text: { preview_url: false, body },
      };

  const res = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: `Meta WhatsApp ${res.status}: ${text.slice(0, 300)}` };
  }
  return { ok: true };
}

async function sendViaTwilioWhatsApp({ to, body }: WhatsAppMessage): Promise<WhatsAppResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !token || !from) {
    return { ok: false, error: "Twilio WhatsApp credentials are not fully configured" };
  }

  const params = new URLSearchParams({
    To: `whatsapp:+${toWhatsAppNumber(to)}`,
    From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    Body: body,
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: `Twilio WhatsApp ${res.status}: ${text.slice(0, 300)}` };
  }
  return { ok: true };
}

/** For Indian BSPs (AiSensy, Interakt, Gupshup, Wati, ...) via a small forwarding endpoint. */
async function sendViaWebhook({ to, body }: WhatsAppMessage): Promise<WhatsAppResult> {
  const url = process.env.WHATSAPP_WEBHOOK_URL;
  if (!url) return { ok: false, error: "WHATSAPP_WEBHOOK_URL is not configured" };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.WHATSAPP_WEBHOOK_AUTH_HEADER) {
    headers.Authorization = process.env.WHATSAPP_WEBHOOK_AUTH_HEADER;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ to: toWhatsAppNumber(to), message: body }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: `WhatsApp webhook ${res.status}: ${text.slice(0, 300)}` };
  }
  return { ok: true };
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}

/**
 * No WHATSAPP_PROVIDER means no gateway is connected yet, so we log the message
 * instead of sending. Checkout must never fail because a notification channel
 * isn't set up.
 */
export async function sendWhatsApp(message: WhatsAppMessage): Promise<WhatsAppResult> {
  const provider = (process.env.WHATSAPP_PROVIDER ?? "").toLowerCase();

  if (!provider) {
    console.log(
      `[WhatsApp not sent — WHATSAPP_PROVIDER not configured] To: +${toWhatsAppNumber(message.to)}\n${message.body}\n`
    );
    return { ok: true, skipped: true };
  }

  try {
    const timedOut = { ok: false, error: "WhatsApp request timed out" };
    const result =
      provider === "meta" || provider === "cloud"
        ? await withTimeout(sendViaMetaCloud(message), 10000, timedOut)
        : provider === "twilio"
          ? await withTimeout(sendViaTwilioWhatsApp(message), 10000, timedOut)
          : provider === "webhook"
            ? await withTimeout(sendViaWebhook(message), 10000, timedOut)
            : { ok: false, error: `Unknown WHATSAPP_PROVIDER "${provider}"` };

    if (!result.ok) {
      console.error(`[WhatsApp send failed via ${provider}] To: ${message.to} — ${result.error}`);
    }
    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[WhatsApp send threw via ${provider}] To: ${message.to} — ${msg}`);
    return { ok: false, error: msg };
  }
}
