import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LokasyonService {
    private baseUrl = 'https://localhost:7111/api/Lokasyon';

    constructor(private http: HttpClient) { }

    getIller(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/iller`);
    }

    getIlceler(ilId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/ilceler/${ilId}`);
    }

    getMahalleler(ilceId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/mahalleler/${ilceId}`);
    }
}
