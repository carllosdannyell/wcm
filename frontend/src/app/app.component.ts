import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const currentUrl = this.router.url;
  
      const hasRedirected = sessionStorage.getItem('has_redirected');
  
      if (!token) {
        this.router.navigate(['login']);
      } else if ((currentUrl === '/' || currentUrl === '') && !hasRedirected) {
        sessionStorage.setItem('has_redirected', 'true');
        this.router.navigate(['/dashboard/panel']);
      }
    }
  }
}
