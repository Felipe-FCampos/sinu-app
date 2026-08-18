import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentsPageComponent } from './investments.component';

describe('InvestmentsComponent', () => {
  let component: InvestmentsPageComponent;
  let fixture: ComponentFixture<InvestmentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestmentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
