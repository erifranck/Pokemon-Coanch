## Why

Actualmente podés ver qué tipos resiste tu equipo defensivamente (Type Synergy), pero no sabés qué tipos podés golpear super-efectivamente con los ataques que tenés seleccionados. Esto deja un punto ciego: podés tener un equipo que resiste bien pero que no puede tocar a ciertos tipos clave del metagame.

## What Changes

- Nuevo tab **Offensive Coverage** en la navegación de la app
- Matriz que muestra, para cada uno de los 18 tipos defensores, si al menos un Pokémon del equipo tiene un movimiento que le pega super-efectivo
- Indicador visual: `✓` = cubierto, `✓☆` = cubierto con STAB, `✗` = no cubierto
- Tooltip al hacer hover mostrando qué move(s) específicos dan cobertura
- Columna final con conteo de cuántos Pokémon del equipo cubren cada tipo
- Resaltado ⚠️ en filas con 0 cobertura (tipos descubiertos)
- Toggle "Consider STAB" para destacar movimientos que comparten tipo con el Pokémon
- Solo se consideran movimientos dañinos (categoría ≠ Status, basePower > 0)

## Capabilities

### New Capabilities
- `offensive-coverage-matrix`: Matriz ofensiva que analiza los movimientos seleccionados del equipo y determina qué tipos defensores están cubiertos super-efectivamente, con indicadores de STAB y alertas de tipos descubiertos.

### Modified Capabilities
<!-- No existing capability specs to modify -->

## Impact

- **Nuevo archivo**: `src/pages/OffensiveCoverage.tsx` (página de la matriz)
- **Archivos modificados**: `src/components/Layout.tsx` (nuevo tab en navbar), `src/App.tsx` (nueva ruta)
- **Datos**: `typeChart.ts` (TYPE_CHART ya existe), `format_data.json` (tipos de moves y Pokémon), `useAppStore` (equipo activo)
- **Dependencias**: Ninguna nueva. Usa TypeChip existente para badges de tipo.
- **Riesgo**: Ninguno. Es una página nueva que no modifica funcionalidad existente.
