import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LogService } from '../../services/log.service';
import { Log } from '../../models/log.model';
import { LogFilterDto } from '../../models/log-filter.dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loglar',
  templateUrl: './loglar.component.html',
  styleUrls: ['./loglar.component.css']
})
export class LoglarComponent implements OnInit {
  loglar: Log[] = [];
  filtreliLoglar: Log[] = [];
  gosterilenLoglar: Log[] = [];
  filtrePaneliGoster: boolean = false;

  filtreForm!: FormGroup;

  bilgiMesaji: string | null = null;
  hataMesaji: string | null = null;

  sayfa = 1;
  sayfaBoyutu = 12;
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private logService: LogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.filtreForm = this.fb.group({
      kullaniciId: [''],
      islemTipi: [''],
      durum: [''],
      ip: [''],
      baslangicTarihi: [''],
      bitisTarihi: ['']
    });

    this.logService.getLogs().subscribe({
      next: data => {
        const nullOlanlar = data.filter(x => !x.kullaniciId || !x.islemTipi);
        console.log("Eksik loglar (kullaniciId veya islemTipi null):", nullOlanlar);

        this.loglar = data;
        this.filtreliLoglar = [...data];
        this.sayfayiGuncelle();
      }
    });

  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']).then(() => {
      location.reload();
    });
  }

  mesajGoster(mesaj: string, tur: 'basari' | 'hata') {
    if (tur === 'basari') this.bilgiMesaji = mesaj;
    else this.hataMesaji = mesaj;

    setTimeout(() => {
      this.bilgiMesaji = null;
      this.hataMesaji = null;
    }, 3000);
  }

  filtreleLoglar(): void {
    const form = this.filtreForm.value;

    const dto: LogFilterDto = {
      kullaniciId: form.kullaniciId ? Number(form.kullaniciId) : undefined,
      islemTipi: form.islemTipi || undefined,
      durum: form.durum || undefined,
      baslangicTarihi: form.baslangicTarihi || undefined,
      bitisTarihi: form.bitisTarihi || undefined
    };

    this.logService.filterLogs(dto).subscribe({
      next: filtered => {
        this.loglar = filtered;
        this.filtreliLoglar = [...filtered];
        this.sayfa = 1;
        this.sayfayiGuncelle();
      },
      error: err => console.error('Filtreleme sırasında hata oluştu:', err)
    });
  }

  temizleFiltre(): void {
    this.filtreForm.reset();
    this.ngOnInit();
  }

  sayfayiGuncelle(): void {
    const baslangic = (this.sayfa - 1) * this.sayfaBoyutu;
    const bitis = this.sayfa * this.sayfaBoyutu;
    this.gosterilenLoglar = this.filtreliLoglar.slice(baslangic, bitis);
  }

  sayfaDegistir(yeniSayfa: number): void {
    this.sayfa = yeniSayfa;
    this.sayfayiGuncelle();
  }

  get toplamSayfa(): number {
    return Math.ceil(this.filtreliLoglar.length / this.sayfaBoyutu);
  }

  get sayfaAraligi(): number[] {
    const aralik: number[] = [];
    const baslangic = Math.max(1, this.sayfa - 2);
    const bitis = Math.min(this.toplamSayfa, this.sayfa + 2);
    for (let i = baslangic; i <= bitis; i++) aralik.push(i);
    return aralik;
  }

  oncekiSayfa(): void {
    if (this.sayfa > 1) this.sayfaDegistir(this.sayfa - 1);
  }

  sonrakiSayfa(): void {
    if (this.sayfa < this.toplamSayfa) this.sayfaDegistir(this.sayfa + 1);
  }

  exportPdf(): void {
    const secilenLoglar = this.gosterilenLoglar.filter(log => log.secili);
    if (secilenLoglar.length === 0) {
      this.mesajGoster("Lütfen en az bir log seçiniz.", "hata");
      return;
    }

    this.logService.downloadPdf(secilenLoglar).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'log-kayitlari.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  exportExcel(): void {
    const secilenLoglar = this.gosterilenLoglar.filter(log => log.secili);
    if (secilenLoglar.length === 0) {
      this.mesajGoster("Lütfen en az bir log seçiniz.", "hata");
      return;
    }

    this.logService.downloadExcel(secilenLoglar).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'log-kayitlari.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  tumunuSec(event: any): void {
    const seciliMi = event.target.checked;
    this.gosterilenLoglar.forEach(log => log.secili = seciliMi);
  }


}
