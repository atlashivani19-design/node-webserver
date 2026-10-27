
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notice {
  id: number | string;
  title: string;
  description: string;
  details?: string;
  category: string;
  date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoticeService {

  private readonly apiUrl = 'http://localhost:3000/api/notices';

  constructor(private http: HttpClient) {}

  // Get all notices from the backend
  getNotices(): Observable<Notice[]> {
    return this.http.get<Notice[]>(this.apiUrl);
  }

  // Add a new notice
  addNotice(notice: Partial<Notice>): Observable<Notice> {
    return this.http.post<Notice>(this.apiUrl, notice);
  }

  // Delete a notice using its ID
  deleteNotice(id: number | string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
