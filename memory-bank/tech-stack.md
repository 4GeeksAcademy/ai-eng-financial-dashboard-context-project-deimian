# Stack tecnológico verificado

## Frontend

- TypeScript y React (`frontend/package.json`).
- Vite para desarrollo y build (`frontend/package.json`, `frontend/vite.config.ts`).
- Recharts para gráficas; Tailwind CSS mediante plugin de Vite y componentes UI locales en `frontend/src/components/ui/`.
- Vitest para pruebas de utilidades (`frontend/package.json`, `frontend/src/lib/financial-utils.test.ts`).
- Scripts disponibles: `npm run dev`, `npm run build`, `npm run lint`, `npm test`, `npm run test:watch`, `npm run test:coverage` en `frontend/package.json`.

## Backend

- Python con FastAPI, Uvicorn y Pydantic (imports y app en `backend/app/main.py`, `backend/app/routes.py`; paquetes en `backend/requirements.txt`).
- debugpy escucha en el puerto 5678 según `backend/Dockerfile`.
- pytest y TestClient/httpx para pruebas (`backend/requirements.txt`, `backend/tests/test_routes.py`).

## Ejecución e integración

- Docker Compose orquesta los servicios `frontend` y `backend` (`docker-compose.yml`).
- Puertos publicados por Compose: frontend 5173, API backend 8000 y depuración 5678 (`docker-compose.yml`, `backend/Dockerfile`). Confirmar los Browse URLs/visibilidad de Codespaces en Ports; no fijar el hostname dinámico en documentación general.
- Vite reenvía `/api` a `http://backend:8000` en red Compose (`frontend/vite.config.ts`). `VITE_API_BASE_URL` es un override opcional leído por `frontend/src/App.tsx`; `.env.example` es plantilla, no runtime.
- Instalación de frontend en contenedor: `npm install` desde `frontend/Dockerfile`; dependencias backend desde `backend/requirements.txt`.
