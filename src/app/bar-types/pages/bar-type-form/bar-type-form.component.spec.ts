import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarTypeFormComponent } from './bar-type-form.component';

describe('BarTypeFormComponent', () => {
  let component: BarTypeFormComponent;
  let fixture: ComponentFixture<BarTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarTypeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
