import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoincomeComponent } from './infoincome.component';

describe('InfoincomeComponent', () => {
  let component: InfoincomeComponent;
  let fixture: ComponentFixture<InfoincomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoincomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoincomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
