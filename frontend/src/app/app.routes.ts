import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PanelComponent } from './pages/panel/panel.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'panel', component: PanelComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'patients', component: PatientsComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  // { path: '**', component: NotFoundComponent }, // Captura qualquer outra URL
];
