# Overview del producto

## Qué hay en el repositorio

El repositorio implementa un panel de métricas financieras con interfaz React/TypeScript y una API FastAPI. El README lo presenta como dashboard de métricas (`README.es.md`). La pantalla actual está en `frontend/src/App.tsx`: carga movimientos desde `GET /api/metrics`, muestra tarjetas KPI y gráficas de ingresos/gastos, y deriva las métricas y agregados mensuales en cliente mediante `frontend/src/lib/financial-utils.ts`.

La API está creada en `backend/app/main.py` y las rutas/modelos/cálculos en `backend/app/routes.py`. Las rutas entregan movimientos, facetas, resúmenes, principales categorías, comparación, alertas y subconjuntos B2B/B2C. Los movimientos se generan de manera simulada y determinista con `generate_mock_movements(seed=42)`; no describirlos como registros persistidos.

## Flujo observado

1. `App.tsx` llama a `${VITE_API_BASE_URL}/api/metrics`.
2. Si no se configura un origen, la URL es relativa (`/api/metrics`) y Vite aplica el proxy definido en `frontend/vite.config.ts`.
3. En Compose, el proxy apunta a `http://backend:8000`; ese hostname es resoluble desde la red de Docker Compose, no desde el navegador del usuario.
4. La respuesta se convierte a tipos del frontend y `financial-utils.ts` calcula KPIs y datos mensuales.

## Límites

No se encontró en los archivos examinados una base de datos, login/autenticación, persistencia ni pipeline de producción. La UI existente no consume aún todos los endpoints disponibles. Estas son ausencias observadas, no propuestas de roadmap.
