import "server-only";

type SmsMessage = { to: string; body: string };
type SmsResult = { ok: boolean; skipped?: boolean; error?: string };

function toE164India(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

async function sendViaTwilio({ to, body }: SmsMessage): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) {
    return { ok: false, error: "Twilio credentials are not fully configured" };
  }

  const params = new URLSearchParams({ To: toE164India(to), From: from, Body: body });
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
    return { ok: false, error: `Twilio ${res.status}: ${text.slice(0, 200)}` };
  }
  return { ok: true };
}

async function sendViaWebhook({ to, body }: SmsMessage): Promise<SmsResult> {
  const url = process.env.SMS_WEBHOOK_URL;
  if (!url) return { ok: false, error: "SMS_WEBHOOK_URL is not configured" };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.SMS_WEBHOOK_AUTH_HEADER) {
    headers.Authorization = process.env.SMS_WEBHOOK_AUTH_HEADER;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ to: toE164India(to), message: body }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: `SMS webhook ${res.status}: ${text.slice(0, 200)}` };
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

// No SMS_PROVIDER means no gateway is configured yet (the client hasn't
// signed up with a provider). We log instead of sending so checkout still
// completes normally rather than erroring out on a missing integration.
export async function sendSms(message: SmsMessage): Promise<SmsResult> {
  const provider = (process.env.SMS_PROVIDER ?? "").toLowerCase();

  if (!provider) {
    console.log(`[SMS not sent — no SMS_PROVIDER configured] To: ${message.to}\n${message.body}`);
    return { ok: true, skipped: true };
  }

  try {
    const result =
      provider === "twilio"
        ? await withTimeout(sendViaTwilio(message), 8000, { ok: false, error: "Twilio request timed out" })
        : provider === "webhook"
          ? await withTimeout(sendViaWebhook(message), 8000, { ok: false, error: "SMS webhook request timed out" })
          : { ok: false, error: `Unknown SMS_PROVIDER "${provider}"` };

    if (!result.ok) {
      console.error(`[SMS send failed via ${provider}] To: ${message.to} — ${result.error}`);
    }
    return result;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[SMS send threw via ${provider}] To: ${message.to} — ${msg}`);
    return { ok: false, error: msg };
  }
}

