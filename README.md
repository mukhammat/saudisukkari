# Saudi Sukkari — сайт

Статический сайт компании Saudi Sukkari, размещается на Cloudflare Workers (Static Assets).

## Структура

```
public/
  index.html      — главная страница (вариант «Trade Direct» с квизом)
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

## Что проверить перед запуском

- Реальные факты вместо общих фраз: годы работы, число поставок, города (блок под списком на первом экране).
- Отзывы клиентов и живое фото/видео команды в Саудовской Аравии — пока их на сайте нет.
- Ассортимент: сорта фиников и вкусы Kinza в карточках «Что везём прямо сейчас».
- График работы «Пн–Сб» в верхней полосе.
- Разрешение завода Kinza на использование фото и логотипа.
