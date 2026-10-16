// Holt zu einem Shop-Link Name, Maße, Preis und ein Vorschaufoto.
// Aufruf aus der Tafel: supabase.functions.invoke("produkt", { body: { url } })
// Nur angemeldete Nutzer dürfen ihn aufrufen (JWT-Prüfung bleibt an).

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });
}
function decode(s: string) {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
}
function meta(html: string, prop: string) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`, "i");
  const m = html.match(re) || html.match(re2);
  return m ? decode(m[1]) : null;
}
function num(s: string) {
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? null : Math.round(n);
}
// Sucht Maße im Seitentext: "Breite: 80 cm", "Tiefe 28 cm", "Höhe: 202 cm" oder "80 x 28 x 202 cm"
function dimensions(text: string) {
  const out: Record<string, number | null> = { w: null, d: null, h: null };
  const pick = (labels: string) => {
    const m = text.match(new RegExp(`(?:${labels})\\s*:?\\s*(\\d{1,3}(?:[.,]\\d)?)\\s*cm`, "i"));
    return m ? num(m[1]) : null;
  };
  out.w = pick("Breite|Width|Gesamtbreite");
  out.d = pick("Tiefe|Depth|Gesamttiefe");
  out.h = pick("Höhe|Hoehe|Height|Gesamthöhe");
  if (!out.w) {
    const m = text.match(/(\d{2,3}(?:[.,]\d)?)\s*[x×]\s*(\d{2,3}(?:[.,]\d)?)(?:\s*[x×]\s*(\d{1,3}(?:[.,]\d)?))?\s*cm/i);
    if (m) { out.w = num(m[1]); out.d = num(m[2]); out.h = m[3] ? num(m[3]) : null; }
  }
  return out;
}
function jsonLdProduct(html: string) {
  const blocks = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const b of blocks) {
    try {
      const data = JSON.parse(b[1].trim());
      const list = Array.isArray(data) ? data : data["@graph"] ? data["@graph"] : [data];
      for (const x of list) {
        const t = x && x["@type"];
        if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) return x;
      }
    } catch (_) { /* ungültiges JSON-LD überspringen */ }
  }
  return null;
}

// Nur angemeldete Personen (nicht der öffentliche anon-Schlüssel). Die Signatur prüft Supabase vorher.
function angemeldet(req: Request): boolean {
  try {
    const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const p = JSON.parse(atob(tok.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return p.role === "authenticated" && !!p.email;
  } catch { return false; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (!angemeldet(req)) return json({ error: "Nicht angemeldet" }, 401);
  try {
    const { url } = await req.json();
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return json({ error: "Nur http- und https-Links" }, 400);
    if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[|0\.)/i.test(u.hostname)) return json({ error: "Nur öffentliche Shops" }, 400);
    const page = await fetch(u.href, { headers: { "user-agent": UA, "accept-language": "de-DE,de;q=0.9" }, redirect: "follow" });
    const html = (await page.text()).slice(0, 3_000_000);
    const prod = jsonLdProduct(html);
    let name = prod?.name || meta(html, "og:title") || (html.match(/<title>([^<]+)<\/title>/i) || [])[1] || "";
    name = decode(String(name)).replace(/\s*[-|–]\s*(IKEA|Shop).*$/i, "").trim();
    let image = prod?.image ? (Array.isArray(prod.image) ? prod.image[0] : (prod.image.url || prod.image)) : meta(html, "og:image");
    const offer = prod?.offers ? (Array.isArray(prod.offers) ? prod.offers[0] : prod.offers) : null;
    const preis = offer?.price ? num(String(offer.price)) : null;
    const text = decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
    const dim = dimensions(text);
    let dataUrl: string | null = null;
    if (image) {
      image = new URL(String(image), u.href).href;
      const r = await fetch(image, { headers: { "user-agent": UA } });
      const type = r.headers.get("content-type") || "image/jpeg";
      const buf = new Uint8Array(await r.arrayBuffer());
      if (r.ok && type.startsWith("image/") && buf.length < 4_000_000) {
        let bin = "";
        for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
        dataUrl = `data:${type};base64,${btoa(bin)}`;
      }
    }
    return json({ name, w: dim.w, d: dim.d, h: dim.h, preis, image: dataUrl, shop: u.hostname.replace(/^www\./, "") });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
