import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LayoutComponent {
  menuOpen = false;
  username: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const token = sessionStorage.getItem('access_token');
    if (!token) this.router.navigate(['/']);
    else {
      // Decodificar e extrair nome de usuário se necessário
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.username = payload.name || 'Administrador';
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    sessionStorage.removeItem('access_token');
    this.router.navigate(['/']);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.menuOpen = false;
  }
}
