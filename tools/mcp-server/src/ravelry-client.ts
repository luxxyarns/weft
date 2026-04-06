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

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: createAuthHeader("GET", url.toString(), this.credentials), Accept: "application/json" },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ravelry API ${response.status}: ${body}`);
    }

    return response.json() as Promise<T>;
  }

  async post<T = unknown>(path: string, body: Record<string, unknown> = {}): Promise<T> {
    const url = new URL(path, BASE_URL);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        Authorization: createAuthHeader("POST", url.toString(), this.credentials),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ravelry API ${response.status}: ${text}`);
    }

    return response.json() as Promise<T>;
  }

  async delete(path: string): Promise<void> {
    const url = new URL(path, BASE_URL);

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: { Authorization: createAuthHeader("DELETE", url.toString(), this.credentials) },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ravelry API ${response.status}: ${body}`);
    }
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
