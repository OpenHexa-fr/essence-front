"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ville, setVille] = useState(searchParams.get("ville") ?? "");
  const [geoError, setGeoError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
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
        const params = new URLSearchParams();
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
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        name="ville"
        placeholder="Ville"
        value={ville}
        onChange={(event) => setVille(event.target.value)}
      />
      <button type="submit">Rechercher</button>
      <button type="button" onClick={handleGeolocate}>
        Autour de moi
      </button>
      {geoError && <p role="alert">{geoError}</p>}
    </form>
  );
}
