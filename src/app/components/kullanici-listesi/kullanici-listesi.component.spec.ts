import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KullaniciListesiComponent } from './kullanici-listesi.component';

describe('KullaniciListesiComponent', () => {
  let component: KullaniciListesiComponent;
  let fixture: ComponentFixture<KullaniciListesiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KullaniciListesiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KullaniciListesiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
