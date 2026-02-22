import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierbreakdownComponent } from './tierbreakdown.component';

describe('TierbreakdownComponent', () => {
  let component: TierbreakdownComponent;
  let fixture: ComponentFixture<TierbreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TierbreakdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TierbreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
