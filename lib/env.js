// Vercel madhe .env.local madhun value paste kartana surrounding quotes/spaces
// pan copy hotat (local la Next te kadhto, Vercel nahi), te kadhun takaycha
export function getEnv(name) {
  return process.env[name]?.trim().replace(/^["']|["']$/g, "").trim();
}
