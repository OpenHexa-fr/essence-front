import type { Station } from "@/lib/api";

interface PriceTableProps {
  station: Station;
}

type FuelKey = "gazole" | "sp95" | "sp98" | "e10" | "e85" | "gplc";

const FUEL_ROWS: { key: FuelKey; label: string }[] = [
  { key: "gazole", label: "Gazole" },
  { key: "sp95", label: "SP95" },
  { key: "sp98", label: "SP98" },
  { key: "e10", label: "E10" },
  { key: "e85", label: "E85" },
  { key: "gplc", label: "GPLc" },
];

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
        {FUEL_ROWS.map(({ key, label }) => {
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
