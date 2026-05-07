## Context

El `PokemonCard` actual usa el componente `Combobox` genérico para seleccionar movimientos. Cada opción en el dropdown muestra únicamente el nombre del ataque (ej. "Thunderbolt"). La data de movimientos viene de dos fuentes:

1. **`format_data.json`** — datos filtrados por formato (solo `id`, `name`, `type`, `basePower`, `category`). Es la fuente que se usa actualmente en el Combobox.
2. **`moves.json`** — dataset completo con `accuracy`, `priority`, `target`, etc. No se usa en el UI actual.

El `Combobox` acepta `ComboboxOption[]` con solo `{ id, label }`. No tiene mecanismo para mostrar información adicional por ítem.

No existe ningún componente de tooltip en el proyecto. El único hover info se hace con `title` nativo de HTML.

## Goals / Non-Goals

**Goals:**
- Mostrar un tooltip visualmente rico al hacer hover sobre cada opción de movimiento en el Combobox
- El tooltip debe incluir: tipo elemental (con color del TypeChip), potencia (base power), categoría (Physical/Special/Status con indicador visual), precisión (accuracy)
- El tooltip debe funcionar en los 4 selectores de movimiento del PokemonCard
- El tooltip debe posicionarse correctamente sin recortarse en los bordes del viewport

**Non-Goals:**
- No se modifica el `Combobox` para items o abilities (solo movimientos)
- No se agregan efectos secundarios (secondary effects) en esta iteración — la data de `moves.json` parseada actualmente no incluye `secondary`. Se deja como mejora futura.
- No se modifica el flujo de selección del Combobox (sigue siendo click para seleccionar)
- No se crea un sistema de tooltips genérico para toda la app (solo el caso específico de movimientos)

## Decisions

### 1. Data enrichment: extender `ComboboxOption` en vez de modificar el Combobox

**Decisión**: Se extiende la interfaz `ComboboxOption` con un campo opcional `meta` que contiene la data enriquecida del movimiento. El `Combobox` recibe una prop opcional `renderTooltip` (render prop) que, si está presente, renderiza el tooltip al hacer hover sobre cada `<li>`.

**Alternativa considerada**: Crear un `MoveCombobox` específico que extienda o wrappee el Combobox. Se descartó porque agrega duplicación de lógica de dropdown, búsqueda, y click-outside. Es mejor que el Combobox soporte tooltips de forma genérica.

**Alternativa considerada**: Pasar un `tooltipRenderer` como prop al Combobox. Es la opción elegida — permite que el Combobox siga siendo genérico mientras que el PokemonCard define qué renderizar en el tooltip.

### 2. Fuente de datos para el tooltip: `moves.json`

**Decisión**: Se usa `moves.json` como fuente de datos enriquecidos para el tooltip. Este archivo ya está en el bundle (se importa en otros lugares) y contiene `accuracy`, `priority`, y `target` que `format_data.json` no tiene.

**Razonamiento**: `format_data.json` solo tiene lo mínimo para el simulador de daño. `moves.json` ya está disponible en runtime y es la fuente canónica de datos de movimientos parseados. Se hace un lookup por `moveId` para obtener los datos extra.

**Nota**: `moves.json` no contiene `secondary` effects (se droppearon en el parse). Si en el futuro se necesitan, habrá que modificar `scripts/parse-data.js` para incluirlos.

### 3. Posicionamiento del tooltip: CSS-only con `absolute` + clases de dirección

**Decisión**: El tooltip se posiciona con CSS absolute relativo a cada `<li>`. Por defecto aparece a la derecha del ítem (`left: 100%`, `top: 0`). Se usa una lógica simple para detectar si se sale del viewport derecho y en ese caso se posiciona a la izquierda.

**Alternativa considerada**: Usar una librería como Floating UI. Se descartó para no agregar una dependencia nueva por un solo tooltip. La lógica de posicionamiento es lo suficientemente simple para manejarla con CSS + un `useRef` + `getBoundingClientRect()`.

**Implementación**: El tooltip es un `div` con `position: fixed` que se posiciona dinámicamente usando las coordenadas del elemento hovereado y ajustándose si se sale de la pantalla.

### 4. Renderizado: un solo tooltip a la vez

**Decisión**: Solo se muestra el tooltip del ítem que actualmente tiene hover. No se renderizan todos los tooltips en el DOM — solo uno, condicionalmente.

**Razonamiento**: Performance. Con listas de 50+ movimientos, renderizar tooltips para todos sería innecesario. El estado de "cuál ítem tiene hover" se maneja con `useState` en el Combobox, y el tooltip se renderiza una sola vez con los datos del ítem activo.

### 5. Diseño visual del tooltip

**Decisión**: El tooltip sigue el tema oscuro de la app (`bg-gray-800`, `text-white`, borde `border-gray-600`) y usa:
- **Type badge**: Mismo estilo que `TypeChip` (fondo de color del tipo, texto blanco/borde negro)
- **Categoría**: Ícono textual (⚔️ Physical, 🔮 Special, ⭕ Status) + texto
- **Potencia**: Número grande destacado, o "--" para Status moves
- **Precisión**: Porcentaje con barra de color (verde ≥100, amarillo ≥80, rojo <80)
- **Layout**: Vertical stack con separadores sutiles (`border-t border-gray-700`)

Los colores de tipo se toman del mismo sistema que usa `TypeChip` (Tailwind classes condicionales).

## Risks / Trade-offs

- **[Riesgo] El tooltip se recorta en pantallas pequeñas o en los Combobox inferiores** → Mitigación: Lógica de posicionamiento dinámico que chequea `getBoundingClientRect()` y ajusta left/top según el espacio disponible.
- **[Riesgo] El tooltip tapa otras opciones del dropdown** → Mitigación: Se posiciona con `z-50` por encima del dropdown (`z-40`) pero se cierra al mover el mouse fuera del ítem (sin delay). También se puede implementar un pequeño delay (150ms) para evitar flickering.
- **[Trade-off] La data de `moves.json` no incluye efectos secundarios** → Aceptado por ahora. El tooltip igual agrega mucho valor con tipo, categoría, potencia y precisión. Se puede extender después modificando `parse-data.js`.
- **[Trade-off] El Combobox gana una responsabilidad nueva (renderizar tooltips)** → Es mínimo: una prop opcional `renderTooltip` y un estado de hover. Si no se usa, el comportamiento es idéntico al actual.
