"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { FUEL_OPTIONS, isFuelKey } from "@/lib/fuels";

/** Pastilles de type de carburant, "Tous" inclus (pas de filtre `carburant`). */
export function FuelFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("carburant");
  const active = current && isFuelKey(current) ? current : null;

  function setFuel(key: string | null) {
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
    <div className="fuel-pills" role="group" aria-label="Type de carburant">
      <button
        type="button"
        className={`fuel-pill${active === null ? " fuel-pill--active" : ""}`}
        onClick={() => setFuel(null)}
      >
        Tous
      </button>
      {FUEL_OPTIONS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`fuel-pill${active === key ? " fuel-pill--active" : ""}`}
          onClick={() => setFuel(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
