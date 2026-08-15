import { Suspense } from "react";

import { SearchResults } from "@/components/SearchResults";
import type { PaginatedResponse, Station, StationSort } from "@/lib/api";
import { searchStations } from "@/lib/api";
import { DEFAULT_RADIUS_KM, isFuelKey, type FuelKey } from "@/lib/fuels";

// Rayons essayés successivement quand la recherche ne trouve rien au rayon
// demandé (fréquent avec le rayon par défaut de 5 km hors des grandes villes) :
// mieux vaut élargir automatiquement que d'afficher "0 station" sans recours.
const RADIUS_FALLBACKS_KM = [10, 20, 50, 100];

interface RecherchePageProps {
  searchParams: {
    lat?: string;
    lon?: string;
    carburant?: string;
    radius_km?: string;
    tri?: string;
    prix_max?: string;
  };
}

/** "Tous" (pas de carburant précis) est un état valide, pas juste un repli sur DEFAULT_FUEL. */
function resolveCarburant(value: string | undefined): FuelKey | undefined {
  return value && isFuelKey(value) ? value : undefined;
}

/**
 * Résout le tri effectif : respecte le choix explicite s'il est utilisable
 * dans le contexte courant (position/carburant disponibles), sinon retombe
 * sur le meilleur défaut possible — "score" si un carburant est choisi
 * (comparaison de prix pertinente), "recent" sinon (seul tri qui ne requiert
 * ni position ni carburant).
 */
function resolveTri(
  requested: string | undefined,
  hasLocation: boolean,
  hasFuel: boolean,
): StationSort {
  if (requested === "distance" && hasLocation) return "distance";
  if (requested === "recent") return "recent";
  if ((requested === "prix" || requested === "score") && hasFuel) {
    return requested;
  }
  return hasFuel ? "score" : "recent";
}

function ResultsSkeleton() {
  return (
    <div className="map-layout">
      <div className="map-layout__panel">
        <div className="map-layout__panel-header">
          <div className="skeleton" style={{ height: 40, borderRadius: 999 }} />
        </div>
        <div className="map-layout__list">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="skeleton-card" key={index}>
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" />
            </div>
          ))}
        </div>
      </div>
      <div className="map-layout__map skeleton" />
    </div>
  );
}

async function searchWithRadiusFallback(
  carburant: string | undefined,
  lat: number | undefined,
  lon: number | undefined,
  radiusKm: number,
  tri: StationSort,
  prixMax: number | undefined,
): Promise<{ results: PaginatedResponse<Station>; effectiveRadiusKm: number }> {
  let effectiveRadiusKm = radiusKm;
  let results = await searchStations({
    carburant,
    lat,
    lon,
    radius_km: effectiveRadiusKm,
    tri,
    prix_max: prixMax,
    size: 20,
  });

  if (results.total === 0 && lat !== undefined && lon !== undefined) {
    for (const fallbackRadiusKm of RADIUS_FALLBACKS_KM) {
      if (fallbackRadiusKm <= effectiveRadiusKm) continue;
      effectiveRadiusKm = fallbackRadiusKm;
      results = await searchStations({
        carburant,
        lat,
        lon,
        radius_km: effectiveRadiusKm,
        tri,
        prix_max: prixMax,
        size: 20,
      });
      if (results.total > 0) break;
    }
  }

  return { results, effectiveRadiusKm };
}

async function ResultsLoader({ searchParams }: RecherchePageProps) {
  const lat = searchParams.lat ? Number(searchParams.lat) : undefined;
  const lon = searchParams.lon ? Number(searchParams.lon) : undefined;
  const carburant = resolveCarburant(searchParams.carburant);
  const radiusKm = searchParams.radius_km ? Number(searchParams.radius_km) : DEFAULT_RADIUS_KM;
  const prixMax = searchParams.prix_max ? Number(searchParams.prix_max) : undefined;
  const tri = resolveTri(searchParams.tri, lat !== undefined && lon !== undefined, carburant !== undefined);

  const { results, effectiveRadiusKm } = await searchWithRadiusFallback(
    carburant,
    lat,
    lon,
    radiusKm,
    tri,
    prixMax,
  );

  const userLocation = lat !== undefined && lon !== undefined ? { lat, lon } : null;

  return (
    <SearchResults
      items={results.items}
      total={results.total}
      carburant={carburant}
      tri={tri}
      userLocation={userLocation}
      requestedRadiusKm={radiusKm}
      effectiveRadiusKm={effectiveRadiusKm}
    />
  );
}

export default function RecherchePage({ searchParams }: RecherchePageProps) {
  return (
    <Suspense fallback={<ResultsSkeleton />}>
      <ResultsLoader searchParams={searchParams} />
    </Suspense>
  );
}
