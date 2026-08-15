import Link from "next/link";

import type { Station } from "@/lib/api";
import { labelForCarburant } from "@/lib/fuels";

interface StationCardProps {
  station: Station;
  active?: boolean;
  onHover?: () => void;
  /** Carburant (ou famille) actuellement filtré. */
  carburant?: string;
  /** Prix affiché, déjà résolu (le moins cher de la famille le cas échéant) par l'appelant. */
  price: number | null;
  distanceKm?: number | null;
  /** Score de pertinence 0-100 (prix + distance), calculé par l'appelant. */
  score?: number | null;
  /** "Le plus proche" / "Meilleur prix" / "Meilleur compromis", au plus un par recherche. */
  badge?: string;
}

function directionsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

export function StationCard({
  station,
  active,
  onHover,
  carburant,
  price,
  distanceKm,
  score,
  badge,
}: StationCardProps) {
  const fuelLabel = labelForCarburant(carburant);
  const title = station.nom ?? station.adresse ?? "Station";
  const initial = title.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`result-item${active ? " result-item--active" : ""}`}
      onMouseEnter={onHover}
    >
      <Link href={`/station/${encodeURIComponent(station.station_id)}`} className="result-item__body">
        <div className="result-item__header">
          <span className="result-item__avatar">{initial}</span>
          <div className="result-item__headline">
            <p className="result-item__title">{title}</p>
            <p className="result-item__meta">
              {station.ville} ({station.code_postal})
              {distanceKm != null && (
                <span className="result-item__distance"> · {distanceKm.toFixed(1)} km</span>
              )}
            </p>
          </div>
          {score != null && (
            <span className="result-item__score" title="Score de pertinence (prix + distance)">
              <strong>{score}</strong>
              <span>/100</span>
            </span>
          )}
        </div>
        {badge && <span className="result-item__badge">★ {badge}</span>}
        {price != null && (
          <div className="result-item__price-row">
            <span className="result-item__price">{price.toFixed(3)} €</span>
            {fuelLabel && <span className="result-item__fuel">{fuelLabel}</span>}
          </div>
        )}
        {station.mise_a_jour && (
          <p className="result-item__updated">
            Mis à jour le {new Date(station.mise_a_jour).toLocaleDateString("fr-FR")}
          </p>
        )}
      </Link>
      {station.location && (
        <a
          href={directionsUrl(station.location.lat, station.location.lon)}
          target="_blank"
          rel="noreferrer"
          className="result-item__cta"
          onClick={(event) => event.stopPropagation()}
        >
          Itinéraire
        </a>
      )}
    </div>
  );
}
