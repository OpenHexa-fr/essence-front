// Côté serveur (composants serveur, SSR), le backend est joignable via le nom
// de service Docker interne. Côté navigateur (composants client, `fetch` dans
// un `useEffect`), seule une URL exposée sur l'hôte est joignable : ces deux
// contextes ne peuvent donc pas partager la même variable "publique" (inlinée
// telle quelle au build, y compris côté serveur).
const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001");

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface Station {
  station_id: string;
  nom: string | null;
  adresse: string | null;
  ville: string | null;
  code_postal: string | null;
  location: GeoPoint | null;
  sp95: number | null;
  sp98: number | null;
  e10: number | null;
  e85: number | null;
  gazole: number | null;
  gplc: number | null;
  mise_a_jour: string | null;
  autoroute: boolean;
}

export type StationSort = "prix" | "distance";

export interface StationSearchParams {
  carburant?: string;
  lat?: number;
  lon?: number;
  radius_km?: number;
  tri?: StationSort;
  search_after?: string[];
  size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  next_search_after: unknown[] | null;
}

function buildQueryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) query.append(key, String(item));
    } else {
      query.append(key, String(value));
    }
  }
  return query.toString();
}

async function apiGet<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
  const query = buildQueryString(params);
  const url = query ? `${API_URL}${path}?${query}` : `${API_URL}${path}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Requête API échouée (${response.status}) : ${url}`);
  }
  return (await response.json()) as T;
}

export function searchStations(
  params: StationSearchParams,
): Promise<PaginatedResponse<Station>> {
  return apiGet<PaginatedResponse<Station>>("/api/v1/stations/search", { ...params });
}

export async function getStationById(stationId: string): Promise<Station | null> {
  const url = `${API_URL}/api/v1/stations/${encodeURIComponent(stationId)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Requête API échouée (${response.status}) : ${url}`);
  }
  return (await response.json()) as Station;
}

export interface DomainStatus {
  stations: boolean;
}

export function getStatus(): Promise<DomainStatus> {
  return apiGet<DomainStatus>("/api/v1/status");
}
