import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { KullaniciTasinmazService } from 'src/app/services/kullanici-tasinmaz.service';
import { KullaniciTasinmaz } from 'src/app/models/kullanici-tasinmaz.model';
import { TasinmazUpdateDto } from 'src/app/models/tasinmaz-update.dto';
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

@Component({
  selector: 'app-tasinmaz-guncelle',
  templateUrl: './tasinmaz-guncelle.component.html',
  styleUrls: ['./tasinmaz-guncelle.component.css']
})
export class TasinmazGuncelleComponent implements OnInit {
  form!: FormGroup;
  tasinmazId!: number;
  mevcutTasinmaz!: KullaniciTasinmaz;
  vectorSource!: VectorSource;

  iller: any[] = [];
  ilceler: any[] = [];
  mahalleler: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private tasinmazService: KullaniciTasinmazService
  ) { }

  ngOnInit(): void {
    this.tasinmazId = Number(this.route.snapshot.params['id']);

    this.form = this.fb.group({
      ada: ['', Validators.required],
      parsel: ['', Validators.required],
      nitelik: ['', Validators.required],
      ilId: [null, Validators.required],
      ilceId: [null, Validators.required],
      mahalleId: [null, Validators.required]
    });

    this.getIller(() => this.veriyiGetir());

    // İl değişince ilçe ve mahalleler güncellenir
    this.form.get('ilId')?.valueChanges.subscribe(ilId => {
      if (ilId) {
        this.getIlceler(ilId);
        this.form.patchValue({ ilceId: null, mahalleId: null });
      }
    });

    // İlçe değişince mahalleler güncellenir
    this.form.get('ilceId')?.valueChanges.subscribe(ilceId => {
      if (ilceId) {
        this.getMahalleler(ilceId);
        this.form.patchValue({ mahalleId: null });
      }
    });
  }

  getIller(callback?: () => void) {
    this.tasinmazService.getIller().subscribe(data => {
      this.iller = data;
      if (callback) callback();
    });
  }

  getIlceler(ilId: number) {
    if (!ilId) return;
    this.tasinmazService.getIlceler(ilId).subscribe(data => this.ilceler = data);
  }

  getMahalleler(ilceId: number) {
    if (!ilceId) return;
    this.tasinmazService.getMahalleler(ilceId).subscribe(data => this.mahalleler = data);
  }

  veriyiGetir(): void {
    this.tasinmazService.getTasinmazlarim().subscribe(data => {
      const secilen = data.find(t => t.tasinmazId === this.tasinmazId);
      if (!secilen) {
        alert('Taşınmaz bulunamadı!');
        this.router.navigate(['/tasinmazlarim']);
        return;
      }

      this.mevcutTasinmaz = secilen;

      // Önce ilçe ve mahalle dropdown'larını yükle
      this.getIlceler(secilen.ilId);
      this.getMahalleler(secilen.ilceId);

      // Formu doldur
      this.form.patchValue({
        ada: secilen.ada,
        parsel: secilen.parsel,
        nitelik: secilen.nitelik,
        ilId: secilen.ilId,
        ilceId: secilen.ilceId,
        mahalleId: secilen.mahalleId
      });

      setTimeout(() => this.initReadonlyMap(), 100);
    });
  }

  initReadonlyMap(): void {
    if (!this.mevcutTasinmaz?.koordinat) return;
    const [lat, lon] = this.mevcutTasinmaz.koordinat.split(',').map(k => parseFloat(k.trim()));
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

    const point = new Point(fromLonLat([lon, lat]));
    const feature = new Feature(point);
    this.vectorSource.addFeature(feature);

    new Map({
      target: 'readonlyMap',
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      view: new View({ center: fromLonLat([lon, lat]), zoom: 5 }),
      controls: defaultControls()
    });
  }

  kaydet(): void {
    if (this.form.invalid) return;

    const dto: TasinmazUpdateDto = {
      tasinmazId: this.tasinmazId,
      koordinat: this.mevcutTasinmaz.koordinat,
      ...this.form.value
    };

    this.tasinmazService.updateTasinmaz(dto).subscribe({
      next: () => {
        this.router.navigate(['/tasinmazlarim'], {
          state: { mesaj: 'Taşınmaz başarıyla güncellendi ✅' }
        });
      },
      error: err => {
        alert('Güncelleme sırasında hata oluştu ❌');
        console.error(err);
      }
    });
  }

  iptal(): void {
    this.router.navigate(['/tasinmazlarim']);
  }
}
