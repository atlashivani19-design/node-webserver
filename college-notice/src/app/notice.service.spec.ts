
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notice {
  id: number;
  title: string;
  category: string;
  date: string;
  details: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  private apiUrl = 'http://localhost:3000/api/notices';

  constructor(private http: HttpClient) {}

  getNotices(): Observable<Notice[]> {
    return this.http.get<Notice[]>(this.apiUrl);
  }
}
