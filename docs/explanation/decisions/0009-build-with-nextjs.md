---
status: accepted
date: 2026-10-28
decision-makers: repository owner
---

# 0009: Build with Next.js

## Context and problem statement

The project had docs and a workflow but no code. v0.1 needs pages, a login and server code, and it will be deployed, so the project needs a framework before anything can be checked, deployed or given a login. TypeScript is a given. Which framework should the app be built with?

## Decision drivers

- One codebase for pages and server code.
- Deploys on Vercel with no setup.
- A small team: one framework, one build, one deploy.
- Room to grow: server-rendered pages and server-side data fetching are built in.

## Considered options

1. **Next.js**
2. A Vite single-page app with API functions
3. NestJS with a separate frontend

## Decision outcome

Chosen option: **"Next.js"**, with the App Router and Cache Components (`cacheComponents: true`, `partialPrefetching: true`), because it covers pages and server code in one app that Vercel builds natively.

Cache Components is Next.js's recommended model since 16.4 and becomes the default in Next.js 17, so starting on it avoids a later migration.

### Consequences

- Good, because there's one project to build, test and deploy.
- Good, because the app starts on the model Next.js is moving to.
- Bad, because the app is tied to Next.js conventions (App Router, Server Components, Cache Components), and some tools lag behind them. For example, Vitest can't test async Server Components.
- Bad, because Next.js is maintained by Vercel, so the framework and the host come from the same company.

### Confirmation

- `package.json` depends on `next`, and the app lives in `src/app/`.
- `next.config.ts` sets `cacheComponents: true` and `partialPrefetching: true`.

## Pros and cons of the options

### A Vite single-page app with API functions

- Good, because Vite is fast and simple, and the frontend is plain React with no framework conventions.
- Bad, because the API functions are a separate piece, with their own routing and deploy setup.
- Bad, because pages render in the browser only, so server rendering and server-side data fetching would have to be added by hand.

### NestJS with a separate frontend

- Good, because NestJS gives the backend a strong structure (modules, dependency injection) for a large API.
- Bad, because it needs a whole second frontend project, which means two builds and two deploys, more than a small team needs.

## More information

- Next.js: <https://nextjs.org/>
- Cache Components is recommended since 16.4 and becomes the default in 17: [Next.js 16.4](https://nextjs.org/blog/next-16-4)
- Vite: <https://vite.dev/>
- NestJS: <https://nestjs.com/>
- Issue: [#25](https://github.com/football-toolkit/squadhopper/issues/25)
