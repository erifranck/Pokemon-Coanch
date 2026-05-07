# Pokémon Coach — Constructor de Equipos Competitivo

[🇺🇸 English](README.md)

Un constructor profesional de equipos Pokémon VGC para el formato **Pokémon Champions** (Regulación M-A), potenciado por **Pokémon Showdown** y **Munchstats**.

## Funcionalidades

- **Team Builder** — Construye equipos de 6 Pokémon con el sistema de 66 SP y validación de legalidad completa
- **Toggle de Mega Evolución** — Detección automática de Megas con comparación de stats base/mega
- **Matriz de Sinergia de Tipos** — Tabla defensiva con inmunidades por habilidad (Levitación, Absorbe Agua, etc.)
- **Matriz de Amenazas** — Gestiona amenazas del meta con sets pre-construidos con datos de Munchstats
- **Simulador de Daño en Vivo** — Calcula daño con 16 rolls, niveles de stats, pantallas, clima, terreno, quemadura, Helping Hand, Fairy/Dark Aura
- **Pruebas Unitarias** — 55 tests cubriendo matemáticas de stats, tabla de tipos, detección de megas e inmunidades

## Impulsado Por

| Fuente | Datos |
|---|---|
| [Pokémon Showdown](https://pokemonshowdown.com/) | Datos de Pokémon, learnsets, reglas de formato, sprites |
| [Munchstats](https://munchstats.com/) | Estadísticas de uso competitivo, sets comunes |

## Desarrollo

```bash
npm install
npm run update-data    # Extraer reglas del formato desde Showdown
npm run dev            # Iniciar servidor de desarrollo
npm test               # Ejecutar pruebas
npm run build          # Build de producción
npm run deploy         # Desplegar a GitHub Pages
```

## Stack Tecnológico

React 19 · TypeScript · Zustand · Tailwind CSS · @smogon/calc · Vitest
