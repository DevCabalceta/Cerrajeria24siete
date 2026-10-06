# Cerrajería24siete — Landing

Rediseño de [cerrajeria24siete.com](https://cerrajeria24siete.com/). Astro + TypeScript + Tailwind CSS v4, con islas React y Motion (`motion/react`) solo donde hay interacción.

## Comandos

| Comando             | Acción                                   |
| :------------------ | :--------------------------------------- |
| `npm install`       | Instala dependencias                     |
| `npm run dev`       | Servidor local en `localhost:4321`       |
| `npm run check`     | Diagnóstico de tipos (`astro check`)     |
| `npm run lint`      | ESLint (TS, Astro, React Hooks, a11y)    |
| `npm run build`     | Build estático en `./dist/`              |
| `npm run preview`   | Previsualiza el build                    |

## Estructura

```text
src/
├── components/
│   ├── interactive/  # Islas React + Motion (hidratadas)
│   ├── layout/       # Header, SEO
│   └── ui/           # Piezas estáticas reutilizables (Button, Logo, icons…)
├── data/             # Fuente única de datos del negocio, servicios y mapa
├── layouts/
├── pages/
├── sections/         # Una sección de la landing por archivo
├── styles/           # global.css — tokens de diseño (@theme) y base
└── utils/

scripts/              # Generadores (p. ej. mapa de Costa Rica desde Natural Earth)
```

Los datos comerciales (teléfono, WhatsApp, correo, cobertura…) viven solo en `src/data/business.ts` y fueron verificados contra el sitio actual.
