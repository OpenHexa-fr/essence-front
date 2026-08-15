// Base Adresse Nationale (data.gouv.fr) : géocodage public, sans clé.
const BAN_SEARCH_URL = "https://api-adresse.data.gouv.fr/search/";

export interface GeocodeResult {
  lat: number;
  lon: number;
}

interface BanFeature {
  geometry: { coordinates: [number, number] };
}

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const url = `${BAN_SEARCH_URL}?q=${encodeURIComponent(query)}&limit=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("geocode failed");
  const data = (await response.json()) as { features: BanFeature[] };
  const feature = data.features[0];
  if (!feature) return null;
  const [lon, lat] = feature.geometry.coordinates;
  return { lat, lon };
}
