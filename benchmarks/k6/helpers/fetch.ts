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
    return http.get(`${this.baseUrl}${endpoint}`, {
      headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
    });
  }

  public post<Request, Response>(endpoint: string, body: Request): Response {
    return http.post(`${this.baseUrl}${endpoint}`, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      },
    });
  }

  public put<Request, Response>(endpoint: string, body: Request): Response {
    return http.put(`${this.baseUrl}${endpoint}`, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      },
    });
  }

  public delete<Request, Response>(endpoint: string, params?: Request): Response {
    return http.del(`${this.baseUrl}${endpoint}`, null, {
      headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
      params: params,
    });
  }

  public patch<Request, Response>(endpoint: string, body: Request): Response {
    return http.patch(`${this.baseUrl}${endpoint}`, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      },
    });
  }
}
