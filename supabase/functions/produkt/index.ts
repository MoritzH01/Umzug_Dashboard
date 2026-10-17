// Holt zu einem Shop-Link Name, Maße, Preis und ein Vorschaufoto.
// Aufruf aus dem Canvas: supabase.functions.invoke("produkt", { body: { url } })
// Mit { url, art: "tarif" } liest sie stattdessen einen Stromtarif (Grund- und Arbeitspreis, Boni, Fristen).
// Das ist bewusst allgemein gehalten, ohne Code für einzelne Anbieter; Vergleichsportale klappen nur manchmal.
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

// ---------- Stromtarif ----------
// Deutsche Zahl: "12,90", "31,234", "1.234,5"; ohne Komma normal lesen
function dz(s: string) {
  const n = parseFloat(/,/.test(s) ? s.replace(/\./g, "").replace(",", ".") : s);
  return isNaN(n) ? null : n;
}
const Z = "(\\d{1,4}(?:[.,]\\d{1,4})?)";
// Textstück hinter dem ersten passenden Stichwort (oder null)
function nach(text: string, lab: string, len = 90) {
  const m = text.match(new RegExp(`(?:${lab})`, "i"));
  return m ? text.slice((m.index || 0) + m[0].length, (m.index || 0) + m[0].length + len) : null;
}
function monate(n: number, einheit: string) { return /jahr/i.test(einheit) ? n * 12 : n; }
const rx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function tarif(text: string, pageUrl: string, html = "") {
  const out: Record<string, unknown> = {};
  // Grundpreis in €/Monat; eine Jahresangabe wird umgerechnet, ohne Einheit entscheidet die Größe
  const g = nach(text, "Grundpreis|Grundgebühr|Grundgebuehr|Basispreis");
  if (g) {
    const m = g.match(new RegExp(`^[^\\d]{0,40}?${Z}\\s*(?:€|EUR|Euro)([^\\d]{0,25})`, "i"));
    const n = m ? dz(m[1]) : null;
    if (m && n != null) {
      const um = m[0], jahr = /jahr|jährl|p\.\s?a\./i.test(um), monat = /monat|mtl|\/\s*mon/i.test(um);
      const v = jahr && !monat ? n / 12 : !monat && n > 40 ? n / 12 : n;
      if (v > 0 && v < 100) out.grundpreis = Math.round(v * 100) / 100;
    }
  }
  // Arbeitspreis in ct/kWh
  const a = nach(text, "Arbeitspreis|Verbrauchspreis|Energiepreis|kWh-Preis|Preis (?:pro|je) kWh");
  let ap: number | null = null;
  if (a) {
    const m = a.match(new RegExp(`^[^\\d]{0,40}?${Z}\\s*(ct|Cent|€|EUR|Euro)`, "i"));
    const n = m ? dz(m[1]) : null;
    if (m && n != null) ap = /ct|cent/i.test(m[2]) ? n : n * 100;
  }
  if (ap == null) {
    const m = text.match(new RegExp(`${Z}\\s*(?:ct|Cent)\\s*(?:/|pro|je)\\s*kWh`, "i"));
    if (m) ap = dz(m[1]);
  }
  if (ap != null && ap > 5 && ap < 150) out.arbeitspreis = Math.round(ap * 1000) / 1000;
  // Boni: eine Gesamtangabe, sonst je Bonusart den ersten Betrag zusammenzählen
  const ges = nach(text, "Boni gesamt|Gesamtbonus|Bonus gesamt", 50);
  const gm = ges ? ges.match(new RegExp(`^[^\\d]{0,30}?${Z}\\s*(?:€|EUR|Euro)`, "i")) : null;
  if (gm) out.boni = dz(gm[1]);
  else {
    const arten = new Map<string, number>();
    for (const m of text.matchAll(new RegExp(`(Neukundenbonus|Sofortbonus|Wechselbonus|Treuebonus|Willkommensbonus|Bonus)[^\\d€]{0,40}?${Z}\\s*(?:€|EUR|Euro)`, "gi"))) {
      const k = m[1].toLowerCase(), n = dz(m[2]);
      if (n != null && n > 0 && n < 1000 && !arten.has(k)) arten.set(k, n);
    }
    if (arten.size > 1) arten.delete("bonus");
    const sum = [...arten.values()].reduce((x, y) => x + y, 0);
    if (sum) out.boni = Math.round(sum * 100) / 100;
  }
  // Mindestlaufzeit und Preisgarantie in Monaten (Zahl hinter oder vor dem Stichwort)
  const dauer = (lab: string) => {
    const w = nach(text, lab, 50);
    const m = w ? w.match(/^[^\d]{0,25}?(\d{1,2})\s*(Monat|Jahr)/i) : null;
    if (m) return monate(+m[1], m[2]);
    const v = text.match(new RegExp(`(\\d{1,2})\\s*(Monate?|Jahre?)\\s*(?:[a-zäöü]+\\s)?(?:${lab})`, "i"));
    return v ? monate(+v[1], v[2]) : null;
  };
  const lz = dauer("Mindestvertragslaufzeit|Mindestlaufzeit|Erstlaufzeit|Vertragslaufzeit");
  if (lz && lz <= 48) out.laufzeit = lz;
  else if (/monatlich kündbar|keine Mindestlaufzeit|ohne Mindestlaufzeit/i.test(text)) out.laufzeit = 1;
  const pg = dauer("Preisgarantie|Preisfixierung|Preisbindung");
  if (pg && pg <= 60) out.garantie = pg;
  // Kündigungsfrist als Zahl plus Wochen oder Monate
  const k = nach(text, "Kündigungsfrist|Kuendigungsfrist", 50);
  const km = k ? k.match(/^[^\d]{0,25}?(\d{1,2})\s*(Woche|Monat|Tag)/i) : null;
  if (km) {
    const n = +km[1];
    if (/woche/i.test(km[2])) { out.kfrist = n; out.kfristE = "Wochen"; }
    else if (/monat/i.test(km[2])) { out.kfrist = n; out.kfristE = "Monate"; }
    else if (n % 7 === 0 || n < 28) { out.kfrist = Math.ceil(n / 7); out.kfristE = "Wochen"; }
    else { out.kfrist = Math.round(n / 30); out.kfristE = "Monate"; }
  }
  // Anbieter und Tarifname; auf Vergleichsportalen ist der Seitenname nicht der Anbieter
  const u = new URL(pageUrl), host = u.hostname.replace(/^www\./, "");
  const portal = /check24|verivox|tarifcheck|toptarif|stromauskunft|wechselpilot|idealo|vergleich/i.test(host);
  if (!portal) out.anbieter = (html && meta(html, "og:site_name")) || host.split(".").slice(-2, -1)[0].replace(/^./, (c) => c.toUpperCase());
  const titel = html ? (meta(html, "og:title") || (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "") : "";
  const t = decode(titel.replace(/<[^>]+>/g, " ")).replace(/\s*[-|–]\s*[^-|–]+$/, "").replace(/\s+/g, " ").trim();
  if (t && t.length <= 60 && !(out.anbieter && new RegExp(`^${rx(String(out.anbieter))}$`, "i").test(t))) out.tarif = t;
  // PLZ und Verbrauch aus dem Link
  const q = (re: RegExp) => { for (const [key, val] of u.searchParams) if (re.test(key)) return val; return null; };
  const plz = q(/^(plz|zip|zipcode|postcode|postleitzahl)$/i) || (u.pathname.match(/(?:^|\/)(\d{5})(?:\/|$)/) || [])[1];
  if (plz && /^\d{5}$/.test(plz)) out.plz = plz;
  const kwh = q(/verbrauch|consumption|kwh|usage/i) || (u.href.match(/(?:verbrauch|consumption|kwh)[=/_-]?(\d{3,5})/i) || [])[1];
  if (kwh && +kwh >= 300 && +kwh <= 100000) out.kwh = +kwh;
  return out;
}
const PREISFELDER = ["grundpreis", "arbeitspreis"];
const mitPreis = (t: Record<string, unknown>) => PREISFELDER.some((k) => t[k] != null);

async function lesedienst(url: string) {
  try {
    const r = await fetch("https://r.jina.ai/" + url, { headers: { "x-return-format": "html", "accept": "text/html" } });
    if (r.ok) return (await r.text()).slice(0, 4_000_000);
  } catch (_) { /* Lesedienst nicht erreichbar */ }
  return "";
}
function seitenText(html: string) {
  return decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}
async function holeTarif(u: URL) {
  const seite = await holeSeite(u.href);
  let html = seite.html, quelle = seite.quelle;
  let t = html ? tarif(seitenText(html), u.href, html) : {};
  // Baut die Seite die Preise erst im Browser auf, einmal über den Lesedienst versuchen
  if (!mitPreis(t) && quelle === "shop") {
    const h2 = await lesedienst(u.href);
    const t2 = h2 ? tarif(seitenText(h2), u.href, h2) : {};
    if (mitPreis(t2)) { t = { ...t, ...t2 }; html = h2; quelle = "lesedienst"; }
  }
  if (!html) return json({ error: `Die Seite wurde nicht herausgegeben (Status ${seite.status || "keine Antwort"}).` }, 502);
  return json({ ...t, info: { quelle, status: seite.status, preise: mitPreis(t) } });
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
    const { url, art } = await req.json();
    const u = new URL(String(url).trim());
    if (!/^https?:$/.test(u.protocol)) return json({ error: "Nur http- und https-Links" }, 400);
    if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[|0\.)/i.test(u.hostname)) return json({ error: "Nur öffentliche Seiten" }, 400);
    if (art === "tarif") return await holeTarif(u);
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
