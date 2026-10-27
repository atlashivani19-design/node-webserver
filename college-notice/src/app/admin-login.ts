
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, timeout } from 'rxjs';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {
  username = '';
  password = '';

  message = '';
  error = false;
  loading = false;

  constructor(private auth: AuthService) {}

  submit(): void {
    console.log('Admin login form submitted');

    if (this.loading) {
      console.log('Login request is already in progress.');
      return;
    }

    this.message = '';
    this.error = false;
    this.loading = true;

    console.log('Sending admin login request...');

    this.auth.adminLogin({
      username: this.username.trim(),
      password: this.password
    })
    .pipe(
      timeout(15000),
      finalize(() => {
        this.loading = false;
        console.log('Admin login request finished.');
      })
    )
    .subscribe({
      next: (result) => {
        console.log('Admin login response received.');

        this.message = result.message || 'Login successful.';
        this.error = false;

        window.location.reload();
      },
      error: (err: any) => {
        console.error('Admin login failed:', err);

        this.error = true;

        if (err.name === 'TimeoutError') {
          this.message = 'Request timed out. Check the backend.';
        } else if (err.status === 0) {
          this.message =
            'Cannot connect to the backend. Check that it is running.';
        } else if (err.status === 401) {
          this.message = 'Invalid admin username or password.';
        } else {
          this.message =
            err.error?.message || 'Login failed. Check the Console.';
        }
      }
    });
  }
}
