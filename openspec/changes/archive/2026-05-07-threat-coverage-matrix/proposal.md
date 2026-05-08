## Why

La Threat Matrix actual permite crear y linkear amenazas manualmente, pero no hay forma de ver de un vistazo cómo le va a tu equipo contra TODAS las amenazas que tenés registradas. Necesitás una matriz que cruce cada threat con cada miembro de tu equipo y te diga, usando cálculos de daño reales con `@smogon/calc`, qué amenazas no estás cubriendo — cuáles te hacen OHKO antes de que puedas responder, cuáles resistís bien, y cuáles son un peligro.

## What Changes

- Botón **"Analyze Coverage"** en la página Threat Matrix que abre un modal con la matriz de cobertura
- **Matriz scrollable**: filas = threats (todos los de la Threat Matrix), columnas = team members
- **Por cada celda**: speed comparison (↑/↓/=), resultado del mejor move del threat contra tu Pokémon (💀 OHKO / ⚠️ 2HKO / 3HKO / ✓ resiste), y del mejor move de tu Pokémon contra el threat
- **Cálculos reales** usando `createChampionsPokemon` + `calculateFullDamageResult` de `@smogon/calc` — reutilizando la misma infraestructura del LiveSimulator
- **Resumen por fila**: contador de cuántos de tus Pokémon son amenazados por cada threat, con highlight ⚠️ si 3+ miembros están en peligro
- **Color coding**: verde (favorable, somos más rápidos y resistimos), amarillo (parejo), rojo (peligroso, nos outspeedean y hacen OHKO/2HKO)
- **Optimización**: los 6 Pokémon del equipo se pre-crean una vez y se reutilizan. Cada threat se crea on-demand para evitar trabajo innecesario.
- **Loading state** mientras se ejecutan los cálculos (~1-2 segundos para 25 threats × 6 team members)

## Capabilities

### New Capabilities
- `threat-coverage-matrix`: Matriz de cobertura de amenazas que cruza todos los threats registrados contra el equipo, usando cálculos de daño reales para identificar qué amenazas están cubiertas y cuáles son peligrosas.

### Modified Capabilities
<!-- No existing capability specs to modify -->

## Impact

- **Nuevo archivo**: `src/components/ThreatCoverageModal.tsx` (modal con la matriz)
- **Nuevo archivo**: `src/utils/threatCoverage.ts` (lógica de cálculo y análisis)
- **Archivo modificado**: `src/pages/ThreatMatrix.tsx` (botón + integración del modal)
- **Datos**: `useAppStore` (threats, team members), `calcAdapter.ts` (createChampionsPokemon, calculateFullDamageResult), `format_data.json`
- **Dependencias**: `@smogon/calc` ya instalado y en uso
- **Riesgo**: Los cálculos de daño pueden tardar ~1.5s para 25 threats. Se mitiga con loading state y pre-creación de objetos.
