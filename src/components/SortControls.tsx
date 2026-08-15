"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { StationSort } from "@/lib/api";
import { isFuelKey } from "@/lib/fuels";

const TABS: {
  key: StationSort;
  label: string;
  requiresLocation?: boolean;
  requiresFuel?: boolean;
}[] = [
  { key: "score", label: "Score", requiresFuel: true },
  { key: "prix", label: "Prix", requiresFuel: true },
  { key: "distance", label: "Distance", requiresLocation: true },
  { key: "recent", label: "Récent" },
];

export function SortControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasLocation = searchParams.has("lat") && searchParams.has("lon");
  const carburant = searchParams.get("carburant");
  const hasFuel = carburant !== null && isFuelKey(carburant);
  const activeTri = (searchParams.get("tri") as StationSort | null) ?? (hasFuel ? "score" : "recent");

  function setTri(tri: StationSort) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tri", tri);
    router.push(`/recherche?${params.toString()}`);
  }

  return (
    <div className="sort-controls" role="group" aria-label="Trier les résultats">
      {TABS.map(({ key, label, requiresLocation, requiresFuel }) => {
        const disabled = (requiresLocation && !hasLocation) || (requiresFuel && !hasFuel);
        const title = requiresLocation && !hasLocation
          ? "Recherchez une adresse ou utilisez « Autour de moi » pour trier par distance"
          : requiresFuel && !hasFuel
            ? "Sélectionnez un carburant pour trier par ce critère"
            : undefined;
        return (
          <button
            key={key}
            type="button"
            className={`sort-controls__button${activeTri === key ? " sort-controls__button--active" : ""}`}
            onClick={() => setTri(key)}
            disabled={disabled}
            title={title}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
