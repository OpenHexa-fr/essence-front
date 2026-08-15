"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { FUEL_FILTER_OPTIONS } from "@/lib/fuels";

/** Pastilles de type de carburant (par famille), "Tous" inclus (pas de filtre `carburant`). */
export function FuelFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("carburant");
  const activeFamily = FUEL_FILTER_OPTIONS.find((option) => option.key === active);

  function setCarburant(key: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (key) {
      params.set("carburant", key);
    } else {
      params.delete("carburant");
      // Le tri par prix/score n'a plus de sens sans carburant précis.
      if (params.get("tri") === "prix" || params.get("tri") === "score") {
        params.delete("tri");
      }
    }
    router.push(`/recherche?${params.toString()}`);
  }

  return (
    <div>
      <div className="fuel-pills" role="group" aria-label="Type de carburant">
        <button
          type="button"
          className={`fuel-pill${active === null ? " fuel-pill--active" : ""}`}
          onClick={() => setCarburant(null)}
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
