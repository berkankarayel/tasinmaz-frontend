import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Kullanici } from '../models/kullanici.model';
import { KullaniciFilter } from '../models/kullanici-filter.dto';
import { UserCreateDto } from '../models/user-create.dto';
import { UserUpdateDto } from '../models/user-update.dto';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'https://localhost:7111/api/User';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    getKullanicilar(): Observable<Kullanici[]> {
        return this.http.get<Kullanici[]>(this.apiUrl, { headers: this.getHeaders() });
    }

    filtreleKullanicilar(filter: KullaniciFilter): Observable<Kullanici[]> {
        return this.http.post<Kullanici[]>(`${this.apiUrl}/filter`, filter, { headers: this.getHeaders() });
    }

    addKullanici(kullanici: UserCreateDto): Observable<any> {
        return this.http.post(`${this.apiUrl}/create`, kullanici, { headers: this.getHeaders() });
    }

    updateKullanici(kullanici: UserUpdateDto): Observable<any> {
        return this.http.put(`${this.apiUrl}/update`, kullanici, { headers: this.getHeaders() });
    }

    deleteKullanici(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
    }

    exportExcel(): void {
        window.open(`${this.apiUrl}/export/excel`, '_blank');
    }

    exportPdf(): void {
        window.open(`${this.apiUrl}/export/pdf`, '_blank');
    }

    downloadPdf(secilenler: Kullanici[]): Observable<Blob> {
        const headers = this.getHeaders().set('Content-Type', 'application/json');
        return this.http.post(`${this.apiUrl}/export/pdf`, secilenler, {
            headers: headers,
            responseType: 'blob'
        });
    }

    downloadExcel(secilenler: Kullanici[]): Observable<Blob> {
        const headers = this.getHeaders().set('Content-Type', 'application/json');
        return this.http.post(`${this.apiUrl}/export/excel`, secilenler, {
            headers: headers,
            responseType: 'blob'
        });
    }

    // ✅ Yeni: Toplu kullanıcı silme işlemi
    topluSil(idListesi: number[]): Observable<any> {
        const headers = this.getHeaders().set('Content-Type', 'application/json');
        return this.http.post(`${this.apiUrl}/toplu-sil`, idListesi, { headers });
    }
    topluSilKullanicilar(ids: number[]): Observable<any> {
        const headers = this.getHeaders().set('Content-Type', 'application/json');
        return this.http.post(`${this.apiUrl}/toplu-sil`, ids, {
            headers: headers,
            responseType: 'text' // JSON değilse hata vermez
        });
    }

}
