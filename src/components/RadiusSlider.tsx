"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { DEFAULT_RADIUS_KM } from "@/lib/fuels";

const MIN_KM = 1;
const MAX_KM = 50;

/** Slider du rayon de recherche. Ne navigue qu'au relâchement, pas à chaque pixel glissé. */
export function RadiusSlider() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = Number(searchParams.get("radius_km")) || DEFAULT_RADIUS_KM;
  const [value, setValue] = useState(initial);

  function commit(km: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("radius_km", String(km));
    router.push(`/recherche?${params.toString()}`);
  }

  return (
    <div className="filter-field">
      <div className="filter-field__row">
        <label htmlFor="radius-slider" className="filter-field__label">
          Rayon de recherche
        </label>
        <span className="filter-field__value">{value} km</span>
      </div>
      <input
        id="radius-slider"
        type="range"
        min={MIN_KM}
        max={MAX_KM}
        value={value}
        className="radius-slider"
        onChange={(event) => setValue(Number(event.target.value))}
        onMouseUp={() => commit(value)}
        onTouchEnd={() => commit(value)}
        onKeyUp={() => commit(value)}
      />
      <div className="filter-field__scale">
        <span>{MIN_KM} km</span>
        <span>{MAX_KM} km</span>
      </div>
    </div>
  );
}
