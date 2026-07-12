import Link from "next/link";
import { Suspense } from "react";

import { SearchBar } from "@/components/SearchBar";

export default function HomePage() {
  return (
    <section className="hero">
      <h1 className="hero__title">Trouvez la station la moins chère</h1>
      <p className="hero__subtitle">
        Prix des carburants en France, mis à jour en continu depuis les données ouvertes.
      </p>
      <Suspense fallback={null}>
        <SearchBar variant="hero" />
      </Suspense>
      <Link href="/recherche" className="hero__link">
        Voir toutes les stations
      </Link>
    </section>
  );
}
