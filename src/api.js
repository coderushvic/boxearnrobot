const telegram = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

export async function authenticate() {
  if (!telegram?.initData) {
    throw new Error("Please open BOX EARN from the Telegram bot to sign in.");
  }
  telegram.ready();
  telegram.expand();
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ initData: telegram.initData })
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error?.message || "Unable to sign in.");
  return payload;
}

export async function apiRequest(path, options = {}) {
  if (!telegram?.initData) throw new Error("Open BOX EARN inside Telegram to continue.");
  const response = await fetch(path, {
    ...options,
    headers: {
      authorization: "tma " + telegram.initData,
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...options.headers
    }
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error?.message || "The request could not be completed.");
  return payload;
}
