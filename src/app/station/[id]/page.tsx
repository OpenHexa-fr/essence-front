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
    ? [{ lat: station.location.lat, lon: station.location.lon, label: station.nom ?? "Station" }]
    : [];

  return (
    <section>
      <h1>{station.nom ?? station.adresse ?? "Station"}</h1>
      <p>
        {station.adresse} — {station.ville} ({station.code_postal})
      </p>
      {station.mise_a_jour && (
        <p>Prix mis à jour le {new Date(station.mise_a_jour).toLocaleString("fr-FR")}</p>
      )}
      <Map markers={markers} />
      <PriceTable station={station} />
    </section>
  );
}
