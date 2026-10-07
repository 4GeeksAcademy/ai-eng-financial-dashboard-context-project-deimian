---
applyTo: "frontend/src/**/*.{ts,tsx}"
---
# Reglas para el frontend

- Antes de añadir o modificar métricas, comprueba `frontend/src/App.tsx`, `frontend/src/lib/financial-types.ts` y `frontend/src/lib/financial-utils.ts`: actualmente la app consume `GET /api/metrics` y deriva KPIs/agregación mensual en cliente.
- Reutiliza los tipos `FinancialMovement`, `KPIMetrics` y `MonthlyDataPoint`; mantén cálculos y formatos compartidos en `financial-utils.ts` en vez de duplicarlos en componentes.
- Sigue el patrón visible de componentes dashboard: datos por props, estado de carga donde aplique, componentes UI compartidos y componentes de Recharts (`frontend/src/components/dashboard/`). Usa el estilo del archivo vecino; no hagas reformateo masivo por diferencias existentes de comillas.
- Para cambiar cálculos, agrega un caso en `frontend/src/lib/financial-utils.test.ts`; la suite existente es Vitest y se ejecuta con `cd frontend && npm test` o `docker compose exec -T frontend npm test -- --run`.
- No afirmes que la interfaz consume todos los endpoints: su consumo real se comprueba en `App.tsx`; las capacidades backend están definidas aparte en `backend/app/routes.py`.
