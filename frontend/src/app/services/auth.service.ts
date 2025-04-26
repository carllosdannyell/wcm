import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient, private router: Router) {}

  async login(email: string, password: string): Promise<Observable<any>> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        catchError((error) => {
          console.error('Erro no login:', error);
          return throwError(() => new Error('Credenciais inválidas'));
        })
      );
  }

  saveToken(access_token: string): void {
    sessionStorage.setItem('access_token', access_token);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('access_token');
    }
    return null;
  }

  logout(): void {
    sessionStorage.removeItem('access_token');
    this.router.navigate(['/']);
  }
}
