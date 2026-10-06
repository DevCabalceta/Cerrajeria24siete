# Generates src/data/costa-rica-map.ts from Natural Earth 1:10m admin-1 (public domain).
# Usage: python scripts/build-cr-map.py <cr.geojson> src/data/costa-rica-map.ts
# cr.geojson = features with adm0_a3 == "CRI" from ne_10m_admin_1_states_provinces.geojson
import json, math, sys, unicodedata
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding='utf-8'))
LAT0 = math.radians(9.7)
W = 600.0

def mainland(poly):
    xs = [p[0] for p in poly[0]]; ys = [p[1] for p in poly[0]]
    return min(xs) > -86.5 and min(ys) > 7.9

def area(r):
    return abs(sum(r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1] for i in range(len(r)-1)))/2

polys = {}
for f in d['features']:
    name = f['properties']['name']
    g = f['geometry']
    ps = g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    ps = [p for p in ps if mainland(p)]
    polys[name] = ps

allpts = [pt for ps in polys.values() for p in ps for pt in p[0]]
minx = min(p[0] for p in allpts); maxx = max(p[0] for p in allpts)
miny = min(p[1] for p in allpts); maxy = max(p[1] for p in allpts)
sx = math.cos(LAT0)
k = W / ((maxx-minx)*sx)
H = (maxy-miny)*k
proj = lambda lon, lat: ((lon-minx)*sx*k, (maxy-lat)*k)

def dp(pts, eps):
    if len(pts) < 3: return pts
    (x1,y1),(x2,y2) = pts[0], pts[-1]
    dmax, idx = 0, 0
    L = math.hypot(x2-x1, y2-y1) or 1e-9
    for i in range(1, len(pts)-1):
        x0,y0 = pts[i]
        dd = abs((y2-y1)*x0-(x2-x1)*y0+x2*y1-y2*x1)/L
        if dd > dmax: dmax, idx = dd, i
    if dmax > eps:
        return dp(pts[:idx+1], eps)[:-1] + dp(pts[idx:], eps)
    return [pts[0], pts[-1]]

def slug(s):
    s = unicodedata.normalize('NFD', s)
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower().replace(' ', '-')

provinces = []
for name, ps in polys.items():
    parts = []
    best = None
    for p in ps:
        ring = [proj(*pt) for pt in p[0]]
        if area(ring) < 4: continue  # drop specks
        # Closed ring: split at the point farthest from the start, simplify both halves.
        far = max(range(len(ring)), key=lambda i: math.hypot(ring[i][0]-ring[0][0], ring[i][1]-ring[0][1]))
        s = dp(ring[:far+1], 0.55)[:-1] + dp(ring[far:], 0.55)
        if len(s) < 4: continue
        parts.append('M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in s) + 'Z')
        a = area(ring)
        if best is None or a > best[0]:
            # Area-weighted polygon centroid (shoelace).
            A = cx = cy = 0.0
            for (x0, y0), (x1, y1) in zip(ring, ring[1:] + ring[:1]):
                cr = x0 * y1 - x1 * y0
                A += cr; cx += (x0 + x1) * cr; cy += (y0 + y1) * cr
            cx /= 3 * A; cy /= 3 * A
            best = (a, cx, cy)
    provinces.append({'id': slug(name), 'name': name, 'd': ''.join(parts), 'cx': round(best[1],1), 'cy': round(best[2],1)})

cities = {'san-jose': (-84.083, 9.933), 'heredia': (-84.117, 9.998), 'alajuela': (-84.217, 10.016), 'cartago': (-83.919, 9.864)}
pts = {k_: [round(v,1) for v in proj(*c)] for k_, c in cities.items()}

ts = ['/**', ' * Costa Rica provinces, projected (equirectangular, cos 9.7°) and simplified', ' * from Natural Earth 1:10m admin-1 (public domain, naturalearthdata.com).', ' * Generated — do not edit by hand. Isla del Coco is omitted for scale.', ' */', '',
      f"export const MAP_WIDTH = {W:.0f};", f"export const MAP_HEIGHT = {math.ceil(H)};", '',
      'export interface ProvinceShape {', '  id: string;', '  name: string;', '  d: string;', '  /** Approximate centroid, for labels. */', '  cx: number;', '  cy: number;', '}', '',
      'export const provinceShapes: ReadonlyArray<ProvinceShape> = ' + json.dumps(provinces, ensure_ascii=False, indent=2) + ';', '',
      '/** Provincial capitals, used as map pins. */',
      'export const capitals: Record<string, [number, number]> = ' + json.dumps(pts, indent=2) + ';', '']
open(out, 'w', encoding='utf-8').write('\n'.join(ts))
print('W', W, 'H', H, 'bytes', len('\n'.join(ts)), [ (p['id'], len(p['d'])) for p in provinces])
