import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { KullaniciTasinmazService } from 'src/app/services/kullanici-tasinmaz.service';
import { KullaniciTasinmaz } from 'src/app/models/kullanici-tasinmaz.model';
import { KullaniciTasinmazFilterDto } from 'src/app/models/kullanici-tasinmaz-filter.dto';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import XYZ from 'ol/source/XYZ';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style';
import { defaults as defaultControls } from 'ol/control';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';

@Component({
  selector: 'app-tasinmazlarim',
  templateUrl: './tasinmazlarim.component.html',
  styleUrls: ['./tasinmazlarim.component.css']
})
export class TasinmazlarimComponent implements OnInit, AfterViewInit {
  form!: FormGroup;
  tasinmazlar: KullaniciTasinmaz[] = [];
  sayfaVerisi: KullaniciTasinmaz[] = [];
  sayfa = 1;
  sayfaBoyutu = 10;
  Math = Math;

  filtrePaneliGoster = false;

  bilgiMesaji: string | null = null;
  hataMesaji: string | null = null;

  silmeOnay = false;
  silinecekSayisi: number = 0;
  silinecekIds: number[] = [];

  haritaOpaklik: number = 0.95;

  constructor(
    private fb: FormBuilder,
    private tasinmazService: KullaniciTasinmazService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      ada: [''],
      parsel: [''],
      nitelik: [''],
      ilAdi: [''],
      ilceAdi: [''],
      mahalleAdi: ['']
    });

    this.tasinmazlariGetir();

    const routerState = history.state?.mesaj;
    if (routerState) {
      this.mesajGoster(routerState, 'basari');
      history.replaceState({}, document.title);
    }
  }

  ngAfterViewInit(): void {
    this.opaklikDegisti();
  }

  tasinmazlariGetir(): void {
    this.tasinmazService.getTasinmazlarim().subscribe({
      next: data => {
        this.tasinmazlar = data.map(t => ({ ...t, secili: false }));
        this.sayfayiGuncelle();
        const haritaliklar = this.tasinmazlar.filter(t => t.koordinat);
        this.haritaOlustur(haritaliklar);
      },
      error: err => {
        console.error('Taşınmazlar alınamadı:', err);
      }
    });
  }

  haritaOlustur(tasinmazlar: KullaniciTasinmaz[]): void {
    const haritaContainer = document.getElementById('harita');
    if (haritaContainer) {
      while (haritaContainer.firstChild) {
        haritaContainer.removeChild(haritaContainer.firstChild);
      }
    }

    const vectorSource = new VectorSource();

    const features = tasinmazlar.map(t => {
      const [lat, lon] = t.koordinat.split(',').map(k => parseFloat(k.trim()));
      const point = new Point(fromLonLat([lon, lat]));
      const feature = new Feature(point);
      feature.setId(t.tasinmazId);
      return feature;
    });

    vectorSource.addFeatures(features);

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Icon({
          src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          color: 'red',
          scale: 0.07,
          anchor: [0.5, 1]
        })
      })
    });

    const map = new Map({
      target: 'harita',
      layers: [this.osmKatmani, this.stamenKatmani, vectorLayer], // 🔁 burada değişti
      view: new View({
        center: fromLonLat([35.0, 39.0]),
        zoom: 6
      }),
      controls: defaultControls()
    });

    const select = new Select({
      condition: click,
      layers: [vectorLayer]
    });

    map.addInteraction(select);

    select.on('select', (e) => {
      const selected = e.selected[0];
      if (selected) {
        const id = selected.getId();
        this.router.navigate(['/tasinmaz-guncelle', id]);
      }
    });

    this.opaklikDegisti();
  }


  opaklikDegisti(): void {
    const haritaDiv = document.getElementById('harita');
    if (haritaDiv) {
      haritaDiv.style.opacity = this.haritaOpaklik.toString();
    }
  }

  filtrele(): void {
    const dto: KullaniciTasinmazFilterDto = this.form.value;
    this.tasinmazService.filterTasinmazlar(dto).subscribe({
      next: data => {
        this.tasinmazlar = data.map(t => ({ ...t, secili: false }));
        this.sayfa = 1;
        this.sayfayiGuncelle();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Filtreleme hatası:', err);
      }
    });
  }

  temizle(): void {
    this.form.reset();
    this.tasinmazlariGetir();
  }

  sayfayiGuncelle(): void {
    const baslangic = (this.sayfa - 1) * this.sayfaBoyutu;
    const bitis = this.sayfa * this.sayfaBoyutu;
    this.sayfaVerisi = this.tasinmazlar.slice(baslangic, bitis);
  }

  sayfaDegistir(yeni: number): void {
    this.sayfa = yeni;
    this.sayfayiGuncelle();
  }

  tumunuSec(e: any): void {
    const secili = e.target.checked;
    this.sayfaVerisi.forEach(t => t.secili = secili);
  }

  exportPdf(): void {
    const secilenIds = this.tasinmazlar.filter(t => t.secili).map(t => t.tasinmazId);
    if (secilenIds.length === 0) {
      this.mesajGoster("Lütfen en az bir kayıt seçin.", "hata");
      return;
    }

    this.tasinmazService.exportSelectedPdf(secilenIds).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'benim-tasinmazlarim.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: HttpErrorResponse) => {
        this.mesajGoster("PDF alma işlemi sırasında hata oluştu ❌", "hata");
        console.error(err);
      }
    });
  }

  exportExcel(): void {
    const secilenIds = this.tasinmazlar.filter(t => t.secili).map(t => t.tasinmazId);
    if (secilenIds.length === 0) {
      this.mesajGoster("Lütfen en az bir kayıt seçin.", "hata");
      return;
    }

    this.tasinmazService.exportSelectedExcel(secilenIds).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'benim-tasinmazlarim.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: HttpErrorResponse) => {
        this.mesajGoster("Excel alma işlemi sırasında hata oluştu ❌", "hata");
        console.error(err);
      }
    });
  }

  yeniTasinmaz(): void {
    const seciliVarMi = this.tasinmazlar.some(t => t.secili);
    if (seciliVarMi) {
      this.mesajGoster("Lütfen önce mevcut seçimlerinizi kaldırın.", "hata");
      return;
    }
    this.router.navigate(['/tasinmaz-ekle']);
  }

  detayaGit(t: KullaniciTasinmaz): void {
    this.router.navigate(['/tasinmaz-guncelle', t.tasinmazId]);
  }

  mesajGoster(mesaj: string, tur: 'basari' | 'hata') {
    if (tur === 'basari') this.bilgiMesaji = mesaj;
    else this.hataMesaji = mesaj;

    setTimeout(() => {
      this.bilgiMesaji = null;
      this.hataMesaji = null;
    }, 3500);
  }

  toggleFiltrePaneli(): void {
    this.filtrePaneliGoster = !this.filtrePaneliGoster;
  }

  get pageNumbers(): number[] {
    const total = Math.ceil(this.tasinmazlar.length / this.sayfaBoyutu);
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  logout(): void {
    localStorage.clear(); // tüm localStorage temizlendi
    sessionStorage.clear(); // varsa sessionStorage da temizlenir
    this.router.navigate(['/login']).then(() => {
      location.reload(); // tüm Angular state temizlenir, eski sayfaya geri dönmeyi önler
    });
  }

  topluSil(): void {
    const secilenler = this.tasinmazlar.filter(t => t.secili);
    if (secilenler.length === 0) {
      this.mesajGoster("Lütfen silmek için en az bir taşınmaz seçin.", "hata");
      return;
    }

    this.silinecekSayisi = secilenler.length;
    this.silinecekIds = secilenler.map(t => t.tasinmazId);
    this.silmeOnay = true;
  }

  silOnayla(): void {
    this.tasinmazService.topluSil(this.silinecekIds).subscribe({
      next: () => {
        this.mesajGoster("Seçilen taşınmazlar başarıyla silindi ✅", "basari");

        this.tasinmazService.getTasinmazlarim().subscribe({
          next: data => {
            this.tasinmazlar = data.map(t => ({ ...t, secili: false }));
            this.sayfa = 1;
            this.sayfayiGuncelle();
            const haritaliklar = this.tasinmazlar.filter(t => t.koordinat);
            this.haritaOlustur(haritaliklar);
          }
        });

        this.silmeOnay = false;
      },
      error: (err: HttpErrorResponse) => {
        this.mesajGoster("Toplu silme sırasında hata oluştu ❌", "hata");
        this.silmeOnay = false;
        console.error(err);
      }
    });
  }

  silIptal(): void {
    this.silmeOnay = false;
  }

  topluDuzenle(): void {
    const secilenler = this.tasinmazlar.filter(t => t.secili);
    if (secilenler.length === 0) {
      this.mesajGoster("Lütfen düzenlemek için bir taşınmaz seçin.", "hata");
      return;
    }

    if (secilenler.length > 1) {
      this.mesajGoster("Sadece bir taşınmaz düzenlenebilir. Lütfen sadece bir kayıt seçin.", "hata");
      return;
    }

    this.router.navigate(['/tasinmaz-guncelle', secilenler[0].tasinmazId]);
  }

  // Katmanlar
  osmKatmani = new TileLayer({ source: new OSM(), visible: true });
  stamenKatmani = new TileLayer({
    source: new XYZ({
      url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'

    }),
    visible: false,
  });

  aktifKatman: string = 'osm';

  katmanDegistir(): void {
    this.aktifKatman = this.aktifKatman === 'osm' ? 'stamen' : 'osm';
    this.osmKatmani.setVisible(this.aktifKatman === 'osm');
    this.stamenKatmani.setVisible(this.aktifKatman === 'stamen');
  }


}
