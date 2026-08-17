const EARTH_RADIUS_KM = 6371;

/** True si `location` a des coordonnées exploitables (pas null, pas NaN/Infinity).
 * Une donnée source malformée (lat/lon non numériques) fait planter Leaflet
 * (`Invalid LatLng object`) si elle n'est pas filtrée en amont — vu en
 * conditions réelles sur une station avec une géolocalisation invalide. */
export function hasValidLocation(
  location: { lat: number; lon: number } | null | undefined,
): location is { lat: number; lon: number } {
  return location != null && Number.isFinite(location.lat) && Number.isFinite(location.lon);
}

/** Distance à vol d'oiseau (formule de haversine), en kilomètres. */
export function distanceKm(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
): number {
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lon - from.lon) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}
