import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.handleAuthRedirect();
  }

  private handleAuthRedirect(): void {
    // Verifica se está no ambiente do navegador
    if (typeof window === 'undefined') return;

    const token = sessionStorage.getItem('access_token');
    const currentPath = window.location.pathname;

    if (!token && currentPath !== '/login') {
      this.router.navigate(['/login']);
      return;
    }

    if (token && (currentPath === '/' || currentPath === '')) {
      this.router.navigate(['/dashboard/panel']);
    }
  }
}
