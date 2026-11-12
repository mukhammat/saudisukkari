# Saudi Sukkari — сайт

Статический сайт компании Saudi Sukkari, размещается на Cloudflare Workers (Static Assets).

## Структура

```
public/
  index.html      — главная страница (вариант «Trade Direct» с квизом)
  sukkari-drinks.html — посадочная Sukkari Drinks (/sukkari-drinks), «в наличии на складе»
  variants/       — 5 вариантов дизайна для сравнения (/variants/, закрыты от поисковиков)
  images/         — фото (Kinza, финики, производство)
wrangler.jsonc    — настройки Cloudflare Workers
```

## Локальный запуск

```
npm install
npm run dev
```

## Деплой

Вручную:

```
npx wrangler login
npm run deploy
```

Автоматически: Cloudflare → Workers & Pages → Create → Import a repository → выбрать `mukhammat/saudisukkari`.
Build command: пусто, Deploy command: `npx wrangler deploy`. После этого каждый push в `main` обновляет сайт.
Проверить, что сборка запустилась: Cloudflare → Workers & Pages → `saudisukkari` → Deployments.

## Заявки и аналитика

- Заявки из квиза сохраняются в Cloudflare KV: Storage & Databases → KV → `saudisukkari-leads`. Параллельно, как и раньше, открывается WhatsApp с готовым текстом.
- Уведомления в Telegram: создать бота у @BotFather, затем `npx wrangler secret put TG_BOT_TOKEN` и `npx wrangler secret put TG_CHAT_ID`.
- В заявку попадает источник: utm-метки, yclid (Директ), gclid (Google Ads).
- Яндекс Метрика и Google Analytics: вписать `YM_ID` и `GA_ID` в `public/js/analytics.js` (общий для всех страниц). Цели (JavaScript-событие): `quiz_start`, `quiz_step2`, `quiz_step3`, `lead_submit`, `whatsapp_click`, `phone_click`.
- Политика обработки персональных данных: `public/privacy.html` (адрес `/privacy`).

## Что проверить перед запуском

- Реальные факты вместо общих фраз: годы работы, число поставок, города (блок под списком на первом экране).
- Отзывы клиентов и живое фото/видео команды в Саудовской Аравии — пока их на сайте нет.
- Ассортимент: сорта фиников и вкусы Kinza в карточках «Что везём прямо сейчас».
- График работы «Пн–Сб» в верхней полосе.
- Разрешение завода Kinza на использование фото и логотипа.
