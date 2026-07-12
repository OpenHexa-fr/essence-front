import type { Station } from "@/lib/api";
import { FUEL_OPTIONS } from "@/lib/fuels";

interface PriceTableProps {
  station: Station;
}

export function PriceTable({ station }: PriceTableProps) {
  return (
    <table className="price-table">
      <thead>
        <tr>
          <th>Carburant</th>
          <th>Prix</th>
        </tr>
      </thead>
      <tbody>
        {FUEL_OPTIONS.map(({ key, label }) => {
          const price = station[key];
          return (
            <tr key={key}>
              <td>{label}</td>
              <td>{price !== null ? `${price.toFixed(3)} €` : "Non disponible"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
