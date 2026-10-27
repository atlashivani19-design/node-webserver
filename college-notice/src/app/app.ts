
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Admin } from './admin';
import { StudentLogin } from './student-login';
import { AdminLogin } from './admin-login';
import { NoticeService, Notice } from './notice.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Admin,
    StudentLogin,
    AdminLogin
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  activeSection = 'home';
  loginPage = '';

  notices: Notice[] = [];
  loading = false;
  errorMessage = '';

  searchText = '';
  selectedCategory = '';

  constructor(
    public auth: AuthService,
    private noticeService: NoticeService
  ) {}

  ngOnInit(): void {
    this.loadNotices();
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get userRole(): string {
    return this.auth.role;
  }

  openStudentLogin(): void {
    this.loginPage = 'student';
  }

  openAdminLogin(): void {
    this.loginPage = 'admin';
  }

  loadNotices(): void {
    this.loading = true;
    this.errorMessage = '';

    this.noticeService.getNotices().subscribe({
      next: (data: Notice[]) => {
        this.notices = data;
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('Unable to load notices:', error);
        this.errorMessage =
          'Unable to load notices. Please check whether the backend is running.';
        this.loading = false;
      }
    });
  }

  get filteredNotices(): Notice[] {
    const search = this.searchText.trim().toLowerCase();

    return this.notices.filter((notice) => {
      const matchesSearch =
        !search ||
        notice.title?.toLowerCase().includes(search) ||
        notice.description?.toLowerCase().includes(search) ||
        notice.details?.toLowerCase().includes(search) ||
        notice.category?.toLowerCase().includes(search);

      const matchesCategory =
        !this.selectedCategory ||
        notice.category?.toLowerCase() ===
          this.selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }

  get eventNotices(): Notice[] {
    return this.notices.filter((notice) =>
      notice.category?.toLowerCase().includes('event')
    );
  }

  getImportantCount(): number {
    return this.notices.filter((notice) =>
      notice.category?.toLowerCase().includes('important')
    ).length;
  }

  getEventCount(): number {
    return this.eventNotices.length;
  }

  showHome(): void {
    this.activeSection = 'home';
    this.loginPage = '';
  }

  showNotices(): void {
    this.activeSection = 'notices';
    this.loginPage = '';
  }

  showEvents(): void {
    this.activeSection = 'events';
    this.loginPage = '';
  }

  showAbout(): void {
    this.activeSection = 'about';
    this.loginPage = '';
  }

  logout(): void {
    this.auth.logout();

    this.loginPage = '';
    this.activeSection = 'home';
    this.searchText = '';
    this.selectedCategory = '';

    window.location.reload();
  }
}
