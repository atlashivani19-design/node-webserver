
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  title = '';
  category = 'Important Announcement';
  details = '';

  notices: any[] = [];

  addNotice() {
    if (!this.title.trim() || !this.details.trim()) {
      alert('Please enter the title and details.');
      return;
    }

    this.notices.push({
      id: Date.now(),
      title: this.title,
      category: this.category,
      details: this.details,
      date: new Date().toISOString().slice(0, 10)
    });

    this.title = '';
    this.details = '';

    alert('Notice added successfully!');
  }

  deleteNotice(id: number) {
    this.notices = this.notices.filter(
      notice => notice.id !== id
    );
  }
}
