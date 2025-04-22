import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService, Patient } from './patient.service';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
})
export class PatientsComponent implements OnInit, OnDestroy {
  patients: Patient[] = [];
  showViewModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedPatient: Patient | null = null;
  formPatient: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'expanded'> =
    {
      name: '',
      email: '',
      phone: '',
      address: '',
    };

  socket!: Socket;
  fieldLocks: { [key: string]: string } = {};
  currentUser: string = '';

  constructor(
    private patientService: PatientService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        this.router.navigate(['/']);
        return;
      }
      this.currentUser = this.getCurrentUserFromToken(token);
    }

    this.loadPatients();

    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    this.socket.on('field-locked', ({ field, user }) => {
      if (user !== this.currentUser) {
        this.fieldLocks[field] = user;
      }
    });

    this.socket.on('field-unlocked', ({ field }) => {
      delete this.fieldLocks[field];
    });

    this.socket.on('field-updated', ({ field, value, user }) => {
      if (user !== this.currentUser && this.showEditModal) {
        (this.formPatient as any)[field] = value;
      }
    });

    this.socket.on('patient-updated', (updatedPatient: Patient) => {
      const index = this.patients.findIndex((p) => p.id === updatedPatient.id);
      if (index !== -1) {
        this.patients[index] = { ...updatedPatient };
      } else {
        this.patients.push({ ...updatedPatient });
      }
    });
  }

  ngOnDestroy(): void {
    this.unlockAllFields();
    this.socket.disconnect();
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe((data) => {
      this.patients = data;
    });
  }

  openViewModal(patient: Patient): void {
    this.selectedPatient = patient;
    this.showViewModal = true;
  }

  openEditModal(patient: Patient): void {
    this.selectedPatient = patient;
    this.formPatient = {
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
    };
    this.showEditModal = true;
  }

  openDeleteModal(patient: Patient): void {
    this.selectedPatient = patient;
    this.showDeleteModal = true;
  }

  closeModals(): void {
    this.showViewModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.selectedPatient = null;
    this.unlockAllFields();
  }

  savePatient(): void {
    if (
      !this.formPatient.name ||
      !this.formPatient.email ||
      !this.formPatient.phone ||
      !this.formPatient.address
    ) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (this.selectedPatient) {
      this.patientService
        .update(this.selectedPatient.id, this.formPatient)
        .subscribe((updatedPatient) => {
          this.loadPatients();
          this.closeModals();
          alert('Paciente atualizado com sucesso!');
          this.socket.emit('patient-updated', updatedPatient);
        });
    } else {
      this.patientService.create(this.formPatient).subscribe((newPatient) => {
        this.loadPatients();
        this.closeModals();
        alert('Paciente criado com sucesso!');
        this.socket.emit('patient-updated', newPatient);
      });
    }
  }

  confirmDelete(): void {
    if (this.selectedPatient) {
      this.patientService.delete(this.selectedPatient.id).subscribe(() => {
        this.patients = this.patients.filter(
          (p) => p.id !== this.selectedPatient!.id
        );
        this.closeModals();
        alert('Paciente excluído com sucesso!');
      });
    }
  }

  onFocus(field: string): void {
    this.socket.emit('lock-field', { field, user: this.currentUser });
  }

  onBlur(field: string): void {
    this.socket.emit('unlock-field', { field });
  }

  onInput(field: string, value: string): void {
    this.socket.emit('update-field', { field, value, user: this.currentUser });
  }

  isFieldLocked(field: string): boolean {
    return !!this.fieldLocks[field];
  }

  getLocker(field: string): string {
    return this.fieldLocks[field] || '';
  }

  openCreateForm(): void {
    this.selectedPatient = null;
    this.formPatient = { name: '', email: '', phone: '', address: '' };
    this.showEditModal = true;
  }

  private unlockAllFields(): void {
    ['name', 'email', 'phone', 'address'].forEach((field) => {
      this.socket.emit('unlock-field', { field });
    });
  }

  private getCurrentUserFromToken(token: string): string {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      return (
        decodedPayload.name || `Usuário-${Math.floor(Math.random() * 1000)}`
      );
    } catch (e) {
      console.error('Erro ao decodificar o token JWT:', e);
      return `Usuário-${Math.floor(Math.random() * 1000)}`;
    }
  }
}
