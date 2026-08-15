"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

/** Plafond de prix (€/L). Ignoré côté API si aucun carburant n'est sélectionné. */
export function PriceMaxFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("prix_max") ?? "");

  function commit() {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("prix_max", value.trim());
    } else {
      params.delete("prix_max");
    }
    router.push(`/recherche?${params.toString()}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    commit();
  }

  return (
    <form className="filter-field" onSubmit={handleSubmit}>
      <label htmlFor="price-max" className="filter-field__label">
        Prix maximum (€/L)
      </label>
      <input
        id="price-max"
        type="number"
        step="0.01"
        min="0"
        inputMode="decimal"
        placeholder="Illimité"
        className="price-max-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
      />
    </form>
  );
}
