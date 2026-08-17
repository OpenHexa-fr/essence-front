"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  label: string;
  price?: number | null;
}

export interface UserLocation {
  lat: number;
  lon: number;
}

interface LeafletMapInnerProps {
  markers: MapMarker[];
  activeId?: string | null;
  zoom?: number;
  userLocation?: UserLocation | null;
  /** Affiche des pastilles numérotées 1-2-3 pour les premiers marqueurs (résultats classés). */
  showRank?: boolean;
  onMarkerClick?: (id: string) => void;
}

const FRANCE_CENTER: [number, number] = [46.6, 2.2];
const TOP_RANK_COUNT = 3;

function FlyToActiveMarker({
  markers,
  activeId,
}: {
  markers: MapMarker[];
  activeId?: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!activeId) return;
    const marker = markers.find((item) => item.id === activeId);
    if (!marker || !Number.isFinite(marker.lat) || !Number.isFinite(marker.lon)) return;
    try {
      // `flyTo` peut lever en interne (ex. calcul de projection Leaflet sur un
      // conteneur pas encore correctement dimensionné) : jamais laisser une
      // exception ici faire planter toute la page (error boundary) pour un
      // simple raté d'animation de la carte — au pire, elle ne se déplace pas.
      map.flyTo([marker.lat, marker.lon], Math.max(map.getZoom(), 14), { duration: 0.5 });
    } catch (error) {
      console.warn("map_fly_to_failed", error);
    }
  }, [activeId, markers, map]);

  return null;
}

// Marqueur pastille orange numéroté (top 3 du tri courant), façon "meilleur choix".
function rankIcon(rank: number): L.DivIcon {
  return L.divIcon({
    className: "map-marker-rank",
    html: `<span>${rank}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

// Pastille blanche avec le prix, façon Maps de comparateurs de prix.
// Pas de iconSize fixe : la largeur s'adapte au texte, `transform: translateX(-50%)`
// en CSS recentre la pastille sur le point géographique quelle que soit sa largeur.
function priceIcon(price: number): L.DivIcon {
  const label = `${price.toFixed(3)} €`;
  return L.divIcon({
    className: "map-marker-price",
    html: `<span>${label}</span>`,
    iconAnchor: [0, 13],
  });
}

// Marqueur neutre (station sans prix connu pour le carburant filtré, ou fiche détail).
function dotIcon(): L.DivIcon {
  return L.divIcon({
    className: "map-marker-dot",
    html: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function LeafletMapInner({
  markers,
  activeId,
  zoom = 13,
  userLocation,
  showRank = false,
  onMarkerClick,
}: LeafletMapInnerProps) {
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lon]
    : markers.length
      ? [markers[0].lat, markers[0].lon]
      : FRANCE_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={userLocation || markers.length ? zoom : 5}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToActiveMarker markers={markers} activeId={activeId} />
      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lon]}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: "#1e9e58",
            fillOpacity: 1,
          }}
        >
          <Popup>Votre position</Popup>
        </CircleMarker>
      )}
      {markers
        .filter((marker) => Number.isFinite(marker.lat) && Number.isFinite(marker.lon))
        .map((marker, index) => {
        const isTopRank = showRank && index < TOP_RANK_COUNT;
        const icon = isTopRank
          ? rankIcon(index + 1)
          : marker.price != null
            ? priceIcon(marker.price)
            : dotIcon();
        return (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lon]}
            icon={icon}
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(marker.id) } : undefined}
          />
        );
      })}
    </MapContainer>
  );
}
