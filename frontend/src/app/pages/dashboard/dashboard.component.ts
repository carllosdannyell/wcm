import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('access_token');

    if (!this.token) {
      this.router.navigate(['/']);
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.router.navigate(['/']);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
