"use client";

import { Fragment, Suspense, useMemo, useState } from "react";

import { FiltersPanel } from "@/components/FiltersPanel";
import { Map as StationMap } from "@/components/Map";
import { SearchBar } from "@/components/SearchBar";
import { SortControls } from "@/components/SortControls";
import { StationCard } from "@/components/StationCard";
import type { Station, StationSort } from "@/lib/api";
import { distanceKm } from "@/lib/geo";
import { priceForCarburant } from "@/lib/fuels";
import { computeScore, pickTopStations } from "@/lib/score";
import { formatRelativeFreshness, mostRecent } from "@/lib/time";

interface SearchResultsProps {
  items: Station[];
  total: number;
  carburant?: string;
  tri?: StationSort;
  userLocation?: { lat: number; lon: number } | null;
  /** Rayon (km) demandé par l'utilisateur, avant élargissement automatique. */
  requestedRadiusKm?: number;
  /** Rayon (km) effectivement utilisé pour cette recherche. */
  effectiveRadiusKm?: number;
}

export function SearchResults({
  items,
  total,
  carburant,
  tri,
  userLocation,
  requestedRadiusKm,
  effectiveRadiusKm,
}: SearchResultsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const radiusKm = effectiveRadiusKm ?? requestedRadiusKm ?? 10;

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

  // Prix affiché + score par station, calculés une fois pour servir à la fois
  // aux marqueurs de la carte, aux cartes de résultat et aux badges "à la une".
  const priced = useMemo(
    () =>
      items.map((station) => {
        const price = priceForCarburant(station, carburant);
        const distance = distances.get(station.station_id) ?? null;
        return { station, price, distance, score: computeScore(price, distance, radiusKm) };
      }),
    [items, carburant, distances, radiusKm],
  );

  const badges = useMemo(
    () =>
      pickTopStations(
        priced.map(({ station, price, distance, score }) => ({
          stationId: station.station_id,
          price,
          distanceKm: distance,
          score,
        })),
      ),
    [priced],
  );

  const markers = priced
    .filter(({ station }) => station.location !== null)
    .map(({ station, price }) => ({
      id: station.station_id,
      lat: station.location!.lat,
      lon: station.location!.lon,
      label: station.nom ?? station.adresse ?? "Station",
      price,
    }));

  const freshness = useMemo(() => {
    const latest = mostRecent(items.map((station) => station.mise_a_jour));
    return latest ? formatRelativeFreshness(latest) : null;
  }, [items]);

  const radiusWasExpanded =
    requestedRadiusKm != null && effectiveRadiusKm != null && effectiveRadiusKm > requestedRadiusKm;

  // Les 3 premières places (avec badge) forment "TOP 3", le reste "AUTRES" —
  // façon comparateur de prix, indépendamment du tri courant.
  const topCount = Math.min(3, priced.length);

  return (
    <div className="map-layout">
      <div className="map-layout__panel">
        <div className="map-layout__panel-header">
          <Suspense fallback={null}>
            <SearchBar variant="panel" />
          </Suspense>
          <div className="map-layout__toolbar">
            <Suspense fallback={null}>
              <SortControls />
            </Suspense>
            <p className="map-layout__count">{total} station(s) trouvée(s)</p>
          </div>
          <Suspense fallback={null}>
            <FiltersPanel />
          </Suspense>
        </div>
        <div className="map-layout__list">
          {radiusWasExpanded && (
            <p className="map-layout__notice">
              Aucune station à moins de {requestedRadiusKm} km — rayon élargi à{" "}
              {effectiveRadiusKm} km.
            </p>
          )}
          {items.length === 0 && (
            <p className="map-layout__empty">
              Aucune station trouvée, même en élargissant le rayon de recherche.
            </p>
          )}
          {topCount > 0 && <p className="map-layout__section-title">Top {topCount}</p>}
          {priced.map(({ station, price, distance, score }, index) => (
            <Fragment key={`${station.station_id}-${index}`}>
              {index === topCount && index < priced.length && (
                <p className="map-layout__section-title">
                  Autres <span className="map-layout__section-count">{priced.length - topCount}</span>
                </p>
              )}
              <StationCard
                station={station}
                active={activeId === station.station_id}
                onHover={() => setActiveId(station.station_id)}
                carburant={carburant}
                price={price}
                distanceKm={distance}
                score={score}
                badge={tri !== "recent" ? badges.get(station.station_id) : undefined}
              />
            </Fragment>
          ))}
          {freshness && <p className="map-layout__freshness">Données collectées {freshness}</p>}
        </div>
      </div>
      <div className="map-layout__map">
        <StationMap markers={markers} activeId={activeId} userLocation={userLocation} showRank />
      </div>
    </div>
  );
}
