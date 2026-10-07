# Especificación de componentes

Este documento especifica la UI, no la implementa. Los tipos importados se definen en `api-types.ts` y `param-types.ts`. Los import paths son relativos a `frontend/specs/`.

## Funcionalidad 1 — Filtro de rango de fechas

### `DateRangeFilter`

Control compacto situado en la parte superior del dashboard principal, cerca del título/indicador del período y antes de los KPIs y gráficos. Incluye dos inputs nativos de fecha con etiquetas accesibles: **Desde** y **Hasta**.

| Prop | Tipo | Descripción |
|---|---|---|
| `value` | `DateRangeFilter` | Límites actuales opcionales `start_date` / `end_date`, en `YYYY-MM-DD`. |
| `availableRange` | `Pick<FacetsResponse, "min_date" \| "max_date">` | Rango de datos disponible para mostrar como pista, no como valores obligatorios. |
| `onChange` | `(value: DateRangeFilter) => void` | Notifica cambios del filtro; omite claves vacías. |

**Comportamiento:**

- Cargar el rango de referencia desde `FacetsResponse.min_date` y `max_date`; mostrar una pista como «Datos disponibles: `min_date` – `max_date`» junto a los controles.
- Los límites son inclusivos según el filtrado de la API.
- Si ambos inputs están vacíos, quitar ambos parámetros y mostrar el dataset completo disponible.
- Si solo uno está relleno, enviar únicamente ese límite. No completar automáticamente el otro límite.
- Si `start_date > end_date`, marcar el rango como inválido, mostrar una explicación accesible y no solicitar/actualizar datos hasta que el rango sea válido. No invertir fechas silenciosamente.
- Las fechas fuera del rango sugerido se pueden introducir; la referencia informa del rango disponible, no es una restricción de API. Si la selección válida produce datos vacíos, conservarla y mostrar el estado vacío correspondiente en el dashboard.

**Efecto en la página:** los mismos límites deben aplicarse a todos los datos visibles que soporten fechas. El dashboard actual obtiene `/api/metrics`; este endpoint acepta ambos filtros. Cualquier panel nuevo también debe recibir el rango activo.

## Funcionalidad 2 — Alertas de anomalías

### `AlertThresholdControl`

Input numérico asociado a la tabla. Su valor inicial es `0.3`; rango aceptado en UI: `0.01` a `1.0` inclusive. No debe enviar valores inválidos. Los valores válidos se envían como ratio (p. ej. `0.3` equivale a 30%).

| Prop | Tipo | Descripción |
|---|---|---|
| `value` | `number` | Ratio actual. |
| `min` | `0.01` | Mínimo inclusivo requerido por producto. |
| `max` | `1` | Máximo inclusivo requerido por producto. |
| `onChange` | `(value: number) => void` | Actualiza el umbral únicamente si es finito y está dentro de rango. |

Fuera de rango, bloquear/refusar la consulta y mostrar validación junto al control; no ajustar silenciosamente al mínimo/máximo. En estado transitorio vacío mientras se edita, no enviar el valor.

### `OutcomeAlertsTable`

Se sitúa bajo los gráficos existentes. Recibe `alerts: AlertsResponse` y representa los registros recibidos en una tabla semántica.

| Columna | Campo/tipo | Presentación |
|---|---|---|
| Período | `AlertEntry.period: string` | Clave según `group_by`: día `YYYY-MM-DD`, semana `YYYY-Www`, mes `YYYY-MM`. |
| Outcome registrado | `AlertEntry.outcome_total: number` | Importe monetario formateado como moneda. |
| Media de referencia | `AlertEntry.baseline_average: number` | Importe monetario formateado como moneda; aclarar que el backend calcula el promedio de **todos** los períodos anteriores del resumen. |
| Incremento porcentual | `AlertEntry.increase_ratio: number` | Multiplicar por 100 para mostrar porcentaje (p. ej. `0.3` → `30%`). |

**Estados condicionales:**

- `alerts.length === 0`: no ocultar la tabla; mostrar un estado vacío explícito, por ejemplo «No se detectaron anomalías para este período y umbral».
- Mientras carga: mostrar estado de carga dentro del área de la tabla.
- Error de consulta: mostrar mensaje de error y ofrecer reintento; no presentar como si no hubiera anomalías.
- Si hay resultados: mostrar encabezados y todas las filas en el orden recibido.

