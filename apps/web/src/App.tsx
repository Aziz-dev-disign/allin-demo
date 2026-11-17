import { useEffect, useState } from "react";

type Coach = { id: string; fullName: string };

/**
 * Point de départ du portail membre.
 * TODO(issue #3) : afficher le statut du membre, son coach et la prochaine étape.
 */
export function App() {
  const [coaches, setCoaches] = useState<Coach[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/coaches")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setCoaches)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: 640, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Portail membre</h1>
      <p>Coachs disponibles :</p>
      {error && <p role="alert">Erreur : {error}</p>}
      {!coaches && !error && <p>Chargement…</p>}
      <ul>
        {coaches?.map((c) => (
          <li key={c.id}>{c.fullName}</li>
        ))}
      </ul>
    </main>
  );
}
