import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TasinmazService } from '../../services/tasinmaz.service';
import { Tasinmaz } from '../../models/tasinmaz.model';
import { TasinmazFilter } from '../../models/tasinmaz-filter.model';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';
import Overlay from 'ol/Overlay';

@Component({
  selector: 'app-tasinmaz-list',
  templateUrl: './tasinmaz-list.component.html',
  styleUrls: ['./tasinmaz-list.component.css']
})
export class TasinmazListComponent implements OnInit {
  tumTasinmazlar: Tasinmaz[] = [];
  gosterilenTasinmazlar: Tasinmaz[] = [];
  filter: TasinmazFilter = {};
  opacity: number = 1;
  sayfa: number = 1;
  sayfaBoyutu: number = 10;
  filtrePaneliGoster: boolean = false;
  Math = Math;

  map!: Map;
  tileLayer!: TileLayer<any>;
  markerLayer!: VectorLayer<any>;
  vectorSource = new VectorSource();
  overlayTooltip!: Overlay;
  hataMesaji: string | null = null;
  basariMesaji: string | null = null;


  constructor(private tasinmazService: TasinmazService, private router: Router) { }

  ngOnInit(): void {
    this.tasinmazlariGetir();
    this.haritaOlustur();
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']).then(() => {
      location.reload();
    });
  }

  mesajGoster(mesaj: string, tur: 'basari' | 'hata') {
    if (tur === 'basari') this.basariMesaji = mesaj;
    else this.hataMesaji = mesaj;

    setTimeout(() => {
      this.basariMesaji = null;
      this.hataMesaji = null;
    }, 3000);
  }

  tasinmazlariGetir(): void {
    this.filter = {};
    this.tasinmazService.getAll().subscribe({
      next: data => {
        this.tumTasinmazlar = data;
        this.sayfa = 1;
        this.sayfayiGuncelle();
        this.koordinatlariHaritadaGoster();
      },
      error: err => console.error('Taşınmazlar alınamadı', err)
    });
  }

  filtrele(): void {
    this.tasinmazService.filter(this.filter).subscribe({
      next: data => {
        this.tumTasinmazlar = data;
        this.sayfa = 1;
        this.sayfayiGuncelle();
        this.koordinatlariHaritadaGoster();
      },
      error: err => console.error('Filtreleme hatası', err)
    });
  }

  excelIndir(): void {
    const secilenler = this.gosterilenTasinmazlar.filter(t => t.secildi);
    if (secilenler.length === 0) {
      this.mesajGoster("Lütfen en az bir taşınmaz seçiniz.", "hata");
      return;
    }

    this.tasinmazService.exportExcel(secilenler).subscribe(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'tasinmazlar.xlsx';
      a.click();
    });
  }

  pdfIndir(): void {
    const secilenler = this.gosterilenTasinmazlar.filter(t => t.secildi);
    if (secilenler.length === 0) {
      this.mesajGoster("Lütfen en az bir taşınmaz seçiniz.", "hata");
      return;
    }

    this.tasinmazService.exportPdf(secilenler).subscribe(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'tasinmazlar.pdf';
      a.click();
    });
  }

  hepsiniSec(event: any): void {
    const sec = event.target.checked;
    this.gosterilenTasinmazlar.forEach(t => t.secildi = sec);
  }

  get toplamSayfa(): number {
    return Math.ceil(this.tumTasinmazlar.length / this.sayfaBoyutu);
  }

  get sayfaAraligi(): number[] {
    const aralik: number[] = [];
    const baslangic = Math.max(1, this.sayfa - 2);
    const bitis = Math.min(this.toplamSayfa, this.sayfa + 2);
    for (let i = baslangic; i <= bitis; i++) {
      aralik.push(i);
    }
    return aralik;
  }

  oncekiSayfa(): void {
    if (this.sayfa > 1) {
      this.sayfa--;
      this.sayfayiGuncelle();
    }
  }

  sonrakiSayfa(): void {
    if (this.sayfa < this.toplamSayfa) {
      this.sayfa++;
      this.sayfayiGuncelle();
    }
  }

  sayfaDegistir(yeniSayfa: number): void {
    this.sayfa = yeniSayfa;
    this.sayfayiGuncelle();
  }

  sayfayiGuncelle(): void {
    const baslangic = (this.sayfa - 1) * this.sayfaBoyutu;
    const bitis = this.sayfa * this.sayfaBoyutu;
    this.gosterilenTasinmazlar = this.tumTasinmazlar.slice(baslangic, bitis);
  }

  haritaOlustur(): void {
    this.tileLayer = new TileLayer({
      source: new OSM(),
      opacity: this.opacity
    });

    this.markerLayer = new VectorLayer({
      source: this.vectorSource,
      style: new Style({
        image: new Icon({
          src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          scale: 0.07,
          anchor: [0.5, 1]
        })
      })
    });

    this.map = new Map({
      target: 'map',
      layers: [this.tileLayer, this.markerLayer],
      view: new View({
        center: fromLonLat([32.85, 39.92]),
        zoom: 6
      })
    });

    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'ol-tooltip';
    document.body.appendChild(tooltipEl);

    this.overlayTooltip = new Overlay({
      element: tooltipEl,
      offset: [10, 0],
      positioning: 'center-left'
    });

    this.map.addOverlay(this.overlayTooltip);

    this.map.on('pointermove', (event) => {
      const feature = this.map.forEachFeatureAtPixel(event.pixel, f => f);
      if (feature) {
        const koordinat = event.coordinate;
        this.overlayTooltip.setPosition(koordinat);
        const kullaniciAdi = feature.get('kullaniciAdi') || 'Bilinmiyor';
        tooltipEl.innerHTML = kullaniciAdi;
        tooltipEl.style.display = 'block';
      } else {
        tooltipEl.style.display = 'none';
      }
    });
  }

  koordinatlariHaritadaGoster(): void {
    this.vectorSource.clear();

    this.tumTasinmazlar.forEach(t => {
      if (t.koordinat && t.koordinat.includes(',')) {
        const [latStr, lonStr] = t.koordinat.split(',');
        const lat = parseFloat(latStr.trim());
        const lon = parseFloat(lonStr.trim());

        if (!isNaN(lat) && !isNaN(lon)) {
          const point = new Point(fromLonLat([lon, lat]));
          const feature = new Feature(point);
          feature.set('kullaniciAdi', t.kullanici?.kullaniciAdi || 'Kullanıcı Bilinmiyor');
          this.vectorSource.addFeature(feature);
        }
      }
    });
  }

  opacityDegisti(): void {
    this.tileLayer.setOpacity(this.opacity);
  }
}
