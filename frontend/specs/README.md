# Contrato de datos de las nuevas funcionalidades

Esta carpeta contiene especificaciones frontend, no implementación. La API actual usa datos simulados y deterministas. Los nombres de ruta, query y respuesta de abajo se contrastaron con `backend/app/routes.py` y el OpenAPI servido localmente en `/openapi.json` (`/docs`). El frontend actual (`src/App.tsx`) consume únicamente `GET /api/metrics`; las funcionalidades siguientes aún no están implementadas.

## Tipos compartidos

- Respuestas: `FacetsResponse`, `AlertEntry`, `AlertsResponse`, `AlertTableRow` (modelo derivado frontend), `CategoryEntry`, `TopCategoriesResponse`, `MetricsSummaryEntry`, `MetricsSummaryResponse` en `api-types.ts`.
- Parámetros: `DateRangeFilter`, `AlertsParams`, `TopCategoriesParams`, `SummaryParams` en `param-types.ts`.
- Los valores financieros son `number`. Las fechas query y las fechas facet son strings ISO `YYYY-MM-DD`.
- Los enums reutilizan los tipos del proyecto: `OperationType = "income" | "outcome"`, `BusinessType = "B2B" | "B2C"`; categorías: `suppliers | sales | operational | administrative | others`.

## Funcionalidad 1 — Filtro de rango de fechas

### Endpoints

1. `GET /api/metrics/facets` → `FacetsResponse`:
   - `min_date` y `max_date` proporcionan los extremos inclusivos del dataset como fecha ISO.
   - También devuelve `operation_types`, `business_types` y `categories` globales. No acepta parámetros.
2. `GET /api/metrics` → `FinancialMovement[]` (tipo existente en `src/lib/financial-types.ts`):
   - Query opcionales `start_date`, `end_date`, `category`, `operation_type`.
   - `start_date`/`end_date` son límites inclusivos. Enviar solo los límites no vacíos.
   - La pantalla principal debe aplicar el rango a todos los datos mostrados. Los endpoints que alimenten paneles agregados deben recibir los mismos límites cuando los admitan.

### Reglas de UI

Ambas fechas vacías significa todos los datos; una fecha presente significa filtrar solo por ese límite. El rango se muestra como referencia cerca de los inputs, basado en `min_date`–`max_date`, no como límite rígido de entrada. Si inicio supera fin, informar el error y no ejecutar una consulta con rango invertido.

### Casos límite

1. **Ambos inputs vacíos:** omitir `start_date` y `end_date`; mostrar el dataset completo.
2. **Solo inicio o solo fin:** enviar solo el límite introducido; conservar el otro extremo abierto.
3. **Rango sin movimientos / fuera del período disponible:** conservar el rango seleccionado y mostrar el estado vacío del contenido, sin error de API ficticio.
4. **Inicio posterior al fin:** mostrar validación accesible y no refrescar datos con rango inválido.

## Funcionalidad 2 — Tabla de alertas

### Endpoints

- `GET /api/metrics/alerts` → `AlertsResponse` (`AlertEntry[]`). Query:
  - `threshold`: number, opcional, default `0.3`, restricción de backend `>= 0`.
  - `group_by`: `day | week | month`, opcional, default `month`.
  - `start_date`, `end_date`: fechas ISO opcionales e inclusivas.
  - `business_type`: `B2B | B2C`, opcional.
- Para cumplir la media móvil de 3 períodos pedida por producto, también usar `GET /api/metrics/summary` → `MetricsSummaryResponse`, con `group_by`, límites y `business_type` correspondientes. Los elementos contienen `period`, `income`, `outcome`, `net`.
- Nota de rango: el handler filtra movimientos por fechas y luego agrega. Con `group_by=month` (default), un primer/último período que solo está parcialmente dentro del rango puede representar un mes parcial, no todo el mes calendario. Los períodos devueltos son únicamente períodos con movimientos; los períodos ausentes no se rellenan automáticamente con cero.

### Reglas de UI y decisión semántica

El control de producto valida `threshold` en el rango inclusivo `0.01–1.0`, por defecto `0.3`; esto es más estricto que la API, que solo declara `ge=0`. Enviar ratio decimal: `0.3` significa 30%.

**Desajuste verificado:** el handler de alerts resume los datos y calcula para cada período el promedio de todos los outcomes de períodos anteriores disponibles. Su propiedad `baseline_average` no es una media móvil de tres. Además, crea alerta solo cuando el aumento es estrictamente superior al threshold. La especificación de producto exige los tres períodos anteriores, por lo que para implementar literalmente la columna solicitada se debe derivar la media móvil desde `summary` y construir filas `AlertTableRow`: para cada período que tenga tres períodos anteriores, promedio de los tres outcomes cronológicos inmediatamente previos (sin tratar períodos de calendario ausentes como cero), y `increase_ratio = (outcome - rolling_average) / rolling_average` cuando el promedio sea positivo. No se genera ratio si baseline es cero. Aplicar el umbral con condición estricta `ratio > threshold`, en consistencia con API. `GET /api/metrics/alerts` puede servir para la semántica backend existente, pero no puede usarse como fuente directa de la media móvil solicitada. Confirmar/aceptar esta regla antes de implementación.

