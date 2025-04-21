import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Se o token já estiver salvo, redireciona para o dashboard
    if (typeof window !== 'undefined' && localStorage.getItem('access_token')) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.isSubmitting = true;

    if (this.loginForm.invalid) {
      this.isSubmitting = false;
      return;
    }

    const { email, password } = this.loginForm.value;

    (await this.authService.login(email, password)).subscribe({
      next: (response: { access_token: string }) => {
        localStorage.setItem('access_token', response.access_token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'E-mail ou senha inválidos.';
        this.isSubmitting = false;
      },
    });
  }

  get email() {
    return this.loginForm.get('email')!;
  }
  
  get password() {
    return this.loginForm.get('password')!;
  }
}
