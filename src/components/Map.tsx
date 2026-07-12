"use client";

import dynamic from "next/dynamic";

import type { MapMarker, UserLocation } from "./LeafletMapInner";

// Leaflet accède à `window` au chargement du module : le rendu SSR doit être désactivé.
const LeafletMapInner = dynamic(() => import("./LeafletMapInner"), { ssr: false });

interface MapProps {
  markers: MapMarker[];
  activeId?: string | null;
  zoom?: number;
  userLocation?: UserLocation | null;
  showRank?: boolean;
}

export function Map({ markers, activeId, zoom, userLocation, showRank }: MapProps) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <LeafletMapInner
        markers={markers}
        activeId={activeId}
        zoom={zoom}
        userLocation={userLocation}
        showRank={showRank}
      />
    </div>
  );
}
