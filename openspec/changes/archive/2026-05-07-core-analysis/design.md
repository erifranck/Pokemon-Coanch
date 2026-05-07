## Context

Type Synergy ya calcula la efectividad defensiva de cada tipo atacante contra cada Pokémon del equipo. Lo que falta es analizar las sinergias INTERNAS: qué pares y tríos de Pokémon se cubren mutuamente las debilidades. Esto es lo que los jugadores competitivos llaman "cores".

El sistema debe funcionar tanto para tipos puros como duales, considerar mega evoluciones, y tener en cuenta habilidades que otorgan inmunidades (Levitate → immune a Ground, Flash Fire → immune a Fire, etc.).

## Goals / Non-Goals

**Goals:**
- Detectar cores predefinidas (F/W/G, Fantasy, F/D/P, E/W/G, D/F/Gh) en el equipo
- Calcular puntaje de sinergia para todos los pares y tríples del equipo (algorítmico)
- Considerar habilidades de inmunidad
- Mostrar resultados en un modal accesible desde Type Synergy
- Ordenar resultados por puntaje (mejores cores primero)
- Mostrar detalle de qué debilidades están cubiertas y cuáles no

**Non-Goals:**
- No se analizan cores de 4+ Pokémon
- No se usan cálculos de daño (`@smogon/calc`)
- No se consideran objetos, weather, ni otras condiciones de campo
- No se reemplaza la Type Synergy existente

## Decisions

### 1. Algoritmo de scoring

**Decisión**: Para un grupo G de Pokémon, el score se calcula como:

```
Para cada miembro m en G:
  1. Calcular debilidades: tipos que le pegan ≥2x (considerando dual types y habilidades)
  2. Para cada debilidad d de m:
     - Verificar si algún OTRO miembro de G resiste d (≤0.5x) o es inmune (0x)
  3. Score parcial = debilidades_cubiertas / total_debilidades de m
Score grupal = promedio de scores parciales (o suma de cubiertas / suma de totales)
```

**Razonamiento**: Un score de 100% significa que TODAS las debilidades de TODOS los miembros están cubiertas por al menos un compañero. Es el caso ideal de una core perfecta.

### 2. Cores predefinidas

**Decisión**: Se definen 5 cores reconocidas por la comunidad competitiva. Cada una requiere que el equipo tenga al menos un Pokémon con cada uno de los tipos de la core (considerando tipos duales).

```
F/W/G:        Fire, Water, Grass
Fantasy:      Fairy, Dragon, Steel
F/D/P:        Fighting, Dark, Psychic
E/W/G:        Electric, Water, Ground
D/F/Gh:       Dark, Fighting, Ghost
```

La detección busca TODAS las combinaciones de miembros del equipo que satisfacen los tipos requeridos. Un mismo Pokémon puede participar en múltiples cores.

### 3. Habilidades de inmunidad

**Decisión**: Usar `abilityImmunities.ts` existente (9 habilidades). Cuando un Pokémon tiene una de estas habilidades, el tipo correspondiente se trata como inmunidad (0x) en vez de su multiplicador normal.

**Ejemplo**: Garchomp es 4x débil a Ice y 2x débil a Fairy. Si tiene la habilidad Rough Skin (sin inmunidad), sigue siendo débil. Si tuviera Levitate, sería inmune a Ground.

La habilidad se toma del `PokemonCard.ability` (la habilidad seleccionada por el usuario).

### 4. Modal en vez de página nueva

**Decisión**: El análisis de cores se muestra en un modal/popup accesible desde un botón en Type Synergy, no como una página/ruta separada.

**Razonamiento**: Es información complementaria a la Type Synergy, no un análisis independiente. El usuario ya está en Type Synergy analizando su equipo; el modal agrega profundidad sin cambiar de contexto.

### 5. Solo pares y tríos

**Decisión**: El algoritmo analiza pares (2 Pokémon) y tríos (3 Pokémon). No se analizan grupos más grandes.

**Razonamiento**: 
- Pares: relevante para leads y pivoteos rápidos
- Tríos: cores clásicas reconocidas
- Grupos más grandes: diluyen el concepto de "core" y añaden complejidad innecesaria

### 6. UI del modal

**Estructura**:
- Sección "Recognized Cores": muestra las cores predefinidas detectadas con los Pokémon que las forman, sprites, y detalle de cobertura
- Sección "Top Pairs": pares ordenados por score, con barra de progreso y detalle expandible
- Sección "Top Triples": tríos ordenados por score

Cada core/pair/triple muestra:
- Sprites de los Pokémon
- Score con barra de color (verde ≥80%, amarillo ≥50%, rojo <50%)
- Detalle expandible: qué debilidades cubre cada miembro

## Risks / Trade-offs

- **[Trade-off] Solo habilidades del `abilityImmunities.ts`**: No se consideran habilidades como Wonder Guard (Shedinja) o abilities que cambian tipos (Protean, Libero). → Aceptado para v1.
- **[Trade-off] No pondera por relevancia metagame**: Un core con score 100% podría ser Garchomp + Togekiss, pero en el meta actual podría no ser viable. → El coach evalúa la viabilidad; la herramienta solo informa sinergia de tipos.
