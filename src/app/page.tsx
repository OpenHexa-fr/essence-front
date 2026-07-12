import Link from "next/link";
import { Suspense } from "react";

import { SearchBar } from "@/components/SearchBar";

export default function HomePage() {
  return (
    <section>
      <h1>Trouvez la station la moins chère</h1>
      <p>Prix des carburants en France, mis à jour en continu depuis les données ouvertes.</p>
      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>
      <p>
        <Link href="/recherche">Voir toutes les stations</Link>
      </p>
    </section>
  );
}
