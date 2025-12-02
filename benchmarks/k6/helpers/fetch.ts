import http from 'k6/http';

function normalizeEndpoint(endpoint: string): string {
  return endpoint
    .replace(/\/guilds\/[^/]+/g, '/guilds/:id')
    .replace(/\/channels\/[^/]+/g, '/channels/:id')
    .replace(/\/users\/(?!me\/)[^/]+/g, '/users/:id')
    .replace(/\/invites\/[^/]+/g, '/invites/:code')
    .replace(/\/messages\/[^/]+/g, '/messages/:id');
}

type ResponseWithStatus<T> = {
  data: T;
  status: number;
}

export class HttpClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  public setToken(token: string) {
    this.token = token;
  }
  
  public get<T>(endpoint: string): ResponseWithStatus<T> {
    const res = http.get(`${this.baseUrl}${endpoint}`, {
      headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
      tags: { name: `GET ${normalizeEndpoint(endpoint)}` },
    });
    if (res.status >= 400) {
      console.error(`GET ${endpoint} failed: ${res.status} - ${res.body}`);
    }
    return { data: res.json() as T, status: res.status };
  }

  public post<Request, Response>(endpoint: string, body: Request): ResponseWithStatus<Response> {
    const res = http.post(`${this.baseUrl}${endpoint}`, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      },
      tags: { name: `POST ${normalizeEndpoint(endpoint)}` },
    });
    if (res.status >= 400) {
      console.error(`POST ${endpoint} failed: ${res.status} - ${res.body}`);
    }
    return { data: res.json() as Response, status: res.status };
  }

  public put<Request, Response>(endpoint: string, body: Request): ResponseWithStatus<Response> {
    const res = http.put(`${this.baseUrl}${endpoint}`, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      },
      tags: { name: `PUT ${normalizeEndpoint(endpoint)}` },
    });
    return { data: res.json() as Response, status: res.status };
  }

  public delete<Request, Response>(endpoint: string, params?: Request): ResponseWithStatus<Response> {
    const res = http.del(`${this.baseUrl}${endpoint}`, null, {
      headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
      params: params,
      tags: { name: `DELETE ${normalizeEndpoint(endpoint)}` },
    });
    return { data: res.json() as Response, status: res.status };
  }

  public patch<Request, Response>(endpoint: string, body: Request): ResponseWithStatus<Response> {
    const res = http.patch(`${this.baseUrl}${endpoint}`, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      },
      tags: { name: `PATCH ${normalizeEndpoint(endpoint)}` },
    });

    return { data: res.json() as Response, status: res.status };
  }
}
