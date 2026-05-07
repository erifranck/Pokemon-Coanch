## Context

La app ya tiene una matriz de sinergia defensiva (`TypeSynergy.tsx`) que muestra cómo los tipos del equipo resisten ataques entrantes. Usa `typeChart.ts` con la tabla de efectividad completa. Faltaba la contraparte ofensiva: ¿qué tipos puede golpear mi equipo?

El `PokemonCard` ya almacena 4 moves por Pokémon. Cada move tiene `type` y `category` en `format_data.json`. La tabla `TYPE_CHART[atkType][defType]` ya existe y es bidireccional.

## Goals / Non-Goals

**Goals:**
- Nueva página/ruta accesible desde el navbar
- Mostrar matriz de 18 filas (tipos defensores) × N columnas (Pokémon del equipo)
- Indicar con `✓`/`✓☆`/`✗` si el tipo está cubierto ofensivamente
- Tooltip con los moves que dan cobertura
- Columna de conteo y alerta ⚠️ en tipos con 0 cobertura
- Toggle "Consider STAB"

**Non-Goals:**
- No se calcula daño real (no usa `@smogon/calc`)
- No considera weather, items, abilities ni otras condiciones de campo
- No analiza al oponente (es puramente sobre tu propio equipo)
- No reemplaza ni modifica la TypeSynergy existente

## Decisions

### 1. Lógica de cobertura: "al menos un move SE"

**Decisión**: Una celda muestra `✓` si al menos un move del Pokémon tiene una efectividad ≥ 2x contra el tipo defensor. No suma multiplicadores de múltiples moves ni muestra el mejor — es booleano.

**Alternativa considerada**: Mostrar el multiplicador máximo (2, 4). Se descartó por simplicidad: el coach solo necesita saber si puede pegarle o no.

### 2. STAB: mismo tipo que el Pokémon

**Decisión**: Un move tiene STAB si `move.type` coincide con alguno de los `pokemon.types[]` del Pokémon (considerando mega evolution y Tera type). Se marca con `✓☆` en vez de `✓`.

**Razonamiento**: STAB significa 1.5x de daño adicional. Es información relevante para el coach, pero secundaria a la cobertura base.

### 3. Solo movimientos dañinos

**Decisión**: Se filtran moves con `category === 'Status'` o `basePower === 0`. Estos no causan daño y no contribuyen a la cobertura ofensiva.

### 4. Estructura visual: tabla como TypeSynergy

**Decisión**: Mismo layout que `TypeSynergy.tsx`: tabla con sprites de Pokémon en el header, tipos en las filas, colores consistentes.

**Razonamiento**: Consistencia visual. El usuario ya conoce el patrón.

### 5. Tooltip: lista de moves que cubren

**Decisión**: Al hacer hover sobre una celda `✓`, mostrar un tooltip con los nombres de los moves que dan esa cobertura. Si hay STAB, marcarlo.

Ejemplo:
```
Fire ← Garchomp
✅ Earthquake (Ground, STAB)
✅ Stone Edge (Rock)
```

### 6. Sin dependencia de `@smogon/calc`

**Decisión**: Solo se usa `typeChart.ts`. No se instancia `Pokemon`, `Move`, ni `Field`. Es puramente una consulta a la tabla de tipos.

**Razonamiento**: Performance — la matriz se recalcula cada vez que cambia el equipo. Con typeChart es O(18 × 6 × 4) = 432 lookups, instantáneo.

## Risks / Trade-offs

- **[Trade-off] No considera inmunidades por habilidad**: Moves como Earthquake no le pegan a Flying aunque sean SE contra otros tipos. La tabla de tipos ya incluye inmunidades de tipo (Ground → Flying = 0), pero no por habilidad (Levitate). → Aceptado por ahora; se puede agregar toggle después.
- **[Trade-off] No pondera relevancia de moves**: Un move de 40 BP (Tackle) cuenta igual que uno de 120 BP (Flare Blitz). → Aceptado; el coach evalúa la viabilidad.
