export type FuelKey = "sp95" | "sp98" | "e10" | "e85" | "gazole" | "gplc";

export const DEFAULT_FUEL: FuelKey = "sp95";
export const DEFAULT_RADIUS_KM = 5;

export const FUEL_OPTIONS: { key: FuelKey; label: string }[] = [
  { key: "sp95", label: "SP95" },
  { key: "sp98", label: "SP98" },
  { key: "e10", label: "E10" },
  { key: "e85", label: "E85" },
  { key: "gazole", label: "Gazole" },
  { key: "gplc", label: "GPLc" },
];

export function isFuelKey(value: string): value is FuelKey {
  return FUEL_OPTIONS.some((option) => option.key === value);
}
