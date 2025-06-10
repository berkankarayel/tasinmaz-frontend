import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasinmazHaritaComponent } from './tasinmaz-harita.component';

describe('TasinmazHaritaComponent', () => {
  let component: TasinmazHaritaComponent;
  let fixture: ComponentFixture<TasinmazHaritaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TasinmazHaritaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TasinmazHaritaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
