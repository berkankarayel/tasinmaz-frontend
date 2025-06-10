import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Log } from '../models/log.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LogFilterDto } from '../models/log-filter.dto';

@Injectable({
    providedIn: 'root'
})
export class LogService {
    private apiUrl = 'https://localhost:7111/api/Log';

    constructor(private http: HttpClient) { }

    getLogs(): Observable<Log[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        });
        return this.http.get<Log[]>(this.apiUrl, { headers });
    }

    downloadPdf(loglar: Log[]): Observable<Blob> {
        return this.http.post('https://localhost:7111/api/Log/export/pdf', loglar, {
            responseType: 'blob',
            headers: new HttpHeaders({
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
        });
    }

    downloadExcel(loglar: Log[]): Observable<Blob> {
        return this.http.post('https://localhost:7111/api/Log/export/excel', loglar, {
            responseType: 'blob',
            headers: new HttpHeaders({
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
        });
    }

    filterLogs(filterDto: LogFilterDto): Observable<Log[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        });
        return this.http.post<Log[]>(`${this.apiUrl}/filter`, filterDto, { headers });
    }
}
