"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { StationSort } from "@/lib/api";

const TABS: { key: StationSort; label: string; requiresLocation?: boolean }[] = [
  { key: "prix", label: "Prix" },
  { key: "distance", label: "Distance", requiresLocation: true },
  { key: "recent", label: "Récent" },
];

export function SortControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasLocation = searchParams.has("lat") && searchParams.has("lon");
  const activeTri = (searchParams.get("tri") as StationSort | null) ?? "prix";

  function setTri(tri: StationSort) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tri", tri);
    router.push(`/recherche?${params.toString()}`);
  }

  return (
    <div className="sort-controls" role="group" aria-label="Trier les résultats">
      {TABS.map(({ key, label, requiresLocation }) => {
        const disabled = requiresLocation && !hasLocation;
        return (
          <button
            key={key}
            type="button"
            className={`sort-controls__button${activeTri === key ? " sort-controls__button--active" : ""}`}
            onClick={() => setTri(key)}
            disabled={disabled}
            title={disabled ? "Utilisez « Autour de moi » pour trier par distance" : undefined}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
