## Context

La app ya tiene `createChampionsPokemon` y `calculateFullDamageResult` que convierten cualquier `PokemonCard` (incluyendo `ThreatCard`) en objetos de `@smogon/calc` y ejecutan cálculos de daño. El LiveSimulator ya hace esto para pares individuales. La Threat Matrix ya almacena threats con movesets completos.

Lo que falta es una vista agregada: para cada threat, ¿cómo le va contra CADA miembro de mi equipo? ¿Hay threats que ningún miembro puede manejar?

## Goals / Non-Goals

**Goals:**
- Modal con matriz threats (filas) × team members (columnas)
- Cálculos de daño reales con `@smogon/calc` (no estimaciones)
- Speed comparison real (stat final calculado con SPs, naturaleza, item)
- Resaltar threats no cubiertos (⚠️ si 3+ miembros amenazados)
- Scroll infinito horizontal y vertical
- Loading state durante el cálculo

**Non-Goals:**
- No modifica los threats ni el equipo (solo lectura)
- No considera weather, terrain, screens ni otras condiciones de campo (campo neutro)
- No considera habilidades que no sean las seleccionadas en el threat/team member
- No reemplaza el LiveSimulator (ese es para análisis detallado 1v1)

## Decisions

### 1. Cálculo real con @smogon/calc

**Decisión**: Usar `createChampionsPokemon` + `calculateFullDamageResult` para cada par threat-teamMember, en ambas direcciones.

**Alternativa considerada**: Estimación rápida (stat × BP × effectiveness / def). Se descartó porque ya tenemos la infraestructura lista y el cálculo real es más preciso (~5ms por calc).

**Optimización**: 
- 6 Pokémon del equipo se crean UNA vez (reutilizados para todos los threats)
- Cada threat se crea on-demand
- Solo se calcula el MEJOR move (mayor daño) por dirección, no los 4

### 2. Dirección del cálculo: threat ataca a mi equipo Y mi equipo ataca al threat

**Decisión**: Para cada par, se calculan DOS direcciones:
- **Threat → Team Member**: ¿el threat puede hacerme OHKO/2HKO?
- **Team Member → Threat**: ¿yo puedo hacerle OHKO/2HKO al threat?

**Razonamiento**: Ambas direcciones importan. Si el threat me hace OHKO pero yo también le hago OHKO, depende de quién es más rápido. Si solo uno puede hacer OHKO, ese tiene ventaja clara.

### 3. Campo de batalla neutro

**Decisión**: `Field` se construye sin weather, terrain, screens, tailwind, auras, ni gravity. Solo `gameType: 'Doubles'` (el default del proyecto VGC).

**Razonamiento**: La matriz es un análisis rápido de amenazas, no una simulación de batalla completa. Agregar condiciones de campo añadiría complejidad innecesaria para esta vista.

### 4. Celda: indicador resumido + tooltip detallado

**Decisión**: Cada celda muestra un indicador compacto (↑/↓ speed + 💀/⚠️/✓ resultado). Al hacer hover, tooltip con detalles numéricos (daño exacto, % de HP, rolls).

**Razonamiento**: Con 25+ threats y 6 columnas, no hay espacio para números detallados en cada celda. El tooltip da los detalles cuando se necesitan.

### 5. Resaltado de filas no cubiertas

**Decisión**: Una fila se marca ⚠️ si 3 o más miembros del equipo están en peligro (el threat les hace OHKO o 2HKO y es más rápido).

**Razonamiento**: 3 de 6 significa que la mitad del equipo está en peligro contra ese threat — es una amenaza seria que necesita atención.

### 6. Modal con scroll

**Decisión**: Modal de ancho completo (~90vw) con scroll horizontal (columnas) y vertical (filas). Altura máxima ~80vh.

**Razonamiento**: La matriz puede tener 25+ filas y 6+ columnas. Scroll infinito en ambas direcciones permite ver todos los datos sin comprimir.

## Risks / Trade-offs

- **[Riesgo] Performance**: 25 threats × 6 team × 2 direcciones = 300 calcs. Cada calc ~3-8ms = ~1-2.5s total. → Mitigación: loading spinner, pre-creación de objetos team.
- **[Trade-off] Sin condiciones de campo**: Screens, weather, etc. no se consideran. Un threat que parece peligroso podría no serlo bajo ciertas condiciones. → Aceptado para v1.
