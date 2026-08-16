// Portage direct de l'algorithme de pump-price.draclest.ovh (backend/app/services/scoring_service.py) :
// Prix 60% / Distance 35% / Fraîcheur 4% / Services 1%. Le poids "Services"
// reste à 0 pour l'instant — essence-back n'extrait pas encore les services du
// flux source (voir essence-back/app/domain/stations/ingestion.py).
const WEIGHT_PRICE = 0.6;
const WEIGHT_DISTANCE = 0.35;
const WEIGHT_FRESHNESS = 0.04;
const WEIGHT_SERVICES = 0.01;

// Écart de prix (€/L) à partir duquel le score prix tombe à 0, ancré sur le
// moins cher des résultats courants (pas une borne fixe).
const PRICE_ZERO_GAP = 1.0;

function clamp0100(value: number): number {
  return Math.min(Math.max(value, 0), 100);
}

/** Fraîcheur 0-100 : 100 si mis à jour il y a <1h, décroît linéairement jusqu'à 0 à 168h (7 jours). */
function freshnessScore(isoDate: string | null): number {
  if (!isoDate) return 0;
  const ageHours = (Date.now() - new Date(isoDate).getTime()) / 3_600_000;
  return clamp0100(100 * (1 - ageHours / 168));
}

export interface ScoreBreakdown {
  price: number;
  distance: number;
  freshness: number;
  services: number;
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
}

/** Seuils calqués sur pump-price.draclest.ovh : ≥70 vert, 50-69 ambre, <50 rouge. */
export function scoreTier(score: number): "high" | "mid" | "low" {
  if (score >= 70) return "high";
  if (score >= 50) return "mid";
  return "low";
}

/**
 * Score de pertinence 0-100 et sa décomposition. `minPrice` est le prix le
 * plus bas parmi les résultats courants (ancrage "moins cher = 100").
 * Sans position connue, le poids "distance" est redistribué sur le prix
 * plutôt que de pénaliser artificiellement le score avec une distance à 0.
 */
export function computeScore(
  price: number | null,
  minPrice: number | null,
  distanceKm: number | null,
  radiusKm: number,
  updatedAt: string | null,
): ScoreResult | null {
  if (price == null) return null;

  const priceScore =
    minPrice != null ? clamp0100(100 * (1 - (price - minPrice) / PRICE_ZERO_GAP)) : 100;
  const freshness = freshnessScore(updatedAt);
  const services = 0;

  const hasDistance = distanceKm != null;
  const distanceScore = hasDistance
    ? clamp0100(100 * (1 - distanceKm / Math.max(radiusKm, 0.1)))
    : 0;

  const weights = hasDistance
    ? { price: WEIGHT_PRICE, distance: WEIGHT_DISTANCE, freshness: WEIGHT_FRESHNESS, services: WEIGHT_SERVICES }
    : { price: WEIGHT_PRICE + WEIGHT_DISTANCE, distance: 0, freshness: WEIGHT_FRESHNESS, services: WEIGHT_SERVICES };

  const total =
    weights.price * priceScore +
    weights.distance * distanceScore +
    weights.freshness * freshness +
    weights.services * services;

  return {
    score: Math.round(clamp0100(total)),
    breakdown: {
      price: Math.round(priceScore),
      distance: Math.round(distanceScore),
      freshness: Math.round(freshness),
      services: Math.round(services),
    },
  };
}

export interface ScoredStation {
  stationId: string;
  breakdown: ScoreBreakdown | null;
}

const LABEL_BY_CRITERION: Record<"price" | "distance" | "freshness", string> = {
  price: "Meilleur prix",
  distance: "Le plus proche",
  freshness: "Données fraîches",
};

/**
 * Étiquette qualitative pour chacune des `topCount` premières stations (dans
 * l'ordre de tri courant — c'est la section "Top N" de la liste) : le critère
 * qui domine pour CETTE station, en évitant les doublons entre elles. Porté
 * de la logique d'étiquetage de pump-price.draclest.ovh (par facteur dominant
 * du top 3, pas un simple argmin global).
 */
export function labelTopStations(items: ScoredStation[], topCount = 3): Map<string, string> {
  const top = items.slice(0, topCount).filter((item) => item.breakdown != null);
  const labels = new Map<string, string>();
  const used = new Set<string>();

  for (const item of top) {
    const breakdown = item.breakdown as ScoreBreakdown;
    const ranked = (["price", "distance", "freshness"] as const)
      .slice()
      .sort((a, b) => breakdown[b] - breakdown[a]);
    const label =
      ranked.map((key) => LABEL_BY_CRITERION[key]).find((candidate) => !used.has(candidate)) ??
      "Meilleur compromis";
    labels.set(item.stationId, label);
    used.add(label);
  }

  return labels;
}
