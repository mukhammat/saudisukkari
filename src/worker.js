// Worker: принимает заявки из квиза (/api/lead), сохраняет их в KV
// и, если заданы секреты TG_BOT_TOKEN и TG_CHAT_ID, присылает уведомление в Telegram.
// Всё остальное отдаётся как статика из ./public.

const FIELDS = ['need', 'vol', 'name', 'phone', 'city', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid', 'gclid', 'referrer', 'page'];

function clean(v, max = 300) {
  return String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}

async function handleLead(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'bad json' }, { status: 400 });
  }
  const lead = {};
  for (const k of FIELDS) lead[k] = clean(data[k]);
  if (!lead.name || !lead.phone || lead.phone.replace(/\D/g, '').length < 6) {
    return Response.json({ ok: false, error: 'name and phone required' }, { status: 400 });
  }
  lead.at = new Date().toISOString();
  lead.country = request.cf?.country || '';
  lead.ip_city = request.cf?.city || '';

  const key = `lead:${lead.at}:${crypto.randomUUID().slice(0, 8)}`;
  if (env.LEADS) await env.LEADS.put(key, JSON.stringify(lead));

  if (env.TG_BOT_TOKEN && env.TG_CHAT_ID) {
    const src = lead.utm_source ? `${lead.utm_source}/${lead.utm_medium}/${lead.utm_campaign}` + (lead.utm_term ? ` · «${lead.utm_term}»` : '') : (lead.yclid ? 'Яндекс Директ' : lead.gclid ? 'Google Ads' : (lead.referrer || 'прямой заход'));
    const text = [
      '🟢 Новая заявка с сайта',
      `Товар: ${lead.need}`,
      `Объём: ${lead.vol}`,
      `Имя/компания: ${lead.name}`,
      `Телефон: ${lead.phone}`,
      lead.city && `Город: ${lead.city}`,
      `Источник: ${src}`,
      `Страна по IP: ${lead.country} ${lead.ip_city}`.trim(),
    ].filter(Boolean).join('\n');
    try {
      await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text }),
      });
    } catch {}
  }
  return Response.json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/lead') {
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
      return handleLead(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
