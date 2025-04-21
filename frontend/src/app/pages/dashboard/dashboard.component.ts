import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, RouterModule],
})
export class DashboardComponent {
  token: string | null = null;
  menuOpen: boolean = false;
  username: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('access_token');

    if (!this.token) {
      this.router.navigate(['/']);
    } else {
      // Decodificar o token JWT para extrair as informações do usuário
      const decodedToken: any = jwtDecode(this.token);
      this.username = decodedToken.name || 'Usuário'; // Defina o campo que contém o nome do usuário no seu token
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/']);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  // Função para navegação manual ao clicar
  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.menuOpen = false; // Fecha o menu ao navegar
  }
}
