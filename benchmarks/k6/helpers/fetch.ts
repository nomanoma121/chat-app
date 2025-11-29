import http from 'k6/http';

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
  
  public get<T>(endpoint: string): T {
    const res = http.get(`${this.baseUrl}${endpoint}`, {
      headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
    });
    return res.json() as T;
  }

  public post<Request, Response>(endpoint: string, body: Request): Response {
    const res = http.post(`${this.baseUrl}${endpoint}`, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      },
    });
    return res.json() as Response;
  }

  public put<Request, Response>(endpoint: string, body: Request): Response {
    const res = http.put(`${this.baseUrl}${endpoint}`, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      },
    });
    return res.json() as Response;
  }

  public delete<Request, Response>(endpoint: string, params?: Request): Response {
    const res = http.del(`${this.baseUrl}${endpoint}`, null, {
      headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
      params: params,
    });
    return res.json() as Response;
  }

  public patch<Request, Response>(endpoint: string, body: Request): Response {
    const res = http.patch(`${this.baseUrl}${endpoint}`, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      },
    });
    return res.json() as Response;
  }
}
