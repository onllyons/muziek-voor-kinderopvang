// lib/gql.ts
import { fetchWithTimeout, withRetry, FriendlyError } from "./network";
import { assertEnv } from "./env";

const { url: SUPABASE_URL, key: ANON_KEY } = assertEnv();
const GQL_ENDPOINT = `${SUPABASE_URL}/graphql/v1`;

type GQLError = { message: string };

export async function gqlFetch<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const exec = async () => {
    const res = await fetchWithTimeout(GQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ query, variables }),
      timeoutMs: 10000,
    });

    if (!res.ok) {
      if (res.status >= 500) {
        throw new FriendlyError("Server unavailable. Retrying...", "SERVER");
      }
      const text = await res.text().catch(() => "");
      throw new Error(`GraphQL ${res.status} at ${GQL_ENDPOINT} :: ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    if (json.errors?.length) {
      const msg = (json.errors as GQLError[]).map(e => e.message).join("; ");
      throw new Error(msg || "GraphQL error");
    }
    return json.data as T;
  };

  return withRetry(exec, { retries: 3, baseDelayMs: 300 });
}

export function edgesToArray<T = any>(
  conn?: { edges?: { node: T }[] } | null
): T[] {
  return conn?.edges?.map(e => e.node) ?? [];
}
