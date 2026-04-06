import { createAuthHeader, OAuthCredentials } from "./oauth.js";

const BASE_URL = "https://api.ravelry.com";

export class RavelryClient {
  private credentials: OAuthCredentials;

  constructor(credentials: OAuthCredentials) {
    this.credentials = credentials;
  }

  async get<T = unknown>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(path, BASE_URL);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const authHeader = createAuthHeader("GET", url.toString(), this.credentials);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: authHeader, Accept: "application/json" },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ravelry API ${response.status}: ${body}`);
    }

    return response.json() as Promise<T>;
  }

  async getAllPages<T = unknown>(
    path: string,
    resultKey: string,
    params: Record<string, string> = {},
    pageSize = 100
  ): Promise<T[]> {
    const all: T[] = [];
    let page = 1;

    while (true) {
      const data = await this.get<Record<string, unknown>>(path, {
        ...params,
        page: String(page),
        page_size: String(pageSize),
      });

      const items = data[resultKey] as T[] | undefined;
      if (!items || items.length === 0) break;
      all.push(...items);

      const paginator = data.paginator as { last_page?: number; page_count?: number } | undefined;
      if (paginator) {
        const lastPage = paginator.last_page ?? paginator.page_count ?? 1;
        if (page >= lastPage) break;
      }
      page++;
    }

    return all;
  }
}
