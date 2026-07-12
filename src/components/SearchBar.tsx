"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { DEFAULT_FUEL, DEFAULT_RADIUS_KM, FUEL_OPTIONS, isFuelKey } from "@/lib/fuels";

interface SearchBarProps {
  variant?: "hero" | "panel";
}

export function SearchBar({ variant = "hero" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ville, setVille] = useState(searchParams.get("ville") ?? "");
  const [carburant, setCarburant] = useState(() => {
    const value = searchParams.get("carburant");
    return value && isFuelKey(value) ? value : DEFAULT_FUEL;
  });
  const [radiusKm, setRadiusKm] = useState(
    () => Number(searchParams.get("radius_km")) || DEFAULT_RADIUS_KM,
  );
  const [geoError, setGeoError] = useState<string | null>(null);

  function baseParams(): URLSearchParams {
    const params = new URLSearchParams();
    params.set("carburant", carburant);
    params.set("radius_km", String(radiusKm));
    const tri = searchParams.get("tri");
    if (tri) params.set("tri", tri);
    return params;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = baseParams();
    if (ville) params.set("ville", ville);
    router.push(`/recherche?${params.toString()}`);
  }

  function handleGeolocate() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = baseParams();
        params.set("lat", String(position.coords.latitude));
        params.set("lon", String(position.coords.longitude));
        router.push(`/recherche?${params.toString()}`);
      },
      () => {
        setGeoError("Impossible de récupérer votre position.");
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`search-bar search-bar--${variant}`}>
      <span className="search-bar__icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"
            fill="currentColor"
          />
        </svg>
      </span>
      <input
        type="text"
        name="ville"
        placeholder="Ville"
        value={ville}
        onChange={(event) => setVille(event.target.value)}
      />
      {ville && (
        <button
          type="button"
          className="search-bar__clear"
          aria-label="Effacer la ville"
          onClick={() => setVille("")}
        >
          ×
        </button>
      )}
      <select
        className="search-bar__select"
        aria-label="Type de carburant"
        value={carburant}
        onChange={(event) => {
          const { value } = event.target;
          if (isFuelKey(value)) setCarburant(value);
        }}
      >
        {FUEL_OPTIONS.map(({ key, label }) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <select
        className="search-bar__select"
        aria-label="Rayon de recherche"
        value={radiusKm}
        onChange={(event) => setRadiusKm(Number(event.target.value))}
      >
        {[2, 5, 10, 20, 50].map((km) => (
          <option key={km} value={km}>
            {km} km
          </option>
        ))}
      </select>
      <button type="submit" className="search-bar__submit">
        Rechercher
      </button>
      <button type="button" className="search-bar__secondary" onClick={handleGeolocate}>
        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.94 3A9 9 0 0 0 13 3.06V1h-2v2.06A9 9 0 0 0 3.06 11H1v2h2.06A9 9 0 0 0 11 20.94V23h2v-2.06A9 9 0 0 0 20.94 13H23v-2h-2.06zM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"
            fill="currentColor"
          />
        </svg>
        Autour de moi
      </button>
      {geoError && (
        <p className="search-bar__error" role="alert">
          {geoError}
        </p>
      )}
    </form>
  );
}
