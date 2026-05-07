## Why

La Type Synergy muestra cómo resiste tu equipo cada tipo, pero no revela las sinergias internas entre tus Pokémon: ¿qué miembros se cubren entre sí? ¿Tenés una core clásica como Fire/Water/Grass? ¿Hay pares con excelente cobertura mutua? Un coach competitivo necesita detectar estas cores para construir equipos sólidos y saber qué Pokémon pueden pivotear entre sí.

## What Changes

- Nuevo botón **"Analyze Cores"** en Type Synergy que abre un modal/popup con análisis de cores
- **Detección de cores predefinidas**: Fire/Water/Grass, Fantasy (Fairy/Dragon/Steel), Fighting/Dark/Psychic, Electric/Water/Ground, Dark/Fighting/Ghost
- **Scoring algorítmico**: para cada par y triple del equipo, calcula un puntaje de sinergia basado en qué porcentaje de debilidades de cada miembro son resistidas por sus compañeros
- Consideración de **habilidades que otorgan inmunidades** (Levitate, Flash Fire, Water Absorb, Volt Absorb, Sap Sipper, Storm Drain, Dry Skin, Lightning Rod, Motor Drive)
- Visualización con sprites, tipo de cada miembro, barras de progreso del score, y detalle de qué debilidades están cubiertas y cuáles no
- Respeto por tipos duales y mega evoluciones al resolver los tipos de cada Pokémon

## Capabilities

### New Capabilities
- `core-analysis`: Análisis de cores de tipos que detecta cores predefinidas y calcula puntajes de sinergia para pares y tríos del equipo, considerando habilidades de inmunidad, y lo muestra en un modal accesible desde Type Synergy.

### Modified Capabilities
<!-- No existing capability specs to modify -->

## Impact

- **Nuevos archivos**: `src/utils/coreAnalysis.ts` (algoritmo), `src/components/CoreAnalysisModal.tsx` (modal UI)
- **Archivo modificado**: `src/pages/TypeSynergy.tsx` (botón + integración del modal)
- **Datos**: `typeChart.ts` (TYPE_CHART existente), `abilityImmunities.ts` (ABILITY_TYPE_IMMUNITIES existente), `format_data.json` (tipos de Pokémon), `useAppStore` (equipo activo)
- **Dependencias**: Ninguna nueva. Reutiliza `TypeChip`, `getShowdownSpriteUrl`, `getMegaFormId`.
