/**
 * Coverage as stated on the current site: "Cubrimos las siguientes zonas:
 * Heredia, San José, Alajuela, Gran Área Metropolitana y todo el territorio
 * nacional", working "en perímetro urbano y rural".
 *
 * Tiers only restate that sentence — no response times or extra claims.
 * Cartago is tagged GAM because part of the province lies in the Gran Área
 * Metropolitana; the rest of the country falls under "todo el territorio".
 */

export type CoverageTier = 'principal' | 'gam' | 'nacional';

export const tierLabels: Record<CoverageTier, { label: string; detail: string }> = {
  principal: { label: 'Zona principal', detail: 'Una de las zonas de cobertura que nombramos, en perímetro urbano y rural.' },
  gam: { label: 'Gran Área Metropolitana', detail: 'Dentro de la Gran Área Metropolitana que cubrimos.' },
  nacional: { label: 'Todo el territorio nacional', detail: 'Incluida en nuestra cobertura de todo el territorio nacional.' },
};

export const provinceTiers: Record<string, CoverageTier> = {
  heredia: 'principal',
  'san-jose': 'principal',
  alajuela: 'principal',
  cartago: 'gam',
  guanacaste: 'nacional',
  puntarenas: 'nacional',
  limon: 'nacional',
};

/** Display order: named zones first, as on the current site. */
export const provinceOrder = ['heredia', 'san-jose', 'alajuela', 'cartago', 'guanacaste', 'puntarenas', 'limon'] as const;
