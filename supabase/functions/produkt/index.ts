// Holt zu einem Shop-Link Name, Maße, Preis und ein Vorschaufoto.
// Aufruf aus der Tafel: supabase.functions.invoke("produkt", { body: { url } })
// Nur angemeldete Personen dürfen sie aufrufen (JWT-Prüfung bleibt an).
// Blockiert ein Shop die Abfrage, wird die Seite einmal über den Lesedienst r.jina.ai geholt
// (der sieht nur den Produktlink, sonst nichts).

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const HEAD = {
  "user-agent": UA,
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "accept-language": "de-DE,de;q=0.9,en;q=0.6",
  "upgrade-insecure-requests": "1",
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });
}
export function decode(s: string) {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;|&#160;/g, " ").replace(/&times;|&#215;/g, "×").replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(+n));
}
function meta(html: string, prop: string) {
  const re = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${prop}["'][^>]*content=["']([^"']+)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name|itemprop)=["']${prop}["']`, "i");
  const m = html.match(re) || html.match(re2);
  return m ? decode(m[1]) : null;
}
function zahl(s: unknown) {
  const t = String(s ?? "").replace(/\s/g, "");
  const n = parseFloat(/,\d{1,2}$/.test(t) ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, ""));
  return isNaN(n) ? null : n;
}
// Wert mit Einheit in Zentimeter umrechnen, Unsinn verwerfen
function cm(v: unknown, unit?: string | null) {
  const n = zahl(String(v ?? "").replace(",", "."));
  if (n == null) return null;
  const u = (unit || "cm").toLowerCase();
  const c = u === "mm" || u === "mmt" ? n / 10 : u === "m" || u === "mtr" ? n * 100 : n;
  return c >= 1 && c <= 800 ? Math.round(c * 10) / 10 : null;
}

const N = "(\\d{1,4}(?:[.,]\\d{1,2})?)";
const U = "(mm|cm|m)(?![a-zäöü])";
const LAB: Record<string, string> = {
  w: "Breite|Gesamtbreite|Width|Länge|Laenge|Length",
  d: "Tiefe|Gesamttiefe|Depth|Sitztiefe gesamt",
  h: "Höhe|Hoehe|Gesamthöhe|Height",
};
// Sucht Maße in Text oder eingebettetem JSON
export function dimensions(text: string) {
  const out: Record<string, number | null> = { w: null, d: null, h: null };
  for (const k of ["w", "d", "h"]) {
    // "Breite: 80 cm", "Breite 80cm", "\"Breite\",\"value\":\"80 cm\"", "Breite (cm): 80"
    const re = new RegExp(`(?:^|[^a-zäöüß])(?:${LAB[k]})(?:\\s*\\((mm|cm|m)\\))?["'\\s:=,]*(?:value["'\\s:=]*)?${N}\\s*(?:${U})?`, "i");
    const m = text.match(re);
    if (m) out[k] = cm(m[2], m[3] || m[1] || "cm");
  }
  if (!out.w || !out.h) {
    // "B 80 x T 40 x H 120 cm" in beliebiger Reihenfolge
    const re = new RegExp(`\\b([BTHL])\\s*[:.]?\\s*${N}\\s*(?:mm|cm)?\\s*[x×*/,]\\s*([BTHL])\\s*[:.]?\\s*${N}\\s*(?:mm|cm)?(?:\\s*[x×*/,]\\s*([BTHL])\\s*[:.]?\\s*${N})?\\s*(?:${U})?`);
    const m = text.match(re);
    if (m) {
      const unit = m[7] || "cm", key: Record<string, string> = { B: "w", L: "w", T: "d", H: "h" };
      [[m[1], m[2]], [m[3], m[4]], [m[5], m[6]]].forEach(([l, v]) => { if (l && v && !out[key[l]]) out[key[l]] = cm(v, unit); });
    }
  }
  if (!out.w) {
    // "80 x 40 x 120 cm", Reihenfolge laut Hinweis "(B x H x T)" sonst B x T x H
    const m = text.match(new RegExp(`${N}\\s*[x×*]\\s*${N}(?:\\s*[x×*]\\s*${N})?\\s*${U}`, "i"));
    if (m) {
      const a = [cm(m[1], m[4]), cm(m[2], m[4]), m[3] ? cm(m[3], m[4]) : null];
      const ord = (text.slice(Math.max(0, (m.index || 0) - 60), (m.index || 0) + m[0].length + 40).match(/\b([BTH])\s*[x×/]\s*([BTH])\s*[x×/]\s*([BTH])\b/) || []).slice(1);
      const key: Record<string, string> = { B: "w", T: "d", H: "h" };
      const o = ord.length === 3 ? ord.map((l) => key[l]) : ["w", "d", "h"];
      o.forEach((k, i) => { if (a[i] != null && !out[k]) out[k] = a[i]; });
    }
  }
  return out;
}

