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
  showCreateModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedPatient: Patient | null = null;
  formPatient: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'expanded'> =
    {
      name: '',
      email: '',
      phone: '',
      address: '',
    };
  newPatient: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'expanded'> = {
    name: '',
    email: '',
    phone: '',
    address: '',
  };

  socket!: Socket;
  fieldLocks: { [key: string]: { [context: string]: string } } = {
    name: {},
    email: {},
    phone: {},
    address: {},
  };
  currentUser: string = '';

  constructor(
    private patientService: PatientService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = sessionStorage.getItem('access_token');
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

    this.socket.on('field-locked', ({ field, user, context }) => {
      if (user !== this.currentUser) {
        this.fieldLocks[field][context] = user;
      }
    });

    this.socket.on('patient-deleted', (data) => {
      this.patients = this.patients.filter((p) => p.id !== data.id);
    });

    this.socket.on('field-unlocked', ({ field, context }) => {
      delete this.fieldLocks[field][context];
    });

    this.socket.on('field-updated', ({ field, value, user, context }) => {
      if (user !== this.currentUser) {
        if (context === 'edit' && this.showEditModal) {
          (this.formPatient as any)[field] = value;
        } else if (context === 'create' && this.showCreateModal) {
          (this.newPatient as any)[field] = value;
        }
      }
    });

    this.socket.on('patient-updated', (updatedPatient: Patient) => {
      const index = this.patients.findIndex((p) => p.id === updatedPatient.id);
      if (index !== -1) {
        this.patients[index] = { ...updatedPatient };
      }
    });

    this.socket.on('patient-created', (newPatient: Patient) => {
      this.patients.push({ ...newPatient });
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

  openCreateForm(): void {
    this.selectedPatient = null;
    this.newPatient = { name: '', email: '', phone: '', address: '' };
    this.showCreateModal = true;
  }

  openDeleteModal(patient: Patient): void {
    this.selectedPatient = patient;
    this.showDeleteModal = true;
  }

  closeModals(): void {
    this.showViewModal = false;
    this.showEditModal = false;
    this.showCreateModal = false;
    this.showDeleteModal = false;
    this.selectedPatient = null;
    this.unlockAllFields();
  }

  createPatient(): void {
    if (
      !this.newPatient.name ||
      !this.newPatient.email ||
      !this.newPatient.phone ||
      !this.newPatient.address
    ) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    this.patientService.create(this.newPatient).subscribe((newPatient) => {
      this.loadPatients();
      this.closeModals();
      this.socket.emit('patient-created', newPatient);
    });
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
          this.socket.emit('patient-updated', updatedPatient);
        });
    }
  }

  confirmDelete(): void {
    if (this.selectedPatient) {
      this.patientService.delete(this.selectedPatient.id).subscribe(() => {
        const deletedId = this.selectedPatient!.id;
        this.patients = this.patients.filter((p) => p.id !== deletedId);
        this.socket.emit('patient-deleted', { id: deletedId });
        this.closeModals();
      });
    }
  }

  onFocus(field: string, context: 'create' | 'edit'): void {
    this.socket.emit('lock-field', { field, user: this.currentUser, context });
  }

  onBlur(field: string, context: 'create' | 'edit'): void {
    this.socket.emit('unlock-field', {
      field,
      user: this.currentUser,
      context,
    });
  }

  onInput(field: string, value: string, context: 'create' | 'edit'): void {
    this.socket.emit('update-field', {
      field,
      value,
      user: this.currentUser,
      context,
    });
  }

  isFieldLocked(field: string, context: 'create' | 'edit'): boolean {
    return !!this.fieldLocks[field][context];
  }

  getLocker(field: string, context: 'create' | 'edit'): string {
    return this.fieldLocks[field][context] || '';
  }

  private unlockAllFields(): void {
    ['name', 'email', 'phone', 'address'].forEach((field) => {
      ['create', 'edit'].forEach((context) => {
        this.socket.emit('unlock-field', { field, context });
      });
    });
    this.fieldLocks = { name: {}, email: {}, phone: {}, address: {} };
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
