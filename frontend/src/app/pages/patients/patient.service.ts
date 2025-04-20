import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private patients: Patient[] = [
    {
      id: 1,
      name: 'João da Silva',
      email: 'joao@email.com',
      phone: '11999999999',
    },
    {
      id: 2,
      name: 'Maria Oliveira',
      email: 'maria@email.com',
      phone: '11988888888',
    },
    {
      id: 3,
      name: 'Carlos Souza',
      email: 'carlos@email.com',
      phone: '11977777777',
    },
  ];

  getAll(): Observable<Patient[]> {
    return of(this.patients);
  }

  delete(id: number): Observable<void> {
    this.patients = this.patients.filter((p) => p.id !== id);
    return of();
  }
}