function ldBlocks(html: string) {
  const res: any[] = [];
  for (const b of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (x: any) => {
        if (!x || typeof x !== "object") return;
        if (Array.isArray(x)) return x.forEach(walk);
        res.push(x);
        if (x["@graph"]) walk(x["@graph"]);
        if (x.hasVariant) walk(x.hasVariant);
        if (x.mainEntity) walk(x.mainEntity);
      };
      walk(JSON.parse(b[1].trim()));
    } catch (_) { /* ungültiges JSON-LD überspringen */ }
  }
  return res;
}
const isType = (x: any, t: string) => { const v = x && x["@type"]; return v === t || (Array.isArray(v) && v.includes(t)); };
export function ldProduct(html: string) {
  const all = ldBlocks(html);
  return all.find((x) => isType(x, "Product")) || all.find((x) => isType(x, "ProductGroup")) || null;
}
function firstImage(v: any): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return firstImage(v[0]);
  return v.contentUrl || v.url || null;
}
function ldDims(p: any) {
  const out: Record<string, number | null> = { w: null, d: null, h: null };
  if (!p) return out;
  const q = (v: any) => v == null ? null : typeof v === "object" ? cm(v.value, v.unitCode || v.unitText) : (() => {
    const m = String(v).match(new RegExp(`${N}\\s*(?:${U})?`));
    return m ? cm(m[1], m[2]) : null;
  })();
  out.w = q(p.width) ?? q(p.length);
  out.d = q(p.depth);
  out.h = q(p.height);
  const props = Array.isArray(p.additionalProperty) ? p.additionalProperty : [];
  const txt = props.map((x: any) => `${x.name}: ${x.value}${x.unitText ? " " + x.unitText : x.unitCode ? " " + x.unitCode : ""}`).join("; ");
  if (txt) {
    const d = dimensions(txt);
    for (const k of ["w", "d", "h"]) out[k] = out[k] ?? d[k];
  }
  return out;
}

