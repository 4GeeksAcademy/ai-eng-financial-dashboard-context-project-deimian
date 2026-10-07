---
applyTo: "{docker-compose.yml,frontend/vite.config.ts,frontend/.env*,backend/Dockerfile,frontend/Dockerfile}"
---
# Reglas para ejecución, proxy y entorno

- Trata `docker-compose.yml` como fuente de verdad para servicios, mapeos de puertos y volúmenes; confirma con `docker compose config` si tienes duda. No inventes puertos.
- En ejecución Compose, el proxy `/api` de `frontend/vite.config.ts` apunta al hostname interno `http://backend:8000`. No pongas ese hostname en una URL usada directamente por el navegador.
- `frontend/.env.example` es una plantilla. Vite carga nombres `.env`, `.env.local` y variantes documentadas por Vite; después de cambiar variables reinicia Vite/contenedor para aplicarlas.
- Si el usuario necesita un backend fuera del proxy, `VITE_API_BASE_URL` debe contener un origen accesible desde el navegador y sin duplicar `/api`, porque `frontend/src/App.tsx` agrega `/api/metrics`.
- En Codespaces, confirma el Browse URL y la visibilidad desde la pestaña Ports; el dominio y la URL reenviada dependen del Codespace. El puerto 5678 corresponde a debugpy según `backend/Dockerfile`, no a HTTP de FastAPI.
- Para comprobar el stack: `docker compose ps`, `docker compose logs -f`, `GET /health` y `/docs` en el backend; usa un endpoint `/api/...` real antes de concluir que la API responde.
