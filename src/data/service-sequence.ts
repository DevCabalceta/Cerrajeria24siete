/**
 * Secuencia definitiva opcional. Mientras frameCount sea 0 se utilizan las cinco
 * fotografías de Servicios como fotogramas clave con movimiento de cámara.
 *
 * Para sustituirlas, coloca archivos WebP numerados frame-0001.webp ... en las
 * dos carpetas públicas indicadas y cambia únicamente frameCount.
 */
export const SERVICE_SEQUENCE = {
	frameCount: 0,
	desktopRoot: '/images/services/sequence/desktop',
	mobileRoot: '/images/services/sequence/mobile',
} as const;
