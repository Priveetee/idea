export function getBrowserFingerprint(): string {
  if (typeof window === "undefined") return "server";
  const key = "idea_fingerprint";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const fp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, fp);
  return fp;
}
