
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-student-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-login.html',
  styleUrl: './student-login.css'
})
export class StudentLogin {
  isRegister = false;

  name = '';
  email = '';
  password = '';

  message = '';
  error = false;
  loading = false;

  constructor(private auth: AuthService) {}

  submit(): void {
    if (this.loading) {
      return;
    }

    this.message = '';
    this.error = false;

    if (!this.email.trim() || !this.password) {
      this.error = true;
      this.message = 'Please enter your email and password.';
      return;
    }

    if (this.isRegister && !this.name.trim()) {
      this.error = true;
      this.message = 'Please enter your full name.';
      return;
    }

    if (this.isRegister && this.password.length < 8) {
      this.error = true;
      this.message = 'Password must contain at least 8 characters.';
      return;
    }

    this.loading = true;

    const request = this.isRegister
      ? this.auth.register({
          name: this.name.trim(),
          email: this.email.trim(),
          password: this.password
        })
      : this.auth.studentLogin({
          email: this.email.trim(),
          password: this.password
        });

    request
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.message =
            result.message ||
            (this.isRegister
              ? 'Registration successful. Please log in.'
              : 'Login successful.');

          this.error = false;

          if (this.isRegister) {
            this.isRegister = false;
            this.password = '';
          } else {
            window.location.reload();
          }
        },

        error: (err: any) => {
          this.error = true;

          if (err.name === 'TimeoutError') {
            this.message =
              'Request timed out. Please check the backend and try again.';
          } else if (err.status === 0) {
            this.message =
              'Cannot connect to the backend. Make sure port 3000 is running.';
          } else if (err.status === 401) {
            this.message =
              'Student not found or password is incorrect. Register first.';
          } else if (err.status === 409) {
            this.message =
              'This email is already registered. Please log in.';
          } else {
            this.message =
              err.error?.message ||
              `Request failed (HTTP ${err.status || 'unknown'}).`;
          }

          console.error('Student authentication error:', err);
        }
      });
  }

  toggleMode(): void {
    this.isRegister = !this.isRegister;

    this.message = '';
    this.error = false;

    this.name = '';
    this.email = '';
    this.password = '';
  }
}

