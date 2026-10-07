# Estado actual del proyecto

Última verificación: 2026-10-07.

## Estado comprobado

- Los contenedores Compose estuvieron activos durante la inspección; frontend, `/docs` y `/api/metrics` respondieron HTTP 200 localmente.
- Backend: 15 pruebas aprobadas con `docker compose exec -T backend pytest -q`.
- Frontend: 7 pruebas aprobadas con `docker compose exec -T frontend npm test -- --run`; `docker compose exec -T frontend npm run lint` terminó sin errores.
- Hay un warning de deprecación de `starlette.testclient` relacionado con httpx en la suite backend, pero las pruebas pasan.
- La UI usa el endpoint de movimientos y presenta un panel de KPI/gráficas; existen handlers de API adicionales que la UI aún no consume.

## Gaps observados (no roadmap)

- Los datos backend son simulados y no persistentes (`backend/app/routes.py`).
- La cobertura frontend observada es de funciones de `financial-utils.ts`; no se encontraron pruebas de render/integración en los archivos y scripts revisados.
- El warning de deprecación en tests backend puede requerir atención futura si la combinación de versiones cambia.
- No se verificaron pipeline CI, despliegue productivo, persistencia o autenticación; evitar presentar estos puntos como implementados.

## Entorno local del autor

El checkout tiene cambios locales de `.env`: `frontend/.env.example` está modificado y existe un `.env.example` no rastreado en la raíz. Se dejaron deliberadamente fuera de los commits de stewardship. No son parte de la configuración recomendada ni deben copiarse sobre entornos de otras personas.
