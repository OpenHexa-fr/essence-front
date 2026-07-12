import Link from "next/link";

import type { Station } from "@/lib/api";
import { FUEL_OPTIONS, type FuelKey } from "@/lib/fuels";

interface StationCardProps {
  station: Station;
  active?: boolean;
  onHover?: () => void;
  /** Carburant actuellement filtré : son prix est mis en avant s'il est disponible. */
  carburant?: FuelKey;
  distanceKm?: number | null;
  /** Position (0-based) dans la liste triée courante : numérote les 3 premiers, comme sur la carte. */
  rank?: number;
  /** N'affiche le badge "★ Meilleur prix" que si le tri courant est bien le prix. */
  highlightBestPrice?: boolean;
}

const TOP_RANK_COUNT = 3;

function directionsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

export function StationCard({
  station,
  active,
  onHover,
  carburant,
  distanceKm,
  rank,
  highlightBestPrice,
}: StationCardProps) {
  const preferredFuel = carburant
    ? FUEL_OPTIONS.find(({ key }) => key === carburant && station[key] !== null)
    : undefined;
  const displayedFuel = preferredFuel ?? FUEL_OPTIONS.find(({ key }) => station[key] !== null);
  const isTopRank = rank != null && rank < TOP_RANK_COUNT;
  const title = station.nom ?? station.adresse ?? "Station";
  const initial = title.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`result-item${active ? " result-item--active" : ""}`}
      onMouseEnter={onHover}
    >
      <Link href={`/station/${encodeURIComponent(station.station_id)}`} className="result-item__body">
        <div className="result-item__header">
          <span className={`result-item__avatar${isTopRank ? " result-item__avatar--rank" : ""}`}>
            {isTopRank ? (rank as number) + 1 : initial}
          </span>
          <div className="result-item__headline">
            <p className="result-item__title">{title}</p>
            <p className="result-item__meta">
              {station.ville} ({station.code_postal})
              {distanceKm != null && (
                <span className="result-item__distance"> · {distanceKm.toFixed(1)} km</span>
              )}
            </p>
          </div>
        </div>
        {highlightBestPrice && rank === 0 && (
          <span className="result-item__badge">★ Meilleur prix</span>
        )}
        {displayedFuel && (
          <div className="result-item__price-row">
            <span className="result-item__price">{station[displayedFuel.key]?.toFixed(3)} €</span>
            <span className="result-item__fuel">{displayedFuel.label}</span>
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
