import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tasinmaz } from '../models/tasinmaz.model';
import { TasinmazFilter } from '../models/tasinmaz-filter.model';

@Injectable({
    providedIn: 'root'
})
export class TasinmazService {
    private baseUrl = 'https://localhost:7111/api/Tasinmaz';

    constructor(private http: HttpClient) { }

    private get headers() {
        const token = localStorage.getItem('token')!;
        return {
            headers: new HttpHeaders({
                Authorization: `Bearer ${token}`
            })
        };
    }

    getAll(): Observable<Tasinmaz[]> {
        return this.http.get<Tasinmaz[]>(this.baseUrl, this.headers);
    }

    filter(filterDto: TasinmazFilter): Observable<Tasinmaz[]> {
        return this.http.post<Tasinmaz[]>(`${this.baseUrl}/filter`, filterDto, this.headers);
    }

    exportPdf(secilenler: Tasinmaz[]) {
        return this.http.post(this.baseUrl + '/export/pdf', secilenler, {
            responseType: 'blob'
        });
    }

    exportExcel(secilenler: Tasinmaz[]) {
        return this.http.post(this.baseUrl + '/export/excel', secilenler, {
            responseType: 'blob'
        });
    }

}
