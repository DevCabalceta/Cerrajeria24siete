# Cerrajería24siete

Landing page de alto impacto para **Cerrajería24siete**, servicio profesional de cerrajería y portones eléctricos con atención 24/7 en Costa Rica.

El proyecto se construye de forma incremental y cada sección pasa por revisión visual antes de continuar con la siguiente.

## Estado del proyecto

| Entrega | Alcance | Estado |
| --- | --- | --- |
| 01 | Sistema base, navegación responsive, menú fullscreen con CTAs y Hero fotográfico full-bleed | Aprobada |
| 02 | Servicios con narrativa horizontal y transición cinematográfica entre secciones | Aprobada |
| 03 | Cobertura nacional con mapa interactivo de 7 provincias y 84 cantones | En revisión |
| 04 | Experiencia y razones para elegirnos | Pendiente |
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

### Sistema de movimiento

Las animaciones se coordinan desde un único punto de entrada (`src/scripts/page-motion.ts`) y comparten una sola instancia configurada de GSAP y ScrollTrigger (`src/scripts/motion.ts`). Cada sección conserva su propio contexto, sus selectores y sus ScrollTriggers, de modo que Hero, Servicios y Cobertura se pueden inicializar, adaptar por breakpoint y desmontar sin interferencias.

- `hero.ts`: entrada de contenido y parallax fotográfico exclusivo de escritorio.
- `hero-slider.ts`: rotación de fondos, crossfade, progreso, pausa/reanudación y controles accesibles del Hero.
- `services.ts`: narrativa horizontal fijada en escritorio y tarjetas verticales en móvil.
- `coverage.ts`: entrada del mapa, parallax interno e interacción accesible por provincia.
- `navigation.ts`: menú móvil, foco, historial y cabecera reactiva con listeners desmontables.
- `section-transitions.ts`: transición visual entre paneles mediante superficies locales, sin transformar contenedores que participan en el cálculo del pin.

Los estados iniciales críticos se declaran antes del primer render mediante `data-motion`. Así se evita el destello de contenido sin animar y se conserva un fallback que muestra la página si JavaScript no llega a inicializarse. La actualización de medidas se realiza una sola vez después de cargar las fuentes; los cálculos dependientes del ancho usan `invalidateOnRefresh` en lugar de registrar múltiples eventos globales.

## Principios de implementación

- Mobile-first con composiciones específicas para móvil, tablet y escritorio.
- HTML semántico, navegación por teclado, estados de foco y soporte para `prefers-reduced-motion`.
- JavaScript limitado a interacciones y animaciones que realmente lo requieren.
- Imágenes procesadas por `astro:assets`, con tamaños responsivos y formatos modernos.
- Contenido empresarial basado exclusivamente en las fuentes públicas de Cerrajería24siete.
- SEO local sin datos inventados.

Las transiciones entre secciones utilizan el atributo reutilizable `data-section-panel`: la sección anterior reduce escala, opacidad y nitidez mientras entra la siguiente. Todas las divisiones son rectas y continúan el flujo normal del documento, sin radios, solapamientos ni contenedores auxiliares. Cuando una sección contiene pinning o una altura narrativa extensa, `data-section-transition-surface` limita el efecto a su contenido visual y mantiene intacto el flujo que ScrollTrigger utiliza para calcular el scroll. En móvil, el Hero dirige el escalado y desenfoque de salida exclusivamente a la capa fotográfica mediante `data-section-transition-background`, conservando nítidos el texto, los controles y las estadísticas; su entrada mantiene la secuencia escalonada mediante opacidad, sin transforms de texto durante el renderizado móvil. Servicios emplea una narrativa horizontal con pin nativo en escritorio y una composición vertical sin fijación en móvil. Cobertura mantiene timelines y ScrollTriggers independientes, con iluminación reactiva, siete puntos provinciales y un panel accesible para explorar sus 84 cantones. Las animaciones se desactivan cuando el usuario prefiere movimiento reducido, sin perder las interacciones.

El Hero utiliza una secuencia de entrada inmediata y específica por elemento: eyebrow, líneas completas del título mediante opacidad y desplazamiento, descripción y grupo de acciones. Sus dos CTA forman un único sistema visual responsive y permanecen en una fila desde 320 px; la acción telefónica conserva un enlace `tel:` real. La fotografía de fondo rota entre cuatro recursos declarados en `src/data/hero-slides.ts`: la imagen original del primer slide conserva prioridad de carga y los otros tres fondos son fotografías stock temporales preparadas en tiempo ocioso. Cada slide dispone de encuadre independiente para escritorio y móvil. GSAP sincroniza el crossfade, el autoplay de cuatro segundos y la píldora de progreso; el control Pausa/Reanudar congela el mismo temporizador que gobierna el cambio de fotografía y mantiene ese estado durante la selección manual. El ciclo también se pausa cuando la pestaña pierde visibilidad y se simplifica con `prefers-reduced-motion`, sin reiniciar la animación del contenido.

El mapa de Cobertura mantiene coordenadas proporcionales verificadas contra su máscara para conservar los siete markers dentro de la silueta en cualquier breakpoint; el color menta de señal conecta visualmente cada punto con su número y mejora el contraste sobre el relieve azul.

## Calidad y validación

Antes de entregar una sección se ejecutan las siguientes comprobaciones:

```bash
npm run check
npm run build
```

La experiencia de scroll se valida en escritorio y móvil, incluyendo límites del pin, continuidad entre paneles, apertura del mapa interactivo y comportamiento con `prefers-reduced-motion`.

## Fuentes de contenido

- Sitio actual: [cerrajeria24siete.com](https://cerrajeria24siete.com/)
- División territorial oficial: [Instituto Geográfico Nacional, DTA 2026](https://www.snitcr.go.cr/pdfs/ign_repositorio/DTA-TABLA%20POR%20PROVINCIA-CANT%C3%93N-DISTRITO%202026.pdf)
- Referencia competitiva: [cerrajeriameza.com](https://cerrajeriameza.com/)
- Referencia de interacción: Alianza 360 de CEDES Don Bosco
- Referencia visual para Cobertura: [Luminous Topography en 21st.dev](https://21st.dev/rmahammad/luminous-topography/default)
- Fotografías stock temporales del Hero: [trabajo en taller](https://unsplash.com/photos/fQxMGkYXqFU), [herrajes de puerta](https://unsplash.com/photos/1AmEImwtnFk) y [apertura de cerradura](https://unsplash.com/photos/pTYksYcN3oI) en Unsplash.

Las referencias se utilizan para investigación de contenido y UX; el diseño y el código son originales para Cerrajería24siete.

## Contacto empresarial verificado

- Teléfono y WhatsApp: `+506 8355-7575`
- Correo: `servicioalcliente@cerrajeria24siete.com`
- Horario comunicado: atención 24/7, todo el año
- Cobertura comunicada: Heredia, San José, Alajuela, GAM y territorio nacional

## Licencia y uso

Proyecto privado desarrollado para Cerrajería24siete. El contenido, marca e imágenes originales de la empresa pertenecen a sus respectivos titulares; las fotografías stock temporales del Hero proceden de Unsplash.
