export async function verifyTurnstileOrSkip(turnstileToken?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return; // not enabled
  if (!turnstileToken) throw new Error("Missing anti-spam token");

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: turnstileToken }),
  });
  const data = await res.json();
  if (!data.success) throw new Error("Anti-spam verification failed");
}
