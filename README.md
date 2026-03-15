# student-world

Browser-first OGL 200 leadership MVP built around:

- Express + Socket.IO + LTI 1.3
- Postgres via Docker Compose
- React + TypeScript + Babylon.js
- OpenAI `gpt-5.1-2025-11-13` for bounded debrief/reflection text

## Local development

1. Copy `.env.example` to `.env`.
2. Start Postgres:

```bash
npm run db:up
```

3. Start the backend:

```bash
npm run dev
```

4. Start the web client in a second terminal:

```bash
npm run web:dev
```

The web client runs on `http://localhost:5173` and the backend runs on `http://localhost:3000`.

## Implemented MVP flow

1. Avatar selection from a preset avatar library
2. Globe pin onboarding
3. Leadership Profile
4. 3D hub
5. Module 2 boardroom scenario
6. AI debrief and reflection

## Notes

- The current avatar catalog is seeded in Postgres and rendered with procedural Babylon stand-ins so the flow works before real GLB assets are added.
- OpenAI is optional at runtime. If `OPENAI_API_KEY` is missing or the request fails, the server falls back to deterministic local debrief text.
- All core onboarding and scenario state is persisted in Postgres.
- Backend logs are structured JSON via `pino`; the frontend can report fatal errors through `POST /api/client-log`.
