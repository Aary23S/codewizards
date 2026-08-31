// codewizards/client/src/hooks/useTeamMembers.js
// About.js and Team.js both need the full team roster; without sharing the fetch,
// bouncing between the two pages re-hits the API every time for identical data.
import { useEffect, useState } from "react";
import { getTeam } from "../services/api";

const CACHE_TTL_MS = 60 * 1000;
let cache = null; // { members, fetchedAt }
let inflightPromise = null;

export const useTeamMembers = () => {
  const isFresh = cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
  const [members, setMembers] = useState(isFresh ? cache.members : []);
  const [loading, setLoading] = useState(!isFresh);

  useEffect(() => {
    let cancelled = false;

    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
      setMembers(cache.members);
      setLoading(false);
      return undefined;
    }

    if (!inflightPromise) {
      inflightPromise = getTeam()
        .then((res) => {
          const data = res.data.data || [];
          cache = { members: data, fetchedAt: Date.now() };
          return data;
        })
        .catch((err) => {
          inflightPromise = null;
          throw err;
        })
        .finally(() => {
          inflightPromise = null;
        });
    }

    inflightPromise
      .then((data) => {
        if (cancelled) return;
        setMembers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { members, loading };
};
