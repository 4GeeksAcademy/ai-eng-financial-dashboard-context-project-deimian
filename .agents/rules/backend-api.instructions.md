---
applyTo: "backend/**/*.py"
---
# Reglas para la API del backend

- Antes de cambiar un endpoint, inspecciona los modelos, helpers y handlers relacionados en `backend/app/routes.py`; las respuestas se tipan con modelos Pydantic y los handlers ya comparten filtros/cálculos.
- Conserva el carácter determinista de los datos simulados usando `generate_mock_movements(seed=42)` cuando el cambio dependa del dataset existente. No describas ni implementes persistencia sin evidencia/configuración explícita.
- Mantén filtros, tipos y respuestas coherentes con `OperationType`, `Category`, `BusinessType` y los modelos Pydantic definidos en `backend/app/routes.py`.
- Si cambias una ruta, parámetro, filtro o forma de respuesta, añade o ajusta cobertura en `backend/tests/test_routes.py`; incluye una comprobación de status y contenido relevante.
- Valida con `docker compose exec -T backend pytest -q` (o desde `backend/` con `pytest -q` si el entorno tiene dependencias instaladas). La app se expone desde `backend/app/main.py` y su endpoint de salud es `/health`.
