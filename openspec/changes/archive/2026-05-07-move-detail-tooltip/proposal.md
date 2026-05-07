## Why

Actualmente, el selector de movimientos en el `PokemonCard` solo muestra el nombre del ataque. El usuario no puede ver información crucial como potencia, categoría (físico/especial/status), precisión (accuracy), tipo elemental, o efectos secundarios sin salir de la aplicación y buscar en recursos externos. Esto rompe el flujo de construcción de equipos y obliga a tomar decisiones a ciegas.

## What Changes

- Se agrega un tooltip detallado que aparece al hacer hover sobre cada opción de movimiento en los `Combobox` de selección de ataques
- El tooltip muestra: nombre del movimiento, tipo elemental (con color del type badge), potencia (base power), categoría (Physical/Special/Status con ícono visual), precisión (accuracy), y efectos secundarios cuando estén disponibles
- Se crea un componente `MoveTooltip` reutilizable que se integra dentro del dropdown del `Combobox`
- Se enriquece la data disponible en runtime para incluir `accuracy` y `secondary` effects desde `moves.json`, ya que `format_data.json` actualmente no los incluye
- El tooltip se posiciona inteligentemente para evitar recortes en los bordes de la pantalla

## Capabilities

### New Capabilities
- `move-detail-tooltip`: Tooltip interactivo que muestra información detallada de cada movimiento (tipo, categoría, potencia, precisión, efectos) al hacer hover en las opciones del selector de movimientos

### Modified Capabilities
<!-- No existing capability specs to modify -->

## Impact

- **Componentes afectados**: `Combobox.tsx` (integrar soporte para tooltips en items del dropdown), `PokemonCard.tsx` (pasar data enriquecida de movimientos a las opciones del Combobox)
- **Nuevo componente**: `MoveTooltip.tsx` (componente de tooltip con diseño visual detallado)
- **Datos**: Se necesita acceder a `moves.json` (que tiene `accuracy` y otros campos) además de `format_data.json` para enriquecer la data mostrada en el tooltip. Actualmente el Combobox solo usa `format_data.json` que carece de `accuracy`.
- **Dependencias**: Ninguna nueva. Solo Tailwind CSS (ya presente) para estilos del tooltip.
- **Riesgo**: El tooltip podría afectar la performance si se renderizan muchos a la vez. Se mitiga usando renderizado condicional (solo se muestra el tooltip del ítem con hover activo).
