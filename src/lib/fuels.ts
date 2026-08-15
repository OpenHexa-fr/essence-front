export type FuelKey = "sp95" | "sp98" | "e10" | "e85" | "gazole" | "gplc";

export const DEFAULT_FUEL: FuelKey = "sp95";
export const DEFAULT_RADIUS_KM = 5;

/** Libellés par carburant réel — utilisé pour l'affichage détaillé (fiche station, détail carte). */
export const FUEL_OPTIONS: { key: FuelKey; label: string }[] = [
  { key: "sp95", label: "SP95" },
  { key: "sp98", label: "SP98" },
  { key: "e10", label: "E10" },
  { key: "e85", label: "E85" },
  { key: "gazole", label: "Diesel" },
  { key: "gplc", label: "GPLc" },
];

export function isFuelKey(value: string): value is FuelKey {
  return FUEL_OPTIONS.some((option) => option.key === value);
}

/**
 * Options du filtre de recherche : certaines regroupent plusieurs carburants
 * réels sous une même famille (ex. "Sans-plomb" = E10 ou SP95), à l'image des
 * comparateurs grand public. Purement une abstraction de recherche — les
 * champs `fields` sont ceux effectivement présents sur `Station`. Doit rester
 * synchronisé avec `FUEL_FAMILIES` côté essence-back.
 */
export interface FuelFilterOption {
  key: string;
  label: string;
  fields: FuelKey[];
}

export const FUEL_FILTER_OPTIONS: FuelFilterOption[] = [
  { key: "sans_plomb", label: "Sans-plomb (E10 / SP95)", fields: ["e10", "sp95"] },
  { key: "sp98", label: "SP98", fields: ["sp98"] },
  { key: "e85", label: "E85", fields: ["e85"] },
  { key: "gplc", label: "GPL", fields: ["gplc"] },
  { key: "gazole", label: "Diesel", fields: ["gazole"] },
];

/** Un paramètre `carburant` valide : une clé de FUEL_FILTER_OPTIONS, ou un FuelKey brut (compat directe). */
export function isCarburantParam(value: string): boolean {
  return FUEL_FILTER_OPTIONS.some((option) => option.key === value) || isFuelKey(value);
}

/** Résout un paramètre `carburant` (famille ou carburant simple) en carburants réels. */
export function fieldsForCarburant(value: string | null | undefined): FuelKey[] {
  if (!value) return [];
  const family = FUEL_FILTER_OPTIONS.find((option) => option.key === value);
  if (family) return family.fields;
  return isFuelKey(value) ? [value] : [];
}

/** Libellé lisible pour un paramètre `carburant` (famille ou carburant simple). */
export function labelForCarburant(value: string | null | undefined): string | null {
  if (!value) return null;
  const family = FUEL_FILTER_OPTIONS.find((option) => option.key === value);
  if (family) return family.label;
  const fuel = FUEL_OPTIONS.find((option) => option.key === value);
  return fuel?.label ?? null;
}

/** Prix le plus bas parmi les carburants d'un paramètre `carburant` (famille ou simple) pour une station donnée. */
export function priceForCarburant(
  station: Partial<Record<FuelKey, number | null>>,
  carburant: string | null | undefined,
): number | null {
  const prices = fieldsForCarburant(carburant)
    .map((field) => station[field])
    .filter((price): price is number => price != null);
  return prices.length ? Math.min(...prices) : null;
}