Las columnas son período, outcome del período, media de los tres períodos previos e incremento porcentual. Fechas y umbral deben ser los mismos en cualquier consulta asociada. Mostrar `increase_ratio * 100` como porcentaje. La consulta a summary debe incluir datos históricos previos al inicio visible si el usuario seleccionó una fecha de inicio; de lo contrario no se puede calcular la media móvil del primer período mostrado. Como la API no ofrece un parámetro previo ni una respuesta de contexto, la capa de datos debe solicitar suficiente historial previo (p. ej. datos de todo el rango disponible según facets) y filtrar la visualización al rango seleccionado después del cálculo.

### Casos límite

1. **Respuesta vacía (`[]`):** renderizar tabla/área y mensaje explícito «No se detectaron anomalías para este período y umbral»; no desmontar la sección.
2. **Threshold menor que `0.01`, mayor que `1.0`, infinito o no numérico:** mostrar validación y no enviar consulta. Aunque algunos valores positivos fuera de UI serían aceptados por backend, no son válidos para el control especificado.
3. **Sin tres períodos previos o baseline igual a cero:** no calcular/mostrar una anomalía para ese período (división por cero/no comparable); la tabla puede acabar vacía.
4. **Fallo al cargar:** presentar error con opción de reintentar, distinto del estado vacío.

## Funcionalidad 3 — Comparativa de ingresos B2B vs B2C

### Endpoints

1. `GET /api/metrics/facets` → `FacetsResponse`, sin parámetros. `business_types` confirma los segmentos disponibles y `categories` enumera categorías globales, no por segmento.
2. Dos solicitudes a `GET /api/metrics/categories/top` → `TopCategoriesResponse`:
   - `operation_type=income` (válidos API: `income | outcome`), `limit=5` (API acepta entero `1–20`; default `5`), `business_type=B2B` o `B2C`.
   - `start_date`/`end_date` opcionales en formato ISO y límites inclusivos.
   - Respuesta `CategoryEntry[]`: `category`, `operation_type`, `total_amount`. Las filas están ordenadas de mayor importe a menor y limitadas por `limit`.
3. Para el gráfico y el denominador porcentual, dos solicitudes a `GET /api/metrics/summary` con `operation_type=income`, fechas y cada `business_type`, `group_by=month` (o agregación que abarque todo el rango). Sumar `income` de todos los períodos devuelve el total de ingresos del grupo. Alternativamente, pedir `/api/metrics` para cada grupo/rango y sumar `amount` de movimientos `income`. No sumar solo las 5 categorías: eso no equivale necesariamente al total del grupo.

### Reglas de presentación

Los paneles paralelos muestran top-5 de categorías con importe y `total_amount / total de ingresos del grupo * 100`. Si el total del grupo es cero, porcentaje `0%`. El gráfico único bajo los paneles contiene exactamente dos valores: total de ingresos B2B y total de ingresos B2C para el mismo rango; no muestra neto ni únicamente el subtotal del top 5. Los porcentajes de fila pueden sumar menos de 100% porque el denominador es el total de ingresos del grupo.

`facets.categories` no devuelve un listado separado por negocio y no debe utilizarse como si filtrara categorías por segmento. Los resultados del endpoint top son la fuente por grupo; facets provee vocabulario global y opciones disponibles.

### Casos límite

1. **Top-5 vacío para B2B o B2C:** mostrar el título del panel y estado vacío específico; el otro panel y el gráfico siguen visibles.
2. **Total de ingresos de un grupo igual a cero:** mostrar total `$0` y `0%` en cada fila si existiera alguna; no dividir por cero.
3. **Rango opcional vacío:** omitir ambos límites en ambas consultas y comparar el mismo dataset completo.
4. **Una solicitud de panel falla:** indicar error en el panel afectado, no presentarlo como resultado vacío; el panel restante conserva sus datos. En el gráfico indicar error si no se pueden determinar los dos totales.

## Verificación / alcance

La documentación de parámetros se verificó con la especificación OpenAPI local de FastAPI y con handlers/modelos en `backend/app/routes.py`. La app actual agrega `VITE_API_BASE_URL` a sus llamadas (vacío por defecto) y Vite proxya `/api` a backend en desarrollo. Esto no habilita ni implementa las llamadas descritas aquí. No añadir componentes React ni llamadas de red como parte de esta entrega de especificación.
