import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasinmazlarimComponent } from './tasinmazlarim.component';

describe('TasinmazlarimComponent', () => {
  let component: TasinmazlarimComponent;
  let fixture: ComponentFixture<TasinmazlarimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TasinmazlarimComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TasinmazlarimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
