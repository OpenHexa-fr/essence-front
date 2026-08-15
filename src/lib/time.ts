/** Formate un ISO 8601 en fraîcheur relative courte ("il y a 3 h", "à l'instant"). */
export function formatRelativeFreshness(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffDays = Math.round(diffH / 24);
  return `il y a ${diffDays} j`;
}

/** Date de mise à jour la plus récente parmi une liste d'ISO 8601 (null/undefined ignorés). */
export function mostRecent(dates: (string | null | undefined)[]): string | null {
  const valid = dates.filter((d): d is string => Boolean(d));
  if (valid.length === 0) return null;
  return valid.reduce((latest, current) => (current > latest ? current : latest));
}
