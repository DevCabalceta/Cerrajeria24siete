# Cerrajería24siete

Landing page de alto impacto para **Cerrajería24siete**, servicio profesional de cerrajería y portones eléctricos con atención 24/7 en Costa Rica.

El proyecto se construye de forma incremental y cada sección pasa por revisión visual antes de continuar con la siguiente.

## Estado del proyecto

| Entrega | Alcance | Estado |
| --- | --- | --- |
| 01 | Sistema base, navegación responsive, menú fullscreen unificado y Hero fotográfico full-bleed | En revisión |
| 02 | Arquitectura narrativa de servicios | Pendiente de aprobación |
| 03 | Emergencias 24/7 y categorías de servicio | Pendiente |
| 04 | Experiencia, razones para elegirnos y cobertura | Pendiente |
| 05 | Trabajos, preguntas frecuentes y CTA final | Pendiente |
| 06 | Contacto, footer, botones flotantes y auditoría final | Pendiente |

## Stack

- [Astro](https://astro.build/) con TypeScript estricto.
- [Tailwind CSS 4](https://tailwindcss.com/) mediante el plugin oficial de Vite.
- [GSAP](https://gsap.com/) y ScrollTrigger para animaciones complejas.
- Fuente variable Manrope servida localmente.
- Sitemap oficial de Astro y datos estructurados `LocalBusiness`.

AOS se incorporará únicamente si una sección futura requiere entradas simples y su uso aporta valor real.

## Desarrollo local

Requisitos:

- Node.js 22.12 o superior.
- npm 10 o superior.

```bash
npm install
npm run dev
```

El servidor de Astro se inicia en segundo plano, de acuerdo con la configuración del proyecto.

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo en segundo plano. |
| `npm run dev:status` | Muestra el estado del servidor. |
| `npm run dev:logs` | Muestra los registros del servidor. |
| `npm run dev:stop` | Detiene el servidor de desarrollo. |
| `npm run check` | Ejecuta las validaciones de Astro y TypeScript. |
| `npm run build` | Genera la versión de producción en `dist/`. |
| `npm run preview` | Previsualiza localmente el build de producción. |

## Arquitectura

```text
src/
├── assets/              # Imágenes importadas y optimizadas por Astro
├── components/
│   ├── navigation/      # Navegación global
│   └── sections/        # Secciones narrativas de la landing
├── data/                # Datos empresariales, navegación y contenido reutilizable
├── layouts/             # HTML base, metadatos SEO y datos estructurados
├── pages/               # Rutas públicas
├── scripts/             # Interacciones y animaciones TypeScript/GSAP
└── styles/              # Tokens visuales y estilos globales
```

La información repetitiva de contacto, cobertura y navegación vive en `src/data/site.ts`. Esto evita inconsistencias entre CTAs, metadatos y secciones.

## Principios de implementación

- Mobile-first con composiciones específicas para móvil, tablet y escritorio.
- HTML semántico, navegación por teclado, estados de foco y soporte para `prefers-reduced-motion`.
- JavaScript limitado a interacciones y animaciones que realmente lo requieren.
- Imágenes procesadas por `astro:assets`, con tamaños responsivos y formatos modernos.
- Contenido empresarial basado exclusivamente en las fuentes públicas de Cerrajería24siete.
- SEO local sin datos inventados.

## Fuentes de contenido

- Sitio actual: [cerrajeria24siete.com](https://cerrajeria24siete.com/)
- Referencia competitiva: [cerrajeriameza.com](https://cerrajeriameza.com/)
- Referencia de interacción: Alianza 360 de CEDES Don Bosco

Las referencias se utilizan para investigación de contenido y UX; el diseño y el código son originales para Cerrajería24siete.

## Contacto empresarial verificado

- Teléfono y WhatsApp: `+506 8355-7575`
- Correo: `servicioalcliente@cerrajeria24siete.com`
- Horario comunicado: atención 24/7, todo el año
- Cobertura comunicada: Heredia, San José, Alajuela, GAM y territorio nacional

## Licencia y uso

Proyecto privado desarrollado para Cerrajería24siete. El contenido, marca e imágenes de la empresa pertenecen a sus respectivos titulares.
