# Reconstrucción horizontal de Servicios

Estas cinco imágenes WebP se crearon con el generador de imágenes integrado a partir de las fotografías originales que permanecen en esta carpeta. Se generaron individualmente como edición/outpainting, no mediante un estiramiento geométrico. La salida nativa fue de 1672 × 941 px; no es 4K nativo.

## Prompt común

> Editar la fotografía original, no usarla solo como inspiración. Reconstruir naturalmente los laterales —o arriba y abajo si el origen ya es panorámico— para obtener una fotografía horizontal 16:9. Conservar fielmente el sujeto, pose, manos, herramientas, maquinaria, cerraduras, materiales y perspectiva. Situar la acción principal hacia el centro-derecha y dejar espacio visual realista a la izquierda para texto HTML blanco. Mejorar nitidez fotográfica, textura y luz sin aspecto artificial. Objetivo 3840 × 2160 si la herramienta lo permite. Sin personas, manos, dedos, maquinaria, cerraduras, logotipos, texto o elementos extra inventados; sin ruido, blur, artefactos ni sobreenfoque.

## Restricciones específicas por imagen

| Archivo WebP | Fotografía de referencia | Invariantes del prompt |
| --- | --- | --- |
| `residential-locksmith.webp` | `residential-locksmith.jpg` | Misma puerta azul grisácea, llave de latón, cerradura, manija, dos manos y taladro amarillo/negro; ampliar el acceso residencial. |
| `automotive-key-cutting.webp` | `automotive-key-cutting.png` | Misma duplicadora de llaves, palancas, cortadores, perillas rojas, dos manos y mangas grises; ampliar arriba y abajo el taller existente. Revisión posterior: reconstruir un único cerrajero con cabeza y torso visibles, uniendo anatómicamente ambas mangas y manos, y dejar espacio sobre su cabeza para el recorte Canvas. |
| `safe-service.webp` | `safe-service.jpeg` | Mismo técnico con camisa azul, pantalón claro y mascarilla; mismas manos operando la caja fuerte gris en el entorno industrial. |
| `electric-gate-service.webp` | `electric-gate-service.jpeg` | Mismo técnico trabajando en el motor negro sobre la escalera, portón corredizo gris y cochera cubierta. |
| `commercial-service.webp` | `commercial-service.jpeg` | Mismo técnico con camisa roja y gris operando el mismo gabinete rojo de control en el cuarto técnico. |

Se exportaron en WebP de alta calidad. Astro deriva automáticamente versiones de hasta 1600 px para el Canvas de escritorio; el móvil conserva por ahora las tomas originales, optimizadas a WebP por Astro, para proteger el encuadre vertical.
