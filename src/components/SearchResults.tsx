"use client";

import { Fragment, Suspense, useMemo, useState } from "react";

import { FiltersPanel } from "@/components/FiltersPanel";
import { Map as StationMap } from "@/components/Map";
import { SearchBar } from "@/components/SearchBar";
import { SortControls } from "@/components/SortControls";
import { StationCard } from "@/components/StationCard";
import { StationDetailPanel } from "@/components/StationDetailPanel";
import type { Station, StationSort } from "@/lib/api";
import { distanceKm, hasValidLocation } from "@/lib/geo";
import { priceForCarburant } from "@/lib/fuels";
import { computeScore, labelTopStations } from "@/lib/score";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Feuille inférieure repliable sur mobile uniquement (sans effet en desktop,
  // voir le media query dans globals.css) : dépliée par défaut pour ne pas
  // masquer les résultats d'une recherche qui vient d'arriver.
  const [mobileExpanded, setMobileExpanded] = useState(true);
  const radiusKm = effectiveRadiusKm ?? requestedRadiusKm ?? 10;

  const distances = useMemo(() => {
    if (!userLocation) return new Map<string, number>();
    const entries = items
      .filter((station) => hasValidLocation(station.location))
      .map(
        (station) =>
          [station.station_id, distanceKm(userLocation, station.location!)] as const,
      );
    return new Map(entries);
  }, [items, userLocation]);

  // Prix affiché + score par station, calculés une fois pour servir à la fois
  // aux marqueurs de la carte, aux cartes de résultat et au panneau de détail.
  const priced = useMemo(() => {
    const prices = items.map((station) => priceForCarburant(station, carburant));
    const minPrice = prices.some((p) => p != null) ? Math.min(...prices.filter((p): p is number => p != null)) : null;

    return items.map((station, index) => {
      const price = prices[index];
      const distance = distances.get(station.station_id) ?? null;
      const score = computeScore(price, minPrice, distance, radiusKm, station.mise_a_jour);
      return { station, price, distance, score };
    });
  }, [items, carburant, distances, radiusKm]);

  // Les 3 premières places (avec étiquette) forment "Top 3", le reste "Autres"
  // — façon comparateur de prix, indépendamment du tri courant.
  const topCount = Math.min(3, priced.length);

  const badges = useMemo(
    () =>
      labelTopStations(
        priced.map(({ station, score }) => ({
          stationId: station.station_id,
          breakdown: score?.breakdown ?? null,
        })),
        topCount,
      ),
    [priced, topCount],
  );

  const markers = priced
    .filter(({ station }) => hasValidLocation(station.location))
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

  const selected = priced.find(({ station }) => station.station_id === selectedId) ?? null;

  return (
    <div className="map-layout">
      <div className={`map-layout__panel${mobileExpanded ? "" : " map-layout__panel--collapsed"}`}>
        <button
          type="button"
          className="map-layout__handle"
          onClick={() => setMobileExpanded((value) => !value)}
          aria-expanded={mobileExpanded}
          aria-label={mobileExpanded ? "Réduire la liste" : "Afficher la liste"}
        >
          <span className="map-layout__handle-pill" />
          {!mobileExpanded && <span className="map-layout__handle-hint">{total} station(s)</span>}
        </button>
        <div className="map-layout__panel-header">
          <Suspense fallback={null}>
            <SearchBar variant="panel" />
          </Suspense>
        </div>
        <div className="map-layout__panel-body">
          <div className="map-layout__toolbar">
            <Suspense fallback={null}>
              <SortControls />
            </Suspense>
            <p className="map-layout__count">{total} station(s) trouvée(s)</p>
          </div>
          <Suspense fallback={null}>
            <FiltersPanel />
          </Suspense>
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
                  onSelect={() => {
                    setActiveId(station.station_id);
                    setSelectedId(station.station_id);
                    // Sans effet en desktop (voir globals.css) ; sur mobile,
                    // évite que la feuille dépliée masque le panneau de détail.
                    setMobileExpanded(false);
                  }}
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
      </div>
      <div className="map-layout__map">
        <StationMap
          markers={markers}
          activeId={activeId}
          userLocation={userLocation}
          showRank
          onMarkerClick={setSelectedId}
        />
        {selected && (
          <StationDetailPanel
            station={selected.station}
            carburant={carburant}
            price={selected.price}
            distanceKm={selected.distance}
            score={selected.score}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}
