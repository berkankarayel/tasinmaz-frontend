import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoglarComponent } from './loglar.component';

describe('LoglarComponent', () => {
  let component: LoglarComponent;
  let fixture: ComponentFixture<LoglarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoglarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoglarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
