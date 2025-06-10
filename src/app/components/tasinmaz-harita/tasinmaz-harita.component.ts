import { Component, OnInit } from '@angular/core';
import { KullaniciTasinmazService } from 'src/app/services/kullanici-tasinmaz.service';
import { KullaniciTasinmaz } from 'src/app/models/kullanici-tasinmaz.model';
import { Router } from '@angular/router';

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
  selector: 'app-tasinmaz-harita',
  templateUrl: './tasinmaz-harita.component.html',
  styleUrls: ['./tasinmaz-harita.component.css']
})
export class TasinmazHaritaComponent implements OnInit {
  constructor(
    private tasinmazService: KullaniciTasinmazService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.tasinmazService.getTasinmazlarim().subscribe({
      next: data => {
        const haritalanabilir = data.filter(t => t.koordinat);
        this.haritaOlustur(haritalanabilir);
      },
      error: err => {
        console.error('Taşınmazlar alınamadı:', err);
      }
    });
  }

  haritaOlustur(tasinmazlar: KullaniciTasinmaz[]): void {
    const vectorSource = new VectorSource();

    const features = tasinmazlar.map(t => {
      const [lat, lon] = t.koordinat.split(',').map(k => parseFloat(k.trim()));
      const point = new Point(fromLonLat([lon, lat]));
      const feature = new Feature(point);
      feature.setId(t.tasinmazId); // tıklanınca yönlendirme için
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
      layers: [new TileLayer({ source: new OSM() }), vectorLayer],
      view: new View({
        center: fromLonLat([35.0, 39.0]),
        zoom: 6
      }),
      controls: defaultControls()
    });


    const select = new Select({
      condition: click,
      layers: layer => layer === vectorLayer
    });
    map.addInteraction(select);

    select.on('select', (e) => {
      const selected = e.selected[0];
      if (selected) {
        const id = selected.getId();
        this.router.navigate(['/tasinmaz-guncelle', id]);
      }
    });
  }

  geriDon(): void {
    this.router.navigate(['/tasinmazlarim']);
  }

  cikisYap(): void {
    localStorage.removeItem('token');
    location.href = '/login';
  }
}
