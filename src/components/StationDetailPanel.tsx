import type { Station } from "@/lib/api";
import { labelForCarburant } from "@/lib/fuels";
import { hasValidLocation } from "@/lib/geo";
import { scoreTier, type ScoreResult } from "@/lib/score";

interface StationDetailPanelProps {
  station: Station;
  carburant?: string;
  price: number | null;
  distanceKm?: number | null;
  score: ScoreResult | null;
  onClose: () => void;
}

function directionsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

/** Panneau flottant affiché au clic sur un marqueur de la carte (pas une popup Leaflet classique). */
export function StationDetailPanel({
  station,
  carburant,
  price,
  distanceKm,
  score,
  onClose,
}: StationDetailPanelProps) {
  const fuelLabel = labelForCarburant(carburant);
  const title = station.nom ?? station.adresse ?? "Station";
  const initial = title.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="station-detail-panel" role="region" aria-label="Station sélectionnée">
      <div className="station-detail-panel__header">
        <span className="result-item__avatar">{initial}</span>
        <div className="station-detail-panel__info">
          <p className="result-item__title">{title}</p>
          <p className="result-item__meta">
            {station.ville} ({station.code_postal})
          </p>
        </div>
        <button
          type="button"
          className="station-detail-panel__close"
          onClick={onClose}
          aria-label="Fermer le panneau de la station"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="station-detail-panel__stats">
        {score != null && (
          <div className="station-detail-panel__stat">
            <span
              className={`result-item__score result-item__score--${scoreTier(score.score)}`}
              title="Score de pertinence (prix, distance, fraîcheur)"
            >
              <strong>{score.score}</strong>
              <span>/100</span>
            </span>
            <span className="station-detail-panel__stat-label">Score</span>
          </div>
        )}
        {distanceKm != null && (
          <div className="station-detail-panel__stat">
            <span className="station-detail-panel__stat-value">{distanceKm.toFixed(1)} km</span>
            <span className="station-detail-panel__stat-label">Distance</span>
          </div>
        )}
      </div>

      {price != null && (
        <div className="result-item__price-row">
          <span className="result-item__price">{price.toFixed(3)} €</span>
          {fuelLabel && <span className="result-item__fuel">{fuelLabel}</span>}
        </div>
      )}

      {hasValidLocation(station.location) && (
        <a
          href={directionsUrl(station.location.lat, station.location.lon)}
          target="_blank"
          rel="noreferrer"
          className="result-item__cta station-detail-panel__cta"
        >
          Itinéraire
        </a>
      )}
    </div>
  );
}