export function extract(html: string, pageUrl: string) {
  const prod = ldProduct(html);
  let name = prod?.name || meta(html, "og:title") || meta(html, "twitter:title") || (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || "";
  name = decode(String(name)).replace(/\s*[-|–]\s*(IKEA|Shop|Online.?Shop|kaufen).*$/i, "").replace(/\s*[-|–]\s*[\w.-]+\.(com|de|at|ch|eu|net)\s*$/i, "").replace(/\s+/g, " ").trim();
  let image = firstImage(prod?.image) || meta(html, "og:image") || meta(html, "og:image:secure_url") || meta(html, "twitter:image") ||
    (html.match(/<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i) || [])[1] || null;
  if (image) { try { image = new URL(decode(image), pageUrl).href; } catch (_) { image = null; } }
  const offers = prod?.offers ? (Array.isArray(prod.offers) ? prod.offers[0] : prod.offers) : null;
  const preis = zahl(offers?.price ?? offers?.lowPrice ?? offers?.priceSpecification?.price ?? meta(html, "product:price:amount") ?? meta(html, "og:price:amount") ?? meta(html, "price"));
  const a = ldDims(prod);
  const text = decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
  const b = dimensions(text);
  const c = (a.w && b.w) ? { w: null, d: null, h: null } : dimensions(decode(html.replace(/\\"/g, '"').replace(/\\u00f6/gi, "ö").replace(/\\u00e4/gi, "ä")));
  const pick = (k: string) => a[k] ?? b[k] ?? c[k] ?? null;
  return { name, image, preis: preis != null ? Math.round(preis) : null, w: pick("w"), d: pick("d"), h: pick("h"), produkt: !!prod };
}

async function holeSeite(url: string) {
  let status = 0, html = "";
  try {
    const r = await fetch(url, { headers: HEAD, redirect: "follow" });
    status = r.status;
    html = (await r.text()).slice(0, 4_000_000);
  } catch (_) { /* Netzwerkfehler: unten Lesedienst versuchen */ }
  const brauchbar = status > 0 && status < 400 && /og:title|ld\+json|<title/i.test(html) && !/captcha|access denied|cf-chl|bot detection/i.test(html.slice(0, 20000));
  if (brauchbar) return { html, status, quelle: "shop" };
  try {
    const r = await fetch("https://r.jina.ai/" + url, { headers: { "x-return-format": "html", "accept": "text/html" } });
    if (r.ok) return { html: (await r.text()).slice(0, 4_000_000), status, quelle: "lesedienst" };
  } catch (_) { /* auch der Lesedienst geht nicht */ }
  return { html, status, quelle: "shop" };
}

async function holeBild(src: string, referer: string) {
  try {
    const r = await fetch(src, { headers: { "user-agent": UA, "accept": "image/avif,image/webp,image/*,*/*;q=0.8", "referer": referer } });
    const type = (r.headers.get("content-type") || "").split(";")[0];
    if (!r.ok || !type.startsWith("image/") || /svg/.test(type)) return null;
    const buf = new Uint8Array(await r.arrayBuffer());
    if (buf.length > 3_500_000) return null;
    let bin = "";
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return `data:${type};base64,${btoa(bin)}`;
  } catch (_) { return null; }
}

// Nur angemeldete Personen (nicht der öffentliche anon-Schlüssel). Die Signatur prüft Supabase vorher.
function angemeldet(req: Request): boolean {
  try {
    const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    let b = tok.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    while (b.length % 4) b += "=";
    const p = JSON.parse(atob(b));
    return p.role === "authenticated";
  } catch { return false; }
}

async function handle(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (!angemeldet(req)) return json({ error: "Nicht angemeldet. Bitte neu anmelden." }, 401);
  try {
    const { url } = await req.json();
    const u = new URL(String(url).trim());
    if (!/^https?:$/.test(u.protocol)) return json({ error: "Nur http- und https-Links" }, 400);
    if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[|0\.)/i.test(u.hostname)) return json({ error: "Nur öffentliche Shops" }, 400);
    const seite = await holeSeite(u.href);
    if (!seite.html) return json({ error: `Der Shop hat die Seite nicht herausgegeben (Status ${seite.status || "keine Antwort"}).` }, 502);
    const p = extract(seite.html, u.href);
    const bild = p.image ? await holeBild(p.image, u.href) : null;
    return json({
      name: p.name, w: p.w, d: p.d, h: p.h, preis: p.preis,
      image: bild || p.image || null,
      shop: u.hostname.replace(/^www\./, ""),
      info: { quelle: seite.quelle, status: seite.status, produktdaten: p.produkt, bildGeladen: !!bild },
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
}

// deno-lint-ignore no-explicit-any
const D = (globalThis as any).Deno;
if (D && D.serve) D.serve(handle);
