import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { KullaniciTasinmaz } from '../models/kullanici-tasinmaz.model';
import { KullaniciTasinmazFilterDto } from '../models/kullanici-tasinmaz-filter.dto';

@Injectable({
    providedIn: 'root'
})
export class KullaniciTasinmazService {
    private apiUrl = 'https://localhost:7111/api/tasinmaz'; // ← Burayı kendi API adresine göre güncelle

    constructor(private http: HttpClient) { }

    // Tüm taşınmazları getir
    getTasinmazlarim(): Observable<KullaniciTasinmaz[]> {
        return this.http.get<KullaniciTasinmaz[]>(`${this.apiUrl}`);
    }

    // Filtreli taşınmaz getir
    filterTasinmazlar(dto: KullaniciTasinmazFilterDto): Observable<KullaniciTasinmaz[]> {
        return this.http.post<KullaniciTasinmaz[]>(`${this.apiUrl}/filter-kullanici`, dto);
    }

    // PDF indir (seçilenler)
    exportSelectedPdf(ids: number[]): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/my/export/pdf`, ids, { responseType: 'blob' });
    }

    // Excel indir (seçilenler)
    exportSelectedExcel(ids: number[]): Observable<Blob> {
        return this.http.post(`${this.apiUrl}/my/export/excel`, ids, { responseType: 'blob' });
    }

    // Toplu sil
    topluSil(ids: number[]): Observable<any> {
        return this.http.post(`${this.apiUrl}/my/toplu-sil`, ids, { responseType: 'text' });
    }

    // Tekli güncelleme
    updateTasinmaz(dto: any) {
        return this.http.put(`${this.apiUrl}`, dto, { responseType: 'text' });
    }

    // Yeni taşınmaz ekle
    addTasinmaz(dto: any) {
        return this.http.post(`${this.apiUrl}`, dto, { responseType: 'text' });
    }

    // İller
    getIller(): Observable<any[]> {
        return this.http.get<any[]>('https://localhost:7111/api/lokasyon/iller');
    }

    // İlçeler (ilId'ye göre)
    getIlceler(ilId: number): Observable<any[]> {
        return this.http.get<any[]>(`https://localhost:7111/api/lokasyon/ilceler/${ilId}`);
    }

    // Mahalleler (ilceId'ye göre)
    getMahalleler(ilceId: number): Observable<any[]> {
        return this.http.get<any[]>(`https://localhost:7111/api/lokasyon/mahalleler/${ilceId}`);
    }

}
