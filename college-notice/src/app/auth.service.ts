
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  token?: string;
  message?: string;
  role?: string;
  name?: string;
  username?: string;
  user?: {
    name?: string;
    role?: string;
    username?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  register(data: {
    name: string;
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      data
    );
  }

  studentLogin(data: {
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/student-login`, data)
      .pipe(
        tap((response) => this.saveSession(response, 'student'))
      );
  }

  adminLogin(data: {
    username: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/admin-login`, data)
      .pipe(
        tap((response) => this.saveSession(response, 'admin'))
      );
  }

  private saveSession(
    response: AuthResponse,
    defaultRole: string
  ): void {
    const token = response.token;
    const role = (
      response.user?.role ||
      response.role ||
      defaultRole
    ).toLowerCase();

    const name =
      response.user?.name ||
      response.user?.username ||
      response.name ||
      response.username ||
      '';

    if (token) {
      localStorage.setItem('authToken', token);
    }

    localStorage.setItem('userRole', role);

    if (name) {
      localStorage.setItem('userName', name);
    } else {
      localStorage.removeItem('userName');
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  get role(): string {
    return (localStorage.getItem('userRole') || '').toLowerCase();
  }

  get userName(): string {
    return localStorage.getItem('userName') || '';
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
  }
}
