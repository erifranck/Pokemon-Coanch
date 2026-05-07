## Why

Actualmente el `LiveSimulator` calcula daño usando `gameType: 'Singles'` por defecto porque nunca se pasa el parámetro al constructor de `Field` de `@smogon/calc`. Esto produce resultados incorrectos para el formato VGC/Doubles: los movimientos de área (Heat Wave, Earthquake, Rock Slide) no reciben el penalty de 0.75x, y los screens (Reflect, Light Screen, Aurora Veil) reducen daño al 50% en vez del ~67% que corresponde en Doubles.

## What Changes

- Se agrega un toggle **Singles / Doubles** en la UI del Live Simulator, dentro de la sección de condiciones de campo
- El valor seleccionado se persiste en `sessionStorage` junto con el resto del estado del simulador (`useSimulatorState`)
- Se pasa `gameType` al constructor de `Field` en ambos cálculos de daño (ally → threat y threat → ally)
- **Default: `'Doubles'`**, ya que el formato del proyecto es VGC (Champions Reg M-A)
- El toggle es un simple switch o par de botones radio, estilizado con el tema oscuro existente

## Capabilities

### New Capabilities
- `singles-doubles-toggle`: Selector Singles/Doubles en el Live Simulator que controla el `gameType` del `Field` de `@smogon/calc`, afectando correctamente el cálculo de daño de spread moves y la reducción de screens según el formato de batalla

### Modified Capabilities
<!-- No existing capability specs to modify -->

## Impact

- **Archivos afectados**: `src/pages/LiveSimulator.tsx` (nuevo toggle UI + pasar `gameType` a `Field`), `src/utils/useSimulatorState.ts` (nueva propiedad `gameType` en el estado persistido)
- **Dependencias**: Ninguna nueva. Solo usa `@smogon/calc` existente que ya soporta `gameType`.
- **Riesgo**: Cambiar el default de Singles a Doubles puede alterar resultados que los usuarios ya tenían calculados. Se mitiga haciendo el cambio explícito y visible en la UI.
- **No es breaking change**: Solo se agrega funcionalidad, no se modifica ninguna API o interfaz existente.
