import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Kullanici } from '../../models/kullanici.model';
import { UserService } from '../../services/user.service';
import { KullaniciFilter } from '../../models/kullanici-filter.dto';
import * as bootstrap from 'bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-kullanici-listesi',
  templateUrl: './kullanici-listesi.component.html',
  styleUrls: ['./kullanici-listesi.component.css']
})
export class KullaniciListesiComponent implements OnInit {
  users: Kullanici[] = [];
  gosterilenKullanicilar: Kullanici[] = [];
  filter: KullaniciFilter = { kullaniciAdi: '', email: '', rol: '' };

  sayfa = 1;
  sayfaBoyutu = 15;
  Math = Math;

  toastMesaji: string = '';
  silinecekKullanici: Kullanici | null = null;
  bilgiMesaji: string | null = null;
  hataMesaji: string | null = null;
  kullaniciForm!: FormGroup;
  kullaniciGuncelleForm!: FormGroup;
  selectedUser: Kullanici | null = null;
  filtrePaneliGoster: boolean = false;
  secilenKullaniciIdler: number[] = [];
  secilenKullaniciSayisi: number = 0;
  constructor(private userService: UserService, private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.tumunuGetir();

    this.kullaniciForm = this.fb.group({
      kullaniciAdi: ['', Validators.required],
      kullaniciSoyadi: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.com$')
        ]
      ],
      sifre: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required],
      adres: ['', Validators.required]
    });

    this.kullaniciGuncelleForm = this.fb.group({
      kullaniciId: [0],
      kullaniciAdi: ['', Validators.required],
      kullaniciSoyadi: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.com$') // ✅ aynı pattern
        ]
      ],
      rol: ['', Validators.required],
      adres: ['', Validators.required]
    });
  }

  logout(): void {
    localStorage.clear(); // tüm localStorage temizlendi
    sessionStorage.clear(); // varsa sessionStorage da temizlenir
    this.router.navigate(['/login']).then(() => {
      location.reload(); // tüm Angular state temizlenir, eski sayfaya geri dönmeyi önler
    });
  }


  tumunuGetir(): void {
    this.userService.getKullanicilar().subscribe({
      next: data => {
        this.users = data.sort((a, b) => a.kullaniciId - b.kullaniciId);
        this.sayfa = 1;
        this.sayfayiGuncelle();
      },
      error: err => console.error('Kullanıcılar alınamadı:', err)
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
  filtrele(): void {
    const f = {
      kullaniciAdi: this.filter.kullaniciAdi?.toLowerCase() || '',
      email: this.filter.email?.toLowerCase() || '',
      rol: this.filter.rol?.toLowerCase() || ''
    };

    this.userService.filtreleKullanicilar(f).subscribe({
      next: data => {
        this.users = data;
        this.sayfa = 1;
        this.sayfayiGuncelle();
      },
      error: err => console.error('Filtreleme hatası:', err)
    });
  }

  temizleFiltre(): void {
    this.filter = { kullaniciAdi: '', email: '', rol: '' };
    this.tumunuGetir();
  }

  sayfayiGuncelle(): void {
    const baslangic = (this.sayfa - 1) * this.sayfaBoyutu;
    const bitis = this.sayfa * this.sayfaBoyutu;
    this.gosterilenKullanicilar = this.users.slice(baslangic, bitis);
  }

  sayfaDegistir(yeniSayfa: number): void {
    this.sayfa = yeniSayfa;
    this.sayfayiGuncelle();
  }

  get toplamSayfa(): number {
    return Math.ceil(this.users.length / this.sayfaBoyutu);
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

  tumunuSec(event: any): void {
    const sec = event.target.checked;
    this.gosterilenKullanicilar.forEach(u => u.secili = sec);
  }

  getRolAdi(rol: number): string {
    return rol === 1 ? 'Admin' : rol === 2 ? 'Kullanıcı' : 'Bilinmiyor';
  }

  getRolClass(rol: number): string {
    return rol === 1 ? 'bg-primary' : rol === 2 ? 'bg-secondary' : 'bg-dark';
  }

  exportPdf(): void {
    const secilenler = this.gosterilenKullanicilar.filter(u => u.secili);
    if (secilenler.length === 0) {
      this.mesajGoster("Lütfen en az bir kullanıcı seçiniz.", "hata");
      return;
    }

    this.userService.downloadPdf(secilenler).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kullanicilar.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
  exportExcel(): void {
    const secilenler = this.gosterilenKullanicilar.filter(u => u.secili);
    if (secilenler.length === 0) {
      this.mesajGoster("Lütfen en az bir kullanıcı seçiniz.", "hata");
      return;
    }

    this.userService.downloadExcel(secilenler).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kullanicilar.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }


  // ✅ Toplu kullanıcı silme
  topluSil(): void {
    const secilenler = this.gosterilenKullanicilar.filter(u => u.secili);

    if (secilenler.length === 0) {
      this.mesajGoster("Lütfen silmek için en az bir kullanıcı seçiniz.", "hata");
      return;
    }

    this.secilenKullaniciIdler = secilenler.map(u => u.kullaniciId);
    this.secilenKullaniciSayisi = secilenler.length;

    const modalEl = document.getElementById('silmeOnayModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.show();
    }
  }


  topluDuzenle(): void {
    const secilenler = this.gosterilenKullanicilar.filter(u => u.secili);

    if (secilenler.length === 0) {
      this.mesajGoster("Lütfen düzenlemek için bir kullanıcı seçiniz.", "hata");
      return;
    }

    if (secilenler.length > 1) {
      this.mesajGoster("Sadece bir kullanıcı düzenlenebilir. Lütfen yalnızca bir tane seçiniz.", "hata");
      return;
    }

    // 1 kişi seçiliyse düzenleme modalını aç
    this.duzenleModaliAc(secilenler[0]);

    const modalEl = document.getElementById('kullaniciDuzenleModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.show();
    }
  }


  kullaniciEkle(): void {
    if (this.kullaniciForm.invalid) {
      this.kullaniciForm.markAllAsTouched();
      return;
    }

    const formData = this.kullaniciForm.value;
    this.userService.addKullanici(formData).subscribe({
      next: (res: any) => {
        this.toastMesaji = res.message;
        this.tumunuGetir();
        this.kullaniciForm.reset();

        const modalEl = document.getElementById('kullaniciEkleModal');
        if (modalEl) {
          const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          modalInstance.hide();
        }

        document.body.classList.remove('modal-open');
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.style.overflow = 'auto';

        const toastEl = document.getElementById('successToast');
        if (toastEl) {
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
      },
      error: err => {
        console.error("Kullanıcı ekleme hatası:", err);
        alert("❌ Ekleme başarısız!");
      }
    });
  }

  duzenleModaliAc(user: Kullanici): void {
    this.selectedUser = { ...user };
    this.kullaniciGuncelleForm.patchValue(this.selectedUser);
  }

  kullaniciGuncelle(): void {
    if (this.kullaniciGuncelleForm.invalid) return;

    const updateDto = this.kullaniciGuncelleForm.value;

    this.userService.updateKullanici(updateDto).subscribe({
      next: (res: any) => {
        this.toastMesaji = res.message;
        this.tumunuGetir();
        this.selectedUser = null;

        const modalEl = document.getElementById('kullaniciDuzenleModal');
        if (modalEl) {
          const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          modalInstance.hide();
        }

        document.body.classList.remove('modal-open');
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.style.overflow = 'auto';

        const toastEl = document.getElementById('successToast');
        if (toastEl) {
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
      },
      error: err => {
        console.error('❌ Güncelleme hatası:', err);
        alert("❌ Güncelleme başarısız!");
      }
    });
  }

  kullaniciSil(user: Kullanici): void {
    this.silinecekKullanici = user;

    const modalEl = document.getElementById('silmeOnayModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.show();
    }
  }

  silOnayla(): void {
    if (!this.secilenKullaniciIdler || this.secilenKullaniciIdler.length === 0) return;

    this.userService.topluSilKullanicilar(this.secilenKullaniciIdler).subscribe({
      next: (res: any) => {
        this.mesajGoster("Seçilen kullanıcılar başarıyla silindi ✅", "basari");
        this.tumunuGetir();
        this.secilenKullaniciIdler = [];

        const modalEl = document.getElementById('silmeOnayModal');
        if (modalEl) {
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          modalInstance?.hide();
        }
      },
      error: (err) => {
        console.error("Silme hatası:", err);
        this.mesajGoster("Silme işlemi sırasında hata oluştu ❌", "hata");
      }
    });
  }

}
