/**
 * Fan API client — thin fetch wrapper with typed errors.
 * All Fan API calls go through `apiFetch`.
 */

// ---------------------------------------------------------------------------
// Error hierarchy
// ---------------------------------------------------------------------------

export class FanApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FanApiError";
  }
}

export class ConfigurationError extends FanApiError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class NotFoundError extends FanApiError {
  url: string;
  constructor(url: string) {
    super(`Not found: ${url}`);
    this.name = "NotFoundError";
    this.url = url;
  }
}

export class BadRequestError extends FanApiError {
  body: string;
  constructor(body: string) {
    super(body);
    this.name = "BadRequestError";
    this.body = body;
  }
}

export class ServerError extends FanApiError {
  body: string;
  constructor(body: string) {
    super(body);
    this.name = "ServerError";
    this.body = body;
  }
}

export class NetworkError extends FanApiError {
  override cause: unknown;
  constructor(cause: unknown) {
    super(cause instanceof Error ? cause.message : "Network request failed");
    this.name = "NetworkError";
    this.cause = cause;
  }
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Fetches a Fan API endpoint and returns the parsed JSON response.
 *
 * @param path  - Path relative to the base URL, e.g. "/leagues" or "/matches/uuid"
 * @param params - Optional query parameters; null/undefined values are omitted
 */
export async function apiFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_FAN_API_URL;
  if (!baseUrl) {
    throw new ConfigurationError(
      "NEXT_PUBLIC_FAN_API_URL is not set. " +
        "Add it to .env.local (development) or your deployment environment variables."
    );
  }

  // Build query string, omitting null/undefined values
  let url = `${baseUrl}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        qs.set(key, String(value));
      }
    }
    const qsStr = qs.toString();
    if (qsStr) url = `${url}?${qsStr}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    throw new NetworkError(err);
  }

  if (response.status === 404) {
    throw new NotFoundError(url);
  }

  if (response.status === 400) {
    let body = "";
    try {
      const json = await response.json();
      body = json?.error ?? JSON.stringify(json);
    } catch {
      body = await response.text().catch(() => "Bad request");
    }
    throw new BadRequestError(body);
  }

  if (response.status >= 500) {
    let body = "";
    try {
      const json = await response.json();
      body = json?.error ?? JSON.stringify(json);
    } catch {
      body = await response.text().catch(() => "Server error");
    }
    throw new ServerError(body);
  }

  return response.json() as Promise<T>;
}
