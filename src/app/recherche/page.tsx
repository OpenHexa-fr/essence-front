import { SearchResults } from "@/components/SearchResults";
import type { StationSort } from "@/lib/api";
import { searchStations } from "@/lib/api";
import { DEFAULT_FUEL, DEFAULT_RADIUS_KM, isFuelKey } from "@/lib/fuels";

interface RecherchePageProps {
  searchParams: {
    ville?: string;
    lat?: string;
    lon?: string;
    carburant?: string;
    radius_km?: string;
    tri?: string;
  };
}

export default async function RecherchePage({ searchParams }: RecherchePageProps) {
  const lat = searchParams.lat ? Number(searchParams.lat) : undefined;
  const lon = searchParams.lon ? Number(searchParams.lon) : undefined;
  const carburant =
    searchParams.carburant && isFuelKey(searchParams.carburant)
      ? searchParams.carburant
      : DEFAULT_FUEL;
  const radiusKm = searchParams.radius_km ? Number(searchParams.radius_km) : DEFAULT_RADIUS_KM;
  const tri: StationSort =
    searchParams.tri === "distance" && lat !== undefined && lon !== undefined
      ? "distance"
      : searchParams.tri === "recent"
        ? "recent"
        : "prix";

  const results = await searchStations({
    ville: searchParams.ville,
    carburant,
    lat,
    lon,
    radius_km: radiusKm,
    tri,
    size: 20,
  });

  const userLocation = lat !== undefined && lon !== undefined ? { lat, lon } : null;

  return (
    <SearchResults
      items={results.items}
      total={results.total}
      carburant={carburant}
      tri={tri}
      userLocation={userLocation}
    />
  );
}
