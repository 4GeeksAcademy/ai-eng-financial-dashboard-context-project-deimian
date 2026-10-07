# Hallazgos de ingeniería para el handover

Hallazgos derivados de los archivos actuales del repositorio (2026-10-07). Son observaciones con evidencia; las reglas accionables se mantienen en `.agents/rules/`.

## Arquitectura y datos

- La interfaz principal está ensamblada en `frontend/src/App.tsx`. Su `fetchFinancialData()` consulta `GET /api/metrics`; KPIs y agregación mensual se calculan en `frontend/src/lib/financial-utils.ts`. Riesgo: añadir una cifra o visualización sin entender si ya existe una transformación cliente puede duplicar o desalinear cálculos.
- Los modelos, generación determinista, filtros, cálculos y handlers API conviven en `backend/app/routes.py`. `backend/app/main.py` instala CORS y registra ese router. Riesgo: una nueva ruta debe respetar modelos/filtros existentes y ser añadida a las pruebas; no asumir que hay almacenamiento persistente.
- `generate_mock_movements(seed=42)` genera los datos usados por varios handlers. Mantener la semilla ayuda a que los endpoints y pruebas sigan siendo reproducibles.

## Integración y entorno

- `frontend/vite.config.ts` configura `/api` como proxy hacia `http://backend:8000`; `docker-compose.yml` da al servicio backend el nombre DNS `backend`. Es una dirección interna de Compose, no una URL para el navegador.
- `frontend/src/App.tsx` antepone `import.meta.env.VITE_API_BASE_URL` a `/api/metrics`. `frontend/.env.example` es una plantilla, no un archivo que Vite cargue directamente; para usar un origen público/alternativo hace falta un archivo de entorno reconocido por Vite y reiniciar el proceso para que tome cambios.
- Los puertos salen de `docker-compose.yml`: 5173 para Vite; 8000 para FastAPI; 5678 para debugpy en `backend/Dockerfile`. En Codespaces hay que confirmar la URL reenviada en la pestaña Ports; no inferir dominio ni visibilidad a partir de un ejemplo.

## Pruebas y contratos

- Backend: `backend/tests/test_routes.py` usa `TestClient`, comprueba `/health`, contratos JSON, filtros, orden y endpoints específicos. Al cambiar route/query/modelo, ampliar esos tests siguiendo el patrón.
- Frontend: `frontend/src/lib/financial-utils.test.ts` prueba funciones puras de `financial-utils.ts` con Vitest. Cuando el cambio modifica cálculo/agrupación/formato, cubrirlo ahí; no confundir pruebas de utilidades con pruebas de render o integración, que no están presentes en esta suite.
- Validación observada en esta fase: backend 15 pruebas aprobadas y frontend 5; existe warning de deprecación de Starlette/httpx, no un fallo.

## Herramientas y estilo visible

- Frontend es ESM (campo `type: module`) con scripts en `frontend/package.json`: `dev`, `build`, `lint`, `test`, `test:watch`, `test:coverage`. La config TypeScript y alias `@` a `frontend/src` están en `frontend/tsconfig*.json` y `frontend/vite.config.ts`.
- Los componentes del dashboard reciben datos por props y consumen funciones de `financial-utils` para formatos/cálculos (`frontend/src/components/dashboard/kpi-row.tsx`, `income-outcome-chart.tsx`). Al añadir UI, inspeccionar primero los tipos en `frontend/src/lib/financial-types.ts` y componentes compartidos en `frontend/src/components/ui/`.
- El estilo no es completamente uniforme: algunos módulos usan comillas simples y otros dobles; no imponer una convención global nueva durante una tarea funcional. Aplicar el formato de los archivos vecinos.

## Límites de evidencia

- No se verificó una base de datos, autenticación, pipeline CI ni despliegue de producción; no documentarlos como capacidades.
- `.agents/rules` y `memory-bank` no existían al inicio de esta tarea. Las reglas que se creen aquí son propuestas verificables, no convenciones históricas ya adoptadas.
