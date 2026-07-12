"use client";

import { Suspense, useMemo, useState } from "react";

import { Map as StationMap } from "@/components/Map";
import { SearchBar } from "@/components/SearchBar";
import { SortControls } from "@/components/SortControls";
import { StationCard } from "@/components/StationCard";
import type { Station, StationSort } from "@/lib/api";
import type { FuelKey } from "@/lib/fuels";
import { distanceKm } from "@/lib/geo";

interface SearchResultsProps {
  items: Station[];
  total: number;
  carburant?: FuelKey;
  tri?: StationSort;
  userLocation?: { lat: number; lon: number } | null;
}

export function SearchResults({ items, total, carburant, tri, userLocation }: SearchResultsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const markers = items
    .filter((station) => station.location !== null)
    .map((station) => ({
      id: station.station_id,
      lat: station.location!.lat,
      lon: station.location!.lon,
      label: station.nom ?? station.adresse ?? "Station",
      price: carburant ? station[carburant] : null,
    }));

  const distances = useMemo(() => {
    if (!userLocation) return new Map<string, number>();
    const entries = items
      .filter((station) => station.location !== null)
      .map(
        (station) =>
          [station.station_id, distanceKm(userLocation, station.location!)] as const,
      );
    return new Map(entries);
  }, [items, userLocation]);

  return (
    <div className="map-layout">
      <div className="map-layout__panel">
        <div className="map-layout__panel-header">
          <Suspense fallback={null}>
            <SearchBar variant="panel" />
          </Suspense>
          <div className="map-layout__toolbar">
            <p className="map-layout__count">{total} station(s) trouvée(s)</p>
            <Suspense fallback={null}>
              <SortControls />
            </Suspense>
          </div>
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
              carburant={carburant}
              distanceKm={distances.get(station.station_id) ?? null}
              rank={index}
              highlightBestPrice={tri === "prix" || tri === undefined}
            />
          ))}
        </div>
      </div>
      <div className="map-layout__map">
        <StationMap markers={markers} activeId={activeId} userLocation={userLocation} showRank />
      </div>
    </div>
  );
}
