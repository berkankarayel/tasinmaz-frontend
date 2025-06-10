import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LokasyonService } from 'src/app/services/lokasyon.service';
import { KullaniciTasinmazService } from 'src/app/services/kullanici-tasinmaz.service';
import { KullaniciTasinmazCreateDto } from 'src/app/models/kullanici-tasinmaz-create.dto';
import { Router } from '@angular/router';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style';

@Component({
  selector: 'app-tasinmaz-ekle',
  templateUrl: './tasinmaz-ekle.component.html',
  styleUrls: ['./tasinmaz-ekle.component.css']
})
export class TasinmazEkleComponent implements OnInit {
  form!: FormGroup;
  iller: any[] = [];
  ilceler: any[] = [];
  mahalleler: any[] = [];

  map!: Map;
  vectorSource!: VectorSource;

  bilgiMesaji: string | null = null;
  hataMesaji: string | null = null;

  constructor(
    private fb: FormBuilder,
    private lokasyonService: LokasyonService,
    private tasinmazService: KullaniciTasinmazService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      ilId: ['', Validators.required],
      ilceId: ['', Validators.required],
      mahalleId: ['', Validators.required],
      ada: ['', Validators.required],
      parsel: ['', Validators.required],
      nitelik: ['', Validators.required],
      koordinat: ['', Validators.required]
    });

    this.lokasyonService.getIller().subscribe(data => this.iller = data);

    this.form.get('ilId')?.valueChanges.subscribe(ilId => {
      this.ilceler = [];
      this.mahalleler = [];
      this.form.patchValue({ ilceId: '', mahalleId: '' });
      if (ilId) {
        this.lokasyonService.getIlceler(ilId).subscribe(data => this.ilceler = data);
      }
    });

    this.form.get('ilceId')?.valueChanges.subscribe(ilceId => {
      this.mahalleler = [];
      this.form.patchValue({ mahalleId: '' });
      if (ilceId) {
        this.lokasyonService.getMahalleler(ilceId).subscribe(data => this.mahalleler = data);
      }
    });

    this.initMap();
  }

  initMap(): void {
    this.vectorSource = new VectorSource();

    const vectorLayer = new VectorLayer({
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
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      view: new View({
        center: fromLonLat([32.85, 39.92]),
        zoom: 6
      }),
      controls: defaultControls()
    });

    this.map.on('click', event => {
      const coordinate = toLonLat(event.coordinate);
      const lon = coordinate[0].toFixed(6);
      const lat = coordinate[1].toFixed(6);
      const formatted = `${lat}, ${lon}`;
      this.form.patchValue({ koordinat: formatted });

      this.vectorSource.clear();
      const point = new Point(fromLonLat([parseFloat(lon), parseFloat(lat)]));
      const feature = new Feature(point);
      this.vectorSource.addFeature(feature);
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.mesajGoster('Lütfen tüm alanları eksiksiz doldurun.', 'hata');
      return;
    }

    const dto: KullaniciTasinmazCreateDto = this.form.value;

    this.tasinmazService.addTasinmaz(dto).subscribe({
      next: () => {
        this.mesajGoster('✅ Taşınmaz başarıyla eklendi', 'basari');
        setTimeout(() => {
          this.router.navigate(['/tasinmazlarim'], {
            state: { mesaj: '✅ Taşınmaz başarıyla eklendi' }
          });
        }, 2000);
      },
      error: err => {
        console.error("Kayıt hatası:", err);
        this.mesajGoster('❌ Kayıt sırasında bir hata oluştu', 'hata');
      }
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

  geriDon(): void {
    this.router.navigate(['/tasinmazlarim']);
  }
}
