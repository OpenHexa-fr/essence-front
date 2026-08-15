const PRICE_WEIGHT = 0.65;
const DISTANCE_WEIGHT = 0.35;

// Bornes plausibles des prix carburant en France, pour normaliser le "score
// prix" sans connaître le min/max réel des résultats courants (éviterait un
// aller-retour serveur supplémentaire, voir essence-back/search.py). Purement
// indicatif — à revoir si une vraie normalisation par percentile est utile.
const PLAUSIBLE_MIN_PRICE = 1.3;
const PLAUSIBLE_MAX_PRICE = 2.2;

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/**
 * Score de pertinence 0-100, combinant prix et distance (si connue).
 * Sans position, se réduit au score prix seul.
 */
export function computeScore(
  price: number | null,
  distanceKm: number | null,
  radiusKm: number,
): number | null {
  if (price == null) return null;
  const priceScore = 1 - clamp01((price - PLAUSIBLE_MIN_PRICE) / (PLAUSIBLE_MAX_PRICE - PLAUSIBLE_MIN_PRICE));
  if (distanceKm == null || radiusKm <= 0) {
    return Math.round(priceScore * 100);
  }
  const distanceScore = 1 - clamp01(distanceKm / radiusKm);
  return Math.round((PRICE_WEIGHT * priceScore + DISTANCE_WEIGHT * distanceScore) * 100);
}

export interface ScoreCandidate {
  stationId: string;
  price: number | null;
  distanceKm: number | null;
  score: number | null;
}

/**
 * Sélectionne jusqu'à 3 stations "à la une" parmi `candidates` : la moins
 * chère, la plus proche, le meilleur compromis (score le plus élevé) —
 * dédoublonnées si elles coïncident (une station peut cumuler les 3 titres).
 */
export function pickTopStations(candidates: ScoreCandidate[]): Map<string, string> {
  const badges = new Map<string, string>();

  const cheapest = [...candidates]
    .filter((c) => c.price != null)
    .sort((a, b) => (a.price as number) - (b.price as number))[0];
  if (cheapest) badges.set(cheapest.stationId, "Meilleur prix");

  const closest = [...candidates]
    .filter((c) => c.distanceKm != null)
    .sort((a, b) => (a.distanceKm as number) - (b.distanceKm as number))[0];
  if (closest && !badges.has(closest.stationId)) badges.set(closest.stationId, "Le plus proche");

  const bestScore = [...candidates]
    .filter((c) => c.score != null)
    .sort((a, b) => (b.score as number) - (a.score as number))[0];
  if (bestScore && !badges.has(bestScore.stationId)) badges.set(bestScore.stationId, "Meilleur compromis");

  return badges;
}
