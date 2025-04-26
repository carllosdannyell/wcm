import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at?: string;
  updated_at?: string;
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = 'http://localhost:3000/patients';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getAuthHeaders(): HttpHeaders {
    let token: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      token = sessionStorage.getItem('access_token');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`,
      'Content-Type': 'application/json',
    });
  }

  getAll(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  create(
    patient: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'expanded'>
  ): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient, {
      headers: this.getAuthHeaders(),
    });
  }

  update(
    id: number,
    patient: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'expanded'>
  ): Observable<Patient> {
    return this.http.patch<Patient>(`${this.apiUrl}/${id}`, patient, {
      headers: this.getAuthHeaders(),
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