**Semántica de la alerta y desajuste con PM:** `GET /api/metrics/alerts` calcula `baseline_average` usando todos los períodos previos del resumen ordenado y alerta cuando `increase_ratio > threshold` (estrictamente mayor). No calcula media móvil de tres períodos. Para coincidir con la columna solicitada de «media móvil de los 3 períodos anteriores», la capa de datos debe obtener `/api/metrics/summary` con el mismo `group_by` y tipo de negocio, incluir historial anterior suficiente, calcular la media de los tres períodos cronológicos inmediatamente previos para cada período mostrado y derivar su ratio. No rellenar con cero períodos ausentes; omitir alertas antes de contar con tres períodos previos o cuando la media sea cero. La tabla debe consumir un modelo de vista adaptado por esa capa, no afirmar que `baseline_average` equivale a esa media móvil. Si se decide usar el endpoint de alertas tal cual, producto debe aceptar explícitamente el cambio semántico antes de implementar.

### `AlertsSection`

Composición del control de umbral y tabla; recibe el rango de fechas activo, propaga fechas a la consulta y expone carga/error. Fechas iguales a las del filtro del dashboard: `start_date`/`end_date` opcionales.

## Funcionalidad 3 — Comparativa B2B vs B2C

### `BusinessComparisonPage`

Nueva vista/página alcanzable desde la navegación del dashboard. Mantiene un filtro de fechas compartido para ambos grupos y presenta paneles en paralelo en escritorio y apilados en pantallas estrechas. El gráfico común aparece bajo ambos paneles.

### `BusinessComparisonPanel`

Se renderiza una vez con `businessType="B2B"` y otra con `businessType="B2C"`.

| Prop | Tipo | Descripción |
|---|---|---|
| `businessType` | `BusinessType` | Identifica el título del panel. |
| `categories` | `TopCategoriesResponse` | Top categorías de ingreso del segmento, con máximo 5. |
| `incomeTotal` | `number` | Total de ingresos de todo el segmento y rango (no solo la suma del top 5); se usa para calcular porcentajes y gráfico. |
| `loading` | `boolean` | Indica carga. |
| `error` | `string \| null` | Error específico del panel si la petición falla. |

La tabla tiene columnas categoría (`CategoryEntry.category`), total de ingresos (`CategoryEntry.total_amount`) y porcentaje del total del grupo (`total_amount / incomeTotal * 100`). Si `incomeTotal` es 0, mostrar `0%` en lugar de dividir por cero. No redondear el dato subyacente; presentación sugerida con una cifra decimal.

**Estados vacíos:** si un top-5 está vacío, el panel correspondiente mantiene título y tabla/área visible y muestra «No hay categorías de ingresos para este grupo en el rango seleccionado». El otro panel sigue funcionando independientemente. Cuando `incomeTotal` sea 0, mostrar total `$0` y porcentajes `0%`.

### `BusinessIncomeComparisonChart`

Un gráfico comparativo compartido bajo los paneles. Recibe `b2bIncome: number`, `b2cIncome: number`, `loading: boolean` y `error: string | null`. Representa exactamente dos categorías/puntos: `B2B` con el ingreso total de B2B y `B2C` con el ingreso total de B2C; no representa importes del top-5 ni neto/profit. Etiquetas, tooltips y ejes deben identificar el total monetario como ingreso.

Para obtener esos totales se debe llamar `/api/metrics/summary` por cada `business_type`, con filtro de fechas, `operation_type=income` y un único período agregado que cubra el rango, o usar `/api/metrics` filtrado por fechas y negocio y sumar movimientos de ingreso. El contrato recomendado documenta summary. `GET /api/metrics/categories/top` solo devuelve categorías listadas, por lo que sumar el top-5 no constituye el total del grupo.

### Datos de facets

`FacetsResponse.categories` es la lista global de categorías existentes; `/api/metrics/facets` no recibe `business_type` ni devuelve categorías por segmento. Usar facets para validar/mostrar vocabulario global de categorías, pero no tratarla como lista segmentada. Los datos de cada tabla salen de la llamada top-categories con `business_type` correspondiente, `operation_type=income`, `limit=5` y rango de fechas.
