# Verificación del handover — Fase 1

Fecha: 2026-10-07

## Resumen contrastado

| Afirmación | Estado | Evidencia / corrección |
|---|---|---|
| El producto es un panel de métricas financieras con React + TypeScript y FastAPI. | ✅ Verificada | `README.es.md`; frontend en `frontend/src/App.tsx`; API en `backend/app/main.py`. |
| El frontend consume todas las capacidades de la API. | ❌ Incorrecta | `frontend/src/App.tsx` solo llama `GET /api/metrics` y calcula KPIs/serie mensual en cliente con `frontend/src/lib/financial-utils.ts`. La API también ofrece facets, summary, categorías, comparación, alerts y datos B2B/B2C en `backend/app/routes.py`; que existan no implica que el dashboard actual los use. |
| La API usa datos conectados a una base persistente. | ❌ Incorrecta | `backend/app/routes.py` genera 360 movimientos simulados con `generate_mock_movements(seed=42)`; no se encontró configuración de base de datos en los entry points y dependencias revisados. |
| Compose es el arranque documentado. | ✅ Verificada | `README.es.md` recomienda `docker compose up --build`; `docker-compose.yml` define `frontend` y `backend`. |
| Puertos publicados. | ✅ Verificados | `docker-compose.yml`: frontend `5173:5173`, backend `8000:8000` y `5678:5678`. `docker compose config` confirmó esos mapeos en el entorno actual. `5678` es el puerto de debug publicado por `backend/Dockerfile`, no el HTTP de la API. |
| Estado de ejecución durante esta verificación. | ✅ Verificado | `curl` local devolvió HTTP 200 para `http://localhost:5173/`, `http://localhost:8000/docs` y `http://localhost:8000/api/metrics`. Los puertos documentados también corresponden a las URLs 5173 y 8000 de Codespaces; la URL pública debe copiarse de Ports para el Codespace actual. |
| Salud de las pruebas existentes. | ✅ Verificada | `docker compose exec -T backend pytest -q`: 15 passed. `docker compose exec -T frontend npm test -- --run`: 5 passed. Backend emite un warning de deprecación de Starlette/httpx, sin fallos. |

## Arranque validado

Desde la raíz: `docker compose up --build`. Frontend en puerto 5173, API en 8000 y documentación FastAPI en `/docs`. Con Docker Compose, Vite reenvía `/api` a `http://backend:8000` según `frontend/vite.config.ts`; ese nombre DNS es interno a Compose. `frontend/src/App.tsx` usa `VITE_API_BASE_URL` si está definida, por lo que un override debe ser un origen accesible desde el navegador, no el hostname interno `backend`.

## Corrección del diagnóstico inicial del 504

- ❌ La URL `https://super-sniffle-wg957j9wq673556v-8000.app.github.dev` no era inválida: en las pruebas de esta sesión `/docs` y `/api/metrics` respondieron HTTP 200.
- ✅ El `.env.example` no activa una variable automáticamente: Vite carga `.env`/`.env.local`, no `.env.example`.
- ✅ Durante el primer diagnóstico, la ruta por proxy en Vite agotó el tiempo aunque la petición alcanzó el backend; después, las comprobaciones locales directas y suites pasaron. No se atribuye el 504 a un fallo del backend sin reproducirlo de nuevo.

## Validación de reglas — Fase 3

- `.agents/rules/frontend.instructions.md` prescribe cubrir cálculos puros en `frontend/src/lib/financial-utils.test.ts` con Vitest.
- Como tarea real pequeña, se agregaron pruebas de lista vacía para `computeKPIs` y `computeMonthlyData`. La primera conserva métricas en cero y la segunda devuelve una serie vacía; no se cambió código de producto.
- Validación: `docker compose exec -T frontend npm test -- --run` — 7 passed; `docker compose exec -T frontend npm run lint` — sin errores.
- `.agents/rules/backend-api.instructions.md` y `runtime-and-env.instructions.md` se contrastaron contra los entry points, rutas, Compose y Dockerfiles citados; esta sesión no afirma haber hecho una tarea de cambio de API para simular una prueba de esas reglas.

## Límites

No se hizo fork en esta sesión: el remoto `origin` apunta al repositorio de trabajo `4GeeksAcademy/ai-eng-financial-dashboard-context-project-deimian`, mientras `upstream` apunta al repo base. No se cambió configuración de entorno; los archivos `.env` del usuario se mantuvieron fuera de esta fase.
