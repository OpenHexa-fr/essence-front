import Link from "next/link";

import type { Station } from "@/lib/api";

interface StationCardProps {
  station: Station;
  active?: boolean;
  onHover?: () => void;
}

type FuelKey = "gazole" | "sp95" | "sp98" | "e10" | "e85" | "gplc";

const FUEL_LABELS: { key: FuelKey; label: string }[] = [
  { key: "gazole", label: "Gazole" },
  { key: "sp95", label: "SP95" },
  { key: "sp98", label: "SP98" },
  { key: "e10", label: "E10" },
  { key: "e85", label: "E85" },
  { key: "gplc", label: "GPLc" },
];

export function StationCard({ station, active, onHover }: StationCardProps) {
  const availableFuel = FUEL_LABELS.find(({ key }) => station[key] !== null);

  return (
    <Link
      href={`/station/${encodeURIComponent(station.station_id)}`}
      className={`result-item${active ? " result-item--active" : ""}`}
      onMouseEnter={onHover}
    >
      <p className="result-item__title">{station.nom ?? station.adresse ?? "Station"}</p>
      <p className="result-item__meta">
        {station.ville} ({station.code_postal})
      </p>
      {availableFuel && (
        <span className="result-item__value">
          {availableFuel.label} · {station[availableFuel.key]?.toFixed(3)} €
        </span>
      )}
    </Link>
  );
}
