import { GeoPoint } from '@campunex/shared';

export function pointToWkt(point: GeoPoint): string {
  return `SRID=4326;POINT(${point.longitude} ${point.latitude})`;
}

export function lineStringToWkt(points: GeoPoint[]): string {
  if (points.length < 2) {
    throw new Error('LineString geometry requires at least 2 points');
  }
  const coordinates = points.map((p) => `${p.longitude} ${p.latitude}`).join(', ');
  return `SRID=4326;LINESTRING(${coordinates})`;
}
