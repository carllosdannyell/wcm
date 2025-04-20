import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService, Patient } from './patient.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe((data) => {
      this.patients = data.map(p => ({ ...p, expanded: false }));
    });
  }

  toggleAccordion(patient: Patient): void {
    patient.expanded = !patient.expanded;
  }

  viewPatient(patient: Patient): void {
    alert(`Visualizando:\nNome: ${patient.name}\nEmail: ${patient.email}`);
  }

  editPatient(patient: Patient): void {
    alert(`Editando: ${patient.name}`);
  }

  confirmDelete(patient: Patient): void {
    if (confirm(`Tem certeza que deseja excluir o paciente "${patient.name}"?`)) {
      this.patientService.delete(patient.id).subscribe(() => {
        this.patients = this.patients.filter(p => p.id !== patient.id);
        alert('Paciente excluído com sucesso!');
      });
    }
  }
}
