import { notFound } from "next/navigation";

import { Map } from "@/components/Map";
import { PriceTable } from "@/components/PriceTable";
import { getStationById } from "@/lib/api";

interface StationPageProps {
  params: { id: string };
}

export default async function StationPage({ params }: StationPageProps) {
  const station = await getStationById(params.id);

  if (station === null) {
    notFound();
  }

  const markers = station.location
    ? [
        {
          id: station.station_id,
          lat: station.location.lat,
          lon: station.location.lon,
          label: station.nom ?? "Station",
        },
      ]
    : [];

  const directionsUrl = station.location
    ? `https://www.google.com/maps/dir/?api=1&destination=${station.location.lat},${station.location.lon}`
    : null;

  return (
    <div className="detail">
      <div className="detail__sticky-header">
        <h1>{station.nom ?? station.adresse ?? "Station"}</h1>
        {directionsUrl && (
          <a
            className="result-item__cta"
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Itinéraire
          </a>
        )}
      </div>
      <p className="result-item__meta">
        {station.adresse} — {station.ville} ({station.code_postal})
      </p>
      {station.mise_a_jour && (
        <p className="result-item__meta">
          Prix mis à jour le {new Date(station.mise_a_jour).toLocaleString("fr-FR")}
        </p>
      )}
      <div className="detail__map">
        <Map markers={markers} />
      </div>
      <div className="detail__card">
        <PriceTable station={station} />
      </div>
    </div>
  );
}
