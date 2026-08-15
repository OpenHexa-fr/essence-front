"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { searchStations, type Station } from "@/lib/api";
import { DEFAULT_FUEL, FUEL_OPTIONS } from "@/lib/fuels";
import { distanceKm } from "@/lib/geo";

const DEFAULT_FUEL_LABEL =
  FUEL_OPTIONS.find(({ key }) => key === DEFAULT_FUEL)?.label ?? DEFAULT_FUEL;

interface PreviewItem {
  station: Station;
  distanceKm: number | null;
}

export function NearbyPreview() {
  const [items, setItems] = useState<PreviewItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGeneric() {
      try {
        const results = await searchStations({ carburant: DEFAULT_FUEL, tri: "prix", size: 3 });
        if (!cancelled) {
          setItems(results.items.map((station) => ({ station, distanceKm: null })));
        }
      } catch {
        if (!cancelled) setItems([]);
      }
    }

    if (!navigator.geolocation) {
      void loadGeneric();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const here = { lat: position.coords.latitude, lon: position.coords.longitude };
        try {
          const results = await searchStations({
            carburant: DEFAULT_FUEL,
            lat: here.lat,
            lon: here.lon,
            radius_km: 20,
            tri: "prix",
            size: 3,
          });
          if (!cancelled) {
            setItems(
              results.items.map((station) => ({
                station,
                distanceKm: station.location ? distanceKm(here, station.location) : null,
              })),
            );
          }
        } catch {
          if (!cancelled) void loadGeneric();
        }
      },
      () => {
        void loadGeneric();
      },
      { timeout: 4000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <>
      <p className="hero__preview-title">Stations près de chez vous</p>
      <div className="hero__preview">
        {items.map((item) => (
          <Link
            key={item.station.station_id}
            href={`/station/${encodeURIComponent(item.station.station_id)}`}
            className="hero__preview-card"
          >
            <p className="result-item__title">
              {item.station.nom ?? item.station.adresse ?? "Station"}
            </p>
            <p className="result-item__meta">
              {item.station.ville}
              {item.distanceKm !== null ? ` · ${item.distanceKm.toFixed(1)} km` : ""}
            </p>
            {item.station[DEFAULT_FUEL] != null && (
              <div className="result-item__price-row">
                <span className="result-item__price">
                  {item.station[DEFAULT_FUEL]?.toFixed(3)} €
                </span>
                <span className="result-item__fuel">{DEFAULT_FUEL_LABEL}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
