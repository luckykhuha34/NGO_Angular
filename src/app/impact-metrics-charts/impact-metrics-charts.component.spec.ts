import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImpactMetricsChartsComponent } from './impact-metrics-charts.component';

describe('ImpactMetricsChartsComponent', () => {
  let component: ImpactMetricsChartsComponent;
  let fixture: ComponentFixture<ImpactMetricsChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImpactMetricsChartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImpactMetricsChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
