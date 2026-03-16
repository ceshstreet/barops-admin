import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarTypeListComponent } from './bar-type-list.component';

describe('BarTypeListComponent', () => {
  let component: BarTypeListComponent;
  let fixture: ComponentFixture<BarTypeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarTypeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
