# Saudi Sukkari — сайт

Статический сайт компании Saudi Sukkari, размещается на Cloudflare Workers (Static Assets).

## Структура

```
public/
  index.html      — главная страница
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

## Что поменять перед запуском

- Иконка WhatsApp: тег `<svg>` внутри ссылки `wa.me/77081888099` в конце `public/index.html`.
- Ответы в «Частых вопросах», где стоят квадратные скобки `[...]`.
- Разрешение завода Kinza на использование фото и логотипа.
