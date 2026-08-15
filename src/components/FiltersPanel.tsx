"use client";

import { useState } from "react";

import { FuelFilter } from "@/components/FuelFilter";
import { PriceMaxFilter } from "@/components/PriceMaxFilter";
import { RadiusSlider } from "@/components/RadiusSlider";

/** Section "Filtres" repliable : carburant, rayon, prix maximum. */
export function FiltersPanel() {
  const [open, setOpen] = useState(true);

  return (
    <div className="filters-panel">
      <button
        type="button"
        className="filters-panel__toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        Filtres
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          className={`filters-panel__chevron${open ? " filters-panel__chevron--open" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M7 10l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="filters-panel__body">
          <div className="filter-field">
            <span className="filter-field__label">Type de carburant</span>
            <FuelFilter />
          </div>
          <RadiusSlider />
          <PriceMaxFilter />
        </div>
      )}
    </div>
  );
}
