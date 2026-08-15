"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

import { geocodeAddress } from "@/lib/geocode";

interface SearchBarProps {
  variant?: "hero" | "panel";
}

export function SearchBar({ variant = "hero" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conserve les filtres actifs (carburant, rayon, tri, prix max) au moment
  // de changer de position ; seuls lat/lon sont remplacés.
  function baseParams(): URLSearchParams {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lat");
    params.delete("lon");
    return params;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await geocodeAddress(query);
      if (!result) {
        setError("Aucun résultat trouvé.");
        return;
      }
      const params = baseParams();
      params.set("lat", String(result.lat));
      params.set("lon", String(result.lon));
      router.push(`/recherche?${params.toString()}`);
    } catch {
      setError("La recherche a échoué.");
    } finally {
      setLoading(false);
    }
  }

  function handleGeolocate() {
    setError(null);
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas disponible sur cet appareil.");
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
        setError("Impossible de récupérer votre position.");
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`address-search address-search--${variant}`}>
      <span className="address-search__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"
            fill="currentColor"
          />
        </svg>
      </span>
      <input
        type="text"
        className="address-search__input"
        placeholder="Adresse, ville, code postal…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Adresse de recherche"
      />
      {loading && <span className="address-search__spinner" aria-hidden="true" />}
      <button
        type="button"
        className="address-search__locate"
        onClick={handleGeolocate}
        title="Autour de moi"
        aria-label="Utiliser ma position actuelle"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.94 3A9 9 0 0 0 13 3.06V1h-2v2.06A9 9 0 0 0 3.06 11H1v2h2.06A9 9 0 0 0 11 20.94V23h2v-2.06A9 9 0 0 0 20.94 13H23v-2h-2.06zM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"
            fill="currentColor"
          />
        </svg>
      </button>
      {error && (
        <p className="address-search__error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
