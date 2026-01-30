import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedsettingsComponent } from './advancedsettings.component';

describe('AdvancedsettingsComponent', () => {
  let component: AdvancedsettingsComponent;
  let fixture: ComponentFixture<AdvancedsettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedsettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
