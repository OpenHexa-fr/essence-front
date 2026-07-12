import type { Station } from "@/lib/api";
import { FUEL_OPTIONS } from "@/lib/fuels";

interface PriceTableProps {
  station: Station;
}

export function PriceTable({ station }: PriceTableProps) {
  return (
    <div className="fuel-grid">
      {FUEL_OPTIONS.map(({ key, label }) => {
        const price = station[key];
        return (
          <div
            key={key}
            className={`fuel-grid__item${price === null ? " fuel-grid__item--unavailable" : ""}`}
          >
            <span className="fuel-grid__label">{label}</span>
            <span className="fuel-grid__price">
              {price !== null ? `${price.toFixed(3)} €` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
