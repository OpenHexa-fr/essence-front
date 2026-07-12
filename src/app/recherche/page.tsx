import { SearchResults } from "@/components/SearchResults";
import { searchStations } from "@/lib/api";

interface RecherchePageProps {
  searchParams: { ville?: string; lat?: string; lon?: string };
}

export default async function RecherchePage({ searchParams }: RecherchePageProps) {
  const lat = searchParams.lat ? Number(searchParams.lat) : undefined;
  const lon = searchParams.lon ? Number(searchParams.lon) : undefined;

  const results = await searchStations({
    ville: searchParams.ville,
    lat,
    lon,
    size: 20,
  });

  return <SearchResults items={results.items} total={results.total} />;
}
