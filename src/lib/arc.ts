/**
 * Posisi titik di sepanjang busur lingkaran (untuk thumbnail Menu Kopi).
 * Sudut dalam derajat, 0° = kanan, 90° = bawah.
 */
export function pointsOnArc(count: number, radius: number, startDeg: number, endDeg: number) {
  if (count <= 0) return [];
  const step = count === 1 ? 0 : (endDeg - startDeg) / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const rad = ((startDeg + step * i) * Math.PI) / 180;
    return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
  });
}
