## Context

El `LiveSimulator` usa `@smogon/calc` para calcular daño. El `Field` acepta un `gameType` (`'Singles' | 'Doubles'`) que afecta:
1. **Spread moves** (target `allAdjacent`/`allAdjacentFoes`): en Doubles reciben 0.75x penalty (3072/4096)
2. **Screens** (Reflect/Light Screen/Aurora Veil): en Singles reducen 0.5x, en Doubles ~0.667x

Actualmente el `Field` se construye sin `gameType`, por lo que `@smogon/calc` defaulta a `'Singles'`. El proyecto usa formato VGC (`gen9championsvgc2026regma`), que es Doubles.

El estado del simulador se persiste en `sessionStorage` vía el hook `useSimulatorState`.

## Goals / Non-Goals

**Goals:**
- Agregar un toggle Singles/Doubles visible en la UI del Live Simulator
- Pasar el valor seleccionado como `gameType` a ambos `Field` objects
- Persistir el valor en `sessionStorage` junto con el resto del estado
- Default: `'Doubles'`

**Non-Goals:**
- No se modifica el `PokemonCard` ni otros componentes fuera del Live Simulator
- No se agregan otros formatos (Triples no existe en Gen 9)
- No se modifica la lógica de `@smogon/calc` (solo se usa su API existente)

## Decisions

### 1. UI: Toggle de dos botones (no `<select>`)

**Decisión**: Usar dos botones estilo "píldora" (pill toggle) con `Singles | Doubles`, similar a un segmented control. El activo se resalta con `bg-blue-600`, el inactivo es `bg-gray-700`.

**Alternativa considerada**: `<select>` dropdown. Se descartó porque son solo 2 opciones y un toggle es más rápido e intuitivo.

### 2. Persistencia: extender `useSimulatorState`

**Decisión**: Agregar `gameType: 'Singles' | 'Doubles'` al tipo `SimulatorState` y su valor inicial `'Doubles'`. El hook ya persiste en `sessionStorage` automáticamente.

**Alternativa considerada**: Estado local en `LiveSimulator.tsx`. Se descartó porque el resto de las condiciones de campo (weather, terrain, screens, etc.) ya se persisten vía el hook. Sería inconsistente no persistir esto también.

### 3. Default: `'Doubles'`

**Decisión**: El default es `'Doubles'` porque el único formato del proyecto es VGC. Pero se mantiene la flexibilidad de cambiar a Singles para testing o análisis individual.

### 4. Pasar `gameType` a ambos `Field` objects

**Decisión**: Se pasa `gameType` a los dos `Field` que se construyen en `LiveSimulator.tsx` (ally→threat y threat→ally). Ambos deben usar el mismo valor porque representan la misma batalla.

## Risks / Trade-offs

- **[Riesgo] Usuarios con sessionStorage existente**: Al agregar `gameType` al estado, usuarios con sesiones viejas no tendrán este campo. → **Mitigación**: El `useSimulatorState` usa un spread del estado inicial con merge, así que si el campo no existe, toma el default `'Doubles'` automáticamente.
- **[Trade-off] Solo afecta spread moves y screens**: El `gameType` no afecta otros mecánicos como ayudas (Helping Hand) o cambios en prioridad. Esto es correcto porque el `@smogon/calc` maneja esos mecánicos independientemente del `gameType`.
