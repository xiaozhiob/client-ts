/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/ban-types */
import type { SimpleError } from './responses';

const resolveUrl = (url: string, queryParams: Record<string, any> = {}, pathParams: Record<string, string> = {}) => {
  const query = new URLSearchParams(queryParams).toString();
  const queryString = query.length > 0 ? `?${query}` : '';
  return url.replace(/\{\w*\}/g, (key) => pathParams[key.slice(1, -1)]) + queryString;
};

// Typed only the subset of the spec we actually use (to be able to build a simple mock)
export type FetchImpl = (
  url: string,
  init?: { body?: string; headers?: Record<string, string>; method?: string }
) => Promise<{ ok: boolean; status: number; json(): Promise<any> }>;

export type FetcherExtraProps = {
  apiUrl: string;
  workspacesApiUrl: string;
  fetchImpl: FetchImpl;
  apiKey: string;
};

export type FetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string;
  method: string;
  body?: TBody;
  headers?: THeaders;
  queryParams?: TQueryParams;
  pathParams?: TPathParams;
};

const fallbackError: SimpleError = { message: 'Network response was not ok' };

function baseURLForWorkspace(workspacesApiUrl: string, workspace: string) {
  // Node.js on localhost won't resolve localhost subdomains unless mapped in /etc/hosts
  // So, instead, we use localhost without subdomains, but will add a Host header
  if (typeof window === 'undefined' && workspacesApiUrl.includes('localhost:')) {
    return workspacesApiUrl.replace('{workspaceId}.', '');
  }
  return workspacesApiUrl.replace('{workspaceId}', workspace);
}

function hostHeaderForWorkspace(workspacesApiUrl: string, workspace: string) {
  const url = baseURLForWorkspace(workspacesApiUrl, workspace);
  if (!url) return;
  const [, hostname] = url.split('://');
  return hostname;
}

export async function fetch<
  TData,
  TBody extends Record<string, unknown> | undefined,
  THeaders extends Record<string, unknown>,
  TQueryParams extends Record<string, unknown>,
  TPathParams extends Record<string, string>
>({
  url,
  method,
  body,
  headers,
  pathParams,
  queryParams,
  fetchImpl,
  apiKey,
  apiUrl,
  workspacesApiUrl
}: FetcherOptions<TBody, THeaders, TQueryParams, TPathParams> & FetcherExtraProps): Promise<TData> {
  const baseURL = pathParams?.workspace ? baseURLForWorkspace(workspacesApiUrl, pathParams.workspace) : apiUrl;
  const response = await fetchImpl(`${baseURL}${resolveUrl(url, queryParams, pathParams)}`, {
    method: method.toUpperCase(),
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      Authorization: `Bearer ${apiKey}`,
      // The host header is needed by Node.js on localhost.
      // It is ignored by fetch() in the frontend
      ...(pathParams?.workspace ? { Host: hostHeaderForWorkspace(workspacesApiUrl, pathParams.workspace) } : {})
    }
  });

  // No content
  if (response.status === 204) {
    return {} as TData;
  }

  try {
    const jsonResponse = await response.json();

    if (response.ok) {
      return jsonResponse;
    }

    if (jsonResponse.success) {
      throw withStatus(jsonResponse.data, response.status);
    } else if (jsonResponse.message) {
      throw withStatus({ message: jsonResponse.message }, response.status);
    } else {
      throw withStatus(fallbackError, response.status);
    }
  } catch (e) {
    if (e instanceof Error) {
      const error: SimpleError = {
        message: e.message
      };
      throw withStatus(error, response.status);
    } else if (typeof e === 'object' && typeof (e as SimpleError).message === 'string') {
      throw withStatus(e as SimpleError, response.status);
    } else {
      throw withStatus(fallbackError, response.status);
    }
  }
}

const withStatus = (error: SimpleError, status: number) => ({ ...error, status });
