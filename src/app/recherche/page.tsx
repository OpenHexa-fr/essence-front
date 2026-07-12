import { Suspense } from "react";

import { Map } from "@/components/Map";
import { SearchBar } from "@/components/SearchBar";
import { StationCard } from "@/components/StationCard";
import { searchStations } from "@/lib/api";

interface RecherchePageProps {
  searchParams: { ville?: string; lat?: string; lon?: string };
}

export default async function RecherchePage({ searchParams }: RecherchePageProps) {
  const lat = searchParams.lat ? Number(searchParams.lat) : undefined;
  const lon = searchParams.lon ? Number(searchParams.lon) : undefined;

  const results = await searchStations({
    ville: searchParams.ville,
    lat,
    lon,
    size: 20,
  });

  const markers = results.items
    .filter((station) => station.location !== null)
    .map((station) => ({
      lat: station.location!.lat,
      lon: station.location!.lon,
      label: station.nom ?? station.adresse ?? "Station",
    }));

  return (
    <section>
      <h1>Stations-service</h1>
      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>
      <p>{results.total} station(s) trouvée(s)</p>
      <Map markers={markers} />
      <div className="results-grid">
        {results.items.map((station, index) => (
          <StationCard key={`${station.station_id}-${index}`} station={station} />
        ))}
      </div>
    </section>
  );
}
