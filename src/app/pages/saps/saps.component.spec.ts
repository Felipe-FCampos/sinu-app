import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SapsComponent } from './saps.component';

describe('SapsComponent', () => {
  let component: SapsComponent;
  let fixture: ComponentFixture<SapsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SapsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SapsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
