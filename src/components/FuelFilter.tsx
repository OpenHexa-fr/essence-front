"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { ALL_FUELS_PARAM, DEFAULT_CARBURANT_PARAM, FUEL_FILTER_OPTIONS } from "@/lib/fuels";

/** Pastilles de type de carburant (par famille), "Tous" inclus. */
export function FuelFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Absence du paramètre = pas encore de choix explicite = défaut (Sans-plomb),
  // pas "Tous" — voir DEFAULT_CARBURANT_PARAM.
  const active = searchParams.get("carburant") ?? DEFAULT_CARBURANT_PARAM;
  const activeFamily = FUEL_FILTER_OPTIONS.find((option) => option.key === active);

  function setCarburant(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("carburant", key);
    if (key === ALL_FUELS_PARAM && (params.get("tri") === "prix" || params.get("tri") === "score")) {
      // Le tri par prix/score n'a plus de sens sans carburant précis.
      params.delete("tri");
    }
    router.push(`/recherche?${params.toString()}`);
  }

  return (
    <div>
      <div className="fuel-pills" role="group" aria-label="Type de carburant">
        <button
          type="button"
          className={`fuel-pill${active === ALL_FUELS_PARAM ? " fuel-pill--active" : ""}`}
          onClick={() => setCarburant(ALL_FUELS_PARAM)}
        >
          Tous
        </button>
        {FUEL_FILTER_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`fuel-pill${active === key ? " fuel-pill--active" : ""}`}
            onClick={() => setCarburant(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {activeFamily && activeFamily.fields.length > 1 && (
        <p className="fuel-pills__hint">
          Inclut les stations {activeFamily.fields.map((f) => f.toUpperCase()).join(" et ")}
        </p>
      )}
    </div>
  );
}
