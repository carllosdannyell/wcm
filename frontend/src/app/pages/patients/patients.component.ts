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
  showForm: boolean = false;
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

    this.socket.on('patient-updated', (updatedPatient: Patient) => {
      const index = this.patients.findIndex((p) => p.id === updatedPatient.id);
      if (index !== -1) {
        this.patients[index] = {
          ...updatedPatient,
          expanded: this.patients[index].expanded,
        };
      }
    });
  }

  ngOnDestroy(): void {
    this.unlockAllFields();
    this.socket.disconnect();
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe((data) => {
      this.patients = data.map((p) => ({ ...p, expanded: false }));
    });
  }

  toggleAccordion(patient: Patient): void {
    patient.expanded = !patient.expanded;
  }

  viewPatient(patient: Patient): void {
    alert(
      `Nome: ${patient.name}\nEmail: ${patient.email}\nTelefone: ${patient.phone}\nEndereço: ${patient.address}`
    );
  }

  openCreateForm(): void {
    this.selectedPatient = null;
    this.formPatient = { name: '', email: '', phone: '', address: '' };
    this.showForm = true;
  }

  openEditForm(patient: Patient): void {
    this.selectedPatient = patient;
    this.formPatient = {
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
    };
    this.showForm = true;
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
          this.showForm = false;
          this.unlockAllFields();
          alert('Paciente atualizado com sucesso!');
          this.socket.emit('patient-updated', updatedPatient);
        });
    } else {
      this.patientService.create(this.formPatient).subscribe((newPatient) => {
        this.loadPatients();
        this.showForm = false;
        alert('Paciente criado com sucesso!');
        this.socket.emit('patient-updated', newPatient);
      });
    }
  }

  cancelForm(): void {
    this.unlockAllFields();
    this.showForm = false;
    this.selectedPatient = null;
  }

  confirmDelete(patient: Patient): void {
    if (
      confirm(`Tem certeza que deseja excluir o paciente "${patient.name}"?`)
    ) {
      this.patientService.delete(patient.id).subscribe(() => {
        this.patients = this.patients.filter((p) => p.id !== patient.id);
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

  isFieldLocked(field: string): boolean {
    return !!this.fieldLocks[field];
  }

  getLocker(field: string): string {
    return this.fieldLocks[field];
  }

  private unlockAllFields(): void {
    Object.keys(this.formPatient).forEach((field) => {
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
