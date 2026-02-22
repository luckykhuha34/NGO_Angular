import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TosterComponent } from './toster.component';

describe('TosterComponent', () => {
  let component: TosterComponent;
  let fixture: ComponentFixture<TosterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TosterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
