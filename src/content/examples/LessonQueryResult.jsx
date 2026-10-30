// Pure teaching view: result is the object returned by useQuery.
export default function LessonQueryResult({ courseId, result }) {
  if (!courseId) return <p>Velg et kurs.</p>;
  if (result.data === undefined) {
    if (result.isError) return <div role="alert">
      Kunne ikke hente leksjoner. <button onClick={() => result.refetch()}>Prøv igjen</button>
    </div>;
    if (result.isPaused) return <p role="status">Henting venter på nettforbindelse. Ingen data er lastet ennå.</p>;
    if (result.isPending || result.isLoading) return <p role="status">Laster leksjoner…</p>;
    return <div role="alert">Forespørselen mangler data. Kontroller API-kontrakten.
      <button onClick={() => result.refetch()}>Prøv igjen</button>
    </div>;
  }
  if (!Array.isArray(result.data)) return <p role="alert">API-et returnerte ikke en leksjonsliste.</p>;
  return <>
    {result.data.length === 0 ? <p>Ingen leksjoner.</p> :
      <ul>{result.data.map((lesson) => <li key={lesson.id}>{lesson.title}</li>)}</ul>}
    {result.isFetching && <p role="status">Oppdaterer…</p>}
    {result.isPaused && <p role="status">Oppfrisking venter på nettforbindelse. Tidligere data vises.</p>}
    {result.isError && <p role="alert">Oppfrisking feilet. Tidligere data beholdes.</p>}
    <button onClick={() => result.refetch()} disabled={result.isFetching}>Oppfrisk</button>
  </>;
}
