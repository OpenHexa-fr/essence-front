"use client";

import { Suspense, useState } from "react";

import { Map } from "@/components/Map";
import { SearchBar } from "@/components/SearchBar";
import { StationCard } from "@/components/StationCard";
import type { Station } from "@/lib/api";

interface SearchResultsProps {
  items: Station[];
  total: number;
}

export function SearchResults({ items, total }: SearchResultsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const markers = items
    .filter((station) => station.location !== null)
    .map((station) => ({
      id: station.station_id,
      lat: station.location!.lat,
      lon: station.location!.lon,
      label: station.nom ?? station.adresse ?? "Station",
    }));

  return (
    <div className="map-layout">
      <div className="map-layout__panel">
        <div className="map-layout__panel-header">
          <Suspense fallback={null}>
            <SearchBar variant="panel" />
          </Suspense>
          <p className="map-layout__count">{total} station(s) trouvée(s)</p>
        </div>
        <div className="map-layout__list">
          {items.length === 0 && (
            <p className="map-layout__empty">Aucune station pour cette recherche.</p>
          )}
          {items.map((station, index) => (
            <StationCard
              key={`${station.station_id}-${index}`}
              station={station}
              active={activeId === station.station_id}
              onHover={() => setActiveId(station.station_id)}
            />
          ))}
        </div>
      </div>
      <div className="map-layout__map">
        <Map markers={markers} activeId={activeId} />
      </div>
    </div>
  );
}
