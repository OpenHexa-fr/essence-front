import Link from "next/link";

import type { Station } from "@/lib/api";

interface StationCardProps {
  station: Station;
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

export function StationCard({ station }: StationCardProps) {
  const availableFuel = FUEL_LABELS.find(({ key }) => station[key] !== null);

  return (
    <Link href={`/station/${encodeURIComponent(station.station_id)}`} className="station-card">
      <h3>{station.nom ?? station.adresse ?? "Station"}</h3>
      <p>
        {station.ville} ({station.code_postal})
      </p>
      {availableFuel && (
        <p>
          {availableFuel.label} : {station[availableFuel.key]?.toFixed(3)} €
        </p>
      )}
    </Link>
  );
}
