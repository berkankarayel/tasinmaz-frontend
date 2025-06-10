import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://localhost:7111/api/Auth';

  constructor(private http: HttpClient) { }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) {
      console.log("Token yok");
      return null;
    }

    try {
      const base64Payload = token.split('.')[1];
      const jsonPayload = atob(base64Payload);
      const payload = JSON.parse(jsonPayload);
      console.log("🎯 Token Payload:", payload);

      const roleClaim =
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        payload["role"];

      console.log("🎯 Token içindeki rol:", roleClaim);
      return roleClaim;
    } catch (err) {
      console.error("Token decode hatası:", err);
      return null;
    }
  }



}
